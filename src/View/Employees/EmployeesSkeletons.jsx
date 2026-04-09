import React from "react";
import { Card, CardBody } from '@material-tailwind/react';

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
 * Skeleton loading component for Employees Grid
 * Displays skeleton cards matching GridEmployee.jsx card layout
 */
export const EmployeesGridSkeleton = () => {
  const skeletonCount = 8;

  return (
    <>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md animate-pulse"
        >
          <div className="h-1 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
          <CardBody className="p-0">
            <div className="flex justify-end px-3 pt-2">
              <div className="w-6 h-6 bg-slate-200 rounded-lg" />
            </div>
            <div className="px-4 pb-4 flex flex-col items-center">
              <div className="w-[72px] h-[72px] bg-slate-200 rounded-full ring-4 ring-slate-100 mb-3" />
              <div className="h-4 w-36 bg-slate-200 rounded" />
              <div className="h-3 w-28 bg-slate-100 rounded mt-2" />
              <div className="mt-4 w-full pt-3 border-t border-slate-100 space-y-3">
                {[1, 2, 3, 4, 5].map((line) => (
                  <div key={line} className="flex gap-2.5 w-full">
                    <div className="w-4 h-4 bg-slate-200 rounded shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-12 bg-slate-100 rounded" />
                      <div className="h-3 w-full bg-slate-200 rounded max-w-[180px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </>
  );
};
