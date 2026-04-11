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
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
  });

  // 2. Format data for react-big-calendar
  // We use the lesson name as the title, or fallback to the ID
  const data = dataRes.map((lesson) => ({
    title: lesson.name,
    start: lesson.startTime,
    end: lesson.endTime,
  }));

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