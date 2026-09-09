import { prisma } from "@/lib/prisma";

export async function generateApplicationNumber(schoolId: string) {
  const year = new Date().getFullYear();

  const count = await prisma.admission.count({
    where: { schoolId },
  });

  return `ADM-${year}-${String(count + 1).padStart(5, "0")}`;
}