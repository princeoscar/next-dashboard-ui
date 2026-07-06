// src/lib/actions/reminders.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function sendPaymentReminder(studentBalanceId: number) {
  try {
    // 1. Fetch invoice data along with parent contact references
    const invoice = await prisma.studentBalance.findUnique({
      where: { id: studentBalanceId },
      include: {
        allocation: { include: { category: true } },
      },
    });

    if (!invoice || Number(invoice.outstanding) <= 0) {
      return { success: false, error: "Statement has no debt due." };
    }

    // 2. Throttle checks: Ensure reminders can only be sent once every 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (invoice.lastReminderSent && invoice.lastReminderSent > sevenDaysAgo) {
      return { 
        success: false, 
        error: `A reminder was sent recently (${invoice.lastReminderSent.toLocaleDateString()}). Please wait before re-broadcasting.` 
      };
    }

    // 3. Draft the dynamic notification template text
    const balanceOwed = Number(invoice.outstanding).toLocaleString();
    const feeName = invoice.allocation.category.name;
    const trackingRef = invoice.studentId;

    const clearTextMessageString = `Dear Parent, this is a friendly reminder that an outstanding balance of ₦${balanceOwed} remains for student (${trackingRef}) regarding "${feeName}". Kindly log into your billing portal to settle online securely via Paystack. Thank you.`;

    // 4. Update the reminder throttle timestamp in the database
    await prisma.studentBalance.update({
      where: { id: studentBalanceId },
      data: { lastReminderSent: new Date() },
    });

    // NOTE: Integrate your preferred local gateway hook here (e.g., Twilio, Termii, or Resend)
    console.log(`[Notification Engine Broadcast Sent] -> Student: ${trackingRef} | Message: ${clearTextMessageString}`);

    return { success: true, message: "Reminder notice issued successfully." };
  } catch (error) {
    console.error("Reminder loop failure:", error);
    return { success: false, error: "Failed to dispatch account reminder." };
  }
}