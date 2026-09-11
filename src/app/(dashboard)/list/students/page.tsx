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
import { Eye, ArrowLeft, Fingerprint, Phone, MapPin, Hash } from "lucide-react";

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { sessionClaims, userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    throw new Error("Admin not found.");
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    throw new Error("School not found.");
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const { page, classId, search } = params;
  const p = page ? parseInt(page) : 1;

  // --- PRE-FETCH COMMON DATA FOR FORMS ---
  const [levels, classesList, parentsList] = await prisma.$transaction([
    prisma.level.findMany({
      where: { schoolId },
      select: { id: true, level: true },
    }),
    prisma.class.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        levelId: true,
        streamId: true,
        capacity: true,
        _count: { select: { students: true } },
      },
    }),
    prisma.parent.findMany({
      where: { schoolId },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const relatedData = { levels, classes: classesList, parents: parentsList };

  // --- 1. SEGMENT VIEW (CLASS CARDS) ---
  if (!classId && !search && role !== "student" && role !== "parent") {
    const classes = await prisma.class.findMany({
      where: {
        schoolId,
        ...(role === "teacher" ? { supervisorId: userId! } : {}),
      },
      include: {
        level: true,
        _count: { select: { students: true } },
        supervisor: true,
      },
      orderBy: { name: "asc" },
    });

    return (
      <div className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex-1 m-1 md:m-4 mt-0 shadow-sm border border-slate-100">
        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Student <span className="text-rubixPurple">Records</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium italic">
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

  // --- 2. TABLE & LIST VIEW LOGIC ---
  const columns = [
    { header: "Student", accessor: "info", className: "pl-2 md:pl-6" },
    { header: "Username", accessor: "username", className: "hidden md:table-cell" },
    { header: "Admission No.", accessor: "admissionNumber", className: "hidden lg:table-cell" },
    { header: "Level", accessor: "level", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
    { header: "Actions", accessor: "action", className: "text-right pr-2 md:pr-6" },
  ];

  const query: Prisma.StudentWhereInput = {};
  query.schoolId = schoolId;

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

  const [students, count] = await Promise.all([
    prisma.student.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
  ]);

  const renderRow = (item: Student & { class: Class | null }) => (
    <tr key={item.id} className="border-b border-slate-50 last:border-0 text-sm hover:bg-slate-50/80 transition-all group">
      <td className="flex items-center gap-2 md:gap-4 p-2 md:p-4 pl-2 md:pl-6">
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src={item.img || "/noAvatar.png"}
            alt=""
            fill
            className="rounded-xl object-cover border border-slate-100 shadow-sm"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="font-black text-slate-700 uppercase text-[11px] tracking-tight">{item.name} {item.surname}</h3>
          <p className="text-[10px] font-bold text-slate-400">{item.class?.name || "Unassigned"}</p>
        </div>
      </td>

      <td className="hidden md:table-cell">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
          <Fingerprint size={14} className="text-slate-300" />
          {item.username}
        </div>
      </td>

      <td className="hidden lg:table-cell">
        <span className="font-mono text-xs font-bold text-rubixPurple">
          {item.admissionNumber || "-"}
        </span>
      </td>

      <td className="hidden md:table-cell">
        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black uppercase text-slate-600 border border-slate-200">
          {item.class?.name.charAt(0) || "-"}
        </span>
      </td>

      <td className="hidden md:table-cell text-slate-500 text-xs">{item.phone || "-"}</td>

      <td className="hidden lg:table-cell text-slate-500 text-xs max-w-[150px] truncate">{item.address || "-"}</td>

      <td className="p-2 md:p-4 pr-2 md:pr-6">
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
              <Eye size={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormContainer table="student" type="update" data={item} relatedData={relatedData} />
              <FormContainer table="student" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-2 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex-1 m-1 md:m-4 mt-0 shadow-sm border border-slate-100">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Link href="/list/students" className="p-2 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400 border border-slate-100">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
              {classId ? `Class Roster` : "Search Results"}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Students: {count}</p>
          </div>
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

      {students.length === 0 ? (
        <div className="p-8 text-center text-slate-400 border border-dashed rounded-2xl text-xs font-medium">
          No students found matching your criteria.
        </div>
      ) : (
        <>
          {/* MOBILE CARD VIEW (< md screens) */}
          <div className="space-y-4 md:hidden">
            {students.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0">
                      <Image
                        src={item.img || "/noAvatar.png"}
                        alt=""
                        fill
                        className="rounded-xl object-cover border border-slate-100 shadow-sm"
                      />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-700 uppercase text-xs tracking-tight">
                        {item.name} {item.surname}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {item.class?.name || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px] bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <Fingerprint size={12} />
                    {item.username}
                  </div>
                </div>

                {/* Details Badges */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Hash size={12} className="text-slate-300 shrink-0" />
                    <span className="text-[10px] font-bold truncate">
                      Adm: <span className="font-mono text-rubixPurple">{item.admissionNumber || "N/A"}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone size={12} className="text-slate-300 shrink-0" />
                    <span className="text-[10px] font-bold truncate">{item.phone || "No phone"}</span>
                  </div>
                  {item.address && (
                    <div className="col-span-2 flex items-center gap-1.5 text-slate-500">
                      <MapPin size={12} className="text-slate-300 shrink-0" />
                      <span className="text-[10px] font-medium truncate">{item.address}</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-50">
                  <Link
                    href={`/list/students/${item.id}`}
                    className="flex-1 text-center py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                  >
                    View Profile
                  </Link>

                  {role === "admin" && (
                    <div className="flex items-center gap-2">
                      <FormContainer table="student" type="update" data={item} relatedData={relatedData} />
                      <FormContainer table="student" type="delete" id={item.id} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW (md+ screens) */}
          <div className="hidden md:block rounded-[1rem] md:rounded-[2rem] border border-slate-50 overflow-x-auto bg-white shadow-sm">
            <Table columns={columns} renderRow={renderRow} data={students} />
          </div>
        </>
      )}

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default StudentListPage;