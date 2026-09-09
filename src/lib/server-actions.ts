"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { sendAttendanceAlert } from "@/lib/notifications";
import { formatPhoneNumber } from "@/lib/utils";
import { sendResultNotification } from "@/lib/notifications";
import { enrollStudent } from "@/lib/student/enrollment";
import { randomUUID } from "crypto";
import {
  announcementSchema,
  assignmentSchema,
  attendanceSchema,
  classSchema,
  eventSchema,
  examSchema,
  lessonSchema,
  parentSchema,
  resultSchema,
  levelSchema,
  studentSchema,
  subjectSchema,
  teacherSchema,
  feeAllocationSchema,
  feeCategorySchema,
  paymentRecordSchema,
  incomeSchema,
  expenseSchema,
  promotionSchema,
  registerSchoolSchema,
  streamSchema,
} from "./validation";

import type {
  AnnouncementSchema,
  AssignmentSchema,
  AttendanceSchema,
  ClassSchema,
  EventSchema,
  ExamSchema,
  LessonSchema,
  ParentSchema,
  ResultSchema,
  LevelSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  FeeAllocationSchema,
  FeeCategorySchema,
  PaymentRecordSchema,
  IncomeSchema,
  ExpenseSchema,
  PromotionSchema,
  StreamSchema,
} from "./validation";

import { prisma } from "./prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/shared/error";
import Pusher from "pusher";
import {
  Prisma,
  PaymentStatus,
  PromotionStatus,
  Day,
  SchoolTerm,
  AssignmentStatus,
} from "@prisma/client";
import { generateReceiptNumber } from "@/lib/utils";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

type CurrentState = { success: boolean; error: boolean; message?: string };

function getGrade(score: number) {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

function getRemark(score: number) {
  if (score >= 70) return "Excellent";
  if (score >= 60) return "Very Good";
  if (score >= 50) return "Good";
  if (score >= 45) return "Fair";
  if (score >= 40) return "Pass";
  return "Fail";
}

// ---------------- SUBJECT ----------------

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema,
) => {
     console.log("========== CREATE SUBJECT START =======");


  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  console.log("Admin:", admin);

  const schoolId = admin?.schoolId;

  console.log("schoolId:", schoolId);

  const validated = subjectSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid subject data.",
    };
  }

  const subject = validated.data;

  console.log("========== RECEIVED SUBJECT ==========");
console.log("Name:", subject.name);

console.log("General Levels:");
console.log(subject.generalLevels);

console.log("Assignments:");
console.log(subject.assignments);

console.log("Teachers:");
console.log(subject.teachers);

console.log("======================================");

  try {
    const existing = await prisma.subject.findFirst({
      where: {
        name: subject.name,
        schoolId,
      },
    });

    if (existing) {
      return {
        success: false,
        error: true,
        message: `The subject "${subject.name}" already exists.`,
      };
    }

    const createdSubject = await prisma.subject.create({
  data: {
    name: subject.name,
    schoolId,

    teachers: {
      connect: subject.teachers.map((id) => ({
        id,
      })),
    },
  },
});

const assignments = [];

// Subjects available to the whole level
for (const levelId of subject.generalLevels) {
  assignments.push({
    subjectId: createdSubject.id,
    levelId: Number(levelId),
    streamId: null,
    schoolId,
  });
}

// Subjects available only to specific streams
for (const item of subject.assignments) {
  const [levelId, streamId] = item.split("-");

  assignments.push({
    subjectId: createdSubject.id,
    levelId: Number(levelId),
    streamId: Number(streamId),
    schoolId,
  });
}

console.log("SUBJECT ASSIGNMENTS");
console.table(assignments);

await prisma.subjectAssignment.createMany({
  data: assignments,
});

const savedAssignments = await prisma.subjectAssignment.findMany({
  where: {
    subjectId: createdSubject.id,
  },
});

console.log("========== SAVED ASSIGNMENTS ==========");
console.table(savedAssignments);

    revalidatePath("/list/subjects");

    return {
      success: true,
      error: false,
      message: "Subject created successfully.",
    };
  } catch (err: any) {
  console.error("================================");
  console.error("CREATE SUBJECT ERROR");
  console.error(err);
  console.error("Message:", err.message);
  console.error("Code:", err.code);
  console.error("Meta:", err.meta);
  console.error("================================");

  return {
    success: false,
    error: true,
    message: err.message ?? "Failed to create subject.",
  };
}
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  const validated = subjectSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid subject data.",
    };
  }

  const subject = validated.data;

  if (!subject.id) {
    return {
      success: false,
      error: true,
      message: "Subject ID is required.",
    };
  }

  try {
    const duplicate = await prisma.subject.findFirst({
      where: {
        name: subject.name,
        schoolId,
        NOT: {
          id: Number(subject.id),
        },
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: true,
        message: `The subject "${subject.name}" already exists.`,
      };
    }

    await prisma.subject.update({
  where: {
    id: Number(subject.id),
  },
  data: {
    name: subject.name,

    teachers: {
      set: subject.teachers.map((id) => ({
        id,
      })),
    },
  },
});

await prisma.subjectAssignment.deleteMany({
  where: {
    subjectId: Number(subject.id),
  },
});

const assignments = [];

// Whole level assignments
for (const levelId of subject.generalLevels) {
  assignments.push({
    subjectId: Number(subject.id),
    levelId: Number(levelId),
    streamId: null,
    schoolId,
  });
}

// Stream-specific assignments
for (const item of subject.assignments) {
  const [levelId, streamId] = item.split("-");

  assignments.push({
    subjectId: Number(subject.id),
    levelId: Number(levelId),
    streamId: Number(streamId),
    schoolId,
  });
}

console.log("SUBJECT ASSIGNMENTS");
console.table(assignments);

await prisma.subjectAssignment.createMany({
  data: assignments,
});

const streams =
  subject.assignments.length > 0
    ? subject.assignments.map((item) => {
        const [, streamId] = item.split("-");
        return Number(streamId);
      })
    : [null];

for (const levelId of subject.generalLevels.map(Number)) {
  for (const streamId of streams) {
    await prisma.subjectAssignment.create({
      data: {
        subjectId: Number(subject.id),
        schoolId,
        levelId,
        streamId,
      },
    });
  }
}

    revalidatePath("/list/subjects");

    return {
      success: true,
      error: false,
      message: "Subject updated successfully.",
    };
  } catch (err) {
    console.error("UPDATE_SUBJECT_ERROR:", err);

    return {
      success: false,
      error: true,
      message: "Failed to update subject.",
    };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = Number(data.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Invalid subject ID.",
    };
  }

  try {
    await prisma.subject.delete({
      where: { id },
    });

    revalidatePath("/list/subjects");

    return {
      success: true,
      error: false,
      message: "Subject deleted successfully.",
    };
  } catch (err) {
    console.error("DELETE_SUBJECT_ERROR:", err);

    return {
      success: false,
      error: true,
      message: "Failed to delete subject.",
    };
  }
};

// ---------------- CLASS ----------------

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = classSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid class data.",
    };
  }


const classData = validated.data;

  try {
  const level = await prisma.level.findUnique({
    where: {
      id: classData.levelId,
    },
  });

  if (!level) {
    return {
      success: false,
      error: true,
      message: "Level not found.",
    };
  }

  

  let stream = null;

  if (classData.streamId) {
    stream = await prisma.stream.findUnique({
      where: {
        id: classData.streamId,
      },
    });

    if (!stream) {
      return {
        success: false,
        error: true,
        message: "Stream not found.",
      };
    }
  }

 const className = `${level.name} ${classData.name.trim()}`;

  // Prevent duplicates
  const existingClass = await prisma.class.findFirst({
    where: {
      schoolId,
      name: className,
    },
  });

  if (existingClass) {
    return {
      success: false,
      error: true,
      message: `${className} already exists.`,
    };
  }

  await prisma.class.create({
    data: {
      name: className,
      capacity: classData.capacity,
      schoolId,
      levelId: classData.levelId,
      streamId: classData.streamId ?? null,
      supervisorId: classData.supervisorId ?? null,
    },
  });

  revalidatePath("/list/classes");

  return {
    success: true,
    error: false,
    message: "Class created successfully.",
  };
} catch (err) {
  console.error("CREATE_CLASS_ERROR:", err);

  return {
    success: false,
    error: true,
    message: "Failed to create class.",
  };
}
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;
  const validated = classSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid class data.",
    };
  }

  const classData = validated.data;

  if (!classData.id) {
    return {
      success: false,
      error: true,
      message: "Class ID is required.",
    };
  }

  try {
  const level = await prisma.level.findUnique({
    where: {
      id: classData.levelId,
    },
  });

  if (!level) {
    return {
      success: false,
      error: true,
      message: "Level not found.",
    };
  }

  let stream = null;

  if (classData.streamId) {
    stream = await prisma.stream.findUnique({
      where: {
        id: classData.streamId,
      },
    });

    if (!stream) {
      return {
        success: false,
        error: true,
        message: "Stream not found.",
      };
    }
  }

  // Generate the class name
 const className = `${level.name} ${validated.data.name.trim()}`;

  // Check for duplicates (excluding the current class)
  const duplicate = await prisma.class.findFirst({
    where: {
      schoolId,
      name: className,
      NOT: {
        id: classData.id,
      },
    },
  });

  if (duplicate) {
    return {
      success: false,
      error: true,
      message: `${className} already exists.`,
    };
  }

  await prisma.class.update({
    where: {
      id: classData.id,
    },
    data: {
      name: className,
      capacity: classData.capacity,
      levelId: classData.levelId,
      streamId: classData.streamId ?? null,
      supervisorId: classData.supervisorId ?? null,
    },
  });

  revalidatePath("/list/classes");

  return {
    success: true,
    error: false,
    message: "Class updated successfully.",
  };
} catch (err) {
  console.error("UPDATE_CLASS_ERROR:", err);

  return {
    success: false,
    error: true,
    message: "Failed to update class.",
  };
}
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = Number(data.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Invalid class ID.",
    };
  }

  try {
    await prisma.class.delete({
      where: {
        id,
      },
    });

    revalidatePath("/list/classes");

    return {
      success: true,
      error: false,
      message: "Class deleted successfully.",
    };
  } catch (err) {
    console.error("DELETE_CLASS_ERROR:", err);

    return {
      success: false,
      error: true,
      message: "Failed to delete class.",
    };
  }
};

// ---------------- TEACHER ----------------

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }


  const school = await prisma.school.findUnique({
  where: {
    id: schoolId,
  },
  select: {
    code: true,
  },
});

if (!school) {
  return {
    success: false,
    error: true,
    message: "School not found.",
  };
}


  const validated = teacherSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid teacher data.",
    };
  }

  try {
    const existingTeacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { username: validated.data.username },
          ...(validated.data.email ? [{ email: validated.data.email }] : []),
          { staffId: validated.data.staffId },
        ],
      },
    });

    if (existingTeacher) {
      if (existingTeacher.username === data.username) {
        return {
          success: false,
          error: true,
          message:
            "A teacher with this username, email, or staff ID already exists.",
        };
      }

      if (existingTeacher.staffId === data.staffId) {
        return {
          success: false,
          error: true,
          message: "Staff ID already exists.",
        };
      }

      if (data.email && existingTeacher.email === data.email) {
        return {
          success: false,
          error: true,
          message: "Email already exists.",
        };
      }
    }

    const client = await clerkClient();

    const user = await client.users.createUser({
      username: validated.data.username,
      password: validated.data.password,
      firstName: validated.data.firstName,
      lastName: validated.data.lastName,
      emailAddress: validated.data.email ? [validated.data.email] : [],
      publicMetadata: {
        role: "teacher",
        schoolId,
      },
    });

    await prisma.teacher.create({
  data: {
    id: user.id,
    staffId: validated.data.staffId,
    clerkId: user.id,
    username: validated.data.username,
    firstName: validated.data.firstName,
    middleName: validated.data.middleName,
    lastName: validated.data.lastName,
    email: validated.data.email,
    phone: validated.data.phone,
    address: validated.data.address,
    employmentDate: validated.data.employmentDate,
    birthday: validated.data.birthday,
    bloodType: validated.data.bloodType,
    qualification: validated.data.qualification || null,
    status: validated.data.status,
    img: validated.data.img || null,
    sex: validated.data.sex,
    schoolId,

    subjects: {
      connect:
        validated.data.subjects?.map((id) => ({
          id: Number(id),
        })) ?? [],
    },
  },
});

    revalidatePath("/list/teachers");

    return {
      success: true,
      error: false,
      message: "Teacher created successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message:
        err.errors?.[0]?.longMessage ??
        err.message ??
        "Failed to create teacher.",
    };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema,
) => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      message: "Teacher ID is required.",
    };
  }

  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }


  const school = await prisma.school.findUnique({
  where: {
    id: schoolId,
  },
  select: {
    code: true,
  },
});

if (!school) {
  return {
    success: false,
    error: true,
    message: "School not found.",
  };
}

  const validated = teacherSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid teacher data.",
    };
  }

  try {
    // Duplicate username
    const duplicate = await prisma.teacher.findFirst({
      where: {
        NOT: {
          id: validated.data.id,
        },
        OR: [
          { username: validated.data.username },
          ...(validated.data.email ? [{ email: validated.data.email }] : []),
          { staffId: validated.data.staffId },
        ],
      },
    });

    if (duplicate) {
      if (duplicate.username === validated.data.username) {
        return {
          success: false,
          error: true,
          message: "Username already exists.",
        };
      }

      if (duplicate.staffId === validated.data.staffId) {
        return {
          success: false,
          error: true,
          message: "Staff ID already exists.",
        };
      }

      if (validated.data.email && duplicate.email === validated.data.email) {
        return {
          success: false,
          error: true,
          message: "Email already exists.",
        };
      }
    }

    const teacher = await prisma.teacher.findUnique({
      where: {
        id: validated.data.id,
      },
      select: {
        clerkId: true,
      },
    });

    if (!teacher) {
      return {
        success: false,
        error: true,
        message: "Teacher not found.",
      };
    }

    const client = await clerkClient();

    await client.users.updateUser(teacher.clerkId, {
      username: validated.data.username,
      ...(validated.data.password && {
        password: validated.data.password,
      }),
      firstName: validated.data.firstName,
      lastName: validated.data.lastName,
    });

    await prisma.teacher.update({
      where: {
        id: validated.data.id,
      },
      data: {
        username: validated.data.username,
        firstName: validated.data.firstName,
        middleName: validated.data.middleName,
        staffId: validated.data.staffId,
        employmentDate: new Date(validated.data.employmentDate),
        qualification: validated.data.qualification,
        lastName: validated.data.lastName,
        email: validated.data.email || null,
        phone: validated.data.phone || null,
        address: validated.data.address,
        img: validated.data.img || null,
        bloodType: validated.data.bloodType,
        sex: validated.data.sex,
        birthday: validated.data.birthday,

        subjects: {
          set:
            validated.data.subjects?.map((id) => ({
              id: Number(id),
            })) ?? [],
        },
      },
    });

    revalidatePath("/list/teachers");

    return {
      success: true,
      error: false,
      message: "Teacher updated successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message:
        err.errors?.[0]?.longMessage ??
        err.message ??
        "Failed to update teacher.",
    };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Teacher ID missing.",
    };
  }

  try {
    const teacher = await prisma.teacher.findUnique({
      where: {
        id,
      },
      select: {
        clerkId: true,
      },
    });

    if (!teacher) {
      return {
        success: false,
        error: true,
        message: "Teacher not found.",
      };
    }

    const client = await clerkClient();

    try {
      await client.users.deleteUser(teacher.clerkId);
    } catch (err: any) {
      if (
        err.status !== 404 &&
        err.errors?.[0]?.code !== "resource_not_found"
      ) {
        throw err;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.assignment.deleteMany({
        where: {
          teacherId: id,
        },
      });

      await tx.exam.deleteMany({
        where: {
          teacherId: id,
        },
      });

      await tx.lesson.deleteMany({
        where: {
          teacherId: id,
        },
      });

      await tx.class.updateMany({
        where: {
          supervisorId: id,
        },
        data: {
          supervisorId: null,
        },
      });

      await tx.teacher.delete({
        where: {
          id,
        },
      });
    });

    revalidatePath("/list/teachers");

    return {
      success: true,
      error: false,
      message: "Teacher deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to delete teacher.",
    };
  }
};

// ---------------- STUDENT ----------------

export const createStudent = async (
 
  currentState: CurrentState,
  data: StudentSchema,
) => {
   console.log("=== CREATE STUDENT STARTED ===");
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }


  const school = await prisma.school.findUnique({
  where: {
    id: schoolId,
  },
  select: {
    code: true,
  },
});

if (!school) {
  return {
    success: false,
    error: true,
    message: "School not found.",
  };
}

  // ✅ Validate FIRST

  console.log(data);
  const validated = studentSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid student data.",
    };
  }

  try {
    // ✅ NOW you can use validated.data
    const duplicate = await prisma.student.findFirst({
      where: {
        OR: [
          { username: validated.data.username },
          ...(validated.data.email ? [{ email: validated.data.email }] : []),
        ],
      },
    });

    if (duplicate) {
      if (duplicate.username === validated.data.username) {
        return {
          success: false,
          error: true,
          message: "Username already exists.",
        };
      }

      
      

      if (validated.data.email && duplicate.email === validated.data.email) {
        return {
          success: false,
          error: true,
          message: "Email already exists.",
        };
      }
    }

    // ✅ Check class capacity

    if (validated.data.classId) {
        const classItem = await prisma.class.findUnique({
          where: {
            id: validated.data.classId,
          },
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        });

        if (classItem && classItem._count.students >= classItem.capacity) {
          return {
            success: false,
            error: true,
            message: "Class is at full capacity.",
          };
        }
      }

   await enrollStudent({
  student: validated.data,
  schoolId,
});

    revalidatePath("/list/students");

    revalidateTag("students", "max");
revalidateTag(`dashboard-${schoolId}`, "max");

    return { success: true, error: false,  message: "Student enrolled successfully.", };
    
  } catch (err: any) {
  console.error("====================================");
  console.error("CREATE STUDENT ERROR");
  console.error(err);
  console.error("Message:", err.message);
  console.error("Code:", err.code);
  console.error("Meta:", err.meta);
  console.error("====================================");

  return {
    success: false,
    error: true,
    message: err.message ?? "Failed to create student.",
  };
};
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema,
) => {

  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  // ✅ Validate FIRST
  const validated = studentSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid student data.",
    };
  }

  if (!validated.data.id)
    return { success: false, error: true, message: "Missing Student ID" };

  const duplicate = await prisma.student.findFirst({
    where: {
      OR: [
        { username: validated.data.username },
        ...(validated.data.email ? [{ email: validated.data.email }] : []),
      ],
      NOT: {
        id: validated.data.id,
      },
    },
  });

  if (duplicate) {
    if (duplicate.username === validated.data.username) {
      return {
        success: false,
        error: true,
        message: "Username already exists.",
      };
    }

    if (validated.data.email && duplicate.email === validated.data.email) {
      return {
        success: false,
        error: true,
        message: "Email already exists.",
      };
    }
  }

  if (validated.data.classId) {
    const classItem = await prisma.class.findUnique({
      where: {
        id: validated.data.classId,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (classItem && classItem._count.students >= classItem.capacity) {
      // Only block if the student is actually moving into another class
      const currentStudent = await prisma.student.findUnique({
        where: {
          id: validated.data.id,
        },
        select: {
          classId: true,
        },
      });

      if (currentStudent?.classId !== validated.data.classId) {
        return {
          success: false,
          error: true,
          message: "Destination class is already full.",
        };
      }
    }
  }

  try {
    // 1. Update User in Clerk
    const client = await clerkClient();
    const student = await prisma.student.findUnique({
      where: {
        id: validated.data.id,
      },
      select: {
        clerkId: true,
      },
    });

    if (!student) {
      return {
        success: false,
        error: true,
        message: "Student not found.",
      };
    }

    if (!student.clerkId) {
  return {
    success: false,
    error: true,
    message: "Student has no Clerk account.",
  };
}

    await client.users.updateUser(student.clerkId, {
      username: validated.data.username,
      ...(validated.data.password && { password: validated.data.password }),
      firstName: validated.data.name,
      lastName: validated.data.surname,
    });

    // 2. Update Student in Prisma
    await prisma.student.update({
      where: { id: validated.data.id },
      data: {
        username: validated.data.username,
        name: validated.data.name,
        surname: validated.data.surname,
        email: validated.data.email || null,
        phone: validated.data.phone || null,
        address: validated.data.address,
        img: validated.data.img || null,
        bloodType: validated.data.bloodType,
        sex: validated.data.sex,
        birthday: new Date(validated.data.birthday),
        levelId: validated.data.levelId,
        classId: validated.data.classId,
        parentId: validated.data.parentId || null,
      },
    });

    revalidatePath("/list/students");

   Promise.all([
  revalidateTag("students", "max"),
  revalidateTag("profile", "max"),
  revalidateTag(`dashboard-${schoolId}`, "max"),
]).catch(console.error);

    return { success: true, error: false,  message: "Student updated successfully.", };
  } catch (err: any) {
  console.error("========== CREATE STUDENT ERROR ==========");
  console.error(err);
  console.error("Message:", err.message);
  console.error("Code:", err.code);
  console.error("Meta:", err.meta);

  return {
    success: false,
    error: true,
    message: err.message ?? "Failed to update student.",
  };
}
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    const client = await clerkClient();
    // Delete from Clerk first
    await client.users.deleteUser(id);

    // Then delete from Prisma
    await prisma.student.delete({
      where: { id },
    });

    revalidatePath("/list/students");
    revalidateTag("dashboard-stats", "dashboard-stats");
    return { success: true, error: false,  message: "Student deleted successfully.", };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: "Failed to delete student.",
    };
  }
};

// ---------------- PARENT ----------------

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }


  const school = await prisma.school.findUnique({
  where: {
    id: schoolId,
  },
  select: {
    code: true,
  },
});

if (!school) {
  return {
    success: false,
    error: true,
    message: "School not found.",
  };
}

  // ✅ Validate FIRST
  const validated = parentSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid parent data.",
    };
  }

  try {
    const client = await clerkClient();

    const duplicate = await prisma.parent.findFirst({
      where: {
        OR: [
          { username: validated.data.username },
          ...(validated.data.email ? [{ email: validated.data.email }] : []),
          { phone: validated.data.phone },
        ],
      },
    });

    if (duplicate) {
      if (duplicate.username === validated.data.username) {
        return {
          success: false,
          error: true,
          message: "Username already exists.",
        };
      }

      if (validated.data.email && duplicate.email === validated.data.email) {
        return {
          success: false,
          error: true,
          message: "Email already exists.",
        };
      }

      if (duplicate.phone === validated.data.phone) {
        return {
          success: false,
          error: true,
          message: "Phone number already exists.",
        };
      }
    }

    const user = await client.users.createUser({
      username: validated.data.username,
      password: validated.data.password,
      firstName: validated.data.firstName,
      lastName: validated.data.lastName,
      emailAddress: validated.data.email ? [validated.data.email] : [],
      publicMetadata: {
        role: "parent",
        schoolId,
      },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        clerkId: user.id,
        username: validated.data.username,
        firstName: validated.data.firstName,
        lastName: validated.data.lastName,
        email: validated.data.email || null,
        phone: validated.data.phone,
        address: validated.data.address,
        schoolId,
        relationship: validated.data.relationship as any,
        students: {
          connect: validated.data.students?.map((studentId: string) => ({
            id: studentId,
          })),
        },
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false,  message: "parent created Succesfully.", };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err.errors?.[0]?.longMessage || "Failed to create parent.",
    };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema,
) => {

  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }


  const school = await prisma.school.findUnique({
  where: {
    id: schoolId,
  },
  select: {
    code: true,
  },
});

if (!school) {
  return {
    success: false,
    error: true,
    message: "School not found.",
  };
}
  // ✅ Validate FIRST
  const validated = parentSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid parent data.",
    };
  }

  if (!validated.data.id)
    return { success: false, error: true, message: "Missing Parent ID" };

  try {
    const client = await clerkClient();

    const duplicate = await prisma.parent.findFirst({
      where: {
        OR: [
          { username: validated.data.username },
          ...(validated.data.email ? [{ email: validated.data.email }] : []),
          { phone: validated.data.phone },
        ],
        NOT: {
          id: validated.data.id,
        },
      },
    });

    if (duplicate) {
      if (duplicate.username === validated.data.username) {
        return {
          success: false,
          error: true,
          message: "Username already exists.",
        };
      }

      if (validated.data.email && duplicate.email === validated.data.email) {
        return {
          success: false,
          error: true,
          message: "Email already exists.",
        };
      }

      if (duplicate.phone === validated.data.phone) {
        return {
          success: false,
          error: true,
          message: "Phone number already exists.",
        };
      }
    }

    await client.users.updateUser(validated.data.id, {
      username: validated.data.username,
      ...(validated.data.password && { password: validated.data.password }),
      firstName: validated.data.firstName,
      lastName: validated.data.lastName,
    });

    await prisma.parent.update({
      where: { id: validated.data.id },
      data: {
        username: validated.data.username,
        firstName: validated.data.firstName,
        lastName: validated.data.lastName,
        email: validated.data.email || null,
        phone: validated.data.phone,
        address: validated.data.address,
        students: {
          set: validated.data.students?.map((studentId: string) => ({
            id: studentId,
          })),
        },
      },
    });

    revalidatePath("/list/parents");
   return { success: true, error: false,  message: "parent updated successfully.", };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: true, message: "Failed to update parent." };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get("id") as string;
  try {
    const client = await clerkClient();
    await prisma.student.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });
    try {
      await client.users.deleteUser(id);
    } catch (err: any) {
      if (
        err.status !== 404 &&
        err.errors?.[0]?.code !== "resource_not_found"
      ) {
        throw err;
      }
    }
    await prisma.parent.delete({ where: { id } });
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ---------------- Message ----------------
export const createMessage = async (currentState: any, formData: FormData) => {
  const receiverId = formData.get("receiverId") as string;
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: true,
      message: "Unauthorized.",
    };
  }

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const receiverTeacherId = formData.get("receiverTeacherId") as string | null;
  const receiverParentId = formData.get("receiverParentId") as string | null;

  const subject = formData.get("subject") as string;
  const content = formData.get("content") as string;

  try {
    await prisma.message.create({
      data: {
        senderId: admin.id,
        receiverTeacherId: receiverTeacherId || null,
        receiverParentId: receiverParentId || null,
        subject,
        content,
      } as Prisma.MessageUncheckedCreateInput,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ---------------- SEND MESSAGE ----------------

export const sendMessage = async (formData: FormData) => {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!admin) {
    return { success: false, error: "Admin not found" };
  }

  const content = formData.get("content") as string;
  const subject = formData.get("subject") as string | null;

  const receiverTeacherId =
    (formData.get("receiverTeacherId") as string) || null;

  const receiverParentId = (formData.get("receiverParentId") as string) || null;

  await prisma.message.create({
    data: {
      senderId: admin.id,
      subject,
      content,
      receiverTeacherId,
      receiverParentId,
    },
  });

  revalidatePath("/admin/messages");

  return {
    success: true,
  };
};

// ---------------- ANNOUNCEMENT ----------------

export const createAnnouncement = async (
  currentState: { success: boolean; error: boolean },
  data: AnnouncementSchema,
) => {
  // 1. Get authenticated user's school
 const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  try {
    const validatedFields = announcementSchema.safeParse(data);

    if (!validatedFields.success) {
      console.error(
        "❌ ANNOUNCEMENT VALIDATION ERROR:",
        validatedFields.error.flatten()
      );

      return {
        success: false,
        error: true,
        message: "Invalid announcement data.",
      };
    }

    const {
      title,
      description,
      classId,
      levelId,
      teacherId,
    } = validatedFields.data;

    // 2. Create announcement
    await prisma.announcement.create({
      data: {
        title,
        description,
        schoolId,

        classId: classId ?? null,
        levelId: levelId && levelId !== 0 ? levelId : null,
        teacherId: teacherId ?? null,
      },
    });

   revalidatePath("/list/announcements");
revalidatePath("/admin");

    return {
      success: true,
      error: false,
      message: "Announcement created successfully.",
    };
  } catch (err: any) {
    console.error("🔥 PRISMA ERROR:", err.message);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to create announcement.",
    };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema,
) => {
   const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = announcementSchema.safeParse(data);

  if (!validated.success) {
    console.error(
      "❌ ANNOUNCEMENT VALIDATION ERROR:",
      validated.error.flatten()
    );

    return {
      success: false,
      error: true,
      message: "Invalid announcement data.",
    };
  }

  if (!validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Announcement ID is required.",
    };
  }

  try {
    await prisma.announcement.update({
      where: {
        id: validated.data.id,
      },
      data: {
        title: validated.data.title,
        description: validated.data.description,

        schoolId,

        classId: validated.data.classId ?? null,
        levelId: validated.data.levelId ?? null,
        teacherId: validated.data.teacherId ?? null,
      },
    });

    revalidatePath("/list/announcements");

    return {
      success: true,
      error: false,
      message: "Announcement updated successfully.",
    };
  } catch (err: any) {
    console.error("🔥 UPDATE ANNOUNCEMENT ERROR:", err.message);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to update announcement.",
    };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = Number(data.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Announcement ID missing.",
    };
  }

  try {
    await prisma.announcement.delete({
      where: {
        id,
      },
    });

    revalidatePath("/list/announcements");

    return {
      success: true,
      error: false,
      message: "Announcement deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to delete announcement.",
    };
  }
};

// ---------------- EVENT ----------------

export const createEvent = async (
  currentState: any,
  formData: FormData | any,
) => {
  const data =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

 const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }
  const validatedFields = eventSchema.safeParse(data);

  if (!validatedFields.success) {
    console.log("❌ ZOD VALIDATION FAILED:", validatedFields.error.flatten());
    return { success: false, error: true, message: "Invalid event data." };
  }

  try {
    await prisma.event.create({
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        startTime: new Date(validatedFields.data.startTime),
        endTime: new Date(validatedFields.data.endTime),
        // FIX: schoolId is required by your schema
        schoolId,
        classId: validatedFields.data.classId
          ? parseInt(String(validatedFields.data.classId), 10)
          : null,
      },
    });
    revalidatePath("/list/events");
    return {
      success: true,
      error: false,
      message: "Event created successfully.",
    };
  } catch (err) {
    console.error("❌ DATABASE INSERT ERROR:", err);
    return {
      success: false,
      error: true,
      message: "Invalid event data.",
    };
  }
};

export const updateEvent = async (
  currentState: any,
  formData: FormData | any,
) => {
  const data =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

 const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validatedFields = eventSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, error: true, message: "Invalid event data." };
  }

  if (!validatedFields.data.id)
    return { success: false, error: true, message: "Event ID is required." };

  try {
    await prisma.event.update({
      where: { id: validatedFields.data.id },
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        startTime: new Date(validatedFields.data.startTime),
        endTime: new Date(validatedFields.data.endTime),
        schoolId,
        classId: validatedFields.data.classId
          ? Number(validatedFields.data.classId)
          : null,
      },
    });
    revalidatePath("/list/events");
    return {
      success: true,
      error: false,
      message: "Event updated successfully.",
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to update event." };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = Number(data.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Event ID missing.",
    };
  }
  try {
    await prisma.event.delete({
      where: { id },
    });

    revalidatePath("/list/events");
    return {
      success: true,
      error: false,
      message: "Event deleted successfully.",
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Failed to delete event." };
  }
};

// --- MARK MESSAGE ---

export const markTeacherMessagesAsRead = async (teacherId: string) => {
  try {
    await prisma.message.updateMany({
      where: {
        receiverTeacherId: teacherId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/list/messages");

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const markParentMessagesAsRead = async (parentId: string) => {
  try {
    await prisma.message.updateMany({
      where: {
        receiverParentId: parentId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/list/messages");

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

// --- CREATE LEVEL ---

export const createLevel = async (
  currentState: CurrentState,
  data: LevelSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = levelSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid level data.",
    };
  }

  try {
    console.log("Clerk schoolId:", schoolId);
    console.log("Form schoolId:", schoolId);
    const level = validated.data;

await prisma.level.create({
  data: {
    name: level.name,
    level: Number(level.level),
    stage: level.stage,
    schoolId,
  },
});

    revalidatePath("/list/levels");

    return {
      success: true,
      error: false,
      message: "Level created successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to create level.",
    };
  }
};

export const updateLevel = async (currentState: any, data: LevelSchema) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = levelSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid level data.",
    };
  }
  try {
    await prisma.level.update({
      where: {
        id: validated.data.id,
      },
      data: {
        name: validated.data.name,
        // Convert Level to integer
        level: Number(validated.data.level),
      },
    });

    // Don't forget to revalidate so the UI updates
    revalidatePath("/list/levels");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteLevel = async (currentState: any, formData: FormData) => {
  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Level ID missing.",
    };
  }

  try {
    await prisma.level.delete({
      where: {
        id,
      },
    });

    // This clears the cache so the Grade disappears from the list immediately
    revalidatePath("/list/levels");

    return { success: true, error: false };
  } catch (err) {
    console.error("Delete Error:", err);
    return {
      success: false,
      error: true,
      message: err instanceof Error ? err.message : "Failed to delete level.",
    };
  }
};

// ---------------- PRomotION ----------------

export const createPromotion = async (
  currentState: CurrentState,
  data: PromotionSchema,
): Promise<CurrentState> => {
  const validated = promotionSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid promotion data.",
    };
  }

  try {
    await prisma.promotion.create({
      data: validated.data,
    });

    revalidatePath("/admin/promote");

    return {
      success: true,
      error: false,
      message: "Student promoted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to create promotion.",
    };
  }
};

export const updatePromotion = async (
  currentState: CurrentState,
  data: PromotionSchema,
): Promise<CurrentState> => {
  const validated = promotionSchema.safeParse(data);

  if (!validated.success || !validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Invalid promotion data.",
    };
  }

  try {
    await prisma.promotion.update({
      where: {
        id: validated.data.id,
      },
      data: {
        studentId: validated.data.studentId,
        academicYearId: validated.data.academicYearId,
        fromLevelId: validated.data.fromLevelId,
        toLevelId: validated.data.toLevelId,
        fromClassId: validated.data.fromClassId,
        toClassId: validated.data.toClassId,
        promotedBy: validated.data.promotedBy,
        remarks: validated.data.remarks,
        status: validated.data.status,
        promotedAt: validated.data.promotedAt,
      },
    });

    revalidatePath("/admin/promote");

    return {
      success: true,
      error: false,
      message: "Promotion updated successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to update promotion.",
    };
  }
};

export const deletePromotion = async (
  currentState: CurrentState,
  formData: FormData,
): Promise<CurrentState> => {
  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Promotion ID is required.",
    };
  }

  try {
    await prisma.promotion.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/promote");

    return {
      success: true,
      error: false,
      message: "Promotion deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to delete promotion.",
    };
  }
};

// ---------------- BULK GRADING ----------------

export const saveBulkResultsAction = async (
  currentState: any,
  formData: FormData,
) => {
  const { sessionClaims } = await auth();
  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const subjectId = Number(formData.get("subjectId"));
  const academicYearId = Number(formData.get("academicYearId"));
  const term = formData.get("term") as SchoolTerm;
  const scoreType = formData.get("scoreType") as "assignment" | "test" | "exam";

  const studentIds = formData.getAll("studentId") as string[];
  const scores = formData.getAll("score") as string[];

  if (!subjectId || !academicYearId || !term || studentIds.length === 0) {
    return {
      success: false,
      error: true,
      message: "Invalid grading data.",
    };
  }

  try {
    // Verify Subject belongs to school
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        schoolId,
      },
    });

    if (!subject) {
      return {
        success: false,
        error: true,
        message: "Subject not found.",
      };
    }

    // Verify Academic Year belongs to school
    const academicYear = await prisma.academicYear.findFirst({
      where: {
        id: academicYearId,
        schoolId,
      },
    });

    if (!academicYear) {
      return {
        success: false,
        error: true,
        message: "Academic Year not found.",
      };
    }

    const operations = studentIds.map(async (studentId, index) => {
      const scoreValue = Number(scores[index]);

      if (isNaN(scoreValue)) return;

      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          schoolId,
        },
      });

      if (!student || !student.classId) return;

      const existing = await prisma.result.findUnique({
        where: {
          studentId_subjectId_academicYearId_term: {
            studentId,
            subjectId,
            academicYearId,
            term,
          },
        },
      });

      const assignmentScore =
        scoreType === "assignment"
          ? scoreValue
          : Number(existing?.assignmentScore ?? 0);

      const testScore =
        scoreType === "test" ? scoreValue : Number(existing?.testScore ?? 0);

      const examScore =
        scoreType === "exam" ? scoreValue : Number(existing?.examScore ?? 0);

      const totalScore = assignmentScore + testScore + examScore;

      const grade = getGrade(totalScore);

      const remark = getRemark(totalScore);

      return prisma.result.upsert({
        where: {
          studentId_subjectId_academicYearId_term: {
            studentId,
            subjectId,
            academicYearId,
            term,
          },
        },

        update: {
          assignmentScore: new Prisma.Decimal(assignmentScore),
          testScore: new Prisma.Decimal(testScore),
          examScore: new Prisma.Decimal(examScore),
          totalScore: new Prisma.Decimal(totalScore),
          grade,
          remark,
        },

        create: {
          studentId,
          classId: student.classId,
          schoolId,
          subjectId,
          academicYearId,
          term,

          assignmentScore: new Prisma.Decimal(assignmentScore),
          testScore: new Prisma.Decimal(testScore),
          examScore: new Prisma.Decimal(examScore),
          totalScore: new Prisma.Decimal(totalScore),

          grade,
          remark,
        },
      });
    });

    await Promise.all(operations);

    revalidatePath("/list/results");

    return {
      success: true,
      error: false,
      message: "Bulk results saved successfully.",
    };
  } catch (err) {
    console.error(err);

    return {
      success: false,
      error: true,
      message:
        err instanceof Error ? err.message : "Failed to save bulk results.",
    };
  }
};

// ---------------- CREATE ATTENDANCE ----------------

export async function createAttendance(prevState: any, formData: FormData) {
  const { sessionClaims } = await auth();
  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  try {
    const dateStr = formData.get("date") as string;
    const academicYearId = Number(formData.get("academicYearId"));
    const classId = Number(formData.get("classId"));
    const subjectIdValue = formData.get("subjectId");

    const subjectId =
      subjectIdValue && subjectIdValue !== "" ? Number(subjectIdValue) : null;

    const term = formData.get("term") as SchoolTerm;

    const studentsRaw = formData.get("students") as string;
    const students = studentsRaw ? JSON.parse(studentsRaw) : [];

    if (!students.length) {
      return {
        success: false,
        error: true,
        message: "No students supplied.",
      };
    }

    const attendanceDate = new Date(dateStr);
    attendanceDate.setHours(0, 0, 0, 0);

    await prisma.$transaction(
      students.map((student: any) =>
        prisma.attendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: student.studentId,
              classId,
              date: attendanceDate,
            },
          },
          update: {
            status: student.present ? "PRESENT" : "ABSENT",
            subjectId,
            academicYearId,
            term,
          },
          create: {
            studentId: student.studentId,
            classId,
            schoolId,
            academicYearId,
            subjectId,
            term,
            date: attendanceDate,
            status: student.present ? "PRESENT" : "ABSENT",
          },
        }),
      ),
    );

    // ---------------- SEND ABSENT NOTIFICATIONS ----------------

    const absentIds = students
      .filter((s: any) => !s.present)
      .map((s: any) => s.studentId);

    if (absentIds.length) {
      const absentStudents = await prisma.student.findMany({
        where: {
          id: {
            in: absentIds,
          },
        },
        include: {
          parent: true,
        },
      });

      for (const student of absentStudents) {
        if (student.parent?.phone) {
          const formattedPhone = formatPhoneNumber(student.parent.phone);

          await sendAttendanceAlert(
            formattedPhone,
            `${student.name} ${student.surname}`,
            student.admissionNumber,
          );
        }
      }
    }

    revalidatePath("/list/attendance");

    return {
      success: true,
      error: false,
      message: "Attendance saved successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to save attendance.",
    };
  }
}

// ---------------- SAVE ATTENDANCE ----------------

export const saveAttendanceAction = async (
  prevState: any,
  formData: FormData,
) => {
  const { sessionClaims } = await auth();
  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const academicYearId = Number(formData.get("academicYearId"));
  const classId = Number(formData.get("classId"));

  const subjectIdValue = formData.get("subjectId");

  const subjectId =
    subjectIdValue && subjectIdValue !== "" ? Number(subjectIdValue) : null;

  const term = formData.get("term") as SchoolTerm;

  const studentIds = formData.getAll("studentId") as string[];
  const statuses = formData.getAll("status") as string[];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const operations = studentIds.map((studentId, index) => {
      const present = statuses[index] === "true";

      return prisma.attendance.upsert({
        where: {
          studentId_classId_date: {
            studentId,
            classId,
            date: today,
          },
        },

        update: {
          status: present ? "PRESENT" : "ABSENT",
          subjectId,
          academicYearId,
          term,
        },

        create: {
          studentId,
          classId,
          schoolId,
          academicYearId,
          subjectId,
          term,
          date: today,
          status: present ? "PRESENT" : "ABSENT",
        },
      });
    });

    await prisma.$transaction(operations);

    // ---------------- SEND SMS TO ABSENT STUDENTS ----------------

    const absentIds = studentIds.filter(
      (_, index) => statuses[index] !== "true",
    );

    if (absentIds.length) {
      const absentStudents = await prisma.student.findMany({
        where: {
          id: {
            in: absentIds,
          },
        },
        include: {
          parent: true,
        },
      });

      for (const student of absentStudents) {
        if (student.parent?.phone) {
          const phone = formatPhoneNumber(student.parent.phone);

          await sendAttendanceAlert(
            phone,
            `${student.name} ${student.surname}`,
            student.admissionNumber,
          );
        }
      }
    }

    revalidatePath("/list/attendance");

    return {
      success: true,
      error: false,
      message: "Attendance saved successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to save attendance.",
    };
  }
};

// ---------------- REGISTER SCHOOL ----------------

export const registerSchool = async (formData: FormData) => {
  // Authenticate user first
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Validate input
  const validated = registerSchoolSchema.safeParse({
    schoolName: formData.get("schoolName"),
    yearName: formData.get("yearName"),
  });

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid input.",
    };
  }

  try {
    // Get Clerk user
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create School
      const newSchool = await tx.school.create({
        data: {
          name: validated.data.schoolName,
          code: crypto.randomUUID().slice(0, 8).toUpperCase(),
        },
      });

      // Create Academic Year
      await tx.academicYear.create({
        data: {
          name: validated.data.yearName,
          schoolId: newSchool.id,
          isCurrent: true,
        },
      });

      // Create Admin
      await tx.admin.create({
        data: {
          id: userId,
          clerkId: userId,

          username:
            clerkUser.username ??
            clerkUser.emailAddresses[0]?.emailAddress ??
            `admin_${newSchool.code.toLowerCase()}`,

          name:
            `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
            "Administrator",

          email: clerkUser.emailAddresses[0]?.emailAddress ?? null,

          school: {
            connect: {
              id: newSchool.id,
            },
          },
        },
      });

      return newSchool;
    });

    // Update Clerk metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "admin",
        schoolId: result.id,
      },
    });

    return {
      success: true,
      error: false,
      message: "School registered successfully.",
    };
  } catch (err: any) {
    console.error("ONBOARDING_ERROR:", err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to create school.",
    };
  }
};

export async function createSchool(formData: FormData, adminId: string) {
  const schoolName = formData.get("schoolName") as string;

  if (!schoolName || schoolName.length < 3) {
    return { success: false, error: "School name is too short!" };
  }

  try {
    const school = await prisma.school.create({
      data: {
        name: schoolName,
        code: crypto.randomUUID().slice(0, 8).toUpperCase(),
      },
    });

    await prisma.admin.upsert({
      where: {
        id: adminId,
      },
      update: {
        schoolId: school.id,
      },
      create: {
        id: adminId,
        clerkId: adminId,
        username: "Admin",
        name: "Administrator",
        schoolId: school.id,
      },
    });

    const client = await clerkClient();

    await client.users.updateUserMetadata(adminId, {
      publicMetadata: {
        role: "admin",
        schoolId: school.id,
      },
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to create school.",
    };
  }
}

// ---------------- RESULT (The Core Model) ----------------

export const saveResult = async (
  currentState: CurrentState,
  data: ResultSchema,
) => {
 // --------------------------------------------------
    // 1. AUTHENTICATION
    // --------------------------------------------------
    const { userId } = await auth();

    console.log("Authenticated user:", userId);

    if (!userId) {
      return {
        success: false,
        error: true,
        message: "You are not authenticated. Please log in again.",
      };
    }

    // --------------------------------------------------
    // 2. FIND ADMIN
    // --------------------------------------------------
    const admin = await prisma.admin.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        schoolId: true,
      },
    });

    console.log("Admin:", admin);

    if (!admin) {
      return {
        success: false,
        error: true,
        message: "Admin account not found.",
      };
    }

    const schoolId = admin.schoolId;

    if (!schoolId) {
      return {
        success: false,
        error: true,
        message: "No school is associated with this admin account.",
      };
    }

    console.log("School ID:", schoolId);


  const validated = resultSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid result data.",
    };
  }

  console.log("VALIDATED RESULT DATA:", validated.data);
console.log("STUDENT ID RECEIVED:", validated.data.studentId);

if (!validated.data.studentId) {
  return {
    success: false,
    error: true,
    message: "Please select a student.",
  };
}

  try {
    const student = await prisma.student.findUnique({
      where: {
        id: validated.data.studentId,
      },
      select: {
        classId: true,
        schoolId: true,
      },
    });

    if (!student) {
      return {
        success: false,
        error: true,
        message: "Student not found.",
      };
    }

    if (student.schoolId !== schoolId) {
      return {
        success: false,
        error: true,
        message: "Student does not belong to this school.",
      };
    }

    if (!student.classId) {
      return {
        success: false,
        error: true,
        message: "Student has no class assigned.",
      };
    }

    const assignmentScore = Number(validated.data.assignmentScore) || 0;
    const testScore = Number(validated.data.testScore) || 0;
    const examScore = Number(validated.data.examScore) || 0;

    const total = assignmentScore + testScore + examScore;

    const getGrade = (score: number) => {
      if (score >= 70) return { grade: "A", remark: "Excellent" };
      if (score >= 60) return { grade: "B", remark: "Very Good" };
      if (score >= 50) return { grade: "C", remark: "Good" };
      if (score >= 45) return { grade: "D", remark: "Fair" };
      if (score >= 40) return { grade: "E", remark: "Pass" };

      return { grade: "F", remark: "Fail" };
    };

    // ✅ Call it
    const { grade, remark } = getGrade(total);

    await prisma.result.upsert({
      where: {
        studentId_subjectId_academicYearId_term: {
          studentId: validated.data.studentId,
          subjectId: Number(validated.data.subjectId),
          academicYearId: Number(validated.data.academicYearId),
          term: validated.data.term,
        },
      },

      update: {
        assignmentScore: new Prisma.Decimal(assignmentScore),
        testScore: new Prisma.Decimal(testScore),
        examScore: new Prisma.Decimal(examScore),
        totalScore: new Prisma.Decimal(total),
        grade,
        remark,
        teacherRemark: validated.data.teacherRemark ?? null,
        principalRemark: validated.data.principalRemark ?? null,
      },

      create: {
        studentId: validated.data.studentId,
        classId: student.classId,
        schoolId,
        subjectId: validated.data.subjectId,
        academicYearId: validated.data.academicYearId,
        term: validated.data.term,

        assignmentScore: new Prisma.Decimal(assignmentScore),
        testScore: new Prisma.Decimal(testScore),
        examScore: new Prisma.Decimal(examScore),
        totalScore: new Prisma.Decimal(total),

        grade,
        remark,

        teacherRemark: validated.data.teacherRemark ?? null,
        principalRemark: validated.data.principalRemark ?? null,

        examId: validated.data.examId ?? null,
        assignmentId: validated.data.assignmentId ?? null,
      },
    });

    revalidatePath("/list/results");
    revalidateTag("dashboard-stats", "dashboard-stats");

    return {
      success: true,
      error: false,
      message: "Result saved successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to save result.",
    };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = assignmentSchema.safeParse(data);

  if (!validated.success) {
    console.error(
      "ASSIGNMENT VALIDATION ERROR:",
      validated.error.flatten()
    );

    return {
      success: false,
      error: true,
      message: "Invalid assignment data.",
    };
  }

  try {
    const settings = await prisma.schoolSettings.findFirst({
      where: {
        schoolId,
      },
      select: {
        currentAcademicYearId: true,
        currentTerm: true,
      },
    });

    if (!settings) {
      return {
        success: false,
        error: true,
        message: "School settings not configured.",
      };
    }

    /*
     * ==========================================
     * CHECK IF CLASSES ARE PROVIDED
     * ==========================================
     */

    const targetClassIds = validated.data.classes;

    if (!targetClassIds || targetClassIds.length === 0) {
      return {
        success: false,
        error: true,
        message: "Please select at least one target class or stream.",
      };
    }

    /*
     * ==========================================
     * FIND ALL RESOLVED CLASSES IN THE DATABASE
     * ==========================================
     */

    const targetClasses = await prisma.class.findMany({
      where: {
        schoolId,
        id: { in: targetClassIds.map(Number) },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log("TARGET CLASSES:", targetClasses);

    if (targetClasses.length === 0) {
      return {
        success: false,
        error: true,
        message:
          "No matching classes were found in the database for your selection.",
      };
    }

    /*
     * ==========================================
     * CREATE ASSIGNMENT FOR EVERY CLASS
     * ==========================================
     */

    const assignments = targetClasses.map((classItem) => ({
      title: validated.data.title,

      description:
        validated.data.description ?? null,

      instructions:
        validated.data.instructions ?? null,

      attachmentUrl:
        validated.data.attachmentUrl ?? null,

      totalMarks:
        validated.data.totalMarks,

      assignedDate:
        validated.data.assignedDate ?? new Date(),

      dueDate:
        validated.data.dueDate,

      status:
        validated.data.status ??
        AssignmentStatus.PUBLISHED,

      classId:
        classItem.id,

      subjectId:
        validated.data.subjectId,

      teacherId:
        validated.data.teacherId,

      schoolId,

      academicYearId:
        settings.currentAcademicYearId,

      term:
        settings.currentTerm,
    }));

    console.log(
      "ASSIGNMENTS TO CREATE:"
    );

    console.table(assignments);

    await prisma.assignment.createMany({
      data: assignments,
    });

    revalidatePath("/list/assignments");

    return {
      success: true,
      error: false,
      message: `Assignment created successfully for ${targetClasses.length} class${
        targetClasses.length === 1 ? "" : "es"
      }.`,
    };

  } catch (err: any) {
    console.error(
      "CREATE ASSIGNMENT ERROR:",
      err
    );

    return {
      success: false,
      error: true,
      message:
        err.message ||
        "Failed to create assignment.",
    };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema,
) => {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: true,
      message: "Unauthorized.",
    };
  }

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = assignmentSchema.safeParse(data);

  if (!validated.success) {
    console.error(
      "UPDATE ASSIGNMENT VALIDATION ERROR:",
      validated.error.flatten()
    );

    return {
      success: false,
      error: true,
      message: "Invalid assignment data.",
    };
  }

  if (!validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Assignment ID missing.",
    };
  }

  const assignmentId = Number(validated.data.id);

  try {
    // =========================================================
    // 1. FIND THE ASSIGNMENT BEING EDITED
    // =========================================================

    const existingAssignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      select: {
        id: true,
        schoolId: true,
        classId: true,
        subjectId: true,
        teacherId: true,
        academicYearId: true,
        term: true,

        class: {
          select: {
            id: true,
            levelId: true,
            schoolId: true,
          },
        },
      },
    });

    if (!existingAssignment) {
      return {
        success: false,
        error: true,
        message: "Assignment not found.",
      };
    }

    // =========================================================
    // 2. SECURITY CHECK
    // =========================================================

    if (existingAssignment.schoolId !== schoolId) {
      return {
        success: false,
        error: true,
        message: "Unauthorized.",
      };
    }

    // =========================================================
    // 3. GET THE LEVEL OF THE ASSIGNMENT
    //
    // Example:
    //
    // JSS 1A -> levelId 7
    // JSS 1B -> levelId 7
    // JSS 1C -> levelId 7
    //
    // Therefore updating any one of them updates the
    // assignment for the entire JSS 1 level.
    // =========================================================

    const levelId = existingAssignment.class.levelId;

    console.log("========== UPDATE ASSIGNMENT ==========");
    console.log("Assignment ID:", assignmentId);
    console.log("Class ID:", existingAssignment.classId);
    console.log("Level ID:", levelId);
    console.log("Subject ID:", existingAssignment.subjectId);
    console.log("School ID:", schoolId);

    // =========================================================
    // 4. FIND ALL ASSIGNMENTS BELONGING TO THIS LEVEL
    //
    // We also match:
    // - school
    // - subject
    // - teacher
    // - academic year
    // - term
    //
    // This prevents us from accidentally updating another
    // assignment belonging to the same level.
    // =========================================================

    const assignmentsToUpdate = await prisma.assignment.findMany({
      where: {
        schoolId,

        subjectId: existingAssignment.subjectId,

        teacherId: existingAssignment.teacherId,

        academicYearId: existingAssignment.academicYearId,

        term: existingAssignment.term,

        class: {
          levelId,
          schoolId,
        },
      },

      select: {
        id: true,
        classId: true,
      },
    });

    console.log("ASSIGNMENTS TO UPDATE:");
    console.table(assignmentsToUpdate);

    if (assignmentsToUpdate.length === 0) {
      return {
        success: false,
        error: true,
        message: "No related assignments found.",
      };
    }

    // =========================================================
    // 5. UPDATE ALL ASSIGNMENTS FOR THE LEVEL
    // =========================================================

    await prisma.assignment.updateMany({
      where: {
        id: {
          in: assignmentsToUpdate.map((assignment) => assignment.id),
        },
      },

      data: {
        title: validated.data.title,
        description: validated.data.description ?? null,
        instructions: validated.data.instructions ?? null,
        attachmentUrl: validated.data.attachmentUrl ?? null,

        totalMarks: validated.data.totalMarks,

        assignedDate:
          validated.data.assignedDate ?? new Date(),

        dueDate: validated.data.dueDate,

        status:
          validated.data.status ?? AssignmentStatus.PUBLISHED,

        subjectId: validated.data.subjectId,
        teacherId: validated.data.teacherId,
      },
    });

    console.log(
      `UPDATED ${assignmentsToUpdate.length} ASSIGNMENTS`
    );

    // =========================================================
    // 6. REFRESH ASSIGNMENT PAGES
    // =========================================================

    revalidatePath("/list/assignments");

    return {
      success: true,
      error: false,
      message: `Assignment updated successfully for all ${assignmentsToUpdate.length} class${assignmentsToUpdate.length === 1 ? "" : "es"}.`,
    };

  } catch (err: any) {
    console.error("================================");
    console.error("UPDATE ASSIGNMENT ERROR");
    console.error(err);
    console.error("================================");

    return {
      success: false,
      error: true,
      message:
        err.message || "Failed to update assignment.",
    };
  }
};


export const deleteAssignment = async (
  currentState: CurrentState,
  formData: FormData,
) => {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: true,
      message: "Unauthorized.",
    };
  }

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Assignment ID missing.",
    };
  }

  try {
    // =========================================================
    // 1. FIND THE ASSIGNMENT BEING DELETED
    // =========================================================

    const existingAssignment =
      await prisma.assignment.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          schoolId: true,
          classId: true,
          subjectId: true,
          teacherId: true,
          academicYearId: true,
          term: true,

          class: {
            select: {
              id: true,
              levelId: true,
              schoolId: true,
            },
          },
        },
      });

    if (!existingAssignment) {
      return {
        success: false,
        error: true,
        message: "Assignment not found.",
      };
    }

    // =========================================================
    // 2. SECURITY CHECK
    // =========================================================

    if (existingAssignment.schoolId !== schoolId) {
      return {
        success: false,
        error: true,
        message: "Unauthorized.",
      };
    }

    // =========================================================
    // 3. GET THE LEVEL
    // =========================================================

    const levelId = existingAssignment.class.levelId;

    console.log("========== DELETE ASSIGNMENT ==========");
    console.log("Assignment ID:", id);
    console.log("Class ID:", existingAssignment.classId);
    console.log("Level ID:", levelId);
    console.log("Subject ID:", existingAssignment.subjectId);
    console.log("School ID:", schoolId);

    // =========================================================
    // 4. FIND ALL RELATED ASSIGNMENTS
    // =========================================================

    const assignmentsToDelete =
      await prisma.assignment.findMany({
        where: {
          schoolId,

          subjectId: existingAssignment.subjectId,

          teacherId: existingAssignment.teacherId,

          academicYearId:
            existingAssignment.academicYearId,

          term: existingAssignment.term,

          class: {
            levelId,
            schoolId,
          },
        },

        select: {
          id: true,
          classId: true,
        },
      });

    console.log("ASSIGNMENTS TO DELETE:");
    console.table(assignmentsToDelete);

    if (assignmentsToDelete.length === 0) {
      return {
        success: false,
        error: true,
        message: "No related assignments found.",
      };
    }

    // =========================================================
    // 5. DELETE ALL ASSIGNMENTS FOR THE LEVEL
    // =========================================================

    await prisma.assignment.deleteMany({
      where: {
        id: {
          in: assignmentsToDelete.map(
            (assignment) => assignment.id
          ),
        },
      },
    });

    console.log(
      `DELETED ${assignmentsToDelete.length} ASSIGNMENTS`
    );

    // =========================================================
    // 6. REFRESH ASSIGNMENT PAGES
    // =========================================================

    revalidatePath("/list/assignments");

    return {
      success: true,
      error: false,
      message: `Assignment deleted successfully from all ${assignmentsToDelete.length} class${assignmentsToDelete.length === 1 ? "" : "es"}.`,
    };

  } catch (err: any) {
    console.error("================================");
    console.error("DELETE ASSIGNMENT ERROR");
    console.error(err);
    console.error("================================");

    return {
      success: false,
      error: true,
      message:
        err.message ||
        "Failed to delete assignment.",
    };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema,
) => {
  try {
    console.log("========== CREATE EXAM START ==========");
    console.log("Received data:", data);

    // --------------------------------------------------
    // 1. AUTHENTICATION
    // --------------------------------------------------
    const { userId } = await auth();

    console.log("Authenticated user:", userId);

    if (!userId) {
      return {
        success: false,
        error: true,
        message: "You are not authenticated. Please log in again.",
      };
    }

    // --------------------------------------------------
    // 2. FIND ADMIN
    // --------------------------------------------------
    const admin = await prisma.admin.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        schoolId: true,
      },
    });

    console.log("Admin:", admin);

    if (!admin) {
      return {
        success: false,
        error: true,
        message: "Admin account not found.",
      };
    }

    const schoolId = admin.schoolId;

    if (!schoolId) {
      return {
        success: false,
        error: true,
        message: "No school is associated with this admin account.",
      };
    }

    console.log("School ID:", schoolId);

    // --------------------------------------------------
    // 3. VALIDATE FORM DATA
    // --------------------------------------------------
    const validated = examSchema.safeParse(data);

    if (!validated.success) {
      console.error(
        "SERVER VALIDATION ERROR:",
        validated.error.flatten(),
      );

      return {
        success: false,
        error: true,
        message:
          validated.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ") || "Invalid exam data.",
      };
    }

    const {
      generalLevels = [],
      assignments = [],
      ...examFields
    } = validated.data;

    console.log("Validated exam fields:", examFields);
    console.log("General levels:", generalLevels);
    console.log("Assignments:", assignments);

    // --------------------------------------------------
    // 4. CHECK TARGETS
    // --------------------------------------------------
    if (generalLevels.length === 0 && assignments.length === 0) {
      return {
        success: false,
        error: true,
        message:
          "Please select at least one target class level or stream.",
      };
    }

    // --------------------------------------------------
    // 5. SCHOOL SETTINGS
    // --------------------------------------------------
    const settings = await prisma.schoolSettings.findFirst({
      where: {
        schoolId,
      },
      select: {
        currentAcademicYearId: true,
        currentTerm: true,
      },
    });

    console.log("School settings:", settings);

    if (!settings) {
      return {
        success: false,
        error: true,
        message:
          "School settings have not been configured for this school.",
      };
    }

    if (!settings.currentAcademicYearId) {
      return {
        success: false,
        error: true,
        message:
          "No current academic year has been configured.",
      };
    }

    if (!settings.currentTerm) {
      return {
        success: false,
        error: true,
        message:
          "No current academic term has been configured.",
      };
    }

    // --------------------------------------------------
    // 6. VERIFY TEACHER
    // --------------------------------------------------
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: examFields.teacherId,
        schoolId,
      },
      select: {
        id: true,
      },
    });

    console.log("Teacher:", teacher);

    if (!teacher) {
      return {
        success: false,
        error: true,
        message:
          "The selected teacher does not belong to this school.",
      };
    }

    // --------------------------------------------------
    // 7. BUILD CLASS CONDITIONS
    // --------------------------------------------------
    const classConditions: Array<Record<string, unknown>> = [];

    // General level selections
    if (generalLevels.length > 0) {
      const levelIds = generalLevels
        .map(Number)
        .filter((id) => !Number.isNaN(id));

      if (levelIds.length > 0) {
        classConditions.push({
          levelId: {
            in: levelIds,
          },
        });
      }
    }

    // Stream/class selections
    if (assignments.length > 0) {
      for (const assignment of assignments) {
        const [lvlId, strId] = assignment.split("-");

        const levelId = Number(lvlId);
        const streamId = Number(strId);

        console.log(
          `Processing assignment ${assignment}:`,
          {
            levelId,
            streamId,
          },
        );

        if (
          Number.isNaN(levelId) ||
          Number.isNaN(streamId)
        ) {
          console.warn(
            "Invalid assignment:",
            assignment,
          );
          continue;
        }

        const exactClass = await prisma.class.findFirst({
          where: {
            schoolId,
            isActive: true,
            levelId,
            streamId,
          },
          select: {
            id: true,
            levelId: true,
            streamId: true,
          },
        });

        console.log(
          `Class found for ${assignment}:`,
          exactClass,
        );

        if (exactClass) {
          classConditions.push({
            id: exactClass.id,
          });
        } else {
          console.warn(
            `No exact class found for ${assignment}. Falling back to level ${levelId}.`,
          );

          classConditions.push({
            levelId,
          });
        }
      }
    }

    // --------------------------------------------------
    // 8. MAKE SURE CONDITIONS EXIST
    // --------------------------------------------------
    if (classConditions.length === 0) {
      return {
        success: false,
        error: true,
        message:
          "No valid class or stream selections were provided.",
      };
    }

    console.log(
      "Final class conditions:",
      classConditions,
    );

    // --------------------------------------------------
    // 9. FIND MATCHING CLASSES
    // --------------------------------------------------
    const classes = await prisma.class.findMany({
      where: {
        schoolId,
        isActive: true,
        OR: classConditions,
      },
      select: {
        id: true,
      },
    });

    console.log(
      "Matching classes:",
      classes,
    );

    if (classes.length === 0) {
      return {
        success: false,
        error: true,
        message:
          "No matching classes found for the selected targets.",
      };
    }

    // --------------------------------------------------
    // 10. CREATE EXAMS
    // --------------------------------------------------
    const examGroupId = randomUUID();

    console.log(
      "Creating exams with group ID:",
      examGroupId,
    );

    await prisma.$transaction(
      classes.map((cls) =>
        prisma.exam.create({
          data: {
            examGroupId,

            title: examFields.title,
            description:
              examFields.description ?? null,

            examType: examFields.examType,

            totalMarks: examFields.totalMarks,
            passMark: examFields.passMark,

            examDate: examFields.examDate,
            startTime: examFields.startTime,
            endTime: examFields.endTime,

            venue: examFields.venue ?? null,

            classId: cls.id,
            subjectId: examFields.subjectId,
            teacherId: examFields.teacherId,

            schoolId,
            academicYearId:
              settings.currentAcademicYearId,
            term: settings.currentTerm,
          },
        }),
      ),
    );

    // --------------------------------------------------
    // 11. SUCCESS
    // --------------------------------------------------
    console.log(
      `Successfully created ${classes.length} exam(s).`,
    );

    revalidatePath("/list/exams");

    return {
      success: true,
      error: false,
      message: `Exam created successfully for ${classes.length} class(es).`,
    };
  } catch (error) {
    // --------------------------------------------------
    // 12. REAL ERROR
    // --------------------------------------------------
    console.error(
      "========== CREATE EXAM ERROR ==========",
    );

    console.error(error);

    let message = "Failed to create exam.";

    if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      error: true,
      message,
    };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema,
) => {
  const { sessionClaims } = await auth();
  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = examSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid exam data.",
    };
  }

  if (!validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Exam ID is missing.",
    };
  }

  try {
    // Find the selected exam first
    const exam = await prisma.exam.findUnique({
      where: {
        id: validated.data.id,
      },
      select: {
        examGroupId: true,
        schoolId: true,
      },
    });

    if (!exam || exam.schoolId !== schoolId) {
      return {
        success: false,
        error: true,
        message: "Exam not found.",
      };
    }

    // Note: If target classes change on update, a more robust implementation would 
    // delete old records in the examGroupId and recreate them. For standard field updates:
    await prisma.exam.updateMany({
      where: {
        examGroupId: exam.examGroupId,
      },
      data: {
        title: validated.data.title,
        description: validated.data.description ?? null,
        examType: validated.data.examType,
        totalMarks: validated.data.totalMarks,
        passMark: validated.data.passMark,
        examDate: validated.data.examDate,
        startTime: validated.data.startTime,
        endTime: validated.data.endTime,
        venue: validated.data.venue ?? null,
        subjectId: validated.data.subjectId,
        teacherId: validated.data.teacherId,
      },
    });

    revalidatePath("/list/exams");

    return {
      success: true,
      error: false,
      message: "Exam updated successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to update exam.",
    };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  formData: FormData,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Exam ID is missing.",
    };
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: {
        id,
      },
      select: {
        examGroupId: true,
        schoolId: true,
      },
    });

    if (!exam || exam.schoolId !== schoolId) {
      return {
        success: false,
        error: true,
        message: "Exam not found.",
      };
    }

    await prisma.exam.deleteMany({
      where: {
        examGroupId: exam.examGroupId,
      },
    });

    revalidatePath("/list/exams");

    return {
      success: true,
      error: false,
      message: "Exam deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to delete exam.",
    };
  }
};

const dayToDate: Record<Day, number> = {
  MONDAY: 4,
  TUESDAY: 5,
  WEDNESDAY: 6,
  THURSDAY: 7,
  FRIDAY: 8,
};


// --- CREATE LESSON ---

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

console.log("LESSON schoolId:", schoolId);

if (!schoolId) {
  return {
    success: false,
    error: true,
    message: "School not found.",
  };
}

const validated = lessonSchema.safeParse(data);

if (!validated.success) {
  return {
    success: false,
    error: true,
    message: "Invalid lesson data.",
  };
}

try {
  const settings = await prisma.schoolSettings.findFirst({
    where: {
      schoolId,
    },
    select: {
      currentAcademicYearId: true,
      currentTerm: true,
    },
  });

  console.log("LESSON school settings:", settings);

  if (!settings) {
    return {
      success: false,
      error: true,
      message: "School settings not configured.",
    };
  }

    const teacher = await prisma.teacher.findFirst({
      where: {
        id: validated.data.teacherId,
        schoolId,
      },
    });

    if (!teacher) {
      return {
        success: false,
        error: true,
        message: "Teacher not found.",
      };
    }

    await prisma.$transaction(
      validated.data.classes.map((classId) =>
        prisma.lesson.create({
          data: {
            title: validated.data.title,

            day: validated.data.day,

            startTime: new Date(
              2026,
              4,
              dayToDate[validated.data.day],
              Number(validated.data.startTime.split(":")[0]),
              Number(validated.data.startTime.split(":")[1]),
            ),

            endTime: new Date(
              2026,
              4,
              dayToDate[validated.data.day],
              Number(validated.data.endTime.split(":")[0]),
              Number(validated.data.endTime.split(":")[1]),
            ),

            schoolId,

            academicYearId: settings.currentAcademicYearId,

            term: settings.currentTerm,

            classId: Number(classId),

            subjectId: validated.data.subjectId,

            teacherId: validated.data.teacherId,
          },
        }),
      ),
    );

    revalidatePath("/list/lessons");

    return {
      success: true,
      error: false,
      message: "Lesson created successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to create lesson.",
    };
  }
};

// UPDATE ACTION
export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = lessonSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid lesson data.",
    };
  }

  if (!validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Lesson ID is required.",
    };
  }

  try {
    await prisma.lesson.update({
      where: {
        id: validated.data.id,
      },
      data: {
        title: validated.data.title,

        day: validated.data.day,

        startTime: new Date(
          2026,
          4,
          dayToDate[validated.data.day],
          Number(validated.data.startTime.split(":")[0]),
          Number(validated.data.startTime.split(":")[1]),
        ),

        endTime: new Date(
          2026,
          4,
          dayToDate[validated.data.day],
          Number(validated.data.endTime.split(":")[0]),
          Number(validated.data.endTime.split(":")[1]),
        ),

        subjectId: validated.data.subjectId,

        teacherId: validated.data.teacherId,

        classId: Number(validated.data.classes[0]),
      },
    });

    revalidatePath("/list/lessons");

    return {
      success: true,
      error: false,
      message: "Lesson updated successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to update lesson.",
    };
  }
};

// DELETE ACTION
export const deleteLesson = async (
  currentState: CurrentState,
  formData: FormData,
) => {
  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Lesson ID is required.",
    };
  }

  try {
    await prisma.lesson.delete({
      where: {
        id,
      },
    });

    revalidatePath("/list/lessons");

    return {
      success: true,
      error: false,
      message: "Lesson deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to delete lesson.",
    };
  }
};

// export const saveResult = async (
//   currentState: CurrentState,
//   data: ResultSchema,
// ): Promise<CurrentState> => {
//   const { sessionClaims } = await auth();

//   const schoolId = (sessionClaims?.metadata as any)?.schoolId;

//   if (!schoolId) {
//     return {
//       success: false,
//       error: true,
//       message: "School not found.",
//     };
//   }

//   const validated = resultSchema.safeParse(data);

// if (!validated.success) {
//   return {
//     success: false,
//     error: true,
//     message: "Invalid result data.",
//   };
// }

// const resultData = validated.data;

//   const getGrade = (score: number) => {
//   if (score >= 70) return { grade: "A", remark: "Excellent" };
//   if (score >= 60) return { grade: "B", remark: "Very Good" };
//   if (score >= 50) return { grade: "C", remark: "Good" };
//   if (score >= 45) return { grade: "D", remark: "Fair" };
//   if (score >= 40) return { grade: "E", remark: "Pass" };

//   return { grade: "F", remark: "Fail" };
// };

//   try {
//     const settings = await prisma.schoolSettings.findUnique({
//       where: {
//         schoolId,
//       },
//     });

//     if (!settings) {
//       return {
//         success: false,
//         error: true,
//         message: "School settings not configured.",
//       };
//     }

//     const teacher = await prisma.teacher.findUnique({
//       where: {
//         id: resultData.teacherId,
//         schoolId,
//       },
//     });

//    if (!teacher || teacher.schoolId !== schoolId) {
//     return {
//         success:false,
//         error:true,
//         message:"Teacher not found.",
//     };
// }

//     const student = await prisma.student.findUnique({
//       where: {
//         id: resultData.studentId,
//       },
//       select: {
//         id: true,
//         name: true,
//         classId: true,
//         schoolId: true,
//         parent: true,
//       },
//     });

//     if (!student) {
//       return {
//         success: false,
//         error: true,
//         message: "Student not found.",
//       };
//     }

//     if (student.classId == null) {
//   return {
//     success: false,
//     error: true,
//     message: "Student is not assigned to a class.",
//   };
// }

//     if (student.schoolId !== schoolId) {
//       return {
//         success: false,
//         error: true,
//         message: "Student does not belong to this school.",
//       };
//     }

//     const assignmentScore =
//       Number(validated.data.assignmentScore) || 0;

//     const testScore =
//       Number(validated.data.testScore) || 0;

//     const examScore =
//       Number(validated.data.examScore) || 0;

//     const total =
//       assignmentScore +
//       testScore +
//       examScore;

//     const { grade, remark } = getGrade(total);

//     const result = await prisma.result.upsert({
//       where: {
//         studentId_subjectId_academicYearId_term: {
//     studentId: resultData.studentId,
//     subjectId: resultData.subjectId,
//     academicYearId: settings.currentAcademicYearId,
//     term: settings.currentTerm,

//         },
//       },

//       update: {
//   assignmentScore: new Prisma.Decimal(assignmentScore),
//   testScore: new Prisma.Decimal(testScore),
//   examScore: new Prisma.Decimal(examScore),
//   totalScore: new Prisma.Decimal(total),

//   grade,
//   remark,

//   teacherRemark: resultData.teacherRemark ?? null,
//   principalRemark: resultData.principalRemark ?? null,

//   examId: resultData.examId ?? null,
//   assignmentId: resultData.assignmentId ?? null,

// },

//       create: {
//         studentId: student.id,

//         classId: student.classId,

//         schoolId,

//         subjectId: validated.data.subjectId,

//         academicYearId:
//           settings.currentAcademicYearId,

//         term: settings.currentTerm,

//         assignmentScore: new Prisma.Decimal(
//           assignmentScore,
//         ),

//         testScore: new Prisma.Decimal(testScore),

//         examScore: new Prisma.Decimal(examScore),

//         totalScore: new Prisma.Decimal(total),

//         grade,

//         remark,

//         teacherRemark:
//           validated.data.teacherRemark ?? null,

//         principalRemark:
//           validated.data.principalRemark ?? null,

//         examId:
//           validated.data.examId ?? null,

//         assignmentId:
//           validated.data.assignmentId ?? null,
//       },

//       include: {
//         student: {
//           include: {
//             parent: true,
//           },
//         },
//         subject: true,
//       },
//     });

//     if (result.student.parent?.phone) {
//       await sendResultNotification(
//         formatPhoneNumber(result.student.parent.phone),
//         result.student.name,
//         result.subject.name,
//         total,
//         result.studentId,
//       );
//     }

//     revalidatePath("/list/results");
//     revalidateTag("dashboard-stats", "max");

//     return {
//       success: true,
//       error: false,
//       message: "Result saved successfully.",
//     };
//   } catch (err: any) {
//     console.error(err);

//     return {
//       success: false,
//       error: true,
//       message:
//         err.message || "Failed to save result.",
//     };
//   }

// };

export const deleteResult = async (
  currentState: CurrentState,
  formData: FormData,
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Result ID is required.",
    };
  }

  try {
    await prisma.result.delete({
      where: {
        id,
      },
    });

    revalidatePath("/list/results");
    revalidateTag("dashboard-stats", "max");

    return {
      success: true,
      error: false,
      message: "Result deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message || "Failed to delete result.",
    };
  }
};

// ---------------- FEE CATEGORY ----------------

export const createFeeCategory = async (
  currentState: CurrentState,
  data: FeeCategorySchema,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = feeCategorySchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid fee category.",
    };
  }

  try {
    const exists = await prisma.feeCategory.findFirst({
      where: {
        schoolId,
        name: validated.data.name,
      },
    });

    if (exists) {
      return {
        success: false,
        error: true,
        message: "Fee category already exists.",
      };
    }

    await prisma.feeCategory.create({
      data: {
        schoolId,
        name: validated.data.name,
        description: validated.data.description ?? null,
        isActive: validated.data.isActive,
      },
    });

    revalidatePath("/list/finance/fee-categories");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Fee category created successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to create fee category.",
    };
  }
};

export const updateFeeCategory = async (
  currentState: CurrentState,
  data: FeeCategorySchema,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = feeCategorySchema.safeParse(data);

  if (!validated.success || !validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Invalid fee category.",
    };
  }

  try {
    await prisma.feeCategory.update({
      where: {
        id: validated.data.id,
      },
      data: {
        name: validated.data.name,
        description: validated.data.description ?? null,
        isActive: validated.data.isActive,
      },
    });

    revalidatePath("/list/finance/fee-categories");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Fee category updated successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to update fee category.",
    };
  }
};

export const deleteFeeCategory = async (
  currentState: CurrentState,
  formData: FormData,
): Promise<CurrentState> => {
  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Fee category not found.",
    };
  }

  try {
    const allocation = await prisma.feeAllocation.findFirst({
      where: {
        feeCategoryId: id,
      },
    });

    if (allocation) {
      return {
        success: false,
        error: true,
        message:
          "Cannot delete this fee category because it has fee allocations.",
      };
    }

    await prisma.feeCategory.delete({
      where: {
        id,
      },
    });

    revalidatePath("/list/finance/fee-categories");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Fee category deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to delete fee category.",
    };
  }
};

// ---------------- FEE ALLOCATION ----------------

export const createFeeAllocation = async (
  currentState: CurrentState,
  data: FeeAllocationSchema,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = feeAllocationSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid fee allocation data.",
    };
  }

  try {
    // Check duplicate allocation

    const existing = await prisma.feeAllocation.findFirst({
      where: {
        feeCategoryId: validated.data.feeCategoryId,
        levelId: validated.data.levelId,
        academicYearId: validated.data.academicYearId,
        term: validated.data.term,
      },
    });

    if (existing) {
      return {
        success: false,
        error: true,
        message: "This fee has already been allocated for this level and term.",
      };
    }

    // Find classes under level

    const classes = await prisma.class.findMany({
      where: {
        schoolId,
        levelId: validated.data.levelId,
        isActive: true,
      },

      select: {
        id: true,
      },
    });

    if (classes.length === 0) {
      return {
        success: false,
        error: true,
        message: "No classes found for this level.",
      };
    }

    // Find students in those classes

    const students = await prisma.student.findMany({
      where: {
        schoolId,

        classId: {
          in: classes.map((item) => item.id),
        },
      },

      select: {
        id: true,
      },
    });

    if (students.length === 0) {
      return {
        success: false,
        error: true,
        message: "No students found in this level.",
      };
    }

    // Transaction

    await prisma.$transaction(async (tx) => {
      const allocation = await tx.feeAllocation.create({
        data: {
          schoolId,

          feeCategoryId: validated.data.feeCategoryId,

          levelId: validated.data.levelId,

          academicYearId: validated.data.academicYearId,

          term: validated.data.term,

          amount: new Prisma.Decimal(validated.data.amount),

          isCompulsory: validated.data.isCompulsory,

          isActive: validated.data.isActive,

          dueDate: validated.data.dueDate ?? null,
        },
      });

      // Create balances

      await tx.studentBalance.createMany({
        data: students.map((student) => ({
          studentId: student.id,

          schoolId,

          feeAllocationId: allocation.id,

          totalAssigned: new Prisma.Decimal(validated.data.amount),

          discount: new Prisma.Decimal(0),

          paidAmount: new Prisma.Decimal(0),

          outstanding: new Prisma.Decimal(validated.data.amount),

          status: PaymentStatus.UNPAID,
        })),
      });
    });

    revalidatePath("/list/finance/fee-allocation");

    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: `Fee allocated successfully to ${students.length} students.`,
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to create fee allocation.",
    };
  }
};

export const updateFeeAllocation = async (
  currentState: CurrentState,
  data: FeeAllocationSchema,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = feeAllocationSchema.safeParse(data);

  if (!validated.success || !validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Invalid fee allocation.",
    };
  }

  try {
    const allocation = await prisma.feeAllocation.findFirst({
      where: {
        id: validated.data.id,
        schoolId,
      },
      include: {
        studentBalances: true,
      },
    });

    if (!allocation) {
      return {
        success: false,
        error: true,
        message: "Fee allocation not found.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.feeAllocation.update({
        where: {
          id: allocation.id,
        },
        data: {
          feeCategoryId: validated.data.feeCategoryId,
          levelId: validated.data.levelId,
          academicYearId: validated.data.academicYearId,
          term: validated.data.term,

          amount: new Prisma.Decimal(validated.data.amount),

          isCompulsory: validated.data.isCompulsory,

          isActive: validated.data.isActive,

          dueDate: validated.data.dueDate ?? null,
        },
      });

      // Update balances only if nobody has paid yet
      for (const balance of allocation.studentBalances) {
        const paid = Number(balance.paidAmount);

        if (paid === 0) {
          await tx.studentBalance.update({
            where: {
              id: balance.id,
            },
            data: {
              totalAssigned: new Prisma.Decimal(validated.data.amount),

              outstanding: new Prisma.Decimal(validated.data.amount),
            },
          });
        }
      }
    });

    revalidatePath("/list/finance/fee-allocation");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Fee allocation updated successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to update fee allocation.",
    };
  }
};

export const deleteFeeAllocation = async (
  currentState: CurrentState,
  formData: FormData,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  const id = Number(formData.get("id"));

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Allocation not found.",
    };
  }

  try {
    const allocation = await prisma.feeAllocation.findFirst({
      where: {
        id,
        schoolId,
      },
      include: {
        studentBalances: {
          include: {
            paymentRecords: true,
          },
        },
      },
    });

    if (!allocation) {
      return {
        success: false,
        error: true,
        message: "Fee allocation not found.",
      };
    }

    const hasPayments = allocation.studentBalances.some(
      (balance) => balance.paymentRecords.length > 0,
    );

    if (hasPayments) {
      return {
        success: false,
        error: true,
        message:
          "Cannot delete this allocation because payments already exist.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.studentBalance.deleteMany({
        where: {
          feeAllocationId: allocation.id,
        },
      });

      await tx.feeAllocation.delete({
        where: {
          id: allocation.id,
        },
      });
    });

    revalidatePath("/list/finance/fee-allocation");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Fee allocation deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to delete fee allocation.",
    };
  }
};
// ---------------- PAYMENT RECORD ----------------

export const createPaymentRecord = async (
  currentState: CurrentState,
  data: PaymentRecordSchema,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = paymentRecordSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid payment.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const balance = await tx.studentBalance.findUnique({
        where: {
          id: validated.data.studentBalanceId,
        },
      });

      if (!balance) {
        throw new Error("Student balance not found.");
      }

      const payment = Number(validated.data.amountPaid);

      const outstanding = Number(balance.outstanding);

      if (payment > outstanding) {
        throw new Error("Payment exceeds outstanding balance.");
      }

      const newPaid = Number(balance.paidAmount) + payment;

      const newOutstanding =
        Number(balance.totalAssigned) - Number(balance.discount) - newPaid;

      let status: PaymentStatus = PaymentStatus.UNPAID;

      if (newOutstanding <= 0) {
        status = PaymentStatus.FULLY_PAID;
      } else if (newPaid > 0) {
        status = PaymentStatus.PARTIAL;
      } else {
        status = PaymentStatus.UNPAID;
      }

      const reference = `PAY-${randomUUID()}`;

      const receiptNumber = generateReceiptNumber();

      // const reference =
      //   "PAY-" +
      //   Date.now() +
      //   "-" +
      //   Math.floor(Math.random() * 10000);

      await tx.paymentRecord.create({
        data: {
          studentBalanceId: validated.data.studentBalanceId,

          schoolId,

          feeAllocationId: validated.data.feeAllocationId,

          amountPaid: new Prisma.Decimal(payment),

          paymentMethod: validated.data.paymentMethod,

          reference,

          receiptNumber,

          transactionId: validated.data.transactionId ?? null,

          status,

          channel: validated.data.channel ?? null,

          receivedBy: validated.data.receivedBy ?? null,

          paymentDate: validated.data.paymentDate ?? new Date(),
        },
      });

      await tx.studentBalance.update({
        where: {
          id: balance.id,
        },
        data: {
          paidAmount: new Prisma.Decimal(newPaid),

          outstanding: new Prisma.Decimal(newOutstanding),

          status,
        },
      });
    });

    revalidatePath("/list/finance/payments");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Payment recorded successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to record payment.",
    };
  }
};

export const updatePaymentRecord = async (
  currentState: CurrentState,
  data: PaymentRecordSchema,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = paymentRecordSchema.safeParse(data);

  if (!validated.success || !validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Invalid payment data.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.paymentRecord.findUnique({
        where: {
          id: validated.data.id,
        },
      });

      if (!payment) {
        throw new Error("Payment not found.");
      }

      const balance = await tx.studentBalance.findUnique({
        where: {
          id: payment.studentBalanceId,
        },
      });

      if (!balance) {
        throw new Error("Student balance not found.");
      }

      const oldAmount = Number(payment.amountPaid);

      const currentPaid = Number(balance.paidAmount);

      const totalAssigned =
        Number(balance.totalAssigned) - Number(balance.discount);

      // Reverse old payment
      const reversedPaid = currentPaid - oldAmount;

      // Apply new payment
      const newPayment = Number(validated.data.amountPaid);

      if (newPayment > totalAssigned - reversedPaid) {
        throw new Error("Payment exceeds outstanding balance.");
      }

      const finalPaid = reversedPaid + newPayment;

      const outstanding = totalAssigned - finalPaid;

      let status: PaymentStatus;

      if (outstanding <= 0) {
        status = PaymentStatus.FULLY_PAID;
      } else if (finalPaid > 0) {
        status = PaymentStatus.PARTIAL;
      } else {
        status = PaymentStatus.UNPAID;
      }

      await tx.paymentRecord.update({
        where: {
          id: payment.id,
        },
        data: {
          amountPaid: new Prisma.Decimal(newPayment),
          paymentMethod: validated.data.paymentMethod,
          transactionId: validated.data.transactionId ?? null,
          channel: validated.data.channel ?? null,
          receivedBy: validated.data.receivedBy ?? null,
          paymentDate: validated.data.paymentDate,
          status,
        },
      });

      await tx.studentBalance.update({
        where: {
          id: balance.id,
        },
        data: {
          paidAmount: new Prisma.Decimal(finalPaid),
          outstanding: new Prisma.Decimal(outstanding),
          status,
        },
      });
    });

    revalidatePath("/list/finance/payments");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Payment updated successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to update payment.",
    };
  }
};

export const deletePaymentRecord = async (
  currentState: CurrentState,
  formData: FormData,
): Promise<CurrentState> => {
  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Payment ID is required.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.paymentRecord.findUnique({
        where: {
          id,
        },
      });

      if (!payment) {
        throw new Error("Payment not found.");
      }

      const balance = await tx.studentBalance.findUnique({
        where: {
          id: payment.studentBalanceId,
        },
      });

      if (!balance) {
        throw new Error("Student balance not found.");
      }

      const paid = Number(balance.paidAmount) - Number(payment.amountPaid);

      const outstanding =
        Number(balance.totalAssigned) - Number(balance.discount) - paid;

      let status: PaymentStatus;

      if (paid <= 0) {
        status = PaymentStatus.UNPAID;
      } else if (outstanding <= 0) {
        status = PaymentStatus.FULLY_PAID;
      } else {
        status = PaymentStatus.PARTIAL;
      }

      await tx.studentBalance.update({
        where: {
          id: balance.id,
        },
        data: {
          paidAmount: new Prisma.Decimal(paid),
          outstanding: new Prisma.Decimal(outstanding),
          status,
        },
      });

      await tx.paymentRecord.delete({
        where: {
          id,
        },
      });
    });

    revalidatePath("/list/finance/payments");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Payment deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to delete payment.",
    };
  }
};
/* ===========================================================
   INCOME
=========================================================== */

export const createIncome = async (
  currentState: CurrentState,
  data: IncomeSchema,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = incomeSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid income data.",
    };
  }

  try {
    await prisma.income.create({
      data: {
        title: validated.data.title,
        description: validated.data.description,
        amount: new Prisma.Decimal(validated.data.amount),
        category: validated.data.category,
        paymentMethod: validated.data.paymentMethod ?? null,
        receivedAt: validated.data.receivedAt ?? new Date(),
        schoolId,
      },
    });

    revalidatePath("/admin/finance");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Income created successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to create income.",
    };
  }
};

export const updateIncome = async (
  currentState: CurrentState,
  data: IncomeSchema,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = incomeSchema.safeParse(data);

  if (!validated.success || !validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Invalid income.",
    };
  }

  try {
    await prisma.income.update({
      where: {
        id: validated.data.id,
        schoolId,
      },

      data: {
        title: validated.data.title,
        description: validated.data.description,
        amount: new Prisma.Decimal(validated.data.amount),
        category: validated.data.category,
        paymentMethod: validated.data.paymentMethod ?? null,
        receivedAt: validated.data.receivedAt ?? new Date(),
      },
    });

    revalidatePath("/admin/finance");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Income updated successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to update income.",
    };
  }
};

export const deleteIncome = async (
  currentState: CurrentState,
  formData: FormData,
): Promise<CurrentState> => {
  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Income ID is required.",
    };
  }

  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  try {
    const income = await prisma.income.findFirst({
      where: {
        id,
        schoolId,
      },
    });

    if (!income) {
      throw new Error("Income not found.");
    }

    await prisma.income.delete({
      where: {
        id: income.id,
      },
    });

    revalidatePath("/admin/finance");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Income deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to delete income.",
    };
  }
};

/* ===========================================================
   EXPENSE
=========================================================== */

export const createExpense = async (
  currentState: CurrentState,
  data: ExpenseSchema,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = expenseSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: true,
      message: "Invalid expense data.",
    };
  }

  try {
    await prisma.expense.create({
      data: {
        title: validated.data.title,
        description: validated.data.description,
        amount: new Prisma.Decimal(validated.data.amount),
        category: validated.data.category,
        paymentMethod: validated.data.paymentMethod ?? null,
        spentAt: validated.data.spentAt,
        schoolId,
      },
    });

    revalidatePath("/admin/finance");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Expense created successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to create expense.",
    };
  }
};

export const updateExpense = async (
  currentState: CurrentState,
  data: ExpenseSchema,
): Promise<CurrentState> => {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  const validated = expenseSchema.safeParse(data);

  if (!validated.success || !validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Invalid expense.",
    };
  }

  try {
    await prisma.expense.update({
      where: {
        id: validated.data.id,
      },

      data: {
        title: validated.data.title,
        description: validated.data.description,
        amount: new Prisma.Decimal(validated.data.amount),
        category: validated.data.category,
        paymentMethod: validated.data.paymentMethod ?? null,
        spentAt: validated.data.spentAt,
      },
    });

    revalidatePath("/admin/finance");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Expense updated successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to update expense.",
    };
  }
};

export const deleteExpense = async (
  currentState: CurrentState,
  formData: FormData,
): Promise<CurrentState> => {
  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: true,
      message: "Expense ID is required.",
    };
  }

  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }

  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        schoolId,
      },
    });

    if (!expense) {
      throw new Error("Expense not found.");
    }

    await prisma.expense.delete({
      where: {
        id: expense.id,
      },
    });

    revalidatePath("/admin/finance");
    revalidateTag("finance", "max");

    return {
      success: true,
      error: false,
      message: "Expense deleted successfully.",
    };
  } catch (err: any) {
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to delete expense.",
    };
  }
};


/* ===========================================================
   STREAM
=========================================================== */
export const createStream = async (
  currentState: CurrentState,
  data: StreamSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  const validated = streamSchema.safeParse(data);

  if (!validated.success) {
  console.log(validated.error.flatten());

  return {
    success: false,
    error: true,
    message: JSON.stringify(validated.error.flatten()),
  };
}
  try {
    const existing = await prisma.stream.findFirst({
      where: {
        schoolId,
        name: validated.data.name,
      },
    });

    if (existing) {
      return {
        success: false,
        error: true,
        message: "Stream already exists.",
      };
    }

    await prisma.stream.create({
      data: {
        name: validated.data.name,
        code: validated.data.code,
        schoolId,
      },
    });

    revalidatePath("/list/streams");

    return {
      success: true,
      error: false,
      message: "Stream created successfully.",
    };
  } catch (err: any) {
    console.error("CREATE STREAM ERROR");
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to create stream.",
    };
  }
};


export const updateStream = async (
  currentState: CurrentState,
  data: StreamSchema,
) => {
  const { userId } = await auth();

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      error: true,
      message: "Admin not found.",
    };
  }

  const schoolId = admin.schoolId;

  const validated = streamSchema.safeParse(data);

 if (!validated.success) {
  console.log(validated.error.flatten());

  return {
    success: false,
    error: true,
    message: JSON.stringify(validated.error.flatten()),
  };
}

  if (!validated.data.id) {
    return {
      success: false,
      error: true,
      message: "Stream ID is required.",
    };
  }

  try {
    const existing = await prisma.stream.findFirst({
      where: {
        schoolId,
        name: validated.data.name,
        NOT: {
          id: validated.data.id,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: true,
        message: "Another stream with this name already exists.",
      };
    }

    await prisma.stream.update({
      where: {
        id: validated.data.id,
      },
      data: {
        name: validated.data.name,
         code: validated.data.code,
      },
    });

    revalidatePath("/list/streams");

    return {
      success: true,
      error: false,
      message: "Stream updated successfully.",
    };
  } catch (err: any) {
    console.error("UPDATE STREAM ERROR");
    console.error(err);

    return {
      success: false,
      error: true,
      message: err.message ?? "Failed to update stream.",
    };
  }
};


export const deleteStream = async (
  currentState: CurrentState,
  formData: FormData
) => {
  const id = Number(formData.get("id"));

  try {
    await prisma.stream.delete({
      where: {
        id,
      },
    });

    revalidatePath("/list/streams");

    return {
      success: true,
      error: false,
      message: "Stream deleted successfully.",
    };
  } catch (err) {
    console.error("DELETE_STREAM_ERROR:", err);

    return {
      success: false,
      error: true,
      message: "Failed to delete stream.",
    };
  }
};