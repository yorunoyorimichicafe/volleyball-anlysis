import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { matchSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = matchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const match = await prisma.match.create({
    data: {
      teamId: parsed.data.teamId,
      title: parsed.data.title,
      opponent: parsed.data.opponent ?? null,
      playedAt: new Date(parsed.data.playedAt),
      memo: parsed.data.memo ?? null
    }
  });

  return NextResponse.json({ match });
}
