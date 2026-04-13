import React from "react";
import { Typography } from "@material-tailwind/react";

/** Four stat cards — matches ExpenseDashboard metric row */
export const ExpenseStatCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="relative overflow-hidden rounded-2xl p-5 bg-gray-200/90 border border-gray-100 min-h-[120px]"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 w-full">
            <div className="h-3 bg-gray-300/80 rounded w-28" />
            <div className="h-8 bg-gray-300/80 rounded w-36" />
            <div className="h-3 bg-gray-300/60 rounded w-20 mt-1" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-gray-300/80 shrink-0" />
        </div>
      </div>
    ))}
  </div>
);

/** Chart (2 cols) + recent activity (1 col) — Expense Analysis tab */
export const ExpenseAnalysisTabSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[450px]">
      <div className="h-6 bg-gray-200 rounded w-40 mb-6" />
      <div className="h-[350px] w-full bg-gray-50 rounded-xl flex items-end justify-around gap-2 px-4 pb-4">
        {[45, 70, 55, 80, 60, 75, 50].map((h, idx) => (
          <div
            key={idx}
            className="flex-1 bg-gray-200 rounded-t max-w-[14%]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
    <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[450px] flex flex-col">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="h-6 bg-gray-200 rounded w-36" />
      </div>
      <div className="p-4 space-y-4 flex-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-1 min-w-[8px] h-2 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-[80%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const expenseListHeaders = [
  "Expense ID",
  "Employee Name",
  "Category",
  "Amount",
  "Date",
  "Status",
  "Description",
  "View",
];

export const ExpenseListTableSkeleton = ({ rows = 8 }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="overflow-x-auto customScroll">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead className="bg-gray-50/80 border-b border-gray-100">
          <tr>
            {expenseListHeaders.map((head, i) => (
              <th key={i} className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-400 font-poppins">
                  {head}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {[...Array(rows)].map((_, i) => (
            <tr key={i}>
              <td className="p-4 first:pl-6">
                <div className="h-4 bg-gray-200 rounded w-20" />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="h-4 bg-gray-200 rounded w-28" />
                </div>
              </td>
              <td className="p-4">
                <div className="h-6 bg-gray-200 rounded-md w-16" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 rounded w-24" />
              </td>
              <td className="p-4">
                <div className="h-6 bg-gray-200 rounded-full w-20" />
              </td>
              <td className="p-4 max-w-[200px]">
                <div className="h-4 bg-gray-200 rounded w-full" />
              </td>
              <td className="p-4 last:pr-6 text-center">
                <div className="inline-block w-8 h-8 rounded-full bg-gray-200 mx-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const invoiceHeaders = [
  "Employee ID",
  "Employee name",
  "Installment total amount",
  "Paid amount",
  "Remaining amount",
  "Settlement method",
  "View",
];

export const InvoicesTableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="overflow-x-auto customScroll">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead className="bg-gray-50/80 border-b border-gray-100">
          <tr>
            {invoiceHeaders.map((head, i) => (
              <th key={i} className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-400 font-poppins">
                  {head}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {[...Array(rows)].map((_, i) => (
            <tr key={i}>
              <td className="p-4 first:pl-6">
                <div className="h-4 bg-gray-200 rounded w-16" />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 rounded w-24" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
              </td>
              <td className="p-4 text-center">
                <div className="h-6 bg-gray-200 rounded-full w-24 mx-auto" />
              </td>
              <td className="p-4 last:pr-6 text-center">
                <div className="inline-block w-8 h-8 rounded-full bg-gray-200" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/** Pending approvals drawer — card rows similar to list layout */
export const PendingApprovalsListSkeleton = ({ rows = 4 }) => (
  <div className="pt-4 space-y-6 animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="pb-4 border-b border-dashed border-gray-200 last:border-0">
        <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
          {[0, 1, 2].map((j) => (
            <div key={j} className="flex items-center gap-2 min-w-[140px]">
              <div className="w-10 h-10 rounded-lg bg-gray-200 border border-gray-100" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-9 w-24 bg-gray-200 rounded-[7px]" />
          <div className="h-9 w-24 bg-gray-200 rounded-[7px]" />
        </div>
      </div>
    ))}
  </div>
);
