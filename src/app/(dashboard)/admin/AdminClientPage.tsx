"use client";

import Announcements from "@/components/Announcements";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import Image from "next/image";
import React, { useState } from "react";
import { sendMessage, createEvent, createAnnouncement } from "@/lib/server-actions";
import { MessageSquare, Send, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

interface AdminClientProps {
  counts: {
    studentCount: number;
    teacherCount: number;
    parentCount: number;
    adminCount: number;
    announcementCount: number;
    msgCount: number;
  };
  searchParams: { [key: string]: string | undefined };
  announcements: any[];
  chart: React.ReactNode;
  attendanceChart: React.ReactNode;
  eventList: React.ReactNode;
}

const AdminClientPage = ({
  counts,
  searchParams,
  announcements = [],
  chart,
  attendanceChart,
  eventList,
}: AdminClientProps) => {
  const [isPostMode, setIsPostMode] = useState(false);
  const [isEventMode, setIsEventMode] = useState(false);


  return (
    <div className="flex flex-col gap-4 lg:flex-row p-4">
      {/* LEFT SIDE - Analytics & Oversight */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UserCard type="admin" count={counts?.adminCount || 0} />
          <UserCard type="teacher" count={counts?.teacherCount || 0} />
          <UserCard type="student" count={counts?.studentCount || 0} />
          <UserCard type="parent" count={counts?.parentCount || 0} />
        </div>

        {/* ATTENDANCE CHART & PIE CHART */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3 h-[450px]">{chart}</div>
          <div className="w-full lg:w-2/3 h-[450px] bg-white rounded-2xl p-6 shadow-sm border border-slate-50 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Attendance Trends</h1>
              <Image src="/moreDark.png" alt="" width={20} height={20} />
            </div>
            <div className="flex-1 w-full min-h-0">{attendanceChart}</div>
          </div>
        </div>

        {/* FINANCE CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>

      {/* RIGHT SIDE - Events, Inbox, Announcements */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">

        {/* EVENTS SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          {isEventMode ? (
            <form
              action={async (formData) => {
                const res = await createEvent({ success: false, error: false }, formData);

                if (res.success) {
                  toast.success("Event Scheduled!");
                  setIsEventMode(false);
                }
              }}
              className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-2"
            >
              <input
                name="title"
                placeholder="Event Name"
                className="w-full bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="startTime"
                  type="datetime-local"
                  className="bg-slate-50 p-2 rounded-lg text-[10px] border border-slate-100 outline-none"
                  required
                />
                <input
                  name="endTime"
                  type="datetime-local"
                  className="bg-slate-50 p-2 rounded-lg text-[10px] border border-slate-100 outline-none"
                  required
                />
              </div>
              <textarea
                name="description"
                placeholder="Event Description"
                className="w-full bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 outline-none h-20 resize-none"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-md transition-all active:scale-95"
              >
                Schedule Event
              </button>
              <button
                type="button"
                onClick={() => setIsEventMode(false)}
                className="w-full bg-slate-100 text-slate-500 font-bold py-2 rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </form>
          ) : (
            eventList
          )}
        </div>



        {/* ANNOUNCEMENTS SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          {isPostMode ? (
            <form
              action={async (formData) => {
                const res = await createAnnouncement(
                  {
                    success: false,
                    error: false,
                  },
                  {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    classId: null,
                    levelId: null,
                    teacherId: null,
                  }
                );

                if (res.success) {
                  toast.success("Announcement Posted!");
                  setIsPostMode(false);
                } else {
                  toast.error(res.message || "Failed to post announcement.");
                }
              }}
              className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2"
            >
              <input
                name="title"
                placeholder="Headline"
                className="bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 outline-none"
                required
              />

              <textarea
                name="description"
                placeholder="Write announcement content here..."
                className="bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 outline-none min-h-[100px] resize-none"
                required
              />

              <button
                type="submit"
                className="bg-blue-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                Publish to School
              </button>
            </form>


          ) : (
            <Announcements data={announcements} />
          )}
        </div>
      </div>
    </div>
  )
};

export default AdminClientPage;