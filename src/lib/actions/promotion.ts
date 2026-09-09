"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveConfig } from "@/lib/settings";

export async function getEligibleStudents() {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    throw new Error("School not found.");
  }

  const students = await prisma.student.findMany({
    where: {
      schoolId,
    },

    include: {
      class: true,
      level: true,

      results: {
        include: {
          exam: true,
        },
      },
    },

    orderBy: {
      surname: "asc",
    },
  });

  return students;
}

export async function getPromotionStats() {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    throw new Error("School not found.");
  }

  const [
    totalStudents,
    promoted,
    pending,
    retained,
  ] = await Promise.all([
    prisma.student.count({
      where: {
        schoolId,
      },
    }),

    prisma.promotion.count({
      where: {
  academicYear: {
    schoolId,
  },
  status: "PROMOTED",
}
    }),

    prisma.promotion.count({
      where: {
         academicYear: {
    schoolId,
  },
        status: "PENDING",
      },
    }),

    prisma.promotion.count({
      where: {
         academicYear: {
    schoolId,
  },
        status: "REPEATED",
      },
    }),
  ]);

  return {
    totalStudents,
    promoted,
    pending,
    retained,
  };
}

async function findNextClass(
  currentClassId: number
) {
  const currentClass = await prisma.class.findUnique({
    where: {
      id: currentClassId,
    },

    include: {
      level: true,
    },
  });

  if (!currentClass) return null;

  const nextLevel = await prisma.level.findFirst({
    where: {
      schoolId: currentClass.schoolId,
      level: currentClass.level.level + 1,
    },
  });

  if (!nextLevel) {
    return null;
  }

  const nextClass = await prisma.class.findFirst({
    where: {
      schoolId: currentClass.schoolId,
      levelId: nextLevel.id,
      streamId: currentClass.streamId,
    },
  });

  return nextClass;
}

export async function getPromotionPreview() {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    throw new Error("School not found.");
  }

  const students = await prisma.student.findMany({
    where: {
      schoolId,
      classId: {
        not: null,
      },
    },

    include: {
      class: true,
      level: true,

      results: true,
    },

    orderBy: [
      {
        level: {
          level: "asc",
        },
      },
      {
        surname: "asc",
      },
    ],
  });

  const preview = await Promise.all(
  students.map(async (student) => {

    

    const total =
      student.results.reduce(
        (sum, result) => sum + Number(result.totalScore),
        0
      );

    const average =
      student.results.length > 0
        ? total / student.results.length
        : 0;

        const nextClass =
  student.classId && student.levelId
    ? await findNextClass(student.classId)
    : null;
    

    return {
      id: student.id,
      name: student.name,
      surname: student.surname,
      admissionNumber: student.admissionNumber,

      class: student.class,
      level: student.level,

      average,
      nextClass,

      decision:
      average >= 50
       ? "PROMOTE"
       : "REPEATED"
       
    };
    
  })
)
return preview;
}

export async function promoteStudent(studentId: string) {
  const { sessionClaims } = await auth();

  const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  if (!schoolId) {
    throw new Error("School not found.");
  }

  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },

    include: {
      class: {
        include: {
          level: true,
        },
      },

      level: true,

      results: true,
    },
  });

  if (!student || !student.class) {
    throw new Error("Student not found.");
  }
const currentYear = await getActiveConfig(schoolId);

if (!currentYear) {
  throw new Error("No active academic year.");
}


    const total = student.results.reduce(
    (sum, result) => sum + Number(result.totalScore),
    0
  );

  const average =
    student.results.length > 0
      ? total / student.results.length
      : 0;
        if (average < 50) {
    await prisma.promotion.create({
      data: {
        studentId: student.id,

        academicYearId: currentYear.id,

        fromLevelId: student.levelId,

        toLevelId: student.levelId,

        fromClassId: student.classId!,

        toClassId: student.classId!,

        status: "REPEATED",
      },
    });

    return;
  }
const nextClass = await findNextClass(
  student.classId!
);

if (!nextClass) {
  await prisma.promotion.create({
    data: {
      studentId: student.id,
      academicYearId: currentYear.id,
      fromLevelId: student.levelId,
      toLevelId: student.levelId,
      fromClassId: student.classId!,
      toClassId: student.classId!,
      status: "GRADUATED",
    },
  });

  return;
}

await prisma.$transaction(async (tx) => {
  await tx.student.update({
    where: {
      id: student.id,
    },

    data: {
      classId: nextClass.id,
      levelId: nextClass.levelId,
    },
  });

  await tx.promotion.create({
    data: {
      studentId: student.id,

      academicYearId: currentYear.id,

      fromLevelId: student.levelId,
      toLevelId: nextClass.levelId,

      fromClassId: student.classId!,
      toClassId: nextClass.id,

      status: "PROMOTED",
    },
  });
});
}

export async function promoteAllEligibleStudents() {
    const { sessionClaims } = await auth();

const schoolId = (sessionClaims?.metadata as any)?.schoolId;

if (!schoolId) {
  throw new Error("School not found.");
}

const currentYear = await getActiveConfig(schoolId);

if (!currentYear) {
  throw new Error("No active academic year.");
}

const students = await prisma.student.findMany({
  where: {
    schoolId,
    classId: {
      not: null,
    },
  },

  include: {
    class: {
      include: {
        level: true,
      },
    },

    level: true,

    results: true,
  },
});


let promoted = 0;

let repeated = 0;

let graduated = 0;


for (const student of students) {
const total = student.results.reduce(
  (sum, result) => sum + Number(result.totalScore),
  0
);

const average =
  student.results.length > 0
    ? total / student.results.length
    : 0;

if (average < 50) {
  await prisma.promotion.create({
    data: {
      studentId: student.id,

      academicYearId: currentYear.id,

      fromLevelId: student.levelId,
      toLevelId: student.levelId,

      fromClassId: student.classId!,
      toClassId: student.classId!,

      status: "REPEATED",
    },
  });

  repeated++;

  continue;
}

const nextClass = await findNextClass(student.classId!);

if (!nextClass) {
  await prisma.promotion.create({
    data: {
      studentId: student.id,

      academicYearId: currentYear.id,

      fromLevelId: student.levelId,
      toLevelId: student.levelId,

      fromClassId: student.classId!,
      toClassId: student.classId!,

      status: "GRADUATED",
    },
  });

  graduated++;

  continue;
}

await prisma.$transaction(async (tx) => {
  await tx.student.update({
    where: {
      id: student.id,
    },

    data: {
      classId: nextClass.id,
      levelId: nextClass.levelId,
    },
  });

  await tx.promotion.create({
    data: {
      studentId: student.id,

      academicYearId: currentYear.id,

      fromLevelId: student.levelId,
      toLevelId: nextClass.levelId,

      fromClassId: student.classId!,
      toClassId: nextClass.id,

      status: "PROMOTED",
    },
  });
});

promoted++;
}
return {
  promoted,
  repeated,
  graduated,
};

}

