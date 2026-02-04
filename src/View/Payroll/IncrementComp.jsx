import { Input, Radio, Textarea } from '@material-tailwind/react'
import React, { useState } from 'react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import useManageEmpSalary from '../../ViewModel/PayrollViewModel/ManageEmpSalaryServices'

const IncrementComp = (props) => {
  const {data} = props
  const {expectedSalary, handleInputChange, updateEmpSalary,  handleUpdateEmpSalary, handleUpdateTypeChange, handleChangeUpdate, loading} = useManageEmpSalary()


  return (
    <>
    <div>
        <form onSubmit = {(e) => {e.preventDefault(); handleUpdateEmpSalary(e)}}>
            <div className='text-[12px] flex flex-col space-y-4 px-[1vw]'>
                <hr />
                <div>
                    <div className=''>
                        <label className='text-[14px]'>Increment Type</label>
                    </div>
                    
                    <div className='flex gap-4'>
                        <div>
                            <Radio
                            name='type'
                            label='Increment Percentage'
                            color='blue'
                            value='percent'
                            checked={updateEmpSalary.inc_type === 'percent'}
                            onChange={handleUpdateTypeChange}
                            />
                        </div>
                        
                        <div>
                            <Radio
                            name='type'
                            label='Increment Amount'
                            color='blue'
                            value='amount'
                            checked={updateEmpSalary.inc_type === 'amount'}
                            onChange={handleUpdateTypeChange}
                            />
                        </div>
                    </div>
                    
                    {updateEmpSalary.inc_type === 'percent' && (
                        <div>
                            <Input 
                            color='blue'
                            label = 'Percent'
                            name = 'amount'
                            value={updateEmpSalary.amount}
                            onChange={handleInputChange}
                            type='number' />
                        </div>
                    )}
                    
                    {updateEmpSalary.inc_type === 'amount' && (
                        <div>
                            <Input 
                            color='blue' 
                            label='Amount'
                            name = 'amount'
                            value={updateEmpSalary.amount}
                            onChange={handleInputChange}
                            type='number'/>
                        </div>
                    )}
                </div>


                <div className='flex gap-3'>
                    <div>
                        <span className='font-semibold'>Current Salary</span>
                    </div>
                    <div>
                        <span>{data.temp_salary.toLocaleString()}</span>
                    </div>
                </div>

                <div className='flex gap-3'>
                    <div>
                        <span className='font-semibold'>Expected Salary</span>
                    </div>
                    <div>
                        <span>{isNaN(expectedSalary) ? '0' : expectedSalary.toLocaleString()}</span>
                    </div>
                </div>

                <div>
                    <Input color='blue' label='Effective from' type='date' name='effectiveFrom' value={updateEmpSalary.effectiveFrom} onChange={handleChangeUpdate}/>
                </div>

                <div>
                    <Textarea color='blue' label='Increment Detail' name='increment_detail' value={updateEmpSalary.increment_detail} onChange={handleChangeUpdate}/>
                </div>

                <div>
                    <Textarea color='blue' label='Email Body' name='hr_comments' value={updateEmpSalary.hr_comments} onChange={handleChangeUpdate}/>
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

export default IncrementComp