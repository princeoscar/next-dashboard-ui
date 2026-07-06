import { prisma } from "@/lib/prisma"; // Adjust this path based on where your global prisma instance is exported

/**
 * Generates a unique, sequential application number for a specific school.
 * Example format: APP-2026-0001
 */
export async function generateApplicationNumber(schoolId: string): Promise<string> {
  const currentYear = new Date().getFullYear();

  // 1. Count how many admissions applications already exist for this school in the current year
  const applicationCount = await prisma.admission.count({
    where: {
      schoolId: schoolId,
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lte: new Date(`${currentYear}-12-31`),
      },
    },
  });

  // 2. Increment the count by 1 for the new applicant
  const nextSequence = applicationCount + 1;

  // 3. Format the number with padding (e.g., sequence 5 becomes "0005")
  const paddedSequence = String(nextSequence).padStart(4, "0");

  return `APP-${currentYear}-${paddedSequence}`;
}