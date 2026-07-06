// src/app/dashboard/parent/billing/verify/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface VerifyPageProps {
  searchParams: {
    reference?: string;
  };
}

export default async function PaymentVerificationPage({ searchParams }: VerifyPageProps) {
  const referenceCode = searchParams.reference;

  if (!referenceCode) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-gray-100 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">!</div>
        <h3 className="text-base font-bold text-gray-900">Missing Reference</h3>
        <p className="text-xs text-gray-500">No transaction tracking reference was provided for verification validation parameters.</p>
        <Link href="/dashboard/parent/billing" className="inline-block text-xs font-semibold bg-gray-900 text-white px-4 py-2 rounded-xl">
          Return to Billing
        </Link>
      </div>
    );
  }

  // Poll the database to verify if the webhook has updated the status to SUCCESS
  const paymentLog = await prisma.paymentRecord.findUnique({
    where: { reference: referenceCode },
    include: {
      balance: {
        include: {
          allocation: {
            include: { category: true }
          }
        }
      }
    }
  });

  const isVerifiedSuccess = paymentLog?.status === "SUCCESS";

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white border border-gray-100 rounded-3xl shadow-sm text-center space-y-6">
      {isVerifiedSuccess ? (
        <>
          <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto text-2xl">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-900">Payment Processed!</h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Your transaction was verified successfully. The student account balance ledger has been updated instantly.
            </p>
          </div>

          <div className="bg-gray-50 border p-4 rounded-xl text-left space-y-1.5 font-medium text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Fee Category:</span>
              <span className="text-gray-800 font-bold">{paymentLog?.balance.allocation.category.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount Settled:</span>
              <span className="text-green-600 font-bold">₦{Number(paymentLog?.amountPaid).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Receipt Ref:</span>
              <span className="text-gray-600 font-mono tracking-tight">{paymentLog?.reference}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto animate-pulse text-2xl">
            ⟳
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Confirming Payment...</h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              We are waiting for the final confirmation ping from Paystack. Please refresh this page in a few moments to sync your records.
            </p>
          </div>
        </>
      )}

      <div className="pt-2">
        <Link
          href="/dashboard/parent/billing"
          className="block w-full text-center py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
        >
          Go Back to Ledger Overview
        </Link>
      </div>
    </div>
  );
}