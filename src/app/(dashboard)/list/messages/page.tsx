import FormContainer from "@/components/FormContainer";
import MessageListClient from "@/components/MessageListClient";
import { Filter } from "lucide-react";

// In a real app, you'd fetch this from Prisma:
// const mockMessages = await prisma.message.findMany();
const mockMessages = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    avatar: "/teacher1.png",
    lastMessage: "The Physics lab report is due by Friday evening.",
    time: "10:24 AM",
    isRead: false,
    online: true,
  },
  {
    id: 2,
    name: "James Wilson (Grade 10-A)",
    avatar: "/student1.png",
    lastMessage: "Thank you for the feedback on my math assignment!",
    time: "Yesterday",
    isRead: true,
    online: false,
  },
  {
    id: 3,
    name: "School Administration",
    avatar: "/admin.png",
    lastMessage: "Reminder: Parent-Teacher meeting this Saturday.",
    time: "Oct 24",
    isRead: true,
    online: true,
  },
];

const MessageListPage = () => {
  return( 
    <div>
 <div className="flex items-center gap-3">
          <button className="group p-4 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:text-indigo-600 transition-all duration-300">
            <Filter size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
          <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
             <FormContainer table="message" type="create" />
          </div>
        </div>
   <MessageListClient initialMessages={mockMessages} />;
    </div>
   
  )
};

export default MessageListPage;