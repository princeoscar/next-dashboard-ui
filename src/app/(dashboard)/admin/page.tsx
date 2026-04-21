import { prisma } from "@/lib/prisma";
import AdminClientPage from "./AdminClientPage";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalenderContainer";
import { getCachedDashboardData } from "@/lib/data-fetchers";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

interface SearchParamsProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const AdminPage = async ({ searchParams }: SearchParamsProps) => {
  const resolvedSearchParams = await searchParams;
  
  // 1. Get the Active Session
  const activeSession = await prisma.academicYear.findFirst({ 
    where: { isCurrent: true } 
  });
  
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfRange = new Date();
    endOfRange.setMonth(endOfRange.getMonth() + 3);

    // 2. Fetch Cached Data (Destructure 'stats')
    const { 
      stats, 
      genderData, 
      announcements 
    } = await getCachedDashboardData(startOfDay, endOfRange);

    const { userId } = await auth();

    // 3. Fetch Recent Messages
    const messages = await prisma.message.findMany({
      where: { receiverId: userId! },
      include: {
        sender: { select: { username: true } }
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // 4. Attendance Logic (Simplified)
    let finalAttendanceMap = [
      { name: "Mon", present: 0, absent: 0 },
      { name: "Tue", present: 0, absent: 0 },
      { name: "Wed", present: 0, absent: 0 },
      { name: "Thu", present: 0, absent: 0 },
      { name: "Fri", present: 0, absent: 0 },
    ];

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
      const dayIndex = (itemDate.getDay() + 6) % 7; // Sync Monday to 0
      if (dayIndex >= 0 && dayIndex < 5) {
        if (item.present) finalAttendanceMap[dayIndex].present += 1;
        else finalAttendanceMap[dayIndex].absent += 1;
      }
    });

    return (
      <div className="flex flex-col gap-4">
        {/* SESSION INFO BAR - MOBILE FRIENDLY */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-blue-500 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mx-4 mt-2 transition-all">
          <div>
            <h2 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Academic Session</h2>
            <p className="text-xl font-black text-slate-800 tracking-tighter">
              {activeSession?.name || "No Active Session"}
            </p>
          </div>
          <Link 
            href="/admin/settings" 
            className="w-full sm:w-auto bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all text-center shadow-sm active:scale-95"
          >
            Manage Sessions
          </Link>
        </div>

        {/* DASHBOARD CONTENT */}
        <AdminClientPage
          counts={stats} // stats contains all counts
          searchParams={resolvedSearchParams}
          announcements={announcements}
          messages={messages as any}
          chart={<CountChartContainer data={genderData as { name: string; count: number; fill: string }[]} />}
          attendanceChart={<AttendanceChartContainer data={finalAttendanceMap}/>}
          eventList={<EventCalendarContainer searchParams={searchParams} />}
        />
      </div>
    );
  } catch (error) {
    console.error("Critical Admin Page Error:", error);
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 max-w-md">
           <h1 className="text-rose-500 font-black text-xl uppercase tracking-tighter mb-2">System Under Load</h1>
           <p className="text-slate-500 text-sm font-medium">The database is currently syncing. Please try refreshing in 10 seconds.</p>
           <button onClick={() => window.location.reload()} className="mt-4 text-[10px] font-black uppercase bg-rose-500 text-white px-6 py-2 rounded-lg">Refresh Now</button>
        </div>
      </div>
    );
  }
};

export default AdminPage;