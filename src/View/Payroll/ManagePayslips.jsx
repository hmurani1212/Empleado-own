import React, { useEffect, useRef } from 'react'
import { customManageSlip } from '../../services/__payrollServices'
import { motion } from "framer-motion"
import { useLocation } from 'react-router-dom'
import useManagePaySlip from '../../ViewModel/PayrollViewModel/ManagePaySlipServces'
import GeneratePaySlip from './GeneratePaySlip'
import MakingPayments from './MakingPayments'


const ManagePayslips = () => {
  const location = useLocation()
  const { managePaySlip, managePaySlipState } = useManagePaySlip()
  const hasProcessedNavigation = useRef(false)
  const lastProcessedPath = useRef('')
  
  // Automatically show MakingPayments if navigated from payslip preview
  useEffect(() => {
    const showMakingPayments = location.state?.showMakingPayments === true
    const currentPath = location.pathname
    
    // Check if this is a new navigation with the showMakingPayments flag
    if (showMakingPayments) {
      // Only process once per navigation
      if (!hasProcessedNavigation.current || lastProcessedPath.current !== currentPath) {
        hasProcessedNavigation.current = true
        lastProcessedPath.current = currentPath
        
        // Find the Making Payment card (id: 2)
        const makingPaymentCard = customManageSlip.find(card => card.id === 2)
        if (makingPaymentCard && managePaySlip) {
          managePaySlip(makingPaymentCard)
        }
        
        // Clear the state immediately to prevent re-triggering
        // Do this synchronously to prevent any re-renders
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title)
        }
      }
    } else {
      // Reset flag when state is not present
      if (currentPath !== lastProcessedPath.current) {
        hasProcessedNavigation.current = false
        lastProcessedPath.current = currentPath
      }
    }
    // Only depend on pathname to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
  return (
    <>
      <div className='flex items-center justify-center px-2'>
        <div className='flex lg:flex-row md:flex-row flex-col items-center gap-3 py-2'>
          {customManageSlip.map((ele)=>(
            <motion.div
              whileHover={{ scale: 1.01 }} 
              key={ele.id}
              className='flex items-center w-[250px] rounded-[15px] p-2 cursor-pointer px-4 py-10'
              style={{backgroundColor:ele.bgColor}}
              onClick={()=>managePaySlip(ele)}
            >
              <div className='flex items-center space-x-4'>
                <div className='flex items-center justify-center rounded-full bg-white p-2 w-[40px] h-[40px]'>
                  <span className='text-[25px]' style={{color:ele.color}}>{ele.icon}</span>
                </div>
                <span className='font-semibold text-[14px] text-white font-Poppins'>{ele.title}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {managePaySlipState.view === 1 ? 
      (
        <GeneratePaySlip />
      )
      :
      managePaySlipState.view === 2 ?
      (
        <MakingPayments />
      )
      :
      null

    }
    </>

  )
}

export default ManagePayslips