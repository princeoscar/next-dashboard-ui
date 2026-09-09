// src/app/api/parents/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {prisma} from "@/lib/prisma";

import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";



export async function GET(req: NextRequest) {
  try {
    // --- Get user session and role ---
    const { sessionClaims, userId } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();
      if (!role) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}
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
            subjects: {
              some:{
                 teachers: {
                some: {
                id: userId!
               },
            },
          },
        },
      }
    }
  }
}

    // Search filter
    if (search) {
      query.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
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
        orderBy: { firstName: "asc" },
      }),
      prisma.parent.count({ where: query }),
    ]);

    return NextResponse.json({
  data,
  count,
  page,
  totalPages: Math.ceil(count / ITEM_PER_PAGE),
  role,
});
  } catch (error) {
    console.error("GET /api/parents:", error);
    return NextResponse.json(
      { error: "Failed to fetch parents" },
      { status: 500 }
    );
  }
}