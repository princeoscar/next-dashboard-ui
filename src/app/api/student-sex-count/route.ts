import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.student.groupBy({
      by: ["sex"],
      _count: true,
    });

    const boys = data.find((d) => d.sex === "MALE")?._count || 0;
    const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;

    return NextResponse.json({ boys, girls });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch student counts" }, { status: 500 });
  }
}