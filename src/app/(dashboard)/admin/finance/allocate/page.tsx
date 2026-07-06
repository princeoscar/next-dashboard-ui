import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function FeeAllocationPage() {
  const classes = await prisma.class.findMany();
  const categories = await prisma.feeCategory.findMany();

  async function handleAllocate(formData: FormData) {
  "use server";
  
  // 1. Convert IDs to Numbers
  const classIdString = formData.get("classId") as string;
  const classId = parseInt(classIdString); // Convert to number
  
  const categoryId = parseInt(formData.get("categoryId") as string);
  const amount = parseFloat(formData.get("amount") as string);

  // 2. Now these queries will accept the number type
  const students = await prisma.student.findMany({ 
    where: { classId: classId } 
  });

  const allocation = await prisma.feeAllocation.create({
    data: { 
      feeCategoryId: categoryId, 
      levelId: classId, // This is now a number
      amount, 
      term: "FIRST", 
      academicYear: "2026/2027" 
    }
  });

    // 3. Create a balance record for every student in the class
    for (const student of students) {
      await prisma.studentBalance.create({
        data: {
          studentId: student.id,
          feeAllocationId: allocation.id,
          totalAssigned: amount,
          outstanding: amount,
          paidAmount: 0,
          status: "UNPAID"
        }
      });
    }
    revalidatePath("/admin/finance/balances");
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-xl font-bold mb-6">Allocate Fees to Class</h1>
      <form action={handleAllocate} className="space-y-4">
        <select name="categoryId" className="w-full border p-2">
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="classId" className="w-full border p-2">
          {classes.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
        </select>
        <input name="amount" type="number" placeholder="Amount (e.g. 45000)" className="w-full border p-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2">Allocate Fees</button>
      </form>
    </div>
  );
}