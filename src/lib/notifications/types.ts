import { NotificationChannel } from "@prisma/client";

export interface NotificationPayload {
  recipient: string;
  subject?: string;
  message: string;
  channel: NotificationChannel;
}