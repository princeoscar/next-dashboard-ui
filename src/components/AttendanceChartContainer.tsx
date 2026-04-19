import Image from "next/image";
import AttendanceChart from "./AttendanceChart";

interface AttendanceChartContainerProps {
  data: { 
    name: string; 
    present: number; 
    absent: number; 
  }[];
}

const AttendanceChartContainer = async ({ data }: AttendanceChartContainerProps) => {
  // Check if we actually have numbers to show (sum of present/absent > 0)
  const hasRecords = data.some(day => day.present > 0 || day.absent > 0);

  return (
    <div className="bg-white rounded-xl p-4 h-full border border-gray-50 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* TITLE SECTION */}
      <div className="flex justify-between items-center mb-4">
        {/* <h1 className="text-lg font-semibold text-slate-800">Attendance</h1>
        <Image src="/moreDark.png" alt="Options" width={20} height={20} className="cursor-pointer" /> */}
      </div>

      {/* CHART OR FALLBACK */}
      <div className="flex-1 min-h-[350px]">
        {hasRecords ? (
          <AttendanceChart data={data}/>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-50 rounded-xl">
             <p className="text-sm font-medium">No attendance records found</p>
             <p className="text-xs text-slate-300">Data for this week will appear once marked.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceChartContainer;