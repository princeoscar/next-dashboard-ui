import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { deleteCategory } from "./actions";
import Link from "next/link";

export default async function FeeCategoriesPage() {
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
    },
    orderBy: {
      name: "asc",
    },
  });

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    inactive: categories.filter(c => !c.isActive).length,
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-black">
            Fee Categories
          </h1>

          <p className="text-slate-500 mt-2">
            Create and manage all school fee categories.
          </p>

        </div>

        <Link
          href="/admin/finance/allocate"
          className="rounded-xl bg-slate-200 px-5 py-2"
        >
          Fee Allocation
        </Link>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6">

          <p className="text-xs uppercase tracking-widest">
            Total Categories
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {stats.total}
          </h2>

        </div>

        <div className="rounded-3xl bg-white border p-6">

          <p className="text-xs uppercase text-slate-400">
            Active  Categories
          </p>

          <h2 className="mt-3 text-4xl font-black text-green-600">
            {stats.active}
          </h2>

        </div>

        <div className="rounded-3xl bg-white border p-6">

          <p className="text-xs uppercase text-slate-400">
            Inactive Categories
          </p>

          <h2 className="mt-3 text-4xl font-black text-red-600">
            {stats.inactive}
          </h2>

        </div>

      </div>

      <div className="flex justify-end">

        <Link
          href="/admin/finance/categories/new"
          className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
        >
          + New Fee Category
        </Link>

      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">



        <div className="mb-6">

          <input
            placeholder="Search fee category..."
            className="w-full md:w-80 rounded-2xl border border-slate-300 px-5 py-3"
          />

        </div>
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-slate-50">

              <tr className="text-xs uppercase tracking-wider text-slate-500">

                <th className="px-6 py-4 text-left">
                  Category
                </th>

                <th className="px-6 py-4 text-left">
                  Description
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

              {categories.length === 0 ? (

                <tr>

                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-500"
                  >
                    <div className="py-12 flex flex-col items-center">

                      <div className="text-6xl">
                        📂
                      </div>

                      <h3 className="mt-4 text-xl font-bold">
                        No Fee Categories
                      </h3>

                      <p className="mt-2 text-slate-500">
                        Create your first fee category to begin allocating fees.
                      </p>

                      <Link
                        href="/admin/finance/categories/new"
                        className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"
                      >
                        Create Category
                      </Link>

                    </div>
                  </td>

                </tr>

              ) : (


                categories.map((category) => (

                  <tr
                    key={category.id}
                    className="border-t hover:bg-slate-50 transition"
                  >

                    <td className="px-6 py-4">

                      <Link
                        href={`/admin/finance/categories/${category.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {category.name}
                      </Link>

                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {category.description || "-"}
                    </td>

                    <td className="px-6 py-4 text-center">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${category.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {category.isActive ? "🟢 Active" : "🔴 Disabled"}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-center gap-2">

                        <Link
                          href={`/admin/finance/categories/${category.id}`}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          View
                        </Link>

                        <Link
                          href={`/admin/finance/categories/${category.id}/edit`}
                          className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                        >
                          Edit
                        </Link>

                        <form
                          action={deleteCategory.bind(null, category.id)}
                        >
                          <button
                            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </form>

                      </div>

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