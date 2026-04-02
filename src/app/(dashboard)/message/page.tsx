import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";

const MessagesPage = async () => {
  const { userId } = await auth();

  // Fetch conversations where the user is either the sender or receiver
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId! },
        { receiverId: userId! }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    // We group them by contact in a real app, but for now, let's show the list
    take: 20 
  });

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[500px]">
      <div className="mb-8">
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Messages</h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inbox & Sent</p>
      </div>

      <div className="flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
             <Image src="/no-messages.png" alt="Empty" width={80} height={80} />
             <p className="text-xs font-bold uppercase tracking-widest mt-4">No conversations yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-slate-700">{msg.content}</p>
                <span className="text-[9px] text-slate-300 font-black italic">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesPage;