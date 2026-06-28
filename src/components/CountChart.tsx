"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";

const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
  const data = [
    {
      name: "Total",
      count: boys + girls,
      fill: "white",
    },
    {
      name: "Girls",
      count: girls,
      fill: "#FFF089",
    },
    {
      name: "Boys",
      count: boys,
      fill: "#A5D8FF",
    },
  ];

  return (
    /* 🎯 FIX 1: Scaled heights across breakpoints so it shrinks beautifully on mobile */
    <div className="relative w-full h-[260px] sm:h-[320px] md:h-[38px] lg:h-[400px]"> 
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="50%"   // 👈 Blipped up slightly so the middle icon fits cleanly
          outerRadius="85%"   // 👈 FIX 2: Dropped from 100% to 85% to keep the outer ring from overflowing its bounds
          barSize={24}        // 👈 Thinned down slightly for crisp rendering on small screens
          data={data}
        >
          <RadialBar background dataKey="count" />
        </RadialBarChart>
      </ResponsiveContainer>
      
      {/* 🎯 FIX 3: Scaled down center avatar icon size slightly on mobile so it matches the ring layout scales */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12">
        <Image
          src="/maleFemale.png"
          alt="Gender Distribution"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
};

export default CountChart;