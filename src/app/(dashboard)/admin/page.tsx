import { prisma } from "@/lib/prisma";
import AdminClientPage from "./AdminClientPage";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalenderContainer";
import { getCachedDashboardData } from "@/lib/data-fetchers";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link"; // Don't forget this import!

interface SearchParamsProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const AdminPage = async ({ searchParams }: SearchParamsProps) => {
  const resolvedSearchParams = await searchParams;
  const activeSession = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfRange = new Date();
    endOfRange.setMonth(endOfRange.getMonth() + 3);

    const { 
      studentCount, 
      teacherCount, 
      parentCount, 
      adminCount, 
      genderData, 
      announcements 
    } = await getCachedDashboardData(startOfDay, endOfRange);

    const { userId } = await auth();

    const messages = await prisma.message.findMany({
      where: { receiverId: userId! },
      include: {
        sender: { select: { username: true } }
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // --- ATTENDANCE LOGIC ---
    let finalAttendanceMap = [
      { name: "Mon", present: 0, absent: 0 },
      { name: "Tue", present: 0, absent: 0 },
      { name: "Wed", present: 0, absent: 0 },
      { name: "Thu", present: 0, absent: 0 },
      { name: "Fri", present: 0, absent: 0 },
    ];

    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - daysSinceMonday);
      lastMonday.setHours(0, 0, 0, 0);

      const attendanceRecords = await prisma.attendance.findMany({
        where: { date: { gte: lastMonday } },
        select: { date: true, present: true },
      });

      attendanceRecords.forEach((item) => {
        const itemDate = new Date(item.date);
        const dayIndex = itemDate.getDay() - 1; 
        if (dayIndex >= 0 && dayIndex < 5) {
          if (item.present) finalAttendanceMap[dayIndex].present += 1;
          else finalAttendanceMap[dayIndex].absent += 1;
        }
      });
    } catch (e) {
      console.error("Attendance fetch failed:", e);
    }

    // --- FINAL RENDER ---
    return (
      <div className="flex flex-col gap-4">
        {/* SESSION INFO BAR */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-blue-500 shadow-sm flex justify-between items-center mx-4 mt-2">
          <div>
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Academic Session</h2>
            <p className="text-xl font-black text-slate-800">{activeSession?.name || "No Active Session"}</p>
          </div>
          <Link 
            href="/admin/settings" 
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            Manage Sessions
          </Link>
        </div>

        {/* DASHBOARD CONTENT */}
        <AdminClientPage
          counts={{ studentCount, teacherCount, parentCount, adminCount }}
          searchParams={resolvedSearchParams}
          announcements={announcements}
          messages={messages as any}
          chart={<CountChartContainer data={genderData} />}
          attendanceChart={<AttendanceChartContainer data={finalAttendanceMap}/>}
          eventList={<EventCalendarContainer searchParams={searchParams} />}
        />
      </div>
    );
  } catch (error) {
    console.error("Database Fetch Error:", error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-red-500 font-bold">Dashboard Temporary Unavailable</h1>
        <p className="text-slate-500">The database is taking a moment to wake up. Please refresh.</p>
      </div>
    );
  }
};

export default AdminPage;