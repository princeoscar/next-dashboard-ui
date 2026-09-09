interface Props {
  expectedFees: number;
  amountCollected: number;
  outstandingFees: number;
  totalPayments: number;
}

const FinancialSummaryCards = ({
  expectedFees,
  amountCollected,
  outstandingFees,
  totalPayments,
}: Props) => {
  const cards = [
    {
      title: "Expected Fees",
      value: expectedFees,
      color: "text-slate-800",
    },
    {
      title: "Amount Collected",
      value: amountCollected,
      color: "text-green-600",
    },
    {
      title: "Outstanding Fees",
      value: outstandingFees,
      color: "text-red-600",
    },
    {
      title: "Total Payments",
      value: totalPayments,
      isMoney: false,
      color: "text-rubixPurple",
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <p className="text-sm text-gray-500">
            {card.title}
          </p>

          <h2
            className={`mt-3 text-3xl font-black ${card.color}`}
          >
            {card.isMoney === false
              ? Number(card.value).toLocaleString()
              : `₦${Number(card.value).toLocaleString()}`}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default FinancialSummaryCards;