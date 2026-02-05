"use client";

import { useRef, useState } from "react";

type Props = { matchId: string };

export default function VideoUploadForm({ matchId }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

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
    const file = fileRef.current?.files?.[0];
    if (!file || !duration) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("matchId", matchId);
    formData.append("durationSec", duration.toString());

    await fetch("/api/videos/upload", {
      method: "POST",
      body: formData
    });

    setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
    setDuration(null);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input ref={fileRef} type="file" accept="video/mp4" onChange={handleFileChange} />
      {duration && (
        <p className="text-xs text-slate-500">想定尺: {Math.round(duration)} 秒</p>
      )}
      <button type="submit" disabled={loading}>{loading ? "アップロード中" : "動画アップロード"}</button>
    </form>
  );
}
