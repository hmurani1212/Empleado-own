import { Button } from '@material-tailwind/react'
import React from 'react'

export const AddEditExperience = (props) => {
    const { experienceValue, handleExpeirenceInputChange, handleSubmitExperience } = props
  return (
     <div className='space-y-2'>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Org/Institute Name</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        experienceValue?.validationErrors?.org_name ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='text' 
                    value={ experienceValue?.org_name}
                    name='org_name' 
                    onChange={handleExpeirenceInputChange}
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Designation</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        experienceValue?.validationErrors?.designation ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='text' 
                    value={ experienceValue?.designation}
                    name='designation' 
                    onChange={handleExpeirenceInputChange}
                />
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>From</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        experienceValue?.validationErrors?.from_date ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='date' 
                    value={experienceValue?.date_from} 
                    name='from_date' 
                    onChange={handleExpeirenceInputChange}
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>To</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        experienceValue?.validationErrors?.to_date ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='date' 
                    value={experienceValue?.date_upto} 
                    name='to_date' 
                    onChange={handleExpeirenceInputChange}
                />
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Salary</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        experienceValue?.validationErrors?.salary ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='text' 
                    value={experienceValue?.salary} 
                    name='salary' 
                    onChange={handleExpeirenceInputChange}
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Reason of Leaving</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        experienceValue?.validationErrors?.leave_reason ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='text' 
                    value={experienceValue?.leaving_reason} 
                    name='leave_reason' 
                    onChange={handleExpeirenceInputChange}
                />
            </div>
        </div>
       
        <div className='flex justify-end'>
            <Button 
                onClick={handleSubmitExperience} 
                variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
                loading={experienceValue.loading}
            >
                <span>{experienceValue.addState ? 'Submit' :'Update'}</span>
            </Button>
        </div>
    </div>
  )
}



