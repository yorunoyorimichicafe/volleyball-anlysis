import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: { eventId: string } }
) {
  const eventId = params.eventId;
  await prisma.event.delete({ where: { id: eventId } });
  return NextResponse.json({ ok: true });
}
