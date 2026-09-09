import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { deleteCategory } from "../actions";
import Link from "next/link";

export default async function FeeCategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.feeCategory.findUnique({
    where: {
      id: Number(id),
    },
    include: {
  allocations: {
    include: {
      level: true,
      academicYear: true,
    },
    orderBy: {
      academicYearId: "desc",
    },
  },
},
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black">
            {category.name}
          </h1>

          <p className="text-slate-500 mt-2">
            Fee Category Details
          </p>

        </div>

    

        <div className="flex gap-3">

  <Link
    href={`/admin/finance/categories/${category.id}/edit`}
    className="rounded-xl bg-amber-500 px-5 py-2 text-white hover:bg-amber-600 transition"
  >
    Edit
  </Link>

  <form
    action={deleteCategory.bind(null, category.id)}
  >
    <button
      className="rounded-xl bg-red-600 px-5 py-2 text-white hover:bg-amber-700 transition"
    >
      Delete
    </button>
  </form>

  <Link
    href="/admin/finance/categories"
    className="rounded-xl bg-slate-200 px-5 py-2 hover:bg-amber-300 transition"
  >
    Back
  </Link>

</div>

      </div>

      <div className="grid md:grid-cols-3 gap-5">

        <div className="rounded-3xl border p-6">

          <p className="text-xs uppercase text-slate-400">
            Category
          </p>

          <h2 className="mt-3 text-2xl font-black">
            {category.name}
          </h2>

        </div>

        <div className="rounded-3xl border p-6">

          <p className="text-xs uppercase text-slate-400">
            Status
          </p>

          <h2
            className={`mt-3 text-2xl font-black ${
              category.isActive
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {category.isActive ? "Active" : "Disabled"}
          </h2>

        </div>

        <div className="rounded-3xl border p-6">

          <p className="text-xs uppercase text-slate-400">
            Allocations
          </p>

          <h2 className="mt-3 text-2xl font-black">
            {category.allocations.length}
          </h2>

        </div>

      </div>

      <div className="rounded-3xl border bg-white p-8">

        <h2 className="text-xl font-black mb-4">
          Description
        </h2>

        <p className="text-slate-600">
          {category.description || "No description provided."}
        </p>

      </div>

      <div className="rounded-3xl border overflow-hidden">
  <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="p-4 text-left">
                Academic Year
              </th>

              <th className="p-4 text-left">
                Level
              </th>

              <th className="p-4 text-left">
                Term
              </th>

              <th className="p-4 text-right">
                Amount
              </th>

            </tr>

          </thead>

          <tbody>

{category.allocations.length === 0 ? (

<tr>

<td
colSpan={4}
className="p-10 text-center"
>

<div className="mx-auto max-w-md space-y-3">

<h3 className="text-lg font-bold">
No allocations yet
</h3>

<p className="text-slate-500">
This fee category has not been assigned to any level.
</p>

<Link
href="/admin/finance/allocate"
className="inline-block rounded-xl bg-blue-600 px-5 py-2 text-white mt-2"
>
Create Allocation
</Link>

</div>

</td>

</tr>

) : (

category.allocations.map((allocation) => (

<tr
key={allocation.id}
className="border-t hover:bg-slate-50"
>

<td className="p-4">
{allocation.academicYear.name}
</td>

<td className="p-4">
{allocation.level.name}
</td>

<td className="p-4">
{allocation.term}
</td>

<td className="p-4 text-right font-bold">
₦{Number(allocation.amount).toLocaleString()}
</td>

</tr>

))

)}

</tbody>

        </table>
       </div>
      </div>

    </div>
  );
}