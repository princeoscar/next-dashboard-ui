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
  deleteLesson, 
  deleteParent, 
  deleteResult, 
  deleteStudent, 
  deleteSubject, 
  deleteTeacher 
} from "@/lib/actions";

// 1. Action Map for Deletions
const deleteActionMap: any = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  event: deleteEvent,
  lesson: deleteLesson,
  announcement: deleteAnnouncement,
  result: deleteResult,
  parent: deleteParent,
  assignment: deleteAssignment,
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
const LessonForm = dynamic(() => import("./forms/LessonForm"), { loading: () => <div>Loading...</div> });
const ResultForm = dynamic(() => import("./forms/ResultForm"), { loading: () => <div>Loading...</div> });
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), { loading: () => <div>Loading...</div> });
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), { loading: () => <div>Loading...</div> });

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
  lesson: (setOpen, type, data, relatedData) => <LessonForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  result: (setOpen, type, data, relatedData) => <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  attendance: (setOpen, type, data, relatedData) => <AttendanceForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  announcement: (setOpen, type, data, relatedData) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
};

const FormModal = ({ table, type, data, id, relatedData }: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = type === "create" ? "bg-rubixYellow" : type === "update" ? "bg-rubixSky" : "bg-rubixPurple";
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Handle Action State for DELETE only (Create/Update are handled inside their respective forms)
  const [state, deleteAction] = useActionState(deleteActionMap[table], {
    success: false,
    error: false,
    message: "",
  });

  // Effect for Deletion Success
  useEffect(() => {
    if (state.success) {
      toast.success(`${table} has been deleted!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, table]);

  // Handle scroll lock
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [open]);

  return (
    <>
      <button 
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`} 
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto">
            
            {/* 1. DELETE FORM */}
            {type === "delete" && id ? (
              <form action={deleteAction} className="p-4 flex flex-col gap-4">
                <input type="hidden" name="id" value={id} />
                <span className="text-center font-medium">
                  All data will be lost. Are you sure you want to delete this {table}?
                </span>
                <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
                  Delete
                </button>
              </form>
            ) : 
            /* 2. CREATE/UPDATE FORMS */
            (type === "create" || type === "update") ? (
              forms[table] ? (
                forms[table](setOpen, type, data, relatedData)
              ) : (
                <div className="p-4 text-center">Form for {table} is still under development! 🛠️</div>
              )
            ) : (
              <div className="p-4 text-center">Form not found!</div>
            )}

            {/* CLOSE BUTTON */}
            <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setOpen(false)}>
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;