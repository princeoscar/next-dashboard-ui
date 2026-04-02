import prisma from "@/lib/prisma";
import AdminClientPage from "./AdminClientPage";
import CountChartContainer from "@/components/CountChartContainer";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";

// Define the shape of searchParams for Next.js 14+
interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}

const AdminPage = async ({ searchParams }: SearchParamsProps) => {
  try {
    // 1. Parallel Data Fetching
    // We fetch all counts simultaneously to improve performance
    const [studentCount, teacherCount, parentCount, adminCount] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.parent.count(),
      prisma.admin.count(),
    ]);

    return (
      <AdminClientPage 
        counts={{ 
          studentCount, 
          teacherCount, 
          parentCount, 
          adminCount 
        }} 
        searchParams={searchParams}
        // Passing Containers as React Nodes (Slots)
        chart={<CountChartContainer />} 
        attendanceChart={<AttendanceChartContainer />}
      />
    );
  } catch (error) {
    console.error("Database Fetch Error:", error);
    
    // Fallback UI in case Prisma fails (optional, or let Next.js error.tsx handle it)
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
        <h1 className="font-bold text-lg">Database Connection Error</h1>
        <p className="text-sm">We couldn&apos;t load the dashboard stats. Please ensure your database is running.</p>
      </div>
    );
  }
};

export default AdminPage;