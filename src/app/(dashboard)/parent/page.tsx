import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { FileText, Bell, UserCircle, Wallet, Calendar as CalendarIcon } from "lucide-react";

const ParentPage = async ({ searchParams }: { searchParams: { studentId?: string } }) => {
  const { userId } = await auth();
  if (!userId) return null;

  // 1. Fetch Parent, Students, and Active Session
  const [parentData, activeYear] = await Promise.all([
    prisma.parent.findFirst({
      where: { clerkId: userId },
      include: {
        students: { include: { class: { select: { name: true } } } },
      },
    }),
    prisma.academicYear.findFirst({ where: { isCurrent: true } }),
  ]);

  if (!parentData) return <div className="p-8 text-center">Parent profile not found.</div>;
  if (!activeYear) return <div className="p-8 text-red-500 font-bold">⚠️ Contact Admin to set active session.</div>;

  // 2. Identify Active Child
  const activeStudentId = searchParams.studentId || parentData.students[0]?.id;
  const selectedStudent = parentData.students.find((s: any) => s.id === activeStudentId);

  // 3. Fetch Data for Selected Child
  const [announcements, events, messages, balanceData] = await Promise.all([
    prisma.announcement.findMany({ take: 5, orderBy: { date: "desc" } }),
    prisma.event.findMany({ take: 5, orderBy: { startTime: "asc" } }),
    prisma.message.findMany({ where: { receiverId: userId }, take: 5 }),
    selectedStudent ? prisma.studentBalance.findMany({ 
        where: { studentId: selectedStudent.id },
        include: { allocation: { include: { category: true } } }
    }) : []
  ]);

  const totalBalance = balanceData.reduce((acc, curr) => acc + Number(curr.outstanding), 0);

  return (
    <div className="p-4 md:p-8 flex gap-8 flex-col xl:flex-row bg-slate-50/50 min-h-screen">
      <div className="w-full xl:w-2/3 flex flex-col gap-8">
        
        {/* CHILD SWITCHER */}
        <div className="flex gap-3">
          {parentData.students.map((student: any) => (
            <Link
              key={student.id}
              href={`/dashboard/parent?studentId=${student.id}`}
              className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest border transition-all ${
                activeStudentId === student.id 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
              }`}
            >
              {student.name}
            </Link>
          ))}
        </div>

        {/* SELECTED STUDENT DASHBOARD */}
        {selectedStudent && (
          <div className="bg-white p-4 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-10">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><UserCircle size={28} /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{selectedStudent.name} {selectedStudent.surname}</h2>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    Class {selectedStudent.class?.name || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900 text-white p-6 rounded-3xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Fees Balance</p>
                  <p className="text-2xl font-black">₦{totalBalance.toLocaleString()}</p>
                </div>
                <Wallet className="opacity-20" size={32} />
              </div>
              <div className="bg-blue-600 text-white p-6 rounded-3xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Current Session</p>
                  <p className="text-lg font-black">{activeYear.name}</p>
                </div>
                <CalendarIcon className="opacity-20" size={32} />
              </div>
            </div>

            <div className="h-[400px]">
              <BigCalendarContainer type="classId" id={selectedStudent.classId} />
            </div>
          </div>
        )}
      </div>

      <div className="w-full xl:w-1/3">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2"><Bell size={20} /> Bulletins</h2>
            <Announcements data={announcements} />
        </div>
      </div>
    </div>
  );
};

export default ParentPage;