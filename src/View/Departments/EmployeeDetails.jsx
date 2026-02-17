import React from 'react'
import useDepartments from '../../ViewModel/DepartmentsViewModel/DepartmentsServices'

const EmployeeDetails = () => {
    const {empDetailDept, empDetailDeptLoading} = useDepartments()

    // console.log('emp', empDetailDept)
    // console.log('loading', empDetailDeptLoading)
    
    // Add safety check for empDetailDept
    if (!empDetailDept && !empDetailDeptLoading) {
        return (
            <div className="text-center py-8">
                <span className="text-gray-500">No data available.</span>
            </div>
        );
    }
    
    // Additional safety check for loading state
    if (empDetailDeptLoading === undefined) {
        return (
            <div className="text-center py-8">
                <span className="text-gray-500">Loading...</span>
            </div>
        );
    }
    
  return (
    <>
    {empDetailDeptLoading ? (
        <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3da5f4]"></div>
            <span className="ml-2 text-[#3da5f4]">Loading employees...</span>
        </div>
    ) : !empDetailDept || empDetailDept.length === 0 ? (
        <div className="text-center py-8">
            <span className="text-gray-500">No Employee exist in this Department.</span>
        </div>
    ) : (
        <div className='grid grid-col-2'>
            {Array.isArray(empDetailDept) && empDetailDept.map((data,index) => {
                // Add null check for data
                if (!data) return null;
                
                return (
                    <div key={`emp-${data.id || index}`}>
                        <div className='flex py-[20px]'>
                            <div className='row-span-3'>
                                <div>
                                    <img 
                                        className='rounded-full w-[50px] h-[50px]' 
                                        src="https://elephant.veevotech.com/files/4d6a4d774e444930/9_9a9781ecfa76ca3.jpeg"
                                        alt="Employee"
                                    />
                                </div>
                            </div>
                            
                            <div className='px-8'>
                                <div className='text-[#3da5f4] text-[14px] font-semibold'>
                                    {data.name || 'N/A'}
                                </div>
                                <div className='text-[12px]'>
                                    {data?.department?.name || 'N/A'}
                                </div>
                                <div className='text-[12px] text-[#9B9B9B]'>
                                    {data?.designation || 'N/A'}
                                </div>
                            </div>
                        </div>
                        <hr></hr>
                    </div>
                );
            })}
        </div>
    )}
    </>
  )
}

export default EmployeeDetails