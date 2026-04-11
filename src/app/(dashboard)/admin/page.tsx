import {prisma} from "@/lib/prisma";
import AdminClientPage from "./AdminClientPage";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventList from "@/components/EventList"; // 👈 Import your clean component
import { auth } from "@clerk/nextjs/server"; // 👈 Import Clerk
import EventCalendarContainer from "@/components/EventCalenderContainer";

interface SearchParamsProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const AdminPage = async ({ searchParams }: SearchParamsProps) => {
  const resolvedSearchParams = await searchParams;
  const { date } = resolvedSearchParams; // Get date for the event list
  const { userId } = await auth(); // Get current user for RBAC

  try {
    // 1️⃣ Fetch everything in parallel (Added eventData here)
    const eventDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(eventDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(eventDate);
    endOfDay.setHours(23, 59, 59, 999);

   

    const [studentCount, teacherCount, parentCount, adminCount, genderData, eventData, announcements] = await 
    Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.parent.count(),
      prisma.admin.count(),
      prisma.student.groupBy({by: ["sex"], _count: true,}),
      prisma.event.findMany({// Fetching events here instead of inside the component!
        where: {
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.announcement.findMany({ // 👈 Fetch it here
    take: 3,
    orderBy: { date: "desc" },
  }),
    ]);

    // 2️⃣ Optimized Date Logic for the attendance chart (Leave this as is)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceMonday);
    lastMonday.setHours(0, 0, 0, 0);

    // 3️⃣ Fetch attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: { date: { gte: lastMonday } },
      select: { date: true, present: true },
    });

    // 4️⃣ Map data to weekdays
    const daysOfWeekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const attendanceMap = daysOfWeekLabels.map((day) => ({
      name: day,
      present: 0,
      absent: 0,
    }));

    attendanceRecords.forEach((item) => {
      const itemDate = new Date(item.date);
      const dayIndex = itemDate.getDay() - 1; 
      if (dayIndex >= 0 && dayIndex < 5) {
        if (item.present) {
          attendanceMap[dayIndex].present += 1;
        } else {
          attendanceMap[dayIndex].absent += 1;
        }
      }
    });

    // ✅ Render AdminClientPage
    return (
      <AdminClientPage
        counts={{ studentCount, teacherCount, parentCount, adminCount }}
        searchParams={resolvedSearchParams}
        announcements={announcements}
        chart={<CountChartContainer data={genderData} />}
        attendanceChart={<AttendanceChartContainer data={attendanceMap}/>}
        eventList={<EventCalendarContainer searchParams={searchParams} />}
      />
    );
  } catch (error) {
    console.error("Database Fetch Error:", error);
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white border border-rose-100 rounded-[2rem] shadow-sm text-center">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <span className="text-rose-600 text-xl font-bold">!</span>
          </div>
          <h1 className="font-bold text-slate-800 text-lg">System Sync Issue</h1>
          <p className="text-slate-500 text-sm mt-2">
            We&apos;re having trouble reaching the database. Please check your connection and refresh.
          </p>
          <a 
            href="/admin"
            className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Retry Connection
          </a>
        </div>
      </div>
    );
  }
};

export default AdminPage;