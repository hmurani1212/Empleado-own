import React, { useEffect, useState } from 'react';
import ApplicationLeave from './ApplicationLeave';
import RequestLeave from './RequestLeave';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileAlt, FaCalendarAlt } from 'react-icons/fa';

function ApplicationDetails({ applicationData, isLoading, applicationId, onClose }) {
  const [activePage, setActivePage] = useState('application'); // 'application' or 'requestedLeave'

  // Extract data from API response structure
  const data = applicationData?.DB_DATA || applicationData?.data || applicationData;

  // Show loading state
  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-[400px] w-full bg-white rounded-2xl border border-gray-100 shadow-sm'>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className='text-gray-500 font-medium text-sm'>Loading application details...</div>
      </div>
    );
  }

  // Show error state if no data
  if (!applicationData && !isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-[200px] w-full bg-white rounded-2xl border border-gray-100 shadow-sm'>
        <div className='text-red-500 font-medium'>No application data available</div>
      </div>
    );
  }

  const tabs = [
    { id: 'application', label: 'Application Details', icon: FaFileAlt },
    { id: 'requestedLeave', label: 'Requested Leave', icon: FaCalendarAlt },
  ];

  return (
    <div className='flex flex-col md:flex-row gap-6 w-full'>
      
      {/* Sidebar Navigation */}
      <div className='w-full md:w-64 flex-shrink-0'>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-4">
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left ${
                  activePage === tab.id
                    ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className={`text-lg ${activePage === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 min-w-0'>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
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
                <ApplicationLeave applicationData={data} onClose={onClose} />
              )}
              {activePage === 'requestedLeave' && (
                <RequestLeave applicationData={data} onClose={onClose} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}

export default ApplicationDetails;
