import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * pg warns that sslmode=require currently aliases verify-full and will change.
 * Prefer explicit libpq-compat + require (Neon-friendly) to silence the warning.
 */
function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    const mode = parsed.searchParams.get("sslmode");
    if (mode === "prefer" || mode === "require" || mode === "verify-ca") {
      if (!parsed.searchParams.has("uselibpqcompat")) {
        parsed.searchParams.set("uselibpqcompat", "true");
      }
      parsed.searchParams.set("sslmode", "require");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // wait up to 30s for Neon to wake up
  allowExitOnIdle: true,
});
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  prismaVersion: string | undefined;
};

/** Bump when Prisma schema changes so dev server picks up regenerated client */
const PRISMA_CLIENT_VERSION = "20260816-services-marketplace-v1";

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// In dev, discard cached client after `prisma generate` (avoids stale column maps in Turbopack)
if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  globalForPrisma.prismaVersion !== PRISMA_CLIENT_VERSION
) {
  void globalForPrisma.prisma.$disconnect().catch(() => undefined);
  globalForPrisma.prisma = undefined;
}

const cached =
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prismaVersion === PRISMA_CLIENT_VERSION
    ? globalForPrisma.prisma
    : undefined;

export const prisma = cached ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
}
