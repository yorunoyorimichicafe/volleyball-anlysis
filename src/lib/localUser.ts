import { getPrisma } from "@/lib/db";

const LOCAL_EMAIL = "local@volley-stats";

export async function getOrCreateLocalUser() {
  const prisma = getPrisma();
  const existing = await prisma.user.findUnique({ where: { email: LOCAL_EMAIL } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      email: LOCAL_EMAIL,
      name: "Local User"
    }
  });
}
