import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { CalendarDays, Clock, Sparkles, ArrowLeft, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma, Class, Event } from "@prisma/client";
import Link from "next/link";
import ClassSelector from "@/components/ClassSelector";
import Image from "next/image";

type EventList = Event & { class: Class | null };

const EventListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const p = params.page ? parseInt(params.page) : 1;
  const { classId, search } = params;

  // --- 1. BUILD QUERY ---
  const query: Prisma.EventWhereInput = {};

  if (search) {
    query.title = { contains: search, mode: "insensitive" };
  }

  // 🔒 ROLE-BASED VISIBILITY
  if (role !== "admin") {
    const currentUserId = userId || "";
    const roleConditions = {
      teacher: {
        OR: [
          { supervisorId: currentUserId },
          { lessons: { some: { teacherId: currentUserId } } },
        ],
      },
      student: { students: { some: { id: currentUserId } } },
      parent: { students: { some: { parentId: currentUserId } } },
    };

    if (classId) {
      query.classId = parseInt(classId);
      query.class = roleConditions[role as keyof typeof roleConditions] || { id: -1 };
    } else {
      query.OR = [
        { classId: null },
        { class: roleConditions[role as keyof typeof roleConditions] || { id: -1 } },
      ];
    }
  } else if (classId) {
    query.classId = parseInt(classId);
  }

  // --- 2. FOLDER VIEW (CLASS CARDS) ---
  if (!classId && !search && (role === "admin" || role === "teacher")) {
    const classes = await prisma.class.findMany({
      where: role === "teacher" ? { supervisorId: userId! } : {},
      include: {
        grade: true,
        _count: { select: { events: true } },
      },
      orderBy: { name: "asc" },
    });

    return (
      <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
        <div className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <Calendar size={28} className="text-rose-500" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
              Event <span className="text-rose-500">Registry</span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1">
            Select a class folder to manage activities
          </p>
        </div>
        <ClassSelector classes={classes} role={role!} target="events" relatedData={{}} />
      </div>
    );
  }

  // --- 3. FETCH DATA (After query is built) ---
  const [data, count, classes] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: { class: { select: { name: true } } },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { startTime: "asc" }, // Show soonest events first
    }),
    prisma.event.count({ where: query }),
    prisma.class.findMany({ select: { id: true, name: true } }),
  ]);

  const columns = [
    { header: "Event Title", accessor: "title", className: "pl-4" },
    { header: "Target Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Timeline", accessor: "startTime", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action", className: "w-24 text-right pr-6" }] : []),
  ];

  const renderRow = (item: EventList) => {
    const now = new Date();
    const start = new Date(item.startTime);
    const end = new Date(item.endTime);
    const isLive = now >= start && now <= end;

    return (
      <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-all ${isLive
                ? 'bg-rose-50 text-rose-500 animate-pulse'
                : 'bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white'
              }`}>
              <Sparkles size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-700 block tracking-tight">{item.title}</span>
              {isLive && (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                  ● Live Now
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="p-4">
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
            {item.class?.name || "School Wide"}
          </span>
        </td>
        <td className="hidden md:table-cell p-4 text-slate-500 font-bold">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-slate-300" />
            <span className="tabular-nums">
              {new Intl.DateTimeFormat("en-GB", { day: '2-digit', month: 'short' }).format(start)}
            </span>
          </div>
        </td>
        <td className="hidden lg:table-cell p-4 text-slate-400 font-bold tabular-nums">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-300" />
            <span>
              {start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </td>
        {role === "admin" && (
          <td className="p-4 pl-6 text-right">
            <div className="flex items-center gap-2 justify-end">
              <FormContainer table="event" type="update" data={item} relatedData={{ classes }} />
              <FormContainer table="event" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100 min-h-[700px]">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          {(role === "admin" || role === "teacher") && (
            <Link href="/list/events" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <ArrowLeft size={20} />
            </Link>
          )}
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
            {classId ? `Activity Log` : "School Events"}
          </h1>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          {role === "admin" && (
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {role === "admin" && <FormContainer table="class" type="create" relatedData={classes} />}
            </div>
          )}
        </div>
      </div>

     <div className="rounded-3xl border border-slate-50 overflow-x-auto bg-white shadow-sm w-full">
  <Table columns={columns} renderRow={renderRow} data={data} />
</div>

      {!data.length && (
        <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[2rem] mt-4">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No activities found</p>
        </div>
      )}

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default EventListPage;