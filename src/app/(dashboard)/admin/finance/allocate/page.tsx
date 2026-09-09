
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";


export default async function FeeAllocationPage() {
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
  throw new Error("Admin not found.");
}
      
        const schoolId = admin.schoolId;
      
       if (!schoolId) {
  throw new Error("School not found.");
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
  throw new Error("School not found.");
}

  const categories = await prisma.feeCategory.findMany({
    where: {
      schoolId,
    }
  });

  console.log("Categories:", categories);


  const levels = await prisma.level.findMany({
    where: {
      schoolId,
    },
    orderBy: {
      level: "asc",
    },
  });

  console.log("Levels:", levels);

  async function handleAllocate(formData: FormData) {
    "use server";
    const levelId = Number(formData.get("levelId"));
    const categoryId = Number(formData.get("categoryId"));
    const amount = Number(formData.get("amount"));

    if (!levelId || !categoryId || amount <= 0) {
      throw new Error("Please complete all required fields.");
    }

    const term = formData.get("term") as "FIRST" | "SECOND" | "THIRD";

    const academicYear = await prisma.academicYear.findFirst({
      where: {
        isCurrent: true,
        schoolId,
      },
    });

    if (!academicYear) {
      throw new Error("No active academic year found.");
    }


    await prisma.$transaction(async (tx) => {
      // Prevent duplicate allocations
      let allocation = await tx.feeAllocation.findUnique({
        where: {
          feeCategoryId_levelId_academicYearId_term: {
            feeCategoryId: categoryId,
            levelId,
            academicYearId: academicYear.id,
            term,
          },
        },
      });

      if (!allocation) {
        allocation = await tx.feeAllocation.create({
          data: {
            feeCategoryId: categoryId,
            levelId,
            academicYearId: academicYear.id,
            amount,
            term,
            schoolId,
          },
        });
      }

      const classes = await tx.class.findMany({
        where: {
          levelId,
          schoolId,
        },
        include: {
          students: {
            where: {
              schoolId,
            },
          },
        },
      });

      if (classes.length === 0) {
        throw new Error("no classes found for the selected level.")
      }

      for (const cls of classes) {
        for (const student of cls.students) {
          await tx.studentBalance.upsert({
            where: {
              studentId_feeAllocationId: {
                studentId: student.id,
                feeAllocationId: allocation.id,
              },
            },
            update: {
              totalAssigned: amount,
              outstanding: amount - Number(
                (
                  await tx.studentBalance.findUnique({
                    where: {
                      studentId_feeAllocationId: {
                        studentId: student.id,
                        feeAllocationId: allocation.id,
                      },
                    },
                    select: {
                      paidAmount: true,
                    },
                  })
                )?.paidAmount ?? 0
              ),
            },
            create: {
              studentId: student.id,
              feeAllocationId: allocation.id,
              totalAssigned: amount,
              outstanding: amount,
              paidAmount: 0,
              status: "UNPAID",
              schoolId,
            },
          });
        }
      }
    });


    revalidatePath("/admin/finance/allocate");
    revalidatePath("/admin/finance/balances");
  }


  const allocations = await prisma.feeAllocation.findMany({
    where: {
      schoolId,
    },
    include: {
      category: true,
      level: true,
      academicYear: true,
      _count: {
        select: {
          studentBalances: true,
        },
      },
    },
    orderBy: [
      {
        academicYear: {
          isCurrent: "desc",
        },
      },
      {
        level: {
          level: "asc",
        },
      },
    ]
  });


  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          Fee Allocation
        </h1>
        <p className="text-slate-500 mt-2">
          Create and manage fee structures for every academic level,
          session and term.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-widest opacity-80">
            Fee Categories
          </p>

          <h2 className="text-4xl font-black mt-3">
            {categories.length}
          </h2>
        </div>

        <div className="rounded-3xl bg-white border p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Levels
          </p>

          <h2 className="text-4xl font-black text-slate-800 mt-3">
            {levels.length}
          </h2>
        </div>

        <div className="rounded-3xl bg-white border p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Allocations
          </p>

          <h2 className="text-4xl font-black text-slate-800 mt-3">
            {allocations.length}
          </h2>
        </div>

        <div className="rounded-3xl bg-white border p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Students Covered
          </p>

          <h2 className="text-4xl font-black text-slate-800 mt-3">
            {allocations.reduce(
              (sum, a) => sum + a._count.studentBalances,
              0
            )}
          </h2>
        </div>

      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8">

        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900">
            Create Fee Allocation
          </h2>

          <p className="text-slate-500 mt-1">
            Assign a fee category to every student in a selected level.
          </p>
        </div>

        <form
          action={handleAllocate}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Academic Term
            </label>

            <select
              name="term"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FIRST">First Term</option>
              <option value="SECOND">Second Term</option>
              <option value="THIRD">Third Term</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Academic Level
            </label>

            <select
              name="levelId"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select Level
              </option>

              {levels.map(level => (
                <option
                  key={level.id}
                  value={level.id}
                >
                  {level.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Fee Category
            </label>

            <select
              name="categoryId"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select Fee Category
              </option>

              {categories.map(category => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Amount (₦)
            </label>

            <input
              name="amount"
              type="number"
              required
              placeholder="45000"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2 flex justify-end pt-4">
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
            >
              Allocate Fee to Entire Level
            </button>
          </div>
        </form>
      </div>


      <div className="flex items-center justify-between mt-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Existing Fee Allocations
          </h2>

          <p className="text-sm text-slate-500">
            Review all fee structures created for every academic year, term and level.
          </p>
        </div>

        <div className="text-sm text-slate-500">
          Total Allocations:
          <span className="ml-2 rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-700">
            {allocations.length}
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wider text-slate-500">

                <th className="px-6 py-4 text-left">
                  Academic Year
                </th>

                <th className="px-6 py-4 text-left">
                  Term
                </th>

                <th className="px-6 py-4 text-left">
                  Level
                </th>

                <th className="px-6 py-4 text-left">
                  Fee Category
                </th>

                <th className="px-6 py-4 text-right">
                  Amount
                </th>

                <th className="px-6 py-4 text-center">
                  Students
                </th>



                <th className="px-6 py-4 text-center">
                  Status
                </th>

                <th className="px-6 py-4 text-center">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>
              {allocations.map((allocation) => (
                <tr
                  key={allocation.id}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4">
                    {allocation.academicYear.name}
                  </td>

                  <td className="px-6 py-4">
                    {allocation.term}
                  </td>

                  <td className="px-6 py-4">
                    {allocation.level.name}
                  </td>

                  <td className="px-6 py-4">
                    {allocation.category.name}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-slate-800">
                      ₦{Number(allocation.amount).toLocaleString()}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {allocation._count.studentBalances}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${allocation.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {allocation.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">

                      <Link
                        href={`/admin/finance/allocate/${allocation.id}`}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        View
                      </Link>


                      <form
                        action={async () => {
                          "use server";

                          await prisma.paymentRecord.deleteMany({
                            where: {
                              feeAllocationId: allocation.id
                            }
                          })

                          await prisma.studentBalance.deleteMany({
                            where: {
                              feeAllocationId: allocation.id,
                            },
                          });

                          await prisma.feeAllocation.delete({
                            where: {
                              id: allocation.id,
                            },
                          });

                          revalidatePath("/admin/finance/allocate");
                          revalidatePath("/admin/finance/balance");
                        }}
                      >
                        <button
                          className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs font-semibold hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </form>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}