import React from 'react'
import useLeavesPlanner from '../../ViewModel/LeavePlannerViewModel/LeavePlannerServices'
import { Button, Input, Option, Select } from '@material-tailwind/react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { Loader2 } from 'lucide-react'

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
    <div className='p-6'>
      <form onSubmit={(e) => addNewLeaveGroup(e)} className="flex flex-col gap-6">
        
        <div className='flex flex-col gap-2'>
            <label className="text-sm font-semibold text-gray-700 font-poppins">Select Branch</label>
            <CustomSelect
                placeHolderTitle="Select Branch"
                value={addGroupValues.branch_id ? {
                    value: addGroupValues.branch_id,
                    label: mergedBranches.find(b => b.id === addGroupValues.branch_id)?.branch_name || 'Select Branch'
                } : null}
                options={mergedBranches.map(b => ({ value: b.id, label: b.branch_name }))}
                onChangeHandler={(option) => handleLeaveBranch('branch_id', option.value)}
                customStyles={false}
            />
        </div>

        <div className='flex flex-col gap-2'>
            <label className="text-sm font-semibold text-gray-700 font-poppins">Group Name</label>
            <Input
              color='blue'
              className='!border !border-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-blue-500 focus:!border-t-blue-500 focus:ring-blue-500/10 rounded-lg'
              labelProps={{
                className: "hidden",
              }}
              placeholder="Enter group name"
              name='name'
              value={addGroupValues.name || ''}
              onChange={handleLeave}
            />
        </div>

        <div className='mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100'>
            <Button 
                type='submit' 
                className='font-poppins font-medium capitalize bg-bgBlue shadow-blue-500/20 hover:shadow-blue-500/40 min-w-[120px] flex items-center justify-center py-2.5 rounded-xl'
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className='animate-spin w-4 h-4' /> : 'Create Group'}
            </Button>
        </div>
      </form>
    </div>
  )
}

export default AddNewLeaveGroup
