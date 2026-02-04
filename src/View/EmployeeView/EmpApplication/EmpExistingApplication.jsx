import { Typography } from '@material-tailwind/react'
import React, { useEffect } from 'react'
import useEmpApplcationServices from '../../../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpApplicationServices'
import { formatDateDMY } from '../../../services/__dateTimeServices'
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';

const tableHeader = [
  "Emp ID", "Name", "Subject", "Apply For", "Submission Date", "Status"
]
const EmpExistingApplication = () => {
  const {getAllEmpExistingApplication,existingApplication, existingApplicationRef} = useEmpApplcationServices()
  useEffect(()=>{
    getAllEmpExistingApplication()
  },[])
  return (
    <div className='' ref={existingApplicationRef}>
      <div className="relative w-full min-h-[calc(100vh-100px)] overflow-auto customScroll">
        <table className="lg:min-w-full min-w-[600px] table-fixed text-center border-collapse">
        <colgroup>
                        <col style={{width: "15%"}} />
                        <col style={{width: "15%"}} />
                        <col style={{width: "15%"}} />
                        <col style={{width: "15%"}} />
                        <col style={{width: "15%"}} />
                        <col style={{width: "15%"}} />
                    </colgroup>
            <thead className='sticky top-[-9px]'>
                <tr>
                {tableHeader?.map((head,i) => (
                    <th
                        key={i}
                        className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4"
                    >
                        <Typography
                            // variant="small"
                            // color="#292929"
                            className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                        >
                            {/* {head} */}
                            {head}
                        </Typography>
                    </th>
                ))}
                </tr>
            </thead>
           <tbody>
              {existingApplication?.length > 0 ? (
                existingApplication.map((ele, index) => {
                  const isLast = index === existingApplication.length - 1;
                  const classes = isLast ? "px-[clamp(4px,0.8vw,12px)] py-4"
                    : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";


                  return (
                    <tr key={ele.id}>
                      <td className={classes}>
                          <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                          >
                            {ele?.emp_id}
                          </Typography>
                      </td>
                      <td className={classes}>
                          <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                          >
                            {ele?.emp_name}
                          </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {ele?.subject}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {ele?.form_name}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {formatDateDMY(ele?.entry_time)}
                        </Typography>
                      </td>
                      <div className='flex items-center justify-center'>
                        <td className={classes}>
                            <Typography
                                // variant="small"
                                className={`font-normal text-center py-1 rounded-[7px] w-[100px] text-[12px] ${ele?.status === "Pending" ? 'bg-[#FFF1D9] text-[#FDA006]' : ele?.status === "Approved" ? 'bg-[#DBFFF5] text-[#0ACF97]' :ele?.status === "Rejected" && 'bg-[#FFF0F4] text-[#FF4979]'}`}
                            >
                                {ele?.status}
                            </Typography>
                        </td>
                      </div>
                    </tr>
                  );
              })
              ) : (
                <tr>
                  <td colSpan={6} className="p-4">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <img src={noRecordFound} alt="No record found" className='w-80' />
                        <span className="text-[#292929] font-medium text-[12px]">
                          No applications found!
                        </span>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>
                
        </table>
      </div>
    </div>
  )
}

export default EmpExistingApplication