"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";


export const getRecentPayments = async () => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    throw new Error("School not found.");
  }

  return prisma.paymentRecord.findMany({
    where: {
      schoolId,
    },

    include: {
      allocation: {
        include: {
          category: true,
        },
      },

      balance: {
        include: {
          student: {
            include: {
              class: true,
              parent: true,
            },
          },
        },
      },
    },

    orderBy: {
      paymentDate: "desc",
    },

    take: 10,
  });
};

export const createIncome = async (data: any) => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  try {
    await prisma.income.create({
      data: {
        title: data.title,
        description: data.description,
        amount: data.amount,
        category: data.category,
        paymentMethod: data.paymentMethod,
        receivedAt: data.receivedAt,
        schoolId,
      },
    });

    revalidatePath("/admin/finance");

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: true,
      message: "Failed to create income.",
    };
  }
};

export const updateIncome = async (data: any) => {
  try {
    await prisma.income.update({
      where: {
        id: data.id,
      },

      data: {
        title: data.title,
        description: data.description,
        amount: data.amount,
        category: data.category,
        paymentMethod: data.paymentMethod,
        receivedAt: data.receivedAt,
      },
    });

    revalidatePath("/admin/finance");

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: true,
      message: "Failed to update income.",
    };
  }
};

export const deleteIncome = async (prevState: any, formData: FormData) => {
  try {
    const id = Number(formData.get("id"));

    await prisma.income.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/finance");

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: true,
      message: "Failed to delete income.",
    };
  }
};




export const calculateStudentBalance = async (student: any) => {
  const activeYear = await prisma.academicYear.findFirst({
    where: {
      isCurrent: true,
      schoolId: student.schoolId,
    },
  });

  if (!activeYear) return 0;

  const totalFees = await prisma.feeAllocation.aggregate({
    where: {
      levelId: student.levelId,
      academicYearId: activeYear.id,
      schoolId: student.schoolId,
      isActive: true,
    },
    _sum: {
      amount: true,
    },
  });

  const totalPaid = await prisma.paymentRecord.aggregate({
    where: {
      balance: {
        studentId: student.id,
      },
      schoolId: student.schoolId,
      feeAllocationId: {
        in: (
          await prisma.feeAllocation.findMany({
            where: { academicYearId: activeYear.id, schoolId: student.schoolId },
            select: { id: true }
          })
        ).map(f => f.id)
      },
    },
    _sum: {
      amountPaid: true,
    },
  });

  const assigned = Number(totalFees._sum?.amount ?? 0);
  const paid = Number(totalPaid._sum?.amountPaid ?? 0);

  return assigned - paid;
};