import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FeeCategoryForm from "@/components/forms/FeeCategoryForm";

export default async function EditFeeCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.feeCategory.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      <div>
        <h1 className="text-3xl font-black">
          Edit Fee Category
        </h1>

        <p className="text-slate-500 mt-2">
          Update this fee category.
        </p>
      </div>

      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <FeeCategoryForm category={category} />
      </div>

    </div>
  );
}