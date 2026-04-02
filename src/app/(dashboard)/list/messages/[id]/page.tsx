import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Clock } from "lucide-react";

const SingleMessagePage = async (props: { 
  params: Promise<{ id: string }> 
}) => {
  // 1. Properly await params for Next.js 15
  const params = await props.params;
  const id = parseInt(params.id);
  
  // Safety check: if ID isn't a number, 404 immediately
  if (isNaN(id)) return notFound();

  const { userId } = await auth();
  if (!userId) return notFound();

  // 2. Fetch data
  const message = await prisma.message.findUnique({
    where: { id },
    include: {
      sender: true, 
    },
  });

  // 3. Security & Existence Check
  // If the message doesn't exist OR you aren't part of the conversation -> 404
  if (!message || (message.receiverId !== userId && message.senderId !== userId)) {
    return notFound();
  }

  // 4. Mark as Read (Only if you are the receiver)
  if (!message.isRead && message.receiverId === userId) {
    await prisma.message.update({
      where: { id: message.id },
      data: { isRead: true },
    });
  }

  return (
    <div className="p-6 md:p-10 bg-[#F7F8FA] min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* TOP NAVIGATION */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/list/messages" 
            className="group w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-indigo-600 border border-slate-100"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Conversation</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Message Reference: #{message.id}</p>
          </div>
        </div>

        {/* MESSAGE CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-white">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-50">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                   {message.sender?.username || "Unknown User"}
                </h2>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Calendar size={14} />
                    {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Clock size={14} />
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
            <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100">
              {message.senderId === userId ? "Sent by you" : "Received"}
            </span>
          </div>

          <div className="relative pl-6">
             <div className="absolute left-0 top-0 w-1.5 h-full bg-indigo-500 rounded-full opacity-20" />
             <div className="text-slate-600 leading-[1.8] text-lg font-medium whitespace-pre-wrap">
               {message.content}
             </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium italic">
              Encrypted communication.
            </p>
            <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleMessagePage;