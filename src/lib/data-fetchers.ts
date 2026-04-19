import { unstable_cache } from "next/cache";
import {prisma} from "./prisma";
import { ITEM_PER_PAGE } from "./settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

export const getCachedUser = unstable_cache(
  async (userId: string, role: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (role === "teacher") {
      return await prisma.teacher.findUnique({
        where: { id: userId },
        include: { subjects: true, classes: true },
      });
    } 
    if (role === "student") {
      return await prisma.student.findUnique({
        where: { id: userId },
        include: { class: true },
      });
    } 
    if (role === "parent") {
      return await prisma.parent.findUnique({
        where: { id: userId },
        include: {
          students: { include: { class: true } },
        },
      });
    }
    if (role === "admin") {
      return await prisma.admin.findUnique({ 
        where: { id: userId } 
      });
    }
    return null;
  },
  ["user-profile-cache"],
  { revalidate: 3600, tags: ["profile"] }
);

export const getCachedTeachers = unstable_cache(
  async (queryParams: any, page: number) => {
    return await prisma.teacher.findMany({
      where: queryParams,
      include: {
        subjects: { select: { id: true, name: true } },
        classes: { select: { id: true, name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
      orderBy: { name: "asc" },
    });
  },
  ["teachers-list"],
  { revalidate: 1, tags: ["teachers"] }
);

export const getCachedCounts = unstable_cache(
  async () => {
    const [studentCount, teacherCount, parentCount, staffCount] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.parent.count(),
      prisma.admin.count(), // or your staff table
    ]);
    return { studentCount, teacherCount, parentCount, staffCount };
  },
  ["dashboard-counts"],
  { revalidate: 3600, tags: ["dashboard-stats"] }
);

export const getCachedDashboardData = unstable_cache(
  async (startOfDay: Date, endOfDay: Date) => {
    try {
      const [studentCount, teacherCount, parentCount, adminCount, rawGenderData, announcements] = 
        await Promise.all([
          prisma.student.count(),
          prisma.teacher.count(),
          prisma.parent.count(),
          prisma.admin.count(),
          prisma.student.groupBy({ 
            by: ["sex"], 
            _count: true 
          }),
          prisma.announcement.findMany({
            take: 3,
            orderBy: { date: "desc" },
          }),
        ]);

      // 🚀 TRANSFORM raw DB data into Chart format
      const boysCount = rawGenderData.find(g => g.sex === "MALE")?._count || 0;
      const girlsCount = rawGenderData.find(g => g.sex === "FEMALE")?._count || 0;

      const genderData = [
        { name: "Total", count: boysCount + girlsCount, fill: "white" },
        { name: "Boys", count: boysCount, fill: "#C3EBFA" },
        { name: "Girls", count: girlsCount, fill: "#CFCEFF" },
      ];

      return { studentCount, teacherCount, parentCount, adminCount, genderData, announcements };
    } catch (error) {
      console.error("Dashboard Cache Fetch Error:", error);
      return { 
        studentCount: 0, 
        teacherCount: 0, 
        parentCount: 0, 
        adminCount: 0, 
        genderData: [
          { name: "Total", count: 0, fill: "white" },
          { name: "Boys", count: 0, fill: "#C3EBFA" },
          { name: "Girls", count: 0, fill: "#CFCEFF" },
        ], 
        announcements: [] 
      };
    }
  },
  ["dashboard-data"],
  { revalidate: 30, tags: ["dashboard-stats"] }
);

export const getCachedAnnouncementCount = unstable_cache(
  async () => {
    try {
      return await prisma.announcement.count();
    } catch (error) {
      console.error("Database unreachable, returning fallback count:", error);
      return 0; // Return a safe fallback so the UI doesn't crash
    }
  },
  ["announcement-count"],
  { revalidate: 3600, tags: ["dashboard-stats"] }
);

export const getCachedStudents = async (query: Prisma.StudentWhereInput, page: number) => {
  // Use the actual constant from your settings
  const take = ITEM_PER_PAGE || 10;
  const skip = take * (page - 1);

  // We move the unique key generation out for clarity
  const cacheKey = `students-p${page}-q${JSON.stringify(query)}`;

  return unstable_cache(
    async () => {
      try {
        console.log("💎 Fetching students from Database..."); // Log to track DB hits
        return await prisma.student.findMany({
          where: query,
          include: { class: true },
          take: take,
          skip: skip,
          orderBy: { name: "asc" },
        });
      } catch (error) {
        console.error("Error fetching students:", error);
        return [];
      }
    },
    [cacheKey], 
    { revalidate: 10, tags: ["students"] } // 10 seconds is perfect for dev
  )();
};

export const getUnreadCounts = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  if (!userId) return { announcements: 0, messages: 0 };

  // --- ANNOUNCEMENTS LOGIC ---
  const announcementQuery: any = {
    where: {
      OR: [
        { classId: null }, // School-wide announcements
      ],
    },
  };

  if (role === "student") {
    const student = await prisma.student.findUnique({ 
      where: { id: userId }, 
      select: { classId: true } 
    });
    if (student?.classId) announcementQuery.where.OR.push({ classId: student.classId });
  } 
  
  else if (role === "teacher") {
    const teacherClasses = await prisma.class.findMany({
      where: { supervisorId: userId },
      select: { id: true }
    });
    const classIds = teacherClasses.map(c => c.id);
    announcementQuery.where.OR.push({ classId: { in: classIds } });
  }

  else if (role === "parent") {
    const children = await prisma.student.findMany({
      where: { parentId: userId },
      select: { classId: true }
    });
    const classIds = children.map(c => c.classId).filter(Boolean);
    announcementQuery.where.OR.push({ classId: { in: classIds } });
  }

  const announcementCount = await prisma.announcement.count(announcementQuery);

  return {
    announcements: announcementCount,
    messages: 0, // You can apply similar logic for messages
  };
};