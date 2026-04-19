import ClassSelector from "@/components/ClassSelector";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Grade, Teacher, Prisma } from "@prisma/client";
import { GraduationCap, UserCog, Layout } from "lucide-react";

type ClassList = Class & { supervisor: Teacher | null } & { grade: Grade };

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const params = await searchParams;
  const { page, classId, search } = params;
  const p = page ? parseInt(page) : 1;

  // --- 1. SEGMENT VIEW (CLASS CARDS) ---
  // Teachers only see the class they supervise. Admins see all.
  if (!classId && !search && role !== "student" && role !== "parent") {
    const classes = await prisma.class.findMany({
      where: {
        ...(role === "teacher" ? { supervisorId: userId! } : {}),
      },
      include: { 
        grade: true,
        supervisor: true,
        _count: { select: { students: true, lessons: true } } 
      },
      orderBy: { name: "asc" },
    });

    return (
      <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Academic <span className="text-rubixPurple">Classes</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1">
            Manage student groups and class structures
          </p>
        </div>
        {/* target="classes" so clicking a card reloads this page with ?classId=X */}
        <ClassSelector classes={classes} role={role!} target="classes" relatedData={{}} />
      </div>
    );
  }

  // --- 2. TABLE VIEW LOGIC ---
  const query: Prisma.ClassWhereInput = {};

  if (role === "teacher") {
    query.supervisorId = userId!;
  }

  if (search) {
    query.name = { contains: search, mode: "insensitive" };
  }

  // If a specific class was clicked via the card
  if (classId) {
    query.id = parseInt(classId);
  }

  const [data, count, teachers, grades] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: { grade: true, supervisor: true, _count: { select: { students: true } } },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: "asc" },
    }),
    prisma.class.count({ where: query }),
    prisma.teacher.findMany({ select: { id: true, name: true, surname: true } }),
    prisma.grade.findMany({ select: { id: true, level: true } }),
  ]);

  const relatedData = { teachers, grades };

  const columns = [
    { header: "Class Name", accessor: "name", className: "pl-4" },
    { header: "Enrolled", accessor: "students", className: "hidden md:table-cell" },
    { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
    { header: "Supervisor", accessor: "supervisor", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action", className: "text-right pr-4" }] : []),
  ];

  const renderRow = (item: ClassList & { _count: { students: number } }) => (
    <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rubixPurple/10 text-rubixPurple rounded-xl group-hover:bg-rubixPurple group-hover:text-white transition-all">
            <Layout size={16} />
          </div>
          <span className="font-black text-slate-700 tracking-tight">{item.name}</span>
        </div>
      </td>
      <td className="hidden md:table-cell p-4 text-slate-500 font-medium">
        {item._count.students} Students
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
            <FormContainer table="class" type="update" data={item} relatedData={relatedData} />
            <FormContainer table="class" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Academic Classes</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Management of Student Groups</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          {role === "admin" && (
            <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
              <FormContainer table="class" type="create" relatedData={relatedData} />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-50 overflow-hidden shadow-sm">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default ClassListPage;