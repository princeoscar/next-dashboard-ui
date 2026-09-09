"use server";

import { prisma } from "@/lib/prisma";



export async function getReceipt(paymentId: number) {
  return prisma.paymentRecord.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      school: true,
      allocation: {
        include: {
          category: true,
          academicYear: true,
          level: true,
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
  });
}