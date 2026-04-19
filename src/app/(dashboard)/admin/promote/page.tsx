import { getActiveConfig } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

/** * 1. LOGIC SECTION 
 * This is a helper function. We remove 'export' because Next.js 
 * doesn't want custom exports in a page.tsx file.
 */
const promoteStudentAction = async (
  studentId: string, 
  nextClassId: number, 
  oldClassId: number
) => {
  const currentYear = await getActiveConfig();
  if (!currentYear) throw new Error("No active year");

  return await prisma.$transaction(async (tx) => {
    // 1. Move student to the new class
    await tx.student.update({
      where: { id: studentId },
      data: { classId: nextClassId }
    });

    // 2. Log the history
    await tx.promotion.create({
      data: {
        studentId,
        academicYearId: currentYear.id,
        oldClassId: oldClassId,
        newClassId: nextClassId,
        status: "PROMOTED"
      }
    });
  });
};

/** * 2. UI SECTION
 * This MUST be the default export.
 */
export default function PromotePage() {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        Student Promotion
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mt-2">
        Manage student academic transitions and class upgrades.
      </p>
      
      {/* You will likely have a Form or a List here that 
         eventually calls promoteStudentAction 
      */}
      <div className="mt-8 p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center">
        <span className="text-slate-400">Promotion Form Logic Goes Here</span>
      </div>
    </div>
  );
}