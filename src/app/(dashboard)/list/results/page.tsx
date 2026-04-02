import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { Trophy, FileText, User, Calendar, ClipboardCheck } from "lucide-react";

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // --- 1. ROLE-BASED ACCESS CONTROL ---
  const query: Prisma.ResultWhereInput = {};

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: userId! } } },
        { assignment: { lesson: { teacherId: userId! } } },
      ];
      break;
    case "student":
      query.studentId = userId!;
      break;
    case "parent":
      query.student = { parentId: userId! };
      break;
    default:
      query.id = -1; // Secure fallback
      break;
  }

  // --- 2. SEARCH FILTERING ---
  if (queryParams.search) {
    query.OR = [
      ...(query.OR || []),
      { exam: { title: { contains: queryParams.search, mode: "insensitive" } } },
      { assignment: { title: { contains: queryParams.search, mode: "insensitive" } } },
      { student: { name: { contains: queryParams.search, mode: "insensitive" } } },
      { student: { surname: { contains: queryParams.search, mode: "insensitive" } } },
    ];
  }

  // --- 3. DATA FETCHING ---
  const [data, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: { 
            include: { 
                lesson: { include: { class: true, subject: true } } 
            } 
        },
        assignment: { 
            include: { 
                lesson: { include: { class: true, subject: true } } 
            } 
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { id: "desc" },
    }),
    prisma.result.count({ where: query }),
  ]);

  const columns = [
    { header: "Subject", accessor: "name" },
    { header: "Student", accessor: "student" },
    { header: "Score", accessor: "score", className: "hidden md:table-cell" },
    { header: "Type", accessor: "type", className: "hidden md:table-cell" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden lg:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: any) => {
    const assessment = item.exam || item.assignment;
    const isExam = !!item.exam;
    
    // 4. PERFORMANCE COLOR LOGIC
    // Emerald for A+, RubixSky for Passing, Rose for failing
    const scoreColor = item.score >= 80 
        ? "text-emerald-600" 
        : item.score >= 50 
        ? "text-rubixSky" 
        : "text-rose-500";

    return (
      <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-all ${
                isExam 
                ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' 
                : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
            }`}>
              {isExam ? <ClipboardCheck size={16} /> : <FileText size={16} />}
            </div>
            <span className="font-black text-slate-700 tracking-tight">
                {assessment?.lesson.subject.name || "Unknown Subject"}
            </span>
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <User size={14} className="text-slate-300" />
            <span className="text-slate-600 font-medium">{item.student.name} {item.student.surname}</span>
          </div>
        </td>
        <td className={`hidden md:table-cell p-4 font-black text-lg tabular-nums ${scoreColor}`}>
          {item.score}%
        </td>
        <td className="hidden md:table-cell p-4">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
            isExam 
            ? "bg-indigo-50 text-indigo-700 border-indigo-100" 
            : "bg-emerald-50 text-emerald-700 border-emerald-100"
          }`}>
            {isExam ? "Exam" : "Assignment"}
          </span>
        </td>
        <td className="hidden md:table-cell p-4">
          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter">
            {assessment?.lesson.class.name || "N/A"}
          </span>
        </td>
        <td className="hidden lg:table-cell p-4 text-slate-500 text-xs font-bold">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-slate-300" />
            {(() => {
              const dateVal = isExam ? item.exam?.startTime : item.assignment?.startDate;
              return dateVal ? new Intl.DateTimeFormat("en-GB").format(new Date(dateVal)) : "--/--/--";
            })()}
          </div>
        </td>
        {(role === "admin" || role === "teacher") && (
          <td className="p-4">
            <div className="flex items-center gap-2 justify-end">
                <FormContainer table="result" type="update" data={item} />
                <FormContainer table="result" type="delete" id={item.id} />
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
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={20} className="text-amber-400 fill-amber-400" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Academic Results</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase ml-7">Performance & Grade Registry</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
            {(role === "admin" || role === "teacher") && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="result" type="create" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-50 overflow-hidden bg-white">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {!data.length && (
         <div className="py-20 text-center">
            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No results published yet</p>
         </div>
      )}

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default ResultListPage;