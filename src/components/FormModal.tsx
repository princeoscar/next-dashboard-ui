"use client";

import { FormContainerProps } from "@/lib/types";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";

// Lazy Forms
const TeacherForm = dynamic(() => import("./forms/TeacherForm"));
const StudentForm = dynamic(() => import("./forms/StudentForm"));
const SubjectForm = dynamic(() => import("./forms/SubjectForm"));
const ClassForm = dynamic(() => import("./forms/ClassForm"));
const ExamForm = dynamic(() => import("./forms/ExamForm"));
const ParentForm = dynamic(() => import("./forms/ParentForm"));
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"));
const EventForm = dynamic(() => import("./forms/EventForm"));
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"));
const LessonForm = dynamic(() => import("./forms/LessonForm"));
const ResultForm = dynamic(() => import("./forms/ResultForm"));
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"));
const MessageForm = dynamic(() => import("./forms/MessageForm"));

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
  message: (setOpen, type, data, relatedData) => <MessageForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
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

  const handleDelete = async () => {
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ table, id }),
    });

    const result = await res.json();

    if (result.success) {
      toast.success(`${table} deleted successfully`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error("Delete failed");
    }
  };

  const renderForm = () => {
    if (type === "delete" && id) {
      return (
        <div className="p-8 flex flex-col gap-6 items-center">
          <Trash2 size={32} className="text-red-500" />

          <h2 className="text-xl font-bold">Confirm Deletion</h2>
          <p className="text-sm text-gray-500 text-center">
            This action cannot be undone.
          </p>

          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-2 rounded-xl"
          >
            Yes, Delete
          </button>
        </div>
      );
    }

    if (type === "create" || type === "update") {
      return forms[table]
        ? forms[table](setOpen, type, data, relatedData)
        : <p>Form not found</p>;
    }

    return null;
  };

  const size = "w-8 h-8";
  const bgColor =
    type === "create"
      ? "bg-yellow-400"
      : type === "update"
      ? "bg-blue-400"
      : "bg-red-500";

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        {type === "create" && <Plus size={18} />}
        {type === "update" && <Pencil size={14} />}
        {type === "delete" && <Trash2 size={14} />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl relative w-[90%] max-w-lg">
            {renderForm()}

            <button
              className="absolute top-3 right-3"
              onClick={() => setOpen(false)}
            >
              <X />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;