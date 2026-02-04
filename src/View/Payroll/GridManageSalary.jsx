import { Card, CardBody, MenuItem, Typography } from '@material-tailwind/react'
import React from 'react'
import { FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { IoMdMore } from 'react-icons/io'
import { motion } from 'framer-motion';
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';


const GridManageSalary = (props) => {
    const {openMenuPayroll, toggleMenuPayroll, salaryTempDialog, openDialogDelTemp, handleDelete, payrollActionMenu, handleMenuPayroll} = usePayroll()
    const {allSalaryTemp} = props
  return (
    <>
    <div className='grid grid-cols-3 gap-4'>
        {allSalaryTemp?.map((data, index) => (
    <Card className="border border-[#3DA5F4] bg-[#F8F9FF] shadow-none" key={index}>
    <CardBody className='p-4'>
        <div className='flex justify-between'>
          <div>
            <span className='text-[#3DA5F4] font-semibold'>{data.id}</span>
            <span className='text-[13px]'>ID</span>
            </div>

            <div 
            onMouseEnter={() => toggleMenuPayroll(index, true)} onMouseLeave={() => toggleMenuPayroll(index, false)} 
            className='relative'>
            <span className='text-[#9B9B9B] text-[20px] cursor-pointer'>
                <IoMdMore />
            </span>

            {openMenuPayroll[index] && (
                <div className='border border-gray-200 rounded-lg absolute z-10 bg-white left-[-142px] w-[155px] shadow-md' 
                >
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.2 }}
                >
                    
                    <ul className="flex w-full flex-col gap-1">
                    
                    {payrollActionMenu?.map(menuItem => (
                        <MenuItem className='flex items-center justify-between' key={menuItem.id} 
                        onClick={() => handleMenuPayroll(menuItem.id, data)}
                        
                        >
                        <Typography variant="small">{menuItem.title}</Typography>
                            <span>{menuItem.icon}</span>
                        </MenuItem>
                    ))}
                    </ul>
                </motion.div>
                </div>
            )}
        </div>
           
        </div>
        <div className='flex justify-center'>
            <div className='flex flex-col items-center gap-[3px]'>
                <div>
                    <span>{data.name}</span>
                </div>

                <div>
                    <span className='text-[14px] text-[#3DA5F4] font-semibold'>{data.salary_amount}</span>
                </div>
            </div>
        </div>

        <div className='text-[12px] flex flex-col space-y-2'>
            <div className=' flex items-center gap-2'>
                <div className='text-[#3DA5F4]'><FaMapMarkerAlt /></div>
                <span>{data.branch_name}</span>
            </div>

            <div className='flex items-center gap-2'>
                <div className='text-[#3DA5F4]'><FaCalendarAlt /></div>
                <span>{data.creation_time}</span>
            </div>
        </div>

       
    </CardBody>
   
    </Card>
    
    
))}

    <ConfirmationDialog 
    openDialog = {openDialogDelTemp}
    handleOpen= {salaryTempDialog}
    handleConfirm={handleDelete}
    title = {'Confirm Delete'}
    message = {'Are you sure to Delete this Salary Template?'}
    />


    
</div>

    </>
  )
}

export default GridManageSalary