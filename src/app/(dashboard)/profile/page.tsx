import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { 
  User, 
  Phone, 
  Droplet, 
  Mail, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  ChevronRight,
  Clock
} from "lucide-react";

const ProfilePage = async () => {
  const { userId, sessionClaims } = await auth();
  const user = await currentUser();

  if (!userId || !user) return redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string })?.role || "student";

  // --- 1. DYNAMIC DATABASE FETCH ---
  let dbUser: any = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (role === "teacher") {
    dbUser = await prisma.teacher.findUnique({
      where: { id: userId },
      include: { subjects: true, classes: true },
    });
  } else if (role === "student") {
    dbUser = await prisma.student.findUnique({
      where: { id: userId },
      include: { class: true },
    });
  } else if (role === "parent") {
    dbUser = await prisma.parent.findUnique({
      where: { id: userId },
      include: {
        students: {
          include: {
            class: true,
            results: { orderBy: { id: 'desc' }, take: 1 },
            attendances: { where: { date: { gte: today } } } 
          },
        },
      },
    });
  } else {
    dbUser = await prisma.admin.findUnique({ where: { id: userId } });
  }

  if (!dbUser) return <div className="p-12 text-slate-400 font-black text-center uppercase tracking-widest">Database Record Sync Required</div>;

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* HEADER CARD: THE HERO SECTION */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rubixSky/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="relative w-40 h-40">
            <Image
              src={user.imageUrl || "/noAvatar.png"}
              alt="Profile"
              fill
              className="rounded-[2rem] object-cover border-4 border-white shadow-2xl shadow-slate-200"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">
                {dbUser.name} {dbUser.surname || ""}
              </h1>
              <span className="bg-slate-900 text-white px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] w-max mx-auto md:mx-0 shadow-lg shadow-slate-200">
                {role}
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-4 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
               <div className="flex items-center gap-2 justify-center md:justify-start">
                 <Mail size={14} className="text-rubixSky" />
                 {dbUser.email || user.emailAddresses[0].emailAddress}
               </div>
               <div className="flex items-center gap-2 justify-center md:justify-start">
                 <ShieldCheck size={14} className="text-emerald-500" />
                 Verified Account
               </div>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PERSONAL INFO */}
          <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-3">
              <User size={18} className="text-rubixPurple" />
              Identity Details
            </h2>
            <div className="space-y-6">
              <DetailRow icon={<Phone size={14}/>} label="Contact" value={dbUser.phone || "---"} />
              <DetailRow icon={<Droplet size={14}/>} label="Blood Type" value={dbUser.bloodType || "N/A"} />
              <DetailRow icon={<Clock size={14}/>} label="Username" value={dbUser.username || user.username || "---"} />
            </div>
          </div>

          {/* DYNAMIC ROLE-BASED CARD */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-3">
              {role === "teacher" && <><BookOpen size={18} className="text-rubixYellow" /> Teaching Faculty</>}
              {role === "student" && <><GraduationCap size={18} className="text-rubixSky" /> Academic Enrolment</>}
              {role === "parent" && <><User size={18} className="text-rose-500" /> Household Members</>}
              {role === "admin" && <><ShieldCheck size={18} className="text-slate-900" /> System Control</>}
            </h2>

            <div className="flex flex-col gap-4">
              {role === "teacher" && (
                <div className="flex flex-wrap gap-2">
                  {dbUser.subjects?.map((s: any) => (
                    <span key={s.id} className="bg-rubixPurple/5 text-rubixPurple px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-rubixPurple/10">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {role === "student" && (
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
                      <SchoolIcon />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Cohort</p>
                      <p className="text-xl font-black text-slate-800 uppercase tracking-tighter">Class {dbUser.class?.name || "Pending"}</p>
                    </div>
                  </div>
                </div>
              )}

              {role === "parent" && dbUser.students?.map((child: any) => (
                <div key={child.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:border-rubixSky/30 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rubixSky/5 text-rubixSky rounded-2xl flex items-center justify-center font-black transition-all group-hover:bg-rubixSky group-hover:text-white">
                        {child.name[0]}{child.surname[0]}
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-800 tracking-tight">{child.name} {child.surname}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Class {child.class?.name}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      child.attendances.length > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                      {child.attendances.length > 0 ? "• Present Today" : "• Absent / Not Logged"}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Latest Score: <span className="text-slate-800">{child.results[0]?.score || "---"}%</span>
                    </div>
                    <Link href={`/list/students/${child.id}`} className="flex items-center gap-1 text-[10px] font-black text-rubixSky uppercase tracking-widest hover:gap-2 transition-all">
                      View Dossier <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- HELPERS ---

const DetailRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 group">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-rubixSky transition-colors">
        {icon}
      </div>
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-slate-800 font-black text-sm tracking-tight">{value}</span>
  </div>
);

const SchoolIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 10 4.5V17"/><path d="m12 3-10 4.5V17"/><path d="M6 10v9.264a1 1 0 0 0 .553.894L12 21l5.447-2.842a1 1 0 0 0 .553-.894V10"/><path d="M18 13c0 2.21-2.686 4-6 4s-6-1.79-6-4"/></svg>
);

export default ProfilePage;