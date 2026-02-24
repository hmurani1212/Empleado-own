import React, { useEffect } from 'react'
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices'
import { formatTimestamp } from '../Branches/utils'
import formatTime from '../../services/__hrPoliciesServices'
import CustomCard from './CustomCard';
import { HiOutlineDocumentText } from "react-icons/hi";

const ViewPolicy = () => {
    const {viewPolicy, viewPolicyData} = useHRPolicies()
    
  return (
    <div className='flex flex-col h-full bg-gray-50/30'>
        {/* Header Section */}
        <div className='bg-white p-6 border-b border-gray-100 sticky top-0 z-10'>
            <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-blue-50 rounded-lg text-bgBlue">
                    <HiOutlineDocumentText size={24} />
                </div>
                <div>
                    <h2 className='text-xl font-bold text-gray-900 font-poppins'>
                        {viewPolicy.policy_name}
                    </h2>
                    <p className="text-sm text-gray-500 font-poppins">Policy ID: #{viewPolicy.id}</p>
                </div>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto customScroll p-6'>
            {/* Primary Details Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
                <h3 className="text-sm font-semibold text-gray-900 font-poppins mb-4 uppercase tracking-wider border-l-4 border-bgBlue pl-3">
                    Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="flex flex-col border-b border-gray-50 pb-2">
                        <span className="text-xs text-gray-500 font-poppins mb-1">Shift Timings</span>
                        <span className="text-sm font-medium text-gray-900 font-poppins">
                            {formatTime(viewPolicy.starting_time)} - {formatTime(viewPolicy.closing_time)}
                        </span>
                    </div>

                    <div className="flex flex-col border-b border-gray-50 pb-2">
                        <span className="text-xs text-gray-500 font-poppins mb-1">Policy Status</span>
                        <span className={`text-sm font-medium font-poppins inline-flex items-center gap-1.5 ${
                            viewPolicy.status === '0' ? 'text-red-500' : 'text-emerald-500'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${viewPolicy.status === '0' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                            {viewPolicy.status === '0' ? 'Expired / Inactive' : 'Active'}
                        </span>
                    </div>

                    <div className="flex flex-col border-b border-gray-50 pb-2">
                        <span className="text-xs text-gray-500 font-poppins mb-1">Payroll Generation</span>
                        <span className="text-sm font-medium text-gray-900 font-poppins">
                            {viewPolicy.payroll === 1 || viewPolicy.payroll === '1' ? 'Time Base' : 
                             viewPolicy.payroll === 2 || viewPolicy.payroll === '2' ? 'Attendance Base' : 
                             viewPolicy.payroll === 3 || viewPolicy.payroll === '3' ? 'Hourly Base' : 'Unknown'}
                        </span>
                    </div>

                    <div className="flex flex-col border-b border-gray-50 pb-2">
                        <span className="text-xs text-gray-500 font-poppins mb-1">Overtime Status</span>
                        <span className="text-sm font-medium text-gray-900 font-poppins">
                            {viewPolicy.overtime_pay === 'Unpaid' || viewPolicy.overtime_pay === 'unpaid' ? 'Unpaid' : 'Paid'}
                        </span>
                    </div>

                    <div className="flex flex-col md:col-span-2">
                        <span className="text-xs text-gray-500 font-poppins mb-1">Created On</span>
                        <span className="text-sm font-medium text-gray-900 font-poppins">
                            {formatTimestamp(viewPolicy.creation_time)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Detailed Stats Grid */}
            <h3 className="text-sm font-semibold text-gray-900 font-poppins mb-4 uppercase tracking-wider pl-1">
                Policy Rules & Configurations
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {viewPolicyData.map((item) => (
                    <div key={item.id} className="transform transition-transform hover:-translate-y-1 duration-300">
                        <CustomCard 
                            title={item.title}
                            logo={item.icon}
                            data={item.data}
                        />
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

export default ViewPolicy