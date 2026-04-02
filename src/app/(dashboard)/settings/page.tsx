import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import SchoolSettingsForm from "@/components/settings/SchoolSettingsForm";
import PersonalSettingsForm from "@/components/settings/PersonalSettingsForm";
import { Settings, ShieldCheck, UserCircle, School, Bell } from "lucide-react";

const SettingsPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) return null;

  // 1. Fetch School Settings (Global Configuration)
  const schoolSettings = await prisma.schoolSettings.findUnique({
    where: { id: 1 },
  });

  // 2. Fetch Role-Specific Personal Data
  let userData = null;

  const queryMap: Record<string, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  if (role && queryMap[role]) {
    userData = await queryMap[role].findUnique({ where: { id: userId } });
  }

  return (
    <div className="p-8 flex flex-col gap-10 bg-slate-50/50 min-h-screen">
      {/* PAGE HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            System Control
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">
            Configure Preferences & School Governance
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-12 max-w-5xl">
        
        {/* --- SECTION 1: SCHOOL CONTROL (Admin Only) --- */}
        {role === "admin" && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-rubixPurple rounded-full" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <School size={16} /> School Configuration
              </h2>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <SchoolSettingsForm settings={schoolSettings} />
            </div>
          </section>
        )}

        {/* --- SECTION 2: PERSONAL ACCOUNT (Everyone) --- */}
        <section className="animate-in fade-in slide-in-from-bottom-4 delay-150 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-rubixSky rounded-full" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <UserCircle size={16} /> Personal Account
            </h2>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <PersonalSettingsForm user={userData} />
          </div>
        </section>

        {/* --- SECTION 3: PRIVACY & SECURITY (Visual Placeholder) --- */}
        <section className="opacity-60 grayscale cursor-not-allowed">
           <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-slate-400 rounded-full" />
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={16} /> Security & Notifications
            </h2>
          </div>
          <div className="bg-slate-100/50 p-8 rounded-[2.5rem] border border-dashed border-slate-200 flex items-center justify-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Advanced security settings coming in v2.0
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;