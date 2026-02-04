import React, { useEffect } from 'react'
import CustomButton from '../../../Components/CustomButton/CustomButton'
import { Typography } from '@material-tailwind/react'
import useNewAdjustRequest from '../../../ViewModel/AttendanceViewModel/newAdjustRequest'
import PortalDrawer from '../../../Components/CustomDrawer/PortalDrawer'
import CreateNewRequest from '../../Attendance/CreateNewRequest'
import useEmpTimeAdjustmentServices from '../../../ViewModel/EmpViewModel/EmpTimeAdjustment/EmpTimeAdjustmentService'
import { formatDateDMY, formatTimeTo12Hour } from '../../../services/__dateTimeServices'
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';

const tableHeader=[
  "Actual Time",
   "Adjustment Date", "Requested Time", "Detail", "Status"
]


const EmpTimeAdjustment = () => {
    const {formValue, handleChangeAdjustRequest,toggleAddNewAdjustRequest, NewAdjustRequest,handleNewTimeRequest} = useNewAdjustRequest()

    const {getTimeAjustmentData, timeAjustmentData} = useEmpTimeAdjustmentServices()
    useEffect(()=>{
        getTimeAjustmentData()
    },[]);

    console.log('timeAjustmentData', timeAjustmentData)
  return (
    <>
    <div className='flex flex-col gap-4 py-2 lg:px-2 md:px-2 px-0'>
        
        <div className='flex justify-between items-center'>
            <span className='text-[20px] #212529 font-medium font-Urbanist'>Time Adjustment Request</span>
            <button className='bg-bgBlue  capitalize py-2 px-4 font-medium text-[12px] rounded-[10px] text-white hover:bg-blue-600 cursor-pointer' onClick={NewAdjustRequest}>
                New Request
            </button>
            {/* <CustomButton 
                backgroundColor='bg-bgBlue'
                title="New Request"
                onClick={NewAdjustRequest}
            /> */}
        </div>
        <div className='w-full bg-white rounded-[10px] p-2 drop-shadow-md'>
            <div className="relative w-full min-h-[calc(100vh-100px)] overflow-auto customScroll">
                <table className="lg:min-w-full min-w-[600px] table-fixed text-center border-collapse">
                    <colgroup>
                        <col style={{width: "10%"}} />
                        <col style={{width: "10%"}} />
                        <col style={{width: "20%"}} />
                        <col style={{width: "30%"}} />
                        <col style={{width: "10%"}} />
                    </colgroup>
                    <thead className='sticky top-[-9px] bg-[#F8F9FA]'>
                    <tr>
                        {tableHeader.map((head, i) => (
                            <th
                            key={i}
                            className='bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4'
                            >
                            <Typography
                                // variant="small"
                                // color="#292929"
                                className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                            >
                                {head}
                            </Typography>
                            </th>
                        ))}
                        </tr>
                    </thead>
                    <tbody>
                {timeAjustmentData?.length > 0 ? (
                    (() => {
                    const validData = timeAjustmentData.filter(ele => ele && ele._id);
                    return validData.map((ele, index) => {
                            const isLast = index === validData.length - 1;
                            const classes = isLast ? "px-[clamp(4px,0.8vw,12px)] py-4"
                                                   : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";


                            return (
                                <tr key={ele._id || index}>
                                    <td className={`${classes}`}>
                                        <Typography
                                            // variant="small"
                                            // color="blue-gray"
                                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                                        >
                                            {ele?.entry_time ? formatDateDMY(ele.entry_time) : 'Invalid Date'}
                                        </Typography>
                                    </td>
                                    <td className={`${classes}`}>
                                        <Typography
                                            // variant="small"
                                            // color="blue-gray"
                                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                                        >
                                            {ele?.form_data?.date ? formatDateDMY(ele?.form_data?.date) : 'Invalid Date'}
                                        </Typography>
                                    </td>
                                    <td className={`${classes}`}>
                                        <Typography
                                            // variant="small"
                                            // color="blue-gray"
                                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                                        >
                                            <span className='text-[#292929] font-medium'>In time:</span> {formatTimeTo12Hour(ele?.form_data?.in_time || '')}, <span className='text-[#292929] font-medium'>Out time:</span> {formatTimeTo12Hour(ele?.form_data?.out_time || '')}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography
                                            // variant="small"
                                            // color="blue-gray"
                                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                                        >
                                            {ele?.form_data?.reason}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography
                                            // variant="small"
                                            className={`font-normal px-4 py-1 rounded-[7px] w-[100px] text-xs inline-block ${ele?.status === 0 ? 'bg-[#FFF1D9] text-[#FDA006]' : ele?.status === 1 ? 'bg-[#DBFFF5] text-[#0ACF97]' : 'bg-[#FFF0F4] text-[#FF4979]'}`}
                                        >
                                            {ele?.status === 0 ? 'Pending' : ele?.status === 1 ? "Approved" : "Rejected"}
                                        </Typography>
                                    </td>
                                </tr>
                            );
                        });
                    })()
                ) : (
                    <tr>
                        <td colSpan={5} className="p-4">
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <img src={noRecordFound} alt="No record found" className='w-80' />
                            <span className="text-[#292929] font-medium text-[16px]">
                                No details found!
                            </span>
                        </div>
                        </td>
                    </tr>
                )}

                </tbody>
                        
                </table>
            </div> 
        </div>
    </div>
    {formValue.show && 
        <PortalDrawer 
            open= {formValue.show}
            closeDrawer = {toggleAddNewAdjustRequest}
            compo={
                <CreateNewRequest 
                    formValue = {formValue}
                    handleChangeAdjustRequest={handleChangeAdjustRequest}
                    handleNewTimeRequest={handleNewTimeRequest}
                    isAdminSide={false}
                    employeeList={[]}
                    selectedEmployee={null}
                    handleEmployeeChange={() => {}}
                />
            }
            title="New Request"
            widthSize = {800}
        />
    }
    </>
  )
}

export default EmpTimeAdjustment