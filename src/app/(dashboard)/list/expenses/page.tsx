import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import FormModal from "@/components/FormModal";

const columns = [
  {
    header: "Title",
    accessor: "title",
  },
  {
    header: "Category",
    accessor: "category",
  },
  {
    header: "Method",
    accessor: "paymentMethod",
    className: "hidden lg:table-cell",
  },
  {
    header: "Amount",
    accessor: "amount",
  },
  {
    header: "Date",
    accessor: "spentAt",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ExpensesPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    search?: string;
  }>;
}) => {
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

const resolved = await searchParams;

const page = Number(resolved?.page) || 1;

const search = resolved?.search || "";

const ITEM_PER_PAGE = 10;

const query: any = {
  schoolId,
};
if (search) {
  query.OR = [
    {
      title: {
        contains: search,
        mode: "insensitive",
      },
    },
    {
      category: {
        contains: search,
        mode: "insensitive",
      },
    },
    {
      description: {
        contains: search,
        mode: "insensitive",
      },
    },
  ];
}

const [expenses, count] = await prisma.$transaction([
  prisma.expense.findMany({
    where: query,

    orderBy: {
      spentAt: "desc",
    },

    take: ITEM_PER_PAGE,

    skip: ITEM_PER_PAGE * (page - 1),
  }),

  prisma.expense.count({
    where: query,
  }),
]);

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

const today = new Date();

today.setHours(0, 0, 0, 0);

const todayExpenses = await prisma.expense.aggregate({
  where: {
    schoolId,

    spentAt: {
      gte: today,
    },
  },

  _sum: {
    amount: true,
  },
});

const thisMonth = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);

const monthExpenses = await prisma.expense.aggregate({
  where: {
    schoolId,

    spentAt: {
      gte: thisMonth,
    },
  },

  _sum: {
    amount: true,
  },
});
const renderRow = (expense: any) => (
  <tr
    key={expense.id}
    className="border-b border-gray-100 even:bg-slate-50 hover:bg-rubixSkyLight text-sm"
  >
    <td className="py-4">
      <div className="font-semibold">
        {expense.title}
      </div>

      {expense.description && (
        <p className="text-xs text-gray-500">
          {expense.description}
        </p>
      )}
    </td>

    <td>
      {expense.category}
    </td>

    <td className="hidden lg:table-cell">
      {expense.paymentMethod ?? "-"}
    </td>

    <td className="font-bold text-red-600">
      ₦{Number(expense.amount).toLocaleString()}
    </td>

    <td className="hidden xl:table-cell">
      {new Date(expense.spentAt).toLocaleDateString()}
    </td>

    <td>
      <div className="flex items-center gap-2">
        <FormModal
          table="expense"
          type="update"
          data={expense}
        />

        <FormModal
          table="expense"
          type="delete"
          id={expense.id}
        />
      </div>
    </td>
  </tr>
);
return (
  <div className="bg-white rounded-xl p-4 flex-1 m-4 mt-0">

    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-2xl font-bold">
          Expenses
        </h1>

        <p className="text-sm text-gray-500">
          Track and manage all school expenses.
        </p>
      </div>

      <FormModal
        table="expense"
        type="create"
      />

    </div>

    <div className="mt-5">
      <TableSearch />
    </div>

    {/* Statistics Cards */}

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">

      <div className="bg-red-50 rounded-xl border p-5">
        <p className="text-sm text-gray-500">
          Total Expenses
        </p>

        <h2 className="text-3xl font-black mt-2">
          {expenseStats._count.id}
        </h2>
      </div>

      <div className="bg-orange-50 rounded-xl border p-5">
        <p className="text-sm text-gray-500">
          Total Amount
        </p>

        <h2 className="text-3xl font-black mt-2">
          ₦{Number(expenseStats._sum.amount ?? 0).toLocaleString()}
        </h2>
      </div>

      <div className="bg-yellow-50 rounded-xl border p-5">
        <p className="text-sm text-gray-500">
          Today&apos;,s Expenses
        </p>

        <h2 className="text-3xl font-black mt-2">
          ₦{Number(todayExpenses._sum.amount ?? 0).toLocaleString()}
        </h2>
      </div>

      <div className="bg-blue-50 rounded-xl border p-5">
        <p className="text-sm text-gray-500">
          This Month
        </p>

        <h2 className="text-3xl font-black mt-2">
          ₦{Number(monthExpenses._sum.amount ?? 0).toLocaleString()}
        </h2>
      </div>

    </div>

    <div className="mt-6">
      <Table
        columns={columns}
        data={expenses}
        renderRow={renderRow}
      />
    </div>

    <Pagination
      page={page}
      count={count}
    />

  </div>
);
};

export default ExpensesPage;