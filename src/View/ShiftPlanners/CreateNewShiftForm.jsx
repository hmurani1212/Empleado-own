import { Input } from '@material-tailwind/react'
import React from 'react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import useShiftManagement from '../../ViewModel/ShiftManagementViewModel/ShiftManagementServices'

const CreateNewShiftForm = () => {
    const {createNewShift, shiftNewValues, handleChangeShift, isCreatingShift} = useShiftManagement()
  return (
    <>
    <form onSubmit={(e) => createNewShift(e)}>
        <div className='flex flex-col space-y-3' >
            <div>
                <Input label='Shift Name' color='blue' name='shift_name' value={shiftNewValues.shift_name} onChange={handleChangeShift}/>
            </div>
            
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <Input type='time' label='Opening Time' name='opening_time' value={shiftNewValues.opening_time} onChange={handleChangeShift}/>
                </div>
                
                <div>
                    <Input type='time' label='closing Time' name='closing_time' value={shiftNewValues.closing_time} onChange={handleChangeShift}/>
                </div>
            </div>

            <div>
                <SubmitButton loading={isCreatingShift} />
            </div>
        </div>   
    </form>
    </>
  )
}

export default CreateNewShiftForm