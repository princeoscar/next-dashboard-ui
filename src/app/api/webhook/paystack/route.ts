// src/app/api/webhook/paystack/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // 1. Validate the webhook signature to verify it originates from Paystack
    const paystackSignature = req.headers.get("x-paystack-signature");
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("System configuration fault: PAYSTACK_SECRET_KEY is missing.");
      return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
    }

    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (hash !== paystackSignature) {
      return NextResponse.json({ error: "Invalid webhook signature validation" }, { status: 401 });
    }

    // 2. Safely parse the verified request content
    const event = JSON.parse(rawBody);

    // We only execute financial transactions when a transaction is successful
    if (event.event === "charge.success") {
      const { reference, amount, channel } = event.data;
      const { studentBalanceId } = event.data.metadata;

      // Convert the incoming kobo value back to your base fiat value
      const parsedAmountPaid = Number(amount) / 100;

      // 3. Execute a secure database transaction to prevent partial state updates
      await prisma.$transaction(async (tx) => {
        // Find the active student balance record
        const activeLedger = await tx.studentBalance.findUnique({
          where: { id: Number(studentBalanceId) },
        });

        if (!activeLedger) {
          throw new Error(`Target invoice statement balance account context record matching #${studentBalanceId} not found.`);
        }

        // Calculate new balance figures
        const computedNewPaidAmount = Number(activeLedger.paidAmount) + parsedAmountPaid;
        const computedNewOutstanding = Number(activeLedger.totalAssigned) - computedNewPaidAmount;

        // Determine the updated payment status
        let assignedStatusState: "FULLY_PAID" | "PARTIAL" | "UNPAID" = "PARTIAL";
        if (computedNewOutstanding <= 0) {
          assignedStatusState = "FULLY_PAID";
        } else if (computedNewPaidAmount === 0) {
          assignedStatusState = "UNPAID";
        }

        // Update the main balance row
        await tx.studentBalance.update({
          where: { id: activeLedger.id },
          data: {
            paidAmount: computedNewPaidAmount,
            outstanding: Math.max(0, computedNewOutstanding), // Prevent floating point numbers under zero
            status: assignedStatusState,
          },
        });

        // Upsert or update the matching tracking record statement entry to SUCCESS
        await tx.paymentRecord.upsert({
          where: { reference: reference },
          update: {
            status: "SUCCESS",
            amountPaid: parsedAmountPaid,
            channel: channel || "card",
          },
          create: {
            studentBalanceId: activeLedger.id,
            feeAllocationId: activeLedger.feeAllocationId,
            amountPaid: parsedAmountPaid,
            paymentMethod: "PAYSTACK",
            reference: reference,
            status: "SUCCESS",
            channel: channel || "card",
          },
        });
      });

      console.log(`[Paystack Webhook Sync Engine Success] Reference: ${reference} processed for invoice profile: ${studentBalanceId}`);
    }

    // Always respond with a 200 OK status to let Paystack know the event was successfully handled
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Paystack processing webhook error event runtime failure:", error);
    return NextResponse.json({ error: "Internal processing workflow failure engine fault" }, { status: 500 });
  }
}