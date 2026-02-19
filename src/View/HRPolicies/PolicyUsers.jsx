import React from 'react'
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices'
import { Avatar, Typography } from '@material-tailwind/react'
import { buildEmployeeImageUrl } from '../../utils/imageUrlUtils'

const PolicyUsers = (props) => {
  const {allPolicyUsers} = useHRPolicies()
  console.log('Users', allPolicyUsers)
  return (
    <div className='flex flex-col h-full bg-white'>
      <div className="p-4 border-b border-gray-50">
        <Typography className="text-gray-900 font-semibold font-poppins text-lg">
          Assigned Users ({allPolicyUsers?.length || 0})
        </Typography>
      </div>
      
      <div className='flex-1 overflow-y-auto customScroll px-4'>
        {allPolicyUsers?.length > 0 ? (
          <div className="flex flex-col divide-y divide-gray-50">
            {allPolicyUsers?.map((user,index) => (
              <div className='flex items-center gap-4 py-4 hover:bg-gray-50/50 rounded-lg px-2 transition-colors' key={index}>
                <Avatar 
                  src={buildEmployeeImageUrl(user)} 
                  alt={user.name}
                  size="md"
                  className="border border-gray-100 shadow-sm"
                  onError={(e) => {
                    e.target.src = "https://ui-avatars.com/api/?name=" + user.name + "&background=random";
                  }}
                />
                
                <div className='flex-1 min-w-0'>
                  <Typography className='text-gray-900 font-medium text-sm font-poppins truncate'>
                    {user.name}
                  </Typography>
                  <Typography className='text-xs text-gray-500 font-poppins truncate mt-0.5'>
                    {user.designation}
                  </Typography>
                </div>
                
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-[10px] font-medium font-poppins">
                    {user.dept_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <Typography className="text-sm font-medium font-poppins">No users assigned to this policy</Typography>
          </div>
        )}
      </div>
    </div>
  )
}

export default PolicyUsers