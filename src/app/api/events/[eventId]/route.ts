import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: { eventId: string } }
) {
  const prisma = getPrisma();
  const eventId = params.eventId;
  await prisma.event.delete({ where: { id: eventId } });
  return NextResponse.json({ ok: true });
}
