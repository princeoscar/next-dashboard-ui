import { prisma } from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import FormContainer from "@/components/FormContainer";
import ClassSelector from "@/components/ClassSelector";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Eye } from "lucide-react";

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, classId, search } = params;
  const p = page ? parseInt(page) : 1;

  // --- PRE-FETCH COMMON DATA FOR FORMS ---
  // This prevents the "relatedData is undefined" error in StudentForm
  const [grades, classesList, parentsList] = await prisma.$transaction([
    prisma.grade.findMany({ select: { id: true, level: true } }),
    prisma.class.findMany({
      select: {
        id: true,
        name: true,
        capacity: true, // You likely need this too if you're showing "X / Capacity"
        _count: {
          select: { students: true }
        }
      }
    }),
    prisma.parent.findMany({ select: { id: true, name: true, surname: true } }),
  ]);

  const relatedData = { grades, classes: classesList, parents: parentsList };

  // --- 1. SEGMENT VIEW (CLASS CARDS) ---
  if (!classId && !search && role !== "student" && role !== "parent") {
    const classes = await prisma.class.findMany({
      where: {
        ...(role === "teacher" ? { supervisorId: userId! } : {}),
      },
      include: {
        grade: true,
        _count: { select: { students: true, lessons: true } },
        supervisor: true,
      },
      orderBy: { name: "asc" },
    });

    // Teachers need to see their info, but they aren't 'students', 
    // so we only fetch student-specific info if the role is student.
    return (
      <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Student <span className="text-rubixPurple">Records</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">
            Select a class segment to view student rosters
          </p>
        </div>
        <ClassSelector
          classes={classes}
          role={role || "admin"}
          target="students"
          relatedData={relatedData}
        />
      </div>
    );
  }

  // --- 2. TABLE VIEW LOGIC ---
  const columns = [
    { header: "Info", accessor: "info", className: "pl-2 md:pl-4" },
    { header: "Username", accessor: "username", className: "hidden md:table-cell" },
    { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
    { header: "Actions", accessor: "action", className: "text-right pr-2 md:pr-4" },
  ];

  const query: Prisma.StudentWhereInput = {};

  if (role === "teacher") {
    query.class = { supervisorId: userId! };
  }

  if (classId) {
    query.classId = parseInt(classId);
  }

  if (search) {
    query.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { surname: { contains: search, mode: "insensitive" } },
    ];
  }

  const students = await prisma.student.findMany({
    where: query,
    include: { class: true },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  });

  const count = await prisma.student.count({ where: query });

  const renderRow = (item: Student & { class: Class | null }) => (
    <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group">
      <td className="flex items-center gap-2 md:gap-4 p-2 md:p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover border border-slate-100"
        />
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-700">{item.name} {item.surname}</h3>
          <p className="text-xs text-slate-400 font-medium">{item.class?.name || "Unassigned"}</p>
        </div>
      </td>
      <td className="hidden md:table-cell text-slate-500">{item.username}</td>
      <td className="hidden md:table-cell">
        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase text-slate-500">
          {item.class?.name.charAt(0) || "-"}
        </span>
      </td>
      <td className="hidden md:table-cell text-slate-500">{item.phone || "-"}</td>
      <td className="hidden lg:table-cell text-slate-500">{item.address || "-"}</td>
      <td className="p-2 md:p-4 text-right">
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-rubixSky hover:text-white transition-all shadow-sm">
              <Eye size={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer table="student" type="delete" id={item.id} />
          )}
          {role === "admin" && (
            <FormContainer table="student" type="update" data={item} relatedData={relatedData} />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-2 md:p-8 rounded-2xl md:rounded-[2.5rem] flex-1 m-1 md:m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <Link href="/list/students" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <ArrowLeftIcon size={20} />
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
            {classId ? `Class Roster` : "Search Results"}
          </h1>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <TableSearch />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100">
              <Image src="/filter.png" alt="" width={16} height={16} />
            </button>
            {role === "admin" && <FormContainer table="student" type="create" relatedData={relatedData} />}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-50 overflow-hidden bg-white shadow-sm">
        <Table columns={columns} renderRow={renderRow} data={students} />
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

const ArrowLeftIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
);

export default StudentListPage;