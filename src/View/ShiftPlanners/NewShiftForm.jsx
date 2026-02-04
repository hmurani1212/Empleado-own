import { Button, Input, Option, Select } from '@material-tailwind/react'
import React from 'react'
import useShiftManagement from '../../ViewModel/ShiftManagementViewModel/ShiftManagementServices'

const NewShiftForm = (props) => {
  const {branchesShift} = props
  const {handleBranchShift, handleShiftValues, plannerValues, handleCreatePlanner, isCreatingPlanner} = useShiftManagement()
  
  return (
    <>
    <form onSubmit={(e) => handleCreatePlanner(e)}>
      <div className='flex flex-col gap-4'> 
        <div className=''>
          <Select label='Select Branch' color='blue' className='h-9' name = 'branch'  
          onChange={(value) => handleBranchShift('branch', value)}
          >
            {branchesShift?.map((ele)=>(
            <Option key={`${ele.id}`} value={ele.id}>{ele.branch_name}</Option>
            ))}
          </Select>   
        </div>

        <div>
          <Input label='Planner Name' color='blue' name='planner_name' value={plannerValues.planner_name} onChange={handleShiftValues}/>
        </div>

        <div>
          <Button 
            type='submit' 
            className='bg-[#8bc9f8] capitalize p-2 font-medium text-[12px]'
            loading={isCreatingPlanner}
            disabled={isCreatingPlanner}
          >
            Submit
          </Button>
        </div>

      </div>
      
    </form>
    </>
  )
}

export default NewShiftForm