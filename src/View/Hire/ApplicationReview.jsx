import React from 'react'

const ApplicationReview = (props) => {
  const {viewPending} = props
  return (
    <>
    <div className='p-4'>
    {viewPending?.reviews?.map((ele, i) => (
      <div key={i} className='p-4'>
      <div>
      <img className='w-[50px] h-[50px]' src={ele.dp}></img>
      </div>

      <div className='flex text-[12px]'>
        <div>
          <span className='text-[#3da5f4] font-semibold'>{ele.name}</span>
        </div>

        <div>
          <span className='text-[#9b9b9b]'> | {ele.app_status} | </span>
        </div>

        <div>
          <span className='text-[#9b9b9b]'>{ele.timestamp}</span>
        </div>
      </div>
      <div>
          <span className='text-[#9b9b9b] text-[12px]'>{ele.comment}</span>
        </div>
    </div>
        
    ))}
      

    </div>
   
    
    </>
  )
}

export default ApplicationReview