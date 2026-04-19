import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Calendar } from "lucide-react";

const SingleStudentPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  console.log("Looking for Student ID:", id);
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const decodedId = decodeURIComponent(id);

  // Fetch student with related Class and Parent data
  const student = await prisma.student.findUnique({
    where: { id: decodedId },
    include: {
      class: {
        include: { _count: { select: { lessons: true } } },
      },
      parent: true,
    },
  });

  if (!student) return notFound();

  return (
    <div className="flex-1 p-4 flex flex-col gap-6 xl:flex-row bg-slate-50/50 min-h-screen">
      {/* LEFT COLUMN */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        {/* TOP: USER INFO & QUICK STATS */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* USER INFO CARD */}
          <div className="bg-rubixSky p-6 rounded-[2rem] flex-1 flex flex-col sm:flex-row gap-6 shadow-sm border border-sky-200/50">
            <div className="w-full sm:w-1/3 flex justify-center items-center">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <Image
                  src={student.img || "/noAvatar.png"}
                  alt={`${student.name} profile`}
                  fill
                  className="rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
            </div>
            <div className="w-full sm:w-2/3 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  {student.name} {student.surname}
                </h1>
                {role === "admin" && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium opacity-80">
                Active student at Rubix Academy. Pursuing excellence through
                dedicated learning and consistent performance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Image src="/blood.png" alt="" width={14} height={14} className="opacity-70" />
                  <span>{student.bloodType}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Image src="/date.png" alt="" width={14} height={14} className="opacity-70" />
                  <span>{new Intl.DateTimeFormat("en-GB").format(student.birthday)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 truncate">
                  <Image src="/mail.png" alt="" width={14} height={14} className="opacity-70" />
                  <span className="truncate">{student.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Image src="/phone.png" alt="" width={14} height={14} className="opacity-70" />
                  <span>{student.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 md:col-span-2">
                  <Image src="/user.png" alt="" width={14} height={14} className="opacity-70" />
                  <span>
                    {student.parent
                      ? `Parent: ${student.parent.name} ${student.parent.surname}`
                      : "No Parent information"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK STATS (SMALL CARDS) */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl flex flex-col justify-between shadow-sm border border-slate-100 hover:border-rubixSky transition-colors">
              <Image src="/singleAttendance.png" alt="" width={24} height={24} />
              <div className="mt-2">
                <Suspense fallback={<span className="text-lg font-black">...</span>}>
                  <StudentAttendanceCard id={student.id} />
                </Suspense>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Attendance
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl flex flex-col justify-between shadow-sm border border-slate-100 hover:border-rubixSky transition-colors">
              <Image src="/singleBranch.png" alt="" width={24} height={24} />
              <div className="mt-2">
                <h1 className="text-xl font-black text-slate-800 tracking-tighter">
                  {student.class?.name.split(" ")[0] || "N/A"}
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Level
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl flex flex-col justify-between shadow-sm border border-slate-100 hover:border-rubixSky transition-colors">
              <Image src="/singleLesson.png" alt="" width={24} height={24} />
              <div className="mt-2">
                <h1 className="text-xl font-black text-slate-800 tracking-tighter">
                  {student.class?._count.lessons || 0}
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Lessons
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl flex flex-col justify-between shadow-sm border border-slate-100 hover:border-rubixSky transition-colors">
              <Image src="/singleClass.png" alt="" width={24} height={24} />
              <div className="mt-2">
                <h1 className="text-xl font-black text-slate-800 tracking-tighter truncate">
                  {student.class?.name || "N/A"}
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Class Arm
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: SCHEDULE */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 h-[800px]">
          <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-rubixSky" />
            Student Schedule
          </h1>
          {student.classId ? (
            <BigCalendarContainer type="classId" id={student.classId} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              No schedule available (No Class Assigned)
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: SHORTCUTS & EXTRA INFO */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">
            Quick Shortcuts
          </h1>
          <div className="flex gap-3 flex-wrap text-[10px] font-black uppercase tracking-widest">
            <Link
              className="px-4 py-3 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-600 hover:text-white transition-all"
              href={`/list/lessons?classId=${student.classId}`}
            >
              Lessons
            </Link>
            <Link
              className="px-4 py-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-600 hover:text-white transition-all"
              href={`/list/teachers?classId=${student.classId}`}
            >
              Teachers
            </Link>
            <Link
              className="px-4 py-3 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 hover:bg-pink-600 hover:text-white transition-all"
              href={`/list/exams?classId=${student.classId}`}
            >
              Exams
            </Link>
            <Link
              className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"
              href={`/list/assignments?classId=${student.classId}`}
            >
              Assignments
            </Link>
            <Link
              className="px-4 py-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white transition-all"
              href={`/list/results?studentId=${student.id}`}
            >
              Results
            </Link>
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;