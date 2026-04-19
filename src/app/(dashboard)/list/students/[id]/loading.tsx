const ProfileLoading = () => {
  return (
    <div className="flex-1 p-4 flex flex-col gap-6 xl:flex-row bg-slate-50/50 min-h-screen">
      {/* LEFT SKELETON */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        <div className="bg-slate-200 animate-pulse h-64 rounded-[2rem]"></div>
        <div className="bg-white animate-pulse h-[600px] rounded-[2.5rem]"></div>
      </div>
      {/* RIGHT SKELETON */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <div className="bg-white animate-pulse h-48 rounded-[2.5rem]"></div>
        <div className="bg-white animate-pulse h-96 rounded-[2.5rem]"></div>
      </div>
    </div>
  );
};

export default ProfileLoading;