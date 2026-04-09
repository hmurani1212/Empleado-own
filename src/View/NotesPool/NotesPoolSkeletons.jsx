import React from 'react';

/** Inline spinner + label for share modal lists (employees, etc.) */
export const NotesPoolInlineSpinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center gap-2 py-1 text-[#698592] text-[12px]">
    <div
      className="h-4 w-4 shrink-0 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin"
      aria-hidden
    />
    <span>{label}</span>
  </div>
);

export const NotebookSkeleton = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 w-full">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div 
          key={item} 
          className="relative flex flex-col justify-between w-full min-h-[140px] rounded-2xl bg-white border border-gray-100 p-5 animate-pulse"
        >
          {/* Header */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4 w-full">
              {/* Icon Skeleton */}
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0"></div>
              
              {/* Title & Subtitle Skeleton */}
              <div className="flex flex-col gap-2 w-full max-w-[70%]">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
            
            {/* Menu Skeleton */}
            <div className="w-8 h-8 rounded-full bg-gray-100"></div>
          </div>

          {/* Footer Skeleton */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 relative z-10">
            <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
            <div className="h-4 w-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const NoteSkeleton = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 w-full">
        {/* Create Note Placeholder Skeleton (Optional, keeping consistent layout) */}
        <div className="flex flex-col items-center justify-center w-full h-[220px] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 animate-pulse">
            <div className="w-14 h-14 bg-gray-200 rounded-full mb-3"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>

        {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div 
                key={item}
                className="relative flex flex-col justify-between w-full h-[220px] rounded-2xl bg-white border border-gray-100 p-4 animate-pulse"
            >
                {/* Top Bar */}
                <div className="flex justify-between items-start w-full relative z-10">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-gray-100"></div>
                    
                    <div className="flex items-center gap-2">
                        {/* Star */}
                        <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                        {/* Menu */}
                        <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3 mt-4 relative z-10 flex-1">
                    <div className="h-5 bg-gray-100 rounded w-full"></div>
                    <div className="h-5 bg-gray-100 rounded w-2/3"></div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-100"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-5 w-14 bg-gray-100 rounded-full"></div>
                </div>
            </div>
        ))}
    </div>
  );
};

/** Skeleton for the view-note dialog body while note content is loading */
export const NoteViewSkeleton = () => (
  <div className="w-full min-h-[280px] animate-pulse space-y-4 p-1">
    <div className="flex flex-wrap items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2 min-w-[120px]">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-gray-100">
      <div className="h-16 bg-gray-100 rounded-lg" />
      <div className="h-16 bg-gray-100 rounded-lg" />
      <div className="h-16 bg-gray-100 rounded-lg hidden sm:block" />
    </div>
  </div>
);

export const StarredNoteSkeleton = () => {
  return (
    <div className="grid w-full gap-4 grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <div
          key={item}
          className="border border-gray-100 rounded-[10px] flex flex-col justify-between w-full justify-self-start max-w-[190px] h-[190px] bg-white p-2 animate-pulse"
        >
           {/* Top Right Star */}
           <div className="flex justify-end w-full">
              <div className="w-5 h-5 rounded-full bg-gray-100"></div>
           </div>

           {/* Center Content */}
           <div className="flex flex-col items-center justify-center gap-2 w-full flex-1">
              {/* Icon Circle */}
              <div className="w-[50px] h-[50px] rounded-full bg-gray-100"></div>
              {/* Title Line */}
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
              {/* Subtitle Line */}
              <div className="h-3 w-16 bg-gray-100 rounded"></div>
           </div>

           {/* Bottom Right Date */}
           <div className="flex justify-end w-full">
              <div className="h-3 w-20 bg-gray-100 rounded"></div>
           </div>
        </div>
      ))}
    </div>
  );
};
