import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { summarizeEvents } from "@/lib/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const prisma = getPrisma();
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  if (!teamId) {
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  }

  const events = await prisma.event.findMany({
    where: { teamId },
    include: { player: true, match: true },
    orderBy: { createdAt: "asc" }
  });

  const byPlayer = new Map<string, typeof events>();
  const byMatch = new Map<string, typeof events>();

  for (const event of events) {
    if (event.playerId) {
      const list = byPlayer.get(event.playerId) ?? [];
      list.push(event);
      byPlayer.set(event.playerId, list);
    }
    const list = byMatch.get(event.matchId) ?? [];
    list.push(event);
    byMatch.set(event.matchId, list);
  }

  const playerSummaries = Array.from(byPlayer.entries()).map(([playerId, list]) => ({
    playerId,
    playerName: list[0]?.player?.name ?? "Unknown",
    summary: summarizeEvents(list)
  }));

  const matchSummaries = Array.from(byMatch.entries()).map(([matchId, list]) => ({
    matchId,
    matchTitle: list[0]?.match?.title ?? "Match",
    playedAt: list[0]?.match?.playedAt ?? null,
    summary: summarizeEvents(list)
  }));

  return NextResponse.json({
    summary: summarizeEvents(events),
    playerSummaries,
    matchSummaries
  });
}
