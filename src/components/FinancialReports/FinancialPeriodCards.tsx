interface Props {
  todayIncome: number;
  todayExpense: number;

  monthIncome: number;
  monthExpense: number;

  yearIncome: number;
  yearExpense: number;
}

const FinancialPeriodCards = ({
  todayIncome,
  todayExpense,
  monthIncome,
  monthExpense,
  yearIncome,
  yearExpense,
}: Props) => {
  const periods = [
    {
      title: "Today",
      income: todayIncome,
      expense: todayExpense,
    },
    {
      title: "This Month",
      income: monthIncome,
      expense: monthExpense,
    },
    {
      title: "This Year",
      income: yearIncome,
      expense: yearExpense,
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-3">

      {periods.map((period) => (
        <div
          key={period.title}
          className="rounded-2xl border bg-white p-6"
        >
          <h3 className="mb-6 text-lg font-bold">
            {period.title}
          </h3>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span>Income</span>

              <span className="font-bold text-green-600">
                ₦{period.income.toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between">

              <span>Expenses</span>

              <span className="font-bold text-red-600">
                ₦{period.expense.toLocaleString()}
              </span>

            </div>

          </div>

        </div>
      ))}

    </div>
  );
};

export default FinancialPeriodCards;