import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { StudentSchema } from "@/lib/validation";

type EnrollStudentInput = {
  student: StudentSchema;
  schoolId: string;
  overrides?: {
    username?: string;
    password?: string;
    email?: string | null;
  };
};

export async function enrollStudent({
  student,
  schoolId,
  overrides,
}: EnrollStudentInput) {
  const school = await prisma.school.findUnique({
  where: {
    id: schoolId,
  },
  select: {
    code: true,
  },
});

if (!school) {
  throw new Error("School not found.");
}

const studentCount = await prisma.student.count({
  where: {
    schoolId,
  },
});

const currentYear = new Date().getFullYear();

const admissionNumber = `${school.code}-${currentYear}-${String(
  studentCount + 1
).padStart(4, "0")}`;

console.log("Generated Admission Number:", admissionNumber);

const client = await clerkClient();
const username = overrides?.username ?? student.username;
const password = overrides?.password ?? student.password;
const email = overrides?.email ?? student.email;


const user = await client.users.createUser({
  username,
  password,
  firstName: student.name,
  lastName: student.surname,
  emailAddress: email ? [email] : [],
  publicMetadata: {
    role: "student",
  },
});

console.log("Clerk Student Created:", user.id);

try {
  const createdStudent = await prisma.student.create({
    data: {
      id: user.id,
      clerkId: user.id,

      username,

      name: student.name,
      surname: student.surname,

     email: email || null,
      phone: student.phone || null,

      address: student.address,

      img: student.img || null,

      bloodType: student.bloodType,

      sex: student.sex,

      birthday: new Date(student.birthday),

      schoolId,

      admissionNumber,

      levelId: student.levelId,

      classId: student.classId,

      parentId: student.parentId || null,
    },
  });

 return {
  student: createdStudent,
  admissionNumber,
};

} catch (error) {
  await client.users.deleteUser(user.id);
  throw error;
}





}