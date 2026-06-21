import { prisma } from "@/lib/prisma";
import BigCalendar from "./BigCalendar";
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
    include: { 
      subject: true,
      class: true 
    },
  });

  // Map weekday names to standard JavaScript day indices (0 = Sunday, 1 = Monday, etc.)
  const daysMap: { [key: string]: number } = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  // Get the base time context for the current week range
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // e.g., 0 for Sunday, 1 for Monday

  // 2. Format data dynamically for react-big-calendar
  const schedule = dataRes.map((item) => {
    const targetDayOfWeek = daysMap[item.day.toUpperCase()];
    
    // Calculate how many days to move forward or backward from today to reach this lesson's day
    const distance = targetDayOfWeek - currentDayOfWeek;
    
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + distance);

    // 🎯 FIX: Parse string time formats cleanly (e.g., "08:15" -> hours: 8, minutes: 15)
    // Works seamlessly whether your schema types are String or DateTime strings!
    const startTimeStr = item.startTime instanceof Date ? item.startTime.toISOString().split('T')[1] : String(item.startTime);
    const endTimeStr = item.endTime instanceof Date ? item.endTime.toISOString().split('T')[1] : String(item.endTime);

    const [startHours, startMinutes] = startTimeStr.split(":").map(Number);
    const [endHours, endMinutes] = endTimeStr.split(":").map(Number);

    const startObj = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startHours, startMinutes, 0);
    const endObj = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), endHours, endMinutes, 0);

    return {
      // Create a nice display label combining details
      title: `${item.subject?.name || "Lesson"} (${item.class?.name || ""})`,
      start: startObj,
      end: endObj,
    };
  });

  // 3. Handle Empty State
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