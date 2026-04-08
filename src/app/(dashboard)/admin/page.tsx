import prisma from "@/lib/prisma";
import AdminClientPage from "./AdminClientPage";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";

interface SearchParamsProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const AdminPage = async ({ searchParams }: SearchParamsProps) => {
  // Await searchParams as per Next.js 15+ requirements
  const resolvedSearchParams = await searchParams;

  try {
    // 1️⃣ Fetch total users and gender data in parallel
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

    // 2️⃣ Optimized Date Logic for the current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    
    // Adjust to find Last Monday
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceMonday);
    lastMonday.setHours(0, 0, 0, 0);

    // 3️⃣ Fetch attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: { 
        date: { 
          gte: lastMonday 
        } 
      },
      select: { 
        date: true, 
        present: true 
      },
    });

    // 4️⃣ Map data to weekdays for the chart
    const daysOfWeekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const attendanceMap = daysOfWeekLabels.map((day) => ({
      name: day,
      present: 0,
      absent: 0,
    }));

    attendanceRecords.forEach((item) => {
      const itemDate = new Date(item.date);
      // getDay() returns 0 for Sunday, 1 for Monday
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
        chart={<CountChartContainer data={genderData} />}
        attendanceChart={<AttendanceChartContainer data={attendanceMap} />}
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
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }
};

export default AdminPage;