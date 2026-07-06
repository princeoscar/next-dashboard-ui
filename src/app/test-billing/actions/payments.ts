"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// IMPORT YOUR ENUMS (Adjust the import path if necessary)
import { PaymentStatus } from "@prisma/client"; 

export async function processPayment(
  studentBalanceId: number,
  amountPaid: number,
  paymentMethod: any,
  reference: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get current balance and THE ALLOCATION ID
    const balance = await tx.studentBalance.findUnique({
      where: { id: studentBalanceId },
    });

    if (!balance) throw new Error("Record not found");

    // 2. Create Payment Record (Adding feeAllocationId)
    const payment = await tx.paymentRecord.create({
      data: {
        studentBalanceId,
        feeAllocationId: balance.feeAllocationId, // <--- REQUIRED FIELD
        amountPaid,
        paymentMethod,
        reference,
        status: "SUCCESS", // Or whatever your PaymentRecord status enum expects
      },
    });

    // 3. Update Balance using the Enum instead of strings
    const newRemaining = Number(balance.outstanding) - amountPaid;
    const newStatus = newRemaining <= 0 ? PaymentStatus.FULLY_PAID : PaymentStatus.PARTIAL;

    await tx.studentBalance.update({
      where: { id: studentBalanceId },
      data: {
        outstanding: newRemaining,
        status: newStatus, // <--- NOW USES ENUM
      },
    });

    revalidatePath("/dashboard/parent");
    return payment;
  });
}