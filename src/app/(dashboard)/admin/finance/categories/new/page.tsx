import FeeCategoryForm from "@/components/forms/FeeCategoryForm";
import Link from "next/link";


export default function NewFeeCategoryPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black">
            New Fee Category
          </h1>

          <p className="text-slate-500 mt-2">
            Create a new school fee category.
          </p>

        </div>

        <Link
          href="/admin/finance/categories"
          className="rounded-xl bg-slate-200 px-5 py-2"
        >
          Back
        </Link>

      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

        <FeeCategoryForm />

      </div>

    </div>
  );
}