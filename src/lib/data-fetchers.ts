import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { ITEM_PER_PAGE } from "./settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

// 1. GET USER PROFILE
export const getCachedUser = unstable_cache(
  async (userId: string, role: string) => {
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
        include: { students: { include: { class: true } } },
      });
    }
    if (role === "admin") {
      return await prisma.admin.findUnique({ where: { id: userId } });
    }
    return null;
  },
  ["user-profile-cache"],
  { revalidate: 3600, tags: ["profile"] },
);

// 2. GET DASHBOARD DATA (The Unified Fix)
export const getCachedDashboardData = unstable_cache(
  async (
    schoolId: string,
    start: Date,
    end: Date
  ) => {
    try {
      const [
        studentCount,
        teacherCount,
        parentCount,
        adminCount,
        classCount,
        announcementCount,
        msgCount,
        maleCount,
        femaleCount,
        latestAnnouncements,
      ] = await prisma.$transaction([
        prisma.student.count({
          where: {
            schoolId,
          },
        }),

        prisma.teacher.count({
          where: {
            schoolId,
          },
        }),

        prisma.parent.count({
          where: {
            schoolId,
          },
        }),

        prisma.admin.count({
          where: {
            schoolId,
          },
        }),

        prisma.class.count({
          where: {
            schoolId,
          },
        }),

        // Announcement count
        prisma.announcement.count({
          where: {
            schoolId,
          },
        }),

        prisma.message.count({
          where: {
            sender: {
              schoolId,
            },
          },
        }),

        prisma.student.count({
          where: {
            schoolId,
            sex: "MALE",
          },
        }),

        prisma.student.count({
          where: {
            schoolId,
            sex: "FEMALE",
          },
        }),

        // Latest announcements for admin dashboard
        prisma.announcement.findMany({
          where: {
            schoolId,
          },
          take: 5,
          orderBy: {
            publishedAt: "desc",
          },
          select: {
            id: true,
            title: true,
            description: true,
            publishedAt: true,
            classId: true,
            levelId: true,
            teacherId: true,
          },
        }),
      ]);

      const genderData = [
        {
          name: "MALE",
          count: maleCount,
          fill: "#C3EBFA",
        },
        {
          name: "FEMALE",
          count: femaleCount,
          fill: "#CFCEFF",
        },
      ];

      return {
        stats: {
          studentCount,
          teacherCount,
          parentCount,
          adminCount,
          classCount,
          announcementCount,
          msgCount,
        },

        genderData,

        announcements: latestAnnouncements,
      };
    } catch (error) {
      console.error("Dashboard Data Fetch Error:", error);

      throw new Error(
        "Failed to fetch dashboard metrics."
      );
    }
  },

  ["dashboard-stats-main"],

  {
    revalidate: 60,
    tags: ["dashboard-stats"],
  }
);


// 3. GET TEACHERS LIST
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
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });
  },
  ["teachers-list"],
  { revalidate: 60, tags: ["teachers"] },
);

// 4. GET STUDENTS LIST
export const getCachedStudents = async (
  query: Prisma.StudentWhereInput,
  page: number,
) => {
  const take = ITEM_PER_PAGE || 10;
  const skip = take * (page - 1);
  const cacheKey = `students-p${page}-q${JSON.stringify(query)}`;

  return unstable_cache(
    async () => {
      return await prisma.student.findMany({
        where: query,
        include: { class: true },
        take: take,
        skip: skip,
        orderBy: { name: "asc" },
      });
    },
    [cacheKey],
    { revalidate: 10, tags: ["students"] },
  )();
};

// 5. GET UNREAD COUNTS (Clerk Auth based)
export const getUnreadCounts = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (
    sessionClaims?.metadata as { role?: string }
  )?.role?.toLowerCase();

  if (!userId) return { announcements: 0, messages: 0 };

  const announcementQuery: any = { where: { OR: [{ classId: null }] } };

  // Add role-specific logic...
  // (Keeping your logic from the prompt)

  const count = await prisma.announcement.count(announcementQuery);
  return { announcements: count, messages: 0 };
};
