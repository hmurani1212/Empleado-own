import React from "react";
import { Typography } from "@material-tailwind/react";

/**
 * Table body skeleton rows for Hire 2.0 — matches VacanciesList / TalentPool table styling.
 */
const SkeletonCell = ({ className = "" }) => (
  <td className={`p-4 ${className}`}>
    <div className="h-4 bg-gray-200 rounded animate-pulse w-full max-w-[120px] mx-auto" />
  </td>
);

export const VacanciesListTableSkeleton = ({ rows = 8, colCount = 9 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-[#F2F2F9]">
          {Array.from({ length: colCount }).map((__, ci) => (
            <SkeletonCell key={ci} />
          ))}
        </tr>
      ))}
    </>
  );
};

/** Six stat cards — render as direct children of the same grid as `Hire.jsx` uses for `CustomCard`. */
export const HireDashboardCardsSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="relative block w-full min-w-0 rounded-2xl border border-gray-100 bg-white shadow-card overflow-visible animate-pulse"
      >
        <div className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-gray-300" />
        <div className="p-4 flex items-center justify-center">
          <div className="w-full h-[88px] sm:h-[100px] md:h-[110px] bg-gray-200 rounded-xl" />
        </div>
        <div className="mt-2 text-center px-0.5 pb-3">
          <div className="h-4 bg-gray-200 rounded mx-auto w-24" />
        </div>
      </div>
    ))}
  </>
);

/** Applicant / shortlist / interview tables use the same column count (9) as `VacanciesListTableSkeleton`. */
export const ApplicantsTableSkeleton = ({ rows = 8, colCount = 9 }) => (
  <VacanciesListTableSkeleton rows={rows} colCount={colCount} />
);

export const RejectedTableSkeleton = ({ rows = 8 }) => (
  <VacanciesListTableSkeleton rows={rows} colCount={6} />
);

export const TalentPoolTableSkeleton = ({ rows = 8 }) => {
  const talentHead = ["Candidate", "City", "CV", "Talent", "Added"];
  return (
    <table className="w-full min-w-max text-left h-full text-[12px]">
      <thead className="sticky top-[0px] z-20">
        <tr>
          {talentHead.map((head, i) => (
            <th
              key={i}
              className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
            >
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal leading-none opacity-70 capitalize"
              >
                {head}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, ri) => (
          <tr key={ri} className="border-b border-blue-gray-50">
            <td className="p-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full w-[35px] h-[35px] bg-gray-200 animate-pulse shrink-0" />
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1 max-w-[140px]" />
              </div>
            </td>
            <td className="p-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse max-w-[80px]" />
            </td>
            <td className="p-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            </td>
            <td className="p-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse max-w-[60px]" />
            </td>
            <td className="p-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse max-w-[90px]" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
