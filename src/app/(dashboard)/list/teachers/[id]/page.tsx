import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react"; // Make sure to install lucide-react if not already there

const SingleTeacherPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher:
    | (Teacher & {
        subjects: { id: number; name: string }[];
        _count: { subjects: number; lessons: number; classes: number };
      })
    | null = await prisma.teacher.findUnique({
    where: { id },
    include: {
      subjects: true,
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
    <div className="flex-1 p-4 flex flex-col gap-6 xl:flex-row bg-slate-50/50">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        {/* TOP: INFO & STATS */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* USER INFO CARD */}
          <div className="bg-rubixSky p-6 rounded-[2rem] flex-1 flex flex-col sm:flex-row gap-6 shadow-sm border border-sky-200/50">
            <div className="w-full sm:w-1/3 flex justify-center items-center">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <Image
                  src={teacher.img || "/noAvatar.png"}
                  alt={`${teacher.name} profile`}
                  fill
                  className="rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
            </div>
            <div className="w-full sm:w-2/3 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  {teacher.name} {teacher.surname}
                </h1>
                {role === "admin" && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>
              <span className="text-xs font-black text-sky-600 uppercase tracking-widest mb-3 bg-white/50 w-fit px-2 py-1 rounded-md">
                {teacher.subjects.map((s) => s.name).join(" • ")}
              </span>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium opacity-80">
                Dedicated educator at Rubix Academy, specializing in interactive learning and student mentorship.
              </p>
              
              {/* CONTACT GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 border-t border-white/40 pt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Image src="/blood.png" alt="blood" width={14} height={14} className="opacity-70" />
                  <span>{teacher.bloodType}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Image src="/date.png" alt="date" width={14} height={14} className="opacity-70" />
                  <span>{new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 truncate">
                  <Image src="/mail.png" alt="mail" width={14} height={14} className="opacity-70" />
                  <span className="truncate">{teacher.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Image src="/phone.png" alt="phone" width={14} height={14} className="opacity-70" />
                  <span>{teacher.phone || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL STATS CARDS */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {/* ATTENDANCE */}
            <div className="bg-white p-5 rounded-3xl flex flex-col justify-between shadow-sm border border-slate-100 hover:border-rubixSky transition-colors">
              <Image src="/singleAttendance.png" alt="" width={24} height={24} />
              <div className="mt-2">
                <h1 className="text-xl font-black text-slate-800 tracking-tighter">90%</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Attendance</p>
              </div>
            </div>
            
            {/* BRANCHES (SUBJECTS) */}
            <div className="bg-white p-5 rounded-3xl flex flex-col justify-between shadow-sm border border-slate-100 hover:border-rubixSky transition-colors">
              <Image src="/singleBranch.png" alt="" width={24} height={24} />
              <div className="mt-2">
                <h1 className="text-xl font-black text-slate-800 tracking-tighter">
                  {teacher._count.subjects}
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Subjects</p>
              </div>
            </div>

            {/* LESSONS */}
            <div className="bg-white p-5 rounded-3xl flex flex-col justify-between shadow-sm border border-slate-100 hover:border-rubixSky transition-colors">
              <Image src="/singleLesson.png" alt="" width={24} height={24} />
              <div className="mt-2">
                <h1 className="text-xl font-black text-slate-800 tracking-tighter">
                  {teacher._count.lessons}
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lessons</p>
              </div>
            </div>

            {/* CLASSES */}
            <div className="bg-white p-5 rounded-3xl flex flex-col justify-between shadow-sm border border-slate-100 hover:border-rubixSky transition-colors">
              <Image src="/singleClass.png" alt="" width={24} height={24} />
              <div className="mt-2">
                <h1 className="text-xl font-black text-slate-800 tracking-tighter">
                  {teacher._count.classes}
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Classes</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: CALENDAR */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 h-[800px]">
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-rubixSky" />
            Teacher Schedule
          </h1>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>

      {/* RIGHT: SHORTCUTS & PERFORMANCE */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">Quick Shortcuts</h1>
          <div className="flex gap-3 flex-wrap text-[10px] font-black uppercase tracking-widest">
            <Link className="px-4 py-3 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-600 hover:text-white transition-all" href={`/list/classes?supervisorId=${teacher.id}`}>Classes</Link>
            <Link className="px-4 py-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-600 hover:text-white transition-all" href={`/list/students?teacherId=${teacher.id}`}>Students</Link>
            <Link className="px-4 py-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white transition-all" href={`/list/lessons?teacherId=${teacher.id}`}>Lessons</Link>
            <Link className="px-4 py-3 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 hover:bg-pink-600 hover:text-white transition-all" href={`/list/exams?teacherId=${teacher.id}`}>Exams</Link>
            <Link className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all" href={`/list/assignments?teacherId=${teacher.id}`}>Assignments</Link>
            
            {role === "teacher" && sessionClaims?.sub === teacher.id && (
              <Link
                className="px-4 py-3 rounded-xl bg-slate-900 text-white w-full text-center mt-2 hover:bg-slate-700 transition-all"
                href="/settings"
              >
                ⚙️ Account Settings
              </Link>
            )}
          </div>
        </div>
        <Performance />
        <Announcements data={[]} />
      </div>
    </div>
  );
};

export default SingleTeacherPage;