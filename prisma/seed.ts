import { prisma } from "../src/lib/prisma";
import { Day, UserSex, Class, Subject, Teacher } from "@prisma/client";

async function main() {
  console.log("Cleaning database...");
  await prisma.attendance.deleteMany();
  await prisma.result.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.event.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.message.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.grade.deleteMany();

  console.log("Seeding Full Data (16 Subjects, 16 Teachers, 18 Classes)...");

  // 1. GRADES & CLASSES
  const gradeNames = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
  const classPool: Class[] = [];

  for (let i = 0; i < gradeNames.length; i++) {
    const grade = await prisma.grade.create({
      data: { level: i + 7, name: gradeNames[i] },
    });
    for (const arm of ["A", "B", "C"]) {
      const cls = await prisma.class.create({
        data: {
          name: `${gradeNames[i]}${arm}`,
          gradeId: grade.id,
          capacity: 10,
        },
      });
      classPool.push(cls);
    }
  }

  // 2. SUBJECTS (Added 4 new: History, Geography, CRS, Commerce)
  const subjectNames = [
    "Mathematics",
    "English Studies",
    "Basic Science",
    "Digital Technologies",
    "Citizenship Studies",
    "Biology",
    "Physics",
    "Chemistry",
    "Economics",
    "Financial Accounting",
    "Government",
    "Literature",
    "History",
    "Geography",
    "CRS",
    "Commerce",
  ];

  await prisma.subject.createMany({
    data: subjectNames.map((name) => ({ name })),
  });
  const subjectPool: Subject[] = await prisma.subject.findMany();

  // 3. TEACHERS (16 Teachers for 16 Subjects)
  const teacherNames = [
    "Olawale Adeoga",
    "Ifeanyi Okafor",
    "Bisi Akande",
    "Musa Yar'Adua",
    "Chioma Ajoke",
    "Funke Oshodi",
    "Zubairu Dikko",
    "Ngozi Ezekwesili",
    "Segun Arinze",
    "Yinka Ayefele",
    "Genevieve Nnaji",
    "Davido Adeleke",
    "Wizkid Balogun",
    "Tiwa Savage",
    "Burna Boy",
    "Tems Openiyi",
  ];

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
        address: "Staff Quarters, Rubix Academy",
        bloodType: "A_PLUS",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(1985, 5, 15),
        img: `https://i.pravatar.cc/150?u=teacher${i}`,
        subjects: { connect: [{ id: subjectPool[i].id }] },
      },
    });
    teacherPool.push(t);
  }

  // 4. PARENTS
  const parentNames = [
    "Okonkwo",
    "Abubakar",
    "Adeyemi",
    "Eze",
    "Bello",
    "Danuma",
    "Fashola",
    "Ubah",
    "Tinubu",
    "Salami",
    "Soyinka",
    "Achebe",
    "Aliyu",
    "Balogun",
    "Chukwu",
    "Danjuma",
    "Egwu",
    "Falana",
  ];
  const parentPool = [];
  for (let i = 0; i < 18; i++) {
    const parent = await prisma.parent.create({
      data: {
        id: `p_id_${i}`,
        clerkId: `clerk_p_${i}`,
        username: `p_user_${i}`,
        name: "Mr/Mrs",
        surname: parentNames[i],
        email: `parent${i}@mail.com`,
        phone: `090${2000000 + i}`,
        address: `${parentNames[i]} Estate, Lagos`,
      },
    });
    parentPool.push(parent);
  }

  // 5. STUDENTS
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
    "Sade",
    "Umar",
    "Tosin",
    "Emeka",
    "Amaka",
    "Bolaji",
    "Dami",
    "Efe",
    "Gani",
    "Hassan",
    "Ife",
    "Jide",
    "Kunle",
    "Lola",
    "Mofe",
    "Nosa",
    "Obi",
    "Patience",
    "Quasim",
    "Roli",
    "Sola",
    "Taiwo",
    "Uche",
    "Victoria",
    "Wale",
    "Yemi",
  ];

  let studentCounter = 0;
  for (const cls of classPool) {
    for (let i = 0; i < 2; i++) {
      if (studentCounter >= 36) break;
      const parentIndex = Math.floor(studentCounter / 2);
      const parent = parentPool[parentIndex];
      const name = studentFirstNames[studentCounter];

      await prisma.student.create({
        data: {
          id: `s_id_${studentCounter}`,
          clerkId: `clerk_s_${studentCounter}`,
          username: `s_${name.toLowerCase()}${studentCounter}`,
          name,
          surname: parent.surname,
          email: `${name.toLowerCase()}@student.com`,
          phone: `070${3000000 + studentCounter}`,
          address: parent.address,
          bloodType: "O_PLUS",
          sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
          birthday: new Date(2012, 1, 1),
          img: `https://i.pravatar.cc/150?u=s_id_${studentCounter}`,
          parentId: parent.id,
          gradeId: cls.gradeId,
          classId: cls.id,
        },
      });
      studentCounter++;
    }
  }

  // 6. DYNAMIC DAILY SCHEDULE (Rotating Periods)
  console.log("Creating Dynamic Shuffled Lessons...");

  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
  const daysEnum = [
    Day.MONDAY,
    Day.TUESDAY,
    Day.WEDNESDAY,
    Day.THURSDAY,
    Day.FRIDAY,
  ];
  const periods = [8, 9, 10, 11, 12, 13, 14];

  for (const cls of classPool) {
    for (let dayIndex = 0; dayIndex < daysEnum.length; dayIndex++) {
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + dayIndex);

      // 1. Define the stream subjects
      let streamSubjects: string[] = [];
      if (cls.name.startsWith("JSS")) {
        streamSubjects = [
          "Mathematics",
          "English Studies",
          "Basic Science",
          "Digital Technologies",
          "Citizenship Studies",
          "History",
          "CRS",
        ];
      } else if (cls.name.endsWith("A")) {
        streamSubjects = [
          "Mathematics",
          "English Studies",
          "Physics",
          "Chemistry",
          "Biology",
          "Geography",
          "Digital Technologies",
        ];
      } else if (cls.name.endsWith("B")) {
        streamSubjects = [
          "English Studies",
          "Government",
          "Literature",
          "History",
          "CRS",
          "Geography",
          "Mathematics",
        ];
      } else if (cls.name.endsWith("C")) {
        streamSubjects = [
          "Mathematics",
          "Economics",
          "Financial Accounting",
          "Commerce",
          "Government",
          "English Studies",
          "Geography",
        ];
      }

      // 2. SHUFFLE/ROTATE LOGIC:
      // We shift the array based on the day of the week so the 8am subject on Monday
      // becomes the 9am subject on Tuesday, etc.
      const dailyRotation = [
        ...streamSubjects.slice(dayIndex),
        ...streamSubjects.slice(0, dayIndex),
      ];

      for (let p = 0; p < periods.length; p++) {
        const hour = periods[p];
        if (hour === 11) continue; // BREAK TIME

        // Pick the subject from the rotated list
        const subjectName = dailyRotation[p % dailyRotation.length];
        const subject = subjectPool.find((s) => s.name === subjectName);
        const teacher = teacherPool.find(
          (t) => t.id === `teacher${subjectPool.indexOf(subject!)}`,
        );

        if (subject && teacher) {
          const startTime = new Date(targetDate);
          startTime.setHours(hour, 0, 0, 0);
          const endTime = new Date(targetDate);
          endTime.setHours(hour, 45, 0, 0);

          await prisma.lesson.create({
            data: {
              name: subject.name,
              day: daysEnum[dayIndex],
              startTime,
              endTime,
              subjectId: subject.id,
              classId: cls.id,
              teacherId: teacher.id,
            },
          });
        }
      }
    }
  }

  // 7. EXAMS & ASSIGNMENTS
  console.log("Creating Exams and Assignments in high-speed batches...");

  const lessons = await prisma.lesson.findMany();

  // 1. Map the lessons to data arrays instead of calling the DB in a loop
  const examData = lessons.map((lesson) => ({
    title: `${lesson.name} Exam`,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    lessonId: lesson.id,
  }));

  const assignmentData = lessons.map((lesson) => ({
    title: `${lesson.name} Assignment`,
    startDate: lesson.startTime,
    dueDate: new Date(lesson.startTime.getTime() + 1000 * 60 * 60 * 24 * 7),
    lessonId: lesson.id,
  }));

  // 2. Fire two single requests to create everything at once
  await prisma.exam.createMany({
    data: examData,
    skipDuplicates: true,
  });

  await prisma.assignment.createMany({
    data: assignmentData,
    skipDuplicates: true,
  });

  // 3. To keep your results logic working, we fetch the IDs back
  const examPool = await prisma.exam.findMany();
  const assignmentPool = await prisma.assignment.findMany();

  console.log(`✅ Success: Batched ${examData.length} Exams and ${assignmentData.length} Assignments.`);

  /// 8. RESULTS
  console.log("Generating Student Results...");

  const students = await prisma.student.findMany();
  const resultData = []; // Collect all results here first

  for (const exam of examPool) {
    const lesson = lessons.find((l) => l.id === exam.lessonId);
    const classStudents = students.filter((s) => s.classId === lesson?.classId);

    for (const student of classStudents) {
      resultData.push({
        score: Math.floor(Math.random() * 51) + 40,
        studentId: student.id,
        examId: exam.id,
        type: "EXAM",
      });
    }
  }
  await prisma.result.createMany({
    data: resultData,
    skipDuplicates: true, // This respects your @@unique constraint
  });

  // Generate Assignment Results
  for (const assignment of assignmentPool) {
    const lesson = lessons.find((l) => l.id === assignment.lessonId);
    const classStudents = students.filter((s) => s.classId === lesson?.classId);

    for (const student of classStudents) {
      await prisma.result.create({
        data: {
          score: Math.floor(Math.random() * 31) + 60, // Range: 60-90
          studentId: student.id,
          assignmentId: assignment.id,
          type: "ASSIGNMENT", // Required by your schema
        },
      });
    }
  }
// --- 1. SCHOOL-WIDE EVENTS ---
  console.log("Creating school-wide events...");
  await prisma.event.createMany({
    data: [
      {
        title: "Annual Inter-House Sports",
        description: "All students to gather at the main field for track and field events.",
        startTime: new Date("2026-05-15T08:00:00Z"),
        endTime: new Date("2026-05-15T16:00:00Z"),
      },
      {
        title: "Science & Tech Exhibition",
        description: "Showcasing student projects in full-stack dev and AI.",
        startTime: new Date("2026-06-10T09:00:00Z"),
        endTime: new Date("2026-06-10T15:00:00Z"),
      },
    ],
  });

  // --- 2. MULTI-CLASS ANNOUNCEMENTS ---
  console.log("Creating targeted announcements...");

// 🚀 FIX: Instead of hardcoded [1, 2, 3...], we fetch the actual class IDs
const actualClasses = await prisma.class.findMany({
  take: 10,
  select: { id: true, name: true }
});

const announcements = actualClasses.map((cls) => ({
  title: `Mid-Term Project for ${cls.name}`,
  description: "Please ensure your project repositories are pushed to GitHub by Friday midnight.",
  date: new Date(),
  classId: cls.id, // Now using a guaranteed valid ID
}));

await prisma.announcement.createMany({
  data: announcements,
});

console.log(`✅ Successfully sent ${announcements.length} targeted announcements.`);

const currentSession = await prisma.academicYear.create({
  data: {
    name: "2025/2026",
    isCurrent: true,
  },
});

console.log("Seeding Fee Structure linked to Active Year...");
  const grades = await prisma.grade.findMany();
  
  for (const grade of grades) {
    await prisma.feeStructure.create({
      data: {
        amount: grade.level < 10 ? 150000 : 200000,
        description: "Full Session Tuition & Levies",
        gradeId: grade.id,
        academicYearId: currentSession.id,
      }
    });
  }

  console.log("✅ Database seeded successfully!");
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
