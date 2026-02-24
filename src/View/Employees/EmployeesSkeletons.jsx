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
 * Displays skeleton cards matching the employee card layout
 */
export const EmployeesGridSkeleton = () => {
  // Render 8 skeleton cards (2 rows of 4 to match grid-cols-4 layout)
  const skeletonCount = 8;

  return (
    <>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <Card 
          key={index} 
          className="border border-[#3DA5F4] bg-[#F8F9FF] shadow-none animate-pulse"
        >
          <CardBody className='p-1'>
            {/* Menu icon skeleton */}
            <div className='flex justify-end relative'>
              <div className='w-5 h-5 bg-gray-300 rounded'></div>
            </div>
            
            {/* Content skeleton */}
            <div className='flex justify-center mt-2'>
              <div className='flex flex-col items-center gap-[3px] w-full'>
                {/* Avatar skeleton */}
                <div className='w-[50px] h-[50px] bg-gray-300 rounded-full'></div>
                
                {/* Empleado ID skeleton */}
                <div className='flex items-center gap-2 mt-1'>
                  <div className='h-3 w-16 bg-gray-300 rounded'></div>
                  <div className='h-3 w-8 bg-gray-300 rounded'></div>
                </div>
                
                {/* Name skeleton */}
                <div className='h-4 w-24 bg-gray-300 rounded mt-1'></div>
                
                {/* Department skeleton */}
                <div className='h-3 w-20 bg-gray-300 rounded mt-1'></div>
                
                {/* Email and phone skeleton */}
                <div className='flex flex-col items-center gap-[1px] mt-1'>
                  <div className='h-3 w-32 bg-gray-300 rounded'></div>
                  <div className='h-3 w-24 bg-gray-300 rounded'></div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </>
  );
};
