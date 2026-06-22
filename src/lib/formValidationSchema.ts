import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()).optional(), // 🎯 Changed to optional so empty lists don't crash
  schoolId: z.string().optional(), // 🎯 Changed to optional so it doesn't block submission
  classes: z.array(z.string()),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required!" }),
  levelId: z.coerce.number().min(1, { message: "Level is required!" }),
  supervisorId: z.string().optional().nullable(),
  schoolId: z.string().optional(), // 🎯 Changed to optional
  levels: z.array(z.string()).optional(),
  classes: z.array(z.string()).optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
  schoolId: z.string().optional(),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .nullable() // Allows null in DB
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().min(1, { message: "Address is required!" }),
  img: z.string().optional().nullable(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  levelId: z.coerce.number().min(1, { message: "Level is required!" }),
  classId: z.coerce.number().optional().or(z.literal(null)),
  parentId: z.string().min(1, { message: "Parent ID is required!" }),
  schoolId: z.string().min(1, "School ID is required"),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  
  // 🎯 FIX: Allow either a Number (for updates) or a String (for our comma-separated cohorts)
  classId: z.union([z.string(), z.number()]).refine(val => String(val).length > 0, {
    message: "Class is required!",
  }),
  
  teacherId: z.string().min(1, { message: "Teacher is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.coerce.date({ message: "Invalid date!" }), // 🎯 Key: Coerce handles string to Date
  classId: z.coerce.number().optional().nullable(),
});
export type AnnouncementSchema = z.infer<typeof announcementSchema>;

// Your existing schema
export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
  startTime: z.string(),
  endTime: z.string(),
  subjectId: z.coerce.string(),
  classes: z.array(z.string()).min(1, { message: "Select at least one class!" }),
  teacherId: z.coerce.string(),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

// --- ASSIGNMENT ---
export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1),
  startDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  subjectId: z.coerce.number(), // 🎯 Crucial: coerce
  classId: z.coerce.number(), // 🎯 Crucial: coerce
  teacherId: z.string(),
});
export type AssignmentSchema = z.infer<typeof assignmentSchema>;

// --- ATTENDANCE ---
export const attendanceSchema = z.object({
  date: z.coerce.date(),
  schoolId: z.string().min(1, "School ID is required"),
  academicYearId: z.coerce.number().min(1, "Academic Year is required"),
  // 🎯 Make subjectId optional so Daily Attendance submissions pass validation
  subjectId: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  students: z.array(
    z.object({
      studentId: z.string(),
      present: z.boolean(),
    }),
  ),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;



// --- EVENT ---
export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  classId: z.coerce.number().optional().nullable(),
});
export type EventSchema = z.infer<typeof eventSchema>;

// --- PARENT ---
export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  // FIX: Change studentId to students and make it an array
  students: z.array(z.string()).optional(),
  schoolId: z.string().min(1, "School ID is required"),
});

export type ParentSchema = z.infer<typeof parentSchema>;

// 1. The Variable: lowercase 'l'
export const levelSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Level name is required!" }),
  schoolId: z.string().min(1, { message: "School ID is required!" }),
});

// 2. The Type: Uppercase 'L'
// Notice we infer from 'levelSchema' (the variable above)
export type LevelSchema = z.infer<typeof levelSchema>;

export const resultSchema = z.object({
  // Allow ID to be optional (for create) or string (for update)
  id: z.string().optional().nullable(),

  // Ensure these are treated as strings
  studentId: z.string().min(1, "Student is required"),

  // Use coerce to handle strings from <select> being turned into numbers
  subjectId: z.coerce.number().min(1, "Subject is required"),
  academicYearId: z.coerce.number().min(1, "Year is required"),
  term: z.coerce.number().min(1, "Term is required"),

  // Nullable relations
  examId: z.coerce.number().optional().nullable(),
  assignmentId: z.coerce.number().optional().nullable(),

  // Scores - use coerce and default to 0 to avoid null issues
  testScore: z.coerce.number().default(0),
  assignmentScore: z.coerce.number().default(0),
  examScore: z.coerce.number().default(0),
  totalScore: z.coerce.number().default(0),

  // 🎯 THE FIX: Extreme flexibility for strings
  grade: z.preprocess((val) => val ?? "", z.string().optional()),
  remark: z.preprocess((val) => val ?? "", z.string().optional()),
});

export type ResultSchema = z.infer<typeof resultSchema>;

// export const resultSchema = z.object({
//   id: z.coerce.number().optional(),
//   score: z.coerce.number(),
//   studentId: z.string(),
// });
