"use client";


import Announcements from "@/components/Announcements";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import React from "react";


interface AdminClientProps {
  counts: {
    studentCount: number;
    teacherCount: number;
    parentCount: number;
    adminCount: number;
  };
  announcements: any[];
  searchParams: { [key: string]: string | undefined };
  chart: React.ReactNode;
  attendanceChart: React.ReactNode;
  eventList: React.ReactNode;
}

const AdminClientPage = ({
  counts,
  announcements,
  searchParams,
  chart,
  attendanceChart,
  eventList,
}: AdminClientProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row p-2 md:p-0">
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UserCard type="admin" count={counts.adminCount} />
          <UserCard type="teacher" count={counts.teacherCount} />
          <UserCard type="student" count={counts.studentCount} />
          <UserCard type="parent" count={counts.parentCount} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3 h-[450px] bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
            {chart}
          </div>
          <div className="w-full lg:w-2/3 h-[450px] bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
            {attendanceChart}
          </div>
        </div>

        <div className="w-full h-[500px] bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
          <FinanceChart />
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
          {eventList}
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
          <Announcements data={announcements}/>
        </div>
      </div>
    </div>
  );
};

export default AdminClientPage;