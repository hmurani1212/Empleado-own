import { Card, CardBody } from '@material-tailwind/react'
import { FaMoon, FaClock, FaUsers } from "react-icons/fa";
import { TbSunset2 } from 'react-icons/tb'
import React from 'react'
import useShiftManagement from '../../ViewModel/ShiftManagementViewModel/ShiftManagementServices';
import { shiftTime } from '../../services/__shiftServices';
import { IoSunny } from "react-icons/io5";
import { motion } from "framer-motion"


const ShiftCards = (props) => {
    const {shiftPlannersData, handleShiftCard, display} = props
    const {gettingShifts} = useShiftManagement()
    // console.log('props', shiftPlannersData)
  return (
    <>
    <div className={display}>
        {/* sarmad */}
        {shiftPlannersData?.map((ele, index) => (
            <motion.button
            whileHover={{ scale: 1.01 }}
            key={index}
            >
            <Card className={`border w-[260px] cursor-pointer rounded-[10px] shadow-none pl-4 py-2 ${ele.shift_time === 'morning' ? 'border-[#3DA5F4] bg-[#EFF8FF]' : ele.shift_time === 'evening' ? 'border-[#FDA006] bg-[#FFF3DF]' : 'border-[#7D9CB0] bg-[#EFF3F5]'}`}  onClick={() => handleShiftCard(ele)}>
                <CardBody className='p-0 text-[14px] flex items-center space-x-2 h-[75px] w-full'>
                    <div className={`rounded-l-[10px] flex justify-center ${ele.shift_time === 'morning' ? 'bg-[#EFF8FF]'  : ele.shift_time === 'evening' ? 'bg-[#FFF3DF]' :  'bg-[#EFF3F5]'}`} >
                        <div className={`p-2 rounded-full w-[40px] h-[40px] flex items-center justify-center ${ele.shift_time === 'morning' ? 'bg-bgBlue'  : ele.shift_time === 'evening' ? 'bg-[#FDA006]' :  'bg-[#7D9CB0]'}`}>{ele.shift_time === 'morning' ? <TbSunset2 className='text-[22px] text-white'/> : ele.shift_time === 'evening' ? <IoSunny className='text-[22px] text-white' /> : <FaMoon className='text-[22px] text-white'/>}</div>
                    </div>
                    
                    <div className='col-span-2 px-2 space-y-2 flex flex-col w-full'>
                        <div className='flex flex-col'>
                            <div className='flex flex-col text-left text-[12px]'>
                                <div className=' font-medium font-Urbanist text-[#474747]'>
                                    {ele.shift_time === 'night' ? 'Night Shift' : ele.shift_time === 'morning' ? 'Morning Shift' : 'Evening Shift'}
                                </div>
                                
                                <div className='text-[11px] font-normal font-Urbanist text-[#474747]'>{ele.name}</div>
                            </div>
                            
                            <div className='text-[10px] flex items-center gap-1'>
                                <div>
                                    <FaClock className={`${ele.shift_time === 'morning' ? 'text-bgBlue' : ele.shift_time === 'evening' ? 'text-[#FDA006]' :  'text-[#7D9CB0]'}`}/>
                                </div>
                                
                                <div className='text-[#616161]'>
                                    {`${ele.opening_time} - ${ele.closing_time}`}
                                </div>
                            </div>
                        </div>
                        
                        <div className='text-[10px] flex items-center gap-1 justify-end'>
                            <div>
                                <FaUsers className={`${ele.shift_time === 'morning' ? 'text-bgBlue' : ele.shift_time === 'evening' ?  'text-[#FDA006]' : 'text-[#7D9CB0]'}`}/>
                            </div>
                            
                            <div className='text-[#474747]'>
                                {`Total ${ele.teams_count} Team(s)`}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </motion.button>
        ))}
        
    </div>
   
    </>
  )
}

export default ShiftCards