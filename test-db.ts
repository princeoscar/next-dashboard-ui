import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log("SUCCESS: Connection established!");
  } catch (e) {
    console.error("FAILURE: Cannot connect.", e);
  }
}
test();