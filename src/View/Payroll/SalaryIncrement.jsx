import { Input, Radio, Textarea } from '@material-tailwind/react'
import React from 'react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices'
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices'

const SalaryIncrement = () => {
    const {handleIncrementTypeChange, incNewValues,  handleIncrement, handleChangeIncValues, loading} = usePayroll()
    return (
    <>
    <div>
        <form onSubmit={handleIncrement}>
            <div className='flex flex-col space-y-4'>
                <div>
                    <span className='text-[12px]'>
                        This increment will apply to all those employees who have assigned this salary template
                    </span>
                </div>
                
                <div>
                    <div>
                        <span className='text-[12px]'>Increment Type</span>
                    </div>

                    <div className='flex text-[14px]'>
                        <div className=''>
                            <Radio 
                            name='salary_inc_type'
                            label='% percent' 
                            color='blue' 
                            value='percent'
                            checked={incNewValues.salary_inc_type === 'percent'} 
                            onChange={handleIncrementTypeChange}  
                            />
                        </div>

                        <div>
                            <Radio 
                            size = 'sm'
                            name='salary_inc_type'
                            label='Amount' 
                            color='blue'
                            value='value'
                            checked={incNewValues.salary_inc_type === 'value'} 
                            onChange={handleIncrementTypeChange}
                            />
                        </div>
                    </div>
                    
                    
                    
                </div>
                
                {incNewValues.salary_inc_type === 'percent' && (
                    <div>
                        <Input label='Percentage' type='number' color='blue' name='inc_amount'  value={incNewValues.inc_amount} onChange={handleChangeIncValues}/>
                    </div>
                )}
                
                {incNewValues.salary_inc_type === 'value' && (
                    <div>
                        <Input label='Amount' type='number' color='blue' name='inc_amount'  value={incNewValues.inc_amount} onChange={handleChangeIncValues}/>
                    </div>
                )}
                
    
                
                <div>
                    <Input label='Effective From' type='date' color='blue' name='effective_from' 
                    
                    value={incNewValues.effective_from} 
                    onChange={handleChangeIncValues}
                    />
                </div>
                
                <div>
                    <Textarea label='Increment Detail' color='blue' name='increment_detail' 
                    value={incNewValues.increment_detail} 
                    onChange={handleChangeIncValues}
                    />
                </div>
                
                <div>
                    <SubmitButton loading={loading} title='Increment'/>
                </div>
    </div>
            
        </form>
    </div>
    
    </>
  )
}

export default SalaryIncrement