import { z } from "zod";
import {
  Day,
  SchoolTerm,
  AssignmentStatus,
  ExamType,
  PromotionStatus,
} from "@prisma/client";


export const lessonSchema = z.object({
  id: z.coerce.number().optional(),

  title: z.string().min(1, "Lesson title is required").optional(),

  day: z.nativeEnum(Day),

  startTime: z.string(),

  endTime: z.string(),

  subjectId: z.coerce
    .number()
    .min(1, "Subject is required"),

  teacherId: z.string().min(1, "Teacher is required"),

  classes: z
    .array(z.string())
    .min(1, "Select at least one class"),
});

export type LessonSchema = z.infer<typeof lessonSchema>;


export const attendanceSchema = z.object({
  date: z.coerce.date(),

  schoolId: z.string(),

  academicYearId: z.coerce.number(),

  term: z.nativeEnum(SchoolTerm),

  classId: z.coerce.number(),

  lessonId: z.coerce.number().optional().nullable(),

  subjectId: z.coerce.number().optional().nullable(),

  students: z.array(
    z.object({
      studentId: z.string(),
      present: z.boolean(),
    })
  ),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;


export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),

  title: z.string().min(1),

  description: z.string().optional().nullable(),

  instructions: z.string().optional().nullable(),

  attachmentUrl: z.string().optional().nullable(),

  totalMarks: z.coerce.number().default(20),

  assignedDate: z.coerce.date().optional(),

  dueDate: z.coerce.date(),

  status: z.nativeEnum(AssignmentStatus).optional(),

  classId: z.coerce.number().optional(),

  classes: z.array(z.string()).min(1, "Please select at least one target class."),

  subjectId: z.coerce.number(),

  teacherId: z.string(),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;



 export const examSchema = z.object({
  id: z.coerce.number().optional(),

  title: z.string().min(1, "Title is required."),

  description: z.string().optional().nullable(),

  examType: z.nativeEnum(ExamType),

  totalMarks: z.coerce.number().default(100),

  passMark: z.coerce.number().default(40),

  examDate: z.coerce.date(),

  startTime: z.coerce.date(),

  endTime: z.coerce.date(),

  venue: z.string().optional().nullable(),

  // Target level (made optional/nullable to prevent NaN errors)
  levelId: z.coerce.number().optional().nullable(),

  // Optional specialization/stream.
  streamId: z.coerce.number().optional().nullable(),

  subjectId: z.coerce.number(),

  teacherId: z.string(),

  generalLevels: z.array(z.string()).optional(),
  assignments: z.array(z.string()).optional(),
});

export type ExamSchema = z.infer<typeof examSchema>;


export const resultSchema = z.object({
  id: z.string().optional(),

  studentId: z.string().min(1, "Please select a student"),

  subjectId: z.coerce.number(),

  academicYearId: z.coerce.number(),

  term: z.nativeEnum(SchoolTerm),

  examId: z.coerce.number().nullable().optional(),

  assignmentId: z.coerce.number().nullable().optional(),

  assignmentScore: z.coerce.number().default(0),

  testScore: z.coerce.number().default(0),

  examScore: z.coerce.number().default(0),

  totalScore: z.coerce.number().optional(),

  grade: z.string().optional(),

  teacherId: z.string().optional(),

  teacherRemark: z.string().optional().nullable(),

  principalRemark: z.string().optional().nullable(),

  position: z.coerce.number().optional().nullable(),
});

export type ResultSchema = z.infer<typeof resultSchema>;


/* ===========================================================
   PROMOTION
=========================================================== */

export const promotionSchema = z.object({
  id: z.coerce.number().optional(),

  studentId: z.string(),

  academicYearId: z.coerce.number(),

  fromLevelId: z.coerce.number(),

  toLevelId: z.coerce.number(),

  fromClassId: z.coerce.number(),

  toClassId: z.coerce.number(),

  promotedBy: z.string().optional(),

  remarks: z.string().optional(),

  status: z.nativeEnum(PromotionStatus),

  promotedAt: z.date().optional(),
});

export type PromotionSchema = z.infer<typeof promotionSchema>;