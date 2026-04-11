import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

 export const runtime = "nodejs";

export async function GET() {
 
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Define role-based visibility conditions
  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  try {
    const data = await prisma.announcement.findMany({
      take: 3,
      orderBy: { date: "desc" },
      where: {
        ...(role !== "admin" && {
          OR: [
            { classId: null }, // Global announcements
            { class: roleConditions[role as keyof typeof roleConditions] || {} },
          ],
        }),
      },
    });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}