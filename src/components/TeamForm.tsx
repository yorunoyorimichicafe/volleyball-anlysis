"use client";

import { useState } from "react";

export default function TeamForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    setLoading(false);
    setName("");
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="チーム名"
        className="flex-1 min-w-[200px]"
      />
      <button type="submit" disabled={loading}>{loading ? "作成中" : "チーム作成"}</button>
    </form>
  );
}
