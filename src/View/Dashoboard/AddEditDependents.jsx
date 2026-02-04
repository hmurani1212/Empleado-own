import React from 'react'
import { customGender } from '../../services/EmpServices'
import { Button, Radio, Typography } from '@material-tailwind/react'

const AddEditDependents = (props) => {
    const { dependentsValue, handleDependentsInputChange, handleSubmitDependents } = props
  return (
    <div className='space-y-2'>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Dependent Name</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={ dependentsValue?.name}
                    name='name' 
                    onChange={handleDependentsInputChange}
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Date of birth</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='date' 
                    value={ dependentsValue?.dob}
                    name='dob' 
                    onChange={handleDependentsInputChange}
                />
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Relationship</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={dependentsValue?.relationship} 
                    name='relationship' 
                    onChange={handleDependentsInputChange}
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Contact</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={dependentsValue?.contact} 
                    name='contact' 
                    onChange={handleDependentsInputChange}
                />
                
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2'>
                <label className='text-[#698592] text-[12px]'>Gender</label>
                <div>
                    {customGender.map((ele, i)=>(
                        <Radio 
                            label={
                                <Typography
                                    color="blue-gray"
                                    className="text-[12px]"
                                >{ele.name}</Typography>
                            }
                            key={i}
                            color='blue'
                            size="sm"
                            name='gender'
                            onChange={handleDependentsInputChange}
                            value={ele.value}
                            checked={dependentsValue.gender === ele.value}
                        />
                    ))}
                </div>
                
            </div>
        </div>
        <div className='flex justify-end'>
            <Button 
                onClick={handleSubmitDependents} 
                variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
                loading={dependentsValue.loading}
            >
                <span>{dependentsValue.addState ? 'Submit' :'Update'}</span>
            </Button>
        </div>
    </div>
  )
}

export default AddEditDependents