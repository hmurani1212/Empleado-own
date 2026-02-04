import React, { useState, useEffect } from 'react';
// import { FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import { getUserData } from '../../Authentication/jwt_decode';
import { ImUserCheck } from "react-icons/im";
import { MdLogout } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import EmployeeFooter from './footer';
import { IoLocationSharp } from "react-icons/io5";
import useDashboard from '../../ViewModel/DashboardViewModel/DashboardServices';
const EmployeeDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDuty, setSelectedDuty] = useState('Daily');
  const [userData, setUserData] = useState(null);
  
  // Get role-based dashboard data
  const { roleBasedData, userRole, loading, fetchRoleBasedData } = useDashboard();

  // console.log('Role-based data:', roleBasedData);

  useEffect(() => {
    // Get user data from JWT token
    const user = getUserData();
    // console.log('EmployeeDashboard loaded with user data:', user);
    setUserData(user);
    
    // Fetch role-based dashboard data
    fetchRoleBasedData();
  }, [fetchRoleBasedData]);

  const [selectedDate, setSelectedDate] = useState(new Date());

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



  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
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

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 flex items-center justify-center">
        </div>
      );
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day);
      const isSelectedDay = isSelected(day);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
             h-12 w-12 flex items-center justify-center cursor-pointer transition-all duration-200
             ${isSelectedDay
              ? 'bg-red-500 text-white rounded-full font-medium'
              : isCurrentDay
                ? 'bg-gray-100 text-gray-900 rounded-full font-medium'
                : 'text-gray-700 hover:bg-gray-50 rounded-full'
            }
           `}
        >
          {day}
        </div>
      );
    }

    return days;
  };




  return (
    <div className="w-full px-4">
      <div className="flex">
        <div className="w-full">
          <div className="bg-white border border-gray-300 rounded-lg shadow-none">
            <div className="flex">
              <div className="w-1/6 pr-4">
                <img
                  src={roleBasedData?.DB_DATA?.dp || "https://emp-beta.veevotech.com/images/icons/empm.jpg"}
                  alt="Profile Picture"
                  className="w-full max-h-fit object-cover rounded"
                />
              </div>
              <div className="w-5/6">
                <div className="flex">
                  <div className="w-full">
                    <span className="text-xl font-poppins font-semibold text-[#474747]" id="emp_name">
                      {roleBasedData?.DB_DATA?.name || "Hassan Raza"}
                    </span>
                  </div>
                </div>
                <div className="flex mt-2 pb-2 border-b border-gray-200">
                  <div className="w-1/3 flex items-center">
                    <span className="text-sm flex flex-row font-poppins text-[#474747] truncate">
                      <IoLocationSharp className='mt-1' /> {roleBasedData?.DB_DATA?.branch?.branch_name || "Islamabad Branch"}
                    </span>
                  </div>
                  <div className="w-5/12 flex items-center">
                    <i className="fas fa-envelope text-gray-500" />
                    <span className="text-sm text-[#474747] ml-2">
                      {roleBasedData?.DB_DATA?.work_email || "kkami5754049@gmail.com"}
                    </span>
                  </div>
                  <div className="w-1/4 flex items-center">
                    <i className="fas fa-phone text-gray-500" />
                    <span className="text-sm text-[#474747] ml-2">
                      +1-234-567-8900
                    </span>
                  </div>
                </div>
                <div className="flex mt-2">
                  <div className="w-1/4">
                    <div className="text-sm text-gray-900 font-bold">
                      Employee ID
                    </div>
                    <span className="text-sm text-gray-700">{roleBasedData?.DB_DATA?.emp_id || "EMP001"}</span>
                  </div>
                  <div className="w-1/4">
                    <div className="text-sm text-gray-900 font-bold">
                      Department
                    </div>
                    <span className="text-sm text-gray-700">{roleBasedData?.DB_DATA?.department?.name || "IT Department"}</span>
                  </div>
                  <div className="w-1/4">
                    <div className="text-sm text-gray-900 font-bold">
                      Designation
                    </div>
                    <span className="text-sm text-gray-700">
                      {roleBasedData?.DB_DATA?.designationObj?.title || "Software Developer"}
                    </span>
                  </div>
                  <div className="w-1/4 relative">
                    <div className="text-sm text-gray-900 font-bold">
                      Working Since
                    </div>
                    <span className="text-sm text-gray-700" id="joining_date">
                      {roleBasedData?.DB_DATA?.join_date ? new Date(roleBasedData.DB_DATA.join_date * 1000).toLocaleDateString() : "15 January 2020"}
                    </span>
                    <div
                      id="hover_elapsed"
                      className="hidden absolute bg-white border border-gray-300 p-2.5 shadow-lg z-50 top-full left-0 w-max"
                    >
                      <span className="text-sm text-gray-700">
                        3 years, 8 months
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-5">
        <div className="flex">
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 col-span-2 pb-2">
                <div className="flex">
                  <div className="w-1/4">
                    <div className="rounded-full flex items-center justify-center" style={{ background: "#0185EA", width: "50px", height: "50px" }}>
                      <ImUserCheck size={23} color='white' />
                    </div>
                  </div>
                  <div className="w-3/4">
                    <div className="text-sm text-gray-900 font-bold">Current status</div>
                    <span className="text-sm" id="working_status">Active</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 col-span-2 pb-2">
                <div className="flex">
                  <div className="w-1/4">
                    <div className="rounded-full flex items-center justify-center" style={{ background: "#68BAA8", width: "50px", height: "50px" }}>
                      <MdLogout size={23} color='white' />
                    </div>
                  </div>
                  <div className="w-3/4">
                    <div className="text-sm text-gray-900 font-bold">Login time</div>
                    <span className="text-sm" id="login_time">09:00 AM</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 col-span-2 pb-2">
                <div className="flex">
                  <div className="w-1/4">
                    <div className="rounded-full flex items-center justify-center" style={{ background: "#0185EA", width: "50px", height: "50px" }}>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-3/4">
                    <div className="text-sm text-gray-900 font-bold">Working policy</div>
                    <span className="text-sm" id="emp_hr_policy">Full Time</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 col-span-4 pb-2">
                <div className="flex">
                  <div className="w-1/4">
                    <div className="rounded-full flex items-center justify-center" style={{ background: "#FDB775", width: "50px", height: "50px" }}>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-3/4 overtime_data relative">
                    <div className="text-sm font-bold" style={{ color: "#000;" }}>Expected / Earned</div>
                    <span className="text-sm" id="emp_expected_hour">8</span>
                    <span className="text-sm">/</span>
                    <span className="text-sm emp_earned_hour">7.5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Section - Kill Laziness with Cat GIF */}
      <div className="w-full mt-5">
        <div className="flex">
          <div className="w-full">
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="p-6 relative">
                <div className="flex items-center justify-between">
                  {/* Left side - Quote text */}
                  <div className="flex items-start space-x-4">
                    <div className="text-6xl font-bold text-purple-600">"</div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-4xl font-bold text-white">Kill</span>
                        <span className="text-4xl font-bold bg-orange-500 text-white px-3 py-1 rounded">Laziness</span>
                      </div>
                      <div className="text-2xl text-orange-400 font-medium">Start Working Today!123</div>
                    </div>
                  </div>

                  {/* Middle - Cat GIF */}
                  <div className="flex items-center justify-center">
                    <img
                      src="https://emp-beta.veevotech.com/emp/assets/img/cat.gif"
                      alt="Sleeping cat with laptop"
                      className="w-32 h-24 object-contain"
                    />
                  </div>

                  {/* Right side - Plus icon */}
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 cursor-pointer">
                      <FaPlusCircle className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Triangle icon in bottom right */}
                <div className="absolute bottom-4 right-4">
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-orange-500 transform rotate-45"></div>
                    <div className="absolute top-1 left-1 w-4 h-4 bg-orange-500 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Duties Section */}
      <div className="w-full mt-5">
        <div className="flex">
          <div className="w-full">
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="p-6">
                {/* Duties Title */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Duties</h3>
                </div>

                {/* Frequency Buttons */}
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <button className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
                    Daily
                  </button>
                  <button className="px-6 py-2 bg-teal-500 text-white rounded-full text-sm font-medium hover:bg-teal-600 transition-colors">
                    Weekly
                  </button>
                  <button className="px-6 py-2 bg-purple-400 text-white rounded-full text-sm font-medium hover:bg-purple-500 transition-colors">
                    Monthly
                  </button>
                  <button className="px-6 py-2 bg-orange-400 text-white rounded-full text-sm font-medium hover:bg-orange-500 transition-colors">
                    Yearly
                  </button>
                </div>

                {/* No Task Message */}
                <div className="text-center">
                  <p className="text-gray-600 font-medium">No Task assigned yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Calendar and Attendance Section */}
      <div className="w-full mt-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Side - Calendar */}
          <div className="w-full lg:w-2/3 mx-3">
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 min-h-[400px]">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
                </button>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>

                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Day of week labels */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map((day) => (
                  <div key={day} className="h-10 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </div>
          </div>

          {/* Right Side - Attendance Metrics */}
          <div className="w-full lg:w-1/3 space-y-4">
            {/* Current Date */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
              <div className="text-lg font-bold text-gray-800 mb-4">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>

              {/* Color Legend */}
              <div className="text-sm text-gray-500 mb-3">Color Representation</div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-500">Present</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-500">Holiday</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-500">Leave</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-500">Missed Logout</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-500">Absent</span>
                </div>
              </div>
            </div>

            {/* Total Absentees */}
            <div className="bg-white border border-blue-500 rounded-lg shadow-sm h-12">
              <div className="flex h-full">
                <div className="w-1/4 bg-blue-500 rounded-l-lg flex items-center justify-center">
                  <div className="text-white text-base font-semibold">20</div>
                </div>
                <div className="flex-1 flex items-center px-3">
                  <span className="text-sm text-gray-500">Total Absentees</span>
                </div>
              </div>
            </div>

            {/* Monthly Allowed Leaves */}
            <div className="bg-white border border-teal-500 rounded-lg shadow-sm h-12">
              <div className="flex h-full">
                <div className="w-1/4 bg-teal-500 rounded-l-lg flex items-center justify-center">
                  <div className="text-white text-base font-semibold">0</div>
                </div>
                <div className="flex-1 flex items-center px-3">
                  <span className="text-sm text-gray-500">Monthly Allowed Leaves</span>
                </div>
              </div>
            </div>

            {/* Annual Leaves */}
            <div className="bg-white border border-purple-500 rounded-lg shadow-sm h-12">
              <div className="flex h-full">
                <div className="w-1/4 bg-purple-500 rounded-l-lg flex items-center justify-center">
                  <div className="text-white text-base font-semibold">1/15</div>
                </div>
                <div className="flex-1 flex items-center px-3">
                  <span className="text-sm text-gray-500">Annual Leaves (Availed/Total)</span>
                </div>
              </div>
            </div>

            {/* Late Minutes */}
            <div className="bg-white rounded-lg shadow-sm h-12">
              <div className="flex h-full">
                <div className="w-1/2 bg-yellow-500 rounded-l-lg flex flex-col items-center justify-center py-1">
                  <div className="text-white text-sm font-semibold text-center border-b border-white w-4/5">
                    210
                  </div>
                  <div className="text-white text-xs font-semibold text-center mt-0.5">
                    Allowed Late min.
                  </div>
                </div>
                <div className="w-1/2 bg-green-500 rounded-r-lg flex flex-col items-center justify-center py-1">
                  <div className="text-white text-sm font-semibold text-center border-b border-white w-4/5">
                    0
                  </div>
                  <div className="text-white text-xs font-semibold text-center mt-0.5">
                    used Late min
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Powered by Veevo Tech */}
      <EmployeeFooter />
    </div >

  );
};

export default EmployeeDashboard;
