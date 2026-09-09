type Transaction = {
  id: string;
  type: "PAYMENT" | "INCOME" | "EXPENSE";
  title: string;
  subtitle: string;
  amount: number;
  date: Date;
};

interface Props {
  transactions: Transaction[];
}

const badgeColor = {
  PAYMENT: "bg-blue-100 text-blue-700",
  INCOME: "bg-green-100 text-green-700",
  EXPENSE: "bg-red-100 text-red-700",
};

const RecentTransactions = ({
  transactions,
}: Props) => {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold">
        Recent Transactions
      </h2>

      <div className="space-y-4">
        {transactions.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b pb-4"
          >
            <div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor[item.type]}`}
              >
                {item.type}
              </span>

              <h3 className="mt-2 font-semibold">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500">
                {item.subtitle}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {item.date.toLocaleString()}
              </p>
            </div>

            <span
              className={`text-lg font-bold ${
                item.type === "EXPENSE"
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {item.type === "EXPENSE" ? "-" : "+"}₦
              {item.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;