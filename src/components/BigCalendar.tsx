"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);

const BigCalendar = ({
  data,
}: {
  data: { title: string; start: Date; end: Date }[];
}) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  // 🎯 FIX 1: Smart Real-Time Check + Sunday Look-Ahead
  const getInitialDate = () => {
    const today = new Date();
    
    // If today is Sunday (0), automatically fast-forward by 1 day to show Monday's schedule
    if (today.getDay() === 0) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow;
    }
    
    return today;
  };

  // Turn it into an active controlled component state
  const [currentDate, setCurrentDate] = useState<Date>(getInitialDate());

  return (
    <div className="h-full rubix-big-calendar font-sans">
      <Calendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        views={["work_week", "day"]}
        view={view}
        onView={(v) => setView(v)}
        style={{ height: "100%" }}

        // 🎯 FIX 2: Swapped static defaultDate for dynamic controlled properties
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)} // 👈 Keeps header arrows working!

        // Adjust Min/Max window settings dynamically using the currently viewed date context
        min={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 7, 0, 0)}
        max={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 18, 0, 0)}
        
        messages={{ work_week: "School Week", day: "Daily" }}
        formats={{ timeGutterFormat: "HH:mm" }}
        components={{
          event: ({ event }: any) => (
            <div className="flex flex-col h-full py-1">
              <span className="text-[9px] uppercase font-bold opacity-70">
                {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
              </span>
              <span className="text-xs font-black truncate">{event.title}</span>
            </div>
          ),
        }}

        eventPropGetter={(event) => {
          const title = event.title.toLowerCase();

          const themes = {
            blue: { bg: "#EDF9FD", bar: "#C3EBFA" },
            yellow: { bg: "#FEFCE8", bar: "#FAE27C" },
            purple: { bg: "#F1F0FF", bar: "#CFCEFF" },
            pink: { bg: "#FFF0F3", bar: "#FFD6E0" },
          };

          let theme = themes.blue; // Default

          if (["english", "economics", "commerce"].some(k => title.includes(k))) {
            theme = themes.yellow;
          } else if (["science", "chemistry", "biology", "digital"].some(k => title.includes(k))) {
            theme = themes.purple;
          } else if (["history", "government", "literature", "crs", "citizen"].some(k => title.includes(k))) {
            theme = themes.pink;
          } else if (["math", "physics"].some(k => title.includes(k))) {
            theme = themes.blue;
          }

          return {
            className: "!rounded-xl shadow-sm border-none",
            style: {
              backgroundColor: theme.bg,
              borderLeft: `5px solid ${theme.bar}`,
              color: "#1e293b",
            }
          };
        }}
      />

      <style jsx global>{`
        .rubix-big-calendar .rbc-time-view { border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; }
        .rubix-big-calendar .rbc-header { padding: 12px !important; font-weight: 900 !important; color: #64748b !important; font-size: 0.75rem !important; border-bottom: 1px solid #f1f5f9 !important; }
        .rubix-big-calendar .rbc-timeslot-group { min-height: 80px !important; border-bottom: 1px solid #f8fafc !important; }
        .rubix-big-calendar .rbc-time-gutter .rbc-label { font-size: 0.7rem !important; font-weight: 700 !important; color: #94a3b8 !important; padding: 0 10px; }
        .rubix-big-calendar .rbc-event { padding: 0 !important; margin: 2px !important; }
        .rubix-big-calendar .rbc-today { background-color: #f8fafc !important; }
        .rubix-big-calendar .rbc-event-content { padding: 4px 8px !important; }
      `}</style>
    </div>
  );
};

export default BigCalendar;