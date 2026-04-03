

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import Image from "next/image";

interface CountChartProps {
  boys: number;
  girls: number;
}

const CountChart = ({ boys, girls }: CountChartProps) => {
  // Recharts renders from the bottom up, so we order Total first
  const data = [
    {
      name: "Total",
      count: boys + girls,
      fill: "#ffffff",
    },
    {
      name: "Girls",
      count: girls,
      fill: "#FAE27C", // RubixYellow
    },
    {
      name: "Boys",
      count: boys,
      fill: "#C3EBFA", // RubixBlue
    },
  ];

  return (
    <div className="relative w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="100%"
          barSize={32}
          data={data}
        >
          <RadialBar
            background
            dataKey="count"
            cornerRadius={10} // Makes the bars look modern and rounded
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      {/* CENTER ICON */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
        <Image 
          src="/maleFemale.png" 
          alt="Gender Icon" 
          width={45} 
          height={45} 
          className="opacity-80"
        />
      </div>
    </div>
  );
};

export default CountChart;