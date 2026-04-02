"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());
  const router = useRouter();

  useEffect(() => {
    if (value instanceof Date) {
      // Formats date to YYYY-MM-DD to keep the URL clean
      const yyyy = value.getFullYear();
      const mm = String(value.getMonth() + 1).padStart(2, '0');
      const dd = String(value.getDate()).padStart(2, '0');
      
      router.push(`?date=${yyyy}-${mm}-${dd}`);
    }
  }, [value, router]);

  return (
    <div className="rubix-calendar-wrapper">
      <Calendar 
        onChange={onChange} 
        value={value} 
        locale="en-US"
        className="!border-none !font-sans w-full"
      />

      {/* Inline styles to override the default react-calendar theme */}
      <style jsx global>{`
        .rubix-calendar-wrapper .react-calendar {
          background: transparent;
          border: none !important;
          width: 100% !important;
        }
        .rubix-calendar-wrapper .react-calendar__navigation button {
          color: #1e293b;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .rubix-calendar-wrapper .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 800;
          font-size: 0.7rem;
          color: #94a3b8;
          text-decoration: none !important;
        }
        .rubix-calendar-wrapper .react-calendar__tile--active {
          background: #C3EBFA !important; /* RubixBlue */
          color: #1e293b !important;
          border-radius: 12px;
          font-weight: 700;
        }
        .rubix-calendar-wrapper .react-calendar__tile--now {
          background: #FAE27C !important; /* RubixYellow */
          border-radius: 12px;
          color: #1e293b;
        }
        .rubix-calendar-wrapper .react-calendar__tile:hover {
          border-radius: 12px;
          background-color: #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
};

export default EventCalendar;