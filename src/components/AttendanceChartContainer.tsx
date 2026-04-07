"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

interface AttendanceChartProps {
  data: {
    name: string;
    present: number;
    absent: number;
  }[];
}

const AttendanceChart = dynamic<AttendanceChartProps>(
  () => import("./AttendanceChart"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-xl animate-pulse">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Loading Weekly Data...
        </span>
      </div>
    ),
  }
);

interface Props {
  data: AttendanceChartProps["data"];
}

const AttendanceChartContainer = ({ data }: Props) => {
  return (
    <div className="bg-white rounded-2xl p-4 h-full flex flex-col justify-between shadow-sm border border-slate-50">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-slate-800">Weekly Attendance</h1>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Monday - Friday
          </span>
        </div>
        <button className="hover:bg-slate-50 p-1 rounded-full transition-colors">
          <Image src="/moreDark.png" alt="more" width={20} height={20} />
        </button>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <AttendanceChart data={data} />
      </div>

      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rubixYellow rounded-sm" />
          <span className="text-[10px] text-gray-500 font-bold uppercase">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rubixPurple rounded-sm" />
          <span className="text-[10px] text-gray-500 font-bold uppercase">Absent</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChartContainer;