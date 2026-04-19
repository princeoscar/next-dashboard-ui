import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { FileText, Bell, UserCircle, Wallet, Calendar as CalendarIcon } from "lucide-react";
import ParentClientPage from "../list/parents/ParentClientPage";

const ParentPage = async () => {
  const { userId } = await auth();
  if (!userId) return null;




  // 1. Fetch Parent and Active Session


  const [parentData, activeYear] = await Promise.all([
    prisma.parent.findFirst({
      where: { clerkId: userId },
      include: {
        students: {
          include: {
            class: { select: { name: true } },
          },
        },
      },
    }) as any,
    prisma.academicYear.findFirst({
      where: { isCurrent: true },
    }),
  ]);

  console.log("DID I FIND PARENT?", !!parentData);
  console.log("DID I FIND ACTIVE YEAR?", !!activeYear);

  // 2. Immediate Error Checks (Inside the component scope)
  if (!parentData) return <div className="p-8 text-center">Parent profile not found.</div>;

  if (!activeYear) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 text-red-500 font-bold rounded-xl border border-red-100">
          ⚠️ Please contact Admin to set the active academic session.
        </div>
      </div>
    );
  }

  // 3. Prepare metadata and calculate fees for each student
  const childClassIds = parentData.students.map((s: any) => s.classId).filter(Boolean);

  const [announcements, events, messages, studentDataWithFees] = await Promise.all([
    prisma.announcement.findMany({
      where: { OR: [{ classId: null }, { classId: { in: childClassIds } }] },
      take: 5,
      orderBy: { date: "desc" }
    }),
    prisma.event.findMany({
      where: { OR: [{ classId: null }, { classId: { in: childClassIds } }] },
      take: 5,
      orderBy: { startTime: "asc" }
    }),
    prisma.message.findMany({
      where: { receiverId: userId },
      include: { sender: { select: { username: true } } },
      take: 5,
      orderBy: { createdAt: "desc" }
    }),
    // Map through students to calculate balances
    Promise.all(parentData.students.map(async (student: any) => {
      const fees = await prisma.feeStructure.findFirst({
        where: { gradeId: student.gradeId, academicYearId: activeYear.id }
      });
      const totalPaid = await prisma.payment.aggregate({
        where: { studentId: student.id, academicYearId: activeYear.id },
        _sum: { amountPaid: true }
      });
      const balance = Number(fees?.amount || 0) - Number(totalPaid._sum.amountPaid || 0);
      return { ...student, feeBalance: balance };
    }))
  ]);

  return (
    <div className="flex flex-col">
      {/* <div className="p-4">
        <ParentClientPage announcements={announcements} events={events} messages={messages} />
      </div> */}

      <div className="p-4 md:p-8 flex gap-8 flex-col xl:flex-row bg-slate-50/50 min-h-screen">
        <div className="w-full xl:w-2/3 flex flex-col gap-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Family Overview</h1>
          </div>

          {studentDataWithFees.map((student) => (
            <div
              key={student.id}
              className="bg-white p-4 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 mb-6"
            >
              {/* Header Section: Stack on mobile, Row on desktop */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-10">
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-xl md:rounded-2xl">
                    <UserCircle size={28} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">
                      {student.name} {student.surname}
                    </h2>
                    <span className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      Class {student.class?.name || "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Button: Full width on mobile */}
                <Link
                  href={`/print/${student.id}`}
                  target="_blank"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  <FileText size={14} /> Report Card
                </Link>
              </div>

              {/* STATS GRID: Ensure 1 column on tiny screens, 2 on tablet+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                {/* Fee Box */}
                <div className="bg-slate-900 text-white p-5 md:p-6 rounded-2xl md:rounded-3xl flex items-center justify-between">
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-bold uppercase opacity-60 tracking-widest text-slate-400">Fees Balance</p>
                    <p className="text-xl md:text-2xl font-black truncate">₦{student.feeBalance.toLocaleString()}</p>
                  </div>
                  <Wallet className="opacity-20 text-slate-400 shrink-0" size={32} />
                </div>

                {/* Session Box */}
                <div className="bg-blue-600 text-white p-5 md:p-6 rounded-2xl md:rounded-3xl flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase opacity-60 tracking-widest text-blue-100">Current Session</p>
                    <p className="text-sm md:text-lg font-black truncate">{activeYear.name}</p>
                  </div>
                  <CalendarIcon className="opacity-20 text-blue-100 shrink-0" size={32} />
                </div>
              </div>

              {/* CALENDAR: Reduce height on mobile */}
              <div className="bg-slate-50/50 rounded-2xl md:rounded-[2rem] p-2 md:p-4 border border-slate-50">
                <div className="h-[400px] md:h-[600px]">
                  {student.classId ? (
                    <BigCalendarContainer type="classId" id={student.classId} />
                  ) : (
                    <div className="h-full flex items-center justify-center font-bold text-slate-300">No Schedule</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full xl:w-1/3 flex flex-col gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-6">
              <Bell size={20} className="text-blue-500" /> Bulletins
            </h2>
            <Announcements data={announcements} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPage;