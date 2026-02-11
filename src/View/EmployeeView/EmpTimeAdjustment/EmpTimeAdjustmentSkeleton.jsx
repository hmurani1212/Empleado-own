import React from "react";
import { Card, CardBody } from "@material-tailwind/react";

const TABLE_HEADERS = [
  "Actual Time",
  "Adjustment Date",
  "Requested Time",
  "Detail",
  "Status",
];

/**
 * Skeleton for the 4 stats cards - mirrors EmpTimeAdjustment stats grid.
 * Returns 4 Card children so the parent grid (grid-cols-1 md:grid-cols-4) lays them out identically to the real UI.
 */
export const TimeAdjustmentStatsSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="shadow-sm border border-gray-100">
          <CardBody className="p-4 flex items-center justify-between animate-pulse">
            <div>
              <div className="h-3 bg-gray-100 rounded w-28 mb-2" />
              <div className="h-8 bg-gray-100 rounded w-14" />
            </div>
            <div className="p-3 rounded-full bg-gray-100 w-12 h-12 shrink-0" />
          </CardBody>
        </Card>
      ))}
    </>
  );
};

/**
 * Skeleton for the time adjustment table - mirrors EmpTimeAdjustment table (5 columns).
 */
export const TimeAdjustmentTableSkeleton = () => {
  return (
    <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {TABLE_HEADERS.map((head, i) => (
                <th
                  key={i}
                  className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <tr key={row} className="animate-pulse">
                <td className="py-4 px-6">
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 shrink-0" />
                    <div className="h-4 bg-gray-100 rounded w-24" />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-2">
                    <div className="h-3 bg-gray-100 rounded w-16" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="h-4 bg-gray-100 rounded w-full max-w-[200px]" />
                </td>
                <td className="py-4 px-6">
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
