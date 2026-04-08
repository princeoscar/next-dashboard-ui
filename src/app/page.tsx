import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Homepage() {
  const { userId, sessionClaims } = await auth();

  // 1. If the user is logged in, immediately find their role and send them to their dashboard
  if (userId) {
    const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();
    
    if (role) {
      redirect(`/${role}`);
    } else {
      // Fallback if user exists but has no role assigned yet
      redirect("/admin"); 
    }
  }

  // 2. If NOT logged in, show the Landing Page UI
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
          Rubix <span className="text-indigo-600">Schools</span>
        </h1>
        <p className="text-slate-500 text-lg mb-8 font-medium">
          The next-generation academic orchestration platform. 
          Manage students, teachers, and campus life with precision.
        </p>
        
        <div className="flex gap-4 justify-center">
          <a 
            href="/sign-in" 
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            Enter Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}