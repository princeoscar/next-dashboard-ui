"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const updateActiveSession = async (yearId: number) => {
  try {
    await prisma.$transaction([
      // Set everyone to false
      prisma.academicYear.updateMany({
        data: { isCurrent: false },
      }),
      // Set the chosen one to true
      prisma.academicYear.update({
        where: { id: yearId },
        data: { isCurrent: true },
      }),
    ]);
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update session" };
  }
};

export const createAcademicYear = async (name: string) => {
  try {
    await prisma.academicYear.create({
      data: { name, isCurrent: false },
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Year already exists" };
  }
};