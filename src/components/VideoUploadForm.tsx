"use client";

import { useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Props = { matchId: string };

export default function VideoUploadForm({ matchId }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<"upload" | "youtube">("upload");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeDuration, setYoutubeDuration] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setDuration(null);
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      setDuration(video.duration || null);
      URL.revokeObjectURL(url);
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    setLoading(true);
    try {
      if (mode === "upload") {
        const file = fileRef.current?.files?.[0];
        if (!file || !duration) {
          setError("動画ファイルと尺を選択してください。");
          setLoading(false);
          return;
        }

        const supabase = getSupabaseBrowserClient();
        const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
        if (!supabase || !bucket) {
          setError("Supabase設定が不足しています。");
          setLoading(false);
          return;
        }

        const path = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "video/mp4"
        });

        if (uploadError) {
          setError(uploadError.message);
          setLoading(false);
          return;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        const storageUrl = data.publicUrl;

        const res = await fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId,
            storageUrl,
            durationSec: Math.round(duration)
          })
        });

        if (!res.ok) {
          setError("動画登録に失敗しました。");
          setLoading(false);
          return;
        }
      } else {
        if (!youtubeUrl.trim()) {
          setError("YouTube URLを入力してください。");
          setLoading(false);
          return;
        }
        const durationSec = youtubeDuration ? Number(youtubeDuration) : 0;
        const res = await fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId,
            storageUrl: youtubeUrl.trim(),
            durationSec: Number.isFinite(durationSec) ? Math.round(durationSec) : 0
          })
        });
        if (!res.ok) {
          setError("YouTube動画の登録に失敗しました。");
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      setError("アップロードに失敗しました。");
      setLoading(false);
      return;
    }

    setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
    setDuration(null);
    setYoutubeUrl("");
    setYoutubeDuration("");
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          className={`px-3 py-1 rounded-md border ${mode === "upload" ? "bg-ink text-white" : "bg-white"}`}
          onClick={() => setMode("upload")}
        >
          ファイル
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded-md border ${mode === "youtube" ? "bg-ink text-white" : "bg-white"}`}
          onClick={() => setMode("youtube")}
        >
          YouTube URL
        </button>
      </div>

      {mode === "upload" ? (
        <>
          <input ref={fileRef} type="file" accept="video/mp4" onChange={handleFileChange} />
          {duration && (
            <p className="text-xs text-slate-500">想定尺: {Math.round(duration)} 秒</p>
          )}
        </>
      ) : (
        <>
          <input
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <input
            value={youtubeDuration}
            onChange={(event) => setYoutubeDuration(event.target.value)}
            placeholder="動画尺（秒, 任意）"
          />
        </>
      )}
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <button type="submit" disabled={loading}>{loading ? "アップロード中" : "動画アップロード"}</button>
    </form>
  );
}
