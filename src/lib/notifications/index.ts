import { NotificationChannel } from "@prisma/client";

import { sendSMS } from "./sms";
import { sendEmail } from "./email";
import { sendWhatsApp } from "./whatsapp";

import { NotificationPayload } from "./types";

export async function sendNotification(
  payload: NotificationPayload,
) {
  switch (payload.channel) {
    case NotificationChannel.SMS:
      return sendSMS(payload);

    case NotificationChannel.EMAIL:
      return sendEmail(payload);

    case NotificationChannel.WHATSAPP:
      return sendWhatsApp(payload);

    default:
      throw new Error("Unsupported notification channel.");
  }
}