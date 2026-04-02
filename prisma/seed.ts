import { Day, PrismaClient, UserSex } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database...");
  // Clear all in correct order to avoid foreign key errors
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
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany(); // Added User cleanup

  console.log("Seeding new data...");
  const currentYear = new Date().getFullYear();

  // 1. ADMIN
  await prisma.admin.create({ data: { id: "admin1", username: "admin1" } });

  // 2. GRADES
  const createdGrades = [];
  for (let i = 1; i <= 6; i++) {
    const grade = await prisma.grade.create({ data: { level: i } });
    createdGrades.push(grade);
  }

  // 3. CLASSES
  const createdClasses = [];
  for (const grade of createdGrades) {
    const newClass = await prisma.class.create({
      data: {
        name: `${grade.level}A`,
        gradeId: grade.id,
        capacity: 20,
      },
    });
    createdClasses.push(newClass);
  }

  // 4. SUBJECTS
  const createdSubjects = [];
  const subjectNames = ["Math", "Science", "English", "History", "CS"];
  for (const name of subjectNames) {
    const subject = await prisma.subject.create({ data: { name } });
    createdSubjects.push(subject);
  }

  // 5. TEACHERS
  const createdTeachers = [];
  for (let i = 1; i <= 10; i++) {
    const teacher = await prisma.teacher.create({
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
        subjects: { connect: [{ id: createdSubjects[i % createdSubjects.length].id }] },
        birthday: new Date(1990, 0, 1),
      },
    });
    createdTeachers.push(teacher);
  }

  // 6. LESSONS (New: Needed for the Calendar)
  console.log("Creating Lessons...");
  const createdLessons = [];
  const days = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];
  
  for (let i = 1; i <= 10; i++) {
    const lesson = await prisma.lesson.create({
      data: {
        name: `Lesson ${i}`,
        day: days[i % 5],
        startTime: new Date(currentYear, 8, 1, 8, 0),
        endTime: new Date(currentYear, 8, 1, 9, 30),
        subjectId: createdSubjects[i % createdSubjects.length].id,
        classId: createdClasses[i % createdClasses.length].id,
        teacherId: createdTeachers[i % createdTeachers.length].id,
      },
    });
    createdLessons.push(lesson);
  }

  // 7. PARENTS & STUDENTS
  console.log("Creating Parents and Students...");
  const createdStudents = [];
  for (let i = 1; i <= 10; i++) {
    const parent = await prisma.parent.create({
      data: {
        id: `parent${i}`,
        username: `parent${i}`,
        name: `PName${i}`,
        surname: `PSurname${i}`,
        email: `p${i}@test.com`,
        phone: `123${i}`,
        address: `Addr${i}`,
      },
    });

    const student = await prisma.student.create({
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
        parentId: parent.id,
        gradeId: createdGrades[i % createdGrades.length].id,
        classId: createdClasses[i % createdClasses.length].id,
        birthday: new Date(2015, 0, 1),
      },
    });
    createdStudents.push(student);
  }

  // 8. EXAMS, ASSIGNMENTS & RESULTS (New: Needed for performance charts)
  console.log("Creating Academic Data...");
  for (const lesson of createdLessons) {
    const exam = await prisma.exam.create({
      data: {
        title: `Exam for ${lesson.name}`,
        startTime: new Date(currentYear, 10, 1),
        endTime: new Date(currentYear, 10, 1, 2),
        lessonId: lesson.id,
      },
    });

    // Create a result for each student in the exam
    for (const student of createdStudents) {
        if(student.classId === lesson.classId) {
            await prisma.result.create({
                data: {
                    score: Math.floor(Math.random() * 100),
                    studentId: student.id,
                    examId: exam.id,
                }
            });
        }
    }
  }

  // 9. MESSAGING USERS (New: Crucial for your Prisma Studio inserts)
  console.log("Syncing Messaging Users...");
  await prisma.user.create({ data: { id: "admin1", username: "admin_user" } });
  await prisma.user.create({ data: { id: "teacher1", username: "teacher_user" } });
  await prisma.user.create({ data: { id: "parent1", username: "parent_user" } });

  // 10. FINANCE
  console.log("Creating Finance Data...");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 12; i++) {
    await prisma.income.create({
      data: {
        title: `Fees - ${months[i]}`,
        amount: Math.floor(Math.random() * 5000) + 2000,
        date: new Date(currentYear, i, 15),
      },
    });
    await prisma.expense.create({
      data: {
        title: `Utilities - ${months[i]}`,
        amount: Math.floor(Math.random() * 3000) + 1000,
        date: new Date(currentYear, i, 15),
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });