

import {prisma} from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { table, id } = await req.json();
    const numericId = isNaN(Number(id)) ? id : Number(id);

    switch (table) {
      case "student":
        await prisma.student.delete({ where: { id: numericId } });
        break;

      case "teacher":
        await prisma.teacher.delete({ where: { id: numericId } });
        break;

      case "class":
        await prisma.class.delete({ where: { id: numericId } });
        break;

      case "subject":
        await prisma.subject.delete({ where: { id: numericId } });
        break;

      case "exam":
        await prisma.exam.delete({ where: { id: numericId } });
        break;

      case "parent":
        await prisma.parent.delete({ where: { id: numericId } });
        break;

      case "lesson":
        await prisma.lesson.delete({ where: { id: numericId } });
        break;

      case "assignment":
        await prisma.assignment.delete({ where: { id: numericId } });
        break;

      case "result":
        await prisma.result.delete({ where: { id: numericId } });
        break;

      case "event":
        await prisma.event.delete({ where: { id: numericId } });
        break;

      case "announcement":
        await prisma.announcement.delete({ where: { id: numericId } });
        break;

      case "message":
        await prisma.message.delete({ where: { id: numericId } });
        break;

      default:
        return Response.json({ success: false, error: "Invalid table" });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false });
  }
}