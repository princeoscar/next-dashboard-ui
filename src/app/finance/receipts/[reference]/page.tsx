
// src/app/finance/receipts/[reference]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PrintableReceiptInvoice({ params }: { params: Promise<{ reference: string }> }) {
  const receipt = await prisma.paymentRecord.findUnique({
    where: { reference: (await params).reference },
    include: {
      balance: {
        include: {
          allocation: { include: { category: true } }
        }
      }
    }
  });

  if (!receipt || receipt.status !== "SUCCESS") {
    return notFound();
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-white border border-gray-200 shadow-sm rounded-xl print:border-0 print:shadow-none print:my-0 print:p-0">
      
      {/* Receipt Header Branding */}
      <div className="flex justify-between items-start border-b pb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">EXCEL ACADEMY</h1>
          <p className="text-[10px] text-gray-400 font-medium">Official Digital Transaction Ledger Receipt</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
            PAID
          </span>
          <p className="text-[10px] text-gray-400 mt-2 font-mono">{receipt.paidAt.toLocaleString()}</p>
        </div>
      </div>

      {/* Transaction Metadata Mapping Grid */}
      <div className="grid grid-cols-2 gap-4 my-6 text-xs border-b pb-6">
        <div>
          <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Billed To Profile</span>
          <p className="font-bold text-gray-800">Student Ref: {receipt.balance.studentId}</p>
          <p className="text-gray-500 font-medium text-[11px]">Academic Term: {receipt.balance.allocation.term}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Payment Channel Information</span>
          <p className="font-bold text-gray-800">Gateway: {receipt.paymentMethod}</p>
          <p className="font-mono text-gray-500 text-[11px] tracking-tight">Ref: {receipt.reference}</p>
        </div>
      </div>

      {/* Financial Settlement Statements Table */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Account Ledger Breakdown</h3>
        <div className="border rounded-xl overflow-hidden text-xs">
          <div className="grid grid-cols-3 bg-gray-50 p-3 font-bold text-gray-500 border-b">
            <div>Description</div>
            <div className="text-center">Payment Term</div>
            <div className="text-right">Amount Settled</div>
          </div>
          <div className="grid grid-cols-3 p-3 font-medium text-gray-800 border-b">
            <div className="font-bold text-gray-950">{receipt.balance.allocation.category.name}</div>
            <div className="text-center text-gray-500">{receipt.balance.allocation.academicYear}</div>
            <div className="text-right font-bold text-green-600">₦{Number(receipt.amountPaid).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Remaining Ledger Balance Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border flex justify-between items-center text-xs">
        <div>
          <h4 className="font-bold text-gray-800">Outstanding Balance Sheet Status</h4>
          <p className="text-[10px] text-gray-400">Total remaining balance due for this fee allocation.</p>
        </div>
        <div className="text-right">
          <span className="text-base font-black text-gray-900">
            ₦{Number(receipt.balance.outstanding).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Printable Execution Actions UI Trigger */}
      <div className="mt-8 flex justify-center print:hidden">
        <button
          onClick={() => window.print()}
          className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all transition-colors cursor-pointer"
        >
          Print Hardcopy Receipt
        </button>
      </div>

    </div>
  );
}