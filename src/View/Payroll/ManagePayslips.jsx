import React, { useEffect, useRef } from 'react'
import { customManageSlip } from '../../services/__payrollServices'
import { motion, AnimatePresence } from "framer-motion"
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
    <div className="flex flex-col gap-4">
      {/* Modern Navigation Tabs - Pill Style */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex items-center gap-2">
          {customManageSlip.map((ele) => {
            const isActive = managePaySlipState.view === ele.id;
            return (
              <motion.button
                key={ele.id}
                onClick={() => managePaySlip(ele)}
                className={`
                  relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium
                  transition-all duration-300 ease-out flex-1 sm:flex-none justify-center
                  ${isActive 
                    ? 'text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
                style={{
                  backgroundColor: isActive ? ele.color : 'transparent',
                }}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Icon with animated background */}
                <motion.div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                    isActive ? 'bg-white/20' : 'bg-gray-100'
                  }`}
                  animate={isActive ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <span className="text-lg" style={{ color: isActive ? 'white' : ele.color }}>
                    {ele.icon}
                  </span>
                </motion.div>
                
                <span className="whitespace-nowrap">{ele.title}</span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <div className="w-full h-full rounded-full bg-green-400 animate-pulse" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-2">
        <AnimatePresence mode="wait">
          {managePaySlipState.view === 1 ? (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <GeneratePaySlip />
            </motion.div>
          ) : managePaySlipState.view === 2 ? (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <MakingPayments />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-[60vh]"
            >
              {/* Interactive SVG Illustration */}
              <div className="relative">
                {/* Background circles */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-green-100/50 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ width: '300px', height: '300px', margin: '-50px' }}
                />
                
                {/* Main SVG Illustration */}
                <motion.svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative z-10"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Document/Payslip Base */}
                  <motion.rect
                    x="40"
                    y="30"
                    width="120"
                    height="140"
                    rx="12"
                    fill="white"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                  
                  {/* Header bar */}
                  <motion.rect
                    x="40"
                    y="30"
                    width="120"
                    height="35"
                    rx="12"
                    fill="#3B82F6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  />
                  <motion.rect
                    x="40"
                    y="55"
                    width="120"
                    height="10"
                    fill="#3B82F6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  />
                  
                  {/* Text lines */}
                  <motion.rect x="55" y="80" width="60" height="6" rx="3" fill="#E5E7EB" 
                    initial={{ width: 0 }}
                    animate={{ width: 60 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  />
                  <motion.rect x="55" y="95" width="90" height="6" rx="3" fill="#E5E7EB"
                    initial={{ width: 0 }}
                    animate={{ width: 90 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  />
                  <motion.rect x="55" y="110" width="70" height="6" rx="3" fill="#E5E7EB"
                    initial={{ width: 0 }}
                    animate={{ width: 70 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  />
                  
                  {/* Dollar sign */}
                  <motion.text
                    x="100"
                    y="52"
                    textAnchor="middle"
                    fill="white"
                    fontSize="20"
                    fontWeight="bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      delay: 0.6
                    }}
                  >
                    $
                  </motion.text>
                  
                  {/* Animated coins/elements */}
                  <motion.circle
                    cx="160"
                    cy="50"
                    r="15"
                    fill="#10B981"
                    initial={{ scale: 0, x: -20 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      delay: 1
                    }}
                  />
                  <motion.text
                    x="160"
                    y="55"
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    $
                  </motion.text>
                  
                  {/* Second floating coin */}
                  <motion.circle
                    cx="30"
                    cy="140"
                    r="12"
                    fill="#F59E0B"
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      y: [0, -5, 0]
                    }}
                    transition={{ 
                      scale: { delay: 1.3, type: "spring" },
                      y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  />
                  <motion.text
                    x="30"
                    y="144"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    $
                  </motion.text>
                  
                  {/* Decorative sparkles */}
                  <motion.path
                    d="M170 100 L172 105 L177 107 L172 109 L170 114 L168 109 L163 107 L168 105 Z"
                    fill="#FCD34D"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.path
                    d="M25 70 L26 73 L29 74 L26 75 L25 78 L24 75 L21 74 L24 73 Z"
                    fill="#60A5FA"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, -180, -360]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  />
                </motion.svg>
              </div>
              
              {/* Text Content */}
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Ready to Manage Payslips?
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Select an option above to generate new payslips or process pending payments for your employees.
                </p>
                
                {/* Quick action hints */}
                <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#0ACF97]/10 flex items-center justify-center">
                      <span className="text-[#0ACF97]">📝</span>
                    </div>
                    <span>Generate Payslip</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#3DA5F4]/10 flex items-center justify-center">
                      <span className="text-[#3DA5F4]">💰</span>
                    </div>
                    <span>Make Payments</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ManagePayslips