import { PrismaClient } from "@prisma/client";



const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");

  await prisma.notificationLog.deleteMany();

  console.log("Database ready.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    // @ts-ignore
    process.exit(1);
  });