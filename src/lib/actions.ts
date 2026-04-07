"use server";

import { revalidatePath } from "next/cache";
import {
  AnnouncementSchema,
  AssignmentSchema,
  AttendanceSchema,
  ClassSchema,
  EventSchema,
  ExamSchema,
  LessonSchema,
  ParentSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchema";
import prisma from "./prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean };

// ---------------- SUBJECT ----------------

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers?.map((teacherId: string) => ({
            id: teacherId,
          })) || [],
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers?.map((id) => ({ id })) || [],
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = Number(data.get("id"));

  try {
    await prisma.lesson.deleteMany({
      where: { subjectId: id },
    });

    await prisma.subject.delete({
      where: { id },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- CLASS ----------------

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        gradeId: data.gradeId,
        supervisorId: data.supervisorId || null,
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.class.update({
      where: { id: data.id },
      data: {
        name: data.name,
        capacity: data.capacity,
        gradeId: data.gradeId,
        supervisorId: data.supervisorId || null,
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = Number(data.get("id"));

  try {
    await prisma.class.delete({
      where: { id },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- TEACHER ----------------

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

    await prisma.teacher.create({
      data: {
        user: {
      connect: { id: user.id }, 
    },
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((id) => ({
            id: Number(id),
          })) || [],
        },
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    const client = await clerkClient();

    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((id) => ({
            id: Number(id),
          })) || [],
        },
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    const client = await clerkClient();
    await client.users.deleteUser(id);

    await prisma.teacher.delete({
      where: { id },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- STUDENT ----------------

export const createStudent = async (
  
currentState: CurrentState,
data: StudentSchema
) => {
try {
const classItem = await prisma.class.findUnique({
 where: { id: data.classId },
 include: { _count: { select: { students: true } } },
});

 if (classItem && classItem.capacity === classItem._count.students) {
return { success: false, error: true }; }

 const client = await clerkClient();

 const user = await client.users.createUser({
username: data.username,
 password: data.password,
 firstName: data.name,
 lastName: data.surname,
...(data.email && { emailAddress: [data.email] }),
 publicMetadata: { role: "student" },
 });

await prisma.student.create({
  data: {
    // 1. RELATIONS (The "Connect" style)
    id: user.id,
    user: {
      connect: { id: user.id },
    },
    grade: {
      connect: { id: data.gradeId },
    },

    parent: {
      connect: { id: data.parentId }, 
    },
    // Only connect class if it exists
    ...(data.classId && {
      class: {
        connect: { id: data.classId },
      },
    }),

 
 username: data.username,
 name: data.name,
 surname: data.surname,
 email: data.email || null,
 phone: data.phone || null,
 address: data.address,
 img: data.img || null,
 bloodType: data.bloodType,
 sex: data.sex,
 birthday: data.birthday,
 },
});

 revalidatePath("/list/students");
 return { success: true, error: false };
 } catch (err) {
console.log(err);
return { success: false, error: true };
}
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    const client = await clerkClient();

    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    const client = await clerkClient();
    await client.users.deleteUser(id);

    await prisma.student.delete({
      where: { id },
    });

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- EXAM ----------------

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = Number(data.get("id"));

  try {
    await prisma.exam.delete({
      where: { id },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- PARENT ----------------

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      ...(data.email && { emailAddress: [data.email] }),
      publicMetadata: { role: "parent" },
    });

    await prisma.parent.create({
      data: {
       id: user.id,

    // 2. RELATIONS (Connect via the relationship name)
    user: {
      connect: { id: user.id },
    },
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    if (data.studentId) {
      await prisma.student.update({
        where: { id: data.studentId },
        data: { parentId: user.id },
      });
    }

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    const client = await clerkClient();

    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.parent.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    const client = await clerkClient();

    await prisma.student.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    await client.users.deleteUser(id);
    await prisma.parent.delete({ where: { id }, });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- ANNOUNCEMENT ----------------

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        ...(data.classId && { classId: data.classId }),
      },
    });

    revalidatePath("/list/announcement");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
      },
    });

    revalidatePath("/list/announcement");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.announcement.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/list/announcement");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- EVENT ----------------

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = Number(data.get("id"));

  try {
    await prisma.event.delete({
      where: { id },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- ASSIGNMENT ----------------

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = Number(data.get("id"));
  try {
    await prisma.assignment.delete({ where: { id } });
    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

// ---------------- RESULT ----------------

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        ...(data.examId ? { examId: data.examId } : {}),
        ...(data.assignmentId ? { assignmentId: data.assignmentId } : {}),
      },
    });
    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
        studentId: data.studentId,
        ...(data.examId ? { examId: data.examId } : {}),
        ...(data.assignmentId ? { assignmentId: data.assignmentId } : {}),
      },
    });
    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = Number(data.get("id"));
  try {
    await prisma.result.delete({ where: { id } });
    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

// ---------------- LESSON ----------------

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        subjectId: Number(data.subjectId),
        classId: Number(data.classId),
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        subjectId: Number(data.subjectId),
        classId: Number(data.classId),
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = Number(data.get("id"));

  try {
    await prisma.lesson.delete({
      where: { id },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- ATTENDANCE ----------------

export const createAttendance = async (
  prevState: any, 
  data: AttendanceSchema
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    const attendanceDate = new Date(data.date);
    attendanceDate.setHours(0, 0, 0, 0);

    const lessonId = Number(data.lessonId);

    await prisma.$transaction(async (tx) => {
      if (role === "teacher") {
        const lesson = await tx.lesson.findUnique({
          where: { id: lessonId },
        });
        
        if (!lesson || lesson.teacherId !== userId) {
          throw new Error("Unauthorized: Teacher does not own this lesson.");
        }
      }

      await tx.attendance.deleteMany({
        where: {
          lessonId: lessonId,
          date: attendanceDate,
        },
      });

      await tx.attendance.createMany({
        data: data.students.map((s) => ({
          studentId: s.studentId,
          lessonId: lessonId,
          date: attendanceDate,
          present: s.present,
        })),
      });
    });

    revalidatePath("/list/attendance");
    return { success: true, error: false };
    
  } catch (err) {
    console.error("Attendance Error:", err);
    return { success: false, error: true };
  }
};

// ---------------- SETTINGS ----------------

export const updateSchoolSettings = async (
  currentState: CurrentState,
  formData: FormData         
) => {
  const schoolName = formData.get("schoolName") as string;
  const currentYear = formData.get("currentYear") as string;
  const currentTerm = formData.get("currentTerm") as string;
  const passingGrade = parseInt(formData.get("passingGrade") as string) || 50;

  try {
    await prisma.schoolSettings.update({
      where: { id: 1 },
      data: {
        schoolName,
        currentYear,
        currentTerm,
        passingGrade,
      },
    });

    revalidatePath("/settings");
    return { success: true, error: false };
  } catch (err) {
    console.error("Prisma Update Error:", err);
    return { success: false, error: true };
  }
};

export const updatePersonalSettings = async (
  currentState: CurrentState,
  formData: FormData
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) return { success: false, error: true };

  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  try {
    if (role === "teacher") {
      await prisma.teacher.update({
        where: { id: userId },
        data: { phone, address },
      });
    } else if (role === "student") {
      await prisma.student.update({
        where: { id: userId },
        data: { phone, address },
      });
    }

    revalidatePath("/profile");
    revalidatePath("/settings");
    
    return { success: true, error: false };
  } catch (err) {
    console.error("Personal Settings Update Error:", err);
    return { success: false, error: true };
  }
};

// ---------------- MESSAGING ----------------

export const createMessage = async (
  currentState: CurrentState,
  data: FormData
) => {
  const text = data.get("text") as string;
  const receiverId = data.get("receiverId") as string;
  
  // Best practice: get the senderId from auth() directly to prevent impersonation
  const { userId: senderId } = await auth();

  if (!senderId) return { success: false, error: true };

  try {
    await prisma.message.create({
      data: {
        content: text,
        senderId,
        receiverId,
        isRead: false,
      },
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteMessage = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = Number(data.get("id"));
  try {
    await prisma.message.delete({
      where: { id },
    });
    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

export const markMessageAsRead = async (messageId: number) => {
  try {
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/"); 
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const markConversationAsRead = async (senderId: string, receiverId: string) => {
  try {
    await prisma.message.updateMany({
      where: {
        senderId: senderId,
        receiverId: receiverId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

export const saveBulkResultsAction = async (examId: number, formData: FormData) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  // 1. SECURITY CHECK
  if (role !== "admin" && role !== "teacher") {
    return { error: true, message: "Unauthorized access" };
  }

  try {
    // 2. PARSE THE FORMDATA
    // We look for keys starting with "score-" (e.g., "score-student123")
    const resultsToSave = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("score-"))
      .map(([key, value]) => ({
        studentId: key.replace("score-", ""),
        score: parseInt(value as string),
        examId: examId,
      }))
      .filter((result) => !isNaN(result.score)); // Skip empty inputs

    // 3. DATABASE TRANSACTION
    // Using $transaction ensures "All or Nothing" delivery
    await prisma.$transaction(
      resultsToSave.map((res) =>
        prisma.result.upsert({
          where: {
            // Ensure your Prisma schema has a unique constraint on studentId + examId
            studentId_examId: {
              studentId: res.studentId,
              examId: res.examId,
            },
          },
          update: { score: res.score },
          create: {
            studentId: res.studentId,
            examId: res.examId,
            score: res.score,
          },
        })
      )
    );

    revalidatePath("/list/results");
    return { success: true, message: "Grades published successfully!" };

  } catch (err) {
    console.error(err);
    return { error: true, message: "Failed to save grades." };
  }
};