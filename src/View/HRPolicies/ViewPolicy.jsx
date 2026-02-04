import React from 'react'
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices'
import { formatTimestamp } from '../Branches/utils'
import formatTime from '../../services/__hrPoliciesServices'
import CustomCard from './CustomCard';

const ViewPolicy = () => {
    const {viewPolicy, viewPolicyData} = useHRPolicies()
  return (
    <div className='p-[20px]'>
        <div className='flex flex-col'>
            <div className='p-[10px] font-semibold text-[#3da5f4]'>
                {viewPolicy.policy_name}
            </div>

            <div>
            <table className='w-full min-w-max text-left h-[200px] border-y-[1px] border-gray ml-[10px] text-[14px]' >
                
                <tbody>
                    <tr>
                        <td className='font-semibold'>PID</td>
                        <td>{viewPolicy.id}</td>
                    </tr>

                    <tr>
                        <td className='font-semibold'>Timings</td>
                        <td>{formatTime(viewPolicy.starting_time)} - {formatTime(viewPolicy.closing_time)}</td>
                    </tr>

                    <tr>
                        <td className='font-semibold'>Expiry</td>
                        <td>
                          {viewPolicy.status === '0' ? 'Expiry' : 'Valid'}  
                        </td>
                    </tr>

                    <tr>
                        <td className='font-semibold'>Payroll Generation Type</td>
                        <td>
                            {viewPolicy.payroll === 1 || viewPolicy.payroll === '1' ? 'Time Base' : 
                             viewPolicy.payroll === 2 || viewPolicy.payroll === '2' ? 'Attendance Base' : 
                             viewPolicy.payroll === 3 || viewPolicy.payroll === '3' ? 'Hourly Base' : 'Unknown'}  
                        </td>
                    </tr>

                    <tr>
                        <td className='font-semibold'>Overtime</td>
                        <td>
                            {viewPolicy.overtime_pay === '0' ? 'Unpaid' : 'Paid'}  
                        </td>
                    </tr>

                    <tr>
                        <td className='font-semibold'>Created Date</td>
                        {formatTimestamp(viewPolicy.creation_time)} 
                    </tr>
                </tbody>
                
            </table>

            </div>
        </div>

        <div className='grid grid-cols-2 gap-3 pt-[20px]'>
            {viewPolicyData.map((item) => (
                <div key={item.id}>
                    <CustomCard 
                    title = {item.title}
                    logo = {item.icon}
                    data = {item.data}
                    />

                </div>

            ))}

        </div>
    </div>
  )
}

export default ViewPolicy