"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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
import { prisma } from "./prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/shared/error";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

type CurrentState = { success: boolean; error: boolean; message?: string };

// ---------------- SUBJECT ----------------

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema,
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect:
            data.teachers?.map((teacherId: string) => ({ id: teacherId })) ||
            [],
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

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema,
) => {
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

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData,
) => {
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

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema,
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema,
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData,
) => {
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
  data: any, // You can replace 'any' with your ResultSchema later
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

export const updateResult = async (currentState: any, data: any) => {
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

export const deleteResult = async (currentState: any, data: { id: number }) => {
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

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema,
) => {
  try {
    // 1. Create User in Clerk
    const client = await clerkClient();
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: data.email ? [data.email] : [],
      publicMetadata: { role: "teacher" },
    });

    // 2. Create Teacher in Prisma
    await prisma.teacher.create({
      data: {
        id: user.id,
        clerkId: user.id,
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

    // 🚀 THE FIX: Only revalidate what is strictly necessary.
    // revalidatePath handles the list and most tags automatically.
    revalidatePath("/list/teachers");
    Promise.all([
      revalidateTag("teachers", "teachers"),
      revalidateTag("profile", "profile"),
      revalidateTag("dashboard-stats", "dashboard-stats"),
    ]).catch((err) => console.error("Background Revalidation Error:", err));

    return {
      success: true,
      error: false,
      message: "Teacher created successfully!",
    };
  } catch (err: any) {
    console.log("Teacher Creation Error:", err);

    // If Clerk created the user but Prisma failed, you'll have a "ghost" user.
    // For now, let's just fix the error message.
    const errorMessage =
      err.errors?.[0]?.longMessage || err.message || "Something went wrong.";
    return { success: false, error: true, message: errorMessage };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema,
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
        birthday: new Date(data.birthday),
        subjects: {
          set: data.subjects?.map((id) => ({ id: Number(id) })) || [],
        },
      },
    });
    revalidatePath("/list/teachers");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    console.log(err);
    const errorMessage =
      err.errors?.[0]?.longMessage || "Failed to update student.";
    return { success: false, error: true, message: errorMessage };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    const client = await clerkClient();
    await client.users.deleteUser(id);
    await prisma.teacher.delete({ where: { id } });
    revalidatePath("/list/teachers");
    revalidateTag("dashboard-stats", "dashboard-stats");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: "Failed to delete student.",
    };
  }
};

// ---------------- STUDENT ----------------

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema,
) => {
  try {
    // 1. Check Class Capacity
    if (data.classId) {
      const classItem = await prisma.class.findUnique({
        where: { id: data.classId },
        include: { _count: { select: { students: true } } },
      });

      if (classItem && classItem.capacity === classItem._count.students) {
        return {
          success: false,
          error: true,
          message: "Class is at full capacity!",
        };
      }
    }

    // 2. Create User in Clerk
    const client = await clerkClient();
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      // Note: use 'emailAddress' or 'emailAddresses' based on your Clerk SDK version
      emailAddress: data.email ? [data.email] : [],
      publicMetadata: { role: "student" },
    });

    // 3. Create Student in Prisma
    await prisma.student.create({
      data: {
        id: user.id,
        clerkId: user.id,
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
    revalidateTag("student", "student");
    revalidateTag("dashboard-stats", "dashboard-stats");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    console.log(err);
    // Return specific Clerk or Prisma error messages to the UI
    const errorMessage =
      err.errors?.[0]?.longMessage || "Failed to create student.";
    return { success: false, error: true, message: errorMessage };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema,
) => {
  if (!data.id)
    return { success: false, error: true, message: "Missing Student ID" };

  try {
    // 1. Update User in Clerk
    const client = await clerkClient();
    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    // 2. Update Student in Prisma
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
    revalidateTag("students", "profile");
    revalidateTag("profile", "profile");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    console.log(err);
    const errorMessage =
      err.errors?.[0]?.longMessage || "Failed to update student.";
    return { success: false, error: true, message: errorMessage };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    const client = await clerkClient();
    // Delete from Clerk first
    await client.users.deleteUser(id);

    // Then delete from Prisma
    await prisma.student.delete({
      where: { id },
    });

    revalidatePath("/list/students");
    revalidateTag("dashboard-stats", "dashboard-stats");
    return { success: true, error: false, message: "" };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: "Failed to delete student.",
    };
  }
};

// ---------------- EXAM ----------------

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema,
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema,
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData,
) => {
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

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema,
) => {
  try {
    const client = await clerkClient();

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: data.email ? [data.email] : [],
      publicMetadata: { role: "parent" },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        clerkId: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null, // Only works if email is optional in schema
        phone: data.phone || "", // FIX: Fallback to empty string if null
        address: data.address,
        students: {
          connect: data.students?.map((studentId: string) => ({
            id: studentId,
          })),
        },
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err.errors?.[0]?.longMessage || "Failed to create parent.",
    };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema,
) => {
  if (!data.id)
    return { success: false, error: true, message: "Missing Parent ID" };

  try {
    const client = await clerkClient();

    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.parent.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || undefined, // Use undefined to skip updating if null
        phone: data.phone || "", // FIX: Fallback to string
        address: data.address,
        students: {
          set: data.students?.map((studentId: string) => ({
            id: studentId,
          })),
        },
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: "Failed to update parent." };
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

export const sendMessage = async (formData: FormData) => {
  const content = formData.get("content") as string;
  const receiverId = formData.get("receiverId") as string;
  const senderId = formData.get("senderId") as string;

  await prisma.message.create({
    data: {
      content,
      senderId,
      receiverId,
    },
  });

  // You might want to revalidate the path here
};

export const sendReplyMessage = async (receiverId: string, content: string) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");
  if (!content.trim()) return { error: "Message cannot be empty" };

  try {
    await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId,
      },
    });

    // Refresh the admin page to show the latest state if needed
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to send message" };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    const client = await clerkClient();
    await prisma.student.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });
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

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema,
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(), // Always use current date for new posts
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    // Refresh both views
    revalidatePath("/list/announcements");
    revalidatePath("/admin");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema,
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId ? Number(data.classId) : null,
      },
    });
    revalidatePath("/list/announcements");
    revalidatePath("/admin");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id");
  try {
    await prisma.announcement.delete({
      where: { id: Number(id) },
    });
    revalidatePath("/list/admin");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- EVENT ----------------

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema,
) => {
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
    revalidatePath("/admin");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema,
) => {
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

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id");
  try {
    await prisma.event.delete({
      where: { id: Number(id) },
    });
    revalidatePath("/list/admin");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- LESSON ----------------

export const createLesson = async (currentState: any, data: LessonSchema) => {
  try {
    // We need to provide a dummy date since Prisma DateTime requires it
    // We'll use "1970-01-01" as a placeholder for time-only fields
    const startTime = new Date(`1970-01-01T${data.startTime}:00Z`);
    const endTime = new Date(`1970-01-01T${data.endTime}:00Z`);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return {
        success: false,
        error: true,
        message: "Invalid time format provided.",
      };
    }

    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: startTime,
        endTime: endTime,
        subjectId: Number(data.subjectId), // Ensure it's a number
        classId: Number(data.classId), // Ensure it's a number
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: "Failed to create lesson." };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema,
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
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData,
) => {
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

// ---------------- ASSIGNMENT ----------------

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

export const deleteAssignment = async (
  currentState: any,
  data: { id: number },
) => {
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
    const newMessage = await prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId,
        ...(data.parentId && { parentId: Number(data.parentId) }),
      },
    });

    // --- REAL-TIME BROADCAST ---
    // We send the message to a channel unique to the receiver
    await pusher.trigger(`chat-${data.receiverId}`, "new-reply", {
      content: newMessage.content,
      senderId: data.senderId,
      senderName: "Your Name Logic Here",
      parentId: data.parentId || null,
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const markMessagesAsRead = async (receiverId: string) => {
  try {
    await prisma.message.updateMany({
      where: {
        receiverId: receiverId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    // Revalidate so the server-side count updates
    revalidatePath("/list/messages");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const createGrade = async (
  currentState: any,
  data: { name: string; level: number },
) => {
  try {
    await prisma.grade.create({
      data: {
        name: data.name,
        level: data.level,
      },
    });

    revalidatePath("/list/grades");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateGrade = async (currentState: any, data: any) => {
  try {
    await prisma.grade.update({
      where: {
        // Convert ID to integer
        id: parseInt(data.id),
      },
      data: {
        name: data.name,
        // Convert Level to integer
        level: parseInt(data.level),
      },
    });

    // Don't forget to revalidate so the UI updates
    revalidatePath("/list/grades");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteGrade = async (currentState: any, formData: FormData) => {
  // We get the ID from the FormData object
  const id = formData.get("id") as string;

  try {
    await prisma.grade.delete({
      where: {
        // Essential: Convert the string ID to an Integer
        id: parseInt(id),
      },
    });

    // This clears the cache so the Grade disappears from the list immediately
    revalidatePath("/list/grades");

    return { success: true, error: false };
  } catch (err) {
    console.error("Delete Error:", err);
    return { success: false, error: true };
  }
};

// ---------------- BULK GRADING ----------------

export const saveBulkResultsAction = async (
  examId: number,
  prevState: any,
  formData: FormData,
) => {
  const studentIds = formData.getAll("studentId") as string[];
  const scores = formData.getAll("score") as string[];

  try {
    const operations = studentIds
      .map((id, index) => {
        const scoreValue = parseInt(scores[index]);
        if (isNaN(scoreValue)) return null;

        return prisma.result.upsert({
          where: {
            studentId_examId: { studentId: id, examId: examId },
          },
          update: {
            score: scoreValue,
            // If your schema requires 'type' even on update, include it here:
            // type: "EXAM"
          },
          create: {
            score: scoreValue,
            studentId: id,
            examId: examId,
            // FIX: Add the missing required property here
            type: "EXAM",
          },
        });
      })
      .filter(Boolean);

    await prisma.$transaction(operations as any);
    return { success: true, error: false, message: "Results saved!" };
  } catch (err) {
    console.error("Database Error:", err);
    return { success: false, error: true, message: "Failed to save results." };
  }
};

// ---------------- ATTENDANCE ----------------

export const createAttendance = async (
  prevState: any,
  data: AttendanceSchema,
) => {
  try {
    // 1. We use a transaction so it's all or nothing
    await prisma.$transaction(
      data.students.map((s) =>
        prisma.attendance.upsert({
          where: {
            // This requires the @@unique([date, studentId, lessonId]) in schema
            // If you haven't run the migration yet, you'll need to use .create
            date_studentId_lessonId: {
              date: data.date,
              studentId: s.studentId,
              lessonId: data.lessonId,
            },
          },
          update: {
            present: s.present,
          },
          create: {
            date: data.date,
            studentId: s.studentId,
            lessonId: data.lessonId,
            present: s.present,
          },
        }),
      ),
    );

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const saveAttendanceAction = async (
  prevState: any,
  formData: FormData,
) => {
  const lessonId = parseInt(formData.get("lessonId") as string);
  const studentIds = formData.getAll("studentId") as string[];
  const statuses = formData.getAll("status") as string[];

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize date to midnight

  try {
    const operations = studentIds.map((id, index) => {
      const isPresent = statuses[index] === "true";

      return prisma.attendance.upsert({
        where: {
          // You might need a compound unique index in schema for this to work perfectly:
          // @@unique([date, studentId, lessonId])
          id: -1, // Placeholder if you don't have the compound index yet
        },
        create: {
          date: today,
          present: isPresent,
          studentId: id,
          lessonId: lessonId,
        },
        update: {
          present: isPresent,
        },
      });
    });

    // For now, let's use a simple createMany or loop if the unique index isn't set
    // But $transaction is safest:
    await Promise.all(
      studentIds.map((id, index) =>
        prisma.attendance.create({
          data: {
            date: today,
            present: statuses[index] === "true",
            studentId: id,
            lessonId: lessonId,
          },
        }),
      ),
    );

    return {
      success: true,
      error: false,
      message: "Attendance synced successfully!",
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Error saving attendance." };
  }
};
