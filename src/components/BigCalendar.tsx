"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
}

const BigCalendar = ({ data }: { data: CalendarEvent[] }) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    <div className="h-full rubix-big-calendar">
      <Calendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        views={["work_week", "day"]}
        view={view}
        style={{ height: "100%" }}
        onView={handleOnChangeView}
        // Focus school hours: 8:00 AM to 5:00 PM
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 17, 0, 0)}
        messages={{ work_week: "School Week", day: "Daily View" }}
        formats={{
          timeGutterFormat: "HH:mm",
        }}
        // Custom styling for the event blocks
        eventPropGetter={() => ({
          className: "!bg-rubixSky/20 !border-l-4 !border-l-rubixSky !border-t-0 !border-b-0 !border-r-0 !rounded-lg !text-slate-700 !font-bold !text-xs shadow-sm",
          style: { outline: 'none' }
        })}
      />

      <style jsx global>{`
        /* Modernizing the Calendar UI */
        .rubix-big-calendar .rbc-header {
          padding: 15px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 0.75rem !important;
          color: #64748b !important;
          border-bottom: 2px solid #f1f5f9 !important;
        }
        .rubix-big-calendar .rbc-time-content {
          border-top: none !important;
        }
        .rubix-big-calendar .rbc-time-gutter .rbc-timeslot-group {
          font-size: 0.7rem !important;
          font-weight: 700 !important;
          color: #94a3b8 !important;
        }
        .rubix-big-calendar .rbc-current-time-indicator {
          background-color: #ef4444 !important;
          height: 2px !important;
        }
        .rubix-big-calendar .rbc-today {
          background-color: #f8fafc !important;
        }
        .rubix-big-calendar .rbc-btn-group button {
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          border-radius: 8px !important;
          margin: 0 2px !important;
          border: 1px solid #e2e8f0 !important;
          color: #64748b !important;
        }
        .rubix-big-calendar .rbc-btn-group button.rbc-active {
          background-color: #1e293b !important;
          color: white !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default BigCalendar;