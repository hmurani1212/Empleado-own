import { Radio, Typography } from '@material-tailwind/react'
import React from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'

const IncremenetSalary = (props) => {
    const {

        incrementSalaryValue,
        incrementTypeData,
        handleOnChangeIncrementSalary
    } = props
  return (
    <div className='flex flex-col gap-4'>
        <div className='flex flex-row gap-3'>
            {incrementTypeData.map((ele)=>(
                    <Radio key={ele.id}
                        color='blue'
                        label={
                            <Typography className='text-black text-[12px]'>
                                {ele.title}
                            </Typography>
                        }
                        name='incrementType'
                        value={ele?.id}
                        checked={ele.value == incrementSalaryValue?.incrementType}
                        onChange={handleOnChangeIncrementSalary}
                    />
                ))}
        </div>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>
                {incrementSalaryValue.incrementType ==1 ? 'percentage' : 'Amount'}    
            </label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='text' 
                value={incrementSalaryValue?.percentAmount}
                name='percentAmount' 
                onChange={handleOnChangeIncrementSalary}
                placeholder={incrementSalaryValue?.incrementType ==1 ? 'Increment %age' : 'Increment Amount'}
            />
        </div>
        <div>
            <span>Current Salary: {incrementSalaryValue?.currentSalary}</span>
        </div>
        <div>
            <span>New Expected Salary</span>
        </div>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>
                Effective From    
            </label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='date' 
                value={incrementSalaryValue?.effectiveFrom}
                name='effectiveFrom' 
                onChange={handleOnChangeIncrementSalary}
            />
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 flex flex-col px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Increment Detail</label>
                <textarea 
                    rows="7" 
                    // cols="50" 
                    name="incremenetDetails"
                    value={incrementSalaryValue?.incremenetDetails}
                    className='text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                    onChange={handleOnChangeIncrementSalary}
                >
                </textarea>
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 flex flex-col px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Email Body</label>
                <textarea 
                    rows="7" 
                    // cols="50" 
                    name="emailBody"
                    value={incrementSalaryValue?.emailBody}
                    className='text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                    onChange={handleOnChangeIncrementSalary}
                >
                </textarea>
            </div>
        </div>
        <div>
            <CustomButton 
                title='Increment Salary'
            />
        </div>
    </div>
  )
}

export default IncremenetSalary