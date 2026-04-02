import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Grade, Teacher, Prisma } from "@prisma/client";
import { GraduationCap, UserCog, Layout } from "lucide-react";

type ClassList = Class & { supervisor: Teacher | null } & { grade: Grade };

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // --- 1. TYPE-SAFE QUERY BUILDING ---
  const query: Prisma.ClassWhereInput = {};

  if (queryParams.search) {
    query.name = { contains: queryParams.search, mode: "insensitive" };
  }

  if (queryParams.supervisorId) {
    query.supervisorId = queryParams.supervisorId;
  }

  // --- 2. ROLE-BASED VISIBILITY (The Security Layer) ---
  switch (role) {
    case "admin":
      break;
    case "teacher":
      // Show classes where they are the supervisor OR where they teach a lesson
      query.OR = [
        { supervisorId: userId! },
        { lessons: { some: { teacherId: userId! } } }
      ];
      break;
    case "student":
      query.students = { some: { id: userId! } };
      break;
    case "parent":
      query.students = { some: { parentId: userId! } };
      break;
    default:
      // If no role, restrict view
      query.id = -1;
      break;
  }

  // --- 3. PRISMA TRANSACTION ---
  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
        grade: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: "asc" },
    }),
    prisma.class.count({ where: query }),
  ]);

  const columns = [
    { header: "Class Name", accessor: "name" },
    { header: "Capacity", accessor: "capacity", className: "hidden md:table-cell" },
    { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "Supervisor", accessor: "supervisor", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ClassList) => {
    const isNearlyFull = item.capacity >= 25;

    return (
      <tr
        key={item.id}
        className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group"
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rubixPurple/10 text-rubixPurple rounded-xl group-hover:bg-rubixPurple group-hover:text-white transition-all">
              <Layout size={16} />
            </div>
            <span className="font-black text-slate-700 tracking-tight">{item.name}</span>
          </div>
        </td>
        <td className="hidden md:table-cell p-4 text-slate-500">
          <div className="flex flex-col gap-1 w-24">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span>{item.capacity} Seats</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isNearlyFull ? 'bg-amber-400' : 'bg-emerald-400'}`}
                style={{ width: `${Math.min((item.capacity / 30) * 100, 100)}%` }}
              />
            </div>
          </div>
        </td>
        <td className="hidden md:table-cell p-4">
          <div className="flex items-center gap-2 w-fit px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
            <GraduationCap size={12} />
            Level {item.grade?.level || "-"}
          </div>
        </td>
        <td className="hidden lg:table-cell p-4 text-slate-500">
          {item.supervisor ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <UserCog size={14} />
              </div>
              <span className="font-medium text-xs">{item.supervisor.name} {item.supervisor.surname}</span>
            </div>
          ) : (
            <span className="text-xs italic text-slate-300">Unassigned</span>
          )}
        </td>
        {role === "admin" && (
          <td className="p-4 text-right">
            <div className="flex items-center gap-2 justify-end">
              <FormContainer table="class" type="update" data={item} />
              <FormContainer table="class" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Academic Classes</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Management of Student Groups</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
             {role === "admin" && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="class" type="create" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-50 overflow-hidden">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default ClassListPage;