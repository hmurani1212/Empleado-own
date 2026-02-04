import { Input } from '@material-tailwind/react'
import { propTypesChildren } from '@material-tailwind/react/types/components/accordion'
import React from 'react'
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'

const EditTimeAdjustment = (props) => {
  const {handleEditRequestedAdj, editValues,handleChangeReqAdj, loading} = useAttendance()
  // console.log('data for edit',editValues)

  return (
    <>
    <form onSubmit={(e) => handleEditRequestedAdj(e)}>
      <div className='flex flex-col space-y-4'>
        <div>
            <span className='text-[12px]'>Person has requested the following timings</span>
        </div>

        <div>
            <Input label='In Time' color='blue' type='time' name='in_time' value={editValues.in_time} onChange={handleChangeReqAdj}/>
        </div>

        <div>
            <Input label='Out Time' color='blue' type='time' name='out_time' value={editValues.out_time} onChange={handleChangeReqAdj}/>
        </div>

        <div>
          <SubmitButton loading={loading} />
        </div>
    </div>

    </form>
   
    </>
  )
}

export default EditTimeAdjustment