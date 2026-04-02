// "use client";


// import { updatePersonalSettings } from "@/lib/actions";
// import { useActionState } from "react"; // React 19 / Next.js 15 pattern

// const PersonalSettingsForm = ({ user }: { user: any }) => {
//   const [state, formAction, isPending] = useActionState(updatePersonalSettings, {
//     success: false,
//     error: false,
//   });

//   return (
//     <form action={formAction} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
//       <h3 className="font-bold text-slate-700">Personal Information</h3>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="flex flex-col gap-2">
//           <label className="text-xs text-gray-400">Phone Number</label>
//           <input 
//             name="phone" 
//             defaultValue={user.phone} 
//             className="p-2 rounded-lg border border-slate-200 text-sm"
//           />
//         </div>
//         <div className="flex flex-col gap-2">
//           <label className="text-xs text-gray-400">Address</label>
//           <input 
//             name="address" 
//             defaultValue={user.address} 
//             className="p-2 rounded-lg border border-slate-200 text-sm"
//           />
//         </div>
//       </div>

//       <button 
//         disabled={isPending}
//         className="w-max px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold disabled:bg-slate-400 self-end"
//       >
//         {isPending ? "Updating..." : "Save Personal Info"}
//       </button>

//       {state.success && <p className="text-green-500 text-xs font-bold">Settings updated!</p>}
//     </form>
//   );
// };