import { z } from "zod";
import {
  NotificationType,
  NotificationStatus,
  NotificationChannel,
} from "@prisma/client";

/* ===========================================================
   ANNOUNCEMENT
=========================================================== */

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  
  levelId: z.preprocess(
    (val) => (val === "" || val === 0 || val === "0" || val === null || val === undefined || Number.isNaN(val) ? null : Number(val)),
    z.number().nullable().optional()
  ),

  classId: z.preprocess(
    (val) => (val === "" || val === 0 || val === "0" || val === null || val === undefined || Number.isNaN(val) ? null : Number(val)),
    z.number().nullable().optional()
  ),

  teacherId: z.string().optional().nullable(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

/* ===========================================================
   EVENT
=========================================================== */

export const eventSchema = z.object({
  id: z.coerce.number().optional(),

  schoolId: z.string().min(1, "School is required"),

  classId: z.coerce.number().optional().nullable(),

  title: z.string().min(2, "Title is required"),

  description: z.string().optional().nullable(),

  venue: z.string().optional().nullable(),

  startTime: z.coerce.date(),

  endTime: z.coerce.date(),

  isPublic: z.boolean().default(true),
});

export type EventSchema = z.infer<typeof eventSchema>;

/* ===========================================================
   MESSAGE
=========================================================== */

export const messageSchema = z.object({
  id: z.coerce.number().optional(),

  senderId: z.string(),

  receiverId: z.string(),

  teacherId: z.string().optional().nullable(),

  senderRole: z.string().default("TEACHER"),

  receiverRole: z.string().default("PARENT"),

  subject: z.string().optional().nullable(),

  content: z.string().min(1, "Message is required"),

  isRead: z.boolean().default(false),

  readAt: z.coerce.date().optional().nullable(),
});

export type MessageSchema = z.infer<typeof messageSchema>;

/* ===========================================================
   NOTIFICATION LOG
=========================================================== */

export const notificationLogSchema = z.object({
  id: z.string().optional(),

  type: z.nativeEnum(NotificationType),

  recipient: z.string().min(1),

  subject: z.string().optional().nullable(),

  message: z.string().min(1),

  status: z.nativeEnum(NotificationStatus),

  channel: z.nativeEnum(NotificationChannel),

  studentId: z.string().optional().nullable(),

  schoolId: z.string(),

  sentAt: z.coerce.date().optional(),
});

export type NotificationLogSchema =
  z.infer<typeof notificationLogSchema>;