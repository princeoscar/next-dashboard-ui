// src/app/(dashboard)/list/teachers/page.tsx
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

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { sessionClaims } = await auth(); 
  const resolvedSearchParams = await searchParams;
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  // Block anyone who isn't an admin or teacher
  if (role !== "admin" && role !== "teacher") {
    redirect(`/${role}`);
  }

  const columns = [
    { header: "Info", accessor: "info" },
    { header: "Teacher ID", accessor: "teacherId", className: "hidden md:table-cell" },
    { header: "Subjects", accessor: "subjects", className: "hidden md:table-cell" },
    { header: "Classes", accessor: "classes", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Actions", accessor: "action", className: "text-right" },
  ];

  const renderRow = (item: TeacherList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-rubixPurpleLight/20 transition-all">
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold text-slate-700">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.subjects.map((s) => s.name).join(", ")}</td>
      <td className="hidden md:table-cell">{item.classes.map((c) => c.name).join(", ")}</td>
      <td className="hidden lg:table-cell">{item.phone || "---"}</td>
      <td>
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-rubixSky hover:bg-sky-200 transition-colors">
              <Image src="/view.png" alt="" width={16} height={16} />
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
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="hidden md:block text-2xl font-black text-slate-800 uppercase tracking-tighter">Teacher Registry</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-3 self-end">
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100">
              <Image src="/filter.png" alt="" width={16} height={16} />
            </button>
            {role === "admin" && <FormContainer table="teacher" type="create" />}
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-50 overflow-hidden">
        <Table columns={columns} renderRow={renderRow} data={teachers} />
      </div>
      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default TeacherListPage;