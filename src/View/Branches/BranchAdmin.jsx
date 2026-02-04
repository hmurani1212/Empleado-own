import { Typography } from '@material-tailwind/react'
import React from 'react'
import { FaUserTie } from "react-icons/fa";

const BranchAdmin = (props) => {
    // sarmad
    const { data } = props 
    // console.log('data', data) 
  return (
    <>
    <div className='flex flex-col space-y-4'>
      {data?.map((ele, index) => {
        return(
          <div key={index} className='flex item-center gap-3'>
            <div>
              <FaUserTie className='text-[#8bc9f8]'/>
            </div>

            <div>
              <Typography
              variant='small'
              >
                {ele.name}
              </Typography>

            </div>
            
          </div>
        )
      })}
    </div>
    </>
  )
}

export default BranchAdmin