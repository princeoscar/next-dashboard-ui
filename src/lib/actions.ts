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

type CurrentState = { success: boolean; error: boolean; message?: string };

// ---------------- SUBJECT ----------------

export const createSubject = async (currentState: CurrentState, data: SubjectSchema) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers?.map((teacherId: string) => ({ id: teacherId })) || [],
        },
      },
    });
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (currentState: CurrentState, data: SubjectSchema) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.subject.update({
      where: { id: Number(data.id) },
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.lesson.deleteMany({ where: { subjectId: id } });
    await prisma.subject.delete({ where: { id } });
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- CLASS ----------------

export const createClass = async (currentState: CurrentState, data: ClassSchema) => {
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (currentState: CurrentState, data: ClassSchema) => {
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.class.delete({ where: { id } });
    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};


export const createResult = async (
  currentState: any,
  data: any // You can replace 'any' with your ResultSchema later
) => {
  try {
    await prisma.result.create({
      data: {
        score: Number(data.score),
        studentId: data.studentId,
        // Connect to either assignment or exam based on your schema
        ...(data.assignmentId && { assignmentId: Number(data.assignmentId) }),
        ...(data.examId && { examId: Number(data.examId) }),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: any,
  data: any
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.result.update({
      where: { id: Number(data.id) },
      data: {
        score: Number(data.score),
        studentId: data.studentId,
        ...(data.assignmentId && { assignmentId: Number(data.assignmentId) }),
        ...(data.examId && { examId: Number(data.examId) }),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: any,
  data: { id: number }
) => {
  try {
    await prisma.result.delete({
      where: { id: Number(data.id) },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- TEACHER ----------------

export const createTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
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
        birthday: new Date(data.birthday),
        subjects: {
          connect: data.subjects?.map((id) => ({ id: Number(id) })) || [],
        },
      },
    });
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
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
        birthday: new Date(data.birthday),
        subjects: {
          set: data.subjects?.map((id) => ({ id: Number(id) })) || [],
        },
      },
    });
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    const client = await clerkClient();
    await client.users.deleteUser(id);
    await prisma.teacher.delete({ where: { id } });
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- STUDENT ----------------

export const createStudent = async (currentState: CurrentState, data: StudentSchema) => {
  try {
    if (data.classId) {
      const classItem = await prisma.class.findUnique({
        where: { id: data.classId },
        include: { _count: { select: { students: true } } },
      });

      if (classItem && classItem.capacity === classItem._count.students) {
        return { success: false, error: true, message: "Class is at full capacity!" };
      }
    }

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
        birthday: new Date(data.birthday),
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (currentState: CurrentState, data: StudentSchema) => {
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
        ...(data.img && { img: data.img }),
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: new Date(data.birthday),
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    const client = await clerkClient();
    await client.users.deleteUser(id);
    await prisma.student.delete({ where: { id } });
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- EXAM ----------------

export const createExam = async (currentState: CurrentState, data: ExamSchema) => {
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (currentState: CurrentState, data: ExamSchema) => {
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.exam.delete({ where: { id } });
    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- PARENT ----------------

export const createParent = async (currentState: CurrentState, data: ParentSchema) => {
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
        clerkId: user.id,
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (currentState: CurrentState, data: ParentSchema) => {
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const createMessage = async (currentState: any, formData: FormData) => {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: true };
  }

  const content = formData.get("content") as string;
  const receiverId = formData.get("receiverId") as string;

  try {
    await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId: receiverId,
        // If your schema requires a type or other fields, add them here
      },
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    const client = await clerkClient();
    await prisma.student.updateMany({ where: { parentId: id }, data: { parentId: null } });
    await client.users.deleteUser(id);
    await prisma.parent.delete({ where: { id } });
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- ANNOUNCEMENT ----------------

export const createAnnouncement = async (currentState: CurrentState, data: AnnouncementSchema) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId || null,
      },
    });
    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (currentState: CurrentState, data: AnnouncementSchema) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId || null,
      },
    });
    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id");
  try {
    await prisma.announcement.delete({
      where: { id: Number(id) },
    });
    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- EVENT ----------------

export const createEvent = async (currentState: CurrentState, data: EventSchema) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId ? Number(data.classId) : null,
      },
    });
    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (currentState: CurrentState, data: EventSchema) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId ? Number(data.classId) : null,
      },
    });
    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id");
  try {
    await prisma.event.delete({
      where: { id: Number(id) },
    });
    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- LESSON ----------------

export const createLesson = async (currentState: CurrentState, data: LessonSchema) => {
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (currentState: CurrentState, data: LessonSchema) => {
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.lesson.delete({ where: { id } });
    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- ATTENDANCE ----------------

export const createAttendance = async (prevState: any, data: AttendanceSchema) => {
  try {
    const attendanceDate = new Date(data.date);
    attendanceDate.setHours(0, 0, 0, 0);

    await prisma.$transaction(async (tx) => {
      await tx.attendance.deleteMany({
        where: { lessonId: Number(data.lessonId), date: attendanceDate },
      });
      await tx.attendance.createMany({
        data: data.students.map((s: { studentId: string; present: boolean }) => ({
          studentId: s.studentId,
          lessonId: Number(data.lessonId),
          date: attendanceDate,
          present: s.present,
        })),
      });
    });
    revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- BULK GRADING ----------------

export const saveBulkResultsAction = async (examId: number, formData: FormData) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  if (role !== "admin" && role !== "teacher") {
    return { success: false, error: true, message: "Unauthorized" };
  }

  try {
    const resultsToSave = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("score-"))
      .map(([key, value]) => ({
        studentId: key.replace("score-", ""),
        score: parseInt(value as string),
        examId: examId,
      }))
      .filter((result) => !isNaN(result.score));

    await prisma.$transaction(
      resultsToSave.map((res) =>
        prisma.result.upsert({
          where: {
            studentId_examId: {
              studentId: res.studentId,
              examId: res.examId,
            },
          },
          update: { 
            score: res.score 
          },
          create: {
            score: res.score,
            studentId: res.studentId,
            examId: res.examId,
            // Add the missing required field here
            // Ensure "EXAM" matches your Prisma Enum if you use one (e.g., ResultType.EXAM)
            type: "EXAM", 
          },
        })
      )
    );
    revalidatePath("/list/results");
    return { success: true, error: false, message: "Grades published!" };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const createAssignment = async (currentState: any, data: any) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.endDate),
        lessonId: Number(data.lessonId),
      },
    });
    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

export const updateAssignment = async (currentState: any, data: any) => {
  try {
    await prisma.assignment.update({
      where: { id: Number(data.id) },
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        lessonId: Number(data.lessonId),
      },
    });
    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (currentState: any, data: { id: number }) => {
  try {
    await prisma.assignment.delete({ where: { id: Number(data.id) } });
    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

export const sendReply = async (currentState: any, data: any) => {
  try {
    await prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId,
        // If your schema uses a parentMessageId to link replies:
        ...(data.parentId && { parentId: Number(data.parentId) }),
      },
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};


// (Assignment and Result standard actions would follow the same pattern)