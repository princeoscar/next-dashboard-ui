import { FieldError, FieldErrorsImpl, Merge, RegisterOptions } from "react-hook-form";

type InputFieldProps = {
    label:string;
    type?:string;
    register:any;
    name:string;
    defaultValue?:string;
    error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
    hidden?: boolean
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    registerOptions?: RegisterOptions;
    placeholder?: string;
    autoComplete?: string;
};


const InputField = ({
    label,
     type = "text",
      register,
       name,
        defaultValue,
         error,
          hidden,
          inputProps,
          registerOptions,
          placeholder,
          
}: InputFieldProps) =>{
   
  return (
  <div className={hidden ? "hidden" : "flex flex-col gap-2 w-full"}> 
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <input 
        type={type}
        {...register(name, registerOptions)}
        className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full focus:ring-blue-500 outline-none transition-all"
        {...inputProps}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
      {error?.message && ( 
        <p className="text-xs text-red-400 font-medium">{error?.message.toString()}</p> 
      )}
  </div> 
)
}

export default InputField