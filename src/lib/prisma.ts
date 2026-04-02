import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// This prevents multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 1. Create the connection pool
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });

// 2. Create the adapter
const adapter = new PrismaPg(pool);

// 3. Initialize the client with the adapter
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;