import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prismaUnavailable = new Proxy(
  {},
  {
    get() {
      throw new Error("Prisma client unavailable: POSTGRES_URL is not set.");
    },
  }
) as PrismaClient;

export const prisma = process.env.POSTGRES_URL
  ? globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  : prismaUnavailable;

if (process.env.NODE_ENV !== "production" && process.env.POSTGRES_URL) {
  globalForPrisma.prisma = prisma;
}
