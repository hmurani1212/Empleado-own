import { Card, CardBody } from '@material-tailwind/react'
import React from 'react'

const CustomCard = (props) => {
    const {logo, title, data} = props
  return (
    <Card  className="border border-bgBlue shadow-none bg-[#EFF8FF] rounded-[8px] p-2 h-[100px] flex justify-center">
        <CardBody className='p-1'>
            <div className='flex items-center gap-4 text-[12px]'>
                <div className='text-white flex items-center text-[20px] justify-center bg-bgBlue aspect-square rounded-full w-[40px] h-[40px]'>
                    {logo}
                </div>
                <div className=''>
                    <div className='font-medium font-Urbanist text-[#474747] text-[13px]'>{title}</div>
                    <div className='font-semibold font-Urbanist text-bgBlue text-[12x]'>
                        {(typeof data === 'object' && data !== null) ? data.pay_month: data}
                    </div>
                </div>
            </div>
        </CardBody>
    </Card>
  )
}

export default CustomCard