"use client";

import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import { UserRound, Users, GraduationCap, BookOpen, ShieldCheck, Zap, Activity } from "lucide-react";

interface AdminProfileProps {
  user: User | null;
  systemStats?: {
    students: number;
    teachers: number;
    classes: number;
    courses: number;
  };
}

const AdminProfile = ({ user, systemStats }: AdminProfileProps) => {
  // Stats mapping with dynamic formatting
  const stats = [
    { 
      label: "Total Students", 
      value: systemStats?.students?.toLocaleString() || "0", 
      icon: <Users size={20}/>, 
      color: "bg-blue-50 text-blue-600",
      accent: "group-hover:bg-blue-600"
    },
    { 
      label: "Total Teachers", 
      value: systemStats?.teachers?.toLocaleString() || "0", 
      icon: <UserRound size={20}/>, 
      color: "bg-purple-50 text-purple-600",
      accent: "group-hover:bg-purple-600"
    },
    { 
      label: "Active Classes", 
      value: systemStats?.classes?.toLocaleString() || "0", 
      icon: <GraduationCap size={20}/>, 
      color: "bg-orange-50 text-orange-600",
      accent: "group-hover:bg-orange-600"
    },
    { 
      label: "Courses", 
      value: systemStats?.courses?.toLocaleString() || "0", 
      icon: <BookOpen size={20}/>, 
      color: "bg-green-50 text-green-600",
      accent: "group-hover:bg-green-600"
    },
  ];

  if (!user) {
    return (
      <div className="w-full h-[200px] bg-slate-100 animate-pulse rounded-[2rem]" />
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-700">
      
      {/* IDENTITY CARD */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden group border border-white/5">
        
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] group-hover:bg-sky-500/20 transition-all duration-1000" />
        <div className="absolute bottom-[-10%] left-[-5%] w-60 h-60 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-1000 delay-150" />
        
        {/* Profile Image Container */}
        <div className="relative z-20">
          <div className="relative w-[140px] h-[140px] md:w-[120px] md:h-[120px]">
            <Image
              src={user.imageUrl || "/noAvatar.png"}
              alt="Admin Profile"
              fill
              className="rounded-[2.5rem] border-4 border-white/10 object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl border-4 border-slate-900 shadow-xl">
              <ShieldCheck size={18} className="text-white" />
            </div>
          </div>
        </div>

        {/* Identity Text */}
        <div className="flex-1 text-center md:text-left z-20">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center md:justify-start gap-3">
               <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                {user.fullName || "System Admin"}
              </h2>
              <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-400">System Live</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
              <Zap size={12} className="text-sky-400 fill-sky-400" />
              <p className="text-sky-400 font-black tracking-[0.3em] uppercase text-[10px]">
                Super Administrator
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
            <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-2 rounded-2xl border border-white/10 text-[11px] font-bold transition-all cursor-default backdrop-blur-md">
              <Activity size={14} className="text-slate-400" />
              <span>Full Access Node</span>
            </div>
            <div className="bg-white/5 hover:bg-white/10 px-5 py-2 rounded-2xl border border-white/10 text-[11px] font-bold transition-all cursor-default backdrop-blur-md text-slate-400">
              ID: {user.id.slice(-8).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all duration-500 group relative overflow-hidden"
          >
            {/* Subtle Hover Accent */}
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color.split(' ')[1]} opacity-0 group-hover:opacity-100 transition-opacity`} />
            
            <div className={`p-5 rounded-[1.5rem] ${stat.color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
              {stat.icon}
            </div>
            
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-800 leading-none tracking-tighter">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProfile;