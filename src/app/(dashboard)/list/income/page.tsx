import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";

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
    header: "Amount",
    accessor: "amount",
  },
  {
    header: "Payment Method",
  accessor: "paymentMethod",
    className: "hidden lg:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const IncomePage = async ({
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
        receivedFrom: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [incomes, count] = await prisma.$transaction([
    prisma.income.findMany({
      where: query,

      orderBy: {
        receivedAt: "desc",
      },

      take: ITEM_PER_PAGE,

      skip: ITEM_PER_PAGE * (page - 1),
    }),

    prisma.income.count({
      where: query,
    }),
  ]);

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const startOfToday = new Date();

  startOfToday.setHours(0, 0, 0, 0);

  const [
    incomeStats,
    monthlyIncome,
    todayIncome,
  ] = await Promise.all([
    prisma.income.aggregate({
      where: {
        schoolId,
      },

      _sum: {
        amount: true,
      },

      _count: {
        id: true,
      },
    }),

    prisma.income.aggregate({
      where: {
        schoolId,

        receivedAt: {
          gte: startOfMonth,
        },
      },

      _sum: {
        amount: true,
      },
    }),

    prisma.income.aggregate({
      where: {
        schoolId,

        receivedAt: {
          gte: startOfToday,
        },
      },

      _sum: {
        amount: true,
      },
    }),
  ]);

  const categoryColor: Record<string, string> = {
  FEES: "bg-green-100 text-green-700",
  DONATION: "bg-blue-100 text-blue-700",
  SALES: "bg-purple-100 text-purple-700",
  OTHER: "bg-gray-100 text-gray-700",
};
  const renderRow = (income: any) => (
    
  <tr
    key={income.id}
    className="border-b border-gray-100 even:bg-slate-50 hover:bg-rubixSkyLight text-sm transition-colors"
  >
    {/* Title */}
    <td className="py-4">
      <div className="flex flex-col">
        <span className="font-semibold text-slate-700">
          {income.title}
        </span>

        {income.description && (
          <span className="text-xs text-slate-500 truncate max-w-[220px]">
            {income.description}
          </span>
        )}
      </div>
    </td>

    {/* Category */}
    <td>
      <span
  className={`px-3 py-1 rounded-full text-xs font-semibold ${
    categoryColor[income.category] ??
    "bg-gray-100 text-gray-700"
  }`}
>
  {income.category}
</span>
    </td>

    {/* Amount */}
    <td>
      <span className="font-bold text-green-700">
        ₦{Number(income.amount).toLocaleString()}
      </span>
    </td>

    {/* Received From */}
    <td className="hidden lg:table-cell">
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
        {income.paymentMethod ?? "-"}
    </span>
</td>

    {/* Date */}
    <td className="hidden xl:table-cell">
      new Date(income.receivedAt).toLocaleDateString()
    </td>

    {/* Actions */}
    <td>
      <div className="flex items-center gap-2">
        <FormModal
          table="income"
          type="update"
          data={income}
        />

        <FormModal
          table="income"
          type="delete"
          id={income.id}
        />
      </div>
    </td>
  </tr>
);
return (
  <div className="bg-white rounded-xl flex-1 m-4 mt-0 p-4">

    {/* HEADER */}

    <div className="flex items-center justify-between">

      <div>

        <h1 className="text-2xl font-bold">
          Income
        </h1>

        <p className="text-sm text-gray-500">
          Record and manage every source of school income.
        </p>

      </div>

      <FormModal
        table="income"
        type="create"
      />

    </div>

    {/* SEARCH */}

    <div className="mt-4">
      <TableSearch />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">

  <div className="rounded-xl border bg-blue-50 p-5">

    <p className="text-sm text-gray-500">
      Total Records
    </p>

    <h2 className="mt-2 text-3xl font-black">
      {incomeStats._count.id}
    </h2>

  </div>

  <div className="rounded-xl border bg-green-50 p-5">

    <p className="text-sm text-gray-500">
      Total Income
    </p>

    <h2 className="mt-2 text-3xl font-black">
      ₦{Number(
        incomeStats._sum.amount ?? 0
      ).toLocaleString()}
    </h2>

  </div>

  <div className="rounded-xl border bg-yellow-50 p-5">

    <p className="text-sm text-gray-500">
      This Month
    </p>

    <h2 className="mt-2 text-3xl font-black">
      ₦{Number(
        monthlyIncome._sum.amount ?? 0
      ).toLocaleString()}
    </h2>

  </div>

  <div className="rounded-xl border bg-purple-50 p-5">

    <p className="text-sm text-gray-500">
      Today
    </p>

    <h2 className="mt-2 text-3xl font-black">
      ₦{Number(
        todayIncome._sum.amount ?? 0
      ).toLocaleString()}
    </h2>

  </div>

</div>
      {/* TABLE */}

      <div className="mt-6">
        <Table
          columns={columns}
          renderRow={renderRow}
          data={incomes}
        />
      </div>

      {/* PAGINATION */}

      <Pagination
        page={page}
        count={count}
      />

    </div>
  );
};

export default IncomePage;