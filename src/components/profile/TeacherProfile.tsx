"use client";

import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import { 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  GraduationCap, 
  Mail, 
  Users, 
  ChevronRight,
  Sparkles,
  Layers
} from "lucide-react";

interface TeacherProfileProps {
  user: User | null;
  teacherData?: {
    employeeId: string;
    department: string;
    phone: string;
    subjects: string[];
    classes: { name: string; students: number; lessons: number }[];
  };
}

const TeacherProfile = ({ user, teacherData }: TeacherProfileProps) => {
  const classes = teacherData?.classes || [
    { name: "Grade 10-A", students: 32, lessons: 4 },
    { name: "Grade 11-C", students: 28, lessons: 5 },
    { name: "Grade 9-B", students: 35, lessons: 3 },
  ];

  const subjects = teacherData?.subjects || ["Pure Mathematics", "Quantum Physics", "Statistics"];

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* LEFT COLUMN: IDENTITY & SPECIALIZATION */}
      <div className="w-full lg:w-[380px] flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center relative overflow-hidden group">
          {/* Header Accent */}
          <div className="absolute top-0 left-0 w-full h-32 bg-slate-900 transition-all duration-500 group-hover:h-36" />
          
          <div className="relative z-10">
            <div className="relative inline-block mt-4">
              <Image
                src={user?.imageUrl || "/noAvatar.png"}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-[2.8rem] mx-auto border-8 border-white shadow-2xl mb-6 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute bottom-6 right-2 bg-emerald-500 w-6 h-6 rounded-2xl border-4 border-white shadow-lg animate-pulse" title="Active Session" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{user?.fullName}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
               <Sparkles size={12} className="text-indigo-500" />
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                 {teacherData?.department || "Department Head • Science"}
               </p>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm"><Mail size={14} className="text-slate-400" /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Official Email</span>
              </div>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[140px] italic">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm"><GraduationCap size={14} className="text-indigo-500" /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Faculty ID</span>
              </div>
              <span className="text-xs font-black text-slate-800">{teacherData?.employeeId || "EDU-2026-99"}</span>
            </div>
          </div>

          {/* SUBJECT TAGS */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {subjects.map(sub => (
              <span key={sub} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200/50">
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: WORKLOAD & TOOLS */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* WORKLOAD SECTION */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex-1">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                <Layers size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">Classroom Management</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Active Academic Load • Semester 2</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
               <Users size={14} className="text-indigo-600" />
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                {classes.reduce((acc, c) => acc + c.students, 0)} Total Students
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div 
                key={cls.name} 
                className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:bg-slate-900 transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <BookOpen size={80} />
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-black text-slate-800 group-hover:text-white transition-colors">{cls.name}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest group-hover:text-indigo-400 transition-colors mt-1">
                        Lectures: {cls.lessons} / Week
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded-xl group-hover:bg-slate-800 transition-colors shadow-sm">
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-white" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 group-hover:border-slate-700 transition-colors">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-slate-400">
                      Roster Size
                    </span>
                    <span className="text-sm font-black text-slate-800 group-hover:text-indigo-400">
                      {cls.students}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button className="group flex items-center justify-between px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] transition-all duration-300 shadow-xl shadow-indigo-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl"><Calendar size={20} /></div>
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-widest">Timetable</p>
                <p className="text-[10px] opacity-70 font-medium">View Schedule</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-40 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-2" />
          </button>

          <button className="group flex items-center justify-between px-8 py-6 bg-white hover:bg-slate-900 hover:text-white text-slate-800 rounded-[2rem] transition-all duration-300 border border-slate-100 shadow-sm shadow-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 group-hover:bg-white/10 rounded-2xl transition-colors"><CheckSquare size={20} className="text-indigo-600 group-hover:text-white" /></div>
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-widest">Attendance</p>
                <p className="text-[10px] text-slate-400 font-medium group-hover:text-white/70">Mark Records</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;