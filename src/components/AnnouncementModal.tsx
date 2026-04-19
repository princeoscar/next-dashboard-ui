"use client";

import { X, Calendar, Bell } from "lucide-react";

interface AnnouncementModalProps {
  announcement: {
    title: string;
    description: string;
    date: Date;
    class?: { name: string } | null;
  } | null;
  onClose: () => void;
}

const AnnouncementModal = ({ announcement, onClose }: AnnouncementModalProps) => {
  if (!announcement) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex gap-4">
            <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 leading-tight">
                {announcement.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {announcement.class?.name || "School Wide"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8">
          <div className="flex items-center gap-2 text-slate-400 mb-6">
            <Calendar size={16} />
            <span className="text-xs font-bold uppercase tracking-tight">
              Posted on {new Intl.DateTimeFormat("en-GB", { dateStyle: 'long' }).format(new Date(announcement.date))}
            </span>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed font-medium">
              {announcement.description}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;