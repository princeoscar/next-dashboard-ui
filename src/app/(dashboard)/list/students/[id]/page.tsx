import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Calendar as CalendarIcon, Mail, Phone, Droplet, Cake, GraduationCap, LayoutDashboard, BookmarkCheck } from "lucide-react";

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  // --- 1. DATA FETCHING ---
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  if (!student) return notFound();

  return (
    <div className="flex-1 p-8 flex flex-col gap-8 xl:flex-row bg-slate-50/50 min-h-screen">
      {/* LEFT COLUMN: Main Info & Schedule */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8">

        {/* HEADER: USER INFO AND STATS */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* PERSONAL INFO CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] flex-1 flex flex-col sm:flex-row gap-8 shadow-sm border border-slate-100 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16" />

            <div className="sm:w-1/3 flex items-center justify-center relative z-10">
              <div className="relative w-32 h-32 md:w-40 md:h-40 group">
                <Image
                  src={student.img || "/noAvatar.png"}
                  alt="{student.name}"
                  fill
                  className="rounded-[2rem] object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="sm:w-2/3 flex flex-col justify-center relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                  {student.name} {student.surname}
                </h1>
                {role === "admin" && (
                  <div className="p-1 bg-slate-900 rounded-xl shadow-lg hover:scale-110 transition-transform">
                    <FormContainer table="student" type="update" data={student} />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                Active Enrollment: {student.class ? student.class.name : "Not Enrolled"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={<Droplet size={14} />} label={student.bloodType || "N/A"} color="rose" />
                <InfoItem icon={<Cake size={14} />} label={new Intl.DateTimeFormat("en-GB").format(student.birthday)} color="blue" />
                <InfoItem icon={<Mail size={14} />} label={student.email || "No Email"} color="emerald" />
                <InfoItem icon={<Phone size={14} />} label={student.phone || "No Phone"} color="amber" />
              </div>
            </div>
          </div>

          {/* QUICK STATS GRID */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <StatCard
              icon={<BookmarkCheck className="text-indigo-600" />}
              title={<Suspense fallback={<span className="animate-pulse">--%</span>}><StudentAttendanceCard id={student.id} /></Suspense>}
              label="Attendance"
            />
            <StatCard
              icon={<GraduationCap className="text-amber-500" />}
              title={`${student.class?.name.match(/\d+/)?.[0] || "-"}th`}
              label="Grade Level"
            />
            <StatCard
              icon={<LayoutDashboard className="text-emerald-500" />}
              title={student.class?._count.lessons.toString() || "0"}
              label="Weekly Lessons"
            />
            <StatCard
              icon={<CalendarIcon className="text-rose-500" />}
              title={student.class?.name || "Unassigned"}
              label="Home Class"
            />
          </div>
        </div>

        {/* SCHEDULE SECTION */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-indigo-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Academic Schedule</h2>
          </div>
          <div className="min-h-[600px]">
            {student.class?.id ? (
              <BigCalendarContainer type="classId" id={student.class.id} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <CalendarIcon size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase tracking-widest text-[10px]">No Schedule Available</p>
                <span className="text-xs italic">Student is not assigned to a class.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Performance & Actions */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        {/* ACTION PANEL */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Student Shortcuts</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink href={`/list/lessons?classId=${student.class?.id} : "#"`} label="Lessons" color="sky" />
            <QuickLink href={`/list/teachers?classId=${student.class?.id}`} label="Teachers" color="indigo" />
            <QuickLink href={`/list/exams?classId=${student.class?.id}`} label="Exams" color="rose" />
            <QuickLink href={`/list/assignments?classId=${student.class?.id}`} label="Homework" color="amber" />
            <QuickLink href={`/list/results?studentId=${student.id}`} label="Results" color="emerald" />
          </div>
        </div>

        {/* VISUALIZATIONS */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <Performance />
        </div>
        <Announcements />
      </div>
    </div>
  );
};

// --- MODULAR UI HELPERS ---

const InfoItem = ({ icon, label, color }: { icon: any; label: string; color: string }) => {
  const colors: Record<string, string> = {
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="flex items-center gap-3 truncate group">
      <div className={`p-2 ${colors[color]} rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="truncate text-[11px] font-bold text-slate-500">{label}</span>
    </div>
  );
};

const StatCard = ({ icon, title, label }: { icon: any; title: any; label: string }) => (
  <div className="bg-white p-6 rounded-[2rem] flex flex-col gap-3 shadow-sm border border-slate-50 hover:shadow-xl hover:border-indigo-100 transition-all group">
    <div className="p-3 bg-slate-50 rounded-2xl w-fit group-hover:bg-indigo-50 transition-colors">
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
    sky: "bg-sky-50 text-sky-700 hover:bg-sky-700",
    indigo: "bg-indigo-50 text-indigo-700 hover:bg-indigo-700",
    rose: "bg-rose-50 text-rose-700 hover:bg-rose-700",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-700",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-700",
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

export default SingleStudentPage;