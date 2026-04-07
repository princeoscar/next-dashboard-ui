"use client";

import dynamic from "next/dynamic";
import Image from "next/image";


const CountChart = dynamic(() => import("./CountChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse w-32 h-32 bg-slate-100 rounded-full" />
    </div>
  ),
});

interface Props {
  data: { sex: string; _count: { _all?: number; sex?: number } | number }[];
}

const CountChartContainer = ({ data }: Props) => {
   const getCount = (s: string) => {
    const item = data.find((d) => d.sex.toUpperCase() === s.toUpperCase());
    if (!item) return 0;
    return typeof item._count === 'number' ? item._count : (item._count.sex || 0);
  };

  const boys = getCount("MALE");
  const girls = getCount("FEMALE");
  
  const total = boys + girls;
  const boysPercentage = total > 0 ? Math.round((boys / total) * 100) : 0;
  const girlsPercentage = total > 0 ? Math.round((girls / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl w-full h-full flex flex-col justify-between p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800">Students</h1>
        <button className="hover:bg-slate-50 p-1 rounded-full transition-colors">
          <Image src="/moreDark.png" width={20} height={20} alt="more" />
        </button>
      </div>

      <div className="relative w-full flex-1 min-h-[220px]">
        <CountChart boys={boys} girls={girls} />
      </div>

      <div className="flex justify-center gap-12 mt-4 pb-2">
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-4 bg-rubixBlue rounded-full shadow-sm" />
          <h1 className="font-bold text-slate-700">{boys.toLocaleString()}</h1>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Boys ({boysPercentage}%)
          </h2>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-4 bg-rubixYellow rounded-full shadow-sm" />
          <h1 className="font-bold text-slate-700">{girls.toLocaleString()}</h1>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Girls ({girlsPercentage}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;