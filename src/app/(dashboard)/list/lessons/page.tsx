import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import {prisma} from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import { BookOpen, User, Users, Calendar } from "lucide-react";

type LessonList = Lesson & { subject: Subject } & { class: Class } & { teacher: Teacher };

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;

  // --- 1. TYPE-SAFE QUERY BUILDING ---
  const query: Prisma.LessonWhereInput = {};

  // Role-Based Filtering (The Security Layer)
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.teacherId = userId!;
      break;
    case "student":
      query.class = { students: { some: { id: userId! } } };
      break;
    case "parent":
      query.class = { students: { some: { parentId: userId! } } };
      break;
    default:
      query.id = -1; // Secure fallback
      break;
  }

  // Search Logic (Subject name or Teacher name)
  if (queryParams.search) {
    query.OR = [
      { subject: { name: { contains: queryParams.search, mode: "insensitive" } } },
      { teacher: { name: { contains: queryParams.search, mode: "insensitive" } } },
      { teacher: { surname: { contains: queryParams.search, mode: "insensitive" } } },
    ];
  }

  // Class Filter (from URL params)
  if (queryParams.classId) {
    query.classId = parseInt(queryParams.classId);
  }

  // --- 2. DATA FETCHING ---
  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: [
        { day: "asc" },
        { startTime: "asc" }
      ],
    }),
    prisma.lesson.count({ where: query }),
  ]);

  const columns = [
    { header: "Subject", accessor: "name" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Schedule", accessor: "schedule", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: LessonList) => {
    // Ensure startTime is a Date object for formatting
    const startTimeDate = new Date(item.startTime);
    
    return (
      <tr 
        key={item.id} 
        className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group"
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rubixSky/10 text-rubixSky rounded-xl group-hover:bg-rubixSky group-hover:text-white transition-all">
              <BookOpen size={16} />
            </div>
            <span className="font-black text-slate-700 tracking-tight">{item.subject.name}</span>
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Users size={14} className="text-slate-300" />
            <span className="font-bold text-xs">{item.class.name}</span>
          </div>
        </td>
        <td className="hidden md:table-cell p-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <User size={12} />
            </div>
            <span className="text-slate-600 text-xs font-medium">
              {item.teacher.name} {item.teacher.surname}
            </span>
          </div>
        </td>
        <td className="hidden lg:table-cell p-4">
          <div className="flex items-center gap-2 w-fit px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
            <Calendar size={12} />
            <span className="tabular-nums">
              {/* Added a helper to handle the Enum string and Date formatting */}
              {item.day.toString().toLowerCase()} • {startTimeDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </td>
        {role === "admin" && (
          <td className="p-4 text-right">
            <div className="flex items-center gap-2 justify-end">
              <FormContainer table="lesson" type="update" data={item} />
              <FormContainer table="lesson" type="delete" id={item.id} />
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
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Curriculum Lessons</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Academic Timetable Overview</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
            {role === "admin" && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="lesson" type="create" />
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

export default LessonListPage;