import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== "admin" && role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceMonday);
    lastMonday.setHours(0, 0, 0, 0);

    const attendanceData = await prisma.attendance.findMany({
      where: {
        date: {
          gte: lastMonday,
        },
      },
      select: {
        date: true,
        present: true,
      },
    });

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const attendanceMap = daysOfWeek.map((day) => ({
      name: day,
      present: 0,
      absent: 0,
    }));

    attendanceData.forEach((item) => {
      const itemDate = new Date(item.date);
      const dayIndex = itemDate.getDay() - 1; // 0 for Mon, 4 for Fri

      if (dayIndex >= 0 && dayIndex < 5) {
        if (item.present) {
          attendanceMap[dayIndex].present++;
        } else {
          attendanceMap[dayIndex].absent++;
        }
      }
    });

    return NextResponse.json(attendanceMap);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}