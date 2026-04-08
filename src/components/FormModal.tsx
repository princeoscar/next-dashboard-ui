"use client";

import { 
  deleteClass, deleteSubject, deleteTeacher, deleteStudent, 
  deleteExam, deleteParent, deleteAnnouncement, deleteEvent, 
  deleteResult, deleteAssignment, deleteLesson,
  deleteMessage
} from "@/lib/actions";
import { FormContainerProps } from "@/lib/types";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";


const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteSubject, // Check if this needs its own action
  event: deleteEvent,
  announcement: deleteAnnouncement,
  message: deleteMessage,
   // Check if this needs its own action
};

// Lazy Loading Imports
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), { loading: () => <h1>Loading...</h1> });
const StudentForm = dynamic(() => import("./forms/StudentForm"), { loading: () => <h1>Loading...</h1> });
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), { loading: () => <h1>Loading...</h1> });
const ClassForm = dynamic(() => import("./forms/ClassForm"), { loading: () => <h1>Loading...</h1> });
const ExamForm = dynamic(() => import("./forms/ExamForm"), { loading: () => <h1>Loading...</h1> });
const ParentForm = dynamic(() => import("./forms/ParentForm"), { loading: () => <h1>Loading...</h1> });
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), { loading: () => <h1>Loading...</h1> });
const EventForm = dynamic(() => import("./forms/EventForm"), { loading: () => <h1>Loading...</h1> });
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), { loading: () => <h1>Loading...</h1> });
const LessonForm = dynamic(() => import("./forms/LessonForm"), { loading: () => <h1>Loading...</h1> });
const ResultForm = dynamic(() => import("./forms/ResultForm"), { loading: () => <h1>Loading...</h1> });
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), { loading: () => <h1>Loading...</h1> });
const MessageForm = dynamic(() => import("./forms/MessageForm"), { loading: () => <h1>Loading...</h1> });


const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  class: (setOpen, type, data, relatedData) => <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  teacher: (setOpen, type, data, relatedData) => <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  student: (setOpen, type, data, relatedData) => <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  exam: (setOpen, type, data, relatedData) => <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  parent: (setOpen, type, data, relatedData) => <ParentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  announcement: (setOpen, type, data, relatedData) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  event: (setOpen, type, data, relatedData) => <EventForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  assignment: (setOpen, type, data, relatedData) => <AssignmentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  lesson: (setOpen, type, data, relatedData) => <LessonForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  result: (setOpen, type, data, relatedData) => <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  attendance: (setOpen, type, data, relatedData) => <AttendanceForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
   message: (setOpen, type, data,  relatedData) => ( <MessageForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Fix: Move useFormState outside of the nested Form() component
  const [state, formAction] = useFormState(deleteActionMap[table], {
    success: false,
    error: false,
  });

  useEffect(() => {
    if (state.success) {
      toast(`${table} has been deleted!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
       toast.error("Something went wrong!");
    }
  }, [state, router, table]);

  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = 
  type === "create" ? "bg-rubixYellow" : 
  type === "update" ? "bg-rubixSky" : "bg-rubixPurple";

  // Simplified Form Rendering Logic
  const renderForm = () => {
    if (type === "delete" && id) {
      return (
        <form action={formAction} className="p-4 flex flex-col gap-4">
          <input type="hidden" name="id" value={id} />
          <span className="text-center font-medium text-slate-700">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
          <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center 
          font-bold hover:bg-red-800 transition-colors">
            Confirm Delete

          </button>
        </form>
      );
    }

    if (type === "create" || type === "update") {
      return forms[table] ? (
        forms[table](setOpen, type, data, relatedData)
      ) : (
        <span>Form for {table} is under development!</span>
      );
    }

    return "Form not found!";
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full 
        ${bgColor} text-white shadow-md hover:opacity-80 transition-opacity`}
        onClick={() => setOpen(true)}
      >
         {/* USING LUCIDE ICONS INSTEAD OF IMAGES */}
        {type === "create" && <Plus size={16} />}
        {type === "update" && <Pencil size={14} />}
        {type === "delete" && <Trash2 size={14} />}

      </button>
      {open && (
        <div className="fixed inset-0 bg-black/60  backdrop-blur-sm 
        z-[9999] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl relative w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            {renderForm()}
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;