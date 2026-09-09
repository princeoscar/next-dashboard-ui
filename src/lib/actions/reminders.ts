"use server";

import { prisma } from "@/lib/prisma";

import {
  NotificationChannel,
  NotificationStatus,
} from "@prisma/client";

import {
  buildFeeReminderMessage,
  logFeeReminder,
} from "@/lib/notifications/feeReminder";

import { sendNotification } from "@/lib/notifications/index";

export async function sendPaymentReminder(
  studentBalanceId: number
) {
  try {
    const invoice = await prisma.studentBalance.findUnique({
      where: {
        id: studentBalanceId,
      },

      include: {
        allocation: {
          include: {
            category: true,
          },
        },

        student: {
          include: {
            school: true,
            class: true,
            parent: true,
          },
        },
      },
    });

    if (!invoice) {
      return {
        success: false,
        error: "Student balance not found.",
      };
    }

    if (Number(invoice.outstanding) <= 0) {
      return {
        success: false,
        error: "This student has no outstanding balance.",
      };
    }

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 7
    );

    if (
      invoice.lastReminderSent &&
      invoice.lastReminderSent > sevenDaysAgo
    ) {
      return {
        success: false,
        error: `A reminder was already sent on ${invoice.lastReminderSent.toLocaleDateString()}.`,
      };
    }

    if (!invoice.student.parent?.phone) {
      return {
        success: false,
        error: "Parent does not have a phone number.",
      };
    }

    const message = buildFeeReminderMessage({
      schoolName: invoice.student.school.name,

      parentName:
        invoice.student.parent.firstName,

      studentName:
        invoice.student.name,

      className:
        invoice.student.class?.name ??
        "No Class",

      feeCategory:
        invoice.allocation.category.name,

      amount:
        Number(invoice.outstanding),

      dueDate:
        invoice.allocation.dueDate,
    });

    await sendNotification({
      recipient:
        invoice.student.parent.phone,

      message,

      channel:
        NotificationChannel.SMS,
    });

    await logFeeReminder({
      recipient:
        invoice.student.parent.phone,

      message,

      studentId:
        invoice.student.id,

      schoolId:
        invoice.schoolId,

      channel:
        NotificationChannel.SMS,

      status:
        NotificationStatus.SENT,
    });

    await prisma.studentBalance.update({
      where: {
        id: studentBalanceId,
      },

      data: {
        lastReminderSent: new Date(),
      },
    });

    return {
      success: true,
      message:
        "Fee reminder sent successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error:
        "Failed to send fee reminder.",
    };
  }
}