import React from 'react'

const ApplicationList = (props) => {
    const { data,handleApplicationDetails }  = props
  return (
    <div 
        className={`flex items-center justify-between gap-2 px-2 py-6 cursor-pointer border-b border-b-customGray-300`} 
        onClick={()=>handleApplicationDetails(data)}
    >
        <span className='text-customBlack-100 text-[12px] text-nowrap '>{data.title}</span>
        <span className='text-customBlack-100 text-[10px] text-nowrap'>time</span>
    </div>
  )
}

export default ApplicationList