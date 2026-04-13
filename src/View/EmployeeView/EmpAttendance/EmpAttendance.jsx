import React, { useEffect } from 'react'
import CustomSelect from '../../../Components/CustomSelect/CustomSelect'
import { Typography, Card, CardBody, Chip, Progress, IconButton, Tooltip } from '@material-tailwind/react'
import useEmpAttendanceServices from '../../../ViewModel/EmpViewModel/EmpAttendanceViewModel/EmpAttendanceServices'
import useEmpDashboard from '../../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices'
import { getFormattedDate, formatDateDMY, secondsIntoHrs } from '../../../services/__dateTimeServices'
import { FaCheck, FaExclamation, FaXmark, FaCalendarCheck, FaClock } from 'react-icons/fa6'
import { IoTimeOutline, IoCalendarOutline, IoFingerPrintOutline } from "react-icons/io5";
import { getAllMonths, getAllYears } from '../../../services/__appServicesData'
import { motion } from 'framer-motion'

const tableHeader = [
  "Date", "Attendance Status", "Earned Hours", "Expected Hours", "Arrival Status", "Action"
]

const EmpAttendance = ({ embedded = false }) => {

  const { gettingEmpAttendanceData, empAttendancData, selectedValue, handleSelectAttendance, handleMobileBaseAttendance } = useEmpAttendanceServices();
  const { empDashboardData, gettingEmpDashboardData } = useEmpDashboard();
  
  // Single fetch on mount and when month/year change; guard against empty params
  useEffect(() => {
    const month = selectedValue.month?.value;
    const year = selectedValue.year?.value;
    gettingEmpDashboardData();
    if (month != null && year != null) {
      gettingEmpAttendanceData({ month, year });
    }
  }, [selectedValue.month?.value, selectedValue.year?.value]);


  const months = getAllMonths()
  const years = getAllYears()

  const attendanceDetails = empAttendancData?.attendance_detail
  const attendance = empAttendancData?.attendance_detail?.attendance
  const lastPolicy = attendanceDetails?.last_policy
  const workingDays = lastPolicy?.working_days || [];
  const personalInfo = empAttendancData?.personal_info
  const webAttendance = empDashboardData?.section1?.mobile_attendance;
  const workingStatus = empDashboardData?.section2?.working_status;
  const loginTime = empDashboardData?.section2?.login_time;

  // Utility function to calculate duration
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
    return Number((durationMinutes / 60).toFixed(1));
  }

  const formatArrivalTime = (seconds) => {
    if (seconds <= 0) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    let timeString = '';
    if (hours > 0) timeString += `${hours} hr${hours > 1 ? 's' : ''}`;
    if (minutes > 0) {
      if (hours > 0) timeString += ', ';
      timeString += `${minutes} min`;
    }
    return timeString || '0 min';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={
        embedded
          ? 'flex flex-col gap-4 font-poppins'
          : 'flex flex-col gap-6 p-4 md:p-6 min-h-screen bg-gray-50/50 font-poppins'
      }
    >
      {/* Header */}
      <motion.div variants={itemVariants} className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
        <div>
           <h1 className='text-2xl font-bold text-gray-800'>My Attendance</h1>
           <p className='text-sm text-gray-500 mt-1'>Track your daily attendance and logs</p>
        </div>
        <div className='flex items-center gap-3'>
            <div className='bg-brand-50 text-brand-600 px-4 py-2 rounded-xl text-sm font-semibold'>
                {getFormattedDate()}
            </div>
            {webAttendance !== 0 && (
              <button
                className="bg-brand-500 text-white py-2 px-6 rounded-xl text-sm font-bold shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95 flex items-center gap-2"
                onClick={() => handleMobileBaseAttendance({ user_id: personalInfo?.emp_id })}
              >
                <IoFingerPrintOutline className="text-lg" /> {workingStatus === 'Duty Time' ? 'Check Out' : 'Check In'}
              </button>
            )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6'>
        
        {/* Hours Summary */}
        <Card className='rounded-2xl shadow-card border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-brand-400 to-brand-600 p-4 text-white'>
                <div className='flex items-center gap-2'>
                    <IoTimeOutline className='text-xl' />
                    <span className='font-bold'>Hours Summary</span>
                </div>
            </div>
            <CardBody className='p-5 space-y-4'>
                <div className='flex justify-between items-center pb-3 border-b border-gray-100'>
                    <span className='text-gray-500 text-sm font-medium'>Earned / Expected Hours</span>
                    <span className='text-brand-600 font-bold'>
                        {secondsIntoHrs(attendanceDetails?.earned)} / {secondsIntoHrs(attendanceDetails?.total)}
                    </span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='text-gray-500 text-sm font-medium'>Present / Total Days</span>
                    <span className='text-green-600 font-bold'>
                        {attendanceDetails?.present_days} / {attendanceDetails?.total_days} Days
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                    <div 
                        className="bg-brand-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((attendanceDetails?.present_days / attendanceDetails?.total_days) * 100, 100)}%` }}
                    ></div>
                </div>
            </CardBody>
        </Card>

        {/* Policy Details */}
        <Card className='rounded-2xl shadow-card border border-gray-100'>
            <CardBody className='p-5 h-full flex flex-col justify-center'>
                <div className='flex items-center gap-2 mb-4 text-gray-800 font-bold text-lg'>
                    <IoCalendarOutline className='text-brand-500' />
                    <span>Policy Details</span>
                </div>
                
                <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-gray-50 p-3 rounded-xl'>
                        <span className='text-xs text-gray-500 block mb-1'>Assigned Time</span>
                        <span className='text-sm font-bold text-gray-800'>
                            {attendanceDetails?.last_policy?.starting_time || '--'} - {attendanceDetails?.last_policy?.closing_time || '--'}
                        </span>
                    </div>
                    <div className='bg-gray-50 p-3 rounded-xl'>
                        <span className='text-xs text-gray-500 block mb-1'>Duration</span>
                        <span className='text-sm font-bold text-gray-800'>
                           {getDuration(attendanceDetails?.last_policy?.starting_time, attendanceDetails?.last_policy?.closing_time) || "--"} hrs
                        </span>
                    </div>
                    <div className='col-span-2 bg-gray-50 p-3 rounded-xl flex justify-between items-center'>
                        <div>
                            <span className='text-xs text-gray-500 block mb-1'>Working Days</span>
                            <div className='flex gap-1'>
                                {workingDays?.map((day,i)=>(
                                    <span key={i} className='w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-[10px] font-bold text-brand-600 shadow-sm'>
                                        {day.substring(0, 1)}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className='text-right'>
                             <span className='text-xs text-gray-500 block mb-1'>Leniency</span>
                             <span className='text-sm font-bold text-orange-500'>{attendanceDetails?.last_policy?.leniency_time || 0} min</span>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>

        {/* Today's Status */}
        <Card className='rounded-2xl shadow-card border border-gray-100 bg-brand-50/50'>
             <CardBody className='p-5 flex flex-col items-center justify-center h-full text-center'>
                 <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-3 text-brand-500 text-2xl'>
                    <FaClock />
                 </div>
                 <h3 className='text-lg font-bold text-gray-800 mb-1'>{workingStatus === 'Duty Time' ? 'Login' : 'Logout'} Time</h3>
                 <p className='text-3xl font-bold text-brand-600 mb-2'>{loginTime || "--:--"}</p>
                 <Chip value="Current Status" size="sm" variant="ghost" color="blue" className="rounded-full" />
             </CardBody>
        </Card>
      </motion.div>
          
      {/* Attendance Logs Table */}
      <motion.div variants={itemVariants} className='space-y-4'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <h2 className="text-xl font-bold text-gray-800">Attendance Monthly Logs</h2>
          <div className='flex items-center gap-3 w-full md:w-auto'>
             <div className="w-full md:w-40">
                <CustomSelect 
                    placeHolderTitle='Month'
                    value={selectedValue?.month}
                    options={months?.map((month) => ({ value: month.id, label:month.title}))}
                    onChangeHandler={(selectedOption) => handleSelectAttendance(selectedOption, 'month')}
                />
             </div>
             <div className="w-full md:w-32">
                <CustomSelect 
                    placeHolderTitle='Year'
                    value={selectedValue?.year}
                    options={years?.map((year) => ({ value: year, label:year}))} 
                    onChangeHandler={(selectedOption) => handleSelectAttendance(selectedOption, 'year')}
                />
             </div>
          </div>
        </div>

        <Card className='rounded-2xl shadow-card border border-gray-100 overflow-hidden'>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className='bg-gray-50 border-b border-gray-200'>
                        <tr>
                            {tableHeader?.map((head,i) => (
                                <th key={i} className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(() => {
                            const filteredAttendance = attendance?.filter((ele) => {
                                const attendanceDate = new Date(ele.date * 1000);
                                const attendanceMonth = attendanceDate.getMonth() + 1;
                                const attendanceYear = attendanceDate.getFullYear();
                                return attendanceMonth === selectedValue.month.value && 
                                    attendanceYear === selectedValue.year.value &&
                                    ele.att_label !== "H";
                            }) || [];

                            return filteredAttendance.length > 0 ? (
                                filteredAttendance.map((ele, index) => {
                                    const arrivalTimeSeconds = Math.max(0, ele?.expected - ele?.earned);
                                    const arrivalTime = formatArrivalTime(arrivalTimeSeconds);
                                    const expected = ele?.expected || 1;
                                    const earned = Math.max(0, ele?.earned);
                                    const fillPercentage = Math.min((earned / expected) * 100, 100);

                                    return (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-6 text-sm font-semibold text-gray-700">
                                                {formatDateDMY(ele?.date)}
                                            </td>
                                            
                                            <td className="py-3 px-6">
                                                <div className="w-32">
                                                    <div className="flex justify-between text-[10px] mb-1 font-medium text-gray-500">
                                                        <span>Progress</span>
                                                        <span>{Math.round(fillPercentage)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div 
                                                            className="bg-brand-500 h-2 rounded-full" 
                                                            style={{ width: `${fillPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="py-3 px-6 text-sm text-gray-600 font-medium">
                                                {secondsIntoHrs(ele?.earned)}
                                            </td>
                                            
                                            <td className="py-3 px-6 text-sm text-gray-600">
                                                {secondsIntoHrs(ele?.expected)}
                                            </td>
                                            
                                            <td className="py-3 px-6">
                                                {ele?.att_label === "A" ? (
                                                     <Chip variant="ghost" color="red" value="Absent" size="sm" icon={<FaXmark />} className="rounded-full px-2" />
                                                ) : ele?.att_label === "MAL" ? (
                                                     <Chip variant="ghost" color="purple" value="Leave" size="sm" icon={<FaCalendarCheck />} className="rounded-full px-2" />
                                                ) : !ele?.early_leave ? (
                                                    arrivalTime === "0 min" ? 
                                                     <Chip variant="ghost" color="green" value="On Time" size="sm" icon={<FaCheck />} className="rounded-full px-2" /> :
                                                     <Chip variant="ghost" color="amber" value={`Late: ${arrivalTime}`} size="sm" icon={<FaExclamation />} className="rounded-full px-2" />
                                                ) : (
                                                     <Chip variant="ghost" color="blue" value="Early Leave" size="sm" icon={<FaExclamation />} className="rounded-full px-2" />
                                                )}
                                            </td>
                                            
                                            <td className="py-3 px-6">
                                                <div className="flex items-center justify-start">
                                                    <Tooltip content={
                                                        ele?.att_label === "A" ? "Absent" : 
                                                        ele?.att_label === "MAL" ? "Leave" : 
                                                        arrivalTime === "0 min" ? "On Time" : 
                                                        "Late"
                                                    }>
                                                        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-xs shadow-sm
                                                            ${ele?.att_label === "A" ? "bg-red-500" : 
                                                              ele?.att_label === "MAL" ? "bg-purple-500" : 
                                                              arrivalTime === "0 min" ? "bg-green-500" : 
                                                              "bg-amber-500"}`
                                                        }>
                                                            {ele?.att_label === "A" ? <FaXmark /> : 
                                                             ele?.att_label === "MAL" ? <FaCheck /> : 
                                                             arrivalTime === "0 min" ? <FaCheck /> : 
                                                             <FaExclamation />}
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <IoCalendarOutline className="text-4xl mb-2 opacity-50" />
                                            <p>No attendance logs found for this month</p>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </table>
            </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default EmpAttendance