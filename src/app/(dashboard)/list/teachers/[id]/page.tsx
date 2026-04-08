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
    console.log("Current User Role:", role);
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
    <div className="flex-1 p-8 flex flex-col gap-8 xl:flex-row bg-slate-50/50 min-h-screen">
      {/* LEFT COLUMN: Profile & Schedule */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8">

        {/* HEADER: USER INFO AND STATS */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* TEACHER INFO CARD */}
          <div className="bg-sky-500 p-8 rounded-[2.5rem] flex-1 flex flex-col sm:flex-row gap-8 shadow-xl shadow-sky-100 relative overflow-hidden">
            {/* Decorative Glassmorphism Element */}
            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/20 rounded-full blur-3xl" />

            <div className="sm:w-1/3 flex items-center justify-center relative z-10">
              <div className="relative w-32 h-32 md:w-40 md:h-40 group">
                <Image
                  src={teacher.img || "/noAvatar.png"}
                  alt=""
                  fill
                  className="rounded-[2rem] object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="sm:w-2/3 flex flex-col justify-center relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                  {teacher.name} {teacher.surname}
                </h1>
                {role === "admin" && (
                  <div className="flex items-center gap-2">
                    {/* UPDATE BUTTON */}
                    <div className="p-1 bg-slate-900 rounded-xl shadow-lg hover:scale-110 transition-transform">
                      <FormContainer table="teacher" type="update" data={teacher} />
                    </div>

                    {/* DELETE BUTTON - ADD THIS PART */}
                    <div className="p-1 bg-rose-600 rounded-xl shadow-lg hover:scale-110 transition-transform">
                      <FormContainer table="teacher" type="delete" id={teacher.id} />
                    </div>
                  </div>

                )}
              </div>
              <p className="text-[10px] font-black text-sky-100 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
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
          <div className="flex-1 grid grid-cols-2 gap-4">
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
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-sky-500 rounded-full" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Faculty Timetable</h2>
          </div>
          <div className="min-h-[600px]">
            <BigCalendarContainer type="teacherId" id={teacher.id} />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Actions & Charts */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        {/* QUICK LINKS PANEL */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Faculty Shortcuts</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink href={`/list/classes?supervisorId=${teacher.id}`} label="My Classes" color="sky" />
            <QuickLink href={`/list/students?teacherId=${teacher.id}`} label="My Students" color="indigo" />
            <QuickLink href={`/list/lessons?teacherId=${teacher.id}`} label="Schedule" color="amber" />
            <QuickLink href={`/list/exams?teacherId=${teacher.id}`} label="Exams" color="rose" />
            <QuickLink href={`/list/assignments?teacherId=${teacher.id}`} label="Homework" color="emerald" />
          </div>
        </div>

        {/* PERFORMANCE VISUALIZER */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <Performance />
        </div>
        <Announcements />
      </div>
    </div>
  );
};

// --- MODULAR UI HELPERS ---

const InfoItem = ({ icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-3 truncate bg-white/10 p-2 rounded-xl border border-white/20 backdrop-blur-sm group hover:bg-white/20 transition-all">
    <div className="text-white/80 group-hover:text-white transition-colors">
      {icon}
    </div>
    <span className="truncate text-[11px] font-bold text-white tracking-tight">{label}</span>
  </div>
);

const StatCard = ({ icon, title, label }: { icon: any; title: any; label: string }) => (
  <div className="bg-white p-6 rounded-[2rem] flex flex-col gap-3 shadow-sm border border-slate-50 hover:shadow-xl hover:border-sky-100 transition-all group">
    <div className="p-3 bg-slate-50 rounded-2xl w-fit group-hover:bg-sky-50 transition-colors">
      {icon}
    </div>
    <div>
      <h1 className="text-xl font-black text-slate-800 tracking-tighter tabular-nums">{title}</h1>
      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 block">{label}</span>
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
      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all hover:-translate-y-1 hover:text-white shadow-sm border border-transparent hover:shadow-lg ${colors[color]}`}
    >
      {label}
    </Link>
  );
};

export default SingleTeacherPage;