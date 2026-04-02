import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search");

  const p = parseInt(page);
  const query: any = {};

  if (search) {
    query.OR = [
      { exam: { title: { contains: search, mode: "insensitive" } } },
      { student: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.result.findMany({
        where: query,
        include: {
          student: { select: { name: true, surname: true } },
          exam: {
            include: {
              lesson: {
                select: { 
                  class: { select: { name: true } },
                  subject: { select: { name: true } } 
                },
              },
            },
          },
          assignment: {
            include: {
              lesson: {
                select: { 
                  class: { select: { name: true } },
                  subject: { select: { name: true } } 
                },
              },
            },
          },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.result.count({ where: query }),
    ]);

    return NextResponse.json({ data, count, role });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}