import React from 'react'

const FormApprovalSkeleton = ({ headers = [1, 2, 3, 4, 5] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="overflow-x-auto min-h-[400px]">
            <div className="w-full">
                {/* Header Skeleton */}
                <div className="flex bg-gray-50/80 border-b border-gray-100 p-4">
                    {headers.map((item, index) => (
                        <div key={index} className={`flex-1 px-4 ${index === 0 ? 'pl-6' : ''} ${index === headers.length - 1 ? 'pr-6' : ''}`}>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                    ))}
                </div>

                {/* Rows Skeleton */}
                <div className="divide-y divide-gray-50">
                    {[1, 2, 3, 4, 5, 6, 7].map((row) => (
                        <div key={row} className="flex items-center p-4">
                            {headers.map((_, colIndex) => (
                                <div key={colIndex} className={`flex-1 px-4 ${colIndex === 0 ? 'pl-6' : ''} ${colIndex === headers.length - 1 ? 'pr-6' : ''}`}>
                                    {colIndex === 0 ? (
                                        // S.No / First col
                                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                                    ) : colIndex === headers.length - 1 ? (
                                        // Actions / Last col
                                        <div className="flex gap-2">
                                            <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                                            <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                                        </div>
                                    ) : (
                                        // Middle cols
                                        <div className="flex items-center gap-2">
                                            {colIndex === 1 && <div className="w-6 h-6 bg-gray-200 rounded-full"></div>}
                                            <div className={`h-4 bg-gray-200 rounded ${colIndex === 1 ? 'w-48' : 'w-32'}`}></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}

export default FormApprovalSkeleton
