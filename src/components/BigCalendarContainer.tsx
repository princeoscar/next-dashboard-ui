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
 const dataRes = await prisma.subject.findMany({
  where: {
    ...(type === "teacherId"
      ? { 
          teachers: { 
            some: { id: id as string } 
          } 
        }
      : { 
          classes: { 
            some: { id: parseInt(id as string) } 
          } 
        }),
  },
});


  // 2. Format data for react-big-calendar with more detail
  const data = dataRes.map((item) => ({
  title: item.name,
  // We provide a dummy date since Subject doesn't have startTime/endTime
  start: new Date(new Date().setHours(9, 0, 0)), 
  end: new Date(new Date().setHours(10, 0, 0)),
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