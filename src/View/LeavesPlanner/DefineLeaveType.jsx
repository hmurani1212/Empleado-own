import { Button, Input, Option, Radio, Select } from '@material-tailwind/react'
import React from 'react'
import { getAllMonths } from '../../services/__appServicesData'
import useLeavesPlanner from '../../ViewModel/LeavePlannerViewModel/LeavePlannerServices'

const DefineLeaveType = ({groupId}) => {
  const {addLeaveTypeValues, handleLeaveTypesValue, addDefineLeaveType, handleSelectChangeMonth, isLoading } = useLeavesPlanner()
  const months = getAllMonths()
  return (
    <>
    
      <form onSubmit={(e) => addDefineLeaveType(e,groupId)}>
        <div className='flex flex-col gap-4'>
          <div className='w-100'>
            <Input label='Leave Title' color='blue' name='leave_title' value={addLeaveTypeValues.leave_title} onChange={handleLeaveTypesValue}></Input>
          </div>

          <div className='flex justify-between'>
          <div className='w-[47%]'>
            <Select color="blue" label='Calender From' className=' h-11' placeholder='Select Month' name='calendar_from' onChange={(value) => handleSelectChangeMonth('calendar_from', value)}>
                {months.map((month)=>(
                  <Option key={month.id} value={month.id}>{month.title}</Option>
                ))}
            </Select>
          </div>

          <div className='w-[47%]'>
            <Select color="blue" label='Calender Upto' className=' h-11' placeholder='Select Month' name='calendar_upto' onChange={(value) => handleSelectChangeMonth('calendar_upto', value)}>
                {months.map((month)=>(
                  <Option key={month.id} value={month.id}>{month.title}</Option>
                ))}
            </Select>
          </div>
      </div>

      <div className='flex justify-between'>
          <div className='w-[47%]'>
            <Input label='Quantity(number of leaves)' type='number' color='blue' name='quantity' value={addLeaveTypeValues.quantity} onChange={handleLeaveTypesValue} min='0' step='1'></Input>
          </div>
          <div className='w-[47%]'>
            <Select color="blue" label='Unit' className=' h-11' placeholder='Select Month' name='leave_unit' onChange={(value) => handleSelectChangeMonth('leave_unit', value)}>
                <Option value='day' name='day'>Days</Option>
                <Option value='hour' name='value'>Hours</Option>
            </Select>
          </div>
      </div>

      <div className='flex justify-between'>
          <div className='w-[47%]'>
            <Input label='Carry Forward (No. of years)' type='number' min='0' color='blue' name='carry_forward' value={addLeaveTypeValues.carry_forward} onChange={handleLeaveTypesValue}></Input>
          </div>

          <div className='w-[47%]'>
            <Input label='Consecutive Allowed' className='text-[8px]' placeholder='Type Number of Consecutive allowed' type='number' color='blue' name='consecutive' value={addLeaveTypeValues.consecutive} onChange={handleLeaveTypesValue} min='1' step='1'></Input>
          </div>
      </div>

      <div className='flex justify-between text-[14px]'>
          <div className='w-[47%]'>
            <label className='block'>Prorated</label>
            <Radio color='blue' label='Yes' name='prorated' value="1" onChange={handleLeaveTypesValue} />
            <Radio color='blue' label='No' name='prorated' value="0" onChange={handleLeaveTypesValue}/>
          </div>

          <div className='w-[47%]'>
            <label className='block'>Encashable</label>
            <Radio color='blue' label='Yes' value="1" name="encashable" onChange={handleLeaveTypesValue}/>
            <Radio color='blue' label='No' value="0" name="encashable" onChange={handleLeaveTypesValue}/>          
          </div>
      </div>

      <label className='text-[14px]'>For New Joiners Applicable After</label>
      <div className='flex justify-between'>
          <div className='w-[47%]'>
            <Input label='Years' type='number' color='blue' name='new_joiners_after_year' value={addLeaveTypeValues.new_joiners_after_year} onChange={handleLeaveTypesValue} min='0' step='1'></Input>
    
          </div>
          <div className='w-[47%]'>
            <Input label='Months'  type='number' color='blue' name='new_joiners_after_months' value={addLeaveTypeValues.new_joiners_after_months} onChange={handleLeaveTypesValue} min='0' step='1'></Input>
          </div>
      </div>

      <div className='text-[14px]'>
        <label>Are these leaves paid?</label>
        <div className='flex'>
      
          <Radio
            color='blue'
            value="1"
            label='Yes' 
            name = 'paid'
            onChange={handleLeaveTypesValue}
            />
          <Radio 
            color='blue'
            value="0" 
            label='No' 
            name = 'paid'
            onChange={handleLeaveTypesValue}
            />
        </div>
      </div>
        </div>
        <div>
            <Button 
              type='submit' 
              className='bg-blue-300 py-[10px] capitalize'
              loading={isLoading}
              disabled={isLoading}
            > 
              Submit
            </Button>
        </div>

      </form>
   
    </>
  )
}

export default DefineLeaveType