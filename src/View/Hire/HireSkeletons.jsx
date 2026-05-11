import React from "react";
import { Typography } from "@material-tailwind/react";

/**
 * Table body skeleton rows for Hire 2.0 — matches VacanciesList / TalentPool table styling.
 */
const skeletonTd =
  "px-3 py-3 align-middle border-r border-gray-100 last:border-r-0";

const SkeletonCell = ({ className = "", align = "center" }) => (
  <td
    className={`${skeletonTd} ${align === "left" ? "text-left" : "text-center"} ${className}`}
  >
    <div
      className={`h-4 bg-gray-200 rounded animate-pulse w-full max-w-[120px] ${align === "left" ? "mr-auto" : "mx-auto"}`}
    />
  </td>
);

export const VacanciesListTableSkeleton = ({ rows = 8, colCount = 9 }) => {
  const alignForCol = (ci) =>
    ci === 0 || ci === 6 ? "left" : "center";
  const widthForCol = (ci) => {
    if (ci === 0) return "max-w-[16rem]";
    if (ci === 6) return "w-0 min-w-0 max-w-[11rem]";
    if (ci === 7 || ci === 8) return "whitespace-nowrap w-[1%]";
    return "whitespace-nowrap";
  };
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="hover:bg-transparent">
          {Array.from({ length: colCount }).map((__, ci) => (
            <SkeletonCell
              key={ci}
              align={alignForCol(ci)}
              className={widthForCol(ci)}
            />
          ))}
        </tr>
      ))}
    </>
  );
};

/** Five stat cards — render as direct children of the same grid as `Hire.jsx` uses for `CustomCard`. */
export const HireDashboardCardsSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
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

/** Renders only <tr> body rows — embed inside the real <tbody> of TalentPool's table. */
export const TalentPoolTableSkeleton = ({ rows = 8 }) => (
  <>
    {Array.from({ length: rows }).map((_, ri) => (
      <tr key={ri} className="border-b border-[#F2F2F9] animate-pulse">
        {/* Candidate — avatar + name bar */}
        <td className="p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full w-[35px] h-[35px] bg-gray-200 shrink-0" />
            <div className="h-3.5 bg-gray-200 rounded w-[120px]" />
          </div>
        </td>
        {/* City */}
        <td className="p-4">
          <div className="h-3.5 bg-gray-200 rounded w-[80px]" />
        </td>
        {/* CV icon */}
        <td className="p-4">
          <div className="h-5 w-5 bg-gray-200 rounded" />
        </td>
        {/* Talent */}
        <td className="p-4">
          <div className="h-3.5 bg-gray-200 rounded w-[60px]" />
        </td>
        {/* Added date */}
        <td className="p-4">
          <div className="h-3.5 bg-gray-200 rounded w-[90px]" />
        </td>
      </tr>
    ))}
  </>
);
