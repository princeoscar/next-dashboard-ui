import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GraduationCap, Calendar as CalendarIcon, Info } from "lucide-react";

const StudentPage = async () => {
  const { userId } = await auth();

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });

  // --- 1. PREMIUM EMPTY STATE ---
  if (classItem.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 flex flex-col items-center">
          <div className="bg-rubixSky/10 p-6 rounded-3xl mb-6 text-rubixSky">
            <GraduationCap size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
            No Class Assigned
          </h1>
          <p className="text-sm text-slate-500 mt-3 max-w-sm font-medium leading-relaxed italic">
            {"It looks like you aren't enrolled in a class yet. Please reach out to the School Administrator to get your schedule set up."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex gap-8 flex-col xl:flex-row bg-slate-50/50 min-h-screen">
      
      {/* LEFT: MAIN SCHEDULE AREA */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-md relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-[-5%] right-[-5%] w-32 h-32 bg-rubixSky/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-8 bg-rubixSky rounded-full" />
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
                  Weekly Schedule
                </h1>
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-5">
                Current Roster: <span className="text-rubixSky">{classItem[0].name}</span>
              </p>
            </div>
            
            <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-slate-200 flex items-center gap-2">
              <CalendarIcon size={14} className="text-rubixSky" />
              Academic Term 2025/26
            </div>
          </div>
          
          {/* Calendar Container */}
          <div className="h-[600px] xl:h-[750px] bg-slate-50/30 rounded-[2rem] border border-slate-50 p-4">
            <BigCalendarContainer type="classId" id={classItem[0].id} />
          </div>
        </div>
      </div>

      {/* RIGHT: SIDEBAR WIDGETS */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        
        {/* EVENT CALENDAR CARD */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-1.5 h-5 bg-rubixYellow rounded-full" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">School Events</h2>
          </div>
          <EventCalendar />
        </div>

        {/* ANNOUNCEMENTS CARD */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-5 bg-rubixPurple rounded-full" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Bulletins</h2>
          </div>
          <Announcements />
        </div>

      </div>
    </div>
  );
};

export default StudentPage;