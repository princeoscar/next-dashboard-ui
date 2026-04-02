"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { eventSchema, EventSchema } from "@/lib/formValidationSchema";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createEvent, updateEvent } from "@/lib/actions";
import { CalendarClock, AlignLeft, Globe } from "lucide-react";

const EventForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  // Helper to format dates for the datetime-local input
  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      ...data,
      startTime: data?.startTime ? formatDate(data.startTime) : "",
      endTime: data?.endTime ? formatDate(data.endTime) : "",
    },
  });

  const [state, formAction] = useFormState<any, any>(
    type === "create" ? createEvent : updateEvent,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { classes } = relatedData || {};

  return (
    <form 
      className="flex flex-col gap-8 p-2" 
      onSubmit={handleSubmit((formData) => {
        // Fix for the persistent ts(2554) error
        (formAction as (data: EventSchema) => void)(formData);
      })}
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-sm">
          <CalendarClock size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "Schedule Event" : "Edit Event"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            School Calendar & Activities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
        <InputField
          label="Event Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors.title}
        />
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Target Audience
          </label>
          <div className="relative group">
            <select
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all appearance-none"
              {...register("classId")}
              defaultValue={data?.classId || ""}
            >
              <option value="">Whole School</option>
              {classes?.map((item: { id: number; name: string }) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-purple-500 transition-colors" size={18} />
          </div>
          {errors.classId?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>

        <InputField
          label="Start Time"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors.startTime}
        />

        <InputField
          label="End Time"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors.endTime}
        />

        {data && <input type="hidden" {...register("id")} defaultValue={data.id} />}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1">
          <AlignLeft size={14} className="text-slate-400" />
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Event Description
          </label>
        </div>
        <textarea
          {...register("description")}
          className="w-full p-4 rounded-[2rem] bg-slate-50 border border-slate-100 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all h-32 resize-none custom-scrollbar shadow-inner"
          placeholder="What's happening?..."
        />
        {errors.description?.message && (
          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
            {errors.description.message.toString()}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
             <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">
               Sync Error: Event could not be saved
             </span>
          </div>
        )}
        
        <button className="bg-slate-900 hover:bg-purple-600 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 self-end">
          {type === "create" ? "Publish Event" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;