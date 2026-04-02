import prisma from "@/lib/prisma";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
  const now = new Date();
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // 1. Fetch Year-to-Date Attendance
  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: id,
      date: { gte: firstDayOfYear },
    },
    orderBy: { date: "asc" },
  });

  const totalDays = attendance.length;
  const presentDays = attendance.filter((day) => day.present).length;
  const totalPercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // 2. Trend Logic
  const currentMonthData = attendance.filter((a) => a.date >= startOfCurrentMonth);
  const lastMonthData = attendance.filter(
    (a) => a.date >= startOfLastMonth && a.date < startOfCurrentMonth
  );

  const getRate = (data: any[]) =>
    data.length > 0 ? (data.filter((d) => d.present).length / data.length) * 100 : 0;

  const thisMonthRate = getRate(currentMonthData);
  const lastMonthRate = getRate(lastMonthData);
  const trend = thisMonthRate - lastMonthRate;

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <Activity size={18} />
        </div>
        
        {/* TREND BADGE */}
        {totalDays > 0 && lastMonthData.length > 0 && (
          <div 
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
              trend > 0 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                : trend < 0 
                ? "bg-rose-50 text-rose-600 border border-rose-100" 
                : "bg-slate-50 text-slate-400 border border-slate-100"
            }`}
          >
            {trend > 0 ? <TrendingUp size={10} /> : trend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
            {Math.abs(Math.round(trend))}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
          {totalDays > 0 ? `${totalPercentage}%` : "—"}
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Annual Attendance
          </span>
          <span className="text-[9px] font-bold text-slate-300 italic">
            {presentDays}/{totalDays} Days
          </span>
        </div>
      </div>

      {/* MINI VISUAL PROGRESS BAR */}
      <div className="mt-5 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-1000"
          style={{ width: `${totalPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default StudentAttendanceCard;