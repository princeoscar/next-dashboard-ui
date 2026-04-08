import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import TeacherAttendanceCard from "@/components/TeacherAttendanceCard";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Mail,
  Phone,
  Droplet,
  Cake,
  BookOpen,
  Layers,
  School,
  Activity
} from "lucide-react";

const SingleTeacherPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  // --- 1. DATA FETCHING ---
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  });

  if (!teacher) return notFound();

  return (
    <div className="flex-1 p-4 flex flex-col gap-6 xl:flex-row">
      {/* LEFT COLUMN: Profile & Schedule */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">

        {/* HEADER: USER INFO AND STATS */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* TEACHER INFO CARD */}
          <div className="bg-indigo-600 py-8 px-6 rounded-[2.5rem] flex flex-col sm:flex-row gap-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden flex-1">
            {/* Decorative Glassmorphism Element */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="sm:w-1/3 flex items-center justify-center relative z-10">
              <div className="relative w-36 h-36 md:w-44 md:h-44 group">
                <Image
                  src={teacher.img || "/noAvatar.png"}
                  alt=""
                  fill
                  className="rounded-[2.5rem] object-cover border-4 border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="sm:w-2/3 flex flex-col justify-center relative z-10">
              <div className="flex items-center flex-wrap gap-4 mb-3">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">
                  {teacher.name} {teacher.surname}
                </h1>
                {role === "admin" && (
                  <div className="flex items-center gap-2">
                    {/* UPDATE BUTTON */}
                    <div className="hover:scale-110 transition-transform">
                      <FormContainer table="teacher" type="update" data={teacher} />
                    </div>
                    {/* DELETE BUTTON */}
                    <div className="hover:scale-110 transition-transform">
                      <FormContainer table="teacher" type="delete" id={teacher.id} />
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                Senior Faculty Member
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoItem icon={<Droplet size={14} />} label={teacher.bloodType || "N/A"} />
                <InfoItem icon={<Cake size={14} />} label={new Intl.DateTimeFormat("en-GB").format(teacher.birthday)} />
                <InfoItem icon={<Mail size={14} />} label={teacher.email || "No Email"} />
                <InfoItem icon={<Phone size={14} />} label={teacher.phone || "No Phone"} />
              </div>
            </div>
          </div>

          {/* QUICK STATS GRID */}
          <div className="lg:w-1/3 grid grid-cols-2 gap-4">
            <StatCard
              icon={<Activity className="text-emerald-500" />}
              title={<Suspense fallback={<span className="animate-pulse">--%</span>}><TeacherAttendanceCard id={teacher.id} /></Suspense>}
              label="Attendance"
            />
            <StatCard
              icon={<BookOpen className="text-indigo-600" />}
              title={teacher._count.subjects.toString()}
              label="Subjects"
            />
            <StatCard
              icon={<Layers className="text-amber-500" />}
              title={teacher._count.lessons.toString()}
              label="Lessons"
            />
            <StatCard
              icon={<School className="text-rose-500" />}
              title={teacher._count.classes.toString()}
              label="Classes"
            />
          </div>
        </div>

        {/* SCHEDULE SECTION */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">Faculty Timetable</h2>
            </div>
          </div>
          <div className="min-h-[650px]">
            <BigCalendarContainer type="teacherId" id={teacher.id} />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Actions & Charts */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        {/* QUICK LINKS PANEL */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-4 bg-slate-800 rounded-full" />
            <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Faculty Shortcuts</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink href={`/list/classes?supervisorId=${teacher.id}`} label="My Classes" color="sky" />
            <QuickLink href={`/list/students?teacherId=${teacher.id}`} label="My Students" color="indigo" />
            <QuickLink href={`/list/lessons?teacherId=${teacher.id}`} label="Schedule" color="amber" />
            <QuickLink href={`/list/exams?teacherId=${teacher.id}`} label="Exams" color="rose" />
            <QuickLink href={`/list/assignments?teacherId=${teacher.id}`} label="Homework" color="emerald" />
          </div>
        </div>

        {/* PERFORMANCE VISUALIZER */}
        <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <Performance />
        </div>
        
        <Announcements />
      </div>
    </div>
  );
};

// --- MODULAR UI HELPERS ---

const InfoItem = ({ icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-3 truncate bg-white/5 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md group hover:bg-white/15 transition-all">
    <div className="text-indigo-200 group-hover:text-white transition-colors">
      {icon}
    </div>
    <span className="truncate text-[11px] font-bold text-white tracking-tight">{label}</span>
  </div>
);

const StatCard = ({ icon, title, label }: { icon: any; title: any; label: string }) => (
  <div className="bg-white p-6 rounded-[2.5rem] flex flex-col gap-4 shadow-sm border border-slate-50 hover:shadow-xl hover:border-indigo-100 transition-all group">
    <div className="p-3 bg-slate-50 rounded-2xl w-fit group-hover:bg-indigo-50 transition-colors">
      {icon}
    </div>
    <div>
      <h1 className="text-2xl font-black text-slate-800 tracking-tighter tabular-nums leading-none mb-1">{title}</h1>
      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">{label}</span>
    </div>
  </div>
);

const QuickLink = ({ href, label, color }: { href: string; label: string; color: string }) => {
  const colors: Record<string, string> = {
    sky: "bg-sky-50 text-sky-700 hover:bg-sky-600",
    indigo: "bg-indigo-50 text-indigo-700 hover:bg-indigo-600",
    rose: "bg-rose-50 text-rose-700 hover:bg-rose-600",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-600",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-600",
  };
  return (
    <Link
      href={href}
      className={`px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all hover:-translate-y-1 hover:text-white shadow-sm border border-transparent hover:shadow-lg ${colors[color]}`}
    >
      {label}
    </Link>
  );
};

export default SingleTeacherPage;