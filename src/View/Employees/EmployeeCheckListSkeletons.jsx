import React from 'react';

/**
 * Loading placeholders for Employee Requirement Checklist accordion list.
 * Mirrors accordion header + Applicable For / Person Responsible / Average Completion rows.
 */
export const EmployeeRequirementChecklistSkeleton = ({ rows = 5 } = {}) => (
  <div
    className="w-full max-w-3xl space-y-3 dashboard-skeleton-pulse"
    aria-busy="true"
    aria-label="Loading requirement checklists"
  >
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-gray-100"
          style={{ background: 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)' }}
        >
          <div className="h-4 rounded-md flex-1 max-w-[min(100%,280px)]" style={{ backgroundColor: '#e5e7eb' }} />
          <div className="h-5 w-5 rounded shrink-0" style={{ backgroundColor: '#e5e7eb' }} />
        </div>
        <div className="px-4 py-4 space-y-3">
          {[1, 2, 3].map((line) => (
            <div key={line} className="flex gap-4 items-center">
              <div className="w-[38%] max-w-[140px] h-3.5 rounded" style={{ backgroundColor: '#dbeafe' }} />
              <div className="flex-1 h-3.5 rounded-md" style={{ backgroundColor: '#e5e7eb' }} />
            </div>
          ))}
          <div className="flex justify-end pt-1">
            <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: '#e5e7eb' }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);
