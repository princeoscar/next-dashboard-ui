import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma, Subject, Teacher } from "@prisma/client";
import { BookMarked, User, GraduationCap, Info } from "lucide-react";

type SubjectList = Subject & { teachers: Teacher[] };

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // --- 1. TYPE-SAFE QUERY BUILDING ---
  const query: Prisma.SubjectWhereInput = {};

  if (queryParams.search) {
    query.name = { contains: queryParams.search, mode: "insensitive" };
  }

  // --- 2. DATA FETCHING ---
  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teachers: { 
          select: { id: true, name: true, surname: true },
          orderBy: { name: "asc" } 
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: "asc" },
    }),
    prisma.subject.count({ where: query }),
  ]);

  const columns = [
    { header: "Subject Name", accessor: "name" },
    { header: "Teaching Faculty", accessor: "teachers", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: SubjectList) => (
    <tr
      key={item.id}
      className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <BookMarked size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-700 tracking-tight leading-tight">
              {item.name}
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Academic Module
            </span>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell p-4">
        <div className="flex flex-wrap gap-2 max-w-[400px]">
          {item.teachers.length > 0 ? (
            item.teachers.map((t) => (
              <div 
                key={t.id} 
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 text-[10px] font-black uppercase tracking-tight hover:bg-white hover:border-indigo-200 hover:text-indigo-600 hover:shadow-sm transition-all cursor-default"
              >
                <User size={10} className="text-slate-300" />
                {t.name} {t.surname}
              </div>
            ))
          ) : (
            <div className="flex items-center gap-1 text-slate-300 italic text-[10px] font-bold uppercase tracking-wider">
              <Info size={12} />
              Unassigned
            </div>
          )}
        </div>
      </td>
      {role === "admin" && (
        <td className="p-4 text-right">
          <div className="flex items-center gap-2 justify-end">
            <FormContainer table="subject" type="update" data={item} />
            <FormContainer table="subject" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={20} className="text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Curriculum Subjects</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase ml-7">Academic Department Registry</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
            {role === "admin" && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="subject" type="create" />
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

export default SubjectListPage;