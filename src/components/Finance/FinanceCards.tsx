import Image from "next/image";

interface FinanceCardsProps {
  expectedFees: number;
  totalPaid: number;
  outstanding: number;
  totalDiscount: number;
  totalRevenue: number;
  netIncome: number;
  paymentsToday: number;
  debtors: number;
}

const FinanceCards = ({
  expectedFees,
  totalPaid,
  outstanding,
  totalDiscount,
  totalRevenue,
  netIncome,
  paymentsToday,
  debtors,
}: FinanceCardsProps) => {
  const cards = [
    {
      title: "Expected Fees",
      value: expectedFees,
      icon: "/finance/expected.png",
    },
    {
      title: "Total Paid",
      value: totalPaid,
      icon: "/finance/paid.png",
    },
    {
      title: "Outstanding",
      value: outstanding,
      icon: "/finance/outstanding.png",
    },
    {
      title: "Discounts",
      value: totalDiscount,
      icon: "/finance/discount.png",
    },
    {
      title: "Revenue",
      value: totalRevenue,
      icon: "/finance/revenue.png",
    },
    {
      title: "Net Income",
      value: netIncome,
      icon: "/finance/income.png",
    },
    {
      title: "Today's Payments",
      value: paymentsToday,
      icon: "/finance/today.png",
    },
    {
      title: "Debtors",
      value: debtors,
      icon: "/finance/debtors.png",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm text-gray-500 font-medium">
              {card.title}
            </h3>

            <Image
              src={card.icon}
              alt={card.title}
              width={22}
              height={22}
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            ₦{card.value.toLocaleString()}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default FinanceCards;