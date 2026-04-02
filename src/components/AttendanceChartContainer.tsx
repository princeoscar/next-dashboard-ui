import Image from "next/image";
import prisma from "@/lib/prisma";
import AttendanceChart from "./AttendanceChart";

const AttendanceChartContainer = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  
  // Calculate days since the most recent Monday
  // If it's Sunday (0), we go back 6 days. Otherwise, (day - 1).
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysSinceMonday);
  lastMonday.setHours(0, 0, 0, 0);

  // 1. Fetch attendance records from this week (Monday onwards)
  const attendanceData = await prisma.attendance.findMany({
    where: {
      date: {
        gte: lastMonday,
      },
    },
    select: {
      date: true,
      present: true,
    },
  });

  // 2. Initialize the Weekly Map
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  
  const attendanceMap = daysOfWeek.map((day) => ({
    name: day,
    present: 0,
    absent: 0,
  }));

  // 3. Populate the Map with DB results
  attendanceData.forEach((item) => {
    const itemDate = new Date(item.date);
    const dayIndex = itemDate.getDay() - 1; // Adjusting for 0-indexed Monday

    // We only track Monday (0) through Friday (4)
    if (dayIndex >= 0 && dayIndex < 5) {
      if (item.present) {
        attendanceMap[dayIndex].present += 1;
      } else {
        attendanceMap[dayIndex].absent += 1;
      }
    }
  });

  return (
    <div className="bg-white rounded-2xl p-4 h-full flex flex-col justify-between shadow-sm border border-slate-50">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-slate-800">Weekly Attendance</h1>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Monday - Friday
          </span>
        </div>
        <button className="hover:bg-slate-50 p-1 rounded-full transition-colors">
          <Image src="/moreDark.png" alt="more" width={20} height={20} />
        </button>
      </div>

      {/* CHART AREA */}
      <div className="flex-1 w-full min-h-[300px]">
        <AttendanceChart data={attendanceMap} />
      </div>
      
      {/* BOTTOM LEGEND/STATS (Optional but adds value) */}
      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rubixYellow rounded-sm" />
          <span className="text-[10px] text-gray-500 font-bold uppercase">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rubixPurple rounded-sm" />
          <span className="text-[10px] text-gray-500 font-bold uppercase">Absent</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChartContainer;