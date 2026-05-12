import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function makePool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new Pool({
    connectionString,
    // Supabase's pooled connection (port 6543) supports transaction-mode
    // pooling but kills idle connections aggressively. A pg Pool reconnects
    // transparently per query so we avoid P1017 (Server has closed the
    // connection) errors when Supabase reaps an idle socket.
    max: 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    // Recycle physical sockets every 5 minutes to dodge Supabase's hard
    // server-side idle reaper.
    maxLifetimeSeconds: 300,
  });
}

function makeClient(pool: Pool) {
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const pool = globalForPrisma.pgPool ?? makePool();
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? makeClient(pool);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pool;
  globalForPrisma.prisma = prisma;
}
