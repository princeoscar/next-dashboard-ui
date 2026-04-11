import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

import { auth } from "@clerk/nextjs/server";
import { ITEM_PER_PAGE } from "@/lib/settings";

export async function GET(req: NextRequest) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search");

  const p = parseInt(page);
  const query: any = {};

  if (search) {
    query.lesson = {
      subject: { name: { contains: search, mode: "insensitive" } },
    };
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.assignment.findMany({
        where: query,
        include: {
          lesson: {
            select: {
              subject: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
              class: { select: { name: true } },
            },
          },
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.assignment.count({ where: query }),
    ]);

    return NextResponse.json({ data, count, role });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}