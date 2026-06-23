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
  const { userId } = await auth();

  const currentAdmin = await prisma.admin.findUnique({
  where: { id: userId! },
});

  // 1. Get the Active Session
  const activeSession = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
  });

  try {
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const endOfRange = new Date();
    endOfRange.setMonth(endOfRange.getMonth() + 3);

    // 2. Fetch Data
    const { stats, genderData, announcements } = await getCachedDashboardData(startOfToday, endOfRange);

    const messages = await prisma.message.findMany({
      where: { receiverId: userId! },
      include: { sender: { select: { username: true } } },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // 3. ATTENDANCE CHART LOGIC (Weekly)
    let finalAttendanceMap = [
      { name: "Mon", present: 0, absent: 0 },
      { name: "Tue", present: 0, absent: 0 },
      { name: "Wed", present: 0, absent: 0 },
      { name: "Thu", present: 0, absent: 0 },
      { name: "Fri", present: 0, absent: 0 },
    ];

    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceMonday);
    lastMonday.setHours(0, 0, 0, 0);

    const weeklyRecords = await prisma.attendance.findMany({
      where: { date: { gte: lastMonday } },
      select: { date: true, present: true },
    });

    weeklyRecords.forEach((item) => {
      const itemDate = new Date(item.date);
      const dayIndex = (itemDate.getDay() + 6) % 7;
      if (dayIndex >= 0 && dayIndex < 5) {
        if (item.present) finalAttendanceMap[dayIndex].present += 1;
        else finalAttendanceMap[dayIndex].absent += 1;
      }
    });

    // 4. ATTENDANCE OVERSIGHT LOGIC (Today's Missing Logs)
    // const allSubjectAssignments = await prisma.subject.findMany({
    //   include: {
    //     classes: { select: { id: true, name: true } },
    //     teachers: { select: { name: true, surname: true } },
    //   },
    // });

    // const todaysLogs = await prisma.attendance.findMany({
    //   where: { date: { gte: startOfToday, lte: endOfToday } },
    //   select: { subjectId: true, student: { select: { classId: true } } },
    // });

    // const submittedKeys = new Set(todaysLogs.map((log) => `${log.subjectId}-${log.student.classId}`));

    // const pending = [];
    // for (const subject of allSubjectAssignments) {
    //   for (const cls of subject.classes) {
    //     const key = `${subject.id}-${cls.id}`;
    //     if (!submittedKeys.has(key)) {
    //       pending.push({
    //         subjectName: subject.name,
    //         className: cls.name,
    //         teacher: subject.teachers[0],
    //       });
    //     }
    //   }
    // }

    return (
      <div className="flex flex-col gap-4">
        {/* SESSION INFO BAR */}
        <div className="bg-white p-4 rounded-xl border-l-4 border-blue-500 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mx-4 mt-2">
          <div>
            <h2 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Academic Session</h2>
            <p className="text-xl font-black text-slate-800 tracking-tighter">
              {activeSession?.name || "No Active Session"}
            </p>
          </div>
          <Link href="/admin/settings" className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95">
            Manage Sessions
          </Link>
        </div>



        {/* DASHBOARD CONTENT */}
        <AdminClientPage
        
          counts={{
            ...stats, // Spreads existing counts (student, teacher, etc.)
            attendanceOversight: pending, // 🎯 Pass the pending array here
          }}
          searchParams={resolvedSearchParams}
          announcements={announcements}
          messages={messages as any}

          chart={<CountChartContainer data={genderData} />}
          attendanceChart={<AttendanceChartContainer data={finalAttendanceMap} />}
          eventList={<EventCalendarContainer searchParams={searchParams} />}
        />
      </div>
    );
  } catch (error) {
    console.error("Critical Admin Page Error:", error);
    return <div className="p-8 text-center text-rose-500 font-black">SYSTEM ERROR: REFRESH PAGE</div>;
  }
};

export default AdminPage;