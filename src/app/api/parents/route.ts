// src/app/api/parents/route.ts
import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // --- Get user session and role ---
    const { sessionClaims, userId } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";

    // --- Build Prisma query ---
    const query: Prisma.ParentWhereInput = {};

    // Role-based filtering: teachers see only their students' parents
    if (role === "teacher") {
      query.students = {
        some: {
          class: {
            lessons: {
              some: { teacherId: userId! },
            },
          },
        },
      };
    }

    // Search filter
    if (search) {
      query.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { surname: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // --- Fetch data and count ---
    const [data, count] = await prisma.$transaction([
      prisma.parent.findMany({
        where: query,
        include: { students: { select: { id: true, name: true, surname: true } } },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (page - 1),
        orderBy: { name: "asc" },
      }),
      prisma.parent.count({ where: query }),
    ]);

    return NextResponse.json({ data, count, role });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch parents" },
      { status: 500 }
    );
  }
}