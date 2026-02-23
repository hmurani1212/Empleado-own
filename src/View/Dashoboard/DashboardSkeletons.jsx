import React from 'react';

/**
 * Skeleton for the top row of 4 colored stat cards (Total Employees, Departments, etc.)
 */
export const DashboardStatCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-[120px] rounded-2xl bg-slate-100 border border-slate-200/60 overflow-hidden animate-pulse"
      >
        <div className="p-4 h-full flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200/80 shrink-0" />
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="h-8 w-16 bg-slate-200/80 rounded" />
            <div className="h-4 w-24 bg-slate-200/60 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for the 4 clickable progress cards (Today's Attendance, Late Comers, etc.)
 */
export const DashboardProgressCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-[120px] rounded-2xl bg-white border border-slate-100 shadow-card p-4 animate-pulse"
      >
        <div className="w-full h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2 min-w-0 pr-2">
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-7 w-14 bg-slate-200 rounded" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100" />
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="bg-slate-100 rounded-full h-2 w-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for Upcoming Birthdays list (avatar + name + date badge per row)
 */
export const DashboardBirthdaysListSkeleton = () => (
  <div className="h-80 overflow-hidden">
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-3 w-20 bg-slate-50 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
            <div className="w-8 h-8 rounded bg-slate-100" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-16 bg-slate-100 rounded" />
              <div className="h-3 w-12 bg-slate-50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for table cards (Meet & Greet, Upcoming Holidays) - header + rows
 * @param {number} rows - Number of skeleton rows
 * @param {number} cols - Number of columns (default 3 for Name, ID, Action style)
 */
export const DashboardTableSkeleton = ({ rows = 5, cols = 3 } = {}) => (
  <div className="h-80 overflow-hidden">
    <table className="w-full text-left border-collapse min-w-[500px]">
      <thead className="bg-slate-50 sticky top-0 z-10">
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-6 py-3">
              <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex} className="animate-pulse">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <div
                  className="h-4 bg-slate-100 rounded"
                  style={{ width: colIndex === 0 ? '120px' : colIndex === cols - 1 ? '80px' : '100px' }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
