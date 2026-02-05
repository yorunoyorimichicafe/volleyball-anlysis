"use client";

import { useState } from "react";

type Props = { teamId: string };

export default function MatchForm({ teamId }: Props) {
  const [title, setTitle] = useState("");
  const [opponent, setOpponent] = useState("");
  const [playedAt, setPlayedAt] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !playedAt) return;
    setLoading(true);
    await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, title, opponent, playedAt, memo })
    });
    setLoading(false);
    setTitle("");
    setOpponent("");
    setPlayedAt("");
    setMemo("");
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="試合名" />
      <input value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="対戦相手" />
      <input type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} />
      <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="メモ" />
      <div className="md:col-span-4">
        <button type="submit" disabled={loading}>{loading ? "作成中" : "試合作成"}</button>
      </div>
    </form>
  );
}
