import { Prisma } from "@prisma/client";

interface CategoryItem {
  category: string;
  _sum: {
    amount: Prisma.Decimal | null;
  };
}

interface Props {
  incomeByCategory: CategoryItem[];
  expenseByCategory: CategoryItem[];
}

const FinancialCategoryBreakdown = ({
  incomeByCategory,
  expenseByCategory,
}: Props) => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {/* Income Breakdown */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold">
          Income Breakdown
        </h2>

        <div className="space-y-4">

          {incomeByCategory.length > 0 ? (
            incomeByCategory.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between"
              >
                <span className="text-gray-600">
                  {item.category}
                </span>

                <span className="font-bold text-green-600">
                  ₦
                  {Number(item._sum.amount ?? 0).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">
              No income records available.
            </p>
          )}

        </div>

      </div>

      {/* Expense Breakdown */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold">
          Expense Breakdown
        </h2>

        <div className="space-y-4">

          {expenseByCategory.length > 0 ? (
            expenseByCategory.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between"
              >
                <span className="text-gray-600">
                  {item.category}
                </span>

                <span className="font-bold text-red-600">
                  ₦
                  {Number(item._sum.amount ?? 0).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">
              No expense records available.
            </p>
          )}

        </div>

      </div>

    </div>
  );
};

export default FinancialCategoryBreakdown;