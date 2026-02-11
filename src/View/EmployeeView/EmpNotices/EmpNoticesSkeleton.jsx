import React from "react";
import { Card, CardBody } from "@material-tailwind/react";

/**
 * Skeleton for Employee Notices table - mirrors EmpNotices.jsx layout:
 * Card with header row (Title, Date, Description) and content rows in same grid.
 */
const EmpNoticesTableSkeleton = () => {
  return (
    <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      <CardBody className="p-0">
        {/* Header Row - matches EmpNotices */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Title
          </div>
          <div className="col-span-12 md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Date
          </div>
          <div className="col-span-12 md:col-span-7 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Description
          </div>
        </div>

        {/* Skeleton rows - same grid as real rows */}
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="p-6 grid grid-cols-12 gap-4 items-start animate-pulse"
            >
              <div className="col-span-12 md:col-span-3">
                <div className="h-4 bg-gray-100 rounded w-3/4 max-w-[200px]" />
              </div>
              <div className="col-span-12 md:col-span-2 flex items-center">
                <div className="h-6 bg-gray-100 rounded-full w-24" />
              </div>
              <div className="col-span-12 md:col-span-7 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default EmpNoticesTableSkeleton;
