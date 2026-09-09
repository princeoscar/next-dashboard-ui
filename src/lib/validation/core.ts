import { z } from "zod";
import { SchoolTerm } from "@prisma/client";

/* ===========================================================
   SCHOOL
=========================================================== */

export const schoolSchema = z.object({
  id: z.string().optional(),

  name: z.string().min(2, "School name is required"),

  code: z.string().min(2, "School code is required"),

  email: z.string().email().optional().nullable(),

  phone: z.string().optional().nullable(),

  address: z.string().optional().nullable(),

  city: z.string().optional().nullable(),

  state: z.string().optional().nullable(),

  country: z.string().optional().nullable(),

  logo: z.string().optional().nullable(),

  website: z.string().optional().nullable(),

  isActive: z.boolean().default(true),
});

export type SchoolSchema = z.infer<typeof schoolSchema>;

/* ===========================================================
   ACADEMIC YEAR
=========================================================== */

export const academicYearSchema = z.object({
  id: z.coerce.number().optional(),

  name: z.string().min(3, "Academic Year is required"),

  isCurrent: z.boolean().default(false),

  schoolId: z.string().optional().nullable(),
});

export type AcademicYearSchema = z.infer<typeof academicYearSchema>;

/* ===========================================================
   SCHOOL SETTINGS
=========================================================== */

export const schoolSettingsSchema = z.object({
  id: z.coerce.number().optional(),

  schoolId: z.string().min(1, "School is required"),

 currentAcademicYearId: z.coerce
  .number()
  .min(1, "Academic Year is required"),

  currentTerm: z.nativeEnum(SchoolTerm),

  passingGrade: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(50),
});

export type SchoolSettingsSchema =
  z.infer<typeof schoolSettingsSchema>;

/* ===========================================================
   LEVEL
=========================================================== */

export const levelSchema = z.object({
  id: z.coerce.number().optional(),

  name: z.string().min(2, "Level name is required"),

  level: z.coerce.number().min(1, "Level number is required"),

  stage: z.enum(["JUNIOR", "SENIOR"]),

  
});

export type LevelSchema = z.infer<typeof levelSchema>;
/* ===========================================================
   CLASS
=========================================================== */

export const classSchema = z.object({
  id: z.coerce.number().optional(),

  name: z.string().min(1, "Class name is required"),

  capacity: z.coerce
    .number()
    .positive("Capacity must be greater than zero"),

  levelId: z.coerce
    .number()
    .min(1, "Level is required"),

  streamId: z.preprocess(
  (value) => value === "" ? undefined : value,
  z.coerce.number().optional().nullable()
),

  supervisorId: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().optional()
  ),
});

export type ClassSchema = z.infer<typeof classSchema>;
/* ===========================================================
   SUBJECT
=========================================================== */

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),

  name: z.string().min(2, "Subject name is required"),

  teachers: z.array(z.string()).default([]),

  generalLevels: z.array(z.string()).default([]),
   
  assignments: z.array(z.string()).default([]),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

// =====================================
// ONBOARDING SCHEMAS
// =====================================

export const registerSchoolSchema = z.object({
  schoolName: z.string().min(3, "School name is required"),
  yearName: z.string().min(3, "Academic year is required"),
});

export type RegisterSchoolSchema = z.infer<typeof registerSchoolSchema>;



/* ===========================================================
   STREAM SCHEMA
=========================================================== */

export const streamSchema = z.object({
  id: z.coerce.number().optional(),

  name: z.string().min(2, "Stream name is required"),

   code: z.string().min(1, "Stream code is required"),
});

export type StreamSchema = z.infer<typeof streamSchema>;

