import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma, Class, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { User, Phone, MapPin, Eye, GraduationCap } from "lucide-react";

type StudentList = Student & { class: Class };

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // --- 1. SEARCH & FILTER LOGIC ---
  const query: Prisma.StudentWhereInput = {};

  if (queryParams.search) {
    query.OR = [
      { name: { contains: queryParams.search, mode: "insensitive" } },
      { surname: { contains: queryParams.search, mode: "insensitive" } },
      { username: { contains: queryParams.search, mode: "insensitive" } },
    ];
  }

  if (queryParams.classId) {
    query.classId = parseInt(queryParams.classId);
  }

  // --- 2. ROLE-BASED DATA RESTRICTION ---
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.class = {
        lessons: {
          some: { teacherId: userId! },
        },
      };
      break;
    case "parent":
      query.parentId = userId!;
      break;
    case "student":
      query.id = userId!;
      break;
    default:
      query.id = "none";
      break;
  }

  // --- 3. DATA FETCHING ---
  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: "asc" },
    }),
    prisma.student.count({ where: query }),
  ]);

  const columns = [
    { header: "Student Info", accessor: "info" },
    { header: "Student ID", accessor: "studentId", className: "hidden md:table-cell" },
    { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "Contact", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Location", accessor: "address", className: "hidden lg:table-cell" },
    // Fix 1: Added text-right and padding to the header
    { header: "Actions", accessor: "action", className: "text-right pr-4" },
  ];

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src={item.img || "/noAvatar.png"}
            alt=""
            fill
            className="rounded-xl object-cover border border-slate-100 shadow-sm"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="font-black text-slate-700 tracking-tight leading-tight">
            {item.name} {item.surname}
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            {item.class?.name || "Unassigned"}
          </span>
        </div>
      </td>
      <td className="hidden md:table-cell p-4 text-slate-500 font-bold tabular-nums text-xs">
        #{item.username}
      </td>
      <td className="hidden md:table-cell p-4">
        <div className="flex items-center gap-2 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg w-fit border border-indigo-100">
          <GraduationCap size={14} />
          <span className="text-[10px] font-black uppercase">
            Level {item.class?.name.match(/\d+/)?.[0] || "-"}
          </span>
        </div>
      </td>
      <td className="hidden lg:table-cell p-4 text-slate-500">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-slate-300" />
          <span className="text-xs font-bold tabular-nums">{item.phone || "---"}</span>
        </div>
      </td>
      <td className="hidden lg:table-cell p-4 text-slate-400 text-xs italic">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-300" />
          <span className="truncate max-w-[120px] font-medium">{item.address}</span>
        </div>
      </td>
      {/* Fix 2: Prevent buttons from wrapping or disappearing on mobile */}
      <td className="p-4">
        <div className="flex items-center gap-2 justify-end">
          <span className="text-red-500 font-bold">HERE!</span>
          <Link href={`/list/students/${item.id}`}>
            <button className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl
             bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-all border border-sky-100 shadow-sm">
              <Eye size={16} />
            </button>
          </Link>
          {role === "admin" && (
            <div className="flex items-center gap-2 flex-nowrap shrink-0">
              <FormContainer table="student" type="update" data={item} />
              <FormContainer table="student" type="delete" id={item.id} />
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">Student Registry</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-2">Enrollment & Profile Management</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
            {role === "admin" && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="student" type="create" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fix 3: Added overflow-x-auto to handle very small screens */}
      <div className="rounded-3xl border border-slate-50 overflow-x-auto bg-white">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default StudentListPage;