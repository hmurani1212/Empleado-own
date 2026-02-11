import React from 'react'

const TrainingSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="overflow-x-auto min-h-[400px]">
            <div className="w-full">
                {/* Header Skeleton */}
                <div className="flex bg-gray-50/80 border-b border-gray-100 p-4">
                    {['Course Name', 'Created By', 'Assign course', 'Created Date', 'Actions'].map((item, index) => (
                        <div key={index} className={`flex-1 px-4 ${index === 0 ? 'pl-6' : ''} ${index === 4 ? 'pr-6' : ''}`}>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                    ))}
                </div>

                {/* Rows Skeleton */}
                <div className="divide-y divide-gray-50">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                        <div key={row} className="flex items-center p-4">
                            {/* Course Name */}
                            <div className="flex-1 px-4 pl-6">
                                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                            </div>

                            {/* Created By */}
                            <div className="flex-1 px-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                </div>
                            </div>

                            {/* View Assigned */}
                            <div className="flex-1 px-4">
                                <div className="h-3 bg-gray-200 rounded w-28"></div>
                            </div>

                            {/* Created Date */}
                            <div className="flex-1 px-4">
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>

                            {/* Actions */}
                             <div className="flex-1 px-4 pr-6">
                                <div className="h-8 bg-gray-200 rounded-lg w-24 ml-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Pagination Skeleton */}
        <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
            <div className="h-9 bg-gray-200 rounded-lg w-40"></div>
        </div>
    </div>
  )
}

export default TrainingSkeleton
