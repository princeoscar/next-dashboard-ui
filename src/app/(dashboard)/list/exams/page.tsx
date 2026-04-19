import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Exam, Lesson, Subject, Class, Teacher, Prisma } from "@prisma/client";
import { GraduationCap, Calendar, User, ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";
import ClassSelector from "@/components/ClassSelector";
import Link from "next/link";

type ExamList = Exam & {
  lesson: Lesson & { subject: Subject; class: Class; teacher: Teacher };
};

const ExamListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const params = await searchParams;
  const p = params.page ? parseInt(params.page) : 1;
  const { classId, search, studentId: selectedStudentId } = params;

  // --- 1. PARENT GALLERY VIEW ---
  if (role === "parent" && !selectedStudentId) {
    const children = await prisma.student.findMany({
      where: { parentId: userId! },
      include: { 
        class: true, 
      }
    });

    return (
      <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
        <div className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <GraduationCap size={28} className="text-blue-600" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
              Exam <span className="text-blue-600">Schedules</span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1 ml-1">
            Select a child to view their upcoming examinations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Link 
              key={child.id} 
              href={`/list/exams?studentId=${child.id}`}
              className="group p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <User size={40} strokeWidth={2.5} />
                 </div>
                 <h2 className="font-black text-xl text-slate-800 uppercase tracking-tighter">{child.name} {child.surname}</h2>
                 <span className="px-4 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase mt-3 tracking-widest">
                   Class {child.class?.name || "Unassigned"}
                 </span>
                 
                 <div className="mt-8 w-full pt-6 border-t border-slate-100 flex justify-end items-center">
                   <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                     <ArrowRight size={20} />
                   </div>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // --- 2. ADMIN/TEACHER CLASS SELECTOR ---
  if (!classId && !search && role !== "student" && role !== "parent") {
    const classes = await prisma.class.findMany({
      where: { ...(role === "teacher" ? { supervisorId: userId! } : {}) },
      include: { grade: true, supervisor: true, _count: { select: { lessons: true } } },
      orderBy: { name: "asc" },
    });

    return (
      <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Exam <span className="text-blue-600">Portal</span></h1>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1">Select class to manage schedules</p>
        </div>
        <ClassSelector classes={classes} role={role!} target="exams" relatedData={{}} />
      </div>
    );
  }

  // --- 3. QUERY BUILDING ---
  const query: Prisma.ExamWhereInput = {};
  const andConditions: Prisma.ExamWhereInput[] = [];

  if (role === "student") {
    const student = await prisma.student.findUnique({ where: { id: userId! }, select: { classId: true } });
    andConditions.push({ lesson: { classId: student?.classId || -1 } });
  } else if (role === "parent") {
    const child = await prisma.student.findFirst({
        where: { id: selectedStudentId, parentId: userId! },
        select: { classId: true }
    });
    andConditions.push({ lesson: { classId: child?.classId || -1 } });
  } else if (role === "teacher") {
    andConditions.push({
      lesson: {
        OR: [{ teacherId: userId! }, { class: { supervisorId: userId! } }]
      }
    });
  }

  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { lesson: { subject: { name: { contains: search, mode: "insensitive" } } } }
      ]
    });
  }

  if (classId) {
    const cid = parseInt(classId);
    if (!isNaN(cid)) andConditions.push({ lesson: { classId: cid } });
  }

  if (andConditions.length > 0) query.AND = andConditions;

  // --- 4. DATA FETCHING ---
  const [data, count, lessons] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: { lesson: { include: { subject: true, class: true, teacher: true } } },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { startTime: "asc" },
    }),
    prisma.exam.count({ where: query }),
    prisma.lesson.findMany({
      where: role === "teacher" ? { teacherId: userId! } : {},
      select: { id: true, subject: { select: { name: true } }, class: { select: { name: true } } },
    }),
  ]);

  const relatedData = { lessons };

  // --- 5. RENDER ---
  const columns = [
    { header: "Subject", accessor: "name", className: "pl-4" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell text-center" },
    { header: "Date", accessor: "date", className: "hidden lg:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action", className: "text-right pr-4" }] : []),
  ];

  const renderRow = (item: ExamList) => {
    const isToday = new Date(item.startTime).toDateString() === new Date().toDateString();
    return (
      <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <GraduationCap size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-700 uppercase text-[11px]">{item.lesson.subject.name}</span>
              <span className="text-xs text-slate-400 font-bold">{item.title || "Term Assessment"}</span>
            </div>
          </div>
        </td>
        <td className="hidden md:table-cell p-4 text-center">
          <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-100 text-[10px] font-black uppercase text-slate-400">
            {item.lesson.class.name}
          </span>
        </td>
        <td className="hidden lg:table-cell p-4">
          <div className={`flex items-center gap-2 font-black ${isToday ? 'text-amber-500' : 'text-slate-500'}`}>
            <Calendar size={14} className={isToday ? 'animate-pulse' : 'text-slate-300'} />
            <span className="text-[11px] uppercase tabular-nums">
              {new Intl.DateTimeFormat("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.startTime))}
            </span>
          </div>
        </td>
        {(role === "admin" || role === "teacher") && (
          <td className="p-4 text-right">
            <div className="flex items-center gap-2 justify-end">
              {/* NEW: Input Results Button for Teachers */}
              <Link href={`/list/results/entry?examId=${item.id}`}>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                  <ClipboardCheck size={16} />
                </button>
              </Link>
              <FormContainer table="exam" type="update" data={item} relatedData={relatedData} />
              <FormContainer table="exam" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <Link href="/list/exams" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
             {selectedStudentId ? "Schedule" : "Exam Directory"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <TableSearch />
          {role === "admin" && <FormContainer table="exam" type="create" relatedData={relatedData} />}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-50 overflow-hidden bg-white shadow-sm">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {!data.length && (
          <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[2rem] mt-4">
            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No scheduled exams found</p>
          </div>
      )}

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default ExamListPage;