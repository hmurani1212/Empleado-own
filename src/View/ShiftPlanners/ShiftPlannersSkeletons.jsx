import React from "react";

export const PlannerSidebarSkeleton = () => (
  <div className="flex flex-col h-full min-h-0 animate-pulse">
    <div className="flex justify-between items-center bg-white drop-shadow-sm rounded-tl-[10px] px-4 py-2 h-[50px]">
      <div className="h-4 w-28 bg-gray-200 rounded" />
      <div className="flex items-center gap-2">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-9 w-9 bg-gray-200 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-1 pl-2 py-2 flex-1 min-h-0 overflow-y-auto space-y-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="py-2 px-6">
          <div
            className="h-5 bg-gray-200/90 rounded-md max-w-[85%]"
            style={{ opacity: 1 - i * 0.06 }}
          />
        </div>
      ))}
    </div>
  </div>
);

export const PlannerMainShiftsSkeleton = () => (
  <div className="flex flex-col gap-4 w-full max-w-[280px] animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="w-[260px] h-[75px] rounded-[10px] bg-gray-200/90 border border-gray-100"
      />
    ))}
  </div>
);

export const PlannerMainTeamsSkeleton = () => (
  <div className="flex flex-wrap gap-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="w-[200px] h-[72px] rounded-[10px] bg-gray-200/90 border border-gray-100"
      />
    ))}
  </div>
);

export const PlannerMainMembersSkeleton = () => (
  <div className="flex flex-wrap gap-4 animate-pulse flex-1">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="w-[140px] h-[100px] rounded-[10px] bg-gray-200/90 border border-gray-100"
      />
    ))}
  </div>
);

/** Rotator modal: Shift / On Rotator / Off Rotator table rows (use inside <tbody>) */
export const RotatorSettingsTableSkeletonRows = ({ rows = 4 }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <tr key={index} className="animate-pulse">
        <td className="border-b border-blue-gray-50 p-4">
          <div className="h-4 w-32 bg-gray-200 rounded max-w-full" />
        </td>
        <td className="border-b border-blue-gray-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gray-200 shrink-0" />
            <div className="h-3 w-8 bg-gray-200 rounded" />
          </div>
        </td>
        <td className="border-b border-blue-gray-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-200 shrink-0" />
              <div className="h-3 w-8 bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-12 bg-gray-200/80 rounded" />
          </div>
        </td>
      </tr>
    ))}
  </>
);
