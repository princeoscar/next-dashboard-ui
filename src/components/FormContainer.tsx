import { prisma } from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
  | "teacher" | "student" | "parent" | "subject" | "class"
  | "lesson" | "exam" | "assignment" | "result" | "attendance"
  | "event" | "announcement" | "message";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
};

const FormContainer = async ({ table, type, data, id, relatedData: externalRelatedData, }: FormContainerProps) => {
  let relatedData = externalRelatedData || {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;

      case "class":
        const [classGrades, classTeachers] = await Promise.all([
          prisma.grade.findMany({ select: { id: true, level: true } }),
          prisma.teacher.findMany({ select: { id: true, name: true, surname: true } }),
        ]);
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;

      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      // Inside FormContainer.tsx
      case "message":
        const teachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        const students = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });

        // Combine them into the relatedData prop
        relatedData = {
          receivers: [
            ...teachers.map(t => ({ id: t.id, name: `${t.name} ${t.surname} (Teacher)` })),
            ...students.map(s => ({ id: s.id, name: `${s.name} ${s.surname} (Student)` }))
          ]
        };
        break;

      case "student":
        const [studentGrades, studentClasses, studentParents] = await Promise.all([
          prisma.grade.findMany({ select: { id: true, level: true } }),
          prisma.class.findMany({ include: { _count: { select: { students: true } } } }),
          prisma.parent.findMany({ select: { id: true, name: true, surname: true } }),
        ]);
        relatedData = { classes: studentClasses, grades: studentGrades, parents: studentParents };
        break;

      case "lesson":
        const [lessonSubjects, lessonClasses, lessonTeachers] = await Promise.all([
          prisma.subject.findMany({ select: { id: true, name: true } }),
          prisma.class.findMany({ select: { id: true, name: true } }),
          prisma.teacher.findMany({ select: { id: true, name: true, surname: true } }),
        ]);
        relatedData = { subjects: lessonSubjects, classes: lessonClasses, teachers: lessonTeachers };
        break;

      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: { ...(role === "teacher" ? { teacherId: userId! } : {}) },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;

      case "result":
        const [resultExams, resultAssignments, resultStudents] = await Promise.all([
          prisma.exam.findMany({
            include: { lesson: { select: { subject: { select: { name: true } } } } }
          }),
          prisma.assignment.findMany({
            include: { lesson: { select: { subject: { select: { name: true } } } } }
          }),
          prisma.student.findMany({
            select: { id: true, name: true, surname: true },
          }),
        ]);
        relatedData = { exams: resultExams, assignments: resultAssignments, students: resultStudents };
        break;

      case "attendance":
        const [attendanceLessons, attendanceStudents] = await Promise.all([
          prisma.lesson.findMany({
            where: { ...(role === "teacher" ? { teacherId: userId! } : {}) },
            select: { id: true, name: true, class: { select: { name: true } } },
          }),
          prisma.student.findMany({
            select: { id: true, name: true, surname: true },
            orderBy: { name: "asc" },
          }),
        ]);
        relatedData = { lessons: attendanceLessons, students: attendanceStudents };
        break;
      case "announcement":
        const announcementClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: announcementClasses };
        break;

      case "event":
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: eventClasses };
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