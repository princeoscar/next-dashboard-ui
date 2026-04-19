import { getActiveConfig } from "@/lib/settings";
import { prisma } from "@/lib/prisma";


// This runs when the admin clicks "Promote"
// Add 'oldClassId' to the arguments
export const promoteStudentAction = async (
  studentId: string, 
  nextClassId: number, 
  oldClassId: number // <--- Add this
) => {
  const currentYear = await getActiveConfig();
  if (!currentYear) throw new Error("No active year");

  return await prisma.$transaction(async (tx) => {
    // 1. Move student to the new class
    await tx.student.update({
      where: { id: studentId },
      data: { classId: nextClassId }
    });

    // 2. Log the history so old report cards stay valid
    await tx.promotion.create({
      data: {
        studentId,
        academicYearId: currentYear.id,
       oldClassId: oldClassId, // you'd pass this in
        newClassId: nextClassId,
        status: "PROMOTED"
      }
    });
  });
};