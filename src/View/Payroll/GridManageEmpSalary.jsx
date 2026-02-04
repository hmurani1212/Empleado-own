import React, { useEffect } from 'react'
import CustomGridCard from '../../Components/CustomGridCard.jsx/CustomGridCard'
import { FaUserAlt, FaBuilding } from "react-icons/fa";
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices';
import { Button, MenuItem, Typography } from '@material-tailwind/react';
import { IoMdMore } from "react-icons/io";
import { motion } from 'framer-motion';
import useManageEmpSalary from '../../ViewModel/PayrollViewModel/ManageEmpSalaryServices';


const GridManageEmpSalary = (props) => {
  const {allEmpSalary} = props
  const {toggleMenuEmpSalary, openMenuEmpSalary, empSalaryActionMenu} = usePayroll()
  const {handleActionManageEmpSalary} = useManageEmpSalary()

  useEffect(() => {
    console.log('allEmpSalary',allEmpSalary)
  })

  return (
    <>
    <div className='grid grid-cols-3 gap-4'>
    {allEmpSalary?.map((ele, index) => (
      <CustomGridCard 
      key = {index}
      id = {ele.id}
      name = {ele.name}
      amount = {ele.salary_with_increaments}
      userIcon = {<FaUserAlt className='text-[#3DA5F4]'/>}
      dataFirst = {ele.name}
      icon = {<FaBuilding className='text-[#3DA5F4]'/>}
      dataSecond = {ele.deptt_name === null ? '-' : ele.deptt_name}
      ActionMenu = {
      <div 
      onMouseEnter={() => toggleMenuEmpSalary(index, true)} onMouseLeave={() => toggleMenuEmpSalary(index, false)} className='relative'>
        <span className='text-[#9B9B9B] text-[20px] cursor-pointer'>
          <IoMdMore />
        </span>
        {openMenuEmpSalary[index] && (
          <div className='border border-gray-200 rounded-lg absolute z-10 bg-white left-[-142px] w-[200px] shadow-md' >
            <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.2 }}
            >
              <ul className="flex w-full flex-col gap-1">
                {empSalaryActionMenu?.map(menuItem => (
                  <MenuItem className='flex items-center justify-between' key={menuItem.id} 
                  onClick={() => handleActionManageEmpSalary(menuItem.id, ele)}
                  // onClick={() => handleMenuItemsHrPolicies(menuItem.id, policy)}
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
          }
      />
    ))}
    </div>
    
    </>
  )
}

export default GridManageEmpSalary