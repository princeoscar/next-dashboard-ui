import { prisma } from "@/lib/prisma"; 
import FormContainer from "@/components/FormContainer";
import MessageListClient from "@/components/MessageListClient";
import { Filter, Mail } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

const MessageListPage = async () => {
  const { userId } = await auth();
  
  // 1. FETCH RECIPIENTS
  // Fetching users so the 'Create' form knows who you can message
  const users = await prisma.user.findMany({
  where: {
    id: { not: userId! } // 👈 Prevents messaging yourself
  },
  select: { 
    id: true, 
    username: true,
  },
});

  // 2. FETCH MESSAGES
  const realMessages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId! },
        { receiverId: userId! }
      ]
    },
    include: {
      sender: { 
        select: { 
          username: true, 
          img: true 
        } 
      },
      receiver: { 
        select: { 
          username: true, 
          img: true 
        } 
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100 min-h-[700px]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
            <Mail size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">Messages</h1>
            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Inbox & Conversations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button className="group p-4 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:text-indigo-600 transition-all duration-300">
            <Filter size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
          
          <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
             <FormContainer table="message" type="create" relatedData={{ receivers: users }}/>
          </div>
        </div>
      </div>

      {/* 3. CLIENT-SIDE LIST HANDLING */}
      {/* This component will handle the mapping, searching, and empty states */}
      <div className="bg-slate-50/50 rounded-[2rem] p-2 border border-slate-50">
        <MessageListClient 
          initialMessages={realMessages} 
          currentUserId={userId!}
        />
      </div>
    </div>
  );
};

export default MessageListPage;