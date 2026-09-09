import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import FeeAllocationForm from "@/components/forms/FeeAllocationForm";

export default async function AllocationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const allocation = await prisma.feeAllocation.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      category: true,
      level: true,
      academicYear: true,
      studentBalances: {
        include: {
          student: {
            include: {
              class: true,
            },
          },
        },
      },
    },
  });

  if (!allocation) notFound();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-black">
            Fee Allocation Details
          </h1>

          <p className="text-slate-500">
            Allocation overview and assigned students.
          </p>
        </div>

        <Link
          href="/admin/finance/allocate"
          className="rounded-xl bg-slate-200 px-5 py-2"
        >
          Back
        </Link>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="rounded-2xl border p-5">
          <p className="text-xs text-slate-400">
            Category
          </p>

          <h2 className="text-xl font-black">
            {allocation.category.name}
          </h2>
        </div>

        <div className="rounded-2xl border p-5">
          <p className="text-xs text-slate-400">
            Level
          </p>

          <h2 className="text-xl font-black">
            {allocation.level.name}
          </h2>
        </div>

        <div className="rounded-2xl border p-5">
          <p className="text-xs text-slate-400">
            Amount
          </p>

          <h2 className="text-xl font-black">
            ₦{Number(allocation.amount).toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl border p-5">
          <p className="text-xs text-slate-400">
            Students
          </p>

          <h2 className="text-xl font-black">
            {allocation.studentBalances.length}
          </h2>
        </div>

      </div>

      <div className="rounded-3xl border bg-white p-8 mt-8">

  <h2 className="text-2xl font-black mb-6">
    Edit Allocation
  </h2>

  <FeeAllocationForm allocation={allocation} />

</div>

      <div className="rounded-3xl border overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="p-4 text-left">
                Student
              </th>

              <th className="p-4 text-left">
                Class
              </th>

              <th className="p-4 text-right">
                Assigned
              </th>

              <th className="p-4 text-right">
                Paid
              </th>

              <th className="p-4 text-right">
                Outstanding
              </th>

              <th className="p-4">
                Status
              </th>

               <th className="p-4 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {allocation.studentBalances.map(balance => (

              <tr
                key={balance.id}
                className="border-t"
              >
                <td className="p-4">
                  {balance.student.name} {balance.student.surname}
                </td>

                <td className="p-4">
                  {balance.student.class?.name}
                </td>

                <td className="p-4 text-right">
                  ₦{Number(balance.totalAssigned).toLocaleString()}
                </td>

                <td className="p-4 text-right text-green-600">
                  ₦{Number(balance.paidAmount).toLocaleString()}
                </td>

                <td className="p-4 text-right text-red-600">
                  ₦{Number(balance.outstanding).toLocaleString()}
                </td>

               <td className="p-4 text-center">
  <span
    className={`rounded-full px-3 py-1 text-xs font-bold ${
      balance.status === "FULLY_PAID"
        ? "bg-green-100 text-green-700"
        : balance.status === "PARTIAL"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {balance.status.replace("_", " ")}
  </span>
</td>

<td className="p-4">
  <div className="flex justify-center gap-2">

    <Link
      href={`/admin/list/payment-record?studentId=${balance.studentId}`}
      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
    >
      Payments
    </Link>

    <Link
      href={`/admin/finance/balances?studentId=${balance.studentId}`}
      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
    >
      Ledger
    </Link>

  </div>
</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}