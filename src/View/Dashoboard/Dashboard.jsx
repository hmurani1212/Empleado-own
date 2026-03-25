import { HiQuestionMarkCircle } from "react-icons/hi";
import { RiCalendarCheckLine } from "react-icons/ri";
import { motion } from "framer-motion";
import useDashboard from "../../ViewModel/DashboardViewModel/DashboardServices";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import "react-circular-progressbar/dist/styles.css";
import CircularProgress from "./CircularProgress";
import LineChart from "./LineChart";
import JoinedChart from "./JoinedChart";
import { hexToRGBA, titleNameAlpha } from "../../services/appServices";
import GenderChart from "./GenderChart";
import { FaBirthdayCake } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import Meeting from "../../assets/images/Meeting.png";
import Schedule from "../../assets/images/schedule.png";
import Birthday from "../../assets/images/Birthday.jpeg";
import Holiday from "../../assets/images/holiday.png";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import CustomDrawer from "../../Components/CustomDrawer/CustomDrawer";
import { useState, useEffect } from "react";
import DashboardCountData from "./DashboardCountData";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import EmployeesLimit from "./EmployeesLimit";
import { convertDateToCustom } from "../../services/__dashboardServcies";
import useAuthReady from "../../hooks/useAuthReady";
import { useLiveBiometricDevices } from "../../hooks/useLiveBiometricDevices";
import { showToast } from "../../Components/Toaster/Toaster";
import { getUserData, getDecodedToken } from "../../Authentication/jwt_decode";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const {
    dashboardCustomData,
    dashboardCountData,
    pendingCheckListHeaders,
    meet_greetHeaders,
    upcommingHolidaysHeaders,
    mett_greetList,
    upcommingBirthdays,
    upcommingHolidays,
    getdashboardCountData,
    dashCountData,
    showDrawer,
    closeDashBoradDrawer,
    dashboardValues,
    handleDashboardValueChange,
    empCheckListData,
    handleViewEmp,
    adminDashboardData,
    adminDashboardLoading,
    getAdminDashboardData,
    selectedDate,
    applyDateFilter,
    monthlyTurnaroundData,
    turnaroundChartData,
    turnaroundChartOptions,
    genderRatioData,
    genderRatioOptions,
    oldEmployeesData,
    lateComersData,
    lateComersLoading,
    getLateComersData,
    todayAttendanceData,
    todayAttendanceLoading,
    getTodayAttendanceData,
    sendMeetGreetEmail,
  } = useDashboard();

  // Fetch all biometric devices when admin dashboard is open (cached via React Query)
  useLiveBiometricDevices(true);

  // Debug: Log lateComersData changes
  useEffect(() => {
    // console.log("lateComersData updated:", lateComersData);
    // console.log("upcommingHolidays:", upcommingBirthdays);
  }, [lateComersData]);

  const [openDialog, setOpenDialog] = useState(false);
  const handleEmpLimit = () => {
    setOpenDialog(!openDialog);
  };

  const handleGreetClick = async (employee) => {
    try {
      // Get current logged-in user data
      const userData = getUserData();
      const decodedToken = getDecodedToken();

      // Get one_id from token
      const one_id = decodedToken?.oneid || decodedToken?.one_id || '';
      const employeeId = employee.emp_id || employee.id || '';
      const employeeName = employee.name || employee.emp_name || '';

      // Call the API with query parameters
      const result = await sendMeetGreetEmail(employeeId, one_id);

      if (result.success) {
        showToast(`Thanks for greeting ${employeeName}`, 'success');
      } else {
        showToast(result.message || 'Failed to send greeting email', 'error');
      }
    } catch (error) {
      // console.error('Error sending meet greet email:', error);
      showToast('An error occurred while sending greeting email', 'error');
    }
  };

  // Open drawer immediately on card click; fetch data in background for responsive UX
  const handleDashboardCountClick = (ele) => {
    if (ele.id === 4) {
      handleEmpLimit();
      return;
    }
    const dateToUse = selectedDate || new Date().toISOString().split("T")[0];
    getdashboardCountData(ele);
    if (ele.op_code === "today_present") {
      getTodayAttendanceData(dateToUse);
    } else if (ele.op_code === "today_late_comers") {
      getLateComersData("today", dateToUse);
    } else if (ele.op_code === "weekly_late_comers") {
      getLateComersData("last7days", dateToUse);
    }
  };

  // Custom date change handler for filtering
  const handleDateFilterChange = async (e) => {
    const selectedDate = e.target.value;

    if (selectedDate) {
      // Apply date filter
      await applyDateFilter(selectedDate);
      // If attendance drawer is open, refresh attendance data with new date
      if (showDrawer && dashCountData?.op_code === "today_present") {
        await getTodayAttendanceData(selectedDate);
      }
      // If late comers drawer is open, refresh late comers data with new date
      if (
        showDrawer &&
        (dashCountData?.op_code === "today_late_comers" ||
          dashCountData?.op_code === "weekly_late_comers")
      ) {
        await getLateComersData(
          dashCountData?.op_code === "weekly_late_comers"
            ? "last7days"
            : "today",
          selectedDate
        );
      }
    } else {
      // Load all data (no filter)
      await getAdminDashboardData();
      // If attendance drawer is open, refresh attendance data with current date
      if (showDrawer && dashCountData?.op_code === "today_present") {
        const currentDate = new Date().toISOString().split("T")[0];
        await getTodayAttendanceData(currentDate);
      }
      // If late comers drawer is open, refresh late comers data with current date
      if (
        showDrawer &&
        (dashCountData?.op_code === "today_late_comers" ||
          dashCountData?.op_code === "weekly_late_comers")
      ) {
        const currentDate = new Date().toISOString().split("T")[0];
        await getLateComersData(
          dashCountData?.op_code === "weekly_late_comers"
            ? "last7days"
            : "today",
          currentDate
        );
      }
    }
  };

  function formatDob(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });

    return `${day} ${month}`;
  }

  function calculateAge(dateString) {
    const dob = new Date(dateString);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }

  /** Days until next birthday (0 = today, 1 = tomorrow, etc.) */
  function getDaysUntilBirthday(dateString) {
    const bd = new Date(dateString);
    const today = new Date();
    const next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
    if (next < today) {
      next.setFullYear(today.getFullYear() + 1);
    }
    const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  // Call admin dashboard API only when authentication is ready
  useAuthReady(() => {
    getAdminDashboardData();
  }, []);

  // Log admin dashboard data when it changes
  useEffect(() => {
    if (adminDashboardData) {
      // console.log('Admin Dashboard Data:', adminDashboardData);
      // console.log('Upcoming Holidays:', adminDashboardData.UPCOMING_HOLIDAYS);
    }
  }, [adminDashboardData]);

  // Debug upcoming holidays data
  useEffect(() => {
    // console.log('Dashboard Component - upcommingHolidays:', upcommingHolidays);
    // console.log('Dashboard Component - upcommingHolidays length:', upcommingHolidays?.length);
  }, [upcommingHolidays]);

  // Debug dashboard count data
  useEffect(() => {
    // Dashboard count data and admin dashboard data are available
  }, [dashboardCountData, adminDashboardData]);

  return (
    <>
      <style>
        {`
          .meet-greet-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .meet-greet-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .meet-greet-scrollbar::-webkit-scrollbar-thumb {
            background: #3da5f4;
            border-radius: 3px;
          }
          .meet-greet-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #2d8fd4;
          }
          /* Firefox */
          .meet-greet-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #3da5f4 transparent;
          }
        `}
      </style>
      <div className="min-h-screen flex flex-col gap-6 p-6 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-soft border border-gray-100">
          <div>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">
              Dashboard
            </span>
            <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <div className="flex gap-2 items-center px-2">
              <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
                Filter Statistics
              </span>
              <div className="group relative inline-block">
                <span className="text-gray-400 text-lg cursor-help hover:text-brand-500 transition-colors inline-flex">
                  <HiQuestionMarkCircle />
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded shadow-lg pointer-events-none">
                  <p className="mb-2">This feature lets you filter the following data only, for a specific date</p>
                  <ol className="list-none space-y-1 pl-0">
                    <li>i) Today Attendance</li>
                    <li>ii) Today Late Comers</li>
                    <li>iii) Last 7 days Late Comers</li>
                  </ol>
                </div>
              </div>
            </div>
            <div>
              <input
                type="date"
                className="bg-white border border-gray-300 rounded-md outline-none px-3 py-1.5 text-gray-700 text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-sm"
                name="date"
                value={selectedDate || ""}
                onChange={handleDateFilterChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex flex-col gap-6">
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {dashboardCustomData.map((ele) => (
              <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }} key={ele.id}>
                <Card
                  className={`p-4 h-[120px] flex justify-center rounded-2xl shadow-card border-none overflow-hidden relative`}
                  style={{ background: ele.bgColor }}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                  
                  <CardBody className="flex items-center h-full gap-3 relative z-10 p-0">
                    <div>
                      <span
                        className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm text-xl text-white shadow-inner [&_svg]:w-6 [&_svg]:h-6"
                      >
                        {ele.icon}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col text-white min-w-0">
                      <span className="text-2xl font-bold tracking-tight">
                        {ele.count}
                      </span>
                      <span className="text-xs md:text-sm font-medium opacity-90 leading-tight break-words" title={ele.title}>
                        {ele.title === 'Total Departments & Sub Departments' ? (
                          <>Total Departments<br />& Sub Dep</>
                        ) : (
                          ele.title
                        )}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {dashboardCountData.map((ele, index) => {
              const width = ele.percentCount
                ? (ele.percentCount / dashboardCustomData[0].count) * 100
                : 0;
              const maxPercent = dashboardCountData?.[3]?.count || 0;
              const current = dashboardCustomData?.[0]?.count || 0;

              const widthLimit = (current / maxPercent) * 100 || 0;
              return (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={ele.id}>
                  <Card
                    className="p-4 h-[120px] rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 cursor-pointer bg-white"
                    onClick={() => handleDashboardCountClick(ele)}
                  >
                    <CardBody className="w-full h-full flex flex-col justify-between p-0">
                      <div className="w-full flex items-start justify-between">
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap truncate" title={ele.title}>
                            {ele.title}
                          </span>
                          <span className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
                            {ele.count}
                          </span>
                        </div>
                        <div 
                          className="p-2 rounded-lg bg-opacity-10"
                          style={{ backgroundColor: `${ele.bgColor}20` }} 
                        >
                          <span
                            className="text-xl"
                            style={{ color: ele.bgColor }}
                          >
                            {ele.icon}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-2">
                        <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${index === 3 ? widthLimit : width}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full shadow-sm"
                            style={{
                              backgroundColor: ele.bgColor,
                            }}
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
              <h3 className="text-lg font-bold text-gray-800">
                Attendance Overview
              </h3>
              <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200 whitespace-nowrap w-fit">Last 7 Days</span>
            </div>
            <div className="h-[350px] w-full">
               <LineChart />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <CardBody className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Employees Turnaround</h3>
                  <p className="text-sm text-gray-500">Monthly hiring vs attrition</p>
                </div>
                <div className="h-64 w-full flex items-center justify-center">
                  <Bar
                    data={turnaroundChartData}
                    options={turnaroundChartOptions}
                  />
                </div>
              </CardBody>
            </Card>
            <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <CardBody className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Gender Distribution</h3>
                  <p className="text-sm text-gray-500">Active employment ratio</p>
                </div>
                <div className="h-64 w-full flex items-center justify-center">
                  <Pie data={genderRatioData} options={genderRatioOptions} />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Checklist Table */}
            <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <CardBody className="p-0">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <span className="text-gray-800 font-bold text-base">Pending Checklists</span>
                  <span className="bg-red-50 text-red-500 text-xs px-2 py-1 rounded-full font-medium">Action Required</span>
                </div>
                {empCheckListData?.DB_DATA && empCheckListData.DB_DATA.length > 0 ? (
                  <div className="h-80 overflow-auto customScroll">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          {pendingCheckListHeaders.map((head, i) => (
                            <th key={i} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${(head === 'ACTION' || head === 'Action' || head === 'View Profile') ? 'text-center align-middle' : ''}`}>
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {empCheckListData.DB_DATA.map((ele, index) => (
                          <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                              {ele.emp_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {ele.emp_id}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <button
                                className="text-xs bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white px-4 py-1.5 rounded-md transition-all font-medium"
                                onClick={() => handleViewEmp(ele)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                    <img src={Schedule} alt="No Checklists" className="w-24 h-24 mb-4 opacity-50 grayscale" />
                    <p className="text-gray-500 font-medium">All caught up! No pending checklists.</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Upcoming Birthdays - Distinctive card with accent and “days until” */}
            <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-400 via-brand-500 to-brand-600 rounded-l-2xl" aria-hidden />
              <CardBody className="p-0 pl-1">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-brand-50/60 to-transparent flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-brand-100 shadow-sm">
                    <FaBirthdayCake className="w-4 h-4 text-brand-500" />
                  </span>
                  <span className="text-gray-800 font-bold text-base">Upcoming Birthdays</span>
                </div>
                {adminDashboardLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                  </div>
                ) : upcommingBirthdays && upcommingBirthdays.length > 0 ? (
                  <div className="h-80 overflow-y-auto meet-greet-scrollbar">
                    <ul className="py-2">
                      {upcommingBirthdays.map((ele, index) => {
                        const { firstLetter, bgColor } = titleNameAlpha(ele.name);
                        const initialBg = bgColor || '#e0f2fe';
                        const daysUntil = getDaysUntilBirthday(ele.dob);
                        const isToday = daysUntil === 0;
                        const isTomorrow = daysUntil === 1;
                        return (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.04 }}
                            className="flex items-center gap-4 px-5 py-3 mx-2 rounded-xl hover:bg-brand-50/40 transition-colors group"
                          >
                            <div
                              className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold text-gray-700 shrink-0 shadow-sm ring-2 ring-white"
                              style={{ backgroundColor: initialBg }}
                            >
                              {firstLetter}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-brand-700 transition-colors">{ele.name}</p>
                              {(isToday || isTomorrow) && (
                                <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isToday ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-600'}`}>
                                  {isToday ? 'Today' : 'Tomorrow'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              {!isToday && !isTomorrow && daysUntil <= 7 && (
                                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">In {daysUntil} days</span>
                              )}
                              <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-3 py-2 shadow-sm">
                                <FaBirthdayCake className="w-4 h-4 text-brand-500 shrink-0" />
                                <p className="text-xs font-semibold text-gray-800 leading-tight">{formatDob(ele.dob)}</p>
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <FaBirthdayCake className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No upcoming birthdays soon.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meet & Greet Table */}
            <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <CardBody className="p-0">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-gray-800 font-bold text-base">New Joiners - Meet & Greet</span>
                </div>
                {adminDashboardLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                  </div>
                ) : oldEmployeesData.length > 0 ? (
                  <div className="h-80 overflow-auto customScroll">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          {meet_greetHeaders.map((head, i) => (
                            <th key={i} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${(head === 'ACTION' || head === 'Action' || head === 'View Profile') ? 'text-center align-middle' : ''}`}>
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {oldEmployeesData.map((ele, index) => (
                          <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                              {ele.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {ele.emp_id}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleGreetClick(ele)}
                                className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-500 hover:text-white px-4 py-1.5 rounded-md transition-all font-medium border border-purple-100 hover:border-purple-500"
                              >
                                Say Hello 👋
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                    <img src={Meeting} alt="No Meet Greet" className="w-24 h-24 mb-4 opacity-50" />
                    <p className="text-gray-500 font-medium">No new joiners to greet at the moment.</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Holidays Table */}
            <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <CardBody className="p-0">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <span className="text-gray-800 font-bold text-base">Upcoming Holidays</span>
                </div>
                {adminDashboardLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                  </div>
                ) : upcommingHolidays && upcommingHolidays.length > 0 ? (
                  <div className="h-80 overflow-auto customScroll">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          {upcommingHolidaysHeaders.map((head, i) => (
                            <th key={i} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {upcommingHolidays.map((ele, index) => (
                          <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                              {ele.branch_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {ele.from}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {ele.to}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-brand-600 whitespace-nowrap">
                              {ele.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                    <img src={Holiday} alt="No Holidays" className="w-24 h-24 mb-4 opacity-50" />
                    <p className="text-gray-500 font-medium">No holidays coming up soon.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <CustomDrawer
        open={showDrawer}
        closeDrawer={closeDashBoradDrawer}
        compo={
          <DashboardCountData
            data={(() => {
              let dataToPass;
              if (dashboardValues.title === "Today's Attendence") {
                dataToPass = todayAttendanceData?.employees || [];
              } else if (
                dashboardValues.title === "Today's Late Comers" ||
                dashboardValues.title === "Late Comers Last 7 days"
              ) {
                dataToPass = Array.isArray(lateComersData)
                  ? lateComersData
                  : [];
              } else {
                dataToPass = dashCountData;
              }
              return dataToPass;
            })()}
            status={dashboardValues?.status}
            exportData={dashboardValues.export}
            sendSms={dashboardValues.sendSms}
            loading={
              dashboardValues.title === "Today's Attendence"
                ? todayAttendanceLoading
                : dashboardValues.title === "Today's Late Comers" ||
                  dashboardValues.title === "Late Comers Last 7 days"
                  ? lateComersLoading
                  : false
            }
            title={dashboardValues.title}
            attendanceReportDate={
              dashboardValues.title === "Today's Attendence"
                ? selectedDate || new Date().toISOString().split("T")[0]
                : undefined
            }
          />
        }
        title={dashboardValues.title}
        customWidth="60"
        widthSize={"45vw"}
      />
      <CustomDialog
        openDialog={openDialog}
        handleOpen={handleEmpLimit}
        title="Employee Adding Quota"
        compo={<EmployeesLimit />}
        showBtns={false}
      />
    </>
  );
}

export default Dashboard;