import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Eye, Phone, UserCheck, Info } from "lucide-react";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // --- 1. SEARCH & FILTER LOGIC ---
  const query: Prisma.TeacherWhereInput = {};

  if (queryParams.search) {
    query.OR = [
      { name: { contains: queryParams.search, mode: "insensitive" } },
      { surname: { contains: queryParams.search, mode: "insensitive" } },
      { email: { contains: queryParams.search, mode: "insensitive" } },
      { username: { contains: queryParams.search, mode: "insensitive" } },
      { subjects: { some: { name: { contains: queryParams.search, mode: "insensitive" } } } },
    ];
  }

  // --- 2. DATA FETCHING ---
  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: { select: { id: true, name: true } },
        classes: { select: { id: true, name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: "asc" },
    }),
    prisma.teacher.count({ where: query }),
  ]);

  const columns = [
    { header: "Teacher Info", accessor: "info" },
    { header: "ID", accessor: "teacherId", className: "hidden md:table-cell" },
    { header: "Subjects", accessor: "subjects", className: "hidden md:table-cell" },
    { header: "Classes", accessor: "classes", className: "hidden md:table-cell" },
    { header: "Contact", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item: TeacherList) => (
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
          <p className="text-[10px] text-slate-400 font-bold lowercase tracking-wider mt-0.5">
            {item.email}
          </p>
        </div>
      </td>
      <td className="hidden md:table-cell p-4 text-slate-500 font-bold tabular-nums text-xs">
        #{item.username}
      </td>
      <td className="hidden md:table-cell p-4">
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {item.subjects.map((s) => (
            <span key={s.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black uppercase border border-indigo-100">
              {s.name}
            </span>
          ))}
        </div>
      </td>
      <td className="hidden md:table-cell p-4">
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {item.classes.length > 0 ? (
            item.classes.map((c) => (
              <span key={c.id} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase border border-emerald-100">
                {c.name}
              </span>
            ))
          ) : (
            <span className="text-[9px] text-slate-300 font-black uppercase italic tracking-tighter">No Classes</span>
          )}
        </div>
      </td>
      <td className="hidden lg:table-cell p-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Phone size={14} className="text-slate-300" />
          <span className="text-xs font-bold tabular-nums">{item.phone || "---"}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-all border border-sky-100 shadow-sm">
              <Eye size={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormContainer table="teacher" type="update" data={item} />
              <FormContainer table="teacher" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck size={20} className="text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Faculty Directory</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase ml-7">Academic Staff Management</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
            {role === "admin" && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="teacher" type="create" />
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

export default TeacherListPage;