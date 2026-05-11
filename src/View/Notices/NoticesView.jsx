import React from 'react';
import { FaBullhorn, FaUserAlt, FaRegCalendarAlt } from "react-icons/fa";
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices';
import { TbFileDescription } from 'react-icons/tb';

const NoticeViewSkeleton = () => (
  <div className="w-full p-1 animate-pulse">
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-3">
          <div className="bg-gray-200 p-2 rounded-lg h-[40px] w-[40px] shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-7 bg-gray-200 rounded-lg w-3/4 max-w-md" />
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 rounded w-16" />
              <div className="h-5 bg-gray-200 rounded w-40" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="p-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-28" />
          </div>
          <div className="ml-5 h-7 bg-gray-200 rounded-full w-32" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 pl-0">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="pl-5 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NoticesView = () => {
  const { viewNoticeData, viewNoticeLoading } = useNotice();

  if (viewNoticeLoading) {
    return <NoticeViewSkeleton />;
  }

  if (!viewNoticeData) return null;

  const formatDateOnly = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    if (Number.isNaN(date.getTime())) return "N/A";
    const day = date.toLocaleString("en-US", { day: "2-digit" });
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const pickFirstNonEmpty = (...values) => {
    for (const v of values) {
      if (v === null || v === undefined) continue;
      const s = String(v).trim();
      if (s && s !== "0" && s.toLowerCase() !== "null" && s.toLowerCase() !== "undefined") {
        return s;
      }
    }
    return "";
  };

  const branchLabel = pickFirstNonEmpty(
    viewNoticeData.branch_name,
    viewNoticeData.branch,
    viewNoticeData.branch_title
  );
  const audienceBranch = branchLabel || "All Branches";

  return (
    <div className="w-full p-1">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 border border-gray-200 p-2 rounded-lg text-gray-700 h-fit mt-0.5">
                <FaBullhorn size={14} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Title
                </p>
                <h2 className="text-base leading-6 font-semibold text-gray-900 font-poppins break-words">
                  {viewNoticeData.title}
                </h2>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-1.5">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                Notice ID
              </div>
              <div className="bg-gray-50 border border-gray-200 px-2 py-1 rounded-md text-[11px] font-semibold text-gray-700 text-center">
                {viewNoticeData.id}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-600">
            <FaRegCalendarAlt size={10} />
            <span>{formatDateOnly(viewNoticeData.timestamp)}</span>
          </div>
        </div>

        {/* Content */}
      <div className="p-4 space-y-4">

          {/* Target Audience */}
          <div className="p-1">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="text-gray-500">
                <FaUserAlt size={12} />
              </div>
              <span className="text-xs font-semibold text-gray-800 font-poppins">
                Target Audience
              </span>
            </div>

            <div className="ml-5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-violet-50 text-violet-700 border border-violet-200">
                <span className="opacity-80">Branch:</span>
                <span className="font-semibold">{audienceBranch}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-1">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="text-gray-600">
                <TbFileDescription size={15} />
              </div>
              <span className="text-xs font-semibold text-gray-900 font-poppins">
                Description
              </span>
            </div>

            <div className="pl-5">
              <div className="text-gray-700 text-xs leading-6 whitespace-pre-wrap min-h-[90px]">
                {viewNoticeData.description || viewNoticeData.notice || "No description available"}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NoticesView;