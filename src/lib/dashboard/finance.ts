import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const getFinanceDashboard = async () => {
    const { sessionClaims } = await auth();

const schoolId = (sessionClaims?.metadata as any)?.schoolId;

if (!schoolId) {
  throw new Error("School not found.");
}

const today = new Date();

today.setHours(0, 0, 0, 0);

const [
  expected,
  discount,
  paid,
  outstanding,
  debtors,
  completed,
  paymentsToday,
  otherIncome,
  expenses,
  
] = await Promise.all([
  prisma.studentBalance.aggregate({
    where: { schoolId },
    _sum: { totalAssigned: true },
  }),

  prisma.studentBalance.aggregate({
    where: { schoolId },
    _sum: { discount: true },
  }),

  prisma.studentBalance.aggregate({
    where: { schoolId },
    _sum: { paidAmount: true },
  }),

  prisma.studentBalance.aggregate({
    where: { schoolId },
    _sum: { outstanding: true },
  }),

  prisma.studentBalance.count({
    where: {
      schoolId,
      outstanding: { gt: 0 },
    },
  }),

  prisma.studentBalance.count({
    where: {
      schoolId,
      status: "FULLY_PAID",
    },
  }),

  

  prisma.paymentRecord.aggregate({
    where: {
      schoolId,
      paymentDate: {
        gte: today,
      },
    },
    _sum: {
      amountPaid: true,
    },
  }),

  prisma.income.aggregate({
    where: { schoolId },
    _sum: { amount: true },
  }),

  prisma.expense.aggregate({
    where: { schoolId },
    _sum: { amount: true },
  }),
]);

const totalRevenue =
  Number(paid._sum.paidAmount ?? 0) +
  Number(otherIncome._sum.amount ?? 0);

  const netIncome =
  totalRevenue -
  Number(expenses._sum.amount ?? 0);

  const collectionRate =
  Number(expected._sum.totalAssigned ?? 0) === 0
    ? 0
    : Number(
        (
          (Number(paid._sum.paidAmount ?? 0) /
            Number(expected._sum.totalAssigned ?? 0)) *
          100
        ).toFixed(1)
      );

      return {
  expectedFees: Number(expected._sum.totalAssigned ?? 0),
  totalDiscount: Number(discount._sum.discount ?? 0),
  totalPaid: Number(paid._sum.paidAmount ?? 0),
  outstanding: Number(outstanding._sum.outstanding ?? 0),
  debtors,
  completed,
  paymentsToday: Number(paymentsToday._sum.amountPaid ?? 0),
  otherIncome: Number(otherIncome._sum.amount ?? 0),
  expenses: Number(expenses._sum.amount ?? 0),
  totalRevenue,
  netIncome,
  collectionRate,
} as const;
}