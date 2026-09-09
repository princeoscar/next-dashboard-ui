import { z } from "zod";
import {
  SchoolTerm,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

/* ===========================================================
   FEE CATEGORY
=========================================================== */

export const feeCategorySchema = z.object({
  id: z.coerce.number().optional(),

  name: z.string().min(2, "Fee category name is required"),

  description: z.string().optional().nullable(),

  isActive: z.boolean().default(true),
});

export type FeeCategorySchema = z.infer<typeof feeCategorySchema>;

/* ===========================================================
   FEE ALLOCATION
=========================================================== */

export const feeAllocationSchema = z.object({
  id: z.coerce.number().optional(),

  feeCategoryId: z.coerce
    .number()
    .min(1, "Fee Category is required"),

  levelId: z.coerce
    .number()
    .min(1, "Level is required"),

  academicYearId: z.coerce
    .number()
    .min(1, "Academic Year is required"),

  term: z.nativeEnum(SchoolTerm),

  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero"),

  isCompulsory: z.boolean().default(true),

  isActive: z.boolean().default(true),

  dueDate: z.coerce.date().optional().nullable(),
});

export type FeeAllocationSchema =
  z.infer<typeof feeAllocationSchema>;

/* ===========================================================
   STUDENT BALANCE
=========================================================== */

export const studentBalanceSchema = z.object({
  id: z.coerce.number().optional(),

  studentId: z.string(),

  feeAllocationId: z.coerce.number(),

  totalAssigned: z.coerce.number(),

  discount: z.coerce.number().default(0),

  paidAmount: z.coerce.number().default(0),

  outstanding: z.coerce.number(),

  status: z.nativeEnum(PaymentStatus),

  lastReminderSent: z.coerce
    .date()
    .optional()
    .nullable(),
});

export type StudentBalanceSchema =
  z.infer<typeof studentBalanceSchema>;

/* ===========================================================
   PAYMENT RECORD
=========================================================== */

export const paymentRecordSchema = z.object({
  id: z.coerce.number().optional(),

  studentBalanceId: z.coerce.number(),

  feeAllocationId: z.coerce.number(),

  amountPaid: z.coerce
    .number()
    .positive("Amount must be greater than zero"),

  paymentMethod: z.nativeEnum(PaymentMethod),

  // Generated automatically
  reference: z.string().optional(),

  transactionId: z.string().optional().nullable(),

  // Calculated automatically
  status: z.nativeEnum(PaymentStatus).optional(),

  channel: z.string().optional().nullable(),

  receivedBy: z.string().optional().nullable(),

  paymentDate: z.coerce.date().optional(),
});

export type PaymentRecordSchema = z.infer<typeof paymentRecordSchema>;

/* ===========================================================
   INCOME
=========================================================== */

export const incomeSchema = z.object({
  id: z.coerce.number().optional(),

  title: z.string().min(2, "Title is required"),

  description: z.string().optional().nullable(),

  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero"),

  category: z.string().min(1, "Category is required"),

  paymentMethod: z
    .nativeEnum(PaymentMethod)
    .optional()
    .nullable(),

  receivedAt: z.coerce.date().optional(),

  schoolId: z.string().optional(),
});

export type IncomeSchema = z.infer<typeof incomeSchema>;

/* ===========================================================
   EXPENSE
=========================================================== */

export const expenseSchema = z.object({
  id: z.coerce.number().optional(),

  title: z.string().min(2, "Title is required"),

  description: z.string().optional().nullable(),

  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero"),

  category: z.string().min(1, "Category is required"),

  paymentMethod: z
    .nativeEnum(PaymentMethod)
    .optional()
    .nullable(),

  spentAt: z.coerce.date(),

  schoolId: z.string().optional(),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;