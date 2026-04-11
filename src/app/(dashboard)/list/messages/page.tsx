import {prisma} from "@/lib/prisma"; // Use your actual prisma client
import FormContainer from "@/components/FormContainer";
import MessageListClient from "@/components/MessageListClient";
import { Filter } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

// MARK THE COMPONENT AS ASYNC
const MessageListPage = async () => {
  const { userId } = await auth();
  
  // 1. FETCH REAL RECIPIENTS FOR THE FORM
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true },
  });

  // 2. FETCH REAL MESSAGES FROM THE DATABASE
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
      username: true, // ✅ Must be exactly the same as the type above
        img: true // ✅ Must be exactly the same as the type above
      } 
    },
    receiver: { 
      select: { 
      username: true, // ✅ Must be exactly the same as the type above 
        img: true // ✅ Must be exactly the same as the type above
      } 
    },
  },
  orderBy: { createdAt: "desc" },
});

  return (
    <div className="p-4 flex-1">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-xs text-gray-400">Manage your conversations</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="group p-4 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:text-indigo-600 transition-all duration-300">
            <Filter size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
          
          {/* THE NEW MESSAGE BUTTON */}
          <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
             <FormContainer table="message" type="create" relatedData={{ users }}/>
          </div>
        </div>
      </div>

      {/* 3. PASS REAL DATA TO THE CLIENT LIST */}
      <MessageListClient 
      initialMessages={realMessages} 
      currentUserId={userId!}
      />
    </div>
  );
};

export default MessageListPage;