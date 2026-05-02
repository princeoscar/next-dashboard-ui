"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { 
  deleteAnnouncement, 
  deleteAssignment, 
  deleteClass, 
  deleteEvent, 
   deleteExam, 
  deleteParent, 
  deleteResult, 
  deleteStudent, 
  deleteSubject, 
  deleteTeacher,
  deleteLevel, 
} from "@/lib/actions";

// 1. Action Map for Deletions
const deleteActionMap: any = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
   exam: deleteExam,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  result: deleteResult,
  parent: deleteParent,
  assignment: deleteAssignment,
  level: deleteLevel,
};

// 2. Dynamic Imports
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), { loading: () => <h1>Loading...</h1> });
const StudentForm = dynamic(() => import("./forms/StudentForm"), { loading: () => <h1>Loading...</h1> });
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), { loading: () => <h1>Loading...</h1> });
const ClassForm = dynamic(() => import("./forms/ClassForm"), { loading: () => <h1>Loading...</h1> });
const ExamForm = dynamic(() => import("./forms/ExamForm"), { loading: () => <h1>Loading...</h1> });
const MessageForm = dynamic(() => import("./forms/MessageForm"), { loading: () => <h1>Loading...</h1> });
const ParentForm = dynamic(() => import("./forms/ParentForm"), { loading: () => <h1>Loading...</h1> });
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), { loading: () => <h1>Loading...</h1> });
const EventForm = dynamic(() => import("./forms/EventForm"), { loading: () => <div>Loading...</div> });

const ResultForm = dynamic(() => import("./forms/ResultForm"), { loading: () => <div>Loading...</div> });
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), { loading: () => <div>Loading...</div> });
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), { loading: () => <div>Loading...</div> });
// const LevelForm = dynamic(() => import("./forms/LevelForm"), { loading: () => <h1>Loading...</h1> });
const AdminForm = dynamic(() => import("./forms/AdminForm"), { 
  loading: () => <h1>Loading...</h1> 
});
// 3. Form Mapping
const forms: {
  [key: string]: (setOpen: Dispatch<SetStateAction<boolean>>, type: "create" | "update", data?: any, relatedData?: any) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  class: (setOpen, type, data, relatedData) => <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  teacher: (setOpen, type, data, relatedData) => <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  student: (setOpen, type, data, relatedData) => <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  exam: (setOpen, type, data, relatedData) => <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  message: (setOpen, type, data, relatedData) => <MessageForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  parent: (setOpen, type, data, relatedData) => <ParentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  assignment: (setOpen, type, data, relatedData) => <AssignmentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  event: (setOpen, type, data, relatedData) => <EventForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  result: (setOpen, type, data, relatedData) => <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  attendance: (setOpen, type, data, relatedData) => <AttendanceForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  announcement: (setOpen, type, data, relatedData) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  // level: (setOpen, type, data) => <LevelForm type={type} data={data} setOpen={setOpen} />,
   admin: (setOpen, type, data, relatedData) => <AdminForm type={type} data={data} setOpen={setOpen} />,
};

const FormModal = ({ table, type, data, id, relatedData }: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = type === "create" ? "bg-rubixYellow" : type === "update" ? "bg-rubixSky" : "bg-rubixPurple";
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [state, deleteAction] = useActionState(deleteActionMap[table] || (() => {}), {
    success: false,
    error: false,
    message: "",
  });

  useEffect(() => {
  // 1. Check if state even exists first
  if (state) {
    if (state.success) {
      toast.success(`${table} has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
    
    // 2. Safely check for error only if state exists
    if (state.error) {
      toast.error("Something went wrong!");
    }
  }
}, [state, router, type, table]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [open]);

  return (
    <>
      <button 
        className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:scale-110 transition-transform`} 
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {open && (
        <div 
          className="w-full h-screen fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4"
          onClick={() => setOpen(false)} // 🎯 Closes when clicking background
        >
         <div 
  className="bg-white p-4 rounded-md relative w-[95vw] md:w-[90vw] lg:w-[1000px] max-h-[95vh] overflow-y-auto"
  onClick={(e) => e.stopPropagation()}
>
            {/* CLOSE BUTTON (X) */}
            <div
              className="absolute top-5 right-5 z-50 p-2 bg-slate-50 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>

            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {type === "delete" && id ? (
                <form action={deleteAction} className="flex flex-col gap-6 py-6">
                  <input type="hidden" name="id" value={id} />
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Confirm Deletion</h2>
                    <p className="text-slate-500 text-sm">
                      Are you sure you want to delete this {table}? This action cannot be undone.
                    </p>
                  </div>
                  <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-2xl w-full transition-all shadow-lg active:scale-95">
                    Delete Permanently
                  </button>
                </form>
              ) : (type === "create" || type === "update") ? (
                forms[table] ? (
                  forms[table](setOpen, type, data, relatedData)
                ) : (
                  <div className="p-10 text-center text-slate-400 italic">Form container is ready, but {table} form is missing.</div>
                )
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;