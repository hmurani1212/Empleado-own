import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileAlt, FaCalendarCheck } from 'react-icons/fa';
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices';
import ApplicationInfo from './ApplicationInfo';
import RequestedAdjust from './RequestedAdjust';

/**
 * Attendance Adjustment Request detail view — layout matches Inbox (image):
 * Left sidebar: "Details", "View application information", Application / Requested Adjustment tabs, "Application Viewer".
 * Right: white card with tab content (Application Info or Requested Adjustment).
 */
const AttendanceAdjustmentDetail = () => {
  const { handleCloseAttDetail, individualRequestDetail } = useAttendance();
  const [activePage, setActivePage] = useState('application');

  const sidebarItems = [
    { id: 'application', label: 'Application', icon: FaFileAlt },
    { id: 'requestedLeave', label: 'Requested Adjustment', icon: FaCalendarCheck },
  ];

  const handleClick = (page) => setActivePage(page);

  return (
    <div className="h-full flex flex-col md:flex-row w-full relative overflow-hidden bg-white/60 rounded-xl">
      {/* Sidebar — same as Inbox */}
      <div className="w-full md:w-[280px] bg-gradient-to-b from-gray-50 to-white border-r border-gray-100 p-4 flex-shrink-0 flex flex-col rounded-l-xl">
        <div className="mb-6 px-2">
          <h3 className="text-gray-800 font-bold text-lg">Details</h3>
          <p className="text-gray-500 text-xs mt-1">View application information</p>
        </div>

        <div className="flex flex-col gap-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left w-full group ${
                activePage === item.id
                  ? 'bg-white shadow-sm text-customBlue border border-blue-50'
                  : 'hover:bg-white/50 text-gray-600 hover:text-gray-900 border border-transparent'
              }`}
            >
              {activePage === item.id && (
                <motion.div
                  layoutId="activeTabIndicatorAtt"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-customBlue rounded-l-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <div
                className={`p-2 rounded-lg transition-colors ${
                  activePage === item.id
                    ? 'bg-blue-50 text-customBlue'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm'
                }`}
              >
                <item.icon size={16} />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 text-center">
          <p className="text-[10px] text-blue-400 font-medium">Application Viewer</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white/40 relative">
        <div className="flex-1 overflow-auto customDrwerScroll p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activePage === 'application' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 min-h-full">
                  <ApplicationInfo onClose={handleCloseAttDetail} />
                </div>
              )}
              {activePage === 'requestedLeave' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 min-h-full">
                  <RequestedAdjust onClose={handleCloseAttDetail} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAdjustmentDetail;
