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
        // Fix: Changed year to 2026 to match your current seed data
        min={new Date(2026, 3, 1, 8, 0, 0)}
        max={new Date(2026, 3, 1, 16, 0, 0)}
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
          const t = event.title.toLowerCase();

          // Default Colors (Sky Blue)
          let backgroundColor = "#EDF9FD";
          let barColor = "#C3EBFA";

          // 1. MATH & PHYSICS (Blue)
          if (t.includes("math") || t.includes("physics")) {
            backgroundColor = "#EDF9FD";
            barColor = "#C3EBFA";
          }
          // 2. ENGLISH, ECONOMICS, COMMERCE (Yellow)
          else if (t.includes("english") || t.includes("economics") || t.includes("commerce")) {
            backgroundColor = "#FEFCE8";
            barColor = "#FAE27C";
          }
          // 3. SCIENCES (Purple)
          else if (t.includes("science") || t.includes("chemistry") || t.includes("biology") || t.includes("digital")) {
            backgroundColor = "#F1F0FF";
            barColor = "#CFCEFF";
          }
          // 4. ARTS & HUMANITIES (The Pink Color!)
          else if (t.includes("history") || t.includes("government") || t.includes("literature") || t.includes("crs") || t.includes("citizen")) {
            backgroundColor = "#FFF0F3"; // Light Pink background
            barColor = "#FFD6E0";        // Darker Pink accent bar
          }

          return {
            className: "!rounded-xl shadow-sm border-none",
            style: {
              backgroundColor: backgroundColor,
              borderLeft: `5px solid ${barColor}`,
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