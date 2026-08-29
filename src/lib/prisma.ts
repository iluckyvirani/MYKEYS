import { Resolver } from "dns/promises";
import { createConnection } from "net";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, PoolConfig } from "pg";

const publicDns = new Resolver();
publicDns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("channel_binding");
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

function probeTcp(host: string, port: number, timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port, timeout: timeoutMs });
    const finish = (ok: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}

/** Pick a DB host that responds on TCP (Neon IPs can be intermittently unreachable). */
async function pickReachableHost(hostname: string, port: number): Promise<string> {
  const candidates: string[] = [];

  try {
    candidates.push(...(await publicDns.resolve4(hostname)));
  } catch {
    try {
      const { lookup } = await import("dns/promises");
      const resolved = await lookup(hostname, { family: 4 });
      if (resolved.address) candidates.push(resolved.address);
    } catch {
      // fall through
    }
  }

  if (!candidates.includes(hostname)) {
    candidates.push(hostname);
  }

  for (const host of candidates) {
    if (await probeTcp(host, port)) {
      if (host !== hostname) {
        console.warn(`[prisma] Connected via resolved host ${host} (${hostname})`);
      }
      return host;
    }
  }

  console.warn(`[prisma] TCP probe failed for all candidates; using ${hostname}`);
  return hostname;
}

export function isDatabaseConnectionError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  const msg = err?.message ?? String(error);
  return (
    err?.code === "P1001" ||
    err?.code === "EHOSTUNREACH" ||
    err?.code === "ENOTFOUND" ||
    err?.code === "ECONNREFUSED" ||
    err?.code === "ETIMEDOUT" ||
    msg.includes("Can't reach database") ||
    msg.includes("EHOSTUNREACH") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("ECONNREFUSED")
  );
}

async function createPgPool(connectionString: string | undefined): Promise<Pool> {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = new URL(connectionString);
  const hostname = url.hostname;
  const port = Number(url.port || 5432);
  const useSsl =
    url.searchParams.get("sslmode") === "require" ||
    url.hostname.includes("neon.tech");

  const host = await pickReachableHost(hostname, port);

  const config: PoolConfig = {
    host,
    port,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
    keepAlive: true,
    allowExitOnIdle: true,
    ...(useSsl
      ? {
          ssl: {
            rejectUnauthorized: true,
            servername: hostname,
          },
        }
      : {}),
  };

  return new Pool(config);
}

const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  prismaVersion: string | undefined;
};

const PRISMA_CLIENT_VERSION = "20260829-neon-tcp-probe-v4";

function createPrismaClient(pool: Pool) {
  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

async function initPrisma(): Promise<PrismaClient> {
  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    globalForPrisma.prismaVersion !== PRISMA_CLIENT_VERSION
  ) {
    await globalForPrisma.prisma.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaVersion === PRISMA_CLIENT_VERSION
  ) {
    return globalForPrisma.prisma;
  }

  const pool = await createPgPool(connectionString);
  const client = createPrismaClient(pool);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
  }

  return client;
}

const prismaPromise = initPrisma();

/** Awaited Prisma client (Neon pool resolves on first import). */
export const prisma: PrismaClient = await prismaPromise;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
}
