"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { announcementSchema, AnnouncementSchema } from "@/lib/formValidationSchema";
import { Dispatch, SetStateAction, useEffect, useActionState } from "react"; // Updated Hook
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { Megaphone, Info } from "lucide-react";

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

  // Updated to useActionState and added isPending
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
      id: data?.id ? data.id : undefined, // Prisma handles ID types internally, but keeping it clean
      classId: formData.classId ? Number(formData.classId) : null,
    };
    formAction(payload as any);
  });

  return (
    <form className="flex flex-col gap-8 p-2" onSubmit={onSubmit}>
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <Megaphone size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "New Bulletin" : "Edit Bulletin"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Institutional Announcements
          </p>
        </div>
      </div>

      {/* INPUTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Title"
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

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Target Audience
          </label>
          <select
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
            {...register("classId")}
            defaultValue={data?.classId || ""}
          >
            <option value="">All Students (Global)</option>
            {classes?.map((item: { id: number; name: string }) => (
              <option value={item.id} key={item.id}>
                Class: {item.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 mt-1 ml-1 text-slate-400">
            <Info size={12} />
            <p className="text-[10px] font-bold uppercase tracking-tight italic">
              Leave blank for a school-wide notice.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          Detailed Message
        </label>
        <textarea
          {...register("description")}
          className="w-full p-5 rounded-[1.5rem] bg-slate-50 border border-slate-200 text-sm font-medium h-40 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none placeholder:text-slate-300"
          defaultValue={data?.description}
          placeholder="Describe the details..."
        />
        {errors.description && (
          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
            {errors.description.message?.toString()}
          </p>
        )}
      </div>

      {state.error && (
        <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest text-center">
          Error: Unable to synchronize with database.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending} // Disable button during submission
        className={`bg-slate-900 hover:bg-blue-600 text-white py-4 px-8 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all active:scale-95 self-end ${
          isPending ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isPending ? "Syncing..." : type === "create" ? "Publish" : "Save Changes"}
      </button>
    </form>
  );
};

export default AnnouncementForm;