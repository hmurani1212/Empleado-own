import React, { useState, useEffect } from 'react';
import { 
  FaUserCircle, 
  FaCalendarCheck, 
  FaTasks, 
  FaClock, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone, 
  FaBriefcase,
  FaBuilding,
  FaIdCard,
  FaBirthdayCake
} from 'react-icons/fa';
import { IoLocationSharp, IoTimeOutline, IoCheckmarkCircle, IoWarning } from "react-icons/io5";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { MdLogout, MdWorkHistory, MdEmail, MdPhone } from "react-icons/md";
import { getUserData } from '../../Authentication/jwt_decode';
import useDashboard from '../../ViewModel/DashboardViewModel/DashboardServices';
import { Card, CardBody, Avatar, Button, Progress, Typography, Chip } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import EmployeeFooter from './footer';
import EmployeeDashboardSkeleton from './EmployeeDashboardSkeleton';

const EmployeeDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userData, setUserData] = useState(null);
  
  // Get role-based dashboard data
  const { roleBasedData, userRole, loading, fetchRoleBasedData } = useDashboard();

  useEffect(() => {
    // Get user data from JWT token
    const user = getUserData();
    setUserData(user);
    
    // Fetch role-based dashboard data
    fetchRoleBasedData();
  }, [fetchRoleBasedData]);

  if (loading) {
    return <EmployeeDashboardSkeleton />;
  }

  // Calendar Logic
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Safe data access
  const employeeData = roleBasedData?.DB_DATA || {};
  const designation = employeeData?.designationObj?.title || "N/A";
  const department = employeeData?.department?.name || "N/A";
  const branch = employeeData?.branch?.branch_name || "N/A";
  const joinDate = employeeData?.join_date 
    ? new Date(employeeData.join_date * 1000).toLocaleDateString() 
    : "N/A";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6 font-poppins">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto flex flex-col gap-6"
      >
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, <span className="text-brand-500">{employeeData?.name || "Employee"}</span>! 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Here's your daily activity summary.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-brand-50 px-4 py-2 rounded-xl border border-brand-100">
            <div className="p-2 bg-white rounded-lg text-brand-500 shadow-sm">
              <FaCalendarCheck />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Today's Date</p>
              <p className="text-sm font-bold text-gray-800">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile & Quick Stats */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Profile Card */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-brand-400 to-brand-600 relative">
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    <div className="p-1 bg-white rounded-full">
                    {/* <h1>This is image</h1> */}
                      <Avatar 
                        src={employeeData?.dp || "https://emp-beta.veevotech.com/images/icons/empm.jpg"} 
                        alt="Profile" 
                        size="xl" 
                        className="h-24 w-24 border-4 border-white shadow-md"
                      />
                    </div>
                  </div>
                </div>
                <CardBody className="pt-12 text-center">
                  <h2 className="text-xl font-bold text-gray-800">{employeeData?.name || "Employee Name"}</h2>
                  <p className="text-brand-500 font-medium text-sm mt-1">{designation}</p>
                  
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-white rounded-full text-brand-500 shadow-sm">
                        <FaIdCard size={14} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500">Employee ID</p>
                        <p className="text-sm font-semibold text-gray-700">{employeeData?.emp_id || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-white rounded-full text-brand-500 shadow-sm">
                        <HiOutlineOfficeBuilding size={14} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm font-semibold text-gray-700">{department}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-white rounded-full text-brand-500 shadow-sm">
                        <IoLocationSharp size={14} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500">Branch</p>
                        <p className="text-sm font-semibold text-gray-700">{branch}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <Chip 
                        value="Active" 
                        className="bg-green-50 text-green-600 justify-center shadow-none py-1 px-2 rounded-lg font-bold"
                        icon={<span className="w-2 h-2 rounded-full bg-green-500 mt-1"></span>}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Joined</p>
                      <p className="text-sm font-bold text-gray-800">{joinDate}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Quick Status Card */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <CardBody className="p-5">
                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <IoTimeOutline className="text-brand-500" /> Today's Status
                   </h3>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-blue-500 font-bold uppercase mb-1">Login Time</p>
                        <h4 className="text-xl font-bold text-blue-700">09:00 AM</h4>
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex flex-col items-center justify-center text-center">
                        <p className="text-xs text-orange-500 font-bold uppercase mb-1">Late Mins</p>
                        <h4 className="text-xl font-bold text-orange-700">0 min</h4>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col items-center justify-center text-center col-span-2">
                         <div className="flex justify-between w-full mb-1">
                           <span className="text-xs text-purple-500 font-bold uppercase">Working Hours</span>
                           <span className="text-xs text-purple-700 font-bold">7.5 / 8 Hrs</span>
                         </div>
                         <Progress value={90} color="purple" className="h-2 bg-purple-100" />
                      </div>
                   </div>
                </CardBody>
              </Card>
            </motion.div>

          </div>

          {/* Right Column - Dashboard Content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Stats Overview */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { title: "Total Leaves", count: "15", icon: <FaCalendarAlt />, color: "bg-teal-500" },
                 { title: "Leaves Taken", count: "2", icon: <MdWorkHistory />, color: "bg-pink-500" },
                 { title: "Attendance", count: "95%", icon: <IoCheckmarkCircle />, color: "bg-brand-500" },
                 { title: "Pending Tasks", count: "0", icon: <FaTasks />, color: "bg-orange-500" },
               ].map((stat, index) => (
                 <Card key={index} className="shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                   <CardBody className="p-4 flex flex-col items-center text-center">
                      <div className={`p-3 rounded-full text-white mb-3 shadow-sm ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{stat.count}</h3>
                      <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
                   </CardBody>
                 </Card>
               ))}
            </motion.div>

            {/* Attendance Calendar & Metrics */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Calendar */}
              <Card className="md:col-span-2 rounded-2xl shadow-card border border-gray-100">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaCalendarAlt className="text-brand-500" /> Attendance Calendar
                    </h3>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                      <button onClick={() => navigateMonth('prev')} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500">
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700 w-24 text-center">
                        {monthNames[currentDate.getMonth()]}
                      </span>
                      <button onClick={() => navigateMonth('next')} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500">
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                    {dayNames.map(day => (
                      <div key={day} className="text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells */}
                    {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-10 md:h-12" />
                    ))}
                    
                    {/* Days */}
                    {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                      const day = i + 1;
                      const isCurrent = isToday(day);
                      const isSel = isSelected(day);
                      // Random status for demo - replace with actual data logic
                      const status = day % 7 === 0 ? 'absent' : day % 6 === 0 ? 'leave' : 'present'; 
                      
                      let bgClass = "bg-gray-50 text-gray-700 hover:bg-gray-100";
                      if (status === 'present') bgClass = "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100";
                      if (status === 'absent') bgClass = "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100";
                      if (status === 'leave') bgClass = "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-100";
                      if (isSel) bgClass = "ring-2 ring-brand-500 ring-offset-2 " + bgClass;

                      return (
                        <motion.div
                          key={day}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDateClick(day)}
                          className={`
                            h-10 md:h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all font-medium text-sm relative
                            ${bgClass}
                          `}
                        >
                          {day}
                          {isCurrent && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-500 rounded-full"></span>}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>

              {/* Metrics */}
              <div className="flex flex-col gap-4">
                 <Card className="rounded-2xl shadow-card border border-gray-100 flex-1">
                   <CardBody className="p-5 flex flex-col justify-center h-full gap-4">
                      <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Summary</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                           <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
                             <span className="text-sm font-medium text-gray-700">Present</span>
                           </div>
                           <span className="text-sm font-bold text-green-700">22 Days</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                           <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-red-500"></div>
                             <span className="text-sm font-medium text-gray-700">Absent</span>
                           </div>
                           <span className="text-sm font-bold text-red-700">1 Day</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                           <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                             <span className="text-sm font-medium text-gray-700">Leaves</span>
                           </div>
                           <span className="text-sm font-bold text-orange-700">2 Days</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                           <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                             <span className="text-sm font-medium text-gray-700">Holidays</span>
                           </div>
                           <span className="text-sm font-bold text-purple-700">4 Days</span>
                        </div>
                      </div>
                   </CardBody>
                 </Card>
              </div>

            </motion.div>

            {/* Duties Section */}
            <motion.div variants={itemVariants}>
               <Card className="rounded-2xl shadow-card border border-gray-100">
                 <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                         <FaTasks className="text-brand-500" /> Assigned Duties
                       </h3>
                       <div className="flex gap-2">
                         {['Daily', 'Weekly', 'Monthly'].map(period => (
                           <button 
                             key={period} 
                             className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                           >
                             {period}
                           </button>
                         ))}
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                         <FaTasks className="text-gray-300 text-2xl" />
                       </div>
                       <p className="text-gray-500 font-medium">No tasks assigned for today!</p>
                       <p className="text-xs text-gray-400 mt-1">Enjoy your day or check back later.</p>
                    </div>
                 </CardBody>
               </Card>
            </motion.div>

          </div>
        </div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-4">
           <EmployeeFooter />
        </motion.div>

      </motion.div>
    </div>
  );
};

export default EmployeeDashboard;
