// src/lib/actions/payments.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function startOnlinePaymentInvoice(studentBalanceId: number, parentEmail: string) {
  // Enforce a strict server runtime context guard check
  if (typeof window !== "undefined") {
    throw new Error("Security Violation: Server Action executed in browser environment context.");
  }

  try {
    // 1. Fetch current live outstanding statement validation record from database
    const ledger = await prisma.studentBalance.findUnique({
      where: { id: studentBalanceId },
      include: { allocation: { include: { category: true } } },
    });

    if (!ledger || Number(ledger.outstanding) <= 0) {
      return { success: false, error: "This ledger account statement has no outstanding debt due." };
    }

    const uniqueTxRef = `INV-${studentBalanceId}-${Date.now()}`;
    const conversionKoboAmount = Math.round(Number(ledger.outstanding) * 100); 

    // 2. Initialize the Paystack payment session via direct secure API fetch request
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: parentEmail,
        amount: conversionKoboAmount,
        reference: uniqueTxRef,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/parent/billing/verify`,
        metadata: {
          studentBalanceId: studentBalanceId,
        },
      }),
    });

    const initializationResult = await paystackResponse.json();

    if (!initializationResult.status) {
      return { success: false, error: initializationResult.message || "Paystack engine initialization failure." };
    }

    // 3. Log an unverified tracking row statement entry into the database
    await prisma.paymentRecord.create({
      data: {
        studentBalanceId: ledger.id,
        feeAllocationId: ledger.feeAllocationId,
        amountPaid: ledger.outstanding,
        paymentMethod: "PAYSTACK",
        reference: uniqueTxRef,
        status: "PENDING",
      },
    });

    return {
      success: true,
      authorizationUrl: initializationResult.data.authorization_url,
      reference: uniqueTxRef,
    };
  } catch (error: any) {
    console.error("Payment action failure:", error);
    return { success: false, error: error.message || "Failed to initialize secure transaction session." };
  }
}