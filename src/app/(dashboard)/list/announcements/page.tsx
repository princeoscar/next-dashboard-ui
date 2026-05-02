import ClassSelector from "@/components/ClassSelector";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Announcement, Class, Prisma } from "@prisma/client";
import { Megaphone, Globe, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

type AnnouncementList = Announcement & { class: Class | null };

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const p = params.page ? parseInt(params.page) : 1;
  const { classId, search } = params;

  // --- 1. SEARCH & ROLE FILTERING LOGIC ---
  const query: Prisma.AnnouncementWhereInput = {};

  if (search) {
    query.title = { contains: search, mode: "insensitive" };
  }

  // 🔒 ROLE-BASED VISIBILITY
  if (role !== "admin") {
    const currentUserId = userId || "";

    // Fix: Parents need to see announcements for all their children's classes
    const roleConditions: Prisma.AnnouncementWhereInput = {
      OR: [
        { classId: null }, // Global notices
        ...(role === "teacher" ? [{
          class: {
            OR: [
              { supervisorId: currentUserId },
              { subjects: { some: { teachers: { some: { id: currentUserId } } } } }
            ]
          }
        }] : []),
        ...(role === "student" ? [{
          class: { students: { some: { id: currentUserId } } }
        }] : []),
        ...(role === "parent" ? [{
          class: { students: { some: { parentId: currentUserId } } }
        }] : []),
      ]
    };

    if (classId) {
      query.AND = [
        { classId: parseInt(classId) },
        roleConditions
      ];
    } else {
      Object.assign(query, roleConditions);
    }
  } else if (classId) {
    query.classId = parseInt(classId);
  }

  // --- 2. SEGMENT VIEW (CLASS CARDS) ---
  if (!classId && !search && (role === "admin" || role === "teacher")) {
    const classes = await prisma.class.findMany({
      where: role === "teacher" ? { supervisorId: userId! } : {},
      include: {
        level: true,
        _count: { select: { announcements: true } },
      },
      orderBy: { name: "asc" },
    });

    return (
      <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100">
        <div className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <Megaphone size={28} className="text-indigo-600" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
              Notice <span className="text-indigo-600">Board</span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1">
            Select a class folder to manage announcements
          </p>
        </div>
        <ClassSelector classes={classes} role={role!} target="announcements" relatedData={{}} />
      </div>
    );
  }

  // --- 3. DATA FETCHING ---
  const [data, count, classes] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: {
        class: { select: { id: true, name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: "desc" },
    }),
    prisma.announcement.count({ where: query }),
    prisma.class.findMany({ select: { id: true, name: true } }),
  ]);

  const relatedData = { classes };

  // --- 4. TABLE CONFIGURATION ---
  const columns = [
    { header: "Announcement", accessor: "title", className: "pl-4" },
    { header: "Target Audience", accessor: "class", className: "hidden md:table-cell" },
    { header: "Date Published", accessor: "date", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action", className: "text-right pr-4" }] : []),
  ];

  const renderRow = (item: AnnouncementList) => (
    <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-colors group">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
            <Megaphone size={16} />
          </div>
          <div className="flex flex-col max-w-[200px] md:max-w-md">
            <span className="font-bold text-slate-700 block tracking-tight truncate">
              {item.title}
            </span>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              {item.description}
            </span>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell p-4">
        {item.class ? (
          <div className="flex items-center gap-2 w-fit px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
            <Users size={12} /> {item.class.name}
          </div>
        ) : (
          <div className="flex items-center gap-2 w-fit px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-sky-100 shadow-sm">
            <Globe size={12} /> Global
          </div>
        )}
      </td>
      <td className="hidden lg:table-cell p-4 text-slate-500 font-bold tabular-nums">
        {new Intl.DateTimeFormat("en-GB", {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(new Date(item.date))}
      </td>
      {role === "admin" && (
        <td className="p-4 text-right">
          <div className="flex items-center gap-2 justify-end">
            <FormContainer table="announcement" type="update" data={item} relatedData={relatedData} />
            <FormContainer table="announcement" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100 min-h-[600px]">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          {(role === "admin" || role === "teacher") && (
            <Link href="/list/announcements" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <ArrowLeft size={20} />
            </Link>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
              {classId ? `Class Notices` : "Notice Registry"}
            </h1>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100">
          </button>
          {role === "admin" && <FormContainer table="class" type="create" relatedData={relatedData} />}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-50 overflow-hidden shadow-sm">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {!data.length && (
        <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[2rem] mt-4">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No announcements found</p>
        </div>
      )}

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default AnnouncementListPage;