"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { announcementSchema, AnnouncementSchema } from "@/lib/formValidationSchema";
import { Dispatch, SetStateAction, useEffect, useActionState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { Megaphone, Info, Loader2, Send } from "lucide-react";

const AnnouncementForm = ({
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema) as any,
    defaultValues: data,
  });

  const [state, formAction, isPending] = useActionState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Announcement ${type === "create" ? "published" : "updated"} successfully!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  const { classes } = relatedData || {};

  const onSubmit = handleSubmit((formData) => {
    const payload = {
      ...formData,
      id: data?.id || undefined,
      classId: formData.classId ? Number(formData.classId) : null,
    };
    startTransition(() => {
      formAction(payload as any);
    });
  });

  return (
    <form className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-2" onSubmit={onSubmit}>
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-100 pb-6 mb-2">
        <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-lg shadow-blue-200 animate-pulse-slow">
          <Megaphone size={28} strokeWidth={2.5} />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "New Bulletin" : "Edit Bulletin"}
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">
            Institutional Announcements System
          </p>
        </div>
      </div>

      {/* INPUTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField
          label="Bulletin Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors.title}
          placeholder="e.g. Science Fair 2026"
        />

        <InputField
          label="Display Date"
          name="date"
          type="date"
          defaultValue={data?.date ? new Date(data.date).toISOString().split("T")[0] : ""}
          register={register}
          error={errors.date}
        />

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Target Audience
          </label>
          <div className="relative group">
            <select
              className="w-full p-4 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
              {...register("classId")}
              defaultValue={data?.classId || ""}
            >
              <option value="">All Students (Global School-Wide)</option>
              {classes?.map((item: { id: number; name: string }) => (
                <option value={item.id} key={item.id}>
                  Class Segment: {item.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Info size={18} />
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1 italic">
             Leave blank for a global notice.
          </p>
        </div>
      </div>

      {/* TEXTAREA SECTION */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          Bulletin Message Content
        </label>
        <textarea
          {...register("description")}
          className="w-full p-5 rounded-[2rem] bg-slate-50 border border-slate-200 text-sm font-medium h-44 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all resize-none placeholder:text-slate-300 custom-scrollbar"
          defaultValue={data?.description}
          placeholder="Type the full announcement details here..."
        />
        {errors.description && (
          <p className="text-[10px] text-rose-500 font-black uppercase tracking-wide ml-2">
            {errors.description.message?.toString()}
          </p>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {state.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 animate-bounce">
          <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest text-center">
            Critical Error: Unable to synchronize with database.
          </p>
        </div>
      )}

      {/* FOOTER BUTTON */}
      <div className="flex items-center justify-between mt-4 border-t border-slate-50 pt-6">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isPending}
          className={`group flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95 ${
            isPending ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Broadcasting...</span>
            </>
          ) : (
            <>
              <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span>{type === "create" ? "Publish" : "Save Changes"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm;