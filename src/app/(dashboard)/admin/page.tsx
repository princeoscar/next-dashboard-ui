import prisma from "@/lib/prisma";
import AdminClientPage from "./AdminClientPage";
// 1. Import 'dynamic' from Next.js
import dynamic from "next/dynamic";

// 2. Replace static imports with dynamic imports
const CountChartContainer = dynamic(() => import("@/components/CountChartContainer"), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-xl" /> // Optional loading state
});

const AttendanceChartContainer = dynamic(() => import("@/components/AttendanceChartContainer"), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-xl" />
});

interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}

const AdminPage = async ({ searchParams }: SearchParamsProps) => {
  try {
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
        // These are now the dynamic versions!
        chart={<CountChartContainer />} 
        attendanceChart={<AttendanceChartContainer />}
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