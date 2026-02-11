import React from 'react'

const ViewApprovalFlowSkeleton = () => {
  return (
    <div className="flex flex-col space-y-4 animate-pulse">
        <div className='flex gap-2 mb-2'>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className='h-4 bg-gray-200 rounded w-16'></div>
        </div>

        {[1, 2, 3].map((item) => (
            <div key={item} className="border border-gray-200 rounded-xl w-full">
                <div className='grid grid-cols-4'>
                    <div className='bg-gray-50 rounded-l-xl'>
                        <div className='justify-center flex p-[17px]'>
                            <div className='w-8 h-8 bg-gray-200 rounded-full'></div>
                        </div>
                    </div>

                    <div className='col-span-3 flex flex-col space-y-3 p-4'>
                        {[1, 2, 3, 4].map((row) => (
                            <div key={row} className='flex gap-2'>
                                <div className='h-3 bg-gray-200 rounded w-24'></div>
                                <div className='h-3 bg-gray-200 rounded w-32'></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ))}
    </div>
  )
}

export default ViewApprovalFlowSkeleton
