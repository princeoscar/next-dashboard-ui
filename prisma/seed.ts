import { PrismaClient, UserSex, Day, AdmissionStatus } from "@prisma/client";

const prisma = new PrismaClient();

const levels = [
  { level: 7, name: "JSS 1" },
  { level: 8, name: "JSS 2" },
  { level: 9, name: "JSS 3" },
  { level: 10, name: "SSS 1" },
  { level: 11, name: "SSS 2" },
  { level: 12, name: "SSS 3" },
];



const subjects = [
  "Mathematics",
  "English Language",
  "Biology",
  "Physics",
  "Chemistry",
  "Economics",
  "Government",
  "Geography",
  "Literature",
  "Civic Education",
  "Agricultural Science",
  "Computer Studies",
];

const teachers = [
  ["John", "Adeyemi"],
  ["Grace", "Okafor"],
  ["David", "Bello"],
  ["Mary", "Adebayo"],
  ["Samuel", "Mohammed"],
  ["Faith", "Johnson"],
  ["Daniel", "Balogun"],
  ["Esther", "Sule"],
];

const parentNames = [
  ["James", "Adeyemi"],
  ["Sarah", "Okafor"],
  ["Peter", "Bello"],
  ["Joy", "Ogunleye"],
  ["Michael", "Sule"],
  ["Joseph", "Lawal"],
];

const studentNames = [
  ["Daniel", "Adeyemi"],
  ["Deborah", "Okafor"],
  ["Joshua", "Bello"],
  ["Ruth", "Lawal"],
  ["Emmanuel", "Balogun"],
  ["Mercy", "Sule"],
  ["David", "Ogunleye"],
  ["Blessing", "Adebayo"],
];

async function main() {
  console.log("Cleaning Database...");

// 1. Wipe out deep dependent/child records first
await prisma.message.deleteMany();
await prisma.result.deleteMany();
await prisma.assignment.deleteMany();
await prisma.exam.deleteMany();
await prisma.lesson.deleteMany();
await prisma.attendance.deleteMany();
await prisma.payment.deleteMany();
await prisma.promotion.deleteMany();

// 2. Wipe out tables that reference classes, levels, and parents
await prisma.admission.deleteMany();   // References Level and Class
await prisma.student.deleteMany();     // References Class, Level, Parent, and School
await prisma.class.deleteMany();       // References Level and Teacher

// 3. Now it is completely safe to clear out core models
await prisma.parent.deleteMany();
await prisma.teacher.deleteMany();
await prisma.subject.deleteMany();
await prisma.level.deleteMany();       // Safe now that Admission, Student, and Class are gone

// 4. Clear structural, system, and administrative data
await prisma.admin.deleteMany();
await prisma.schoolSettings.deleteMany();
await prisma.academicYear.deleteMany();
await prisma.feeStructure.deleteMany();
await prisma.income.deleteMany();
await prisma.expense.deleteMany();
await prisma.announcement.deleteMany();
await prisma.event.deleteMany();
await prisma.user.deleteMany();

// 5. Finally, wipe out the root model that everything was connected to
await prisma.school.deleteMany();

console.log("Database Clean.");

  console.log("Creating School...");
  const school = await prisma.school.create({
    data: {
      id: "school1",
      name: "Rubix School ERP",
    },
  });

  await prisma.admin.create({
    data: {
      id: "admin1",
      username: "admin",
      schoolId: school.id,
    },
  });

  const academicYear = await prisma.academicYear.create({
    data: {
      name: "2026/2027",
      isCurrent: true,
    },
  });

  await prisma.schoolSettings.create({
    data: {
      id: 1,
      schoolName: "Rubix School ERP",
      currentYear: "2026/2027",
      currentTerm: "First Term",
      passingGrade: 50,
    },
  });

  console.log("Creating Levels...");
  for (const item of levels) {
    await prisma.level.create({
      data: {
        level: item.level,
        name: item.name,
      },
    });
  }

  const allLevels = await prisma.level.findMany();

  console.log("Creating Classes...");
  for (const level of allLevels) {
    await prisma.class.create({
      data: {
        name: `${level.name} A`,
        capacity: 40,
        levelId: level.id,
      },
    });
    await prisma.class.create({
      data: {
        name: `${level.name} B`,
        capacity: 40,
        levelId: level.id,
      },
    });
  }

  const classes = await prisma.class.findMany();

  console.log("Creating Subjects...");
  for (const subject of subjects) {
    await prisma.subject.create({
      data: {
        name: subject,
      },
    });
  }

  const subjectList = await prisma.subject.findMany();

  console.log("Creating Teachers...");
  for (let i = 0; i < teachers.length; i++) {
    const teacher = teachers[i];
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `teacher${i}`,
        clerkId: `teacher_clerk_${i}`,
        name: teacher[0],
        surname: teacher[1],
        email: `teacher${i}@rubixschool.com`,
        phone: `080300000${i}`,
        address: "Abuja",
        bloodType: "O+",
        birthday: new Date(1985, 5, 5),
        sex: i % 2 == 0 ? UserSex.MALE : UserSex.FEMALE,
        schoolId: school.id,
        subjects: {
          connect: subjectList.map((s) => ({ id: s.id })),
        },
      },
    });
  }

  async function main() {
  console.log("Seeding lessons...");

  // 1. Fetch references (Make sure you have at least one of each in your DB)
  const teacher = await prisma.teacher.findFirst();
  const subject = await prisma.subject.findFirst();
  const schoolClass = await prisma.class.findFirst();

  if (!teacher || !subject || !schoolClass) {
    console.error("Missing required data (Teacher, Subject, or Class). Seed them first!");
    return;
  }

  // 2. Seed Lessons
  await prisma.lesson.createMany({
    data: [
      {
        name: "Mathematics 101",
        day: Day.MONDAY,
        startTime: new Date("2026-07-06T08:00:00Z"),
        endTime: new Date("2026-07-06T09:00:00Z"),
        teacherId: teacher.id,
        subjectId: subject.id,
        classId: schoolClass.id,
      },
      {
        name: "English Literature",
        day: Day.TUESDAY,
        startTime: new Date("2026-07-07T10:00:00Z"),
        endTime: new Date("2026-07-07T11:00:00Z"),
        teacherId: teacher.id,
        subjectId: subject.id,
        classId: schoolClass.id,
      },
    ],
  });

  console.log("Lessons seeded successfully!");
}

  const teacherPool = await prisma.teacher.findMany();

  console.log("Creating Parents...");
  const parentPool = [];
  for (let i = 0; i < parentNames.length; i++) {
    const parent = await prisma.parent.create({
      data: {
        id: `parent${i}`,
        username: `parent${i}`,
        clerkId: `parent_clerk_${i}`,
        name: parentNames[i][0],
        surname: parentNames[i][1],
        email: `parent${i}@gmail.com`,
        phone: `090100000${i}`,
        address: "Abuja, Nigeria",
        schoolId: school.id,
      },
    });
    parentPool.push(parent);
  }

  console.log("Creating Students...");
  const studentPool = [];
  for (let i = 0; i < 60; i++) {
    const cls = classes[i % classes.length];
    const parent = parentPool[i % parentPool.length];
    const level = allLevels.find((l) => l.id === cls.levelId)!;

    const student = await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        clerkId: `student_clerk_${i}`,
        name: studentNames[i % studentNames.length][0],
        surname: studentNames[i % studentNames.length][1],
        email: `student${i}@rubix.com`,
        phone: `081500000${i}`,
        address: "Abuja",
        birthday: new Date(2012, 1, 1),
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        classId: cls.id,
        levelId: level.id,
        parentId: parent.id,
        schoolId: school.id,
      },
    });
    studentPool.push(student);
  }

  console.log("Creating Timetable...");
  const days = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];

  for (const cls of classes) {
    for (const day of days) {
      for (let i = 0; i < 6; i++) {
        const subject = subjectList[i % subjectList.length];
        const teacher = teacherPool[i % teacherPool.length];

        await prisma.lesson.create({
          data: {
            name: subject.name,
            day,
            startTime: new Date(2026, 0, 1, 8 + i),
            endTime: new Date(2026, 0, 1, 9 + i),
            subjectId: subject.id,
            classId: cls.id,
            teacherId: teacher.id,
          },
        });
      }
    }
  }

  console.log("Creating Attendance...");
  for (const student of studentPool) {
    for (let d = 0; d < 10; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);

      await prisma.attendance.create({
        data: {
          date,
          present: Math.random() > 0.15,
          studentId: student.id,
          subjectId: subjectList[0].id,
          schoolId: school.id,
          academicYearId: academicYear.id,
        },
      });
    }
  }

  console.log("Creating Exams...");
  const examPool = [];
  for (const cls of classes) {
    const exam = await prisma.exam.create({
      data: {
        title: "First Term Examination",
        startTime: new Date(),
        endTime: new Date(),
        subjectId: subjectList[0].id,
        classId: cls.id,
        teacherId: teacherPool[0].id,
      },
    });
    examPool.push(exam);
  }

  console.log("Creating Assignments...");
  const assignmentPool = [];
  for (const cls of classes) {
    const assignment = await prisma.assignment.create({
      data: {
        title: "Weekly Assignment",
        startDate: new Date(),
        dueDate: new Date(),
        classId: cls.id,
        subjectId: subjectList[0].id,
        teacherId: teacherPool[0].id,
      },
    });
    assignmentPool.push(assignment);
  }

  console.log("Creating Results...");
  for (const student of studentPool) {
    const exam = examPool.find((e) => e.classId === student.classId);
    const assignment = assignmentPool.find((a) => a.classId === student.classId);

    if (!exam || !assignment) continue;

    const examScore = Math.floor(Math.random() * 40) + 50;
    const testScore = Math.floor(Math.random() * 20) + 15;
    const assignmentScore = Math.floor(Math.random() * 10) + 8;
    const total = examScore + testScore + assignmentScore;

    await prisma.result.create({
      data: {
        studentId: student.id,
        subjectId: subjectList[0].id,
        academicYearId: academicYear.id,
        term: 1,
        examId: exam.id,
        assignmentId: assignment.id,
        examScore,
        testScore,
        assignmentScore,
        totalScore: total,
        grade:
          total >= 70 ? "A" : total >= 60 ? "B" : total >= 50 ? "C" : total >= 45 ? "D" : "F",
        remark: total >= 50 ? "Pass" : "Fail",
      },
    });
  }

  // console.log("Seeding Admissions...");
  // for (let i = 0; i < 15; i++) {
  //   const sName = studentNames[i % studentNames.length];
  //   const pName = parentNames[i % parentNames.length];

  //   await prisma.admission.create({
  //     data: {
  //       applicationNumber: `APP-2026-${String(i + 1).padStart(4, "0")}`,
  //       firstName: sName[0],
  //       lastName: sName[1],
  //       middleName: "A.",
  //       gender: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
  //       dateOfBirth: new Date(2012, 2, i + 1),
  //       phone: `0803${100000 + i}`,
  //       email: `applicant${i}@gmail.com`,
  //       address: "Abuja, Nigeria",
  //       state: "FCT",
  //       lga: "Municipal",
  //       parentName: `${pName[0]} ${pName[1]}`,
  //       parentPhone: `0904${200000 + i}`,
  //       parentEmail: `parent${i}@gmail.com`,
  //       parentOccupation: "Civil Servant",
  //       applyingLevelId: allLevels[i % allLevels.length].id,
  //       applyingClassId: classes[i % classes.length].id,
  //       schoolId: school.id,
  //       status: AdmissionStatus.PENDING,
  //     },
  //   });
  // }

  // console.log("Seeding Fee Structures...");
  // for (const level of allLevels) {
  //   await prisma.feeStructure.create({
  //     data: {
  //       academicYearId: academicYear.id,
  //       levelId: level.id,
  //       amount: 85000,
  //     },
  //   });
  // }

  console.log("Seeding Payments...");
  const currentStudents = await prisma.student.findMany();

  for (let i = 0; i < currentStudents.length; i++) {
    await prisma.payment.create({
      data: {
        studentId: currentStudents[i].id,
        amountPaid: 85000,
        method: "CASH",
        academicYearId: academicYear.id,
      },
    });
  }

  console.log("Seeding Promotions...");
  for (const student of currentStudents.slice(0, 20)) {
    await prisma.promotion.create({
      data: {
        studentId: student.id,
        academicYearId: academicYear.id,
        oldClassId: student.classId || classes[0].id,
        newClassId: student.classId || classes[0].id,
        status: "PROMOTED",
      },
    });
  }

  console.log("Seeding Events...");
  await prisma.event.createMany({
    data: [
      { title: "Inter-House Sports", description: "Annual sports competition.", startTime: new Date(), endTime: new Date() },
      { title: "PTA Meeting", description: "Meeting with parents.", startTime: new Date(), endTime: new Date() },
      { title: "Graduation Ceremony", description: "SS3 Graduation.", startTime: new Date(), endTime: new Date() },
    ],
  });

  console.log("Seeding Announcements...");
  await prisma.announcement.createMany({
    data: [
      { title: "Welcome Back!", description: "School resumes on Monday.", date: new Date() },
      { title: "Examination Begins", description: "First term examination starts next week.", date: new Date() },
      { title: "Fees Reminder", description: "Outstanding fees should be paid before exams.", date: new Date() },
    ],
  });

  console.log("Seeding Income...");
  await prisma.income.createMany({
    data: [
      { title: "School Fees", amount: 3500000, date: new Date() },
      { title: "Admission Forms", amount: 250000, date: new Date() },
    ],
  });

  console.log("Seeding Expenses...");
  await prisma.expense.createMany({
    data: [
      { title: "Teachers Salary", amount: 1200000, date: new Date() },
      { title: "Electricity", amount: 180000, date: new Date() },
      { title: "Laboratory Equipment", amount: 450000, date: new Date() },
    ],
  });

  console.log("Seeding Users...");
  for (let i = 0; i < 2; i++) {
    await prisma.user.create({
      data: {
        id: `user_admin_${i}`,
        username: `system_admin_${i}`,
        role: "ADMIN",
      },
    });
  }
  
  const systemUsers = await prisma.user.findMany();

  console.log("Seeding Messages...");
  await prisma.message.createMany({
    data: [
      { senderId: systemUsers[0].id, receiverId: teacherPool[1].id, content: "Please submit your lesson notes." },
      { senderId: systemUsers[1].id, receiverId: teacherPool[0].id, content: "Lesson notes submitted successfully." },
    ],
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error(error);
     // @ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });