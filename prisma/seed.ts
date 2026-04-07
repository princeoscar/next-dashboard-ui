
import prisma from "../src/lib/prisma";
import { Day, UserSex } from "@prisma/client";

async function main() {
  console.log("Cleaning database...");

  // Delete in order to avoid FK errors
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
  await prisma.income.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding new data...");
  const currentYear = new Date().getFullYear();

  // 1️⃣ ADMIN
  const adminUser = await prisma.user.create({
    data: {
      id: "admin1",
      username: "admin",
      email: "admin@school.com",
      role: "ADMIN",
    },
  });

  // 2️⃣ GRADES
  const createdGrades = [];
  for (let i = 1; i <= 6; i++) {
    const grade = await prisma.grade.create({ data: { level: i } });
    createdGrades.push(grade);
  }

  // 3️⃣ CLASSES
  const createdClasses = [];
  for (const grade of createdGrades) {
    const newClass = await prisma.class.create({
      data: { name: `${grade.level}A`, gradeId: grade.id, capacity: 20 },
    });
    createdClasses.push(newClass);
  }

  // 4️⃣ SUBJECTS
  const subjectNames = ["Math", "Science", "English", "History", "CS"];
  const createdSubjects = [];
  for (const name of subjectNames) {
    const sub = await prisma.subject.create({ data: { name } });
    createdSubjects.push(sub);
  }

  // 5️⃣ TEACHERS
  const createdTeachers = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        id: `teacher${i}`,
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `t${i}@school.com`,
        phone: `123${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(1990, 0, 1),
        role: "TEACHER",
      },
    });

    // Connect teacher to subjects
    const teacher = await prisma.teacher.create({
      data: {
        id: `teacher${i}`,        // Required by your schema
        userId: user.id,          // The relation link
        username: user.username,  // Required by your schema
        name: user.name!,         // Required by your schema
        surname: user.surname!,   // Required by your schema
        email: user.email,
        phone: `123${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(1990, 0, 1),
        subjects: { 
          connect: [{ id: createdSubjects[i % createdSubjects.length].id }] 
        },
      },
    });
    createdTeachers.push(teacher);
  }

  // 6️⃣ LESSONS
  const createdLessons = [];
  const days = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];

  for (let i = 0; i < 10; i++) {
    const lesson = await prisma.lesson.create({
      data: {
        name: `Lesson ${i + 1}`,
        day: days[i % days.length],
        startTime: new Date(currentYear, 8, 1, 8, 0),
        endTime: new Date(currentYear, 8, 1, 9, 30),
        subjectId: createdSubjects[i % createdSubjects.length].id,
        classId: createdClasses[i % createdClasses.length].id,
        teacherId: createdTeachers[i % createdTeachers.length].id,
      },
    });
    createdLessons.push(lesson);
  }

  // 7️⃣ PARENTS & STUDENTS
  console.log("Creating Parents and Students...");
  const createdStudents = [];

  for (let i = 1; i <= 10; i++) {
    // Parent
    const parentUser = await prisma.user.create({
      data: {
        id: `parent${i}`,
        username: `parent${i}`,
        name: `PName${i}`,
        surname: `PSurname${i}`,
        email: `p${i}@test.com`,
        phone: `123${i}`,
        address: `Addr${i}`,
        role: "PARENT",
      },
    });

    // 2. Create the Parent profile
    const parent = await prisma.parent.create({
     data: {
        id: `parent${i}`,
        userId: parentUser.id,
        username: parentUser.username,
        name: parentUser.name!,
        surname: parentUser.surname!,
        email: parentUser.email,
        phone: `123${i}`,
        address: `Addr${i}`,
      },
    });

    // Student
    const studentUser = await prisma.user.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname${i}`,
        email: `s${i}@test.com`,
        phone: `987${i}`,
        address: `Addr${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(2015, 0, 1),
        role: "STUDENT",
      },
    });

    // 4. Create the Student profile
    const student = await prisma.student.create({
      data: {
        id: `student${i}`,
        userId: studentUser.id,
        username: studentUser.username,
        name: studentUser.name!,
        surname: studentUser.surname!,
        email: studentUser.email,
        phone: `987${i}`,
        address: `Addr${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        parentId: parent.id,
        gradeId: createdGrades[i % createdGrades.length].id,
        classId: createdClasses[i % createdClasses.length].id,
        birthday: new Date(2015, 0, 1),
      },
    });
    createdStudents.push(student);
  }

  // 8️⃣ EXAMS & RESULTS
  for (const lesson of createdLessons) {
    const exam = await prisma.exam.create({
      data: {
        title: `Exam for ${lesson.name}`,
        startTime: new Date(currentYear, 10, 1),
        endTime: new Date(currentYear, 10, 1, 2),
        lessonId: lesson.id,
      },
    });

    for (const student of createdStudents) {
      if (student.classId === lesson.classId) {
        await prisma.result.create({
          data: {
            score: Math.floor(Math.random() * 100),
            studentId: student.id,
            examId: exam.id,
          },
        });
      }
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });