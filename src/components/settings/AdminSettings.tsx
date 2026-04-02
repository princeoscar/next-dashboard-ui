import { getSchoolSettings } from "@/lib/settings";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import { Settings, School, GraduationCap, CalendarDays, Award } from "lucide-react";

interface AdminSettingsProps {
  user: User | null;
}

const AdminSettings = async ({ user }: AdminSettingsProps) => {
  const settings = await getSchoolSettings();

  // Safety fallbacks
  const schoolName = settings?.schoolName || "Rubix Academy";
  const session = settings?.currentYear || "2025/2026";
  const passingGrade = settings?.passingGrade || 50;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4 md:p-0">
      
      {/* 1. WELCOME HEADER CARD */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Image
              src={user?.imageUrl || "/noAvatar.png"}
              alt="Admin"
              width={80}
              height={80}
              className="rounded-3xl border-4 border-rubixSky shadow-lg object-cover"
            />
            <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md border border-slate-100">
              <Settings size={16} className="text-slate-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Welcome, {user?.firstName || "Admin"}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Configuration Control Panel
            </p>
          </div>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          System Logs
        </button>
      </div>

      {/* 2. SCHOOL IDENTITY CARD */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <School size={20} className="text-rubixSky" />
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">School Identity</h2>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-rubixSky bg-sky-50 px-4 py-2 rounded-xl hover:bg-rubixSky hover:text-white transition-all">
            Update Branding
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
          {/* Logo Container */}
          <div className="relative w-32 h-32 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center group overflow-hidden">
            {settings?.schoolLogo ? (
              <Image src={settings.schoolLogo} alt="School Logo" fill className="object-contain p-4 transition-transform group-hover:scale-110" />
            ) : (
              <div className="text-center p-2">
                <Image src="/logo.png" alt="Placeholder" width={40} height={40} className="opacity-10 mx-auto grayscale" />
                <span className="text-[9px] text-slate-300 font-bold uppercase mt-2 block">No Logo Uploaded</span>
              </div>
            )}
          </div>
          
          {/* Identity Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Institution Name</span>
              <p className="text-lg text-slate-700 font-extrabold">{schoolName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Academic Cycle</span>
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-rubixPurple" />
                <p className="text-lg text-slate-700 font-extrabold">{session}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACADEMIC BENCHMARKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Passing Grade Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group">
          <div className="flex items-center gap-2 mb-6">
            <Award size={18} className="text-green-500" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Success Threshold</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-slate-400 uppercase">Minimum Passing Grade</span>
              <span className="text-3xl font-black text-green-600 leading-none">{passingGrade}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                style={{ width: `${passingGrade}%` }}
              />
            </div>
          </div>
        </div>

        {/* Term Status Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap size={18} className="text-rubixPurple" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Schedule</h2>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Active Term</span>
              <span className="text-xl font-black text-slate-800 mt-1">
                {settings?.currentTerm || "Term 1"}
              </span>
            </div>
            <div className="bg-rubixPurple/10 p-3 rounded-xl">
               <CalendarDays size={24} className="text-rubixPurple" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;