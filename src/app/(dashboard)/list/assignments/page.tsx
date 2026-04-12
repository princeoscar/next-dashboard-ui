import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Assignment, Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import { FileText, User, Clock } from "lucide-react";

type AssignmentList = Assignment & {
  lesson: Lesson & { subject: Subject; class: Class; teacher: Teacher };
};

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;

  // 1. TYPED QUERY BUILDING
  const query: Prisma.AssignmentWhereInput = {};
  const lessonQuery: Prisma.LessonWhereInput = {};

  // 2. ROLE-BASED VISIBILITY
  switch (role) {
    case "admin":
      break;
    case "teacher":
      lessonQuery.teacherId = userId!;
      break;
    case "student":
      lessonQuery.class = { students: { some: { id: userId! } } };
      break;
    case "parent":
      lessonQuery.class = { students: { some: { parentId: userId! } } };
      break;
    default:
      lessonQuery.id = -1; 
      break;
  }

  // 3. SEARCH & PARAMS
  if (queryParams.search) {
    lessonQuery.subject = {
      name: { contains: queryParams.search, mode: "insensitive" },
    };
  }
  if (queryParams.classId) {
    lessonQuery.classId = parseInt(queryParams.classId);
  }

  query.lesson = lessonQuery;

  // 4. PRISMA TRANSACTION
  const [data, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        lesson: {
          include: { subject: true, class: true, teacher: true },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { dueDate: "asc" }, 
    }),
    prisma.assignment.count({ where: query }),
  ]);

  // 5. COLUMN DEFINITION (Synced with Row Visibility)
  const columns = [
    { header: "Subject", accessor: "name", className: "pl-4" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell text-center" },
    { header: "Teacher", accessor: "teacher", className: "hidden lg:table-cell" },
    { header: "Due Date", accessor: "dueDate", className: "hidden lg:table-cell" },
    ...(role === "admin" || role === "teacher" 
      ? [{ header: "Actions", accessor: "action", className: "text-right pr-4" }] 
      : []),
  ];

  const renderRow = (item: AssignmentList) => {
    const isOverdue = new Date(item.dueDate) < new Date();
    
    return (
      <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group">
        {/* MAIN SUBJECT & MOBILE INFO */}
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex p-2 bg-rubixSky/10 text-rubixSky rounded-xl group-hover:bg-rubixSky group-hover:text-white transition-all shrink-0">
              <FileText size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-700 block tracking-tight leading-tight">
                {item.title || item.lesson.subject.name}
              </span>
              
              {/* MOBILE ONLY: Stacked Class and Date */}
              <div className="flex items-center gap-2 mt-1 md:hidden">
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500 border border-slate-200">
                  {item.lesson.class.name}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                   {new Intl.DateTimeFormat("en-GB", { day: '2-digit', month: 'short' }).format(item.dueDate)}
                </span>
              </div>
            </div>
          </div>
        </td>

        {/* CLASS CELL (Hidden on Mobile) */}
        <td className="hidden md:table-cell p-4 text-center">
          <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
            {item.lesson.class.name}
          </span>
        </td>

        {/* TEACHER CELL (Hidden on Tablet/Mobile) */}
        <td className="hidden lg:table-cell p-4 text-slate-500">
          <div className="flex items-center gap-2">
            <User size={14} className="text-slate-300" />
            <span className="font-medium text-xs">
               {item.lesson.teacher.name} {item.lesson.teacher.surname}
            </span>
          </div>
        </td>

        {/* DATE CELL (Hidden on Tablet/Mobile) */}
        <td className="hidden lg:table-cell p-4">
          <div className={`flex items-center gap-2 font-bold ${isOverdue ? 'text-rose-500' : 'text-slate-600'}`}>
            <Clock size={14} />
            <span className="tabular-nums">
               {new Intl.DateTimeFormat("en-GB", { day: '2-digit', month: 'short' }).format(item.dueDate)}
            </span>
          </div>
        </td>

        {/* ACTIONS CELL */}
        {(role === "admin" || role === "teacher") && (
          <td className="p-4">
            <div className="flex items-center gap-2 justify-end">
              <FormContainer table="assignment" type="update" data={item} />
              <FormContainer table="assignment" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">Assignment Portal</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Curriculum & Task Tracking</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end md:self-center">
            {(role === "admin" || role === "teacher") && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="assignment" type="create" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="rounded-3xl border border-slate-50 overflow-hidden bg-white">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* FOOTER SECTION */}
      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default AssignmentListPage;