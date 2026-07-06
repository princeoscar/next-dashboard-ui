import { prisma } from "@/lib/prisma"; // Adjust this path to your Prisma client instance
import { AdmissionStatus } from "@prisma/client";

export async function getAdmissionApplications(schoolId: string, status?: AdmissionStatus) {
  try {
    const applications = await prisma.admission.findMany({
      where: {
        schoolId,
        ...(status ? { status } : {}),
      },
      include: {
        applyingLevel: true,
        applyingClass: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return applications;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw new Error("Failed to load admission applications.");
  }
}

export async function getAdmissionDetail(id: string) {
  try {
    return await prisma.admission.findUnique({
      where: { id },
      include: {
        applyingLevel: true,
        applyingClass: true,
      },
    });
  } catch (error) {
    console.error("Error fetching application detail:", error);
    throw new Error("Failed to load application details.");
  }
}