"use client";

import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import { 
  Bell, 
  Clock, 
  ShieldCheck, 
  UserCircle, 
  ChevronRight,
  ExternalLink
} from "lucide-react";

interface TeacherSettingsProps {
  user: User | null;
}

const TeacherSettings = ({ user }: TeacherSettingsProps) => {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      
      {/* 1. PRIMARY PROFILE CARD */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rubixSky/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
        
        <div className="relative">
          <Image
            src={user?.imageUrl || "/noAvatar.png"}
            alt="Teacher"
            width={100}
            height={100}
            className="rounded-[2rem] border-4 border-white shadow-xl object-cover"
          />
          <div className="absolute -bottom-2 -right-2 p-1.5 bg-green-500 rounded-xl border-4 border-white" />
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user?.fullName}</h2>
            <span className="w-fit mx-auto md:mx-0 px-3 py-1 bg-rubixSky/10 text-rubixSky text-[10px] font-black uppercase tracking-widest rounded-lg border border-rubixSky/10">
              Senior Faculty
            </span>
          </div>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-tighter">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
          
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-xl border border-slate-100 uppercase tracking-widest">
              <ShieldCheck size={12} />
              ID: {user?.id.slice(-8).toUpperCase()}
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95">
          Edit Profile <ExternalLink size={14} />
        </button>
      </div>

      {/* 2. SETTINGS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* AVAILABILITY SETTINGS */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-rubixPurple/10 rounded-2xl text-rubixPurple">
              <Clock size={20} />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-tighter">Office Hours</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Parent Consultation Slot
            </p>
            <div className="group cursor-pointer p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-rubixPurple transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-black text-slate-700 group-hover:text-rubixPurple transition-colors">Mon — Fri</span>
                <span className="text-xs text-slate-400 font-medium">15:00 - 16:30 (After School)</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-rubixPurple transition-colors" />
            </div>
          </div>
        </div>

        {/* NOTIFICATION SETTINGS */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-rubixSky/10 rounded-2xl text-rubixSky">
              <Bell size={20} />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-tighter">Alert Preferences</h3>
          </div>

          <div className="space-y-6">
            {[
              { label: "Assignment Submissions", default: true },
              { label: "Parent Messages", default: false }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Push & Email</span>
                </div>
                
                {/* MODERN TOGGLE SWITCH */}
                <button 
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative flex items-center ${
                    item.default ? 'bg-rubixSky' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute transition-all duration-300 shadow-sm ${
                    item.default ? 'left-[26px]' : 'left-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default TeacherSettings;