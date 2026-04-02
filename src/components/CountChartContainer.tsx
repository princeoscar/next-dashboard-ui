import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";

const CountChartContainer = async () => {
  // 1. Fetch counts using aggregate grouping
  const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
  });

  // 2. Normalize and extract counts
  // Handled both uppercase and lowercase DB entries for robustness
  const boys = data.find((d) => d.sex.toUpperCase() === "MALE")?._count || 0;
  const girls = data.find((d) => d.sex.toUpperCase() === "FEMALE")?._count || 0;
  const total = boys + girls;

  // 3. Calculate percentages for the UI labels
  const boysPercentage = total > 0 ? Math.round((boys / total) * 100) : 0;
  const girlsPercentage = total > 0 ? Math.round((girls / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl w-full h-full flex flex-col justify-between">
      {/* TITLE SECTION */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-bold text-slate-800">Students Distribution</h1>
        <button className="hover:bg-slate-50 p-1 rounded-full transition-colors">
          <Image src="/moreDark.png" width={20} height={20} alt="more" />
        </button>
      </div>

      {/* THE ACTUAL RADIAL CHART */}
      {/* We pass boys and girls to the client-side Recharts component */}
      <div className="relative w-full flex-1 min-h-[220px]">
        <CountChart boys={boys} girls={girls} />
      </div>

      {/* LEGEND SECTION */}
      <div className="flex justify-center gap-12 mt-4 pb-2">
        {/* BOYS STATS */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-4 bg-rubixBlue rounded-full shadow-sm" />
          <h1 className="font-bold text-slate-700">{boys.toLocaleString()}</h1>
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Boys ({boysPercentage}%)
          </h2>
        </div>

        {/* GIRLS STATS */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-4 bg-rubixYellow rounded-full shadow-sm" />
          <h1 className="font-bold text-slate-700">{girls.toLocaleString()}</h1>
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Girls ({girlsPercentage}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;