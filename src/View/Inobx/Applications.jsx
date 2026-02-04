import { Typography } from '@material-tailwind/react'
import React from 'react'


const tableHeaderData = [
    'Approval index', 'Approval Type', 'Approval By', 'Status', 'Last Update Time '
]

const Applications = () => {


  return (
    <div className='space-y-16'>
        <div className='space-y-3 p-6'>
            <span className='text-customBlue'>Application Status</span>
        
            <div className='flex'>
                <div className='flex-1'>
                    <div className='space-x-3'>
                        <span className='text-customBlue text-[15px]'>From</span>
                        <span className='text-customGray-100 text-[14px]'>Test User</span>
                    </div>
                    <div className='space-x-3'>
                        <span className='text-customBlue text-[15px]'>EmpID</span>
                        <span className='text-customGray-100 text-[14px]'>343434</span>
                    </div>
                    <div className='space-x-3'>
                        <span className='text-customBlue text-[15px]'>To</span>
                        <span className='text-customGray-100 text-[14px]'>Test User</span>
                    </div>
                </div>
                <div className='flex-1'>
                    <div className='flex-1'>
                        <div className='space-x-3'>
                            <span className='text-customBlue text-[15px]'>Subject</span>
                            <span className='text-customGray-100 text-[14px]'>Leave Request</span>
                        </div>
                        <div className='space-x-3'>
                            <span className='text-customBlue text-[15px]'>Application Type</span>
                            <span className='text-customGray-100 text-[14px]'>Paid</span>
                        </div>
                        <div className='space-x-3'>
                            <span className='text-customBlue text-[15px]'>Application Detaisl</span>
                            <span className='text-customGray-100 text-[14px]'>Urgent</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className='space-y-3'>
            <span className='text-customBlack-100 p-6'>Approval List</span>
            <div>
                <table className='w-full min-w-max text-left h-full mt-2'>
                    <thead className='sticky top-0 z-20'>
                        <tr>
                            {tableHeaderData?.map((head, i) => (
                                <th key={i} className='border-y border-blue-gray-100 text-center p-4'>
                                <Typography variant='small' color='blue-gray' className='font-normal leading-none opacity-70 capitalize'>
                                    {head}
                                </Typography>
                                </th>
                            ))}    
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='p-4 text-center'>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                >
                                    01
                                </Typography>
                            </td>
                            <td className='p-4 text-center'>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                >
                                    Administrator
                                </Typography>
                            </td>
                            <td className='p-4 text-center'>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                >
                                    Admin
                                </Typography>
                            </td>
                            <td className='p-4 text-center'>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                >
                                    Pending
                                </Typography>
                            </td>
                            <td className='p-4 text-center'>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                >
                                    13 11 2023 10:18Am
                                </Typography>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  )
}

export default Applications