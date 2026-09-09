"use client";
import { createCategory, updateCategory } from "@/app/(dashboard)/admin/finance/categories/actions";

interface FeeCategoryFormProps {
  category?: {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
  };
}

export default function FeeCategoryForm({
  category,
}: FeeCategoryFormProps) {

  // Handle submission via onSubmit to safely capture server action responses
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (category) {
      await updateCategory(category.id, formData);
    } else {
      await createCategory(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-6"
    >
      <div>
        <label className="block text-sm font-semibold mb-2">
          Category Name
        </label>
        <input
          name="name"
          type="text"
          defaultValue={category?.name}
          placeholder="School Fees"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Description
        </label>
        <textarea
          name="description"
          rows={4}
          defaultValue={category?.description ?? ""}
          placeholder="Description..."
          className="w-full rounded-2xl border border-slate-300 px-4 py-3"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="active"
          name="isActive"
          type="checkbox"
          defaultChecked={category?.isActive ?? true}
        />
        <label htmlFor="active">
          Active Category
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-2xl bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700"
        >
          {category ? "Update Category" : "Create Category"}
        </button>
      </div>
    </form>
  );
}