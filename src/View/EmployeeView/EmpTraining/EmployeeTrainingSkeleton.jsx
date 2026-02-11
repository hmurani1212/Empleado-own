import React from 'react'

const EmployeeTrainingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((item) => (
             <div key={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden relative">
                 <div className="h-1.5 w-full bg-gray-200"></div>
                 <div className="p-6 flex-1 flex flex-col">
                     <div className="flex items-start justify-between mb-4">
                         <div className="flex-1 pr-4">
                             <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                             <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                     </div>
                     <div className="flex items-center gap-2 mb-6">
                         <div className="h-6 bg-gray-200 rounded w-24"></div>
                     </div>
                     <div className="mt-auto pt-4 border-t border-gray-100">
                         <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
                     </div>
                 </div>
             </div>
        ))}
    </div>
  )
}

export default EmployeeTrainingSkeleton
