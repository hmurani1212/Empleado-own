import { Typography } from '@material-tailwind/react'
import React, { useEffect } from 'react'
import useStore from '../../../Store/store'
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';

const tableHeader = [
  "Title", "Description", "Frequency", "Effective From", "Enforced Till", "Status"
]

const EmpDuties = () => {
  const { 
    employeeDuties, 
    loading, 
    gettingEmployeeDuties 
  } = useStore()

  useEffect(() => {
    gettingEmployeeDuties()
  }, [])

  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    try {
      const date = new Date(timestamp * 1000) // Convert from seconds to milliseconds
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return '-'
    }
  }

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'zero':
        return { text: 'Pending', color: 'bg-[#FFF1D9] text-[#FDA006]' }
      case 'one':
        return { text: 'Approved', color: 'bg-[#DBFFF5] text-[#0ACF97]' }
      case 'two':
        return { text: 'Rejected', color: 'bg-[#FFF0F4] text-[#FF4979]' }
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const formatFrequency = (unit, duration) => {
    if (!unit || !duration) return '-'
    return `Every ${duration} ${unit}${duration > 1 ? 's' : ''}`
  };
  

  return (
    <div className='flex flex-col gap-10 p-2'>
        
      {/* <div className='space-y-4'>
        <span className='text-[18px]'>Employee Job Description</span>
        <div className='p-2 border border-customGray-100 rounded-lg'>
          <span className='text-[14px] text-customBlack-100'>
            Job Description is Not Assigned Yet.
          </span>
        </div>
      </div> */}
      
      <div className='space-y-4'>
        <span className='text-[18px]'>Employee Extra Duties Assigned</span>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading duties...</div>
          </div>
        ) : (
          <div className='bg-white p-4 rounded-[10px] drop-shadow-md w-full overflow-x-auto'>
            <table className="w-[100%] min-w-max text-left">
              <thead className='sticky top-[-9px]'>
                <tr>
                  {tableHeader?.map((head, i) => (
                    <th
                      key={i}
                      className="bg-[#F8F9FA] p-4"
                    >
                      <Typography
                        variant="small"
                        color="#292929"
                        className="font-medium leading-none opacity-80 font-Urbanist capitalize"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employeeDuties?.duties?.length > 0 ? (
                  employeeDuties.duties.map((duty, index) => (
                    <tr key={duty.id || index} className="hover:bg-gray-50">
                      <td className="p-4 border-b border-gray-200">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {duty.title || '-'}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-gray-200">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {duty.description || '-'}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-gray-200">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {formatFrequency(duty.repetition_unit, duty.repetition_duration)}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-gray-200">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {formatDate(duty.effective_from)}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-gray-200">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {formatDate(duty.enforce_till)}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-gray-200">
                        {(() => {
                          const statusInfo = getStatusInfo(duty.acceptance_status)
                          return (
                            <span
                              className={`px-2 py-1 text-xs rounded-[7px] font-medium inline-block w-[80px] text-center ${statusInfo.color}`}
                            >
                              {statusInfo.text}
                            </span>
                          )
                        })()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <img src={noRecordFound} alt="No record found" className='w-80' />
                          <span className="text-[#292929] font-medium text-[16px]">
                            No duties found!
                          </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* <div className='space-y-4'>
        <span className='text-[18px]'>Designation wise Duties</span>
        
      </div> */}
    </div>
  )
}

export default EmpDuties