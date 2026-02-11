import React from 'react'

const QuestionBankSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map((item) => (
            <div key={item} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                {/* Resource Header Skeleton */}
                <div className="flex items-center justify-between p-4 bg-white">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                             <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                             <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                </div>
                 {/* Questions List Skeleton (simulating expanded state for first item) */}
                 {item === 1 && (
                    <div className="p-4 border-t border-gray-100 bg-white space-y-3">
                        {[1, 2, 3].map((q) => (
                             <div key={q} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                                 <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
                                 <div className="flex-1">
                                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                      <div className="flex gap-2">
                                          <div className="h-3 bg-gray-200 rounded-full w-16"></div>
                                          <div className="h-3 bg-gray-200 rounded-full w-12"></div>
                                      </div>
                                 </div>
                             </div>
                        ))}
                    </div>
                 )}
            </div>
        ))}
    </div>
  )
}

export default QuestionBankSkeleton
