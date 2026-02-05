import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const playerSchema = z.object({
  teamId: z.string().min(1),
  name: z.string().min(1),
  number: z.number().int().optional().nullable(),
  position: z.string().optional().nullable()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = playerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const player = await prisma.player.create({
    data: {
      teamId: parsed.data.teamId,
      name: parsed.data.name,
      number: parsed.data.number ?? null,
      position: parsed.data.position ?? null
    }
  });

  return NextResponse.json({ player });
}
