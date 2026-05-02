import { prisma } from "../src/lib/prisma";
import { UserSex, Class, Subject, Teacher } from "@prisma/client";





const levelNames = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
const subjectNames = [
    "Mathematics", "English Studies", "Basic Science", "Digital Technologies",
    "Citizenship Studies", "Biology", "Physics", "Chemistry", "Economics",
    "Financial Accounting", "Government", "Literature", "History", "Geography",
    "CRS", "Commerce",
  ];
  const teacherNames = [
    "Olawale Adeoga", "Ifeanyi Okafor", "Bisi Akande", "Musa Yar'Adua",
    "Chioma Ajoke", "Funke Oshodi", "Zubairu Dikko", "Ngozi Ezekwesili",
    "Segun Arinze", "Yinka Ayefele", "Genevieve Nnaji", "Davido Adeleke",
    "Wizkid Balogun", "Tiwa Savage", "Burna Boy", "Tems Openiyi",
  ];
   const parentNames = ["Okonkwo", "Abubakar", "Adeyemi", "Eze", "Bello", "Fashola", "Tinubu", "Soyinka", "Balogun"];
const studentFirstNames = ["Chidi", "Aminu", "Olumide", "Blessing", "Zainab", "Ngozi", "Tunde", "Aisha", "Kelechi", "Femi"];

async function main() {
  console.log("Cleaning database...");
  // Clears all data to prevent duplicates
  await prisma.feeStructure.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.level.deleteMany();
  


  // 1. Create the School FIRST 🏫
const school = await prisma.school.upsert({
  where: { id: "1" }, // Or whatever ID you use for students
  update: {},
  create: {
    id: "1",
    name: "Main School",
  },
});

console.log("School created...");




  
  
  
  // --- 2. CREATE SUBJECTS ---
  console.log("Seeding Subjects...");
  await prisma.subject.createMany({
    data: subjectNames.map((name) => ({ name })),
  });
  const subjectPool: Subject[] = await prisma.subject.findMany();

  // --- 3. LEVELS & CLASSES ---
  console.log("Seeding Academic Structure (Levels & Classes)...");
  const classPool: Class[] = [];

  for (let i = 0; i < levelNames.length; i++) {
    const levelName = levelNames[i];

    const level = await prisma.level.create({
      data: { 
        level: i + 7, 
        name: levelName, 
        schoolId: "1" 
      },
    });

    // Filter subjects based on Level
    let relevantSubjects = [];
    if (levelName.startsWith("JSS")) {
      relevantSubjects = subjectPool.filter(s => 
        ["Mathematics", "English Studies", "Basic Science", "Digital Technologies", "Citizenship Studies", "History", "CRS"].includes(s.name)
      );
    } else {
      relevantSubjects = subjectPool.filter(s => 
        ["Mathematics", "English Studies", "Biology", "Physics", "Chemistry", "Economics", "Financial Accounting", "Government", "Literature", "Geography", "Commerce"].includes(s.name)
      );
    }

    for (const arm of ["A", "B", "C"]) {
      const cls = await prisma.class.create({
        data: {
          name: `${levelName}${arm}`,
          levelId: level.id,
          capacity: 10,
          schoolId: "1",
          subjects: {
            connect: relevantSubjects.map((s) => ({ id: s.id })),
          },
        },
      });
      // CRITICAL: Add the created class to the pool so students can be added to it later!
      classPool.push(cls);
    }
  }

  // --- 4. TEACHERS ---
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
        address: "Staff Quarters, Rubix Academy",
        bloodType: "A_PLUS",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(1985, 5, 15),
        img: `https://i.pravatar.cc/150?u=teacher${i}`,
        subjects: { connect: [{ id: subjectPool[i % subjectPool.length].id }] },
      },
    });
    teacherPool.push(t);
  }

  // --- 5. PARENTS ---
  console.log("Seeding Parents...");
 
  const parentPool = [];
  for (let i = 0; i < parentNames.length; i++) {
    const parent = await prisma.parent.create({
      data: {
        id: `p_id_${i}`,
        clerkId: `clerk_p_${i}`,
        username: `p_user_${i}`,
        name: "Guardian",
        surname: parentNames[i],
        email: `parent${i}@mail.com`,
        phone: `090${2000000 + i}`,
        address: `${parentNames[i]} Estate, Lagos`,
      },
    });
    parentPool.push(parent);
  }

  // --- 6. STUDENTS ---
  console.log("Seeding Students...");
  
  let studentCounter = 0;

  for (const cls of classPool) {
    for (let i = 0; i < 2; i++) {
      const nameIndex = studentCounter % studentFirstNames.length;
      const name = studentFirstNames[nameIndex];
      const parent = parentPool[Math.floor(nameIndex / 2)] || parentPool[0];

      await prisma.student.create({
        data: {
          id: `sid${studentCounter}`, 
          clerkId: `clerk_s_${studentCounter}`,
          username: `s_${name.toLowerCase()}${studentCounter}`,
          name,
          surname: parent.surname,
          email: `student${studentCounter}@school.com`,
          phone: `070${3000000 + studentCounter}`,
          address: parent.address,
          bloodType: "O_PLUS",
          sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
          birthday: new Date(2012, 1, 1),
          img: `https://i.pravatar.cc/150?u=sid${studentCounter}`,
          parentId: parent.id,
          levelId: cls.levelId,
          classId: cls.id,
          schoolId: "1", 
        },
      });
      studentCounter++;
    }
  }

  // --- 7. REMAINING DATA (Events, Announcements, Fees) ---
  console.log("Seeding Events and Fees...");
  await prisma.event.createMany({
    data: [
      {
        title: "Annual Inter-House Sports",
        description: "All students to gather at the main field.",
        startTime: new Date("2026-05-15T08:00:00Z"),
        endTime: new Date("2026-05-15T16:00:00Z"),
      },
    ],
  });

  const currentSession = await prisma.academicYear.create({
    data: { name: "2025/2026", isCurrent: true },
  });

  const levels = await prisma.level.findMany();
  for (const level of levels) {
    await prisma.feeStructure.create({
      data: {
        amount: level.level < 10 ? 150000 : 200000,
        description: "Full Session Tuition",
        levelId: level.id,
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