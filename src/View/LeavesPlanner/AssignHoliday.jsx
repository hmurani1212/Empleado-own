import React from 'react'

const AssignHoliday = (props) => {
  const { handleChangeAddPublicHoliday,addPublicHolidaysValue, handleAddPublicHoliday } = props
  return (
    <form className='space-y-2' onSubmit={handleAddPublicHoliday}>
      <div className='flex items-center gap-2'>
        <div className='space-y-2 flex-1'>
          <label className='text-white text-[12px]'>From Date</label>  
          <input 
            className='w-full text-white text-[12px] rounded-md py-[8px] px-[17px] border border-gray-400 outline-none bg-white/10 placeholder:text-white/70 [color-scheme:dark]'
            type='date'
            name='start_date'
            value={addPublicHolidaysValue.start_date} 
            onChange={handleChangeAddPublicHoliday}
          />
        </div>
        <div className='space-y-2 flex-1'>
          <label className='text-white text-[12px]'>To Date</label>  
          <input 
            className='w-full text-white text-[12px] rounded-md py-[8px] px-[17px] border border-gray-400 outline-none bg-white/10 placeholder:text-white/70 [color-scheme:dark]'
            type='date' 
            name='end_date'
            value={addPublicHolidaysValue.end_date}
            onChange={handleChangeAddPublicHoliday}
          />
        </div>
      </div>
      <div className='flex flex-col space-y-2'>
          <label className='text-white text-[12px]'>Description</label>
          <textarea 
              rows="7" 
              name='description'
              value={addPublicHolidaysValue.description}
              onChange={handleChangeAddPublicHoliday}
              placeholder="Enter description..."
              className='text-white text-[12px] rounded-md py-[10px] px-[17px] border border-gray-400 outline-none resize-none bg-white/10 placeholder:text-white/70'
          ></textarea>
      </div>
      <div className='flex items-center justify-center'>
        <button 
          type="submit"
          disabled={addPublicHolidaysValue.loading}
          className="bg-white/20 border border-white text-white px-6 py-2 rounded-md font-medium text-[14px] hover:bg-white/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addPublicHolidaysValue.loading ? 'Loading...' : 'Mark Holiday'}
        </button>
      </div>
    </form>
  )
}

export default AssignHoliday