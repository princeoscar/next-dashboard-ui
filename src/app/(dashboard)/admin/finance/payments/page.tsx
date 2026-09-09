import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";

const columns = [
  {
    header: "Student",
    accessor: "student",
  },
  {
    header: "Fee",
    accessor: "fee",
  },
  {
    header: "Reference",
    accessor: "reference",
    className: "hidden xl:table-cell",
  },
  {
    header: "Amount",
    accessor: "amount",
  },
  {
    header: "Method",
    accessor: "method",
    className: "hidden lg:table-cell",
  },
  {
    header: "Status",
    accessor: "status",
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

const PaymentsPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{
  page?: string;
  search?: string;
  studentId?: string;
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
const studentId = resolved?.studentId;

  const ITEM_PER_PAGE = 10;

  const query: any = {
    schoolId,
  };

  if (studentId) {
  query.studentBalanceId = undefined;

  query.balance = {
    is: {
      studentId,
    },
  };
}

  if (search) {
    query.OR = [
      {
        reference: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        balance: {
          is: {
            student: {
              is: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
        }
      },
      {
  balance: {
    is: {
      student: {
        is: {
          surname: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    },
  },
},
    ];
  }


  const balances = await prisma.studentBalance.findMany({
    where: {
      schoolId,
      outstanding: {
        gt: 0,
      },
    },
    include: {
      student: {
        include: {
          class: true,
        },
      },
      allocation: {
        include: {
          category: true,
        },
      },
    },
  });

  const [payments, count] = await prisma.$transaction([
    prisma.paymentRecord.findMany({
      where: query,
      include: {
        allocation: {
          include: {
            category: true,
          },
        },
        balance: {
          include: {
            student: {
              include: {
                class: true,
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: "desc",
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),

    prisma.paymentRecord.count({
      where: query,
    }),
  ]);

  const [
  paymentStats,
  fullyPaid,
  partialPaid,
  unpaid,
] = await prisma.$transaction([
  prisma.paymentRecord.aggregate({
    where: {
      schoolId,
    },
    _sum: {
      amountPaid: true,
    },
    _count: {
      id: true,
    },
  }),

  prisma.paymentRecord.count({
    where: {
      schoolId,
      status: "FULLY_PAID",
    },
  }),

  prisma.paymentRecord.count({
    where: {
      schoolId,
      status: "PARTIAL",
    },
  }),

  prisma.studentBalance.count({
    where: {
      schoolId,
      status: "UNPAID",
    },
  }),
]);

  

  const renderRow = (payment: any) => (
    <tr
      key={payment.id}
      className="border-b border-gray-100 even:bg-slate-50 text-sm hover:bg-rubixSkyLight"
    >
      <td className="py-4">
        <div className="flex flex-col">
          <span className="font-semibold">
            {payment.balance.student.name}{" "}
            {payment.balance.student.surname}
          </span>

          <span className="text-xs text-gray-500">
            {payment.balance.student.class?.name ?? "-"}
          </span>
        </div>
      </td>

      <td>{payment.allocation.category.name}</td>

      <td className="hidden xl:table-cell">
        <span className="font-mono text-xs">
          {payment.reference}
        </span>
      </td>

      <td className="font-semibold">
        ₦{Number(payment.amountPaid).toLocaleString()}
      </td>

      <td className="hidden md:table-cell">
        {payment.paymentMethod}
      </td>

      <td className="hidden lg:table-cell">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.status === "FULLY_PAID"
              ? "bg-green-100 text-green-700"

              : payment.status === "PARTIAL"
                ? "bg-yellow-100 text-yellow-700"

                : "bg-red-100 text-red-700"
            }`}
        >
          {payment.status.replace("_", " ")}
        </span>
      </td>

      <td className="hidden lg:table-cell">
        {new Date(payment.paymentDate).toLocaleDateString()}
      </td>

      <td>
        <div className="flex items-center gap-2">
          <a
            href={`/finance/receipts/${payment.reference}`}
            target="_blank"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition"
          >
            Receipt
          </a>

          <FormModal
            table="paymentRecord"
            type="update"
            data={payment}
            relatedData={{ balances }}
          />

          <FormModal
            table="paymentRecord"
            type="delete"
            id={payment.id}
          />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-xl flex-1 m-4 mt-0">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Payment History
          </h1>

          <p className="text-sm text-gray-500">
            View, manage and print all payment transactions.
          </p>
        </div>

        <FormModal
          table="paymentRecord"
          type="create"
          relatedData={{ balances }}
        />
      </div>

      <div className="mt-4">
        <TableSearch />
      </div>

      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 xl:grid-cols-5">

  {/* Total Payments */}
  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
    <p className="text-sm text-gray-500">
      Total Payments
    </p>

    <h2 className="mt-2 text-3xl font-black text-blue-700">
      {paymentStats._count.id}
    </h2>

    <p className="mt-2 text-xs text-gray-500">
      Successful payment transactions
    </p>
  </div>

  {/* Total Amount */}
  <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
    <p className="text-sm text-gray-500">
      Total Amount Received
    </p>

    <h2 className="mt-2 text-3xl font-black text-green-700">
      ₦{Number(paymentStats._sum.amountPaid ?? 0).toLocaleString()}
    </h2>

    <p className="mt-2 text-xs text-gray-500">
      Revenue collected
    </p>
  </div>

  {/* Fully Paid */}
  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
    <p className="text-sm text-gray-500">
      Fully Paid
    </p>

    <h2 className="mt-2 text-3xl font-black text-emerald-700">
      {fullyPaid}
    </h2>

    <p className="mt-2 text-xs text-gray-500">
      Completed payments
    </p>
  </div>

  {/* Partially Paid */}
  <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
    <p className="text-sm text-gray-500">
      Partially Paid
    </p>

    <h2 className="mt-2 text-3xl font-black text-yellow-700">
      {partialPaid}
    </h2>

    <p className="mt-2 text-xs text-gray-500">
      Balance remaining
    </p>
  </div>

  {/* Outstanding */}
  <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
    <p className="text-sm text-gray-500">
      Outstanding Students
    </p>

    <h2 className="mt-2 text-3xl font-black text-red-700">
      {unpaid}
    </h2>

    <p className="mt-2 text-xs text-gray-500">
      Students yet to pay
    </p>
  </div>

</div>

      <div className="mt-6">
        <Table
          columns={columns}
          renderRow={renderRow}
          data={payments}
        />
      </div>

      <Pagination
        page={page}
        count={count}
      />
    </div>
  );
};

export default PaymentsPage;