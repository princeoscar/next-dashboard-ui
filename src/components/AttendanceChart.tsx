"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AttendanceData {
  name: string;
  present: number;
  absent: number;
}

const AttendanceChart = ({ data }: { data: AttendanceData[] }) => {
  return (
    <div className="w-full h-full min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          barSize={20} 
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          {/* GRID LINES: Horizontal only for a cleaner modern look */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#f1f5f9" 
          />
          
          {/* X-AXIS: Days of the week */}
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            dy={10}
          />
          
          {/* Y-AXIS: Headcount */}
          <YAxis 
            axisLine={false} 
            tick={{ fill: "#94a3b8", fontSize: 12 }} 
            tickLine={false}
            dx={-10}
          />
          
          {/* TOOLTIP: Styled to match the dashboard cards */}
          <Tooltip
            contentStyle={{ 
              borderRadius: "12px", 
              border: "none", 
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              padding: "10px"
            }}
            cursor={{ fill: "#f8fafc" }}
          />
          
          {/* LEGEND: Positioned at the top */}
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px", fontSize: "12px" }}
            iconType="circle"
          />
          
          {/* BARS: Present (Yellow) & Absent (Blue/Purple) */}
          <Bar
            dataKey="present"
            fill="#FAE27C" // RubixYellow
            radius={[4, 4, 0, 0]} // Subtle rounding for a professional look
            name="Present"
          />
          
          <Bar
            dataKey="absent"
            fill="#C3EBFA" // RubixBlue
            radius={[4, 4, 0, 0]}
            name="Absent"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;