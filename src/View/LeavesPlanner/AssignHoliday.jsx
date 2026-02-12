import React from 'react'
import { FaCalendarAlt, FaPen } from "react-icons/fa";

const AssignHoliday = (props) => {
  const { handleChangeAddPublicHoliday, addPublicHolidaysValue, handleAddPublicHoliday } = props
  
  return (
    <form className='flex flex-col gap-6 font-poppins' onSubmit={handleAddPublicHoliday}>
      <div className='grid grid-cols-2 gap-5'>
        <div className='space-y-2'>
          <label className='text-gray-600 text-xs font-bold uppercase tracking-wide flex items-center gap-2'>
            <FaCalendarAlt className="text-blue-500" /> From Date
          </label>  
          <input 
            className='w-full text-white text-[12px] rounded-md py-[8px] px-[17px] border border-gray-400 outline-none bg-white/10 placeholder:text-white/70 [color-scheme:dark]'
            className='w-full text-gray-800 text-sm rounded-xl py-3 px-4 border border-gray-200 bg-gray-50/50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 cursor-pointer'
            type='date'
            name='start_date'
            value={addPublicHolidaysValue.start_date} 
            onChange={handleChangeAddPublicHoliday}
          />
        </div>
        <div className='space-y-2'>
          <label className='text-gray-600 text-xs font-bold uppercase tracking-wide flex items-center gap-2'>
            <FaCalendarAlt className="text-blue-500" /> To Date
          </label>  
          <input 
            className='w-full text-white text-[12px] rounded-md py-[8px] px-[17px] border border-gray-400 outline-none bg-white/10 placeholder:text-white/70 [color-scheme:dark]'
            className='w-full text-gray-800 text-sm rounded-xl py-3 px-4 border border-gray-200 bg-gray-50/50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 cursor-pointer'
            type='date' 
            name='end_date'
            value={addPublicHolidaysValue.end_date}
            onChange={handleChangeAddPublicHoliday}
          />
        </div>
      </div>
      
      <div className='space-y-2'>
          <label className='text-gray-600 text-xs font-bold uppercase tracking-wide flex items-center gap-2'>
            <FaPen className="text-blue-500" /> Description
          </label>
          <textarea 
              rows="4" 
              name='description'
              value={addPublicHolidaysValue.description}
              onChange={handleChangeAddPublicHoliday}
              placeholder="Enter description..."
              className='text-white text-[12px] rounded-md py-[10px] px-[17px] border border-gray-400 outline-none resize-none bg-white/10 placeholder:text-white/70'
              className='w-full text-gray-800 text-sm rounded-xl py-3 px-4 border border-gray-200 bg-gray-50/50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 resize-none leading-relaxed'
              placeholder="Enter holiday details..."
          ></textarea>
      </div>
      
      <div className='pt-2'>
        <button 
          type="submit"
          disabled={addPublicHolidaysValue.loading}
          className="bg-white/20 border border-white text-white px-6 py-2 rounded-md font-medium text-[14px] hover:bg-white/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {addPublicHolidaysValue.loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </>
          ) : 'Mark Holiday'}
        </button>
      </div>
    </form>
  )
}

export default AssignHoliday