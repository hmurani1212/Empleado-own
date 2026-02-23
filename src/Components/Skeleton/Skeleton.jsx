import React from 'react';

/**
 * Base Skeleton primitive – use for consistent loading placeholders.
 * Uses animate-pulse and slate/gray palette to match design system.
 */
const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`animate-pulse rounded bg-slate-200/80 ${className}`}
    aria-hidden
    {...props}
  />
);

/**
 * Skeleton that mirrors a card with icon + 2 lines (e.g. stat cards)
 */
export const CardSkeleton = ({ lines = 2 }) => (
  <div className="h-[120px] rounded-2xl bg-slate-100 border border-slate-200/60 p-4 flex items-center gap-4 animate-pulse">
    <div className="w-14 h-14 rounded-2xl bg-slate-200/80 shrink-0" />
    <div className="flex-1 flex flex-col gap-2 min-w-0">
      <Skeleton className="h-8 w-16" />
      {lines >= 2 && <Skeleton className="h-4 w-24" />}
    </div>
  </div>
);

/**
 * Skeleton for a table row (variable columns)
 */
export const TableRowSkeleton = ({ cols = 4, className = '' }) => (
  <tr className={`animate-pulse ${className}`}>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full max-w-[120px] mx-auto" />
      </td>
    ))}
  </tr>
);

/**
 * Skeleton for list item with avatar + 2 lines
 */
export const ListItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="h-12 w-12 rounded-xl bg-slate-100 shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export default Skeleton;
