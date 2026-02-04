import React from 'react'
import useLeavesPlanner from '../../ViewModel/LeavePlannerViewModel/LeavePlannerServices'
import { Button, Input, Option, Select } from '@material-tailwind/react'

const AddNewLeaveGroup = () => {
  const {
    leavesBranches,
    isLoading,
    handleLeaveBranch,
    handleLeave,
    addNewLeaveGroup,
    addGroupValues
  } = useLeavesPlanner()

  // Ensure branches array is safe
  const safeLeavesBranches = Array.isArray(leavesBranches) ? leavesBranches : []

  // Add "All Branches" at the start
  const mergedBranches = [
    { id: 0, branch_name: 'All Branches' },
    ...safeLeavesBranches.filter(
      (ele) => ele && ele.id && ele.branch_name
    )
  ]

  return (
    <>
      <form onSubmit={(e) => addNewLeaveGroup(e)}>
        <div className='flex flex-col gap-4 pt-2'>
          {/* Branch Select */}
          <div className='w-100'>
            <Select
              label='Select Branch'
              color='blue'
              className='h-9'
              name='branch_id'
              value={addGroupValues.branch_id ?? 0}
              onChange={(value) => handleLeaveBranch('branch_id', value)}
            >
              {mergedBranches.map((branch) => (
                <Option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Group Name */}
          <div className='w-100'>
            <Input
              label='Enter Group Name'
              color='blue'
              name='name'
              value={addGroupValues.name || ''}
              onChange={handleLeave}
            />
          </div>

          {/* Submit Button */}
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
        </div>
      </form>
    </>
  )
}

export default AddNewLeaveGroup
