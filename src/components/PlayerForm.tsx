"use client";

import { useState } from "react";

type Props = { teamId: string };

export default function PlayerForm({ teamId }: Props) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId,
        name,
        number: number ? Number(number) : null,
        position
      })
    });
    setLoading(false);
    setName("");
    setNumber("");
    setPosition("");
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="選手名" />
      <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="背番号" />
      <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="ポジション" />
      <div className="md:col-span-3">
        <button type="submit" disabled={loading}>{loading ? "追加中" : "選手追加"}</button>
      </div>
    </form>
  );
}
