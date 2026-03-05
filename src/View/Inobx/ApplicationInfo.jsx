import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileAlt, FaCalendarCheck } from "react-icons/fa";
import ApplicationLeave from '../Application/ApplicationLeave';
import RequestLeave from '../Application/RequestLeave';
import RequestedAdjustmentInbox from './RequestedAdjustmentInbox';

const ApplicationInfo = ({ data, isLoading, onClose, applicationType }) => {
  const [activePage, setActivePage] = useState('application'); // 'application' or 'requestedLeave'

  const handleClick = (page) => {
    setActivePage(page);
  };

  const isTimeAdjustment = useMemo(() => {
    const formLabel = applicationType?.form_label ?? data?.form_label;
    if (formLabel && typeof formLabel === 'string') {
      return formLabel.trim() === 'ATT_TIME_ADJUSTMENT';
    }
    const t = applicationType ? String(applicationType).trim() : '';
    return t === 'ATT_TIME_ADJUSTMENT' || t.toLowerCase() === 'time adjustment request';
  }, [applicationType, data?.form_label]);

  const sidebarItems = useMemo(() => [
    { id: 'application', label: 'Application', icon: FaFileAlt },
    { id: 'requestedLeave', label: isTimeAdjustment ? 'Requested Adjustment' : 'Requested Leave', icon: FaCalendarCheck },
  ], [isTimeAdjustment]);

  // Loading state
  if (isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center bg-white/50 backdrop-blur-sm'>
        <div className='flex flex-col items-center gap-3'>
          <div className="w-10 h-10 border-4 border-gray-200 rounded-full border-t-customBlue animate-spin"></div>
          <div className='text-gray-500 font-medium text-sm'>Loading details...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (!data && !isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center bg-white/50 backdrop-blur-sm'>
        <div className='text-center p-8 bg-red-50 rounded-xl border border-red-100'>
          <div className='text-red-500 font-medium'>No application data available</div>
          <button onClick={onClose} className="mt-4 text-sm text-gray-600 hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col md:flex-row w-full relative overflow-hidden bg-white/60 rounded-xl'>
      {/* Sidebar */}
      <div className='w-full md:w-[280px] bg-gradient-to-b from-gray-50 to-white border-r border-gray-100 p-4 flex-shrink-0 flex flex-col rounded-l-xl'>
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
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-customBlue rounded-l-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              
              <div className={`p-2 rounded-lg transition-colors ${
                activePage === item.id ? 'bg-blue-50 text-customBlue' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm'
              }`}>
                <item.icon size={16} />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </div>
        
        {/* Decorative bottom element */}
        <div className="mt-auto p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 text-center">
          <p className="text-[10px] text-blue-400 font-medium">Application Viewer</p>
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden bg-white/40 relative'>
        <div className='flex-1 overflow-auto customDrwerScroll p-6'>
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
                  <ApplicationLeave applicationData={data} onClose={onClose} applicationType={applicationType} />
                </div>
              )}
              {activePage === 'requestedLeave' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 min-h-full">
                  {isTimeAdjustment ? (
                    <RequestedAdjustmentInbox applicationData={data} onClose={onClose} />
                  ) : (
                    <RequestLeave applicationData={data} onClose={onClose} />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ApplicationInfo;

