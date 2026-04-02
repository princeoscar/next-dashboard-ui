import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth } from "@clerk/nextjs/server";
import { Calendar as CalendarIcon, ClipboardList, GraduationCap, Users, BookOpen } from "lucide-react";
import Link from "next/link";

const TeacherPage = async () => {
  const { userId } = await auth();

  return (
    <div className="p-8 flex gap-8 flex-col xl:flex-row bg-slate-50/50 min-h-screen">
      
      {/* LEFT: MAIN SCHEDULE AREA */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-md relative overflow-hidden">
          {/* Subtle design accent */}
          <div className="absolute top-[-5%] left-[-5%] w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
                  Teacher Schedule
                </h1>
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-5">
                Current Status: <span className="text-indigo-500">Live Session Active</span>
              </p>
            </div>
            
            <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-slate-200 flex items-center gap-2">
              <CalendarIcon size={14} className="text-indigo-400" />
              Faculty Timetable
            </div>
          </div>

          {/* Calendar Container */}
          <div className="h-[700px] xl:h-[800px] bg-slate-50/30 rounded-[2rem] border border-slate-50 p-4">
            <BigCalendarContainer type="teacherId" id={userId!} />
          </div>
        </div>
      </div>

      {/* RIGHT: SIDEBAR */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        
        {/* QUICK ACTIONS SECTION */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-5 bg-rubixSky rounded-full" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Teacher Tools</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <TeacherToolLink href="/list/classes" icon={<Users size={16}/>} label="My Classes" color="bg-sky-50 text-sky-700" />
            <TeacherToolLink href="/list/students" icon={<GraduationCap size={16}/>} label="Student List" color="bg-purple-50 text-purple-700" />
            <TeacherToolLink href="/list/lessons" icon={<BookOpen size={16}/>} label="Lesson Plan" color="bg-yellow-50 text-yellow-700" />
            <TeacherToolLink href="/list/assignments" icon={<ClipboardList size={16}/>} label="Assignments" color="bg-rose-50 text-rose-700" />
          </div>
        </div>

        {/* ANNOUNCEMENTS SECTION */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-5 bg-rubixPurple rounded-full" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">School Bulletins</h2>
          </div>
          <Announcements />
        </div>
        
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const TeacherToolLink = ({ href, icon, label, color }: { href: string; icon: any; label: string; color: string }) => (
  <Link 
    href={href} 
    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[1.5rem] transition-all hover:-translate-y-1 active:scale-95 border border-transparent hover:border-slate-100 ${color}`}
  >
    <div className="p-3 bg-white/50 rounded-xl shadow-sm">
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-wider text-center">{label}</span>
  </Link>
);

export default TeacherPage;