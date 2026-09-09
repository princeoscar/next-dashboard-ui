import { UserProfile } from "@clerk/nextjs";
import { prisma } from "./prisma";


const SettingsPage = () => (
  <div className="flex items-center justify-center p-4">
    <UserProfile routing="hash" />
  </div>
);

export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
  "/list/teachers": ["admin", "teacher"],
  "/list/students": ["admin", "teacher"],
  "/list/parents": ["admin", "teacher"],
  "/list/subjects": ["admin"],
  "/list/classes": ["admin", "teacher"],
  "/list/exams": ["admin", "teacher", "student", "parent"],
  "/list/assignments": ["admin", "teacher", "student", "parent"],
  "/list/results": ["admin", "teacher", "student", "parent"],
  "/list/attendance": ["admin", "teacher", "student", "parent"],
  "/list/events": ["admin", "teacher", "student", "parent"],
  "/list/announcements": ["admin", "teacher", "student", "parent"],
};



export const getActiveConfig = async (schoolId: string) => {
  return await prisma.academicYear.findFirst({
    where: {
      isCurrent: true,
      schoolId,
    },
  });
};

// Example Server Action: src/lib/actions/session.ts
export const activateNewSession = async (
  yearName: string,
  schoolId: string
) => {
  return await prisma.$transaction([
    prisma.academicYear.updateMany({
      where: {
        schoolId,
      },
      data: {
        isCurrent: false,
      },
    }),

    prisma.academicYear.upsert({
      where: {
        schoolId_name: {
          schoolId,
          name: yearName,
        },
      },
      update: {
        isCurrent: true,
      },
      create: {
        name: yearName,
        isCurrent: true,
        school: {
          connect: {
            id: schoolId,
          },
        },
      },
    }),
  ]);
};
