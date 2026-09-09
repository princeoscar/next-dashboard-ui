import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import FinancialSummaryCards from "@/components/FinancialReports/FinancialSummaryCards";
import FinancialBreakdown from "@/components/FinancialReports/FinancialBreakdown";
import FinancialStudentStats from "@/components/FinancialReports/FinancialStudentStats";
import FinancialPeriodCards from "@/components/FinancialReports/FinancialPeriodCards";
import FinancialCategoryBreakdown from "@/components/FinancialReports/FinancialCategoryBreakdown";
import FinanceChart from "@/components/FinanceChart";
import BiggestExpenses from "@/components/FinancialReports/BiggestExpenses";
import RecentTransactions from "@/components/FinancialReports/RecentTransactions";
import ExportPDF from "@/components/FinancialReports/ExportPDF";
import ExportExcel from "@/components/FinancialReports/ExportExcel";
import PrintReport from "@/components/FinancialReports/PrintReport";

const FinanceReportsPage = async () => {
const { sessionClaims } = await auth();
const schoolId = (sessionClaims as any).metadata?.schoolId;

if (!schoolId) {
  throw new Error("School ID not found.");
}

const school = await prisma.school.findUnique({
  where: {
    id: schoolId,
  },

  select: {
    id: true,
    name: true,
    address: true,
    phone: true,
    email: true,
    logo: true,
  },
});
  // ======================================
// Date Helpers
// ======================================

const now = new Date();

const startOfToday = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
);

const startOfMonth = new Date(
  now.getFullYear(),
  now.getMonth(),
  1
);

const startOfYear = new Date(
  now.getFullYear(),
  0,
  1
);

// ======================================
// Fee Allocation Statistics
// ======================================

const allocationStats = await prisma.studentBalance.aggregate({
  where: {
    schoolId,
  },

  _sum: {
   totalAssigned: true,
    paidAmount: true,
    outstanding: true,
  },

  _count: {
    id: true,
  },
});

// ======================================
// Payment Statistics
// ======================================

const paymentStats = await prisma.paymentRecord.aggregate({
  where: {
    schoolId,
  },

  _sum: {
    amountPaid: true,
  },

  _count: {
    id: true,
  },
});

// ======================================
// Income Statistics
// ======================================

const incomeStats = await prisma.income.aggregate({
  where: {
    schoolId,
  },

  _sum: {
    amount: true,
  },

  _count: {
    id: true,
  },
});

// ======================================
// Expense Statistics
// ======================================

const expenseStats = await prisma.expense.aggregate({
  where: {
    schoolId,
  },

  _sum: {
    amount: true,
  },

  _count: {
    id: true,
  },
});

// ======================================
// Fully Paid Students
// ======================================

const fullyPaidStudents =
  await prisma.studentBalance.count({
    where: {
      schoolId,
      status: "FULLY_PAID",
    },
  });

// ======================================
// Partial Students
// ======================================

const partiallyPaidStudents =
  await prisma.studentBalance.count({
    where: {
      schoolId,

      status: "PARTIAL",
    },
  });

// ======================================
// Outstanding Students
// ======================================

const outstandingStudents =
  await prisma.studentBalance.count({
    where: {
      schoolId,

      outstanding: {
        gt: 0,
      },
    },
  });

// ======================================
// Today's Income
// ======================================

const todayIncome =
  await prisma.income.aggregate({
    where: {
      schoolId,

      receivedAt: {
        gte: startOfToday,
      },
    },

    _sum: {
      amount: true,
    },
  });

// ======================================
// Today's Expenses
// ======================================

const todayExpenses =
  await prisma.expense.aggregate({
    where: {
      schoolId,

      spentAt: {
        gte: startOfToday,
      },
    },

    _sum: {
      amount: true,
    },
  });

// ======================================
// Monthly Income
// ======================================

const monthIncome =
  await prisma.income.aggregate({
    where: {
      schoolId,

      receivedAt: {
        gte: startOfMonth,
      },
    },

    _sum: {
      amount: true,
    },
  });

// ======================================
// Monthly Expenses
// ======================================

const monthExpenses =
  await prisma.expense.aggregate({
    where: {
      schoolId,

      spentAt: {
        gte: startOfMonth,
      },
    },

    _sum: {
      amount: true,
    },
  });

// ======================================
// Yearly Income
// ======================================

const yearIncome =
  await prisma.income.aggregate({
    where: {
      schoolId,

      receivedAt: {
        gte: startOfYear,
      },
    },

    _sum: {
      amount: true,
    },
  });

// ======================================
// Yearly Expenses
// ======================================

const yearExpenses =
  await prisma.expense.aggregate({
    where: {
      schoolId,

      spentAt: {
        gte: startOfYear,
      },
    },

    _sum: {
      amount: true,
    },
  });

// ======================================
// Income Breakdown by Category
// ======================================

const incomeByCategory = await prisma.income.groupBy({
  by: ["category"],

  where: {
    schoolId,
  },

  _sum: {
    amount: true,
  },

  orderBy: {
    category: "asc",
  },
});

// ======================================
// Expense Breakdown by Category
// ======================================

const expenseByCategory = await prisma.expense.groupBy({
  by: ["category"],

  where: {
    schoolId,
  },

  _sum: {
    amount: true,
  },

  orderBy: {
    category: "asc",
  },
});

// ======================================
// Biggest Expenses
// ======================================

const biggestExpenses = await prisma.expense.findMany({
  where: {
    schoolId,
  },

  orderBy: {
    amount: "desc",
  },

  take: 5,
});




// ======================================
// Recent Payment Records
// ======================================

const recentPayments =
  await prisma.paymentRecord.findMany({
    where: {
      schoolId,
    },

    include: {
      balance: {
        include: {
          student: true,
        },
      },
    },

    orderBy: {
      paymentDate: "desc",
    },

    take: 10,
  });


  // ======================================
// Recent Income
// ======================================

const recentIncome =
  await prisma.income.findMany({
    where: {
      schoolId,
    },

    orderBy: {
      receivedAt: "desc",
    },

    take: 10,
  });

  // ======================================
// Recent Expenses
// ======================================

const recentExpenses =
  await prisma.expense.findMany({
    where: {
      schoolId,
    },

    orderBy: {
      spentAt: "desc",
    },

    take: 10,
  });

  const transactions = [
  ...recentPayments.map((payment) => ({
    id: payment.id.toString(),

    type: "PAYMENT" as const,

    title: `${payment.balance.student.name} ${payment.balance.student.surname}`,

    subtitle: payment.reference,

    amount: Number(payment.amountPaid),

    date: payment.paymentDate,
  })),

  ...recentIncome.map((income) => ({
    id: income.id.toString(),

    type: "INCOME" as const,

    title: income.title,

    subtitle: income.category,

    amount: Number(income.amount),

    date: income.receivedAt,
  })),

  ...recentExpenses.map((expense) => ({
    id: expense.id.toString(),

    type: "EXPENSE" as const,

    title: expense.title,

    subtitle: expense.category,

    amount: Number(expense.amount),

    date: expense.spentAt,
  })),
]
.sort(
  (a, b) =>
    b.date.getTime() - a.date.getTime()
)
.slice(0, 15);

const exportRows = transactions.map((item) => ({
  type: item.type,
  title: item.title,
  subtitle: item.subtitle,
  amount: item.amount,
  date: item.date,
}));



  return (
  <div className="flex flex-col gap-6 p-6">

    {/* =================================================== */}
    {/* Header */}
    {/* =================================================== */}

    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-3xl font-black">
          Financial Reports
        </h1>

        <p className="text-gray-500 mt-1">
         Complete overview of your school&apos;s financial performance.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
  <ExportPDF
  schoolName={school?.name ?? "School ERP"}
schoolAddress={school?.address ?? ""}
schoolLogo={school?.logo ?? undefined}
  reportTitle="Financial Summary Report"
  summary={{
    expectedFees: Number(allocationStats._sum?.totalAssigned ?? 0),
    collected: Number(allocationStats._sum?.paidAmount ?? 0),
    outstanding: Number(allocationStats._sum?.outstanding ?? 0),
    income: Number(incomeStats._sum?.amount ?? 0),
    expenses: Number(expenseStats._sum?.amount ?? 0),
    netIncome:
      Number(incomeStats._sum.amount ?? 0) -
      Number(expenseStats._sum.amount ?? 0),
  }}
  rows={exportRows}
/>

  <ExportExcel rows={exportRows} />

  <PrintReport />
</div>

    </div>

    <FinancialSummaryCards
  expectedFees={Number(
    allocationStats._sum?.totalAssigned ?? 0)}
  amountCollected={Number(allocationStats._sum?.paidAmount ?? 0)}
  outstandingFees={Number(allocationStats._sum?.outstanding ?? 0)}
  totalPayments={paymentStats._count.id}
/>

<div className="rounded-2xl border bg-white p-6">
  <FinanceChart />
</div>

<BiggestExpenses
      expenses={biggestExpenses.map((expense) => ({
        ...expense,
        amount: Number(expense.amount),
      }))}
    />

<FinancialBreakdown
  income={Number(incomeStats._sum.amount ?? 0)}
  expenses={Number(expenseStats._sum.amount ?? 0)}
  profit={
    Number(incomeStats._sum.amount ?? 0) -
    Number(expenseStats._sum.amount ?? 0)
  }
/>

<FinancialStudentStats
  paid={fullyPaidStudents}
  partial={partiallyPaidStudents}
  unpaid={outstandingStudents}
/>

<FinancialPeriodCards
  todayIncome={Number(todayIncome._sum.amount ?? 0)}
  todayExpense={Number(todayExpenses._sum.amount ?? 0)}
  monthIncome={Number(monthIncome._sum.amount ?? 0)}
  monthExpense={Number(monthExpenses._sum.amount ?? 0)}
  yearIncome={Number(yearIncome._sum.amount ?? 0)}
  yearExpense={Number(yearExpenses._sum.amount ?? 0)}
/>


    <FinancialCategoryBreakdown
  incomeByCategory={incomeByCategory}
  expenseByCategory={expenseByCategory}
/>

<RecentTransactions
  transactions={transactions}
/>

  </div>
);
};

export default FinanceReportsPage;