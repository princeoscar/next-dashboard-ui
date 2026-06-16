import { prisma } from "../src/lib/prisma";
import {
  UserSex,
  Class,
  Subject,
  Teacher,
  AcademicYear,
  Parent,
} from "@prisma/client";

const levelNames = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
const jssCore = [
  "Mathematics",
  "English Studies",
  "Social studies",
  "Intro Technologies",
  "P.H.E",
  "History",
  "CRS",
  "IRS",
  "Agriculture",
  "Yoruba",
  "Igbo",
  "Hausa",
  
];
const sssElectives = [
  "Biology",
  "Physics",
  "Chemistry",
  "Economics",
  "Financial Accounting",
  "Government",
  "Literature",
  "Geography",
  "Commerce",
];
const allSubjectNames = [...new Set([...jssCore, ...sssElectives])];

const teacherNames = [
  "Komolafe Ajayi",
  "Ifeanyi Okafor",
  "Bisi Akande",
  "Musa Yar'Adua",
  "Chioma Ajoke",
  "Funke Oshodi",
  "Zubairu Dikko",
  "Ngozi Ezekwesili",
  "Segun Arinze",
  "Yinka Ayefele",
];

const parentNames = [
  "Okonkwo",
  "Abubakar",
  "Adeyemi",
  "Eze",
  "Bello",
  "Fashola",
  "Tinubu",
  "Soyinka",
  "Balogun",
];
const studentFirstNames = [
  "Chidi",
  "Aminu",
  "Olumide",
  "Blessing",
  "Zainab",
  "Ngozi",
  "Tunde",
  "Aisha",
  "Kelechi",
  "Femi",
];

async function main() {
  console.log("Cleaning database...");
  await prisma.attendance.deleteMany();
  await prisma.result.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.level.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.school.deleteMany();

  // 1. Create School & Academic Year
  const school = await prisma.school.create({
    data: { id: "1", name: "Rubix International Academy" },
  });

  const academicYear = await prisma.academicYear.create({
    data: { name: "2025/2026", isCurrent: true },
  });

  // 2. Subjects
  console.log("Seeding Categorized Subjects...");
  for (const name of allSubjectNames) {
    await prisma.subject.create({ data: { name, schoolId: "1" } });
  }
  const subjectPool = await prisma.subject.findMany();

  // 3. Teachers
  console.log("Seeding Teachers...");
  const teacherPool: Teacher[] = [];
  for (let i = 0; i < teacherNames.length; i++) {
    const [name, surname] = teacherNames[i].split(" ");
    const t = await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `t_${name.toLowerCase()}${i}`,
        clerkId: `clerk_t_${i}`,
        name,
        surname,
        email: `teacher${i}@rubix.com`,
        phone: `080${1000000 + i}`,
        address: "Staff Quarters",
        bloodType: "O+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(1980, 1, 1),
        schoolId: "1",
        subjects: {
          connect: subjectPool.map((s) => ({ id: s.id })),
        },
      },
    });
    teacherPool.push(t);
  }

  // 4. Levels & Classes + Teacher-Subject Linking
  console.log("Linking Subjects to Classes and Teachers...");
  const classPool: Class[] = [];
  for (let i = 0; i < levelNames.length; i++) {
    const levelName = levelNames[i];
    const level = await prisma.level.create({
      data: { level: i + 7, name: levelName, schoolId: "1" },
    });

    const isJSS = levelName.startsWith("JSS");
    const targetSubjectNames = isJSS ? jssCore : sssElectives;
    const levelSubjects = subjectPool.filter((s) =>
      targetSubjectNames.includes(s.name),
    );

    for (const arm of ["A", "B"]) {
      const supervisor = teacherPool[i % teacherPool.length];
      const cls = await prisma.class.create({
        data: {
          name: `${levelName}${arm}`,
          capacity: 20,
          levelId: level.id,
          schoolId: "1",
          supervisorId: supervisor.id,
          subjects: {
            connect: levelSubjects.map((s) => ({ id: s.id })),
          },
        },
      });
      classPool.push(cls);

      // CRITICAL FIX: Link the supervisor to these subjects so the Calendar finds them
      await prisma.teacher.update({
        where: { id: supervisor.id },
        data: {
          subjects: {
            connect: levelSubjects.map((s) => ({ id: s.id })),
          },
        },
      });
    }
  }

  // 5. Parents
  console.log("Seeding Parents...");
  const parentPool: Parent[] = [];
  for (let i = 0; i < parentNames.length; i++) {
    const p = await prisma.parent.create({
      data: {
        id: `parent${i}`,
        username: `p_user_${i}`,
        clerkId: `clerk_p_${i}`,
        name: "Guardian",
        surname: parentNames[i],
        email: `parent${i}@mail.com`,
        phone: `090${5000000 + i}`,
        address: "Lagos, Nigeria",
        schoolId: "1",
      },
    });
    parentPool.push(p);
  }

  // 6. Students & Attendance
  console.log("Seeding Students and Attendance...");
  for (let i = 0; i < 50; i++) {
    const cls = classPool[i % classPool.length];
    const parent = parentPool[i % parentPool.length];
    const student = await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `s_user${i}`,
        clerkId: `clerk_s_${i}`,
        name: studentFirstNames[i % studentFirstNames.length],
        surname: parent.surname,
        email: `student${i}@rubix.com`,
        address: parent.address,
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(2010, 0, 1),
        classId: cls.id,
        levelId: cls.levelId,
        parentId: parent.id,
        schoolId: "1",
      },
    });

    // Attendance for 3 days
    for (let day = 0; day < 3; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      await prisma.attendance.create({
        data: {
          date: date,
          present: Math.random() > 0.1,
          studentId: student.id,
          subjectId: subjectPool[0].id,
          academicYearId: academicYear.id,
          schoolId: "1",
        },
      });
    }
  }

  // 7. Exams/Results
  console.log("Seeding Academic Records...");
  for (const cls of classPool.slice(0, 5)) {
    const subject = subjectPool[0];
    const teacher = teacherPool[0];

    const exam = await prisma.exam.create({
      data: {
        title: `First Term ${subject.name} Exam`,
        startTime: new Date("2026-06-01T09:00:00Z"),
        endTime: new Date("2026-06-01T11:00:00Z"),
        subjectId: subject.id,
        classId: cls.id,
        teacherId: teacher.id,
      },
    });

    const studentsInClass = await prisma.student.findMany({
      where: { classId: cls.id },
    });
    for (const student of studentsInClass) {
      const eScore = Math.floor(Math.random() * 40) + 30;
      const tScore = Math.floor(Math.random() * 20) + 10;
      const aScore = Math.floor(Math.random() * 10) + 5;
      await prisma.result.create({
        data: {
          studentId: student.id,
          subjectId: subject.id,
          academicYearId: academicYear.id,
          term: 1,
          examId: exam.id,
          examScore: Math.floor(Math.random() * 40) + 30,
          testScore: Math.floor(Math.random() * 20) + 10,
          assignmentScore: Math.floor(Math.random() * 10) + 5,
          totalScore: eScore + tScore + aScore,
        },
      });
    }
  }

  console.log("Seeding Weekly Timetable...");

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  for (const cls of classPool) {
    const classSubjects = subjectPool.filter(
      (s) =>
        (cls.name.startsWith("JSS") && jssCore.includes(s.name)) ||
        (cls.name.startsWith("SSS") && sssElectives.includes(s.name)),
    );

    // We are using 'day' here as the variable
    for (const day of days) {
      for (let i = 0; i < 6; i++) {
        const subject = classSubjects[i % classSubjects.length];

        await prisma.lesson.create({
          data: {
            name: `${subject.name}`,
            day: day as any, // This now correctly matches the 'day' variable above
            startTime: new Date(2026, 4, 4, 8 + i, 0),
            endTime: new Date(2026, 4, 4, 9 + i, 0),
            subjectId: subject.id,
            classId: cls.id,
            teacherId: teacherPool[i % teacherPool.length].id,
          },
        });
      }
    }
  }

  // 8. Events & Announcements
  console.log("Seeding Communication...");
  await prisma.event.createMany({
    data: [
      {
        title: "General PTA Meeting",
        description: "All parents must attend",
        startTime: new Date(),
        endTime: new Date(),
      },
      {
        title: "Inter-house Sports",
        description: "Class competitions",
        startTime: new Date(),
        endTime: new Date(),
        classId: classPool[0].id,
      },
    ],
  });

  await prisma.announcement.createMany({
    data: [
      {
        title: "School Fees Deadline",
        description: "Please pay before mid-term",
        date: new Date(),
      },
      {
        title: "Mid-term Break",
        description: "School resumes on Monday",
        date: new Date(),
        classId: classPool[1].id,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    // @ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
