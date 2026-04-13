import React from 'react';

/**
 * Top row — same dimensions as colored stat cards; uses gray + CSS pulse (Employees table pattern).
 */
export const DashboardStatCardsSkeleton = () => (
  <div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 dashboard-skeleton-pulse"
    aria-busy="true"
    aria-label="Loading dashboard statistics"
  >
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-[120px] rounded-2xl border border-gray-200 overflow-hidden shadow-card"
        style={{ backgroundColor: '#f3f4f6' }}
      >
        <div className="p-4 h-full flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl shrink-0"
            style={{ backgroundColor: '#e5e7eb' }}
          />
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="h-8 w-20 rounded-md" style={{ backgroundColor: '#d1d5db' }} />
            <div className="h-4 w-28 max-w-[85%] rounded-md" style={{ backgroundColor: '#e5e7eb' }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Progress row — white cards with visible gray bars (matches All Employees skeleton treatment).
 */
export const DashboardProgressCardsSkeleton = () => (
  <div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 dashboard-skeleton-pulse"
    aria-busy="true"
    aria-label="Loading attendance summary"
  >
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-[120px] rounded-2xl bg-white border border-gray-200 shadow-card p-4"
      >
        <div className="w-full h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2 min-w-0 pr-2">
              <div className="h-4 w-28 rounded-md" style={{ backgroundColor: '#e5e7eb' }} />
              <div className="h-8 w-16 rounded-md" style={{ backgroundColor: '#d1d5db' }} />
            </div>
            <div className="w-10 h-10 rounded-lg shrink-0" style={{ backgroundColor: '#e5e7eb' }} />
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="rounded-full h-2 w-full" style={{ backgroundColor: '#e5e7eb' }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/** Attendance Overview line chart area — matches h-[350px] chart container */
export const DashboardAttendanceOverviewSkeleton = () => (
  <div
    className="h-[350px] w-full rounded-xl border border-gray-200 p-4 dashboard-skeleton-pulse"
    style={{ backgroundColor: '#f9fafb' }}
    aria-busy="true"
    aria-label="Loading attendance chart"
  >
    <div className="h-full flex flex-col justify-end gap-3 min-h-0">
      <div
        className="flex items-end justify-between gap-1.5 flex-1 px-1 pt-6 min-h-[200px] border-b"
        style={{ borderColor: '#e5e7eb' }}
      >
        {[42, 58, 48, 72, 55, 68, 50, 62, 45, 70, 52, 60, 48, 65].map((h, i) => (
          <div
            key={i}
            className="flex-1 min-w-[6px] max-w-[48px] mx-auto rounded-t-md"
            style={{ height: `${h}%`, backgroundColor: '#d1d5db', minHeight: '24px' }}
          />
        ))}
      </div>
      <div className="flex justify-between gap-1 pt-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="h-2 flex-1 max-w-8 rounded mx-0.5"
            style={{ backgroundColor: '#e5e7eb' }}
          />
        ))}
      </div>
    </div>
  </div>
);

/** Turnaround (bar) + Gender (donut) row */
export const DashboardTurnaroundGenderSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dashboard-skeleton-pulse">
    {[1, 2].map((i) => (
      <div key={i} className="rounded-2xl shadow-card border border-gray-200 overflow-hidden bg-white p-6">
        <div className="h-5 w-48 rounded mb-2" style={{ backgroundColor: '#d1d5db' }} />
        <div className="h-4 w-64 rounded mb-6 max-w-full" style={{ backgroundColor: '#e5e7eb' }} />
        <div
          className="h-64 w-full rounded-xl border flex items-center justify-center"
          style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
        >
          <div
            className="w-40 h-40 rounded-full border-8"
            style={{ borderColor: '#d1d5db', backgroundColor: '#e5e7eb' }}
          />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Upcoming Birthdays — mirrors list row layout (avatar, name, date pill).
 * Uses the same gray bar treatment as Employees → All Employees table skeletons.
 */
export const DashboardBirthdaysListSkeleton = () => (
  <div className="h-80 overflow-y-auto meet-greet-scrollbar">
    <ul className="py-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <li
          key={i}
          className="flex items-center gap-4 px-5 py-3 mx-2 rounded-xl animate-pulse border-b border-gray-100 last:border-0"
        >
          <div className="h-12 w-12 rounded-xl bg-gray-100 shrink-0 ring-2 ring-white shadow-sm" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-40 max-w-[75%]" />
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 shadow-sm">
              <div className="w-4 h-4 rounded bg-gray-100" />
              <div className="h-3 w-14 bg-gray-100 rounded" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Meet & Greet table — same cell/bar pattern as EmployeesList loading rows (gray-100, pulse, borders).
 */
export const DashboardMeetGreetTableSkeleton = ({ rows = 6 } = {}) => (
  <div className="w-full min-w-[500px]">
    <table className="w-full text-left border-collapse min-w-[500px]">
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr>
          {[0, 1, 2].map((i) => (
            <th
              key={i}
              className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${i === 2 ? 'text-center' : ''}`}
            >
              <div className="h-3 bg-gray-200 rounded animate-pulse max-w-[72px] mx-0" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {[...Array(rows)].map((_, rowIndex) => (
          <tr key={rowIndex} className="animate-pulse border-b border-gray-100">
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-100 rounded w-full max-w-[140px]" />
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-100 rounded w-full max-w-[88px]" />
            </td>
            <td className="px-6 py-4 text-center">
              <div className="h-8 bg-gray-100 rounded-lg w-24 mx-auto" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Upcoming Holidays table — four columns, aligned with real holidays table spacing.
 */
export const DashboardHolidaysTableSkeleton = ({ rows = 6 } = {}) => (
  <div className="w-full min-w-[500px]">
    <table className="w-full text-left border-collapse min-w-[500px]">
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr>
          {[0, 1, 2, 3].map((i) => (
            <th key={i} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {[...Array(rows)].map((_, rowIndex) => (
          <tr key={rowIndex} className="animate-pulse border-b border-gray-100">
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-100 rounded w-full max-w-[120px]" />
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-100 rounded w-full max-w-[72px]" />
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-100 rounded w-full max-w-[72px]" />
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-gray-100 rounded w-full max-w-[160px]" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Generic table skeleton (Meet & Greet / Holidays style) — Employees list–aligned bars.
 * @param {number} rows - Number of skeleton rows
 * @param {number} cols - Number of columns (default 3 for Name, ID, Action style)
 */
export const DashboardTableSkeleton = ({ rows = 5, cols = 3 } = {}) => (
  <div className="w-full min-w-[500px]">
    <table className="w-full text-left border-collapse min-w-[500px]">
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-6 py-3">
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex} className="animate-pulse border-b border-gray-100">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                {colIndex === cols - 1 ? (
                  <div className="h-8 bg-gray-100 rounded-lg w-full max-w-[96px] mx-auto" />
                ) : (
                  <div
                    className="h-4 bg-gray-100 rounded w-full"
                    style={{
                      maxWidth: colIndex === 0 ? '140px' : '100px',
                    }}
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
