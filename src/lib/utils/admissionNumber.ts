import { prisma } from "@/lib/prisma";

export async function generateAdmissionNumber(schoolId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  const count = await prisma.admission.count({
    where: { schoolId },
  });

  const sequence = (count + 1).toString().padStart(4, "0");
  return `ADM/${currentYear}/${sequence}`;
}