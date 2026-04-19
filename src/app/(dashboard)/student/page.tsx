import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GraduationCap, Calendar as CalendarIcon } from "lucide-react";

const StudentPage = async () => {
  const { userId } = await auth();

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });

  if (classItem.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 flex flex-col items-center">
          <div className="bg-rubixSky/10 p-6 rounded-3xl mb-6 text-rubixSky">
            <GraduationCap size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
            No Class Assigned
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-3 max-w-sm font-medium leading-relaxed italic">
            {"It looks like you aren't enrolled in a class yet. Please reach out to the School Administrator to get your schedule set up."}
          </p>
        </div>
      </div>
    );
  }

  return (
    // Change: Responsive padding (p-4 on mobile, p-8 on desktop)
    <div className="p-4 md:p-8 flex gap-6 md:gap-8 flex-col xl:flex-row bg-slate-50/50 min-h-screen">
      
      {/* LEFT: MAIN SCHEDULE AREA */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6 md:gap-8">
        {/* Change: p-6 on mobile, p-10 on desktop */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-32 h-32 bg-rubixSky/5 rounded-full blur-3xl" />
          
          {/* Header section: Mobile-optimized spacing */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-1">
                <div className="w-1.5 h-6 md:w-2 md:h-8 bg-rubixSky rounded-full" />
                <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase">
                  Weekly Schedule
                </h1>
              </div>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-4 md:ml-5">
                Current Roster: <span className="text-rubixSky">{classItem[0].name}</span>
              </p>
            </div>
            
            {/* Session Badge: Smaller and centered on mobile */}
            <div className="self-start md:self-center bg-slate-900 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-slate-200 flex items-center gap-2">
              <CalendarIcon size={12} className="text-rubixSky" />
              Academic Term 2025/26
            </div>
          </div>
          
          {/* Calendar Container: Dynamic height for mobile */}
          <div className="h-[500px] sm:h-[600px] xl:h-[750px] bg-slate-50/30 rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 p-2 md:p-4">
            <BigCalendarContainer type="classId" id={classItem[0].id} />
          </div>
        </div>
      </div>

      {/* RIGHT: SIDEBAR WIDGETS */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6 md:gap-8">
        
        {/* EVENT CALENDAR CARD */}
        <div className="bg-white p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-4 md:h-5 bg-rubixYellow rounded-full" />
            <h2 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest">School Events</h2>
          </div>
          <EventCalendar />
        </div>

        {/* ANNOUNCEMENTS CARD */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex-1">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-1.5 h-4 md:h-5 bg-rubixPurple rounded-full" />
            <h2 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest">Bulletins</h2>
          </div>
          <Announcements data={[]}/>
        </div>

      </div>
    </div>
  );
};

export default StudentPage;