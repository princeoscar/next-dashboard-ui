import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Attendance, Student, Lesson, Class, Prisma } from "@prisma/client";
import { UserCheck, Calendar } from "lucide-react";

type AttendanceList = Attendance & {
  student: Student;
  lesson: Lesson & { class: Class };
};

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // --- 1. TYPED QUERY BUILDING ---
  const query: Prisma.AttendanceWhereInput = {};

  // --- 2. ROLE-BASED VISIBILITY ---
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson = { teacherId: userId! };
      break;
    case "student":
      query.studentId = userId!;
      break;
    case "parent":
      query.student = { parentId: userId! };
      break;
    default:
      query.id = -1; // Secure fallback: show nothing if role is undefined
      break;
  }

  // --- 3. SEARCH LOGIC ---
  if (queryParams.search) {
    query.OR = [
      { student: { name: { contains: queryParams.search, mode: "insensitive" } } },
      { student: { surname: { contains: queryParams.search, mode: "insensitive" } } },
    ];
  }

  // --- 4. DATA FETCHING ---
  const [data, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        lesson: { 
          include: { 
            class: { select: { name: true } } 
          } 
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: "desc" },
    }),
    prisma.attendance.count({ where: query }),
  ]);

  // --- 5. TABLE CONFIGURATION ---
  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Date", accessor: "date", className: "hidden sm:table-cell" },
    { header: "Status", accessor: "present" },
    { header: "Class / Lesson", accessor: "lesson", className: "hidden lg:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: AttendanceList) => (
    <tr 
      key={item.id} 
      className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-rubixSky/10 group-hover:text-rubixSky transition-colors">
            <UserCheck size={16} />
          </div>
          <span className="font-bold text-slate-700">
            {item.student.name} {item.student.surname}
          </span>
        </div>
      </td>
      <td className="hidden sm:table-cell p-4 text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-300" />
          {new Intl.DateTimeFormat("en-GB", { day: '2-digit', month: 'short' }).format(item.date)}
        </div>
      </td>
      <td className="p-4">
        <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
          item.present 
            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
            : "bg-rose-50 text-rose-600 border-rose-100"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${item.present ? "bg-emerald-500" : "bg-rose-500"}`} />
          {item.present ? "Present" : "Absent"}
        </div>
      </td>
      <td className="hidden lg:table-cell p-4">
        <div className="flex flex-col">
          <span className="text-slate-700 font-bold text-xs">{item.lesson.class.name}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.lesson.name}</span>
        </div>
      </td>
      {(role === "admin" || role === "teacher") && (
        <td className="p-4 text-right">
          <div className="flex items-center gap-2 justify-end">
            <FormContainer table="attendance" type="update" data={item} />
            <FormContainer table="attendance" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Attendance Log</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Daily Presence Tracking</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
            {(role === "admin" || role === "teacher") && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="attendance" type="create" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-50 overflow-hidden">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
      
      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default AttendanceListPage;