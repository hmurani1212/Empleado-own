import { Checkbox, Input } from '@material-tailwind/react'
import React from 'react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import useShiftManagement from '../../ViewModel/ShiftManagementViewModel/ShiftManagementServices'

const AddTeamForm = () => {
  const {handleAddNewTeam, handleChangeTeam, newTeamValues, handleCheckboxChange, isAddingTeam} = useShiftManagement()
  return (
    <>
    <form onSubmit={(e) => handleAddNewTeam(e)}>
        <div className='flex flex-col gap-4'>
            <div>
                <Input label='Team Name' color='blue' name='team_name' value={newTeamValues.team_name} onChange={handleChangeTeam}/>
            </div>

            <div className="flex flex-col gap-2 text-[14px]">
            <span className='text-[13px] font-medium text-gray-700'>Please select the offdays</span>
              <div>
                <Checkbox label='Mon' color='blue' name='Mon' onChange={handleCheckboxChange} value='Mon'/>
                <Checkbox label='Tue' color='blue' name='Tue' onChange={handleCheckboxChange} value='Tue'/>
                <Checkbox label='Wed' color='blue' name='Wed' onChange={handleCheckboxChange} value='Wed'/>
                <Checkbox label='Thu' color='blue' name='Thu' onChange={handleCheckboxChange} value='Thu'/>
                <Checkbox label='Fri' color='blue' name='Fri' onChange={handleCheckboxChange} value='Fri'/>
                <Checkbox label='Sat' color='blue' name='Sat' onChange={handleCheckboxChange} value='Sat'/>
                <Checkbox label='Sun' color='blue' name='Sun' onChange={handleCheckboxChange} value='Sun'/>
              </div>
            </div>

            <div>
              <SubmitButton loading={isAddingTeam} />
            </div>
            
        </div>
    </form>
    </>
  )
}

export default AddTeamForm