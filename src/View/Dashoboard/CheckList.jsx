import React from 'react'
import { BsClock } from 'react-icons/bs'

const CheckList = (props) => {
  const {data} = props 
  const checkList = data.checkListData
  // console.log('checkList', checkList)
  return (
    <div className='space-y-4'>
      <div className=''>
        <span className='text-[#3DA5F4]'>{data.empView.section.title}</span>
      </div>
      <div className='space-y-3 border-t border-gray-500 py-2'>
        {checkList?.map((ele, i)=>(
          <div key={i} className={`space-y-2 py-2 px-4 ${i !== checkList.length - 1 ? 'border-b border-gry-600' : ''}`}>
            <div>
              <span className='text-[#3DA5F4] capitalize'>{ele.title}</span>
            </div>
            <div className='text-[12px] font-semibold'>
              <span>Assigned to</span>
              <span>{ele.person_responsible}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-[#3DA5F4]'><BsClock /></span>
              <span className='text-[11px]'>Deadline</span>
              <span className='text-[11px]'>{ele.deadline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CheckList