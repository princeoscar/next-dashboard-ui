import { prisma } from "@/lib/prisma";
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from "@prisma/client";


export interface FeeReminderData {
  schoolName: string;

  parentName: string;

  studentName: string;

  className: string;

  feeCategory: string;

  amount: number;

  dueDate?: Date | null;
}

export function buildFeeReminderMessage(
  data: FeeReminderData,
) {
  const dueDate = data.dueDate
    ? data.dueDate.toLocaleDateString()
    : "Not specified";

  return `
Dear ${data.parentName},

This is a friendly reminder that your child,

${data.studentName}

(Class: ${data.className})

has an outstanding payment for

${data.feeCategory}.

Outstanding Amount:
₦${data.amount.toLocaleString()}

Due Date:
${dueDate}

Kindly make payment on or before the due date.

Thank you for your continued support.

${data.schoolName}
`.trim();
}

export async function getStudentsWithOutstandingFees(
  schoolId: string,
) {
  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 7,
  );

  return prisma.studentBalance.findMany({
    where: {
      outstanding: {
        gt: 0,
      },

      student: {
        schoolId,
      },

      OR: [
        {
          lastReminderSent: null,
        },
        {
          lastReminderSent: {
            lt: sevenDaysAgo,
          },
        },
      ],
    },

    include: {
      student: {
        include: {
          parent: true,
          class: true,
          school: true,
        },
      },

      allocation: {
        include: {
          category: true,
          academicYear: true,
        },
      },
    },

    orderBy: {
      outstanding: "desc",
    },
  });
}

export async function markReminderAsSent(
  studentBalanceId: number,
) {
  return prisma.studentBalance.update({
    where: {
      id: studentBalanceId,
    },

    data: {
      lastReminderSent: new Date(),
    },
  });
}

export async function logFeeReminder({
  recipient,
  message,
  studentId,
  schoolId,
  channel,
  status,
}: {
  recipient: string;
  message: string;
  studentId: string;
  schoolId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
}) {
  return prisma.notificationLog.create({
    data: {
      type: NotificationType.PAYMENT,

      recipient,

      subject: "School Fee Reminder",

      message,

      status,

      channel,

      studentId,

      schoolId,
    },
  });
}