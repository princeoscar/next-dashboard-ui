interface Props {
  income: number;
  expenses: number;
  profit: number;
}

const FinancialBreakdown = ({
  income,
  expenses,
  profit,
}: Props) => {
  return (
    <div className="grid gap-5 lg:grid-cols-3">

      <div className="rounded-2xl border bg-green-50 p-6">
        <p className="text-sm text-gray-500">
          Total Income
        </p>

        <h2 className="mt-3 text-3xl font-black text-green-700">
          ₦{income.toLocaleString()}
        </h2>
      </div>

      <div className="rounded-2xl border bg-red-50 p-6">
        <p className="text-sm text-gray-500">
          Total Expenses
        </p>

        <h2 className="mt-3 text-3xl font-black text-red-600">
          ₦{expenses.toLocaleString()}
        </h2>
      </div>

      <div className="rounded-2xl border bg-blue-50 p-6">
        <p className="text-sm text-gray-500">
          Net Profit
        </p>

        <h2 className="mt-3 text-3xl font-black text-blue-700">
          ₦{profit.toLocaleString()}
        </h2>
      </div>

    </div>
  );
};

export default FinancialBreakdown;