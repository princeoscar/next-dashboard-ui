const Loading = () => {
  return (
    <div className="p-8 h-full bg-slate-50/50 min-h-screen">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* HEADER SHIMMER */}
        <div className="p-10 border-b border-slate-50">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-3">
              <div className="h-8 bg-slate-200 rounded-xl w-48 animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded-full w-32 animate-pulse"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-48 bg-slate-100 rounded-2xl animate-pulse"></div>
              <div className="h-10 w-10 bg-slate-900 rounded-2xl animate-pulse"></div>
            </div>
          </div>
          
          {/* TABLE HEAD SHIMMER */}
          <div className="flex space-x-12 px-4 py-4 bg-slate-50 rounded-2xl">
            <div className="h-4 bg-slate-200 rounded-full w-1/6 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded-full w-2/6 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded-full w-1/6 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded-full w-1/6 animate-pulse"></div>
          </div>
        </div>

        {/* TABLE BODY SHIMMER */}
        <div className="p-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-6 px-4 border-b border-slate-50 last:border-0"
            >
              {/* Info Column (Avatar + Text) */}
              <div className="flex items-center gap-4 w-1/6">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-2 bg-slate-100 rounded-full w-1/2 animate-pulse"></div>
                </div>
              </div>
              
              {/* Other Columns */}
              <div className="h-4 bg-slate-100 rounded-full w-2/6 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded-full w-1/6 animate-pulse"></div>
              
              {/* Action Column */}
              <div className="flex gap-2 justify-end w-1/6">
                <div className="h-8 w-8 bg-slate-50 rounded-xl animate-pulse"></div>
                <div className="h-8 w-8 bg-slate-50 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION SHIMMER */}
        <div className="p-8 border-t border-slate-50 flex justify-between items-center">
          <div className="h-4 bg-slate-100 rounded-full w-24 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-slate-100 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-slate-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;