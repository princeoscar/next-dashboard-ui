"use client";

import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";

interface Props {
  data: any[];
}

export default function PaymentsTable({ data }: Props) {
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
      header: "Outstanding",
      accessor: "outstanding",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-slate-50 text-sm hover:bg-rubixPurpleLight"
    >
      <td className="p-4">
        <div className="font-semibold">
          {item.student.name} {item.student.surname}
        </div>
      </td>

      <td>{item.allocation.category.name}</td>

      <td className="hidden md:table-cell">
        ₦{Number(item.outstanding).toLocaleString()}
      </td>

      <td>
        <div className="flex gap-2">
          <FormModal
            table="paymentRecord"
            type="create"
            relatedData={{
              balances: [item],
            }}
          />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-lg">
          Outstanding Payments
        </h2>

        <TableSearch />
      </div>

      <Table
        columns={columns}
        renderRow={renderRow}
        data={data}
      />
    </div>
  );
}