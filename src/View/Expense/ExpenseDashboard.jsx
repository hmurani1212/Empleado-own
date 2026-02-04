import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, Typography } from "@material-tailwind/react";
import {
  FaClock,
  FaWallet,
  FaReceipt,
  FaPlus,
  FaChevronDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaUser,
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import CustomDrawer from "../../Components/CustomDrawer/CustomDrawer";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import PendingApprovalsDrawer from "./PendingApprovalsDrawer";
import SettlementAcceptanceModal from "./SettlementAcceptanceModal";
import useExpenseService from "../../ViewModel/ExpenseViewModel/ExpenseServices";
import { showToast } from "../../Components/Toaster/Toaster";
import { formatDateDMY } from "../../services/__dateTimeServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllMonths, getAllYears } from "../../services/__appServicesData";
import { NavLink } from "react-router-dom";
import { PiEyeLight } from "react-icons/pi";
import { HiMiniUser } from "react-icons/hi2";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { PiMoneyFill } from "react-icons/pi";
import { IoCalendar } from "react-icons/io5";
import { FaFileSignature } from "react-icons/fa";
import { AiOutlineBars } from "react-icons/ai";
import { FaSackDollar } from "react-icons/fa6";
import { FaMoneyBill1Wave } from "react-icons/fa6";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseDashboard = () => {
  // Use Expense service
  const {
    expenseData,
    loading,
    error,
    pendingApprovals,
    pendingApprovalsLoading,
    selectedMonth,
    selectedYear,
    activeTab,
    showPendingApprovalsDrawer,
    showSettlementDrawer,
    selectedExpenseDetail,
    isLoadingExpenseDetail,
    getExpenseDashboardData,
    approveRejectExpense,
    getExpenseById,
    clearExpenseDetail,
    openPendingApprovalsDrawer,
    closePendingApprovalsDrawer,
    openSettlementDrawer,
    closeSettlementDrawer,
    handleTabChange,
    handleMonthChange,
    handleYearChange,
    formatChartData,
    getCardData,
    getRecentActivities,
    getGraphSummary,
    getTableData,
    getTablePagination,
    handleLoadMore,
  } = useExpenseService();

  const [openMenuValue, setOpenMenuValue] = useState({});
  const [triggerRefs, setTriggerRefs] = useState({});
  const [showExpenseDetailModal, setShowExpenseDetailModal] = useState(false);
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Load expense data on component mount (without filters initially)
  useEffect(() => {
    getExpenseDashboardData();
  }, [getExpenseDashboardData]);

  // Apply filters when user selects month or year
  useEffect(() => {
    // Only fetch if both month and year are selected, or reset if filters are cleared
    if (selectedMonth && selectedYear) {
      getExpenseDashboardData({
        month: selectedMonth,
        year: selectedYear,
      });
    } else if (!selectedMonth && !selectedYear) {
      // If both filters are cleared, fetch without filters
      getExpenseDashboardData();
    }
  }, [selectedMonth, selectedYear, getExpenseDashboardData]);

  // Get card data from API
  const cardData = getCardData();
  const pendingApprovalsCount = cardData.pendingApprovals;
  const pendingAmount = cardData.expenseAmount; // Use expense_amount for pending amount
  const totalBudget = cardData.totalBudget;
  const rejected_expense = cardData?.rejected_expense;
  /////console.log('what is rejected expense', cardData)
  const totalExpenses = cardData.totalExpenses;
  const approvedExpense = cardData.approvedExpense;

  // Chart data from API
  const chartData = formatChartData() || {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Total Expenses",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "#3B82F6",
        borderRadius: 4,
        barThickness: 20,
      },
      {
        label: "Approved Expenses",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "#10B981",
        borderRadius: 4,
        barThickness: 20,
      },
      {
        label: "Pending Count",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "#F59E0B",
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 50000,
        ticks: {
          stepSize: 10000,
          callback: function (value) {
            return value.toLocaleString();
          },
          color: "#6B7280",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "#F3F4F6",
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // Recent activity data from API
  const recentActivities = getRecentActivities();

  // Format activity message based on status
  const formatActivityMessage = (activity) => {
    const employeeName = activity.employee_name || "Unknown";
    const status = activity.status?.toLowerCase() || "";
    const action = activity.action?.toLowerCase() || "";

    // For pending status with submitted action
    if (status === "pending" && action === "submitted") {
      return `You have submitted the ${employeeName} expense whose expense is pending`;
    }
    // For rejected/refused status
    else if (status === "rejected" || action === "refused") {
      return `You have rejected the ${employeeName} expense`;
    }
    // For approved/accepted status
    else if (status === "approved" || action === "approved") {
      return `You have accepted the ${employeeName} expense`;
    }
    // Fallback to original format if status/action doesn't match
    else {
      return `${activity.action} - ${employeeName} - ${activity.title} - ${activity.amount} PKR`;
    }
  };

  // Expense List table headers
  const expenseTableHeaders = [
    "Expense ID",
    "Employee Name",
    "Category",
    "Amount",
    "Date",
    "Status",
    "Description",
    "View",
  ];

  const months = getAllMonths();
  const years = getAllYears();

  // Find selected month object for CustomSelect value
  const selectedMonthOption = selectedMonth
    ? (() => {
        const month = months?.find((m) => m.id === selectedMonth);
        return month ? { value: month.id, label: month.title } : null;
      })()
    : null;

  // Get real expense list data from API
  const expenseListData = getTableData();
  const tablePagination = getTablePagination();

  // Sample data for fallback (remove this after API integration)
  const sampleExpenseListData = [
    {
      id: "EXP001",
      employeeName: "John Doe",
      category: "Travel",
      amount: "2,500 PKR",
      date: "2024-01-15",
      status: "Approved",
      description: "Business trip to Karachi",
    },
    {
      id: "EXP002",
      employeeName: "Jane Smith",
      category: "Meals",
      amount: "1,200 PKR",
      date: "2024-01-14",
      status: "Pending",
      description: "Client meeting lunch",
    },
    {
      id: "EXP003",
      employeeName: "Mike Johnson",
      category: "Office Supplies",
      amount: "800 PKR",
      date: "2024-01-13",
      status: "Rejected",
      description: "Stationery items",
    },
    {
      id: "EXP004",
      employeeName: "Sarah Wilson",
      category: "Transportation",
      amount: "1,500 PKR",
      date: "2024-01-12",
      status: "Approved",
      description: "Taxi fare for meetings",
    },
    {
      id: "EXP005",
      employeeName: "David Brown",
      category: "Accommodation",
      amount: "5,000 PKR",
      date: "2024-01-11",
      status: "Pending",
      description: "Hotel stay for conference",
    },
  ];

  // Action menu items for expense list
  const expenseActionList = [
    { id: 1, title: "View Details", icon: <FaEye />, color: "#3DA5F4" },
    { id: 2, title: "Edit", icon: <FaEdit />, color: "#0ACF97" },
    { id: 3, title: "Delete", icon: <FaTrash />, color: "#FF4979" },
  ];

  // Invoices table headers (matching the image)
  const invoicesTableHeaders = [
    "Employee ID",
    "Employee name",
    "Installment total amount",
    "Paid amount",
    "Remaining amount",
    "Settlement method",
    "View",
  ];

  // Sample invoices data (matching the image)
  const invoicesListData = [
    {
      id: "12345",
      employeeName: "Hasnain Khan",
      installmentTotal: "10,000 PKR",
      paidAmount: "1200 PKR",
      remainingAmount: "4500 PKR",
      settlementMethod: "One time",
    },
    {
      id: "12345",
      employeeName: "Hasnain Khan",
      installmentTotal: "10,000 PKR",
      paidAmount: "1200 PKR",
      remainingAmount: "4500 PKR",
      settlementMethod: "In instalments",
    },
    {
      id: "12345",
      employeeName: "Hasnain Khan",
      installmentTotal: "10,000 PKR",
      paidAmount: "1200 PKR",
      remainingAmount: "4500 PKR",
      settlementMethod: "One time",
    },
    {
      id: "12345",
      employeeName: "Hasnain Khan",
      installmentTotal: "10,000 PKR",
      paidAmount: "1200 PKR",
      remainingAmount: "4500 PKR",
      settlementMethod: "In instalments",
    },
  ];

  // Action menu items for invoices (only view details)
  const invoicesActionList = [
    { id: 1, title: "View Details", icon: <FaEye />, color: "#3DA5F4" },
  ];

  const tabs = ["Expense Analysis", "Expense List", "Invoices"];

  // Helper functions for dropdown menu
  const toggleMenuValue = (index, isOpen) => {
    setOpenMenuValue((prev) => ({
      ...prev,
      [index]: isOpen,
    }));
  };

  const getDropdownPosition = (index) => {
    // Simple logic to determine dropdown position
    return index > 2 ? "top" : "bottom";
  };

  const handleExpenseAction = (expense, action) => {
    console.log("Expense action:", action.title, "for expense:", expense.id);
    // Handle different actions here
  };

  // Handle view invoice detail
  const handleViewInvoice = async (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetailModal(true);
    // Note: If there's a getInvoiceById API endpoint, we can call it here
    // await getInvoiceById(invoice.id);
  };

  const handleCloseInvoiceDetailModal = () => {
    setShowInvoiceDetailModal(false);
    setSelectedInvoice(null);
  };

  // Handle view expense detail
  const handleViewExpense = async (expense) => {
    // Extract expense ID - try to get from expense object or recent activities
    let expenseId = null;

    // Check if expense has an id field (MongoDB _id)
    if (expense?.id) {
      expenseId = expense.id;
    } else if (expense?._id) {
      expenseId = expense._id;
    } else {
      // Try to find in recent activities by matching Expense ID (EXP200 -> 200)
      const expenseIdStr = expense?.["Expense ID"]?.replace("EXP", "") || "";
      const recentActivities = getRecentActivities();
      const matchingActivity = recentActivities.find(
        (activity) => activity.expense_id?.toString() === expenseIdStr
      );
      if (matchingActivity?.id) {
        expenseId = matchingActivity.id;
      } else {
        showToast("Unable to find expense ID. Please try again.", "error");
        return;
      }
    }

    if (!expenseId) {
      showToast("Unable to find expense ID. Please try again.", "error");
      return;
    }

    setSelectedExpenseId(expenseId);
    setShowExpenseDetailModal(true);
    await getExpenseById(expenseId);
  };

  const handleCloseExpenseDetailModal = () => {
    setShowExpenseDetailModal(false);
    setSelectedExpenseId(null);
    clearExpenseDetail();
  };

  return (
    <div className="flex flex-col gap-4 p-2 w-full">
      {/* Header Section */}
      <div className="w-full">
        <div className="w-full">
          <Typography className="text-[20px] font-Urbanist font-semibold text-[#474747]">
            Expense Management
          </Typography>
          <div className="flex justify-between items-end w-full">
            <div className="flex items-center gap-3 mt-4">
              {/* Month Filter */}
              <div className="w-44">
                <label className="text-[#474747] text-[12px] font-medium px-2">
                  Month
                </label>
                <CustomSelect
                  placeHolderTitle="Month"
                  value={selectedMonthOption}
                  options={months?.map((month) => ({
                    value: month.id,
                    label: month.title,
                  }))}
                  onChangeHandler={(selectedOption) =>
                    handleMonthChange(selectedOption, "month")
                  }
                  customStyles={false}
                  thinScrollbar={true}
                />
              </div>

              {/* Year Filter */}
              <div className="w-32">
                <label className="text-[#474747] text-[12px] font-medium px-2">
                  Year
                </label>
                <CustomSelect
                  placeHolderTitle="Year"
                  value={
                    selectedYear
                      ? { value: selectedYear, label: selectedYear }
                      : null
                  }
                  options={years?.map((year) => ({ value: year, label: year }))}
                  onChangeHandler={(selectedOption) =>
                    handleYearChange(selectedOption, "year")
                  }
                  customStyles={false}
                  thinScrollbar={true}
                />
              </div>
            </div>
            {/* Add New Expense Button */}
            <div className="flex justify-end items-end w-full h-full mt-10">
              <Button
                className="bg-bgBlue hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-[8px] flex items-end justify-end gap-2"
                size="sm"
                onClick={openSettlementDrawer}
              >
                Add new expense
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-2 lg:gap-3 mb-2">
        {/* Approved Expense Card - Teal/Green */}
        <Card className="bg-[#0ACF97] text-white drop-shadow-sm p-4 h-[100px] rounded-[15px]">
          <CardBody className="flex items-center h-full p-0 space-x-4">
            <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white aspect-square">
              <FaCheckCircle className="w-[25px] h-[25px] text-[#0ACF97]" />
            </div>
            <div className="flex flex-col text-white leading-tight">
              <span className="text-[14px] font-normal font-Poppins">
                Approved Expense
              </span>
              <span className="text-[20px] font-semibold font-Poppins">
                {approvedExpense.toLocaleString()} PKR
              </span>
            </div>
          </CardBody>
        </Card>
        {/* Pending Approvals Card - Green */}
        <Card className="bg-[#3DA5F4] text-white drop-shadow-sm p-4 h-[100px] rounded-[15px] relative">
          <CardBody className="flex items-center h-full p-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white aspect-square">
                <FaClock className="w-[25px] h-[25px] text-[#3DA5F4]" />
              </div>
              <div className="flex flex-col text-white leading-tight">
                <span className="text-[14px] font-semibold font-Poppins">
                  Pending Approvals
                </span>
                <span className="text-[12px] font-normal font-Poppins">
                  {pendingApprovalsCount} approvals pending
                </span>
                <span className="text-[14px] font-semibold font-Poppins pt-[3px]">
                  {pendingAmount} PKR
                </span>
                {/* <div className="flex items-center justify-between"> */}
                <PiEyeLight
                  className="w-4 h-4 text-white absolute bottom-2 right-3 cursor-pointer hover:text-yellow-500 font-bold"
                  onClick={openPendingApprovalsDrawer}
                />
                {/* <Button
                    size="xs"
                    className="bg-white text-gray-800 font-medium border-0 shadow-sm hover:bg-gray-100 text-xs px-4 py-1 mt-2 rounded-lg font-normal ml-4"
                    onClick={openPendingApprovalsDrawer}
                  >
                    View details
                  </Button> */}
                {/* </div> */}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Total Budget Card - Blue */}
        <Card className="bg-[#FF4979] text-white drop-shadow-sm p-4 h-[100px] rounded-[15px]">
          <CardBody className="flex items-center gap-4 h-full p-0">
            <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white aspect-square">
              <FaWallet className="w-[25px] h-[25px] text-[#FF4979]" />
            </div>
            <div className="flex-1 flex flex-col text-white leading-tight">
              <span className="text-[14px] font-normal font-Poppins">
                Rejected Expense
              </span>
              <span className="text-[20px] font-semibold font-Poppins">
                {rejected_expense?.toLocaleString()} PKR
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Total Expenses Card - Pink/Red */}
        <Card className="bg-[#FDA006] text-white drop-shadow-sm p-4 h-[100px] rounded-[15px]">
          <CardBody className="flex items-center gap-4 h-full p-0">
            <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white aspect-square">
              <FaReceipt className="w-[25px] h-[25px] text-[#FDA006]" />
            </div>
            <div className="flex-1 flex flex-col text-white leading-tight">
              <span className="text-[14px] font-normal font-Poppins">
                Total Expenses
              </span>
              <span className="text-[20px] font-semibold font-Poppins">
                {totalExpenses.toLocaleString()} PKR
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="">
        <div className="flex gap-5 pb-3 rounded-[10px]">
          <div className="flex items-center gap-5 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`${
                  activeTab === tab
                    ? "text-white"
                    : "hover:text-black/60 text-[#474747]"
                } relative rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 z-10 bg-[#8bc9f8]"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <span className="relative z-20 font-Urbanist text-[14px]">
                  {tab}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div> */}

      {/* Main Content Area */}
      {activeTab === "Expense Analysis" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart Section - Left Panel */}
          <div className="lg:col-span-2">
            <Card className="h-[430px] drop-shadow-md rounded-[8px]">
              <CardBody className="p-4 h-full">
                <div className="h-full w-full">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recent Activity Log - Right Panel */}
          <div className="lg:col-span-1">
            <Card className="h-[430px] drop-shadow-md rounded-[8px]">
              <CardBody className="p-0">
                <div className="bg-bgBlue text-white p-4 rounded-t-lg">
                  <Typography className="text-white font-medium text-[16px] font-Urbanist">
                    Recent Activity Log
                  </Typography>
                </div>
                <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-700 leading-relaxed"
                    >
                      <span className="font-normal text-[#474747]">
                        {activity.date}:
                      </span>{" "}
                      {formatActivityMessage(activity)}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : activeTab === "Expense List" ? (
        /* Expense List Table */
        // <div className="bg-white rounded-[10px] p-2">
        <div className="bg-white drop-shadow-md rounded-[10px] p-2">
          <div className="h-[calc(100vh-100px)] overflow-auto customScroll">
            <table className="w-full text-center">
              <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  {expenseTableHeaders?.map((head, i) => (
                    <th key={i} className="bg-[#F8F9FA] p-4 text-center">
                      <Typography
                        // color="blue-gray"
                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist text-[#474747]"
                        // style={{ fontSize: '15px' }}
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ overflow: "visible" }} className=" w-full">
                {expenseListData?.length > 0 ? (
                  expenseListData?.map((expense, i) => {
                    const isLast = i === expenseListData.length - 1;
                    const classes = isLast
                      ? "p-4 text-center"
                      : "p-4 border-b border-[#F2F2F9] text-center";
                    return (
                      <tr
                        key={i}
                        style={{ overflow: "visible", position: "relative" }}
                      >
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-center font-Urbanist font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                          >
                            {expense?.["Expense ID"]}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="whitespace-nowrap font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                            // style={{ fontSize: '13px' }}
                          >
                            {expense?.["Employee Name"]}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                          >
                            {expense?.Category}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                          >
                            {expense?.Amount}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                            // style={{ fontSize: '13px' }}
                          >
                            {expense?.Date}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <div className="flex justify-center">
                            <span
                              className={`px-2 py-1 rounded-[7px] text-[12px] font-medium w-[107px] text-center ${
                                expense?.Status === "Approved"
                                  ? "bg-[#DBFFF5] text-[#0ACF97]"
                                  : expense?.Status === "Pending"
                                  ? "bg-[#FFF1D9] text-[#FDA006]"
                                  : "bg-[#FFF0F4] text-[#FF4979]"
                              }`}
                            >
                              {expense?.Status}
                            </span>
                          </div>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                          >
                            {expense?.Description}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <div className="flex justify-center ">
                            <PiEyeLight
                              className="text-bgBlue w-5 h-5 cursor-pointer hover:text-blue-700"
                              onClick={() => handleViewExpense(expense)}
                            />
                            {/* <Button
                              className="flex items-center justify-center w-8 h-8 p-0 border-0 rounded-full"
                              onClick={() => handleViewExpense(expense)}
                              title="View Details"
                            >
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10">
                      <div className="flex items-center justify-center w-full">
                        <span className="text-[clamp(12px, 0.9vw, 14px)] whitespace-nowrap font-Urbanist font-normal text-[#474747]">
                          No data found
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {tablePagination.has_next_page && (
            <div className="p-4 border-t border-gray-200 flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-bgBlue text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        // </div>
        /* Invoices Tab - Table */
        // <div className="bg-white rounded-[10px] p-2">
        <div className="bg-white rounded-[10px] p-2 drop-shadow-md">
          <div className="h-[calc(100vh-100px)] overflow-auto customScroll">
            <table className="w-full text-center">
              <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  {invoicesTableHeaders?.map((head, i) => (
                    <th key={i} className="bg-[#F8F9FA] p-4 text-center">
                      <Typography
                        // color="blue-gray"
                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist text-[#474747]"
                        // style={{ fontSize: '15px' }}
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ overflow: "visible" }}>
                {invoicesListData?.length > 0 ? (
                  invoicesListData?.map((invoice, i) => {
                    const isLast = i === invoicesListData.length - 1;
                    const classes = isLast
                      ? "p-4 text-center"
                      : "p-4 border-b border-[#F2F2F9] text-center";
                    return (
                      <tr
                        key={i}
                        style={{ overflow: "visible", position: "relative" }}
                      >
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                          >
                            {invoice?.id}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                          >
                            {invoice?.employeeName}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                            // style={{ fontSize: '13px' }}
                          >
                            {invoice?.installmentTotal}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                            // style={{ fontSize: '13px' }}
                          >
                            {invoice?.paidAmount}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist font-normal text-[#474747]"
                            // style={{ fontSize: '13px' }}
                          >
                            {invoice?.remainingAmount}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <div className="flex justify-center items-center w-full">
                            <span
                              className={`px-3 py-1 rounded-[7px] text-[12px] font-medium w-[120px] text-center ${
                                invoice?.settlementMethod === "One time"
                                  ? "bg-[#DBFFF5] text-[#0ACF97]"
                                  : "bg-[#FFF1D9] text-[#FDA006]"
                              }`}
                            >
                              {invoice?.settlementMethod}
                            </span>
                          </div>
                        </td>
                        <td className={classes}>
                          <div className="flex justify-center">
                            <PiEyeLight
                              className="text-bgBlue w-5 h-5 cursor-pointer hover:text-blue-700"
                              onClick={() => handleViewInvoice(invoice)}
                            />
                            {/* <Button
                              className="flex items-center justify-center w-8 h-8 p-0 border-0 bg-transparent hover:bg-blue-50 rounded-full"
                              
                              title="View Details"
                            >
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10">
                      <div className="flex items-center justify-center w-full">
                        <span className="text-[14px] font-Urbanist font-normal text-[#474747]">
                          No data found
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        // </div>
      )}

      {/* Pending Approvals Drawer */}
      {showPendingApprovalsDrawer && (
        <CustomDrawer
          open={showPendingApprovalsDrawer}
          closeDrawer={closePendingApprovalsDrawer}
          compo={
            <PendingApprovalsDrawer
              closeDrawer={closePendingApprovalsDrawer}
              pendingApprovals={pendingApprovals}
              pendingApprovalsLoading={pendingApprovalsLoading}
              approveRejectExpense={approveRejectExpense}
            />
          }
          title="Pending Approvals"
          widthSize={800}
        />
      )}

      {/* Settlement Acceptance Drawer */}
      {showSettlementDrawer && (
        <CustomDrawer
          open={showSettlementDrawer}
          closeDrawer={closeSettlementDrawer}
          compo={
            <SettlementAcceptanceModal closeModal={closeSettlementDrawer} />
          }
          title="Settlement Acceptance"
          widthSize={800}
        />
      )}

      {/* Expense Detail Modal */}
      <CustomDrawer
        open={showExpenseDetailModal}
        closeDrawer={handleCloseExpenseDetailModal}
        title="Expense Details"
        widthSize={800}
        // footer={true}
        // showBtns={false}
        compo={
          isLoadingExpenseDetail ? (
            <div className="flex justify-center items-center py-8">
              <Typography variant="paragraph" className="text-gray-500">
                Loading expense details...
              </Typography>
            </div>
          ) : selectedExpenseDetail ? (
            <div className="pt-4 space-y-6">
              {/* Employee Information Section */}
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaUser className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                      Employee Name
                    </span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                      {selectedExpenseDetail.employee_name || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <HiMiniUser className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                      User ID
                    </span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                      {selectedExpenseDetail.user_id || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaFileInvoiceDollar className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                      Expense Title
                    </span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                      {selectedExpenseDetail.title || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaMoneyBill1Wave className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                      Payment Type
                    </span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                      {selectedExpenseDetail.type === 0
                        ? "One-time"
                        : selectedExpenseDetail.type === 1
                        ? "Installment"
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <IoCalendar className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                      Date
                    </span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                      {selectedExpenseDetail.date
                        ? formatDateDMY(selectedExpenseDetail.date)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaFileSignature className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                      Description
                    </span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                      {selectedExpenseDetail.desc || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-dashed border-[#DDDDDD]"></div>

              {/* Items Section */}
              {selectedExpenseDetail.items &&
                selectedExpenseDetail.items.length > 0 && (
                  <div className="">
                    <span className="font-medium font-Urbanist text-[16px] text-bgBlue">
                      Expense Items
                    </span>
                    {selectedExpenseDetail.items.map((item, index) => (
                      <div key={index} className="">
                        <div className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                                <AiOutlineBars className="text-bgBlue w-[18px] h-[18px]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                                  Item
                                </span>
                                <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                                  {item.item || "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                                <FaSackDollar className="text-bgBlue w-[18px] h-[18px]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                                  Category
                                </span>
                                <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                                  {item.category || "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                                <FaMoneyBill1Wave className="text-bgBlue w-[18px] h-[18px]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                                  Amount
                                </span>
                                <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                                  {item.amount
                                    ? `${item.amount.toLocaleString()} PKR`
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <Typography variant="paragraph" className="text-gray-500">
                No expense details available
              </Typography>
            </div>
          )
        }
      />

      {/* Invoice Detail Modal */}
      <CustomDrawer
        open={showInvoiceDetailModal}
        closeDrawer={handleCloseInvoiceDetailModal}
        title="Invoice Details"
        widthSize={800}
        compo={
          selectedInvoice ? (
            <div className="pt-4 space-y-6">
              {/* Employee Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaUser className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                      Employee ID
                    </span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                      {selectedInvoice.id || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <HiMiniUser className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">
                      Employee Name
                    </span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">
                      {selectedInvoice.employeeName || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 shadow-sm rounded-[10px] pl-2 py-6">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-white">
                    <FaCheckCircle className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-normal text-[#474747]">
                      Installment Total Amount
                    </span>
                    <span className="text-[14px] font-Urbanist font-medium text-[#474747]">
                      {selectedInvoice.installmentTotal || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-green-50 border border-green-200 shadow-sm rounded-[10px] pl-2 py-6">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-white">
                    <FaClock className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-normal text-[#474747]">
                      Paid Amount
                    </span>
                    <span className="text-[14px] font-Urbanist font-medium text-[#474747]">
                      {selectedInvoice.paidAmount || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 shadow-sm rounded-[10px] pl-2 py-6">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-white">
                    <FaReceipt className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-normal text-[#474747]">
                      Remaining Amount
                    </span>
                    <span className="text-[14px] font-Urbanist font-medium text-[#474747]">
                      {selectedInvoice.remainingAmount || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settlement Method Section */}
              <div className="grid grid-cols-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaFileSignature className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-normal text-[#474747]">
                      Settlement Method
                    </span>
                    <span
                      className={`text-[14px] font-Urbanist font-light text-[#474747] rounded-[7px] text-center ${
                        selectedInvoice.settlementMethod === "One time"
                          ? "bg-[#DBFFF5] text-[#0ACF97]"
                          : "bg-[#FFF1D9] text-[#FDA006]"
                      }`}
                    >
                      {selectedInvoice.settlementMethod || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <Typography variant="paragraph" className="text-gray-500">
                No invoice details available
              </Typography>
            </div>
          )
        }
      />
    </div>
  );
};

export default ExpenseDashboard;