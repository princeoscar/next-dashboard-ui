"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// 1. Define the data shape
interface FinanceData {
  name: string;
  income: number;
  expense: number;
}

const FinanceChart = () => {
  const [data, setData] = useState<FinanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await fetch("/api/finance");

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const result = await res.json();

        if (Array.isArray(result)) {
          setData(result);
        }
      } catch (err) {
        console.error("Finance fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between p-2">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-slate-800">Finance (Income vs Expense)</h1>
        <button className="hover:bg-slate-50 p-1 rounded-full transition-colors">
          <Image src="/moreDark.png" alt="more" width={20} height={20} />
        </button>
      </div>

      {/* CHART AREA */}
      <div className="w-full flex-1 relative min-h-[350px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-rubixBlue rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium animate-pulse">Analyzing financial data...</p>
          </div>
        ) : (
          <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                tickMargin={15}
              />
              <YAxis 
                axisLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 12 }} 
                tickLine={false} 
                tickMargin={15}
                // Formats numbers like 1000 to 1k
                tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
              />
              <Tooltip 
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }}
              />
              <Legend
                align="center"
                verticalAlign="top"
                wrapperStyle={{ paddingTop: "10px", paddingBottom: "40px", fontSize: "12px" }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#C3EBFA" // RubixBlue
                strokeWidth={4}
                dot={{ fill: "#C3EBFA", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8, stroke: "white", strokeWidth: 2 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#CFCEFF" // RubixPurple
                strokeWidth={4}
                dot={{ fill: "#CFCEFF", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8, stroke: "white", strokeWidth: 2 }}
                name="Expense"
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceChart;