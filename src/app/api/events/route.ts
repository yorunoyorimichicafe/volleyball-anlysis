import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { eventSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  const events = await prisma.event.findMany({
    where: { videoId },
    include: { player: true },
    orderBy: { videoTimeSec: "asc" }
  });
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      teamId: parsed.data.teamId,
      matchId: parsed.data.matchId,
      videoId: parsed.data.videoId,
      type: parsed.data.type,
      outcome: parsed.data.outcome,
      playerId: parsed.data.playerId ?? null,
      rotation: parsed.data.rotation ?? null,
      zone: parsed.data.zone ?? null,
      videoTimeSec: parsed.data.videoTimeSec,
      confidence: parsed.data.confidence ?? null,
      metadata: parsed.data.metadata ?? undefined
    },
    include: { player: true }
  });

  return NextResponse.json({ event });
}
