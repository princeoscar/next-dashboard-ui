import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Generates a unique, sequential admission registration number
 * Format: SCH-[YEAR]-[4-DIGIT-PADDING] (e.g., SCH-2026-0001)
 * This runs purely on the server inside your Server Actions.
 */
export async function generateAdmissionNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `SCH-${currentYear}-`;

  // Find the highest existing admission number for the current year
  const lastAdmission = await prisma.admission.findFirst({
    where: {
      applicationNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      applicationNumber: "desc",
    },
    select: {
      applicationNumber: true,
    },
  });

  let nextSequence = 1;

  if (lastAdmission?.applicationNumber) {
    // Extract the sequence number out of the existing string splitting by '-'
    const parts = lastAdmission.applicationNumber.split("-");
    const lastSequence = parseInt(parts[2], 10);
    if (!isNaN(lastSequence)) {
      nextSequence = lastSequence + 1;
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, "0");
  return `${prefix}${paddedSequence}`;
}