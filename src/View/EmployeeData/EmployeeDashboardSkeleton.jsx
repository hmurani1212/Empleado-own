import React from 'react';
import { Card, CardBody } from '@material-tailwind/react';

/**
 * Loading skeleton for Employee Dashboard – mirrors the final layout
 * (header, profile card, quick status, stats, calendar, summary, duties)
 * for a smooth, consistent loading experience. Uses staggered pulse
 * and matches design tokens (shadow-card, rounded-2xl, gaps) for a
 * seamless transition when data loads.
 */
const EmployeeDashboardSkeleton = () => {
  return (
    <div
      className="min-h-screen bg-gray-50/50 p-4 lg:p-6 font-poppins"
      role="status"
      aria-live="polite"
      aria-label="Loading dashboard"
    >
      <span className="sr-only">Loading dashboard...</span>
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header skeleton – matches header section layout */}
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse"
          style={{ animationDelay: '0ms' }}
        >
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded-lg w-64" />
            <div className="h-4 bg-gray-100 rounded w-48" />
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl w-56">
            <div className="p-2 bg-gray-200 rounded-lg w-10 h-10" />
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-36" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column – Profile & Quick Status */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Profile card skeleton – mirrors Card with gradient strip + avatar + info rows */}
            <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden animate-pulse" style={{ animationDelay: '80ms' }}>
              <div className="h-32 bg-gray-200" />
              <div className="flex justify-center -mt-10 relative z-10">
                <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-white shadow-md" />
              </div>
              <CardBody className="pt-12 text-center">
                <div className="h-6 bg-gray-200 rounded w-40 mx-auto" />
                <div className="h-4 bg-gray-100 rounded w-28 mx-auto mt-2" />
                <div className="mt-6 flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex-1 space-y-1 text-left">
                        <div className="h-3 bg-gray-100 rounded w-20" />
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-100 rounded w-10 mx-auto" />
                    <div className="h-6 bg-gray-200 rounded-full w-14 mx-auto" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-100 rounded w-10 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Status card skeleton */}
            <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden animate-pulse" style={{ animationDelay: '120ms' }}>
              <CardBody className="p-5">
                <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-gray-100 rounded-2xl" />
                  <div className="h-20 bg-gray-100 rounded-2xl" />
                  <div className="col-span-2 h-16 bg-gray-100 rounded-2xl" />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right column – Stats, Calendar, Summary, Duties */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Stats overview skeleton – 4 cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="shadow-sm border border-gray-100 rounded-xl animate-pulse" style={{ animationDelay: `${140 + i * 40}ms` }}>
                  <CardBody className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 mb-3" />
                    <div className="h-7 bg-gray-200 rounded w-12 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Calendar + Summary row skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Calendar skeleton */}
              <Card className="md:col-span-2 rounded-2xl shadow-card border border-gray-100 animate-pulse" style={{ animationDelay: '320ms' }}>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-5 bg-gray-200 rounded w-40" />
                    <div className="h-9 bg-gray-100 rounded-lg w-28" />
                  </div>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <div key={d} className="h-4 bg-gray-100 rounded" />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div key={i} className="h-10 md:h-12 bg-gray-100 rounded-xl" />
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Summary skeleton */}
              <Card className="rounded-2xl shadow-card border border-gray-100 flex-1 animate-pulse" style={{ animationDelay: '360ms' }}>
                <CardBody className="p-5 flex flex-col gap-4">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-200" />
                          <div className="h-4 bg-gray-200 rounded w-16" />
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-14" />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Duties section skeleton */}
            <Card className="rounded-2xl shadow-card border border-gray-100 animate-pulse" style={{ animationDelay: '400ms' }}>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-5 bg-gray-200 rounded w-36" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 w-14 bg-gray-100 rounded-full" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <div className="w-14 h-14 rounded-full bg-gray-200 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-44 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-40" />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Footer area – mirrors EmployeeFooter height */}
        <div className="mt-4 h-12 bg-gray-100 rounded-xl animate-pulse" style={{ animationDelay: '440ms' }} aria-hidden />
      </div>
    </div>
  );
};

export default EmployeeDashboardSkeleton;
