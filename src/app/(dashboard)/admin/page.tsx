import prisma from "@/lib/prisma";
import AdminClientPage from "./AdminClientPage";
import CountChartContainer from "@/components/CountChartContainer";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";



interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}

const AdminPage = async ({ searchParams }: SearchParamsProps) => {
  try {
    const [studentCount, teacherCount, parentCount, adminCount] = await Promise.all([
     prisma.user.count({ where: { role: "STUDENT" } }),
  prisma.user.count({ where: { role: "TEACHER" } }),
  prisma.user.count({ where: { role: "PARENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
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