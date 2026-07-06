// // src/app/test-billing/page.tsx
// import { prisma } from "@/lib/prisma";
// import PaymentButton from "@/components/Finance/PaymentButton";

// export default async function TestBillingDashboard({ searchParams }: { searchParams: { studentId: string } }) {
//   const financialStatements = await prisma.studentBalance.findMany({
//     where: { studentId: searchParams.studentId },
//     include: {
//       allocation: {
//         include: { category: true }
//       }
//     }
//   });

//   return (
//     <div className="space-y-6 max-w-5xl mx-auto p-4 pt-12">
//       <div>
//         <h2 className="text-xl font-extrabold text-gray-900">School Ledger Accounts (Sandbox Sandbox Test)</h2>
//         <p className="text-xs text-gray-400">View real-time statements, invoice breakdown sheets, and complete unpaid balances.</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {financialStatements.map((invoice) => {
//           const outstanding = Number(invoice.outstanding);
//           const paid = Number(invoice.paidAmount);
          
//           return (
//             <div key={invoice.id} className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
//               <div>
//                 <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
//                   invoice.status === "FULLY_PAID" ? "bg-green-50 text-green-700" :
//                   invoice.status === "PARTIAL" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
//                 }`}>
//                   {invoice.status}
//                 </span>
//                 <h4 className="font-bold text-gray-800 text-sm mt-3">{invoice.allocation.category.name}</h4>
//                 <p className="text-[11px] text-gray-400 font-medium">{invoice.allocation.term} Term • {invoice.allocation.academicYear}</p>
//               </div>

//               <div className="border-t pt-3 space-y-1.5">
//                 <div className="flex justify-between text-xs">
//                   <span className="text-gray-400">Total Charged:</span>
//                   <span className="font-semibold text-gray-700">₦{Number(invoice.totalAssigned).toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-xs">
//                   <span className="text-gray-400">Paid So Far:</span>
//                   <span className="font-bold text-green-600">₦{paid.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-xs border-t pt-1.5">
//                   <span className="font-medium text-gray-900">Balance Owed:</span>
//                   <span className="font-black text-red-600">₦{outstanding.toLocaleString()}</span>
//                 </div>
//               </div>

//               {outstanding > 0 && (
//                 <PaymentButton studentBalanceId={invoice.id} parentEmail="parent@example.com" />
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }