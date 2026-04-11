import {prisma} from "@/lib/prisma";
import { CheckCircle2, AlertCircle } from "lucide-react";

const TeacherAttendanceCard = async ({ id }: { id: string }) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // 1. Fetch count of all lessons assigned to this teacher
  const totalAssignedLessons = await prisma.lesson.count({
    where: { teacherId: id },
  });

  // 2. Fetch lessons where at least one attendance record exists (Lessons Conducted)
  const conductedLessonsCount = await prisma.lesson.count({
    where: {
      teacherId: id,
      attendances: {
        some: {
          date: { gte: startOfYear },
        },
      },
    },
  });

  const percentage = totalAssignedLessons > 0 
    ? Math.round((conductedLessonsCount / totalAssignedLessons) * 100) 
    : 0;

  // Visual logic for colors
  const isHighAttendance = percentage >= 90;
  const statusColor = isHighAttendance ? "text-emerald-500" : "text-rubixYellow";

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-xl ${isHighAttendance ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {isHighAttendance ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Annual Metric
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h2 className={`text-3xl font-black tracking-tighter ${statusColor}`}>
            {totalAssignedLessons > 0 ? `${percentage}%` : "--"}
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-1">
            Duty Attendance
          </p>
        </div>

        {/* MINI VISUAL CHART */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={125}
              strokeDashoffset={125 - (125 * percentage) / 100}
              className={`${statusColor} transition-all duration-1000 ease-out`}
            />
          </svg>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50">
        <p className="text-[10px] text-slate-400 font-medium">
          <span className="font-black text-slate-700">{conductedLessonsCount}</span> of {totalAssignedLessons} sessions recorded
        </p>
      </div>
    </div>
  );
};

export default TeacherAttendanceCard;