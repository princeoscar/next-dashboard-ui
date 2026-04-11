import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { CalendarDays, Clock, Sparkles } from "lucide-react";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

const EventListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {

  const params = await searchParams;
  // 1. Get Auth and Role on the Server
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentRole = role?.toLowerCase();

  // 2. Parse Pagination
  const p = params.page ? parseInt(params.page) : 1;

  // 3. Handle Search and Filtering
  const query: Prisma.EventWhereInput = {};
  if (params.search) {
    query.title = { contains: params.search, mode: "insensitive" };
  }

  // 4. Fetch Data directly with Prisma
  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        class: { select: { name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({ where: query }),
  ]);

  const columns = [
    { header: "Event Title", accessor: "title" },
    { header: "Target Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Timeline", accessor: "startTime", className: "hidden lg:table-cell" },
    ...(currentRole === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: any) => {
    const now = new Date();
    const start = new Date(item.startTime);
    const end = new Date(item.endTime);
    const isLive = now >= start && now <= end;

    return (
      <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-all group">
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-all ${
              isLive 
                ? 'bg-rose-50 text-rose-500 animate-pulse' 
                : 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'
            }`}>
              <Sparkles size={16} />
            </div>
            <div>
              <span className="font-black text-slate-700 block">{item.title}</span>
              {isLive && (
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                  Live Now
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="p-4">
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
            {item.class?.name || "School Wide"}
          </span>
        </td>
        <td className="hidden md:table-cell p-4 text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-slate-300" />
            {new Intl.DateTimeFormat("en-GB", { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }).format(start)}
          </div>
        </td>
        <td className="hidden lg:table-cell p-4 text-slate-400 font-bold">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span className="tabular-nums">
              {start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </td>
        {currentRole === "admin" && (
          <td className="p-4">
            <div className="flex items-center gap-2 justify-end">
              <FormContainer table="event" type="update" data={item} />
              <FormContainer table="event" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100 min-h-[700px]">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Campus Events</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Calendar & School Activities</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          {currentRole === "admin" && (
            <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
              <FormContainer table="event" type="create" />
            </div>
          )}
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

export default EventListPage;