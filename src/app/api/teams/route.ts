import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/localUser";
import { teamSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getOrCreateLocalUser();
  const teams = await prisma.team.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ teams });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await getOrCreateLocalUser();
  const team = await prisma.team.create({
    data: {
      name: parsed.data.name,
      ownerId: user.id
    }
  });

  return NextResponse.json({ team });
}
