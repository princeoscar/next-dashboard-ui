import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {prisma} from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache"; // 1. IMPORT CACHE
import { 
  User, 
  Phone, 
  Droplet, 
  Mail, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  ChevronRight,
  Clock,
  Settings,
} from "lucide-react";


// --- 1. HELPER COMPONENTS (Moved to top to fix "not defined" errors) ---

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-slate-50 pb-5 last:border-0 group">
    <div className="flex items-center gap-4">
      <div className="text-slate-300 group-hover:text-sky-500 transition-colors">
        {icon}
      </div>
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-slate-800 font-black text-xs tracking-tight">{value}</span>
  </div>
);

const SchoolIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3 10 4.5V17"/><path d="m12 3-10 4.5V17"/>
    <path d="M6 10v9.264a1 1 0 0 0 .553.894L12 21l5.447-2.842a1 1 0 0 0 .553-.894V10"/>
    <path d="M18 13c0 2.21-2.686 4-6 4s-6-1.79-6-4"/>
  </svg>
);

// --- 2. CACHED DATA FETCHERS ---
// This prevents the "Can't reach database" error on frequent refreshes
const getCachedUser = unstable_cache(
  async (userId: string, role: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (role === "teacher") {
      return await prisma.teacher.findUnique({
        where: { id: userId },
        include: { subjects: true, classes: true },
      });
    } 
    if (role === "student") {
      return await prisma.student.findUnique({
        where: { id: userId },
        include: { class: true },
      });
    } 
    if (role === "parent") {
      return await prisma.parent.findUnique({
        where: { id: userId },
        include: {
          students: { // <--- This must be here!
            include: {
              class: true,
            },
          },
        },
      });
    }
    if (role === "admin") {
      return await prisma.admin.findUnique({ where: { id: userId } });
    }
    return null;
  },
  ["user-profile-cache"],
  { revalidate: 3600, tags: ["profile"] }
);


// --- 3. MAIN COMPONENT ---

const ProfilePage = async () => {
  const { userId, sessionClaims } = await auth();
  const user = await currentUser();

  if (!userId || !user) return redirect("/sign-in");

  const rawRole = (sessionClaims?.metadata as { role?: string })?.role || "student";
  const role = rawRole.toLowerCase();

  // 2. FETCH DATA ONCE
  const fetchedUser = await getCachedUser(userId, role);

  if (!fetchedUser) {
    return (
      <div className="p-12 text-slate-400 font-black text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
           <User size={32} />
        </div>
        <p className="uppercase tracking-[0.2em] text-xs">Record Not Found</p>
      </div>
    );
  }

  // 3. CAST TO ANY TO AVOID PROPERTY ERRORS
  const dbUser = fetchedUser as any;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    // Change 1: Responsive padding
    <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto flex flex-col gap-6 md:gap-8">
        
        {/* HERO SECTION - Stacked on mobile, row on desktop */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 md:gap-10 items-center relative overflow-hidden text-center md:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          {/* Avatar - Smaller on mobile */}
          <div className="relative w-32 h-32 md:w-44 md:h-44 shrink-0">
            <Image
              src={user.imageUrl || "/noAvatar.png"}
              alt="Profile"
              fill
              className="rounded-3xl md:rounded-[2.5rem] object-cover border-4 md:border-8 border-slate-50 shadow-xl"
            />
          </div>
          
          <div className="flex-1 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4 items-center md:items-start">
              <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase">
                {dbUser.name || dbUser.username} {dbUser.surname || ""}
              </h1>
              <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-2xl shadow-lg">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{role}</span>
              </div>
            </div>
            
            {/* Contact Details - Stacked vertically on mobile */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-slate-400 font-bold text-[10px] md:text-[11px] uppercase tracking-widest items-center md:items-start">
               <div className="flex items-center gap-2">
                 <Mail size={14} className="text-sky-500" />
                 {dbUser.email || user.emailAddresses[0].emailAddress}
               </div>
               <div className="flex items-center gap-2">
                 <ShieldCheck size={14} className="text-emerald-500" />
                 ID: {dbUser.username || dbUser.id.toString().slice(0, 8)}
               </div>
            </div>
          </div>
        </div>

        {/* DETAILS GRID - 1 column on mobile/tablet, 3 on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* PERSONAL INFO */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-xs font-black text-slate-800 mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <User size={16} />
              </div>
              Identity
            </h2>
            <div className="space-y-5">
              <DetailRow icon={<Phone size={14}/>} label="Contact" value={dbUser.phone || "---"} />
              <DetailRow icon={<Droplet size={14}/>} label="Blood" value={dbUser.bloodType || "N/A"} />
              <DetailRow icon={<Clock size={14}/>} label="Joined" value={new Date(dbUser.createdAt || today).toLocaleDateString('en-GB')} />
            </div>
          </div>

          {/* DYNAMIC ROLE CARD - Spans 2 cols on desktop */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-xs font-black text-slate-800 mb-6 md:mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
              {role === "teacher" && <><BookOpen size={16} className="text-amber-500" /> Teaching Faculty</>}
              {role === "student" && <><GraduationCap size={16} className="text-sky-500" /> Academic Enrolment</>}
              {role === "parent" && <><User size={16} className="text-rose-500" /> Household Members</>}
              {role === "admin" && <><Settings size={16} className="text-slate-900" /> System Control</>}
            </h2>

            {/* Content within card */}
            <div className="grid grid-cols-1 gap-4">
              {/* For Parents: Stack children into 1 column on mobile, 2 on desktop */}
              {role === "parent" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dbUser.students?.map((child: any) => (
                    <div key={child.id} className="p-5 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:border-sky-300 transition-all group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center font-black text-xs uppercase">
                          {child.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{child.name}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{child.class?.name}</p>
                        </div>
                      </div>
                      <Link href={`/list/students/${child.id}`} className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px] font-black text-sky-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                        Dossier <ChevronRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              {/* (Teacher/Student views here stay similar but use md:text-3xl for the big class name text) */}
            {role === "student" && (
                <div className="p-6 md:p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm text-sky-500">
                      <SchoolIcon />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Cohort</p>
                      <p className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter">Class {dbUser.class?.name || "Pending"}</p>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;