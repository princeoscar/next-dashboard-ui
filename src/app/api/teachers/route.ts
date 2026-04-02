import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // 1. CONSTRUCT THE QUERY OBJECT
  const query: any = {};

  // Example: If you pass ?classId=5 in the URL
  const classId = searchParams.get("classId");
  if (classId) {
    query.classes = {
      some: {
        id: Number(classId),
      },
    };
  }

  // 2. RUN THE TRANSACTION
  try {
    const [data, count] = await prisma.$transaction([
      prisma.teacher.findMany({
        where: query, // ✅ Now 'query' is defined!
        include: { 
          subjects: true, 
          classes: true 
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (Number(searchParams.get("page") || 1) - 1),
      }),
      prisma.teacher.count({ where: query }),
    ]);

    return NextResponse.json({ data, count });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}