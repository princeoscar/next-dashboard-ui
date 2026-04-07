import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// ✅ Correct connection string
const connectionString = `${process.env.DATABASE_URL}&pgbouncer=true&connect_timeout=30`;

const pool = new pg.Pool({ 
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, 
});

const adapter = new PrismaPg(pool);

// ✅ Prevent multiple instances (VERY IMPORTANT in Next.js)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"], // keep logs clean (remove "query" unless debugging)
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;