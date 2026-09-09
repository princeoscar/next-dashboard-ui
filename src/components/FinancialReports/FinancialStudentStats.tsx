interface Props {
  paid: number;
  partial: number;
  unpaid: number;
}

const FinancialStudentStats = ({
  paid,
  partial,
  unpaid,
}: Props) => {
  return (
    <div className="grid gap-5 lg:grid-cols-3">

      <div className="rounded-2xl border bg-white p-6">

        <p className="text-gray-500 text-sm">
          Fully Paid Students
        </p>

        <h2 className="mt-3 text-4xl font-black text-green-600">
          {paid}
        </h2>

      </div>

      <div className="rounded-2xl border bg-white p-6">

        <p className="text-gray-500 text-sm">
          Partially Paid
        </p>

        <h2 className="mt-3 text-4xl font-black text-yellow-500">
          {partial}
        </h2>

      </div>

      <div className="rounded-2xl border bg-white p-6">

        <p className="text-gray-500 text-sm">
          Outstanding Students
        </p>

        <h2 className="mt-3 text-4xl font-black text-red-600">
          {unpaid}
        </h2>

      </div>

    </div>
  );
};

export default FinancialStudentStats;