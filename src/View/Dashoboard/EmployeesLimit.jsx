import React from 'react'
import { FaPhoneAlt } from 'react-icons/fa'
import { FiTarget } from 'react-icons/fi'
import { HiMiniUserGroup } from 'react-icons/hi2'
import useDashboard from '../../ViewModel/DashboardViewModel/DashboardServices'

const EmployeesLimit = () => {

  const { dashboardData, adminDashboardData } = useDashboard()

  // Use admin dashboard data if available, fallback to old data
  const availableLimit = adminDashboardData?.ALLOWED_EMPLOYEES || dashboardData?.LISCENCES?.DB_DATA?.SUBSCRIP_QTY || 0
  const addedEmployees = adminDashboardData?.TOTAL_EMPLOYEES || dashboardData?.LISCENCES?.DB_DATA?.RESOURCE_COUNT || 0

  return (
    <div className='flex flex-col gap-5 px-4'>
      <div className='flex justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-[20px] text-[#3DA5F4]'><FiTarget /></span>
          <span className='text-[14px]'>Available Limit = </span>
          <span className='text-[14px]'>{availableLimit}</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-[20px] text-[#3DA5F4]'><HiMiniUserGroup /></span>
          <span className='text-[14px]'> Added Employees = </span>
          <span className='text-[14px]'>{addedEmployees}</span>
        </div>
      </div>
      <div>
        <span className='text-[14px]'>
          Want to upgrade your package? please visit oneid with owner account to update subscription or contact our team
        </span>
      </div>
      <div>
        <div className='flex items-center gap-2'>
          <span className='text-[20px] text-[#3DA5F4]'><FaPhoneAlt /></span>
          <span className='text-[14px]'>+92 - 304 - 111 8333</span>
        </div>
      </div>
    </div>
  )
}

export default EmployeesLimit