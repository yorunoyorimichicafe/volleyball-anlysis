"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EventOutcome, EventType, Player } from "@prisma/client";

const typeLabels: Record<EventType, string> = {
  SPIKE: "Spike",
  SERVE: "Serve",
  RECEPTION: "Reception"
};

const outcomeLabels: Record<EventOutcome, string> = {
  POINT: "Point",
  IN_PLAY: "InPlay",
  ERROR: "Error",
  BLOCKED: "Blocked",
  ACE: "Ace",
  MISS: "Miss",
  SUCCESS_A: "Reception A",
  SUCCESS_B: "Reception B",
  SUCCESS_C: "Reception C"
};

const outcomeByType: Record<EventType, EventOutcome[]> = {
  SPIKE: ["POINT", "ERROR", "IN_PLAY", "BLOCKED"],
  SERVE: ["ACE", "MISS", "IN_PLAY"],
  RECEPTION: ["SUCCESS_A", "SUCCESS_B", "SUCCESS_C", "ERROR"]
};

const keyMap: Record<string, EventOutcome> = {
  "1": "POINT",
  "2": "ERROR",
  "3": "IN_PLAY",
  "4": "BLOCKED",
  "5": "ACE",
  "6": "MISS",
  "7": "SUCCESS_A",
  "8": "SUCCESS_B",
  "9": "SUCCESS_C"
};

type EventItem = {
  id: string;
  type: EventType;
  outcome: EventOutcome;
  playerId?: string | null;
  player?: { name: string } | null;
  rotation?: number | null;
  zone?: number | null;
  videoTimeSec: number;
};

type Props = {
  videoUrl: string;
  matchId: string;
  teamId: string;
  videoId: string;
  players: Player[];
  initialEvents: EventItem[];
};

export default function VideoTagger({
  videoUrl,
  matchId,
  teamId,
  videoId,
  players,
  initialEvents
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [currentType, setCurrentType] = useState<EventType>("SPIKE");
  const [currentOutcome, setCurrentOutcome] = useState<EventOutcome>("POINT");
  const [playerId, setPlayerId] = useState<string>("");
  const [rotation, setRotation] = useState<string>("");
  const [zone, setZone] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const playerOptions = useMemo(() => players, [players]);

  const createEvent = useCallback(async (overrideOutcome?: EventOutcome) => {
    if (!videoRef.current) return;
    setBusy(true);

    const payload = {
      teamId,
      matchId,
      videoId,
      type: currentType,
      outcome: overrideOutcome ?? currentOutcome,
      playerId: playerId || null,
      rotation: rotation ? Number(rotation) : null,
      zone: zone ? Number(zone) : null,
      videoTimeSec: Math.round(videoRef.current.currentTime)
    };

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      setEvents((prev) => [...prev, data.event]);
    }

    setBusy(false);
  }, [teamId, matchId, videoId, currentType, currentOutcome, playerId, rotation, zone]);

  const deleteEvent = useCallback(async (eventId: string) => {
    await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  }, []);

  const undoLast = useCallback(() => {
    const last = events[events.length - 1];
    if (!last) return;
    deleteEvent(last.id);
  }, [events, deleteEvent]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "s") {
        setCurrentType("SPIKE");
        setCurrentOutcome("POINT");
      }
      if (key === "v") {
        setCurrentType("SERVE");
        setCurrentOutcome("ACE");
      }
      if (key === "r") {
        setCurrentType("RECEPTION");
        setCurrentOutcome("SUCCESS_A");
      }
      if (key === "u") {
        undoLast();
      }
      if (key === " ") {
        event.preventDefault();
        if (videoRef.current?.paused) {
          videoRef.current.play();
        } else {
          videoRef.current?.pause();
        }
      }

      const outcome = keyMap[key];
      if (outcome && outcomeByType[currentType].includes(outcome)) {
        createEvent(outcome);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentType, createEvent, undoLast]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="card">
          <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg" />
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1">S=Spike</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">V=Serve</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">R=Reception</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">1-9=結果</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">U=Undo</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">Space=Play/Pause</span>
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <h3 className="font-semibold">タグ付け</h3>
            <p className="text-xs text-slate-500">現在: {typeLabels[currentType]} / {outcomeLabels[currentOutcome]}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-500">タイプ</p>
            <div className="flex gap-2">
              {Object.keys(typeLabels).map((key) => {
                const type = key as EventType;
                return (
                  <button
                    key={type}
                    type="button"
                    className={`px-3 py-1 rounded-md border ${currentType === type ? "bg-ink text-white" : "bg-white"}`}
                    onClick={() => {
                      setCurrentType(type);
                      setCurrentOutcome(outcomeByType[type][0]);
                    }}
                  >
                    {typeLabels[type]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-500">結果</p>
            <div className="flex flex-wrap gap-2">
              {outcomeByType[currentType].map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  className={`px-3 py-1 rounded-md border ${currentOutcome === outcome ? "bg-accent text-white" : "bg-white"}`}
                  onClick={() => setCurrentOutcome(outcome)}
                >
                  {outcomeLabels[outcome]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <label className="text-xs text-slate-500">選手</label>
            <select value={playerId} onChange={(event) => setPlayerId(event.target.value)}>
              <option value="">未設定</option>
              {playerOptions.map((player) => (
                <option key={player.id} value={player.id}>
                  #{player.number ?? "-"} {player.name}
                </option>
              ))}
            </select>

            <label className="text-xs text-slate-500">ローテ(1-6)</label>
            <input value={rotation} onChange={(event) => setRotation(event.target.value)} placeholder="例: 3" />

            <label className="text-xs text-slate-500">ゾーン(1-18)</label>
            <input value={zone} onChange={(event) => setZone(event.target.value)} placeholder="例: 5" />
          </div>

          <button type="button" onClick={() => createEvent()} disabled={busy}>
            {busy ? "保存中" : "現在時刻で保存"}
          </button>
          <button type="button" onClick={undoLast} className="bg-slate-200 text-slate-700">
            直近イベントをUndo
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold">イベント一覧</h3>
        <div className="mt-3 overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th>時刻</th>
                <th>Type</th>
                <th>Outcome</th>
                <th>Player</th>
                <th>Rotation</th>
                <th>Zone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.videoTimeSec}s</td>
                  <td>{typeLabels[event.type]}</td>
                  <td>{outcomeLabels[event.outcome]}</td>
                  <td>{event.player?.name ?? "-"}</td>
                  <td>{event.rotation ?? "-"}</td>
                  <td>{event.zone ?? "-"}</td>
                  <td>
                    <button
                      type="button"
                      className="bg-rose-500 text-white"
                      onClick={() => deleteEvent(event.id)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500">まだイベントがありません。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
