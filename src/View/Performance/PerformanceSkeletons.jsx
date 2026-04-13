import React from 'react';

// Generic Table Skeleton
export const PerformanceTableSkeleton = ({ headers = [] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-center">
                <thead className="bg-[#F8F9FA] border-b border-gray-100">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="p-4 bg-[#F8F9FA]">
                                <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {[1, 2, 3, 4, 5, 6].map((row) => (
                        <tr key={row} className="border-b border-[#F2F2F9]">
                            {headers.map((_, colIndex) => (
                                <td key={colIndex} className="p-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

// Skeleton for Employee Goals Detail View (Profile + Table)
export const EmployeeGoalsSkeleton = ({ headers = [] }) => {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
             {/* Profile Header Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                    <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
                 </div>
                 <div className="flex gap-1 border-b border-gray-100 pb-1">
                    {[1, 2, 3, 4].map((tab) => (
                        <div key={tab} className="h-10 bg-gray-200 rounded-t-xl w-32 mr-2"></div>
                    ))}
                 </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                     <table className="w-full text-center">
                        <thead className="bg-[#F8F9FA] border-b border-gray-100">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} className="p-4">
                                        <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-50">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row} className="border-b border-[#F2F2F9]">
                                    {headers.map((_, colIndex) => (
                                        <td key={colIndex} className="p-4">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
            </div>
        </div>
    );
};

// Skeleton for History List
export const HistorySkeleton = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse p-6">
            <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                            <div className="w-0.5 h-full bg-gray-100 mt-1"></div>
                        </div>
                        <div className="flex-1 pb-6">
                            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Skeleton for Feedback List
export const FeedbackSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Skeleton for employee competency cards (profile view)
export const CompetencyCardsSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse">
    <div className="h-10 bg-gray-200 rounded-lg w-40" />
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between py-4 border-b border-dashed border-gray-100 last:border-0"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1 max-w-md">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="w-5 h-5 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for Sub Goals
export const SubGoalsSkeleton = ({ headers = [] }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-center">
                    <thead className="bg-[#F8F9FA] border-b border-gray-100">
                        <tr>
                            {[1, 2, 3, 4, 5, 6].map((index) => (
                                <th key={index} className="p-4 bg-[#F8F9FA]">
                                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {[1, 2, 3, 4, 5, 6].map((row) => (
                            <tr key={row} className="border-b border-[#F2F2F9]">
                                {[1, 2, 3, 4, 5, 6].map((col) => (
                                    <td key={col} className="p-4">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
