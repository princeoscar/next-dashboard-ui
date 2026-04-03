import Image from "next/image";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";

// 1. DEFINE THE PROPS INTERFACE
// This tells TypeScript exactly what data the chart component expects.
interface CountChartProps {
  boys: number;
  girls: number;
}

// 2. IMPORT THE CHART DYNAMICALLY WITH TYPES
// We pass <CountChartProps> to the dynamic function to resolve the "IntrinsicAttributes" error.
const CountChart = dynamic<CountChartProps>(
  () => import("./CountChart"), 
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse w-32 h-32 bg-slate-100 rounded-full" />
      </div>
    ),
  }
);

const CountChartContainer = async () => {
  // 1. Fetch counts using aggregate grouping
  const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
  });

  // 2. Normalize and extract counts
  // Added toUpperCase() check to ensure it matches your DB enum/strings regardless of case
  const boys = data.find((d) => d.sex.toUpperCase() === "MALE")?._count || 0;
  const girls = data.find((d) => d.sex.toUpperCase() === "FEMALE")?._count || 0;
  const total = boys + girls;

  // 3. Calculate percentages
  const boysPercentage = total > 0 ? Math.round((boys / total) * 100) : 0;
  const girlsPercentage = total > 0 ? Math.round((girls / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl w-full h-full flex flex-col justify-between p-4 shadow-sm">
      {/* TITLE SECTION */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800">Students Distribution</h1>
        <button className="hover:bg-slate-50 p-1 rounded-full transition-colors">
          <Image src="/moreDark.png" width={20} height={20} alt="more" />
        </button>
      </div>

      {/* THE ACTUAL RADIAL CHART */}
      <div className="relative w-full flex-1 min-h-[220px]">
        {/* TypeScript is now happy because we defined CountChartProps above */}
        <CountChart boys={boys} girls={girls} />
      </div>

      {/* LEGEND SECTION */}
      <div className="flex justify-center gap-12 mt-4 pb-2">
        {/* BOYS STATS */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-4 bg-rubixBlue rounded-full shadow-sm" />
          <h1 className="font-bold text-slate-700">{boys.toLocaleString()}</h1>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Boys ({boysPercentage}%)
          </h2>
        </div>

        {/* GIRLS STATS */}
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