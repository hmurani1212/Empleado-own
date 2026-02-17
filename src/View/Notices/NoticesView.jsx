import React from 'react';
import { FaBullhorn, FaUserAlt, FaRegCalendarAlt } from "react-icons/fa";
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices';
import { formatTimestamp } from '../Branches/utils';
import { TbFileDescription } from 'react-icons/tb';

const NoticesView = () => {
  const { viewNoticeData } = useNotice();

  if (!viewNoticeData) return null;

  const recipientLabel =
    viewNoticeData.emp_name ||
    viewNoticeData.branch_name ||
    "All Branches";

  const recipientStyles = viewNoticeData.emp_name
    ? "bg-purple-100 text-purple-700 border border-purple-200"
    : "bg-blue-100 text-blue-700 border border-blue-200";

  return (
    <div className="w-full p-1">
      <div className="bg-white rounded-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-blue-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600 h-fit">
                <FaBullhorn size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 font-poppins mb-1">
                  {viewNoticeData.title}
                </h2>

                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                    #{viewNoticeData.id}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <FaRegCalendarAlt size={12} />
                    <span>
                      {formatTimestamp(viewNoticeData.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Target Audience */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white p-1.5 rounded-lg shadow-sm text-gray-400">
                <FaUserAlt size={14} />
              </div>
              <span className="text-sm font-semibold text-gray-700 font-poppins">
                Target Audience
              </span>
            </div>

            <div className="ml-11">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${recipientStyles}`}
              >
                {recipientLabel}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-50 p-1.5 rounded-lg text-blue-500">
                <TbFileDescription size={18} />
              </div>
              <span className="text-sm font-semibold text-gray-900 font-poppins">
                Description
              </span>
            </div>

            <div className="pl-11">
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                {viewNoticeData.description || viewNoticeData.notice}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NoticesView;