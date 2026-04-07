import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// 1. Setup the connection string with pooling parameters
const connectionString = `${process.env.DATABASE_URL}?pgbouncer=true&connect_timeout=30`;

const pool = new pg.Pool({ 
  connectionString,
  max: 10, // Limit the number of concurrent connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, 
});

const adapter = new PrismaPg(pool);

// 2. Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'], // Helps you see what's happening in the terminal
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;