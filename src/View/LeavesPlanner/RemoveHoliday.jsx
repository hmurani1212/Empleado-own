import { Button } from '@material-tailwind/react'
import React from 'react'

const RemoveHoliday = (props) => {
  const {showSingleHoliday,handleRemovePublicHoliday} = props
  return (
    <div className='px-4 pb-4 space-y-4'>
        <div className='flex justify-center w-full px-4'>
          <div className='flex justify-center items-center px-2 border-b-2 border-white w-fit space-x-1'>
            <span className='text-[16px] text-[#474747] font-medium'>Holiday Description |</span>
            <span className='text-[14px] text-[#474747] font-medium pt-[1px]'>{showSingleHoliday?.data?.description}</span>
          </div>
        </div>
        <div className='flex items-center justify-center'>
          <Button
            className="bg-[#ff4979] hover:bg-[#F55E67]/90 cursor-pointer"
            onClick={()=>handleRemovePublicHoliday(showSingleHoliday?.data?.id)}
            loading={showSingleHoliday?.loading}
          >
            <span className='font-medium text-white'>Remove Holiday</span>
          </Button>
        </div>
    </div>
  )
}

export default RemoveHoliday