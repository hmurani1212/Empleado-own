import React from "react";
import { Typography } from "@material-tailwind/react";

const TABLE_HEAD_LEAVES_GROUP = [
  "ID",
  "Group Title",
  "Creation Date",
  "Defined Leaves",
  "View Leaves",
  "Action",
];

/**
 * Skeleton for Leave Groups controls bar - mirrors LeavesGroup.jsx controls (branch select, search, paid toggle, Add New Group button).
 */
export const LeavesGroupControlsSkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4 animate-pulse">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
        <div className="w-full md:w-56 h-10 bg-gray-100 rounded-xl" />
        <div className="w-full md:w-64 h-10 bg-gray-100 rounded-xl" />
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-full md:w-auto">
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="w-11 h-6 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="w-full lg:w-40 h-10 bg-gray-100 rounded-xl" />
    </div>
  );
};

const TABLE_HEAD_VIEW_LEAVES = [
  "ID",
  "Title",
  "Leave Calendar From",
  "Leave Calendar Upto",
  "No of Leaves",
  "Unit",
  "Carry Forward",
  "Consecutive",
  "Encashable",
  "Prorated",
  "Leave Type",
  "Min.service (days)",
  "Action",
];

/**
 * Skeleton for View Leaves header/controls - mirrors ViewLeaves.jsx (Back button, search, Define Leave Type button).
 */
export const ViewLeavesHeaderSkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="h-10 w-24 bg-gray-100 rounded-xl" />
        <div className="w-full md:w-64 h-10 bg-gray-100 rounded-xl" />
      </div>
      <div className="w-full md:w-48 h-10 bg-gray-100 rounded-xl" />
    </div>
  );
};

/**
 * Skeleton for Public Holiday controls - mirrors PublicHoliday.jsx (Select Branch, Policy, Integrate with Google Calendar).
 */
export const PublicHolidayControlsSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-52">
            <div className="h-4 bg-gray-100 rounded w-24 mb-2 mx-2" />
            <div className="h-10 bg-gray-100 rounded-lg w-52" />
          </div>
          <div className="w-52">
            <div className="h-4 bg-gray-100 rounded w-16 mb-2 mx-2" />
            <div className="h-10 bg-gray-100 rounded-lg w-52" />
          </div>
        </div>
        <div className="h-10 w-56 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Skeleton for Leave Groups table - mirrors LeavesGroup.jsx table layout (same wrapper and scroll container).
 */
export const LeavesGroupTableSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-poppins">
      <div className="min-h-[calc(100vh-250px)] overflow-auto customScroll">
        <table className="min-w-full table-auto text-center">
          <thead className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
            <tr>
              {TABLE_HEAD_LEAVES_GROUP.map((head, i) => (
                <th
                  key={i}
                  className={`p-4 first:pl-6 last:pr-6 whitespace-nowrap ${head === "Group Title" ? "text-left" : ""}`}
                >
                  <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <tr key={row} className="animate-pulse">
                <td className="p-4">
                  <div className="h-6 w-12 bg-gray-100 rounded-md inline-block" />
                </td>
                <td className="p-4 text-left">
                  <div className="h-4 bg-gray-100 rounded w-32" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-6 w-14 bg-gray-100 rounded-full mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-8 w-20 bg-gray-100 rounded-lg mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Skeleton for View Leaves table - mirrors ViewLeaves.jsx table layout (same wrapper and scroll container).
 */
export const ViewLeavesTableSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-poppins">
      <div className="min-h-[calc(100vh-250px)] overflow-auto customScroll">
        <table className="min-w-full table-auto text-center">
          <thead className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
            <tr>
              {TABLE_HEAD_VIEW_LEAVES.map((head, i) => (
                <th
                  key={i}
                  className="p-4 first:pl-6 last:pr-6 whitespace-nowrap"
                >
                  <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row} className="animate-pulse">
                <td className="p-4">
                  <div className="h-6 w-10 bg-gray-100 rounded-md mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-20 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-20 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-12 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-12 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-14 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-14 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-14 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-14 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-16 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-gray-100 rounded w-20 mx-auto" />
                </td>
                <td className="p-4">
                  <div className="h-8 w-8 bg-gray-100 rounded-lg mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Skeleton for Public Holiday calendar - mirrors PublicHolidayCalendar.jsx layout
 */
export const PublicHolidayCalendarSkeleton = () => {
  return (
    <div className="py-8 px-10 bg-white rounded-2xl shadow-sm border border-gray-100 font-poppins animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div className="w-10 h-10 rounded-full bg-gray-100" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-7 w-28 bg-gray-100 rounded" />
          <div className="h-6 w-16 bg-gray-100 rounded-full" />
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-100" />
      </div>

      <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center p-2 place-items-center">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-10 h-10 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, index) => (
          <div
            key={index}
            className="w-10 h-10 rounded-full bg-gray-100"
          />
        ))}
      </div>
    </div>
  );
};
