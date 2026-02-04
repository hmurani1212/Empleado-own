import React from 'react';

const AttendanceLoading = () => {
    return (
        <div className='border-b border-b-customGray-100 space-y-4 py-4'>
            <div className='space-y-3'>
                {/* Loading skeleton for summary items */}
                {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className='flex items-center justify-between'>
                        <div className='h-4 bg-gray-200 rounded w-20 animate-pulse'></div>
                        <div className='h-4 bg-gray-200 rounded w-16 animate-pulse'></div>
                    </div>
                ))}
            </div>
            
            {/* Loading text */}
            <div className='text-center text-gray-500 text-sm'>
                Loading attendance data...
            </div>
        </div>
    );
};

export default AttendanceLoading;
