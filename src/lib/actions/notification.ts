"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import {
  NotificationChannel,
  NotificationStatus,
} from "@prisma/client";
import {
  buildFeeReminderMessage,
  getStudentsWithOutstandingFees,
  logFeeReminder,
  markReminderAsSent,
} from "@/lib/notifications/feeReminder";
import { sendNotification } from "@/lib/notifications/index";


export const sendFeeReminders = async () => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const balances = await getStudentsWithOutstandingFees(
  schoolId,
);

if (balances.length === 0) {
  return {
    success: true,
    error: false,
    message: "No outstanding fee reminders found.",
  };
}

let sent = 0;

let failed = 0;

for (const balance of balances) {
    const parent = balance.student.parent;

  if (!parent?.phone) {
    failed++;
    continue;
  }
  const message = buildFeeReminderMessage({
    schoolName: balance.student.school.name,

    parentName:
      balance.student.parent?.firstName ?? "Parent",

    studentName: balance.student.name,

    className: balance.student.class?.name ?? "No Class",

    feeCategory:
      balance.allocation.category.name,

    amount: Number(balance.outstanding),

    dueDate: balance.allocation.dueDate,
  });

  try {
   const parent = balance.student.parent;

  if (!parent?.phone) {
    failed++;
    continue;
  }

   await logFeeReminder({
  recipient:
    balance.student.parent?.phone ?? "",
  message,
  studentId:
    balance.student.id,
  schoolId,
  channel:
    NotificationChannel.SMS,
  status:
    NotificationStatus.SENT,
});

await markReminderAsSent(balance.id);

sent++;
} catch (error) {
  failed++;

  await logFeeReminder({
      recipient: parent.phone,
      message,
      studentId: balance.student.id,
      schoolId,
      channel: NotificationChannel.SMS,
      status: NotificationStatus.FAILED,
    });
  console.error(error);
}
}
revalidateTag("dashboard-stats", "max");

return {
  success: true,
  error: false,
  message: `${sent} reminder(s) sent successfully. ${failed} failed.`,
}
};



