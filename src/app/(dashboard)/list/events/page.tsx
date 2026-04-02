"use client";

import { useListData } from "@/hooks/useListData";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import { CalendarDays, Clock, Sparkles } from "lucide-react";

const EventListPage = () => {
  // role is fetched from your hook/session
  const { data, count, role, loading, searchParams } = useListData<any>("events");
  const p = parseInt(searchParams.get("page") || "1");
  
  // Normalize role for safety
  const currentRole = role?.toLowerCase();

  const columns = [
    { header: "Event Title", accessor: "title" },
    { header: "Target Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Timeline", accessor: "startTime", className: "hidden lg:table-cell" },
    ...(currentRole === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: any) => {
    // 1. STATUS LOGIC
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
                : 'bg-rubixSky/10 text-rubixSky group-hover:bg-rubixSky group-hover:text-white'
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
              <FormModal table="event" type="update" data={item} />
              <FormModal table="event" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100 min-h-[700px]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Campus Events</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Calendar & School Activities</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          {currentRole === "admin" && (
            <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
              <FormModal table="event" type="create" />
            </div>
          )}
        </div>
      </div>

      {/* DATA CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 space-y-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-rubixSky rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching Schedule...</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-50 overflow-hidden bg-white">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      )}

      {!loading && (
        <div className="mt-8 border-t border-slate-50 pt-6">
          <Pagination page={p} count={count} />
        </div>
      )}
    </div>
  );
};

export default EventListPage;