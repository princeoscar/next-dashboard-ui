"use client";

import { useEffect, useState, use } from "react"; // 👈 Add 'use' here
import Image from "next/image";
import EventCalendar from "./EventCalendar";

interface SchoolEvent {
  id: number | string;
  title: string;
  description: string;
  startTime: string | Date;
  endTime: string | Date;
}

interface EventCalendarContainerProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const EventCalendarContainer = ({ searchParams }: EventCalendarContainerProps) => {
  // ✅ 1. Use the 'use' hook to unwrap the promise in a Client Component
  const resolvedSearchParams = use(searchParams);
  const date = resolvedSearchParams?.date;

  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Use provided date or default to today
        const queryDate = date || new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/calendar-events?date=${queryDate}`);
        
        if (!res.ok) throw new Error("Failed to fetch events");
        
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Calendar fetch error:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [date]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
      {/* THE INTERACTIVE CALENDAR */}
      <EventCalendar />

      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mt-6 mb-4">
        <h1 className="text-lg font-bold text-slate-800">Events</h1>
        <button className="hover:bg-slate-50 p-1 rounded-full transition-colors">
          <Image src="/moreDark.png" alt="options" width={20} height={20} />
        </button>
      </div>

      {/* EVENTS LIST */}
      <div className="flex flex-col gap-4">
        {loading ? (
          // SKELETON LOADER
          [1, 2].map((i) => (
            <div key={i} className="p-5 rounded-xl border-2 border-slate-50 animate-pulse bg-slate-50/50 h-24" />
          ))
        ) : events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="p-5 rounded-xl border-2 border-gray-100 border-t-rubixSky odd:border-t-rubixPurple hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center justify-between gap-2">
                <h1 className="font-bold text-slate-700 text-sm truncate">{event.title}</h1>
                <span className="text-slate-400 text-[10px] font-bold whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md">
                  {new Date(event.startTime).toLocaleTimeString("en-UK", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-3 text-gray-500 text-xs leading-relaxed line-clamp-2">
                {event.description}
              </p>
            </div>
          ))
        ) : (
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-slate-50 p-3 rounded-full mb-2">
              <Image src="/announcement.png" alt="No events" width={24} height={24} className="opacity-20 grayscale" />
            </div>
            <p className="text-slate-400 text-xs font-medium italic">No events scheduled for this day.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendarContainer;