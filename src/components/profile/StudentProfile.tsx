"use client";

import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import { GraduationCap, TrendingUp, Award, Calendar, BookOpen, ChevronRight } from "lucide-react";

interface StudentProfileProps {
  user: User | null;
  data?: any; // Dynamic data from Prisma
}

const StudentProfile = ({ user, data }: StudentProfileProps) => {
  // Mock data for progress - in a real scenario, this comes from 'data'
  const performance = [
    { subject: "Mathematics", score: 92, color: "bg-blue-500" },
    { subject: "English Literature", score: 88, color: "bg-purple-500" },
    { subject: "Physics", score: 76, color: "bg-amber-500" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* LEFT: IDENTITY & QUICK STATS */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* IDENTITY CARD */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col items-center text-white shadow-xl relative overflow-hidden group">
          {/* Decorative background element */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
          
          <div className="relative mb-6">
            <Image
              src={user?.imageUrl || "/noAvatar.png"}
              alt="Student"
              width={110}
              height={110}
              className="rounded-[2rem] border-4 border-white/10 object-cover shadow-2xl"
            />
            <div className="absolute -bottom-2 -right-2 bg-blue-500 px-3 py-1 rounded-xl border-4 border-slate-900 text-[10px] font-black uppercase tracking-tighter">
              Student
            </div>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-center">
            {user?.fullName}
          </h2>
          
          <div className="flex items-center gap-2 mt-2 opacity-60">
            <GraduationCap size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Grade {data?.grade?.level || "10"} • Section {data?.class?.name || "A"}
            </span>
          </div>

          <div className="w-full h-px bg-white/10 my-6" />

          <div className="flex w-full justify-around">
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Attendance</p>
              <p className="text-lg font-black text-blue-400">94%</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Rank</p>
              <p className="text-lg font-black text-purple-400">#12</p>
            </div>
          </div>
        </div>

        {/* ACADEMIC SNAPSHOT */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-slate-400" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Standing</h4>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
            <div className="p-3 bg-white rounded-xl text-emerald-500 shadow-sm">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current GPA</p>
              <p className="text-xl font-black text-slate-800 tracking-tighter">3.85 / 4.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: PERFORMANCE & TIMETABLE */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex-1">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <BookOpen size={18} />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">Recent Performance</h3>
            </div>
            <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline flex items-center gap-1">
              View Report Card <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-8">
            {performance.map((item) => (
              <div key={item.subject} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-black text-slate-700">{item.subject}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Final Assessment</p>
                  </div>
                  <span className="text-sm font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 italic">
                    {item.score}%
                  </span>
                </div>
                {/* Custom Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING EVENTS MINI-SECTION */}
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white flex items-center justify-between relative overflow-hidden group cursor-pointer shadow-lg shadow-indigo-200">
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1 opacity-70">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Upcoming</span>
              </div>
              <p className="text-lg font-black tracking-tight">Final Physics Lab Examination</p>
              <p className="text-[11px] font-medium opacity-80 mt-1">Tomorrow at 09:00 AM • Lab Room 4</p>
           </div>
           <ChevronRight size={24} className="opacity-40 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-2" />
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;