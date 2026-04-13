import React from "react";
import { Card, CardBody } from "@material-tailwind/react";

/**
 * Skeleton for Payroll Overview - mirrors stat cards + chart cards layout.
 */
export const PayrollOverviewSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <Card className="relative rounded-2xl shadow-card border border-gray-100 overflow-hidden bg-gray-100">
          <CardBody className="relative z-10 p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-200 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-6 bg-gray-200 rounded w-20 mt-1" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="relative rounded-2xl shadow-card border border-gray-100 overflow-hidden bg-gray-100">
          <CardBody className="relative z-10 p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-200 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-6 bg-gray-200 rounded w-20 mt-1" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:row-span-2">
          <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden h-full bg-white">
            <CardBody className="p-5">
              <div className="flex justify-between items-center gap-4 mb-4">
                <div className="h-5 bg-gray-100 rounded w-40" />
                <div className="h-10 bg-gray-100 rounded-lg w-24" />
              </div>
              <div className="min-h-[320px] h-[380px] bg-gray-50 rounded-xl flex items-end justify-around gap-2 p-4">
                {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gray-200 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden bg-white">
            <CardBody className="p-5">
              <div className="flex justify-between items-center gap-4 mb-4">
                <div className="h-5 bg-gray-100 rounded w-28" />
                <div className="h-10 bg-gray-100 rounded-lg w-24" />
              </div>
              <div className="min-h-[200px] bg-gray-50 rounded-xl" />
            </CardBody>
          </Card>
        </div>
        <div>
          <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden bg-white">
            <CardBody className="p-5">
              <div className="flex justify-between items-center gap-4 mb-4">
                <div className="h-5 bg-gray-100 rounded w-24" />
                <div className="h-10 bg-gray-100 rounded-lg w-24" />
              </div>
              <div className="min-h-[200px] bg-gray-50 rounded-xl" />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SALARY_TEMPLATE_TABLE_HEADS = [
  "ID",
  "Template Name",
  "Branch Name",
  "Salary",
  "Overtime rate/hour",
  "Creation date",
  "Actions",
];

/**
 * Skeleton for Manage Salary Template - Table only.
 */
export const SalaryTemplateTableSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {SALARY_TEMPLATE_TABLE_HEADS.map((_, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <tr key={row}>
                <td className="px-4 py-3">
                  <div className="h-6 w-10 bg-gray-100 rounded-md" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-100 rounded w-32" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-100 rounded w-24" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-100 rounded w-16" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-100 rounded w-24" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-8 w-20 bg-gray-100 rounded-lg" />
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
 * Skeleton for Manage Salary Template - mirrors header, filters, and table/list layout.
 */
export const ManageSalaryTemplateSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="h-6 bg-gray-100 rounded w-52" />
        <div className="h-10 bg-gray-100 rounded-lg w-40" />
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-4">
        <div className="w-full sm:w-64">
          <div className="h-4 bg-gray-100 rounded w-14 mb-2" />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
        <div className="w-full sm:w-64">
          <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-100 rounded" />
          <div className="h-8 w-8 bg-gray-100 rounded" />
        </div>
      </div>
      <SalaryTemplateTableSkeleton />
    </div>
  );
};

const EMP_SALARY_TABLE_HEADS = [
  "Employee Id",
  "Employee",
  "Branch",
  "Department",
  "Salary Template",
  "Current Salary",
  "Incentive",
  "Deduction",
  "Payable Salary",
  "Actions",
];

/**
 * Skeleton for Manage Employees Salary - Table only.
 */
export const EmployeeSalaryTableSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {EMP_SALARY_TABLE_HEADS.map((_, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <tr key={row}>
                {EMP_SALARY_TABLE_HEADS.map((_, i) => (
                  <td key={i} className="px-4 py-3">
                    <div
                      className={`bg-gray-100 rounded ${
                        i === 1 ? "h-4 w-28" : i === 9 ? "h-8 w-16" : "h-4 w-20"
                      }`}
                    />
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

/**
 * Skeleton for Manage Employees Salary - mirrors header, filters, and table/list layout.
 */
export const ManageEmployeesSalarySkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="h-6 bg-gray-100 rounded w-52" />
        <div className="h-10 bg-gray-100 rounded-lg w-40" />
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-4">
        <div className="w-full sm:w-48">
          <div className="h-4 bg-gray-100 rounded w-14 mb-2" />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
        <div className="w-full sm:w-48">
          <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
        <div className="w-full sm:w-64">
          <div className="h-4 bg-gray-100 rounded w-20 mb-2" />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-100 rounded" />
          <div className="h-8 w-8 bg-gray-100 rounded" />
        </div>
      </div>
      <EmployeeSalaryTableSkeleton />
    </div>
  );
};

/**
 * Skeleton for Settings - mirrors sidebar and content.
 */
export const SettingsSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-pulse pt-4">
      {/* Sidebar Skeleton */}
      <div className="w-full lg:w-1/4 flex flex-col gap-2">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="h-12 bg-gray-100 rounded-lg w-full" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="w-full lg:w-3/4 bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        <div className="h-6 bg-gray-100 rounded w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-10 bg-gray-100 rounded-lg w-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-10 bg-gray-100 rounded-lg w-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-10 bg-gray-100 rounded-lg w-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-10 bg-gray-100 rounded-lg w-full" />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <div className="h-10 bg-gray-100 rounded-lg w-32" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Export Reports - mirrors report cards grid.
 */
export const ExportReportsSkeleton = () => {
  return (
    <div className="lg:px-2 md:px-2 px-0 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-start">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="rounded-[15px] px-4 py-6 drop-shadow-sm flex items-center space-x-4 bg-gray-100 border border-gray-200"
          >
            <div className="p-2 aspect-square h-[45px] w-[45px] flex items-center justify-center bg-gray-200 rounded-full" />
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-1 bg-gray-200 rounded w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
/** Table body rows only — use inside <tbody> while payslip rows load (filters stay visible). */
export const MakingPaymentsTableBodySkeleton = () => (
  <>
    {[1, 2, 3, 4, 5, 6].map((row) => (
      <tr key={row} className="border-b border-[#F2F2F9] h-12 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((col) => (
          <td key={col} className="px-4">
            <div className="h-4 bg-gray-100 rounded w-full mx-auto" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

/**
 * Skeleton for Making Payments - mirrors filters and table.
 */
export const MakingPaymentsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 lg:px-2 md:px-2 px-0 animate-pulse">
      {/* Filter Bar */}
      <div className="mt-10 space-y-4">
        {/* Top Row: Action Buttons */}
        <div className="flex justify-end gap-2">
          <div className="h-10 bg-gray-200 rounded w-28" />
          <div className="h-10 bg-gray-200 rounded w-28" />
          <div className="h-10 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-gray-200 rounded w-24" />
        </div>

        {/* Bottom Row: Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="lg:w-[200px] md:w-[200px] w-full">
            <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-100 rounded-xl w-full" />
          </div>
          <div className="lg:w-[200px] md:w-[200px] w-full">
            <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-100 rounded-xl w-full" />
          </div>
          <div className="lg:w-[200px] md:w-[200px] w-full">
            <div className="h-4 bg-gray-100 rounded w-20 mb-2" />
            <div className="h-10 bg-gray-100 rounded-xl w-full" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-2 bg-white rounded-[10px] drop-shadow-md w-full">
        <div className="w-full overflow-auto">
          <table className="min-w-full table-fixed text-center">
            <thead className="rounded-[8px] bg-[#F8F9FA]">
              <tr className="h-12">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((_, i) => (
                  <th key={i} className="px-4">
                    <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <MakingPaymentsTableBodySkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
/**
 * Skeleton for Report Results - mirrors the report table.
 */
export const ReportResultsSkeleton = () => {
  return (
    <div className="mt-4 overflow-x-auto bg-white p-2 rounded-[10px] drop-shadow-md animate-pulse">
      <table className="w-full text-center h-full text-[12px]">
        <thead className="rounded-[8px] bg-[#F8F9FA]">
          <tr>
            {["S.No", "Name", "Father Name", "Designation", "Amount"].map((head, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((row) => (
            <tr key={row}>
              {[1, 2, 3, 4, 5].map((col) => (
                <td key={col} className="px-4 py-2">
                  <div className="h-4 bg-gray-100 rounded w-full mx-auto" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
/**
 * Table body rows only — use inside <tbody> while employee data is loading (filters stay visible).
 */
export const GeneratePayslipTableBodySkeleton = () => (
  <>
    {[1, 2, 3, 4, 5, 6].map((row) => (
      <tr key={row} className="border-b border-[#F2F2F9] h-12 animate-pulse">
        <td className="px-[clamp(4px,0.8vw,12px)] py-4">
          <div className="h-4 bg-gray-100 rounded w-4 mx-auto" />
        </td>
        <td className="px-[clamp(4px,0.8vw,12px)] py-4">
          <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
        </td>
        <td className="px-[clamp(4px,0.8vw,12px)] py-4">
          <div className="h-4 bg-gray-100 rounded w-32 mx-auto" />
        </td>
        <td className="px-[clamp(4px,0.8vw,12px)] py-4">
          <div className="h-4 bg-gray-100 rounded w-16 mx-auto" />
        </td>
        <td className="px-[clamp(4px,0.8vw,12px)] py-4">
          <div className="h-4 bg-gray-100 rounded w-20 mx-auto" />
        </td>
      </tr>
    ))}
  </>
);

/**
 * Skeleton for Generate Payslip - mirrors dropdowns, table (legacy full-page placeholder).
 */
export const GeneratePayslipSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse pt-4 lg:px-2 md:px-2 px-0">
      <div className="h-6 bg-gray-100 rounded w-40" />
      <div className="flex lg:flex-row md:flex-row flex-col items-center gap-4">
        <div className="lg:w-64 md:w-64 w-full">
          <div className="h-4 bg-gray-100 rounded w-16 mb-2" />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
        <div className="lg:w-64 md:w-64 w-full">
          <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
      </div>
      <div className="bg-white rounded-[10px] p-2 drop-shadow-md">
        <div className="w-full overflow-auto">
          <table className="min-w-full table-fixed text-center">
            <thead className="bg-[#F8F9FA] rounded-[8px]">
              <tr className="h-12">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <th key={i} className="px-4">
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <GeneratePayslipTableBodySkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
