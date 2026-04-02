import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Parent, Prisma, Student } from "@prisma/client";
import { UserCircle, Phone, MapPin, Mail } from "lucide-react";

type ParentList = Parent & { students: Student[] };

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // --- 1. TYPE-SAFE QUERY BUILDING ---
  const query: Prisma.ParentWhereInput = {};

  // --- 2. ROLE-BASED VISIBILITY ---
  // Admins see all. Teachers only see parents of students in their classes.
  if (role === "teacher") {
    query.students = {
      some: {
        class: {
          lessons: {
            some: { teacherId: userId! }
          }
        }
      }
    };
  }

  // --- 3. SEARCH LOGIC ---
  if (queryParams.search) {
    query.OR = [
      { name: { contains: queryParams.search, mode: "insensitive" } },
      { surname: { contains: queryParams.search, mode: "insensitive" } },
      { email: { contains: queryParams.search, mode: "insensitive" } },
      { phone: { contains: queryParams.search, mode: "insensitive" } },
    ];
  }

  // --- 4. DATA FETCHING ---
  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: {
        students: { select: { id: true, name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: "asc" },
    }),
    prisma.parent.count({ where: query }),
  ]);

  const columns = [
    { header: "Guardian Info", accessor: "info" },
    { header: "Associated Students", accessor: "students", className: "hidden md:table-cell" },
    { header: "Contact Details", accessor: "contact", className: "hidden lg:table-cell" },
    { header: "Location", accessor: "address", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rubixPurple/10 text-rubixPurple rounded-xl group-hover:bg-rubixPurple group-hover:text-white transition-all">
            <UserCircle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-700 tracking-tight">{item.name} {item.surname}</span>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <Mail size={10} />
              <span className="lowercase">{item.email || "No Email Registered"}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell p-4">
        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
          {item.students.length > 0 ? (
            item.students.map((s) => (
              <span key={s.id} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-wider border border-slate-100 group-hover:border-rubixPurple/20 transition-colors">
                {s.name}
              </span>
            ))
          ) : (
            <span className="text-[10px] font-bold text-slate-300 uppercase italic">Unlinked</span>
          )}
        </div>
      </td>
      <td className="hidden lg:table-cell p-4">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Phone size={12} />
          </div>
          <span className="tabular-nums">{item.phone}</span>
        </div>
      </td>
      <td className="hidden lg:table-cell p-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <MapPin size={12} className="text-slate-300" />
          <span className="truncate max-w-[150px] font-medium">{item.address}</span>
        </div>
      </td>
      {role === "admin" && (
        <td className="p-4 text-right">
          <div className="flex items-center gap-2 justify-end">
            <FormContainer table="parent" type="update" data={item} />
            <FormContainer table="parent" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Parent Registry</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Guardian & Family Directory</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
            {role === "admin" && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="parent" type="create" />
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

export default ParentListPage;