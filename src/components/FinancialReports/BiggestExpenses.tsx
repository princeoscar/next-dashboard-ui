type Expense = {
  id: number;
  title: string;
  amount: number;
  spentAt: Date;
};

interface Props {
  expenses: Expense[];
}

const BiggestExpenses = ({
  expenses,
}: Props) => {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold">
        Biggest Expenses
      </h2>

      <div className="space-y-5">
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No expenses found.
          </p>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between border-b pb-4 last:border-none"
            >
              <div>
                <h3 className="font-semibold">
                  {expense.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {new Date(
                    expense.spentAt
                  ).toLocaleDateString()}
                </p>
              </div>

              <span className="font-bold text-red-600">
                ₦
                {Number(expense.amount).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BiggestExpenses;