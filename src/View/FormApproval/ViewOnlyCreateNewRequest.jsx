import React from 'react'

const ViewOnlyCreateNewRequest = (props) => {
    const { formValue, handleChangeAdjustRequest, isReadOnly = false } = props
    
    return (
        <div className='space-y-2 p-4'>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Date</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='date' 
                    name='date' 
                    onChange={handleChangeAdjustRequest}
                    value={formValue.date}
                    disabled={isReadOnly}
                />
            </div>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>In Time</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='time' 
                    name='inTime'
                    onChange={handleChangeAdjustRequest}
                    value={formValue.inTime} 
                    disabled={isReadOnly}
                />
            </div>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Out Time</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='time' 
                    name='outTime'
                    onChange={handleChangeAdjustRequest}
                    value={formValue.outTime} 
                    disabled={isReadOnly}
                />
            </div>
            <div className='flex items-center justify-between'>
                <div className='flex-1 flex flex-col px-2 space-y-1'>
                    <label className='text-[#698592] text-[12px]'>Reason</label>
                    <textarea 
                      rows="3" 
                      name="reason"
                      className='text-[#333333] text-[12px] rounded-md py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                      onChange={handleChangeAdjustRequest}
                      value={formValue.reason}
                      disabled={isReadOnly}
                    >
                    </textarea>
                </div>
            </div>
        </div>
    )
}

export default ViewOnlyCreateNewRequest
