import React, { useEffect } from 'react'
import CustomSelect from '../../../Components/CustomSelect/CustomSelect'
import { Typography } from '@material-tailwind/react'
import useEmpAttendanceServices from '../../../ViewModel/EmpViewModel/EmpAttendanceViewModel/EmpAttendanceServices'
import useEmpDashboard from '../../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices'
import {getFormattedDate, formatDateDMY, secondsIntoHrs } from '../../../services/__dateTimeServices'
import { FaCheck, FaExclamation, FaX, FaCalendarCheck } from 'react-icons/fa6'
import { getAllMonths, getAllYears } from '../../../services/__appServicesData'

import { IoIosTime } from "react-icons/io";


const tableHeader = [
  "Date", "Attendance visual", "Earned Hours", "Expected Hours", "Arrival", "Log"
]

const EmpAttendance = () => {

  const { gettingEmpAttendanceData,empAttendancData,calculateEarlyLeave, 
    selectedValue,handleSelectAttendance, 
    handleMobileBaseAttendance
  } = useEmpAttendanceServices();
  const { empDashboardData } = useEmpDashboard();
  
  useEffect(()=>{
    // Pass current month and year for initial load
    gettingEmpAttendanceData({
      month: selectedValue.month.value,
      year: selectedValue.year.value
    })
  },[selectedValue.month.value, selectedValue.year.value])


  const months = getAllMonths()
  const years = getAllYears()


  const attendanceDetails = empAttendancData?.attendance_detail
  console.log('attendanceDetails', attendanceDetails)
  const attendance = empAttendancData?.attendance_detail?.attendance
  const lastPolicy = attendanceDetails?.last_policy
  // Try different possible property names for perDayTimings
  const perDayTimings = lastPolicy?.perDayTimings || lastPolicy?.per_day_timings
  // Fallback to working_days if perDayTimings is not available
  const workingDays = lastPolicy?.working_days || [];
  const personalInfo = empAttendancData?.personal_info

  // Local utility function to calculate duration from HH:MM format
  function getDuration(starting_time, closing_time) {
    if (!starting_time || !closing_time) return null;
  
    const parseTime = (timeStr) => {
      if (typeof timeStr !== "string") return null;
  
      const [time, modifier] = timeStr.split(" ");
      if (!time || !modifier) return null;
  
      let [hours, minutes] = time.split(":").map(Number);
  
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
  
      return hours * 60 + minutes;
    };
  
    const start = parseTime(starting_time);
    const end = parseTime(closing_time);
  
    if (start == null || end == null) return null;
    if (end < start) return null;
  
    const durationMinutes = end - start;
  
    // 👇 THIS is the money line
    return Number((durationMinutes / 60).toFixed(1));
  }

  function convertToAmPm(time) {
    // time = "08:00"
    let [hour, minute] = time.split(":");
    hour = Number(hour);
  
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // convert 0 → 12
  
    return `${hour}:${minute} ${ampm}`;
};

const webAttendance = empDashboardData?.section1?.web_attendance_status;


  // Custom formatter for arrival time: "4 hours, 30 min"
  const formatArrivalTime = (seconds) => {
    if (seconds <= 0) {
      return '0';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    let timeString = '';

    if (hours > 0) {
      timeString += `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    if (minutes > 0) {
      if (hours > 0) timeString += ', ';
      timeString += `${minutes} min`;
    }

    return timeString || '0 min';
  };

  return (
    <div className='flex flex-col gap-4 p-2' >
        
      <div className=''>
        <span className='text-[20px] #212529 font-medium font-Urbanist'>Attendance</span>
      </div>
      <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3'>
        <div className='bg-bgBlue px-1 py-3 drop-shadow-md space-y-4 rounded-[7px] text-white'>
          <div className='grid grid-cols-2 px-4'>
            <div className='text-[14px] font-medium'>
              <span>Earned / Expected Hours</span>
            </div>
            <div className='flex flex-col'>
              <span>{personalInfo?.name}</span>
              <span className='text-[13px]'>{secondsIntoHrs(attendanceDetails?.earned)} / {secondsIntoHrs(attendanceDetails?.total)}</span>
            </div>
          </div>
          <div className='h-[1px] bg-white'></div>
          <div className='grid grid-cols-2 px-4'>
            <div className='text-[14px] font-medium'>
              <span>Present / Total Days</span>
            </div>
            <div className='flex flex-col'>
              <span>{personalInfo?.name}</span>
              <span className='text-[13px]'>{(attendanceDetails?.present_days)} / {(attendanceDetails?.total_days)} Days</span>
            </div>
          </div>
        </div>
        <div className='drop-shadow-md rounded-[7px] bg-white px-3 py-2'>
          <div className='flex flex-col gap-1 text-[13px] text-customBlack-100'>
            <div className='flex items-center gap-1'>
              <IoIosTime className='text-[18px] text-bgBlue' />
              <span className='text-[14px] font-medium mt-1 text-[#292929]'>Assigned Time</span> 
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center justify-center gap-2'>
                <span className='text-[12px] text-[#292929] font-medium'>Working Days: </span>
                <span className='text-[11px]'>{workingDays?.length}</span>
              </div>
              <div className='flex items-center justify-center gap-2'>
                <span className='text-[12px] text-[#292929] font-medium'>Duration:</span>
                <span className="text-[11px]">
                  {getDuration(
                    attendanceDetails?.last_policy?.starting_time,
                    attendanceDetails?.last_policy?.closing_time
                  ) || "--"} hrs
                </span>
              </div>
              <div className='flex items-center justify-center gap-2'>
                <span className='text-[12px] text-[#292929] font-medium'>Leniency Time:</span>
                <span className='text-[11px]'>{attendanceDetails?.last_policy?.leniency_time || 0} min</span>
              </div>
            </div>
            <div className='flex items-center gap-2 pt-2'>
              {workingDays?.map((day,i)=>(
                <span className='w-[35px] h-[30px] flex items-center justify-center bg-bgBlue text-white rounded-lg text-[10px]' key={i}>{day.substring(0, 3)}</span>
              ))}
            </div>           
            <div className='grid grid-cols-3 items-center justify-center text-white text-[12px] pt-2'>
              <div className='bg-bgBlue w-full ps-3 rounded-[6px]'>
                <span>{attendanceDetails?.last_policy?.starting_time || '--:--'}</span>
              </div>
              <div className='bg-white border-t border-b border-bgBlue w-full h-3'>
              </div>
              <div className='bg-bgBlue w-full text-right pe-3 rounded-[6px]'>
                <span>{attendanceDetails?.last_policy?.closing_time || '--:--'}</span>
              </div>
            </div>
            <div className='grid grid-cols-1 text-center justify-center items-center'>
              <div className='flex items-center justify-center text-[11px] gap-2'>
                <span className=''>Break</span>
              </div>
            </div>
          </div>
        </div>
        <div className='bg-bgBlue rounded-[7px] px-3 pt-3 space-y-1 drop-shadow-md'>
          <div className='text-white text-[14px] font-medium'>
            <span>Action</span>
          </div>
          <div className='flex items-center justify-center text-white text-[12px]'>
            <span>{getFormattedDate()}</span>
          </div>
          <div className='flex flex-col items-center justify-center text-white text-[20px] pb-2'>
            <span>{attendanceDetails?.is_even_or_odd === 'Odd' ? 'Login' : 'Logout'} Time</span>
            <span>{attendanceDetails?.login_time}</span>
         
            {/* {webAttendance === 0 ? <button className='bg-white text-bgBlue py-[9px] px-4 rounded-[8px] text-[13px] hover:bg-gray-100 transition-all duration-300 hover:text-gray-700' onClick={() => {handleMobileBaseAttendance({
              operation: 'set_attendance',
              user_id: personalInfo?.emp_id,
              web_attendance: true
            })}}>Check In</button> : <button className='bg-white text-bgBlue py-[9px] px-4 rounded-[8px] text-[13px] hover:bg-gray-100 transition-all duration-300 hover:text-gray-700' onClick={() => {handleMobileBaseAttendance({
              operation: 'set_attendance',
              user_id: personalInfo?.emp_id,
              web_attendance: false
            })}}>Check Out</button>} */}

{webAttendance !== 0 && (
  <button
    className="bg-white text-bgBlue py-[9px] px-4 rounded-[8px] text-[13px]
               hover:bg-gray-100 transition-all duration-300 hover:text-gray-700"
    onClick={() =>
      handleMobileBaseAttendance({
  
        user_id: personalInfo?.emp_id,
     
      })
    }
  >
    Check In
  </button>
)}

            
          </div>
        </div>
      </div>
          
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className="font-medium">Attendance Monthly Logs</span>
          <div className='flex items-center gap-2'>
            <CustomSelect 
              placeHolderTitle='Month'
              value = {selectedValue?.month}
              options={months?.map((month) => ({ value: month.id, label:month.title}))}
              onChangeHandler={(selectedOption) => handleSelectAttendance(selectedOption, 'month')}
              
              />
            <CustomSelect 
              placeHolderTitle='Year'
              value={selectedValue?.year}
              options={years?.map((year) => ({ value: year, label:year}))} 
              onChangeHandler={(selectedOption) => handleSelectAttendance(selectedOption, 'year')}
              
             
            />
          </div>
        </div>
        <div className='bg-white rounded-lg p-2 drop-shadow-md w-full overflow-x-auto'>
          <table className="min-w-full text-left bg-white">
            <thead className='sticky top-[-9px] bg-[#F8F9FA]'>
                <tr>
                {tableHeader?.map((head,i) => (
                    <th
                        key={i}
                        className="py-4 px-2"
                    >
                        <Typography
                            variant="small"
                            color="#292929"
                            className="font-medium font-Urbanist leading-none opacity-80 capitalize"
                        >
                            {/* {head} */}
                            {head}
                        </Typography>
                    </th>
                ))}
                </tr>
            </thead>
             <tbody>
              {(() => {
                const filteredAttendance = attendance?.filter((ele) => {
                    // Filter by selected month and year
                    const attendanceDate = new Date(ele.date * 1000);
                    const attendanceMonth = attendanceDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
                    const attendanceYear = attendanceDate.getFullYear();
                    
                    return attendanceMonth === selectedValue.month.value && 
                           attendanceYear === selectedValue.year.value &&
                           ele.att_label !== "H"; // Also filter out holidays
                }) || [];

                return filteredAttendance.length > 0 ? (
                    filteredAttendance.map((ele, index) => {
                        const isLast = index === attendance.length - 1;
                        const classes = isLast ? "p-2" : "p-2 border-b border-[#F2F2F9]";
                        const arrivalTimeSeconds = Math.max(0, ele?.expected - ele?.earned);
                        const arrivalTime = formatArrivalTime(arrivalTimeSeconds);

                        return (
                            <tr key={ele.id || ele.date || index}>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        color="bgBlue"
                                        className="font-normal"
                                    >
                                        {formatDateDMY(ele?.date)}
                                    </Typography>
                                </td>
                                
                                <td className={classes}>
                                  <div className="font-normal text-bgBlue">
                                    {(() => {
                                        const expected = ele?.expected || 1; // Ensure no division by zero
                                        const earned = Math.max(0, ele?.earned);
                                        const fillPercentage = Math.min((earned / expected) * 100, 100); // Cap at 100%

                                        // Inline style for a gradient background based on the range
                                        const style = {
                                            background: `linear-gradient(to left, #3DA5F4 ${fillPercentage}%, #FFFFFF ${fillPercentage}%)`
                                        };

                                        return (
                                            <div className="w-[50%] h-5">
                                                {/* Progress bar with gradient */}
                                                <div className="h-full rounded-[10px] border border-bgBlue" style={style}></div>
                                            </div>
                                        );
                                    })()}
                                  </div>
                                </td>

                                
                                <td className={classes}>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                  >
                                    <div className='flex items-center gap-3'>
                                      {(() => {
                                        const difference = ele?.expected - ele?.earned;
                                        let bgColorClass = 'bg-white'; // Default color
                                        let style = {}; // Inline style for the gradient

                                        if (difference === 0) {
                                          bgColorClass = 'bg-bgBlue'; // Full color class when no difference
                                        } else if (difference > 0) {
                                          const expected = ele?.expected || 1; // Prevent division by zero
                                          const earned = Math.max(0, ele?.earned);
                                          const fillPercentage = Math.min((earned / expected) * 100, 100); // Cap at 100%

                                          // Create a linear gradient with a color fill proportional to the difference
                                          style = {
                                            background: `linear-gradient(to top, #3DA5F4 ${fillPercentage}%, #FFFFFF ${fillPercentage}%)`
                                          };
                                        }

                                        return (
                                          <span
                                            className={`w-5 h-5 flex rounded-full ${bgColorClass} border border-bgBlue`}
                                            style={style} // Apply the inline style
                                          ></span>
                                        );
                                      })()}
                                      <span>
                                        {secondsIntoHrs(ele?.earned)}
                                      </span>
                                    </div>
                                  </Typography>

                                </td>
                                <td className={classes}>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                  >
                                    {secondsIntoHrs(ele?.expected)}
                                  </Typography>
                                </td>
                                {ele?.att_label === "A" ? (
                                  <td className={classes}>
                                    <Typography
                                      variant="small"
                                      color="blue-gray"
                                      className="font-normal"
                                    >
                                      <div className='flex items-center gap-2'>
                                        <span className='text-red-600 text-[12px]'><FaX /></span>
                                        <span>Absent</span>
                                      </div>
                                    </Typography>
                                  </td>
                                ) : ele?.att_label === "MAL" ? (
                                  <td className={classes}>
                                    <Typography
                                      variant="small"
                                      color="blue-gray"
                                      className="font-normal"
                                    >
                                      <div className='flex items-center gap-2'>
                                        <span className='text-purple-600 text-[13px]'><FaCalendarCheck /></span>
                                        <span>Monthly Allowed Leave</span>
                                      </div>
                                    </Typography>
                                  </td>
                                ) : !ele?.early_leave ? (
                                  <td className={classes}>
                                    <Typography
                                      variant="small"
                                      color="blue-gray"
                                      className="font-normal"
                                    >
                                      {arrivalTime === "0" ?
                                        <div className='flex items-center gap-2'>
                                          <span className='text-customGreen-200 text-[18px]'><FaCheck /></span>
                                          <span>On time</span>
                                        </div>
                                      :
                                        <div className='flex items-center gap-2'>
                                          <span className='text-customYellow-100 text-[18px]'><FaExclamation /></span>
                                          <span>{arrivalTime}</span>
                                        </div>
                                      }
                                    </Typography>
                                  </td>
                                ) : (
                                  <td className={classes}>
                                    <Typography
                                      variant="small"
                                      color="blue-gray"
                                      className="font-normal"
                                    >
                                      <div className='flex items-center gap-2'>
                                        <span className='text-[#3da5f4] text-[18px]'><FaExclamation /></span>
                                      
                                        <span className='text-[13px]'>Early Leave</span>
                                      </div>
                                    </Typography>
                                  </td>
                                )}
                                <td className={classes}>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                  >
                                    <div className='flex items-center justify-start'>
                                      {ele?.att_label === "A" ? (
                                        <span className='bg-red-600 w-5 h-5 flex items-center justify-center text-white rounded-full !text-[12px]'>
                                          <FaX />
                                        </span>
                                      ) : ele?.att_label === "MAL" ? (
                                        <span className='bg-purple-600 w-5 h-5 flex items-center justify-center text-white rounded-full !text-[12px]'>
                                          <FaCheck />
                                        </span>
                                      ) : arrivalTime === "0" ? (
                                        <span className='bg-customGreen-200 w-5 h-5 flex items-center justify-center text-white rounded-full !text-[12px]'>
                                          <FaCheck />
                                        </span>
                                      ) : ele?.early_leave ? (
                                        <span className='bg-[#3da5f4] w-5 h-5 flex items-center justify-center text-white rounded-full !text-[12px]'>
                                          <FaExclamation />
                                        </span>
                                      ) : (
                                        <span className='bg-customYellow-100 w-5 h-5 flex items-center justify-center text-white rounded-full !text-[12px]'>
                                          <FaExclamation />
                                        </span>
                                      )}
                                    </div>
                                  </Typography>
                                </td>
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan={6} className="p-2 text-center">
                            No attendance logs found
                        </td>
                    </tr>
                );
              })()}

            </tbody>
                
        </table>
        </div>
      </div>
    </div>
  )
}

export default EmpAttendance