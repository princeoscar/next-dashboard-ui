import {prisma} from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Mail, Send, User } from "lucide-react";

const MessagesPage = async () => {
  const { userId } = await auth();

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId! }, { receiverId: userId! }],
    },
    include: {
      // Include names so we know who is talking
      sender: { select: { username: true, img: true } },
    receiver: { select: { username: true, img: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[600px]">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-rubixPurple/10 text-rubixPurple rounded-2xl">
          <Mail size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            Message Center
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Secure Communications
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 italic">
            <Mail size={48} className="text-slate-300 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Your inbox is empty
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSentByMe = msg.senderId === userId;
            const contact = isSentByMe ? msg.receiver : msg.sender;

            return (
              <div
                key={msg.id}
                className={`p-5 rounded-[1.5rem] border transition-all hover:border-slate-200 cursor-pointer flex items-center justify-between group ${
                  isSentByMe ? "bg-slate-50/50 border-slate-100" : "bg-white border-slate-100 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-xl ${isSentByMe ? "bg-slate-200 text-slate-500" : "bg-rubixSky/10 text-rubixSky"}`}>
                    {isSentByMe ? <Send size={16} /> : <User size={16} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                        {isSentByMe ? `To: ${contact.username}` : contact.username} 
                      </span>
                      {!isSentByMe && (
                         <span className="w-1.5 h-1.5 bg-rubixSky rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1 group-hover:line-clamp-none">
                      {msg.content}
                    </p>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-[9px] text-slate-300 font-black uppercase tracking-tighter italic">
                    {new Intl.DateTimeFormat("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short"
                    }).format(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessagesPage;