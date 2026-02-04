import React from 'react'
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices'

const PolicyUsers = (props) => {
  const {allPolicyUsers} = useHRPolicies()
  console.log('Users', allPolicyUsers)
  return (
    <div className='grid grid-col-2'>
      {allPolicyUsers?.map((user,index) => (
        <div>
        <div className='flex py-[20px]' key={index}>
          
          <div className='row-span-3'>
            <div>
            <img className='rounded-full w-[50px] h-[50px]' src={`https://emp-beta.veevotech.com/${user.dp}`}/>

            </div>
          </div>
          <div className='px-8'>
            <div className='text-[#3da5f4] text-[14px] font-semibold'>{user.name}</div>
            <div className='text-[12px]'>{user.dept_name}</div>
            <div className='text-[12px] text-[#9B9B9B]'>{user.designation}</div>
          </div>
        </div>
        <hr></hr>
        </div>
      
        
      ))}
  
      
    </div>
  )
}

export default PolicyUsers