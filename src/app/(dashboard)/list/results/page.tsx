import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { Trophy, FileText, User, Calendar, ClipboardCheck, ArrowLeft, ArrowRight } from "lucide-react";
import ClassSelector from "@/components/ClassSelector";
import Link from "next/link";

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { classId, search, studentId: selectedStudentId, subjectId } = params;
  const p = params.page ? parseInt(params.page) : 1;

  // --- 1. THE GALLERY VIEW (FOR PARENTS ONLY) ---
  if (role === "parent" && !selectedStudentId) {
    const children = await prisma.student.findMany({
      where: { parentId: userId! },
      include: {
        class: true,
        _count: { select: { results: true } }
      }
    });

    return (
      <div className="bg-white p-4 md:p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100 max-w-full overflow-hidden">
        <div className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <Trophy size={28} className="text-amber-400 fill-amber-400" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
              Academic <span className="text-amber-500">Report</span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1 ml-1">
            Select a child to view their performance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/list/results?studentId=${child.id}`}
              className="group p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <User size={40} strokeWidth={2.5} />
                </div>
                <h2 className="font-black text-xl text-slate-800 uppercase tracking-tighter">{child.name} {child.surname}</h2>
                <span className="px-4 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase mt-3 tracking-widest">
                  Class {child.class?.name || "N/A"}
                </span>

                <div className="mt-8 w-full pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Database</p>
                    <p className="text-sm font-black text-slate-600">{child._count.results} Records Found</p>
                  </div>
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

  // --- 2. CLASS SELECTOR (FOR ADMINS/TEACHERS) ---
  if (!classId && !search && role !== "student" && role !== "parent") {
    const classes = await prisma.class.findMany({
      where: { ...(role === "teacher" ? { supervisorId: userId! } : {}) },
      include: {
        level: true,
        supervisor: true,
        _count: {
          select: {
            subjects: true,
            assignments: true,
            exams: true,
          }
        }
      },
      orderBy: { name: "asc" },
    });

    return (
      <div className="bg-white p-4 md:p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100 max-w-full overflow-hidden">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Academic <span className="text-amber-500">Directory</span></h1>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1 ml-1">Select a class to manage results</p>
        </div>
        <ClassSelector classes={classes} role={role!} target="results" relatedData={{}} />
      </div>
    );
  }

  // --- 3. QUERY BUILDING ---
  const query: Prisma.ResultWhereInput = {};
  const andConditions: Prisma.ResultWhereInput[] = [];

  switch (role) {
    case "admin": break;
    case "teacher":
      andConditions.push({
        OR: [
          { exam: { teacherId: userId! } },
          { assignment: { teacherId: userId! } },
          { student: { class: { supervisorId: userId! } } },
        ],
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
      andConditions.push({ id: "0" });
      break;
  }

  if (subjectId) {
    andConditions.push({
      AND: [
        {
          OR: [
            { subjectId: parseInt(subjectId) },
            { exam: { subjectId: parseInt(subjectId) } },
            { assignment: { subjectId: parseInt(subjectId) } }
          ]
        }
      ]
    });
  }

  if (search) {
    andConditions.push({
      OR: [
        { exam: { title: { contains: search, mode: "insensitive" } } },
        { assignment: { title: { contains: search, mode: "insensitive" } } },
        { student: { name: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  if (classId) {
    andConditions.push({ student: { classId: parseInt(classId) } });
  }

  if (andConditions.length > 0) query.AND = andConditions;

  const cid = classId ? parseInt(classId) : undefined;

  // --- 4. DATA FETCHING ---
  const [data, count, exams, assignments, students, academicYears, subjects] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        subject: { select: { name: true } },
        exam: {
          include: {
            class: { select: { name: true } },
            subject: { select: { name: true } }
          }
        },
        assignment: {
          include: {
            class: { select: { name: true } },
            subject: { select: { name: true } }
          }
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { id: "desc" },
    }),
    prisma.result.count({ where: query }),
    prisma.exam.findMany({
      where: { classId: cid },
      select: {
        id: true,
        title: true,
        subject: { select: { name: true } }
      },
    }),
    prisma.assignment.findMany({
      where: { classId: cid },
      select: { id: true, title: true }
    }),
    prisma.student.findMany({
      where: { classId: cid },
      select: { id: true, name: true, surname: true },
      orderBy: { name: "asc" }
    }),
    prisma.academicYear.findMany({
      select: { id: true, name: true }
    }),
    prisma.subject.findMany({
      where: {
        classes: {
          some: {
            id: cid,
          },
        },
      },
      select: { id: true, name: true },
    }),
  ]);

  const relatedData = { exams, assignments, students, academicYears, subjects };

  // --- 5. RENDER TABLE ---
  const columns = [
    { header: "Subject & Student", accessor: "subject", className: "pl-2" },
    ...(role !== "student" ? [{ header: "Student", accessor: "student", className: "hidden md:table-cell" }] : []),
    { header: "C.A", accessor: "ca", className: "hidden sm:table-cell text-center" },
    { header: "Exam", accessor: "exam", className: "hidden sm:table-cell text-center" },
    { header: "Total", accessor: "total", className: "text-center w-[60px]" },
    { header: "Actions", accessor: "action", className: "text-right pr-4" },
  ];

  const renderRow = (item: any) => {
    const subjectName = item.subject?.name || item.exam?.subject?.name || item.assignment?.subject?.name || "Unknown";
    const studentFullname = `${item.student.name} ${item.student.surname}`;
    const caScore = (item.testScore ?? 0) + (item.assignmentScore ?? 0);
    const examScore = item.examScore ?? 0;
    const total = item.totalScore ?? 0;
    const scoreColor = total >= 70 ? "text-emerald-600" : total >= 50 ? "text-amber-600" : "text-rose-600";

    return (
      <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50 transition-all">
        <td className="p-2 pl-2 max-w-[150px] sm:max-w-none">
          <div className="flex flex-col gap-0.5">
            <span className="font-black text-slate-700 uppercase text-[11px] whitespace-normal">{subjectName}</span>
            <span className="md:hidden text-[10px] font-bold text-amber-600 uppercase tracking-tight whitespace-normal">
              {studentFullname}
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
              {item.examId ? "Final Exam" : "Assessment"}
            </span>
          </div>
        </td>

        {role !== "student" && (
          <td className="hidden md:table-cell p-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                {item.student.name[0]}
              </div>
              <span className="text-xs font-bold text-slate-600">
                {item.student.name} {item.student.surname}
              </span>
            </div>
          </td>
        )}

        <td className="p-4 text-center hidden sm:table-cell">
          <span className="text-xs font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
            {caScore}
          </span>
        </td>

        <td className="p-4 text-center hidden sm:table-cell">
          <span className="text-xs font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
            {examScore}
          </span>
        </td>

        <td className="p-4 text-center">
          <span className={`font-black text-lg ${scoreColor}`}>
            {total}<span className="text-[10px] ml-0.5">%</span>
          </span>
        </td>

        <td className="p-4 text-right">
          <div className="flex items-center gap-2 justify-end">
            <Link href={`/print/${item.studentId}`}>
              <button className="p-2 bg-slate-100 rounded-full hover:bg-amber-500 hover:text-white transition-all">
                <FileText size={14} />
              </button>
            </Link>
            {(role === "admin" || role === "teacher") && (
              <>
                <FormContainer table="result" type="update" data={item} relatedData={relatedData} />
                <FormContainer table="result" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    // 🎯 FIX: Converted padding to p-4 dynamically, enforced max-w-full containment rules
    <div className="bg-white p-4 md:p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-6">
        <div className="flex items-center gap-4">
          <Link href="/list/results" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            {role === "parent" ? "Child Performance" : "Registry"}
            {params.subjectId && (
              <span className="text-amber-500"> : {subjects.find(s => s.id.toString() === params.subjectId)?.name}</span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <TableSearch />
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="result" type="create" relatedData={relatedData} />
          )}
        </div>
      </div>

      <div className="relative mb-6">
        <div className="flex overflow-x-auto no-scrollbar items-center gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <Link
            href={`/list/results?classId=${classId}`}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${!params.subjectId
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
              }`}
          >
            All Subjects
          </Link>

          {subjects.map((sub: any) => (
            <Link
              key={sub.id}
              href={`/list/results?classId=${classId}&subjectId=${sub.id}`}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${params.subjectId === sub.id.toString()
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                }`}
            >
              {sub.name}
            </Link>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none sm:hidden" />
      </div>

      {/* 🎯 FIX: Applied overflow wrapper constraints around your generic custom Table layout */}
      <div className="rounded-3xl border border-slate-50 overflow-hidden bg-white shadow-sm w-full">
        <div className="w-full overflow-x-auto">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default ResultListPage;