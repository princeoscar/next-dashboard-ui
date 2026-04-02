import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  
  // If no date is provided, use today
  const date = dateParam ? new Date(dateParam) : new Date();

  try {
    const data = await prisma.event.findMany({
      where: {
        startTime: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}