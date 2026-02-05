import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const fallbackUrl = "postgresql://postgres:postgres@localhost:5432/postgres";

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ["error", "warn"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL ?? fallbackUrl
        }
      }
    });
  }
  return globalForPrisma.prisma;
}
