import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";
import { FormContainerProps } from "@/lib/types";

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;

      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;

      case "teacher":
        const [teacherSubjects, teacherClasses] = await prisma.$transaction([
          prisma.subject.findMany({ select: { id: true, name: true } }),
          prisma.class.findMany({ select: { id: true, name: true } }),
        ]);
        relatedData = { subjects: teacherSubjects, classes: teacherClasses };
        break;

      case "parent":
        const parentStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { students: parentStudents };
        break;

      case "announcement":
        const announcementClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: announcementClasses };
        break;

      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        const studentParents = await prisma.parent.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = {
          classes: studentClasses,
          grades: studentGrades,
          parents: studentParents,
        };
        break;

      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;

      case "event":
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: eventClasses };
        break;

      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: assignmentLessons };
        break;

      case "result":
        const resultExams = await prisma.exam.findMany({
          include: {
            lesson: {
              select: {
                subject: { select: { name: true } },
                class: { select: { name: true } },
              },
            },
          },
        });
        const resultAssignments = await prisma.assignment.findMany({
          include: {
            lesson: {
              select: {
                subject: { select: { name: true } },
                class: { select: { name: true } },
              },
            },
          },
        });
        const resultStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = {
          exams: resultExams,
          assignments: resultAssignments,
          students: resultStudents,
        };
        break;

      case "lesson":
        const [lessonSubjects, lessonTeachers, lessonClasses] = await prisma.$transaction([
          prisma.subject.findMany({ select: { id: true, name: true } }),
          prisma.teacher.findMany({ select: { id: true, name: true, surname: true } }),
          prisma.class.findMany({ select: { id: true, name: true } }),
        ]);
        relatedData = { subjects: lessonSubjects, teachers: lessonTeachers, classes: lessonClasses };
        break;

      case "attendance":
        const [attendanceStudents, attendanceLessons] = await prisma.$transaction([
          prisma.student.findMany({ select: { id: true, name: true, surname: true } }),
          prisma.lesson.findMany({ select: { id: true, name: true } }),
        ]);
        relatedData = { students: attendanceStudents, lessons: attendanceLessons };
        break;

      case "message":
        const mTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        const mStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        const mAdmins = await prisma.admin.findMany({
          select: { id: true, username: true }, // Changed to username to avoid "Known Properties" error
        });
        relatedData = { teachers: mTeachers, students: mStudents, admins: mAdmins };
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;