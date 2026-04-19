import { prisma } from "@/lib/prisma";

export const calculateStudentBalance = async (student: any) => {
  // 1. Fetch the active year INSIDE the function
  const activeYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true }
  });

  // 2. Handle the missing year (Return 0 or null instead of JSX if this is a utility)
  if (!activeYear) return 0;

  // 3. Fetch the fees
  const fees = await prisma.feeStructure.findFirst({
    where: {
      gradeId: student.gradeId,
      academicYearId: activeYear.id,
    }
  });

  // 4. Fetch the payments
  const totalPaid = await prisma.payment.aggregate({
    where: { 
      studentId: student.id, 
      academicYearId: activeYear.id 
    },
    _sum: { amountPaid: true }
  });

  const balance = Number(fees?.amount || 0) - Number(totalPaid._sum.amountPaid || 0);
  return balance;
};