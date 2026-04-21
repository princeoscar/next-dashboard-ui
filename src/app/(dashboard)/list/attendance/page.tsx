import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Attendance, Lesson, Class, Prisma } from "@prisma/client";
import { UserCheck, Calendar, ArrowLeft, ArrowRight, User } from "lucide-react";
import ClassSelector from "@/components/ClassSelector";
import Link from "next/link";

type AttendanceList = Attendance & {
  student: { name: string; surname: string };
  lesson: Lesson & { class: Class };
};

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const params = await searchParams;
  const p = params.page ? parseInt(params.page) : 1;
  const { classId, search, studentId: selectedStudentId } = params;

  // --- 1. PARENT GALLERY VIEW ---
  if (role === "parent" && !selectedStudentId) {
    const children = await prisma.student.findMany({
      where: { parentId: userId! },
      include: { class: true }
    });

    return (
      <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
        <div className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <UserCheck size={28} className="text-blue-500" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
              Attendance <span className="text-blue-500">Logs</span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1 ml-1">
            Select a child to view their daily attendance records
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/list/attendance?studentId=${child.id}`}
              className="group p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
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
        <div className="mb-10 text-center md:text-left text-blue-500">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Attendance <span className="text-blue-500">Registry</span></h1>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1">Select class to manage daily logs</p>
        </div>
        <ClassSelector classes={classes} role={role!} target="attendance" relatedData={{}} />
      </div>
    );
  }

  // --- 3. CONSOLIDATED QUERY BUILDING ---
  const query: Prisma.AttendanceWhereInput = {};
  const andConditions: Prisma.AttendanceWhereInput[] = [];

  switch (role) {
    case "admin":
      break;
    case "teacher":
      andConditions.push({
        OR: [
          { lesson: { teacherId: userId! } },
          { student: { class: { supervisorId: userId! } } }
        ]
      });
      break;
    case "student":
      andConditions.push({ studentId: userId! });
      break;
    case "parent":
      andConditions.push({
        studentId: selectedStudentId,
        student: { parentId: userId! }
      });
      break;
    default:
      andConditions.push({ id: -1 });
      break;
  }

  if (search) {
    andConditions.push({
      student: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { surname: { contains: search, mode: "insensitive" } },
        ]
      }
    });
  }

  if (classId) {
    andConditions.push({ student: { classId: parseInt(classId) } });
  }

  if (andConditions.length > 0) query.AND = andConditions;

  // --- 4. DATA FETCHING ---
  const [data, count, lessons, students] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        lesson: { include: { class: { select: { name: true } } } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: "desc" },
    }),
    prisma.attendance.count({ where: query }),
    prisma.lesson.findMany({
      where: role === "teacher" ? { teacherId: userId! } : {},
      select: { id: true, name: true, class: { select: { name: true } } }
    }),
    prisma.student.findMany({
    where: {
      ...(role === "parent" ? { parentId: userId! } : {}),
      ...(classId ? { classId: parseInt(classId) } : {}), // Link students to the specific class
    },
    select: { id: true, name: true, surname: true, classId: true }
  })
]);

  const relatedData = { lessons, students };

  // --- 5. TABLE CONFIGURATION ---
  const columns = [
    { header: "Student", accessor: "student", className: "pl-4" },
    { header: "Date", accessor: "date", className: "hidden sm:table-cell" },
    { header: "Status", accessor: "present" },
    { header: "Class / Lesson", accessor: "lesson", className: "hidden lg:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action", className: "w-[100px] text-right", }] : []),
  ];

  const renderRow = (item: AttendanceList) => (
    <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
            <UserCheck size={16} />
          </div>
          <span className="font-bold text-slate-700">{item.student.name} {item.student.surname}</span>
        </div>
      </td>
      <td className="hidden sm:table-cell p-4 text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-300" />
          <span className="tabular-nums">
            {new Intl.DateTimeFormat("en-GB").format(new Date(item.date))}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${item.present ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
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
        <td className="p-4 text-right gap-2">
          <div className="flex items-center gap-2 justify-end">
            <FormContainer table="attendance" type="update" data={item} relatedData={relatedData} />
            <FormContainer table="attendance" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <Link href="/list/attendance" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
            {selectedStudentId ? `Daily Status` : "Log Registry"}
          </h1>
        </div>
        <TableSearch />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {role === "teacher" && classId && (
          <FormContainer
            table="attendance"
            type="create"
            relatedData={{
              lessons: lessons, // The lessons fetched in your transaction
              students: students // The students fetched in your transaction
            }}
          />
        )}
      </div>

      <div className="rounded-3xl border border-slate-50 overflow-hidden shadow-sm bg-white">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {!data.length && (
        <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[2rem] mt-4">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No attendance records found</p>
        </div>
      )}

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default AttendanceListPage;