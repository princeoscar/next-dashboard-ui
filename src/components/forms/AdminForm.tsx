"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Create a schema for Admin
const schema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  bloodType: z.string().optional(),
  birthday: z.coerce.date().optional(),
  sex: z.enum(["MALE", "FEMALE"]),
  img: z.string().optional(),
});

const AdminForm = ({ type, data, setOpen }: { type: "create" | "update"; data?: any; setOpen: any }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const onSubmit = handleSubmit((values) => {
    console.log("Updated Admin Data:", values);
    // Here you will call your server action
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Update Admin Profile</h1>
      <div className="flex flex-wrap gap-4">
         {/* Add your Input fields here (Name, Email, etc.) */}
         <input {...register("name")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md w-full" placeholder="First Name" />
         {/* ... other fields */}
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md">Update</button>
    </form>
  );
};

export default AdminForm;