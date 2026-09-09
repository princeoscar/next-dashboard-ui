import Table from "@/components/Table";
import { getRecentPayments } from "@/lib/actions/finance";

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
    header: "Amount",
    accessor: "amount",
    className: "hidden md:table-cell",
  },
  {
    header: "Method",
    accessor: "method",
    className: "hidden lg:table-cell",
  },
  {
    header: "Status",
    accessor: "status",
    className: "hidden lg:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden xl:table-cell",
  },
];

const RecentPayments = async () => {
  const payments = await getRecentPayments();

  const renderRow = (payment: any) => (
    <tr
      key={payment.id}
      className="border-b border-gray-100 even:bg-slate-50 text-sm hover:bg-rubixSkyLight"
    >
      <td className="py-3">
        <div className="flex flex-col">
          <span className="font-semibold">
            {payment.balance.student.name}
          </span>

          <span className="text-xs text-gray-500">
            {payment.balance.student.class?.name ?? "No Class"}
          </span>
        </div>
      </td>

      <td>
        {payment.allocation.category.name}
      </td>

      <td className="hidden md:table-cell font-medium">
        ₦{Number(payment.amountPaid).toLocaleString()}
      </td>

      <td className="hidden lg:table-cell">
        {payment.paymentMethod}
      </td>

      <td className="hidden lg:table-cell">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            payment.status === "FULLY_PAID"
              ? "bg-green-100 text-green-700"
              : payment.status === "PENDING"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {payment.status}
        </span>
      </td>

      <td className="hidden xl:table-cell">
        {new Date(payment.paymentDate).toLocaleDateString()}
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">
        Recent Payments
      </h2>

      <Table
        columns={columns}
        data={payments}
        renderRow={renderRow}
      />
    </div>
  );
};

export default RecentPayments;