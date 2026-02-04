import React, { useEffect, useState } from 'react'
import CalendarView from './CalendarView'
import { useEmpDashboardFunctions } from '../../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices'
import PortalDrawer from '../../../Components/CustomDrawer/PortalDrawer'
import EmpAnnualLeavesView from './EmpAnnualLeavesView'

const colorRepData = [
    {id:1, title:'Present', color:'#0acf97'},
    {id:2, title:'Holiday', color:'#ffd81a'},
    {id:3, title:'Leave', color:'#6691cc'},
    {id:4, title:'Missed Logout', color:'#010913'},
    {id:5, title:'Absent', color:'#FC563B'},
]

const EmpDashboardAttendance = (props) => {
    const { attendanceData, leaveBalance } = props
    
    const {handleNextMonth, handlePreviousMonth,
        getAttendanceLabel,getBackgroundColor,
        calendarData,
        getExtraAttribute,
        handleSingleDayDate,
        handleAnnualRemLeave,
        annualRemLeaves,
        toggelAnnualLeaves,
        singleAttendance,
        toggleSingleAttendance,
        generateDays

     } = useEmpDashboardFunctions()

     const totalDaysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate();    

    
  return (
    <>
    <div className='grid grid-cols-12 gap-3'>
        <div className='lg:col-span-8 col-span-12 bg-white p-4 rounded-[10px] drop-shadow-md'>
           <CalendarView 
                handlePreviousMonth= {handlePreviousMonth}
                handleNextMonth= {handleNextMonth}
                getBackgroundColor= {getBackgroundColor}
                getAttendanceLabel= {getAttendanceLabel}
                generateDays= {generateDays}
                calendarData = {calendarData}
                getExtraAttribute = {getExtraAttribute}
                handleSingleDayDate = {handleSingleDayDate}
                toggleSingleAttendance = {toggleSingleAttendance}
                singleAttendance = {singleAttendance}

           />
        </div>
        <div className='lg:col-span-4 col-span-12 space-y-3'>
            <div className='flex flex-col gap-2 bg-white drop-shadow-md rounded-[10px] py-4 px-3'>
                <div className='flex flex-col'>
                    <span className='text-[16px] text-[#292929] font-semibold font-Urbanist'>Thu Oct 31</span>
                    <span className='text-[13px] text-[#9B9B9B] font-Urbanist'>Color Representation</span>
                </div>
                <div className='space-y-3'>
                    {colorRepData.map((ele)=>(
                        <div key={ele.id} className='flex items-center gap-5'>
                            <span className='h-8 w-8 rounded-lg' style={{backgroundColor:ele.color}}></span>
                            <span className='text-[13px] text-[#292929] font-Urbanist'>{ele.title}</span>
                        </div>
                    ))}
                </div>
            </div>
            {/* <div className='space-y-3'>
                <div className='flex items-center bg-white rounded-md shadow-md'>
                    <span className='flex-[.3] bg-blueCustom-100 p-4 text-white rounded-tl-[3px] rounded-bl-[3px]'>{attendanceData?.absentees || 0}</span>
                    <span className='flex-1 p-4 text-customGray-500 text-[13px]'>Total Absentees</span>
                </div>
                <div className='flex items-center border border-customGreen-100 rounded-md'>
                    <span className='flex-[.3] bg-customGreen-100 p-4 text-white rounded-tl-[3px] rounded-bl-[3px]'>{attendanceData?.availed_leaves || 0}/{attendanceData?.allowed_leaves || 0}</span>
                    <span className='flex-1 p-4 text-customGray-500 text-[13px]'>Monthly Allowed Leaves</span>
                </div>
                <div className='flex items-center border border-customPurple-500 rounded-md cursor-pointer'
                    onClick={() => handleAnnualRemLeave(attendanceData)}
                >
                    <span className='flex-[.3] bg-customPurple-500 p-4 text-white rounded-tl-[3px] rounded-bl-[3px]'>{attendanceData?.availed || 0}/{attendanceData?.leaves || 0}</span>
                    <span className='flex-1 p-4 text-customGray-500 text-[13px]'>Annual Leaves (Availed/Total)</span>
                </div>
            </div> */}
            <div className='space-y-10 bg-[#FFFFFF] py-4 rounded-[10px] drop-shadow-md px-3'>
                <div className='flex flex-col gap-1'>
                    <div className="flex justify-between items-center">
                        <span className="text-[#292929] text-[14px] font-medium font-Urbanist">Present Days</span>
                        <span className="text-[#292929] text-[14px] font-medium font-Urbanist">{attendanceData?.presents || 0}</span>
                    </div>
                    
                    <div className='w-full h-[10px] bg-[#DDDDDD] rounded-[7px]'>
                        <div className={`h-full bg-[#0acf97] rounded-[7px] transition-all duration-500`}  style={{width: `${((attendanceData?.presents ?? 0) / totalDaysInMonth) * 100}%`,}}></div>
                    </div>
                </div>
                <div className='flex flex-col gap-1'>
                    <div className="flex justify-between items-center">
                        <span className="text-[#292929] text-[14px] font-medium font-Urbanist">Absent Days</span>
                        <span className="text-[#292929] text-[14px] font-medium font-Urbanist">{attendanceData?.absentees || 0}</span>
                    </div>
                    
                    <div className='w-full h-[10px] bg-[#DDDDDD] rounded-[7px]'>
                        <div className={`h-full bg-[#fc563b] rounded-[7px] transition-all duration-500`}  style={{width: `${((attendanceData?.absentees ?? 0) / totalDaysInMonth) * 100}%`,}}></div>
                    </div>
                </div>
                <div className='flex flex-col gap-1'>
                    <div className="flex justify-between items-center">
                        <span className="text-[#292929] text-[14px] font-medium font-Urbanist">Holidays</span>
                        <span className="text-[#292929] text-[14px] font-medium font-Urbanist">{attendanceData?.holidays || 0}</span>
                    </div>
                    
                    <div className='w-full h-[10px] bg-[#DDDDDD] rounded-[7px]'>
                        <div className={`h-full bg-[#ffd81a] rounded-[7px] transition-all duration-500`}  style={{width: `${((attendanceData?.holidays ?? 0) / totalDaysInMonth) * 100}%`,}}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {annualRemLeaves.show &&
        <PortalDrawer 
            open = {annualRemLeaves.show}
            widthSize= {'70vw'}
            title='Leaves Record'
            closeDrawer = {toggelAnnualLeaves}
            compo ={
                <EmpAnnualLeavesView 
                    data = {attendanceData?.leave_balance}
                />
            }
        />
    }
    </>
  )
}

export default EmpDashboardAttendance