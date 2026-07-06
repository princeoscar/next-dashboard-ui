import { prisma } from "@/lib/prisma";

export default async function ReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  // 1. Convert string param to number to match your schema's Int ID
  const paymentId = parseInt((await params).paymentId);

  // 2. Fetch with the correct relation path: Payment -> StudentBalance -> Student
  const payment = await prisma.paymentRecord.findUnique({
    where: { id: paymentId },
    include: { 
      allocation: { include: { category: true } },
      balance: { 
        include: { 
          student: true // This navigates through StudentBalance to get the Student
        } 
      }
    }
  });

  if (!payment) return <div>Record not found</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto bg-white border print:border-none">
      <h2 className="text-2xl font-bold uppercase border-b pb-2">Official Receipt</h2>
      <div className="mt-4 space-y-2">
        {/* Accessing student via the balance relation */}
        <p><strong>Student:</strong> {payment.balance.student?.name} {payment.balance.student?.surname}</p>
        <p><strong>Category:</strong> {payment.allocation.category.name}</p>
        <p className="text-xl font-black mt-4">
          Amount Paid: ₦{Number(payment.amountPaid).toLocaleString()}
        </p>
      </div>
      <button onClick={() => window.print()} className="mt-6 bg-black text-white px-6 py-2 print:hidden">
        Print Receipt
      </button>
    </div>
  );
}