import Image from "next/image";
import CountChart from "./CountChart";

interface CountChartProps {
  data: {
    name: string;
    count: number;
    fill: string;
  }[];
}

const CountChartContainer = ({ data }: CountChartProps) => {
  const maleData = data.find((d) => d.name === "MALE")?.count || 0;
  const femaleData = data.find((d) => d.name === "FEMALE")?.count || 0;
  const total = maleData + femaleData;

  const boysPercent = total > 0 ? Math.round((maleData / total) * 100) : 0;
  const girlsPercent = total > 0 ? Math.round((femaleData / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl w-full p-5 shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-base font-bold text-gray-700">Students</h1>
        <Image src="/moreDark.png" alt="menu" width={16} height={16} />
      </div>

      {/* CHART */}
      <div className="relative w-full h-[220px] flex items-center justify-center">
        <CountChart boys={maleData} girls={femaleData} />

        {/* CENTER TEXT */}
        {/* <div className="absolute flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-gray-800 leading-none">
            {total}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Total Students
          </p>
        </div> */}
      </div>

      {/* STATS */}
      <div className="flex justify-between items-center mt-2 px-2">

        {/* BOYS */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rubixSky rounded-full" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-gray-700">Boys</span>
            <span className="text-xs text-gray-400">{boysPercent}%</span>
          </div>
          <span className="ml-2 text-base font-semibold text-gray-800">
            {maleData}
          </span>
        </div>

        {/* GIRLS */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rubixYellow rounded-full" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-gray-700">Girls</span>
            <span className="text-xs text-gray-400">{girlsPercent}%</span>
          </div>
          <span className="ml-2 text-base font-semibold text-gray-800">
            {femaleData}
          </span>
        </div>

      </div>
    </div>
  );
};

export default CountChartContainer;