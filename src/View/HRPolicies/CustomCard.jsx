import { Card, CardBody } from '@material-tailwind/react'
import React from 'react'

const CustomCard = (props) => {
    const {logo, title, data} = props
  return (
    <Card  className="border border-[#3DA5F4] bg-[#F8F9FF] shadow-none">
        <CardBody className='p-1'>
            <div className='flex text-[12px]'>
                <div className='pr-[20px] pt-[3px] pl-[2px] text-[#3DA5F4]'>
                    {logo}
                </div>
                <div className=''>
                    <div className='font-bold pb-1'>{title}</div>
                    <div className='pb-1'>
                        {(typeof data === 'object' && data !== null) ? data.pay_month: data}
                    </div>
                </div>
            </div>
        </CardBody>
    </Card>
  )
}

export default CustomCard