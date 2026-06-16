"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  AnnouncementSchema,
  AssignmentSchema,
  AttendanceSchema,
  ClassSchema,
  EventSchema,
  ExamSchema,
  // LessonSchema,
  ParentSchema,
  ResultSchema,
  LevelSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  eventSchema,
  announcementSchema,
  LessonSchema,
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
    // 1. Check for duplicate name FIRST to avoid the P2002 error
    const existingSubject = await prisma.subject.findUnique({
      where: { name: data.name },
    });

    if (existingSubject) {
      return {
        success: false,
        error: true,
        message: `The subject "${data.name}" already exists!`,
      };
    }

    // 2. Fetch the school
    const school = await prisma.school.findFirst();

    if (!school) {
      return {
        success: false,
        error: true,
        message: "No school found in database!",
      };
    }

    // 3. Create
    await prisma.subject.create({
      data: {
        name: data.name,
        schoolId: school.id,
        teachers: {
          connect:
            data.teachers?.map((teacherId: string) => ({ id: teacherId })) ||
            [],
        },
        classes: {
          // 🎯 You must connect the classes here!
          connect: data.classes?.map((id: string) => ({ id: parseInt(id) })),
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error("DATABASE ERROR:", err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema,
) => {
  if (!data.id) return { success: false, error: true };
  try {
    const duplicate = await prisma.subject.findFirst({
      where: {
        name: data.name,
        NOT: { id: Number(data.id) },
      },
    });

    if (duplicate) {
      return { success: false, error: true, message: "Name already taken." };
    }

    await prisma.subject.update({
      where: { id: Number(data.id) },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers?.map((id) => ({ id })) || [],
        },
        // 🎯 ADD THIS: This is why editing didn't fix the "invisible" subjects
        classes: {
          set: data.classes?.map((id) => ({ id: parseInt(id) })) || [],
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
    // 🎯 Dynamically fetch the school ID to prevent Foreign Key errors
    const school = await prisma.school.findFirst();

    if (!school) {
      return {
        success: false,
        error: true,
        message: "No school found in database.",
      };
    }

    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        schoolId: school.id, // Use the fetched ID
        levelId: data.levelId,
        supervisorId: data.supervisorId || null,
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("CREATE_CLASS_ERROR:", err);
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
        levelId: data.levelId,
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
        schoolId: data.schoolId,
        bloodType: data.bloodType,
        img: data.img || null,
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
  if (!id) return { success: false, error: true, message: "Teacher ID missing." };

  try {
    const client = await clerkClient();

    // 1. Attempt to delete from Clerk first
    try {
      await client.users.deleteUser(id);
    } catch (clerkErr: any) {
      if (clerkErr.status === 404 || clerkErr.errors?.[0]?.code === 'resource_not_found') {
        console.log(`⚠️ Warning: User ${id} not found in Clerk. Proceeding with database cleanup.`);
      } else {
        throw clerkErr;
      }
    }

    // 2. Clear Database Records safely using an extended timeout transaction block
    await prisma.$transaction(
      async (tx) => {
        // A. Delete all Exams directly owned by this teacher first
        await tx.exam.deleteMany({
          where: { teacherId: id },
        });

        // B. Dissociate any Classes where they act as a supervisor
        await tx.class.updateMany({
          where: { supervisorId: id },
          data: { supervisorId: null },
        });

        // C. Handle Lessons if they point directly to this teacher
        try {
          await tx.lesson.deleteMany({
            where: { teacherId: id },
          });
        } catch (lessonErr) {
          console.log("ℹ️ Skipping lesson deletion if relation structure differs.");
        }

        // D. Finally, safely delete the core Teacher profile record
        await tx.teacher.delete({
          where: { id },
        });
      },
      {
        // 🎯 FIX: Extend timeout window to 15 seconds (15000ms) to accommodate network latency
        maxWait: 5000,   // Time Prisma waits to acquire a database connection
        timeout: 15000,  // Time allowed for the entire transaction execution query sequence
      }
    );

    // 3. Purge router cache states cleanly
    revalidatePath("/list/teachers");
    revalidateTag("dashboard-stats", "dashboard-stats");

    return { success: true, error: false, message: "Teacher deleted successfully." };
  } catch (err: any) {
    console.error("Core Deletion Error:", err);
    return {
      success: false,
      error: true,
      message: err.message || "Failed to delete Teacher.",
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
        schoolId: data.schoolId,
        sex: data.sex,
        birthday: new Date(data.birthday),
        levelId: data.levelId,
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
        levelId: data.levelId,
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

// ---------------- PARENT ----------------

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema,
) => {
  try {
    const client = await clerkClient();

    console.log(
      "Attempting to create Clerk user with:",
      data.username,
      data.email,
    );

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
        schoolId: data.schoolId,
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

// ---------------- Message ----------------
export const createMessage = async (currentState: any, formData: FormData) => {
  const content = formData.get("content") as string;
  const receiverId = formData.get("receiverId") as string;
  const { userId } = await auth(); // This is the sender

  try {
    await prisma.message.create({
      data: {
        content,
        senderId: userId!, // Ensure your 'User' table has your Clerk ID!
        receiverId: receiverId, // Now correctly points to a Teacher ID
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- SEND MESSAGE ----------------

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

// ---------------- SEND REPLY MESSAGE ----------------

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

// ---------------- ANNOUNCEMENT ----------------

export const createAnnouncement = async (
  currentState: { success: boolean; error: boolean },
  data: AnnouncementSchema,
) => {
  try {
    // 1. Validate exactly like we did for Results
    const validatedFields = announcementSchema.safeParse(data);

    if (!validatedFields.success) {
      console.log(
        "❌ SERVER VALIDATION ERROR:",
        validatedFields.error.flatten().fieldErrors,
      );
      return { success: false, error: true };
    }

    // 2. The Database Call
    await prisma.announcement.create({
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        date: validatedFields.data.date,
        classId: validatedFields.data.classId || null,
      },
    });

    // 3. Clear the cache so it actually shows up
    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err: any) {
    // 🔍 This is where the "Server Closed" error happens
    console.error("🔥 PRISMA ERROR:", err.message);
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

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = Number(data.get("id"));
  try {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- EVENT ----------------

export const createEvent = async (currentState: any, formData: FormData) => {
  // Convert FormData back to a plain object for Zod validation
  const data = Object.fromEntries(formData.entries());

  const validatedFields = eventSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: true };
  }

  try {
    await prisma.event.create({
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        startTime: new Date(validatedFields.data.startTime),
        endTime: new Date(validatedFields.data.endTime),
        classId: validatedFields.data.classId
          ? parseInt(validatedFields.data.classId as any)
          : null,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: any,
  formData: FormData | any,
) => {
  // 🎯 FIX: Check if formData is actually FormData, otherwise assume it's an object
  const data =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

  const validatedFields = eventSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: true };
  }

  if (!validatedFields.data.id) return { success: false, error: true };
  try {
    await prisma.event.update({
      where: { id: validatedFields.data.id },
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        startTime: new Date(validatedFields.data.startTime),
        endTime: new Date(validatedFields.data.endTime),
        classId: validatedFields.data.classId
          ? Number(validatedFields.data.classId)
          : null,
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

// --- SEND REPLY ---

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

// --- MARK MESSAGE ---

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

// --- CREATE LEVEL ---

type LevelData = {
  name: string;
  schoolId: string;
  id?: number;
};

export const createLevel = async (currentState: any, data: LevelSchema) => {
  try {
    await prisma.level.create({
      data: {
        // 🎯 Use 'name' if that is what your Prisma model expects
        name: data.name,
        schoolId: data.schoolId,
        // 🎯 If your DB field is 'level' but the form value is in 'name':
        level: parseInt(data.name),
      },
    });

    revalidatePath("/list/levels");
    return { success: true, error: false };
  } catch (err) {
    console.error("Prisma Error:", err);
    return {
      success: false,
      error: true,
      message: "Database creation failed.",
    };
  }
};

export const updateLevel = async (currentState: any, data: any) => {
  try {
    await prisma.level.update({
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
    revalidatePath("/list/levels");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteLevel = async (currentState: any, formData: FormData) => {
  // We get the ID from the FormData object
  const id = formData.get("id") as string;

  try {
    await prisma.level.delete({
      where: {
        // Essential: Convert the string ID to an Integer
        id: parseInt(id),
      },
    });

    // This clears the cache so the Grade disappears from the list immediately
    revalidatePath("/list/level");

    return { success: true, error: false };
  } catch (err) {
    console.error("Delete Error:", err);
    return { success: false, error: true };
  }
};

// ---------------- BULK GRADING ----------------

export const saveBulkResultsAction = async (
  prevState: any,
  formData: FormData,
) => {
  // 1. Get shared info for the whole batch
  const subjectId = Number(formData.get("subjectId"));
  const academicYearId = Number(formData.get("academicYearId"));
  const term = Number(formData.get("term"));
  const scoreType = formData.get("scoreType") as "assignment" | "test" | "exam";

  // 2. Get arrays of student IDs and their corresponding scores
  const studentIds = formData.getAll("studentId") as string[];
  const scores = formData.getAll("score") as string[];

  try {
    // 3. Create the list of Prisma operations
    const operations = studentIds
      .map((id, index) => {
        const scoreValue = parseInt(scores[index]);
        if (isNaN(scoreValue)) return null;

        // Dynamic update object based on what we are recording (CA or Exam)
        const updateData: any = {};
        if (scoreType === "assignment") updateData.assignmentScore = scoreValue;
        if (scoreType === "test") updateData.testScore = scoreValue;
        if (scoreType === "exam") updateData.examScore = scoreValue;

        return prisma.result.upsert({
          where: {
            studentId_subjectId_academicYearId_term: {
              studentId: id,
              subjectId,
              academicYearId,
              term,
            },
          },
          update: updateData,
          create: {
            studentId: id,
            subjectId,
            academicYearId,
            term,
            ...updateData,
            totalScore: scoreValue, // Initial total
          },
        });
      })
      .filter((op) => op !== null); // Remove nulls from failed parses

    // 4. Execute all at once
    await prisma.$transaction(operations as any);

    revalidatePath("/list/results");
    return { success: true, error: false, message: "Bulk results saved!" };
  } catch (err) {
    console.error("Database Error:", err);
    return {
      success: false,
      error: true,
      message: "Failed to save bulk results.",
    };
  }
};
// ---------------- ATTENDANCE ----------------

export const createAttendance = async (
  prevState: any,
  data: AttendanceSchema,
) => {
  try {
    const attendanceDate = new Date(data.date);

    const { subjectId, schoolId, academicYearId } = data;
    // 1. We use a transaction so it's all or nothing
    await prisma.$transaction(
      data.students.map((s) =>
        prisma.attendance.upsert({
          where: {
            date_studentId: {
              date: attendanceDate,
              studentId: s.studentId,
            },
          }, // <--- This brace must close the 'where' block!
          update: {
            present: s.present,
          },
          create: {
            date: data.date,
            studentId: s.studentId,
            present: s.present,
            schoolId: data.schoolId,
            academicYearId: academicYearId,
            subjectId: subjectId, // 👈 Now 'subjectId' is defined!
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

// ----------------SAVE ATTENDANCE ----------------

export const saveAttendanceAction = async (
  prevState: any,
  formData: FormData,
) => {
  // 1. Extract shared data
  const schoolId = formData.get("schoolId") as string;
  const academicYearId = Number(formData.get("academicYearId"));
  const subjectId = Number(formData.get("subjectId"));
  const studentIds = formData.getAll("studentId") as string[];
  const statuses = formData.getAll("status") as string[];

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize date to midnight

  try {
    // 2. Prepare the operations for the transaction
    const operations = studentIds.map((id, index) => {
      const isPresent = statuses[index] === "true";

      return prisma.attendance.upsert({
        where: {
          // 🎯 This uses the compound unique index from your schema
          date_studentId: {
            date: today,
            studentId: id,
          },
        },
        update: {
          present: isPresent,
        },
        create: {
          date: today,
          present: isPresent,
          studentId: id,
          academicYearId: academicYearId, // 🎯 Use the variable from formData
          subjectId: subjectId, // Must be a number (from your refactored schema)
          schoolId: schoolId,
        },
      });
    });

    // 3. Execute all upserts in a single transaction
    await prisma.$transaction(operations);

    revalidatePath("/list/attendance");
    return {
      success: true,
      error: false,
      message: "Attendance synced successfully!",
    };
  } catch (err) {
    console.error("Database Error:", err);
    return {
      success: false,
      error: true,
      message:
        "Error saving attendance. Ensure all required fields are provided.",
    };
  }
};

// ---------------- REGISTER SCHOOL ----------------

export const registerSchool = async (formData: FormData) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const schoolName = formData.get("schoolName") as string;
  const yearName = formData.get("yearName") as string;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create School
      const newSchool = await tx.school.create({
        data: { name: schoolName },
      });

      // 2. Create Academic Year
      await tx.academicYear.create({
        data: {
          name: yearName,
          isCurrent: true,
        },
      });

      // 3. Link Admin in Prisma
      await tx.admin.create({
        data: {
          id: userId,
          username: "Admin",
          school: {
            connect: { id: newSchool.id }, // Use the variable for the school ID here
          },
        },
      });

      return newSchool;
    });

    // 4. Update Clerk Metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "admin",
        schoolId: result.id,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("ONBOARDING_ERROR:", err);
    return { success: false, error: true, message: "Failed to create school." };
  }
};

export async function createSchool(formData: FormData, adminId: string) {
  const schoolName = formData.get("schoolName") as string;

  if (!schoolName || schoolName.length < 3) {
    return { success: false, error: "School name is too short!" };
  }

  try {
    // 1. Create the School and connect the Admin in ONE transaction
    // 1. Create the school first (just the name)
    const school = await prisma.school.create({
      data: {
        name: schoolName,
      },
    });

    // 2. Link the Admin to the School separately
    await prisma.admin.upsert({
      where: { id: adminId },
      update: {
        school: {
          connect: { id: school.id }, // 🎯 Use 'school' and 'connect'
        },
      },
      create: {
        id: adminId,
        username: "Admin", // Or get the real username if available
        school: {
          connect: { id: school.id }, // 🎯 Use 'school' and 'connect'
        },
      },
    });

    // 2. Update Clerk Metadata so the Middleware sees the schoolId
    const client = await clerkClient();
    await client.users.updateUserMetadata(adminId, {
      publicMetadata: {
        role: "admin",
        schoolId: school.id,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("ONBOARDING_ERROR:", err);
    return { success: false, error: "Database connection failed." };
  }
}

// ---------------- RESULT (The Core Model) ----------------

// --- RESULT ACTIONS ---

export const saveResult = async (
  currentState: CurrentState,
  data: ResultSchema,
) => {
  try {
    const total =
      (Number(data.assignmentScore) || 0) +
      (Number(data.testScore) || 0) +
      (Number(data.examScore) || 0);

    await prisma.result.upsert({
      where: {
        studentId_subjectId_academicYearId_term: {
          studentId: data.studentId,
          subjectId: Number(data.subjectId),
          academicYearId: Number(data.academicYearId),
          term: Number(data.term),
        },
      },
      update: {
        assignmentScore: data.assignmentScore
          ? Number(data.assignmentScore)
          : undefined,
        testScore: data.testScore ? Number(data.testScore) : undefined,
        examScore: data.examScore ? Number(data.examScore) : undefined,
        totalScore: total,
        remark: data.remark,
      },
      create: {
        studentId: data.studentId,
        subjectId: Number(data.subjectId),
        academicYearId: Number(data.academicYearId),
        term: Number(data.term),
        assignmentScore: Number(data.assignmentScore) || 0,
        testScore: Number(data.testScore) || 0,
        examScore: Number(data.examScore) || 0,
        totalScore: total,
        // grade: data.level,
        remark: data.remark,
      },
    });

    revalidatePath("/list/results");
    return {
      success: true,
      error: false,
      message: "Result updated successfully!",
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to save result." };
  }
};

// export const deleteResult = async (
//   currentState: CurrentState,
//   data: FormData,
// ) => {
//   const id = Number(data.get("id"));
//   try {
//     await prisma.result.delete({ where: { id } });
//     revalidatePath("/list/results");
//     return { success: true, error: false };
//   } catch (err) {
//     console.error(err);
//     return { success: false, error: true };
//   }
// };

// src/lib/actions.ts

export const createAssignment = async (
  currentState: { success: boolean; error: boolean },
  data: AssignmentSchema, // Or whatever your type is
) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
        // 🎯 CONVERT STRINGS TO NUMBERS HERE:
        subjectId: parseInt(data.subjectId as unknown as string),
        classId: parseInt(data.classId as unknown as string),
        teacherId: data.teacherId, // Keep as string if it's a UUID/Clerk ID
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: { success: boolean; error: boolean },
  data: AssignmentSchema,
) => {
  try {
    // 🎯 Ensure ID is a number for the 'where' clause
    await prisma.assignment.update({
      where: {
        id: parseInt(data.id as unknown as string),
      },
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
        subjectId: parseInt(data.subjectId as unknown as string),
        classId: parseInt(data.classId as unknown as string),
        teacherId: data.teacherId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log("UPDATE ERROR:", err); // 👈 Check your terminal for this log!
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (currentState: State, data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ----------------- Exam ----------------------

type State = {
  success: boolean;
  error: boolean;
};

export const createExam = async (currentState: State, data: any) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (currentState: State, data: any) => {
  try {
    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
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
  currentState: { success: boolean; error: boolean },
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

const dayToDate: { [key: string]: number } = {
  MONDAY: 4,
  TUESDAY: 5,
  WEDNESDAY: 6,
  THURSDAY: 7,
  FRIDAY: 8,
};

export const createLesson = async (
  currentState: { success: boolean; error: boolean },
  data: LessonSchema,
) => {
  try {
    // Look at the line below: we put 'singleClassId' inside the ( )
    // so we can use it inside the loop.
    await Promise.all(
      data.classes.map(async (singleClassId) => {
        return prisma.lesson.create({
          data: {
            name: data.name,
            day: data.day,
            startTime: new Date(
              2026,
              4,
              dayToDate[data.day],
              parseInt(data.startTime.split(":")[0]),
              parseInt(data.startTime.split(":")[1]),
            ),
            endTime: new Date(
              2026,
              4,
              dayToDate[data.day],
              parseInt(data.endTime.split(":")[0]),
              parseInt(data.endTime.split(":")[1]),
            ),
            subjectId: Number(data.subjectId),
            teacherId: data.teacherId,
            // Now 'singleClassId' is defined!
            classId: Number(singleClassId),
          },
        });
      }),
    );

    return { success: true, error: false };
  } catch (err) {
    console.log("ERROR_CREATING_LESSON:", err);
    return { success: false, error: true };
  }
};

// UPDATE ACTION
export const updateLesson = async (
  currentState: { success: boolean; error: boolean },
  data: LessonSchema,
) => {
  if (!data.id)
    return { success: false, error: true, message: "ID is required" };

  try {
    await prisma.lesson.update({
      where: {
        id: Number(data.id),
      },
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(`1970-01-01T${data.startTime}:00`),
        endTime: new Date(`1970-01-01T${data.endTime}:00`),
        subjectId: Number(data.subjectId),
        classId: data.classes.length > 0 ? Number(data.classes[0]) : undefined,
        teacherId: data.teacherId,
      },
    });

    // revalidatePath("/list/lessons");
    return { success: true, error: false, message: "Updated successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: "Failed to update lesson" };
  }
};

// DELETE ACTION
// src/lib/actions.ts

export const deleteLesson = async (
  currentState: { success: boolean; error: boolean; message: string },
  formData: FormData, // 🎯 Change this from an object to FormData
) => {
  const id = formData.get("id"); // 🎯 Extract the ID from the hidden input

  try {
    await prisma.lesson.delete({
      where: {
        id: Number(id),
      },
    });

    // Revalidate so the UI updates immediately
    // revalidatePath("/list/lessons");

    return {
      success: true,
      error: false,
      message: "Lesson deleted successfully",
    };
  } catch (err) {
    console.log(err);
    return { success: false, error: true, message: "Failed to delete lesson" };
  }
};

export const createResult = async (
  currentState: State,
  data: any,
): Promise<State> => {
  try {
    await prisma.result.create({
      data: {
        studentId: data.studentId,
        subjectId: parseInt(data.subjectId),
        academicYearId: parseInt(data.academicYearId),
        term: parseInt(data.term),
        examId: data.examId ? parseInt(data.examId) : null,
        assignmentId: data.assignmentId ? parseInt(data.assignmentId) : null,
        testScore: data.testScore ? parseInt(data.testScore) : null,
        assignmentScore: data.assignmentScore
          ? parseInt(data.assignmentScore)
          : null,
        examScore: data.examScore ? parseInt(data.examScore) : null,
        totalScore: data.totalScore ? parseInt(data.totalScore) : null,
        grade: data.grade,
        remark: data.remark,
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
  currentState: State,
  data: any,
): Promise<State> => {
  try {
    // 🎯 FIX: Remove the parseInt/isNaN check. UUIDs are not numbers.
    if (!data.id) throw new Error("Result ID is required for update");

    await prisma.result.update({
      where: {
        id: data.id, // Keep it as the string/UUID sent from the form
      },
      data: {
        studentId: data.studentId,
        subjectId: parseInt(data.subjectId),
        academicYearId: parseInt(data.academicYearId),
        term: parseInt(data.term),

        // Handle optional relations
        examId: data.examId ? parseInt(data.examId) : null,
        assignmentId: data.assignmentId ? parseInt(data.assignmentId) : null,

        // Handle Scores
        testScore: parseInt(data.testScore) || 0,
        assignmentScore: parseInt(data.assignmentScore) || 0,
        examScore: parseInt(data.examScore) || 0,
        totalScore: parseInt(data.totalScore) || 0,

        remark: data.remark,
        grade: data.grade,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error("UPDATE_RESULT_ERROR:", err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: State,
  formData: FormData,
): Promise<State> => {
  const id = formData.get("id") as string;
  try {
    await prisma.result.delete({
      where: {
        id: id, // Passing as a string because of UUID
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};
