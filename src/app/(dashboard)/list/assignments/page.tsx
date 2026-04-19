import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Assignment, Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import { FileText, User, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import ClassSelector from "@/components/ClassSelector";
import Link from "next/link";

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
            <FileText size={28} className="text-sky-400" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
              Course <span className="text-sky-400">Work</span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1 ml-1">
            Select a child to view their assignments
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/list/assignments?studentId=${child.id}`}
              className="group p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-sky-50 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-110 group-hover:bg-sky-400 group-hover:text-white transition-all">
                  <User size={40} strokeWidth={2.5} />
                </div>
                <h2 className="font-black text-xl text-slate-800 uppercase tracking-tighter">{child.name} {child.surname}</h2>
                <span className="px-4 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase mt-3 tracking-widest">
                  Class {child.class?.name || "N/A"}
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
        <div className="mb-10 text-center md:text-left text-sky-400">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Assignment <span className="text-sky-400">Center</span></h1>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1">Select class to manage tasks</p>
        </div>
        <ClassSelector classes={classes} role={role!} target="assignments" relatedData={{}} />
      </div>
    );
  }

  // --- 3. QUERY BUILDING ---
  const query: Prisma.AssignmentWhereInput = {};
  const andConditions: Prisma.AssignmentWhereInput[] = [];

  switch (role) {
    case "admin": break;
    case "teacher":
      andConditions.push({
        lesson: {
          OR: [{ teacherId: userId! }, { class: { supervisorId: userId! } }]
        }
      });
      break;
    case "student":
      andConditions.push({ lesson: { class: { students: { some: { id: userId! } } } } });
      break;
    case "parent":
      // 🔒 Lockdown: Parent sees assignments for the class their selected child belongs to
      andConditions.push({
        lesson: {
          class: {
            students: {
              some: { id: selectedStudentId, parentId: userId! }
            }
          }
        }
      });
      break;
    default:
      andConditions.push({ id: -1 });
      break;
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
    andConditions.push({ lesson: { classId: parseInt(classId) } });
  }

  if (andConditions.length > 0) query.AND = andConditions;

  // --- 4. DATA FETCHING ---
  const [data, count, lessons] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: { lesson: { include: { subject: true, class: true, teacher: true } } },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { dueDate: "asc" },
    }),
    prisma.assignment.count({ where: query }),
    prisma.lesson.findMany({
      where: role === "teacher" ? { teacherId: userId! } : {},
      select: { id: true, subject: { select: { name: true } }, class: { select: { name: true } } },
    }),
  ]);

  const relatedData = { lessons };

  // --- 5. RENDER TABLE ---
  const columns = [
    { header: "Subject", accessor: "name", className: "pl-4" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell text-center" },
    { header: "Due Date", accessor: "dueDate", className: "hidden lg:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action", className: "text-right pr-4" }] : []),
  ];

  const renderRow = (item: AssignmentList) => {
    const isOverdue = new Date(item.dueDate) < new Date();

    return (
      <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 text-sky-400 rounded-xl shrink-0 group-hover:bg-sky-400 group-hover:text-white transition-all">
              <FileText size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-700 block tracking-tight leading-tight uppercase text-[11px]">
                {item.title || "Coursework"}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                {item.lesson.subject.name}
              </span>
            </div>
          </div>
        </td>
        <td className="hidden md:table-cell p-4 text-center">
          <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-100 text-[10px] font-black uppercase text-slate-400">
            {item.lesson.class.name}
          </span>
        </td>
        <td className="hidden lg:table-cell p-4">
          <div className={`flex items-center gap-2 font-black ${isOverdue ? 'text-rose-400' : 'text-slate-500'}`}>
            <Clock size={14} className={isOverdue ? 'animate-pulse' : 'text-slate-300'} />
            <span className="tabular-nums text-[11px]">
              {new Intl.DateTimeFormat("en-GB", { day: '2-digit', month: 'short' }).format(new Date(item.dueDate))}
            </span>
          </div>
        </td>
        {(role === "admin" || role === "teacher") && (
          <td className="p-4 text-right">
            <div className="flex items-center gap-2 justify-end">
              <FormContainer table="assignment" type="update" data={item} relatedData={relatedData} />
              <FormContainer table="assignment" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-6">
        <div className="flex items-center gap-4">
          <Link href="/list/assignments" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
            {selectedStudentId ? "Pending Tasks" : "Assignment Registry"}
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <TableSearch />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-50 overflow-hidden bg-white shadow-sm">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {!data.length && (
        <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[2rem] mt-4">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No assignments found</p>
        </div>
      )}

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default AssignmentListPage;