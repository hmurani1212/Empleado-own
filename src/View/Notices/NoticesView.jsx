import React from 'react'
import { Card, CardBody } from '@material-tailwind/react'
import { FaBullhorn, FaHome, FaUserAlt } from "react-icons/fa";
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices';
import { formatTimestamp } from '../Branches/utils';
import { BsCalendar } from 'react-icons/bs';
import { TbFileDescription } from 'react-icons/tb';
import { CgNametag } from "react-icons/cg";

const NoticesView = () => {
    const {viewNoticeData} = useNotice()

    return (
       
        <div className='w-full '>
                <div className=" w-[100%] m-auto shadow-none" 

                >
                <div className='p-3'>
                    <div className='flex justify-between'>
                        <div>

                            <span className="flex text-[#03a9f3] text-[30px] items-center">
                                <FaBullhorn />
                                <span className='text-[18px] p-[10px]'>
                                    {viewNoticeData.id}
                                </span>
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <BsCalendar />
                            <span className='text-[13px] text-[black]'>{formatTimestamp(viewNoticeData.timestamp)}</span>
                        </div>
                        
                    </div>
                    <div className='flex flex-col my-3 gap-3'>
                        <div className='flex items-center gap-2'>
                            <span>
                                <CgNametag />
                            </span>

                            <span className="font-semibold">
                                {viewNoticeData.title}
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>

                            <div>
                                <span><TbFileDescription /></span>
                            </div>
                            <div>
                                <span>{viewNoticeData.description}</span>
                            </div>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div>

                            <span className="text-[#03a9f3] flex items-center gap-3">
                                <FaUserAlt />
                            </span>
                        </div>
                        <div>
                            <span className="text-[12px] text-[black]">{viewNoticeData.emp_name ? viewNoticeData.emp_name : "All Branches"}</span>
                        </div>
                        
                    </div>
                    
                </div>
            </div>
                
        </div>
    )
}

export default NoticesView
