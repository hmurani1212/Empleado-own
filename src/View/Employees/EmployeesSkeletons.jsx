import React from "react";

/**
 * Skeleton rows for Employees list table - mirrors EmployeesList.jsx layout (8 columns).
 * Use inside <tbody> when loading.
 */
export const EmployeesListTableSkeleton = () => {
  return (
    <>
      {[...Array(6)].map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-100 rounded w-14 mx-auto" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-100 rounded w-16 mx-auto" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-100 rounded w-12 mx-auto" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-100 rounded w-28 max-w-[140px] mx-auto" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
          </td>
          <td className="px-4 py-4">
            <div className="h-6 w-20 bg-gray-100 rounded-full mx-auto" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
          </td>
          <td className="px-4 py-4">
            <div className="h-8 w-16 bg-gray-100 rounded-lg mx-auto" />
          </td>
        </tr>
      ))}
    </>
  );
};

/**
 * Skeleton for Employees grid view - mirrors GridEmployee.jsx card layout (grid-cols-4).
 */
export const EmployeesGridSkeleton = () => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 bg-[#F8F9FF] rounded-lg overflow-hidden animate-pulse"
        >
          <div className="p-3">
            <div className="flex justify-end mb-2">
              <div className="w-6 h-6 rounded bg-gray-100" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-[50px] h-[50px] rounded-full bg-gray-100" />
              <div className="h-3 bg-gray-100 rounded w-20" />
              <div className="h-4 bg-gray-100 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-24" />
              <div className="flex flex-col items-center gap-1">
                <div className="h-3 bg-gray-100 rounded w-28" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
