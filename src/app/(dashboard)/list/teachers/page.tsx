
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getCachedTeachers } from "@/lib/data-fetchers";
import { redirect } from "next/navigation";
import { Mail, Phone, Fingerprint, Eye, MoreHorizontal } from "lucide-react"; // --> Added icons

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { sessionClaims } = await auth(); 
  const resolvedSearchParams = await searchParams;
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  if (role !== "admin" && role !== "teacher") {
    redirect(`/${role}`);
  }

  const columns = [
    { header: "Staff Member", accessor: "info", className: "pl-6" }, // --> Renamed
    { header: "ID", accessor: "teacherId", className: "hidden md:table-cell" },
    { header: "Expertise", accessor: "subjects", className: "hidden md:table-cell" }, // --> Renamed
    { header: "Assignments", accessor: "classes", className: "hidden lg:table-cell" },
    { header: "Actions", accessor: "action", className: "text-right pr-6" },
  ];

  const renderRow = (item: TeacherList) => (
    <tr key={item.id} className="border-b border-slate-50 last:border-0 text-sm hover:bg-slate-50/80 transition-all group">
      <td className="flex items-center gap-4 p-4 pl-6">
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src={item.img || "/noAvatar.png"}
            alt=""
            fill
            className="rounded-xl object-cover border border-slate-100 shadow-sm"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="font-black text-slate-700 uppercase text-[11px] tracking-tight">{item.name}</h3>
          <div className="flex items-center gap-1 text-slate-400">
             <Mail size={10} />
             <p className="text-[10px] font-bold">{item?.email}</p>
          </div>
        </div>
      </td>
      
      <td className="hidden md:table-cell">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
          <Fingerprint size={14} className="text-slate-300" />
          {item.username}
        </div>
      </td>

      {/* --> BEAUTIFIED SUBJECTS BADGES */}
      <td className="hidden md:table-cell">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {item.subjects.map((s) => (
            <span key={s.id} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-tighter border border-blue-100">
              {s.name}
            </span>
          ))}
        </div>
      </td>

      {/* --> BEAUTIFIED CLASSES BADGES */}
      <td className="hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {item.classes.map((c) => (
            <span key={c.id} className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[9px] font-black uppercase tracking-tighter">
              {c.name}
            </span>
          ))}
        </div>
      </td>

      <td className="p-4 pr-6">
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
              <Eye size={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer table="teacher" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = resolvedSearchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.TeacherWhereInput = {};
  if (queryParams.search) {
    query.name = { contains: queryParams.search, mode: "insensitive" };
  }
  if (queryParams.classId) {
    query.classes = { some: { id: parseInt(queryParams.classId) } };
  }

  const [teachers, count] = await Promise.all([
    getCachedTeachers(query, p),
    prisma.teacher.count({ where: query }),
  ]);

  return (
    // --> RESPONSIVE PADDING
    <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100">
      
      {/* --> RESPONSIVE HEADER FIX (STACKS ON MOBILE) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter">Faculty Registry</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Staff: {count}</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH BOX IS NOW FULL WIDTH ON MOBILE --> */}
          <div className="w-full md:w-auto">
             <TableSearch />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100">
              <Image src="/filter.png" alt="" width={16} height={16} />
            </button>
            {role === "admin" && <FormContainer table="teacher" type="create" />}
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 overflow-hidden bg-white shadow-sm">
        <Table columns={columns} renderRow={renderRow} data={teachers} />
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default TeacherListPage;