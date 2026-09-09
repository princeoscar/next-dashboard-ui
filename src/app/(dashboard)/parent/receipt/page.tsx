import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PrintButton from "@/components/PrintButton";

interface ReceiptPageProps {
    searchParams: Promise<{
        studentBalanceId?: string;
    }>;
}

export default async function ParentReceiptPage({
    searchParams,
}: ReceiptPageProps) {
    const { userId } = await auth();

    console.log("Receipt page loaded");

   if (!userId) {
  return <div>No user</div>;
}

    const { studentBalanceId } = await searchParams;

if (!studentBalanceId) {
  return <div>No studentBalanceId</div>;
}

const receipt = await prisma.studentBalance.findUnique({
  where: {
    id: Number(studentBalanceId),
  },
  include: {
    student: {
      include: {
        class: true,
        parent: true,
      },
    },
    allocation: {
      include: {
        category: true,
        academicYear: true,
      },
    },
    paymentRecords: {
      orderBy: {
        createdAt: "desc",
      },
    },
  },
});

   if (!receipt) {
  return <div>Receipt not found</div>;
}

    if (receipt.student.parent?.clerkId !== userId) {
    return <div>Parent mismatch</div>;
}

   const latestPayment = receipt.paymentRecords[0];

    if (!latestPayment) {
    return <div>No payment record</div>;
}

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-6">

            <div className="flex justify-between items-center print:hidden">
                <Link
                    href={`/parent/billing?studentId=${receipt.studentId}`}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300"
                >
                    ← Back
                </Link>

                <PrintButton />
            </div>

            <div className="bg-white rounded-3xl shadow border p-10">

                <div className="border-b pb-6 mb-8">
                    <h1 className="text-3xl font-black">
                        PAYMENT RECEIPT
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Official School Payment Receipt
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    <div className="space-y-3">

                        <h3 className="font-bold text-lg">
                            Student Information
                        </h3>

                        <p>
                            <strong>Name:</strong>{" "}
                            {receipt.student.name} {receipt.student.surname}
                        </p>

                        <p>
                            <strong>Class:</strong>{" "}
                            {receipt.student.class?.name}
                        </p>

                        <p>
                            <strong>Parent:</strong>{" "}
                            {receipt.student.parent?.firstName}{" "}
                            {receipt.student.parent?.lastName}
                        </p>

                    </div>

                    <div className="space-y-3">

                        <h3 className="font-bold text-lg">
                            Payment Information
                        </h3>

                        <p>
                            <strong>Fee:</strong>{" "}
                            {receipt.allocation.category.name}
                        </p>

                        <p>
                            <strong>Academic Year:</strong>{" "}
                            {receipt.allocation.academicYear.name}
                        </p>

                        <p>
                            <strong>Term:</strong>{" "}
                            {receipt.allocation.term}
                        </p>

                    </div>

                </div>

                <div className="mt-10 border rounded-2xl overflow-hidden">

                    <table className="w-full">

                        <tbody>

                            <tr className="border-b">
                                <td className="p-4 font-semibold">
                                    Receipt No
                                </td>
                                <td className="p-4">
                                   {latestPayment.receiptNumber ?? latestPayment.reference}
                                </td>
                            </tr>

                            <tr className="border-b">
                                <td className="p-4 font-semibold">
                                    Amount Paid
                                </td>
                                <td className="p-4 text-green-600 font-black">
                                    ₦{Number(latestPayment.amountPaid).toLocaleString()}
                                </td>
                            </tr>

                            <tr className="border-b">
                                <td className="p-4 font-semibold">
                                    Payment Date
                                </td>
                                <td className="p-4">
                            {latestPayment.paymentDate.toLocaleString()}
                                </td>
                            </tr>

                            <tr className="border-b">
                                <td className="p-4 font-semibold">
                                    Payment Status
                                </td>
                                <td className="p-4">
                                    {latestPayment.status}
                                </td>
                            </tr>

                            <tr>
                                <td className="p-4 font-semibold">
                                    Outstanding Balance
                                </td>
                                <td className="p-4 text-red-600 font-bold">
                                    ₦{Number(receipt.outstanding).toLocaleString()}
                                </td>
                            </tr>

                        </tbody>

                    </table>

                </div>

                <div className="mt-10 text-center text-xs text-gray-400">
                    This is a computer-generated receipt and does not require a signature.
                </div>

            </div>

        </div>
    );
}