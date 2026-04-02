import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceMonday);
    lastMonday.setHours(0, 0, 0, 0);

    const resData = await prisma.attendance.findMany({
      where: {
        date: { gte: lastMonday },
      },
      select: {
        date: true,
        present: true,
      },
    });

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const attendanceMap: any = {
      Mon: { present: 0, absent: 0 },
      Tue: { present: 0, absent: 0 },
      Wed: { present: 0, absent: 0 },
      Thu: { present: 0, absent: 0 },
      Fri: { present: 0, absent: 0 },
    };

    resData.forEach((item: any) => {
      const itemDate = new Date(item.date);
      const day = itemDate.getDay();
      if (day >= 1 && day <= 5) {
        const dayName = daysOfWeek[day - 1];
        if (item.present) attendanceMap[dayName].present += 1;
        else attendanceMap[dayName].absent += 1;
      }
    });

    const data = daysOfWeek.map((day) => ({
      name: day,
      present: attendanceMap[day].present,
      absent: attendanceMap[day].absent,
    }));

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}