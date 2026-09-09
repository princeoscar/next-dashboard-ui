import { z } from "zod";
import {
  UserSex,
  TeacherStatus,
  RelationshipType,
} from "@prisma/client";



export const teacherSchema = z.object({
  id: z.string().optional(),

  staffId: z.string().min(1, "Staff ID is required"),

  clerkId: z.string().optional(),

  username: z.string().min(3, "Username must be at least 3 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),

  firstName: z.string().min(2, "First name is required"),

  middleName: z.string().optional().nullable(),

  lastName: z.string().min(2, "Last name is required"),

  email: z.string().email().optional().nullable(),

  phone: z.string().optional().nullable(),

  address: z.string().min(1, "Address is required"),

  img: z.string().optional().nullable(),

  
birthday: z.coerce.date(),

  bloodType: z.string().min(1, "Blood group is required"),

  sex: z.nativeEnum(UserSex),

  qualification: z.string().optional().nullable(),

  employmentDate: z.coerce.date(),

  status: z.nativeEnum(TeacherStatus).default(TeacherStatus.ACTIVE),

  

  subjects: z.array(z.string()).default([]),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;


export const studentSchema = z.object({
  id: z.string().optional(),

  admissionNumber: z.string().optional(),

  clerkId: z.string().optional(),

  username: z.string().min(3, "Username must be at least 3 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),

  name: z.string().min(2, "First name is required"),

  surname: z.string().min(2, "Surname is required"),

  email: z.string().email().optional().nullable(),

  phone: z.string().optional().nullable(),

  address: z.string().min(1, "Address is required"),

  img: z.string().optional().nullable(),

  bloodType: z.string().optional().nullable(),

  birthday: z.coerce.date(),

  sex: z.nativeEnum(UserSex),

  levelId: z.coerce.number().min(1, "Level is required"),

  classId: z.coerce.number().nullable().optional(),

  parentId: z
  .string()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional(),

});

export type StudentSchema = z.infer<typeof studentSchema>;


export const parentSchema = z.object({
  id: z.string().optional(),

  clerkId: z.string().optional(),

  username: z.string().min(3, "Username must be at least 3 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),

  firstName: z.string().min(2, "First name is required"),

  middleName: z.string().optional().nullable(),

  lastName: z.string().min(2, "Last name is required"),

  email: z.string().email().optional().nullable(),

  phone: z.string().min(1, "Phone number is required"),

  occupation: z.string().optional().nullable(),

  relationship: z.nativeEnum(RelationshipType).default(RelationshipType.FATHER),

  address: z.string().min(1, "Address is required"),

  img: z.string().optional().nullable(),

  schoolId: z.string().min(1, "School is required"),

  isActive: z.boolean().default(true),

  students: z.array(z.string()).default([]),
});

export type ParentSchema = z.infer<typeof parentSchema>;