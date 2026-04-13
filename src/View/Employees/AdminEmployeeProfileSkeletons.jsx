import React from "react";
import { Card, CardBody } from "@material-tailwind/react";

/** Single field row — matches Overview grid (icon + label + value bars) */
const SkeletonFieldRow = () => (
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
            <div className="h-2.5 w-14 sm:w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3.5 w-[70%] max-w-[180px] bg-gray-100 rounded animate-pulse" />
        </div>
    </div>
);

/** One profile card: brand-style header strip + 3-column field skeletons */
export const EmployeeProfileSectionCardSkeleton = ({ rows = 2 }) => (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex justify-between items-center bg-brand-50/80 border-b border-brand-100">
            <div className="h-3.5 w-28 sm:w-36 bg-brand-100 rounded animate-pulse" />
            <div className="h-7 w-7 rounded-full bg-brand-100 animate-pulse" />
        </div>
        <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
            {Array.from({ length: rows }).map((_, r) => (
                <React.Fragment key={r}>
                    {r > 0 ? (
                        <div className="border-t border-dashed border-gray-200 my-2 sm:my-3" />
                    ) : null}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        <SkeletonFieldRow />
                        <SkeletonFieldRow />
                        <SkeletonFieldRow />
                    </div>
                </React.Fragment>
            ))}
        </div>
    </div>
);

/** Stacked cards for any profile sub-tab while section API loads */
export const EmployeeProfileTabContentSkeleton = ({ sectionCards = 3 }) => (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading section">
        {Array.from({ length: sectionCards }).map((_, i) => (
            <EmployeeProfileSectionCardSkeleton key={i} rows={i === 0 ? 2 : 1} />
        ))}
    </div>
);

/** Full initial page load — mirrors profile layout: header strip + sidebar + main */
export const EmployeeProfileInitialPageSkeleton = () => (
    <div className="flex flex-col min-w-0 w-full max-w-full gap-2 py-2 pb-1 pl-2 sm:pl-4 pr-2 sm:pr-3 overflow-x-hidden box-border">
        <div className="min-w-0 max-w-full mb-4">
            <div className="h-8 w-56 sm:w-64 bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-soft min-w-0 max-w-full mb-6 animate-pulse">
            <div className="flex flex-col md:flex-row min-w-0">
                <div className="w-full md:w-40 lg:w-48 h-40 sm:h-48 md:h-48 bg-gray-200 flex-shrink-0" />
                <div className="flex-1 flex flex-col py-4 px-4 sm:px-6 gap-4 min-w-0">
                    <div className="h-7 sm:h-8 w-[min(100%,280px)] bg-gray-200 rounded" />
                    <div className="flex flex-wrap gap-2">
                        <div className="h-9 w-36 bg-gray-100 rounded-md" />
                        <div className="h-9 w-24 bg-gray-100 rounded-md" />
                    </div>
                    <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                                <div className="space-y-2 flex-1 pt-0.5">
                                    <div className="h-2.5 w-20 bg-gray-200 rounded" />
                                    <div className="h-3.5 w-full max-w-[200px] bg-gray-100 rounded" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                                <div className="space-y-2 flex-1 pt-0.5">
                                    <div className="h-2.5 w-16 bg-gray-200 rounded" />
                                    <div className="h-3.5 w-full max-w-[180px] bg-gray-100 rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-dashed border-gray-200" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                                <div className="space-y-2 flex-1 pt-0.5">
                                    <div className="h-2.5 w-24 bg-gray-200 rounded" />
                                    <div className="h-3.5 w-full max-w-[160px] bg-gray-100 rounded" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                                <div className="space-y-2 flex-1 pt-0.5">
                                    <div className="h-2.5 w-12 bg-gray-200 rounded" />
                                    <div className="h-3.5 w-full max-w-[220px] bg-gray-100 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:gap-3 w-full min-w-0 max-w-full items-stretch">
            <Card className="w-full min-w-0 max-w-full lg:w-1/4 lg:min-w-[200px] xl:min-w-[250px] flex-shrink-0">
                <CardBody className="p-3 sm:p-4 space-y-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="h-10 sm:h-11 rounded-lg bg-gray-100 animate-pulse"
                        />
                    ))}
                </CardBody>
            </Card>
            <Card className="flex-1 min-w-0 w-full border border-gray-200 shadow-sm">
                <CardBody className="p-3 sm:p-4 min-w-0">
                    <EmployeeProfileTabContentSkeleton sectionCards={2} />
                </CardBody>
            </Card>
        </div>
    </div>
);
