import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { GraduationCap, Calendar as CalendarIcon, FileText, Bell, UserCircle } from "lucide-react";

const ParentPage = async () => {
  const { userId } = await auth();

  const parent = await prisma.parent.findUnique({
    where: { id: userId! },
    include: {
      students: {
        select: {
          id: true,
          name: true,
          surname: true,
          classId: true,
          class: {
            select: { name: true }
          }
        },
      },
    },
  });

  if (!parent || parent.students.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-slate-100 p-6 rounded-[2rem] mb-4 text-slate-400">
          <UserCircle size={48} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
          No Linked Students
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-xs font-medium">
          We couldn&apos;t find any students linked to your profile. Please contact the administration office.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 flex gap-8 flex-col xl:flex-row bg-slate-50/50 min-h-screen">
      {/* LEFT: Student Performance & Schedule */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-rubixPurple rounded-full" />
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Family Overview
          </h1>
        </div>

        {parent.students.map((student) => (
          <div key={student.id} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
              <GraduationCap size={120} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-rubixSky/10 text-rubixSky rounded-2xl">
                  <UserCircle size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {student.name} {student.surname}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-rubixSky uppercase tracking-widest bg-rubixSky/5 px-2 py-0.5 rounded-md border border-rubixSky/10">
                      Class {student.class?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/list/results?studentId=${student.id}`}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 self-start md:self-center"
              >
                <FileText size={14} />
                View Report Card
              </Link>
            </div>

            {/* Student's Personal Calendar */}
            <div className="bg-slate-50/50 rounded-[2rem] p-4 border border-slate-50">
              <div className="flex items-center gap-2 mb-4 px-2">
                <CalendarIcon size={16} className="text-slate-400" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Weekly Academic Schedule</span>
              </div>
              <div className="h-[600px]">
                {student.classId ? (
                  <BigCalendarContainer type="classId" id={student.classId} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      No Schedule Available
                    </p>
                    <span className="text-xs text-slate-400 italic">This student is not yet assigned to a class.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: Sidebar */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-rubixYellow" />
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">School Bulletins</h2>
          </div>
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default ParentPage;