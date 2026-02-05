import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { videoSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = videoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: {
      matchId: parsed.data.matchId,
      storageUrl: parsed.data.storageUrl,
      durationSec: parsed.data.durationSec
    }
  });

  return NextResponse.json({ video });
}
