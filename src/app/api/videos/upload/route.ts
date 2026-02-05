import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const matchId = formData.get("matchId");
  const durationSec = formData.get("durationSec");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!matchId || typeof matchId !== "string") {
    return NextResponse.json({ error: "matchId is required" }, { status: 400 });
  }
  const duration = Number(durationSec);
  if (!Number.isFinite(duration) || duration <= 0) {
    return NextResponse.json({ error: "durationSec is required" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const filePath = path.join(uploadsDir, safeName);
  await writeFile(filePath, buffer);

  const storageUrl = `/uploads/${safeName}`;
  const video = await prisma.video.create({
    data: {
      matchId,
      storageUrl,
      durationSec: Math.round(duration)
    }
  });

  return NextResponse.json({ video });
}
