"use client";

import Announcements from "@/components/Announcements";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import EventCalendarContainer from "@/components/EventCalenderContainer";
import React from "react";

// 1. Defined precise types (Removed 'any')
interface AdminClientProps {
  counts: {
    studentCount: number;
    teacherCount: number;
    parentCount: number;
    adminCount: number;
  };
  searchParams: { [key: string]: string | undefined };
  chart: React.ReactNode;           // Radial/Count Chart
  attendanceChart: React.ReactNode; // Bar Chart
}

const AdminClientPage = ({ 
  counts, 
  searchParams, 
  chart, 
  attendanceChart 
}: AdminClientProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row p-2 md:p-0">
      
      {/* LEFT: DATA & CHARTS (2/3 Width) */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        
        {/* USER SUMMARY CARDS */}
        {/* Used grid instead of flex-wrap for perfectly even spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UserCard type="admin" count={counts.adminCount} />
          <UserCard type="teacher" count={counts.teacherCount} />
          <UserCard type="student" count={counts.studentCount} />
          <UserCard type="parent" count={counts.parentCount} />
        </div>

        {/* MIDDLE CHARTS: Gender Distribution & Attendance */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* RADIAL CHART CONTAINER */}
          <div className="w-full lg:w-1/3 h-[450px] bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
            {chart}
          </div>
          
          {/* BAR CHART CONTAINER */}
          <div className="w-full lg:w-2/3 h-[450px] bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
            {attendanceChart}
          </div>
        </div>

        {/* BOTTOM CHART: Finance/Income (Full Width of column) */}
        <div className="w-full h-[500px] bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
          <FinanceChart />
        </div>
      </div>

      {/* RIGHT: WIDGETS (1/3 Width) */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        {/* Calendar Widget */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
           <EventCalendarContainer searchParams={searchParams} />
        </div>
        
        {/* Announcements Widget */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
          <Announcements />
        </div>
      </div>

    </div>
  );
};

export default AdminClientPage;