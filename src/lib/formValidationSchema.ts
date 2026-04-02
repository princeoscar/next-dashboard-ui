import { z } from "zod";

// ---------------- SUBJECT ----------------
export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()).optional(), // ✅ FIXED
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

// ---------------- CLASS ----------------
export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1),
  gradeId: z.coerce.number().min(1),
  supervisorId: z.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

// // ---------------- TEACHER ----------------
export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  // Better password handling: Only validate length if a password is actually entered
  password: z.string().transform((val) => (val === "" ? undefined : val)).pipe(z.string().min(8).optional()),
  name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  img: z.string().optional().or(z.literal("")),
  bloodType: z.string().min(1, "Blood type is required"),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"]),
  subjects: z.array(z.string()).optional(), 
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

// ---------------- STUDENT ----------------
export const studentSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3).max(20),
  password: z.string().transform((val) => (val === "" ? undefined : val)).pipe(z.string().min(8).optional()),
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  img: z.string().optional(),
  bloodType: z.string().min(1, "Blood type is required"),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"]),
  gradeId: z.coerce.number().min(1, "Please select a grade"),
  classId: z.coerce.number().min(1, "Please select a class"),
  parentId: z.string().min(1, "Parent ID is required"),
});

export type StudentSchema = z.infer<typeof studentSchema>;

// ---------------- EXAM ----------------
export const examSchema = z
  .object({
    id: z.coerce.number().optional(),
    title: z.string().min(1),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    lessonId: z.coerce.number(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type ExamSchema = z.infer<typeof examSchema>;

// ---------------- PARENT ----------------
export const parentSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3).max(20),
  password: z.string().min(8).optional().or(z.literal("")),
  name: z.string().min(1, { message: "First name is required" }),
  surname: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1, { message: "Phone is required" }),
  address: z.string().min(1),
  studentId: z.string().optional(),
});

export type ParentSchema = z.infer<typeof parentSchema>;


// ---------------- ANNOUNCEMENT ----------------

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title:z.string().min(1, {message: "Title is required"}),
  description:z.string().min(1, {message: "Description is required"}),
  date:z.coerce.date({message: "Date is required!"}),
  classId:z.coerce.number().optional().nullable(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>; 

// ---------------- EVENTS ----------------

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title:z.string().min(1, {message: "Title is required"}),
  description:z.string().min(1, {message: "Description is required"}),
  startTime:z.coerce.date({message: "Start Time is required!"}),
  endTime:z.coerce.date({message: "End Time is required!"}),
  classId:z.coerce.number().optional().nullable(),
});

export type EventSchema = z.infer<typeof eventSchema>; 

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;


export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number().min(0, { message: "Score must be at least 0!" }),
  studentId: z.string().min(1, { message: "Student is required!" }),
  examId: z.coerce.number().optional().nullable(),
  assignmentId: z.coerce.number().optional().nullable(),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Lesson name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
  teacherId: z.string({ message: "Teacher is required!" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const attendanceSchema = z.object({
  date: z.coerce.date({ message: "Date is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
  students: z.array(
    z.object({
      studentId: z.string(),
      present: z.boolean(),
    })
  ),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;
