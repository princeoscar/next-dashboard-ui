import {prisma} from "@/lib/prisma";
import BigCalendar from "./BigCalendar";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";
import { CalendarOff } from "lucide-react";

interface BigCalendarContainerProps {
  type: "teacherId" | "classId";
  id: string | number;
}

const BigCalendarContainer = async ({
  type,
  id,
}: BigCalendarContainerProps) => {
  
  // 1. Fetch Lessons with related Subject & Class info for better labels
 const dataRes = await prisma.lesson.findMany({
  where: {
    ...(type === "teacherId" ? { teacherId: id as string } : { classId: parseInt(id as string) }),
  },
  include: { subject: true },
});

const dayToDate: { [key: string]: number } = {
  MONDAY: 4,
  TUESDAY: 5,
  WEDNESDAY: 6,
  THURSDAY: 7,
  FRIDAY: 8,
};

  // 2. Format data for react-big-calendar with more detail
  const data = dataRes.map((item) => {
  const dayNum = dayToDate[item.day as keyof typeof dayToDate] || 4;
  
  // We extract the hours and minutes from the database Date object
  const startHours = item.startTime.getHours();
  const startMinutes = item.startTime.getMinutes();
  const endHours = item.endTime.getHours();
  const endMinutes = item.endTime.getMinutes();

  return {
    title: item.name,
    // We force the Year (2026), Month (4 = May), and Day (4-8)
    // IMPORTANT: No "Z" at the end, so it stays local time
    start: new Date(2026, 4, dayNum, startHours, startMinutes),
    end: new Date(2026, 4, dayNum, endHours, endMinutes),
  };
});

  // 3. Normalize the dates to the current viewing week
  const schedule = adjustScheduleToCurrentWeek(data);

  // 4. Handle Empty State
  if (schedule.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-8">
        <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
          <CalendarOff className="text-slate-300" size={32} />
        </div>
        <h3 className="text-slate-800 font-bold">No Lessons Found</h3>
        <p className="text-xs text-slate-400 text-center mt-2 max-w-[200px]">
          There are no scheduled sessions for this {type === "teacherId" ? "teacher" : "class"} this week.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;