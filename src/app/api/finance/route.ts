import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    // 1. Security Check
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const currentYear = new Date().getFullYear();
    
    // ✅ Use a safer date range (Start of year to End of year)
    const startDate = new Date(currentYear, 0, 1); // Jan 1st
    const endDate = new Date(currentYear, 11, 31); // Dec 31st

    // 2. Fetch data
    const [incomeData, expenseData] = await prisma.$transaction([
      prisma.income.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { amount: true, date: true },
      }),
      prisma.expense.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { amount: true, date: true },
      }),
    ]);

    // 3. Initialize the Map
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // We use a clean object for each month
    const financeMap = months.map((month) => ({
      name: month,
      income: 0,
      expense: 0,
    }));

    // 4. Group income
    incomeData.forEach((item) => {
      const itemDate = new Date(item.date);
      if (!isNaN(itemDate.getTime())) { // ✅ Safety check for valid dates
        const monthIndex = itemDate.getMonth();
        financeMap[monthIndex].income += item.amount;
      }
    });

    // 5. Group expenses
    expenseData.forEach((item) => {
      const itemDate = new Date(item.date);
      if (!isNaN(itemDate.getTime())) { // ✅ Safety check for valid dates
        const monthIndex = itemDate.getMonth();
        financeMap[monthIndex].expense += item.amount;
      }
    });

    return NextResponse.json(financeMap);

  } catch (err) {
    console.error("FINANCE_API_ERROR:", err); // 👈 This will show the REAL error in your terminal
    return NextResponse.json(
      { error: "Internal Server Error", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}