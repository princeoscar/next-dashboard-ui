import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Exam, Lesson, Subject, Class, Teacher, Prisma } from "@prisma/client";
import { GraduationCap, Calendar, User } from "lucide-react";

type ExamList = Exam & {
  lesson: Lesson & { subject: Subject; class: Class; teacher: Teacher };
};

const ExamListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // --- 1. TYPE-SAFE NESTED QUERY BUILDING ---
  const query: Prisma.ExamWhereInput = {};
  const lessonQuery: Prisma.LessonWhereInput = {};

  // --- 2. ROLE-BASED VISIBILITY (Security Layer) ---
  switch (role) {
    case "admin":
      break;
    case "teacher":
      lessonQuery.teacherId = userId!;
      break;
    case "student":
      lessonQuery.class = { 
        students: { some: { id: userId! } } 
      };
      break;
    case "parent":
      lessonQuery.class = { 
        students: { some: { parentId: userId! } } 
      };
      break;
    default:
      lessonQuery.id = -1; // Fallback for unknown roles
      break;
  }

  // --- 3. SEARCH & PARAMS ---
  if (queryParams.search) {
    lessonQuery.subject = {
      name: { contains: queryParams.search, mode: "insensitive" },
    };
  }
  
  if (queryParams.classId) {
    lessonQuery.classId = parseInt(queryParams.classId);
  }

  // Assign the lesson filter to the main exam query
  query.lesson = lessonQuery;

  // --- 4. DATA FETCHING ---
  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lesson: {
          include: { subject: true, class: true, teacher: true },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { startTime: "asc" }, 
    }),
    prisma.exam.count({ where: query }),
  ]);

  // --- 5. TABLE CONFIGURATION ---
  const columns = [
    { header: "Subject", accessor: "name" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Exam Date", accessor: "date", className: "hidden lg:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ExamList) => {
    const isToday = new Date(item.startTime).toDateString() === new Date().toDateString();

    return (
      <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rubixPurple/10 text-rubixPurple rounded-xl group-hover:bg-rubixPurple group-hover:text-white transition-all">
              <GraduationCap size={16} />
            </div>
            <div>
              <span className="font-black text-slate-700 block tracking-tight">
                {item.title || item.lesson.subject.name}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Final Assessment
              </span>
            </div>
          </div>
        </td>
        <td className="p-4">
          <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
            {item.lesson.class.name}
          </span>
        </td>
        <td className="hidden md:table-cell p-4 text-slate-500">
          <div className="flex items-center gap-2">
            <User size={14} className="text-slate-300" />
            <span className="font-medium text-xs">
              {item.lesson.teacher.name} {item.lesson.teacher.surname}
            </span>
          </div>
        </td>
        <td className="hidden lg:table-cell p-4">
          <div className={`flex items-center gap-2 font-bold ${isToday ? 'text-amber-500' : 'text-slate-600'}`}>
            <Calendar size={14} className={isToday ? 'animate-bounce' : ''} />
            <span className="tabular-nums">
              {new Intl.DateTimeFormat("en-GB", { day: '2-digit', month: 'short' }).format(item.startTime)}
            </span>
          </div>
        </td>
        {(role === "admin" || role === "teacher") && (
          <td className="p-4 text-right">
            <div className="flex items-center gap-2 justify-end">
              <FormContainer table="exam" type="update" data={item} />
              <FormContainer table="exam" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Exam Schedule</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Official Performance Reviews</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
            {(role === "admin" || role === "teacher") && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="exam" type="create" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-50 overflow-hidden bg-white">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default ExamListPage;