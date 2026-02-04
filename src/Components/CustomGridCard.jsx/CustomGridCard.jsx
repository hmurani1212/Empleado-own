import { Card, CardBody } from '@material-tailwind/react'
import React from 'react'

const CustomGridCard = (props) => {
    const {id, key, ActionMenu, name, userIcon, icon, dataSecond, dataFirst, amount } = props
  return (
    <>
    <Card className="border border-[#3DA5F4] bg-[#F8F9FF] shadow-none" key={key}>
        <CardBody className='p-4'>
            <div className='flex justify-between'>
                <div>
                    <span className='text-[#3DA5F4] font-semibold text-[13px]'>{id}</span>
                    <span className='text-[13px]'>ID</span>
                </div>
                
                <div>
                    {ActionMenu}
                </div>
           </div>
           
           <div className='flex justify-center'>
            <div className='flex flex-col items-center gap-[3px]'>
                <div>
                    <span>{name}</span>
                </div>

                <div>
                    <div className='text-[14px] text-[#3DA5F4] font-semibold'>{amount} <span className='text-[12px] text-[#9b9b9b]'>PKR</span></div>
                </div>
            </div>
           </div>
           
           <div className='text-[12px] flex flex-col space-y-2'>
            <div className=' flex items-center gap-2'>
                <div className='text-[#3DA5F4]'>{userIcon}</div>
                <span>{dataFirst}</span>
            </div>

            <div className='flex items-center gap-2'>
                <div className='text-[#3DA5F4]'>{icon}</div>
                <span>{dataSecond}</span>
            </div>
        </div>

       
    </CardBody>
   
    </Card>
    </>
  )
}

export default CustomGridCard