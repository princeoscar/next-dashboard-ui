// src/app/(dashboard)/list/parents/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Parent, Prisma, Student } from "@prisma/client";

type ParentList = Parent & { students: Student[] };

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { page, search } = await searchParams;
  const p = page ? parseInt(page) : 1;

  // 1. AUTH & ROLE CHECK
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();
  
  if (role !== "admin") {
    return <div className="p-8 text-center font-bold">Access Denied</div>;
  }

  // 2. SEARCH LOGIC
  const query: Prisma.ParentWhereInput = {};
  if (search) {
    query.name = { contains: search, mode: "insensitive" };
  }

  // 3. FETCH DATA (Using Transaction for efficiency)
  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: { students: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
  ]);

  // 4. TABLE COLUMNS
  const columns = [
    { header: "Guardian Info", accessor: "info" },
    { header: "Contact", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Associated Students", accessor: "students", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action", className: "text-center" },
  ];

  const renderRow = (item: ParentList) => (
    <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all">
      <td className="p-4">
        <div className="flex flex-col">
          <span className="font-black text-slate-700">{item.name} {item.surname}</span>
          <span className="text-[10px] text-slate-400">{item.email || "No Email"}</span>
        </div>
      </td>
      <td className="hidden lg:table-cell p-4">
        <span className="text-xs font-bold text-slate-500">{item.phone || "---"}</span>
      </td>
      <td className="hidden md:table-cell p-4">
        <div className="flex flex-wrap gap-1">
          {item.students.length > 0 ? (
            item.students.map((s) => (
              <span key={s.id} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[9px] font-black uppercase border border-slate-100">
                {s.name}
              </span>
            ))
          ) : (
            <span className="text-[10px] font-bold text-slate-300 italic">Unlinked</span>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 justify-center">
          <FormContainer table="parent" type="update" data={item} />
          <FormContainer table="parent" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Parent Registry</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Guardian & Family Directory</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
            <FormContainer table="parent" type="create" />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-3xl border border-slate-50 overflow-hidden bg-white">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* PAGINATION */}
      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default ParentListPage;