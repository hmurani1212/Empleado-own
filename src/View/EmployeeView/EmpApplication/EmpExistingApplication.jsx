import { Typography } from '@material-tailwind/react'
import React, { useEffect } from 'react'
import useEmpApplcationServices from '../../../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpApplicationServices'
import { formatDateDMY } from '../../../services/__dateTimeServices'
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';
import { motion } from 'framer-motion';

const tableHeader = [
  "Emp ID", "Name", "Subject", "Apply For", "Submission Date", "Status"
]

const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100/50">
        {[...Array(6)].map((_, i) => (
            <td key={i} className="px-[clamp(4px,0.8vw,12px)] py-4">
                <div className="h-4 bg-gray-200/50 rounded-md w-3/4 mx-auto"></div>
            </td>
        ))}
    </tr>
);

const EmpExistingApplication = () => {
  const {getAllEmpExistingApplication,existingApplication, existingApplicationRef, isEmpApplicationLoading} = useEmpApplcationServices()
  useEffect(()=>{
    getAllEmpExistingApplication()
  },[])
  
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='' 
        ref={existingApplicationRef}
    >
      <div className="relative w-full min-h-[calc(100vh-100px)] overflow-auto customScroll rounded-xl border border-gray-100 bg-white/50 backdrop-blur-sm">
        <table className="lg:min-w-full min-w-[600px] table-fixed text-center border-collapse">
        <colgroup>
                        <col style={{width: "15%"}} />
                        <col style={{width: "15%"}} />
                        <col style={{width: "15%"}} />
                        <col style={{width: "15%"}} />
                        <col style={{width: "15%"}} />
                        <col style={{width: "15%"}} />
                    </colgroup>
            <thead className='sticky top-0 z-10'>
                <tr>
                {tableHeader?.map((head,i) => (
                    <th
                        key={i}
                        className="bg-gray-50/90 backdrop-blur-md px-[clamp(4px,0.8vw,12px)] py-5 border-b border-gray-200"
                    >
                        <Typography
                            className="font-semibold text-[clamp(10px,0.9vw,14px)] text-gray-600 font-Urbanist leading-none capitalize tracking-wide"
                        >
                            {head}
                        </Typography>
                    </th>
                ))}
                </tr>
            </thead>
           <tbody className="divide-y divide-gray-100">
              {isEmpApplicationLoading ? (
                  [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : existingApplication?.length > 0 ? (
                existingApplication.map((ele, index) => {
                  return (
                    <motion.tr 
                        key={ele.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-blue-50/30 transition-colors duration-200"
                    >
                      <td className="px-[clamp(4px,0.8vw,12px)] py-4">
                          <Typography
                              className="font-medium text-[clamp(10px,0.8vw,13px)] text-gray-700 font-Urbanist"
                          >
                            {ele?.emp_id}
                          </Typography>
                      </td>
                      <td className="px-[clamp(4px,0.8vw,12px)] py-4">
                          <Typography
                              className="font-medium text-[clamp(10px,0.8vw,13px)] text-gray-800 font-Urbanist"
                          >
                            {ele?.emp_name}
                          </Typography>
                      </td>
                      <td className="px-[clamp(4px,0.8vw,12px)] py-4">
                        <Typography
                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-gray-600 font-Urbanist truncate px-2"
                        >
                          {ele?.subject}
                        </Typography>
                      </td>
                      <td className="px-[clamp(4px,0.8vw,12px)] py-4">
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold border border-blue-100">
                            {ele?.form_name}
                        </div>
                      </td>
                      <td className="px-[clamp(4px,0.8vw,12px)] py-4">
                        <Typography
                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-gray-600 font-Urbanist"
                        >
                          {formatDateDMY(ele?.entry_time)}
                        </Typography>
                      </td>
                      <td className="px-[clamp(4px,0.8vw,12px)] py-4">
                        <div className='flex items-center justify-center'>
                            <span
                                className={`
                                    flex items-center justify-center px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide w-[90px]
                                    ${ele?.status === "Pending" ? 'bg-amber-50 text-amber-500 border border-amber-100' : 
                                      ele?.status === "Approved" ? 'bg-[#DBFFF5] text-[#0ACF97]' :
                                      ele?.status === "Rejected" ? 'bg-red-50 text-red-500 border border-red-100' : 
                                      'bg-gray-50 text-gray-500'}
                                `}
                            >
                                {ele?.status}
                            </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
              })
              ) : (
                <tr>
                  <td colSpan={6} className="p-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center gap-3 text-center"
                    >
                        <img src={noRecordFound} alt="No record found" className='w-64 opacity-80 mix-blend-multiply' />
                        <span className="text-gray-500 font-medium text-sm">
                          No applications found!
                        </span>
                    </motion.div>
                  </td>
                </tr>
              )}

            </tbody>
                
        </table>
      </div>
    </motion.div>
  )
}

export default EmpExistingApplication