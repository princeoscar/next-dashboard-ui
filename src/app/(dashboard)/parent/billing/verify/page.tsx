import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";

interface VerifyPageProps {
  searchParams: Promise<{
    reference?: string;
  }>;
}

export default async function PaymentVerificationPage({
  searchParams,
}: VerifyPageProps) {
  const { reference } = await searchParams;

  if (!reference) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 text-center">
        Missing payment reference.
      </div>
    );
  }

  const { userId } = await auth();

  if (!userId) notFound();

  const paymentLog = await prisma.paymentRecord.findUnique({
    where: {
      reference,
    },
    include: {
      balance: {
        include: {
          student: {
            include: {
              parent: true,
            },
          },
          allocation: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!paymentLog) notFound();

  if (paymentLog.balance.student.parent?.clerkId !== userId) {
    notFound();
  }

  const isVerifiedSuccess = paymentLog.status === "FULLY_PAID";

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl">
      {isVerifiedSuccess ? (
        <>
          <h2 className="text-xl font-bold mb-6">Payment Successful</h2>

          <p>
            <strong>Category:</strong>{" "}
            {paymentLog.balance.allocation.category.name}
          </p>

          <p>
            <strong>Amount:</strong> ₦
            {Number(paymentLog.amountPaid).toLocaleString()}
          </p>

          <p>
            <strong>Reference:</strong> {paymentLog.reference}
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-6">
            Payment Confirmation Pending
          </h2>

          <p>Please refresh this page in a few moments.</p>
        </>
      )}

      <Link
        href={`/parent/billing?studentId=${paymentLog.balance.studentId}`}
        className="mt-8 inline-block bg-black text-white px-4 py-2 rounded-xl"
      >
        Back to Billing
      </Link>
    </div>
  );
}