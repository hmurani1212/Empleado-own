import { Card, CardBody } from '@material-tailwind/react'
import { FaCalendarAlt } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import React from 'react'
import useShiftManagement from '../../ViewModel/ShiftManagementViewModel/ShiftManagementServices';
import { motion } from "framer-motion"

const TeamCards = (props) => {
    const {allShiftTeams, display, handleTeamCard} = props
   
    // console.log('all Shift Teams', allShiftTeams)
  return (
    <div className={display}>
        {allShiftTeams?.map((ele, index) => (
            <motion.button
            whileHover={{ scale: 1.04 }}
            key={index}
            >

            <Card className='border border-bgBlue bg-[#EFF8FF] w-[160px] h-[120px] cursor-pointer rounded-[10px] shadow-none py-2' onClick={() => handleTeamCard(ele)}>
            <CardBody className='p-0 text-[14px] flex flex-col items-center justify-center bg-[#EFF8FF] rounded-[10px] w-full space-y-2'>
                <div className='rounded-full flex justify-center items-center h-[35px] w-[35px] bg-bgBlue' >
                    <FaUsers className='text-[18px] text-white '/>
                </div>
                <div className='col-span-2 px-2 flex flex-col space-y-4 w-full'>
                    <div className='flex flex-col items-center justify-center'>
                        <span className='text-[12px] font-medium font-Urbanist text-[#474747]'>{ele.name}</span>
                        <div className='text-[9px] flex gap-1 items-center'>
                            <FaCalendarAlt className='text-bgBlue'/>
                            <div>
                                {ele.off_days}
                            </div>
                            <div className='text-red-500'>Off</div>

                        </div>   
                    </div>

                    <div className='text-[9px] flex items-end gap-1 justify-end w-full h-full'>
                        
                        <div className='flex items-center gap-1'>
                            <FaUsers className='text-[9px] text-bgBlue'/>
                            <span className='text-[9px] font-medium font-Urbanist text-[#474747]'>{`Total ${ele.members} member(s)`}</span>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
        </motion.button>

        ))}
        
    </div>
  )
}

export default TeamCards