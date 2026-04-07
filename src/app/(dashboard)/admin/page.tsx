import prisma from "@/lib/prisma";
import AdminClientPage from "./AdminClientPage";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";

interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}

const AdminPage = async ({ searchParams }: SearchParamsProps) => {
  try {
    // 1️⃣ Fetch total users by role
    const [studentCount, teacherCount, parentCount, adminCount, genderData] = await 
    Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "PARENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    
        prisma.student.groupBy({
      by: ["sex"],
      _count: true,
    }),
  ]);

    // 3️⃣ Fetch attendance data for this week for AttendanceChart
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceMonday);
    lastMonday.setHours(0, 0, 0, 0);

    const attendanceRecords = await prisma.attendance.findMany({
      where: { date: { gte: lastMonday }},
      select: { date: true, present: true },
    });

    // 4️⃣ Prepare data mapped to weekdays
    const daysOfWeekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const attendanceMap = daysOfWeekLabels.map((day) => ({
      name: day,
      present: 0,
      absent: 0,
    }));

    attendanceRecords.forEach((item) => {
      const itemDate = new Date(item.date);
      const dayIndex = itemDate.getDay() - 1; // Monday = 0
      if (dayIndex >= 0 && dayIndex < 5) {
        if (item.present) attendanceMap[dayIndex].present += 1;
        else attendanceMap[dayIndex].absent += 1;
      }
    });

    // ✅ Render AdminClientPage with prepared data
    return (
      <AdminClientPage
        counts={{ studentCount, teacherCount, parentCount, adminCount }}
        searchParams={searchParams}
        chart={<CountChartContainer data={genderData} />}
        attendanceChart={<AttendanceChartContainer data={attendanceMap} />}
      />
    );
  } catch (error) {
    console.error("Database Fetch Error:", error);
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
        <h1 className="font-bold text-lg">Database Connection Error</h1>
        <p className="text-sm">We couldn&apos;t load the dashboard stats.</p>
      </div>
    );
  }
};

export default AdminPage;