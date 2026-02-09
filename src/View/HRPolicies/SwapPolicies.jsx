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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
        <div className="flex items-center gap-6 mb-8 border-b border-gray-50 pb-6">
            <h3 className="text-base font-semibold text-gray-900 font-poppins">Swap Type:</h3>
            <div className="flex items-center gap-6">
                <label className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg transition-all ${swapPolicyState === 1 ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                    <Radio 
                        name="swapType"
                        color="blue" 
                        checked={swapPolicyState === 1} 
                        onChange={() => handleSwapPolicyState({ target: { value: '1' } })}
                        className="p-0 transition-all hover:before:opacity-0"
                        label={
                            <Typography className="font-poppins font-medium text-sm text-gray-700 ml-2">
                                One to One
                            </Typography>
                        }
                    />
                </label>
                
                <label className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg transition-all ${swapPolicyState === 2 ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                    <Radio 
                        name="swapType"
                        color="blue" 
                        checked={swapPolicyState === 2} 
                        onChange={() => handleSwapPolicyState({ target: { value: '2' } })}
                        className="p-0 transition-all hover:before:opacity-0"
                        label={
                            <Typography className="font-poppins font-medium text-sm text-gray-700 ml-2">
                                Many to Many
                            </Typography>
                        }
                    />
                </label>
            </div>
        </div>

      <div className='flex flex-col gap-6'>
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <div className="text-blue-500 mt-0.5">ℹ️</div>
            <p className='text-xs font-medium text-blue-800 font-poppins leading-relaxed'>
                Please do swap a policy at the end of shift OR schedule them to be swapped at the end of shift timings to avoid attendance discrepancies.
            </p>
        </div>
        
        {swapPolicyState === 1 ?
          <div className="animate-fade-in-up">
            <OneToOne 
              handleSelectChange ={handleSelectChange}
              swapPolicyValue ={swapPolicyValue}
              handleChange ={handleChange}
              handleCheckbox ={handleCheckbox}
              handleOneToOnePolicy ={handleOneToOnePolicy}
            />
          </div>  
          :
          <div className="animate-fade-in-up">
            <ManyToOne 
                handleSelectChange ={handleSelectChange}
                swapPolicyValue ={swapPolicyValue}
                handleChange ={handleChange}
                handleCheckbox ={handleCheckbox}
                handleManyToOnePolicy ={handleManyToOnePolicy}
                handleSelectMutiplePolicy ={handleSelectMutiplePolicy}
              />
          </div>
        }
      </div>
    </div>
    </div>
  )
}

export default SwapPolicies