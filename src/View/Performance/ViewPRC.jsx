import React from 'react'
import { BiCalendar } from 'react-icons/bi'
import { FaBullseye, FaEnvelopeOpenText, FaSignature } from 'react-icons/fa6'
import { LiaTasksSolid } from 'react-icons/lia'

const ViewPRC = (props) => {
    const { data } = props 
    console.log('ViewPRC data:', data)
    
    // Helper function to format timestamps to dates
    const formatTimestampToDate = (timestamp) => {
        if (!timestamp) return '';
        
        let date;
        // If timestamp is a number
        if (typeof timestamp === 'number') {
            // If timestamp is in seconds (10 digits), convert to milliseconds
            if (timestamp.toString().length === 10) {
                date = new Date(timestamp * 1000);
            } else {
                // If timestamp is already in milliseconds (13 digits)
                date = new Date(timestamp);
            }
        } else {
            // If timestamp is a string, try to parse it
            date = new Date(timestamp);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid timestamp:', timestamp);
            return '';
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Safety check for data
    if (!data) {
        return <div className="p-4 text-center text-gray-500">No data available</div>
    }
  return (
    <div className='p-2 space-y-2'>
        <div className='grid grid-cols-2 gap-4'>
            <div className='flex gap-5 border border-blue-500 rounded-md p-3'>

                <div className='mt-1'>
                    <span className='text-primary-100'>
                        <FaSignature />
                    </span>
                    
                </div>
                <div className='flex flex-col gap-2'>
                    <span className='text-nowrap text-customBlack-100 text-[14px]'>Name Of Performance Review Cycle</span>
                    <span className='text-customBlack-100 text-[12px]'>{data.name}</span>
                </div>
            </div>
            <div className='flex gap-3 border border-blue-500 rounded-md p-3'>

                <div>
                    <span className='text-primary-100'>
                        <BiCalendar />
                    </span>
                </div>
                <div className='flex flex-col gap-2'>
                    <span className='text-nowrap text-customBlack-100 text-[14px]'>Start Date</span>
                    <span className='text-customBlack-100 text-[12px]'>{formatTimestampToDate(data.startDate)}</span>
                </div>
            </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
            <div className='flex gap-5 border border-blue-500 rounded-md p-3'>

                <div className='mt-1 '>
                    <span className='text-primary-100'>
                        <BiCalendar />
                    </span>
                    
                </div>
                <div className='flex flex-col gap-2'>
                    <span className='text-nowrap text-customBlack-100 text-[14px]'>End Date</span>
                    <span className='text-customBlack-100 text-[12px]'>{formatTimestampToDate(data.endDate)}</span>
                </div>
            </div>
            <div className='flex gap-3 border border-blue-500 rounded-md p-3'>

                <div className='mt-1'>
                    <span className='text-primary-100'>
                        <FaBullseye />
                    </span>
                </div>
                <div className='flex flex-col gap-2'>
                    <span className='text-nowrap text-customBlack-100 text-[14px]'>Modules</span>
                    <span className='text-customBlack-100 text-[12px]'>Goals & Competency</span>
                </div>
            </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
            <div className='flex gap-3 border border-blue-500 rounded-md p-3'>

                <div className='mt-1'>
                    <span className='text-primary-100'>
                        <LiaTasksSolid />
                    </span>
                    
                </div>
                <div className='flex flex-col gap-2'>
                    <span className='text-nowrap text-customBlack-100 text-[14px]'>Assigned To</span>
                    <span className='text-customBlack-100 text-[12px]'>
                        {data.employees && Array.isArray(data.employees) && data.employees.length > 0
                            ? data.employees.map(emp => emp.employee_name || emp.name || `Employee ${emp.employee_id}`).join(', ')
                            : 'Not Assigned'}
                    </span>
                </div>
            </div>
            <div className='flex gap-3 border border-blue-500 rounded-md p-3'>

                <div className='mt-1'>
                    <span className='text-primary-100'>
                        <BiCalendar />
                    </span>
                </div>
                <div className='flex flex-col gap-2'>
                    <span className='text-nowrap text-customBlack-100 text-[14px]'>Closing Date</span>
                    <span className='text-customBlack-100 text-[12px]'>{formatTimestampToDate(data.closing_date)}</span>
                </div>
            </div>
        </div>
        {/* Total Submissions - Commented out for now */}
        {/* <div className='grid grid-cols-2 gap-4'>
            <div className='flex gap-3 border border-blue-500 rounded-md p-3'>

                <div className='mt-1'>
                    <span className='text-primary-100'>
                        <FaEnvelopeOpenText />
                    </span>
                    
                </div>
                <div className='flex flex-col gap-2'>
                    <span className='text-nowrap text-customBlack-100 text-[14px]'>Total Submissions</span>
                    <span className='text-customBlack-100 text-[12px]'>{data.count || 0}</span>
                </div>
            </div>
        </div> */}
    </div>
  )
}

export default ViewPRC