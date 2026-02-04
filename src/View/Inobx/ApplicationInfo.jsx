import React, { useState } from 'react';
import { FaWpforms } from "react-icons/fa6";
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineBody,
  Typography,
} from "@material-tailwind/react";
import ApplicationLeave from '../Application/ApplicationLeave';
import RequestLeave from '../Application/RequestLeave';

const ApplicationInfo = ({ data, isLoading, onClose }) => {
  const [activePage, setActivePage] = useState('application'); // 'application' or 'requestedLeave'

  const handleClick = (page) => {
    setActivePage(page);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className='flex flex-row h-full w-full border border-1 rounded-[10px]'>
        <div className='w-full p-8 text-center flex items-center justify-center'>
          <div className='text-gray-500'>Loading application details...</div>
        </div>
      </div>
    );
  }

  // Show error state if no data
  if (!data && !isLoading) {
    return (
      <div className='flex flex-row h-full w-full border border-[#CCCCCC] rounded-[10px]'>
        <div className='w-full p-8 text-center flex items-center justify-center'>
          <div className='text-red-500'>No application data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col md:flex-row w-full border border-1 rounded-[10px] relative overflow-hidden'>
      <div className='w-full md:w-[25%] lg:w-[25%] bg-[#F8F9FF] p-3 sm:p-4 flex-shrink-0'>
        {/* <div className='flex gap-[50px]'>
            <div><FaWpforms color='#3DA5F4' size={'45px'} /></div>
            <div className='text-[#3DA5F4] font-normal mt-2 font-semibold'>{employeeName}</div>
          </div> */}

        <div className="mt-2 sm:mt-4 w-full">
          <Timeline>
            <TimelineItem>
              <TimelineConnector className='!w-1 bg-[#3DA5F4]' />
              <TimelineHeader
                className={`h-auto py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg cursor-pointer transition-all w-full flex items-center gap-2 sm:gap-3 ${activePage === 'application'
                  ? 'bg-[#3DA5F4] shadow-sm'
                  : 'bg-white hover:bg-gray-50'
                  }`}
                onClick={() => handleClick('application')}
              >
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${activePage === 'application'
                  ? 'bg-white'
                  : 'bg-white border-2 border-[#3DA5F4]'
                  }`}>
                  {activePage === 'application' && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#3DA5F4] rounded-full"></div>
                  )}
                </div>
                <Typography
                  variant="h6"
                  className={`leading-none text-xs sm:text-sm font-medium whitespace-nowrap ${activePage === 'application'
                    ? 'text-white'
                    : 'text-gray-600'
                    }`}
                >
                  Application
                </Typography>
              </TimelineHeader>
              <TimelineBody className="pb-1 sm:pb-1.5"></TimelineBody>
            </TimelineItem>
            <TimelineItem>
              <TimelineConnector className='!w-1 bg-[#3DA5F4]' />
              <TimelineHeader
                className={`h-auto py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg cursor-pointer transition-all w-full flex items-center gap-2 sm:gap-3 ${activePage === 'requestedLeave'
                  ? 'bg-[#3DA5F4] shadow-sm'
                  : 'bg-white hover:bg-gray-50'
                  }`}
                onClick={() => handleClick('requestedLeave')}
              >
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${activePage === 'requestedLeave'
                  ? 'bg-white'
                  : 'bg-white border-2 border-[#3DA5F4]'
                  }`}>
                  {activePage === 'requestedLeave' && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#3DA5F4] rounded-full"></div>
                  )}
                </div>
                <Typography
                  variant="h6"
                  className={`leading-none text-xs sm:text-sm font-medium whitespace-nowrap ${activePage === 'requestedLeave'
                    ? 'text-white'
                    : 'text-gray-600'
                    }`}
                >
                  Requested Leave
                </Typography>
              </TimelineHeader>
              <TimelineBody className="pb-1"></TimelineBody>
            </TimelineItem>
          </Timeline>
        </div>
      </div>
      <div className='comp w-full md:w-[75%] flex-shrink-0 overflow-hidden h-full flex flex-col'>
        {activePage === 'application' && (
          <div className='flex-1 overflow-auto'>
            <ApplicationLeave applicationData={data} onClose={onClose} />
          </div>
        )}
        {activePage === 'requestedLeave' && (
          <div className='flex-1 flex flex-col overflow-auto'>
            <RequestLeave applicationData={data} onClose={onClose} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationInfo;

