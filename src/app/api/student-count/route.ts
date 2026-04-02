import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Only Admins or Teachers should see this data
  if (role !== "admin" && role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const boys = await prisma.student.count({ where: { sex: "MALE" } });
    const girls = await prisma.student.count({ where: { sex: "FEMALE" } });
    const total = boys + girls;

    return NextResponse.json({ boys, girls, total });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
  }
}