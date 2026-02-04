import { Radio, Typography } from '@material-tailwind/react'
import React from 'react'
import useSwapPolciyServices from '../../ViewModel/HRPoliciesViewModel/swapPolicyServices'
import OneToOne from './OneToOne'
import ManyToOne from './ManyToOne'

const SwapPolicies = () => {
  const { handleSwapPolicyState, swapPolicyState,
    handleSelectChange, swapPolicyValue, handleChange,handleCheckbox,
    handleOneToOnePolicy,handleManyToOnePolicy,handleSelectMutiplePolicy
   } = useSwapPolciyServices()
  return (
    <div className="px-2 w-full">
      <div className='flex flex-col gap-3 bg-white rounded-[10px] drop-shadow-md p-4'>
      <div>
        <Radio size='sm' color='blue' checked={swapPolicyState === 1} label={
          <Typography
            color="blue-gray"
            className="text-[12px] text-blue-gray-500"
          >One to One</Typography>
        } value='1'  onChange={handleSwapPolicyState} />
        <Radio size='sm' color='blue' checked={swapPolicyState === 2} label={
          <Typography
            color="blue-gray"
            className="text-[12px] text-blue-gray-500"

          >Many to Many</Typography>
        } value='2'   onChange={handleSwapPolicyState} />
      </div>

      <div className='flex flex-col gap-2 mt-8'>
        <div>
          <span className='text-[11px] text-semibold'>Please do swap a policy at the end of shift Or schedule them to be swapped at the end of shift timings</span>
        </div>
        {swapPolicyState === 1 ?
          <>
            <OneToOne 
              // allPoliciesForSwap ={allPoliciesForSwap}
              handleSelectChange ={handleSelectChange}
              swapPolicyValue ={swapPolicyValue}
              handleChange ={handleChange}
              handleCheckbox ={handleCheckbox}
              handleOneToOnePolicy ={handleOneToOnePolicy}

            />
          </>  

          :
          <>
            <ManyToOne 
                // allPoliciesForSwap ={allPoliciesForSwap}
                handleSelectChange ={handleSelectChange}
                swapPolicyValue ={swapPolicyValue}
                handleChange ={handleChange}
                handleCheckbox ={handleCheckbox}
                handleManyToOnePolicy ={handleManyToOnePolicy}
                handleSelectMutiplePolicy ={handleSelectMutiplePolicy}
              />
          </>
        }
      </div>
    </div>
    </div>
  )
}

export default SwapPolicies