import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Button, Card, CardBody, Typography, IconButton } from "@material-tailwind/react";
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
  FaFilter
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
import { motion, AnimatePresence } from "framer-motion";
import CustomDrawer from "../../Components/CustomDrawer/CustomDrawer";
import PendingApprovalsDrawer from "./PendingApprovalsDrawer";
import TotalExpensesDrawer from "./TotalExpensesDrawer";
import RejectedExpensesDrawer from "./RejectedExpensesDrawer";
import ApprovedExpensesDrawer from "./ApprovedExpensesDrawer";
import SettlementAcceptanceModal from "./SettlementAcceptanceModal";
import useExpenseService from "../../ViewModel/ExpenseViewModel/ExpenseServices";
import { showToast } from "../../Components/Toaster/Toaster";
import { formatDateDMY } from "../../services/__dateTimeServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllMonths, getAllYears } from "../../services/__appServicesData";
import { PiEyeLight, PiMoneyFill } from "react-icons/pi";
import { HiMiniUser } from "react-icons/hi2";
import { FaFileInvoiceDollar, FaFileSignature, FaSackDollar, FaMoneyBill1Wave } from "react-icons/fa6";
import { IoCalendar } from "react-icons/io5";
import { AiOutlineBars } from "react-icons/ai";
import {
  ExpenseStatCardsSkeleton,
  ExpenseAnalysisTabSkeleton,
  ExpenseListTableSkeleton,
  InvoicesTableSkeleton,
} from "./ExpenseSkeletons";

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
    loadMoreLoading,
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
    openTotalExpensesDrawer,
    closeTotalExpensesDrawer,
    showTotalExpensesDrawer,
    totalExpenses,
    totalExpensesLoading,
    openRejectedExpensesDrawer,
    closeRejectedExpensesDrawer,
    showRejectedExpensesDrawer,
    rejectedExpenses,
    rejectedExpensesLoading,
    openApprovedExpensesDrawer,
    closeApprovedExpensesDrawer,
    showApprovedExpensesDrawer,
    approvedExpensesList,
    approvedExpensesLoading,
    invoiceData,
    invoiceDataLoading,
    getInvoiceData,
    clearInvoiceData,
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

  const [showExpenseDetailModal, setShowExpenseDetailModal] = useState(false);
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Load expense data once on mount; ref avoids duplicate from dependency changes or Strict Mode
  const hasFetchedInitialRef = useRef(false);
  useLayoutEffect(() => {
    if (hasFetchedInitialRef.current) return;
    hasFetchedInitialRef.current = true;
    getExpenseDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters when user selects month or year (skip first run to avoid duplicate with mount effect)
  const isFilterMountedRef = useRef(false);
  const prevFiltersRef = useRef({ month: null, year: null });

  useEffect(() => {
    if (!isFilterMountedRef.current) {
      isFilterMountedRef.current = true;
      prevFiltersRef.current = { month: selectedMonth, year: selectedYear };
      return;
    }

    // Only call dashboard API if filters actually changed (not when drawer opens)
    const prevMonth = prevFiltersRef.current.month;
    const prevYear = prevFiltersRef.current.year;

    if (prevMonth !== selectedMonth || prevYear !== selectedYear) {
      prevFiltersRef.current = { month: selectedMonth, year: selectedYear };

      if (selectedMonth && selectedYear) {
        getExpenseDashboardData({
          month: selectedMonth,
          year: selectedYear,
        });
      } else if (!selectedMonth && !selectedYear) {
        getExpenseDashboardData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  // Load invoice data when Invoices tab is active
  useEffect(() => {
    if (activeTab === "Invoices") {
      getInvoiceData();
    }
  }, [activeTab]);

  // Get card data from API
  const cardData = getCardData();
  const pendingApprovalsCount = cardData.pendingApprovals || 0;
  const pendingAmount = cardData.expenseAmount || 0; // Use expense_amount for pending amount
  const totalBudget = cardData.totalBudget || 0;
  const rejected_expense = cardData?.rejected_expense || 0;
  const totalExpensesAmount = cardData.totalExpenses || 0;
  const approvedExpense = cardData.approvedExpense || 0;

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

  // Calculate dynamic Y-axis scale based on maximum total_expenses
  const maxTotalExpenses = Math.max(...(chartData?.datasets?.[0]?.data || [0]));
  const getNextMultiple = (value, step) => Math.ceil(value / step) * step;

  // Determine scale based on maximum expense value
  let yAxisMax, yAxisStepSize;
  if (maxTotalExpenses < 10000) {
    // For values less than 10,000, use 1,000 steps
    yAxisStepSize = 1000;
    yAxisMax = getNextMultiple(maxTotalExpenses, 1000);
  } else {
    // For values 10,000 or greater, use 10,000 steps
    yAxisStepSize = 10000;
    yAxisMax = getNextMultiple(maxTotalExpenses, 10000);
  }

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
        max: yAxisMax,
        ticks: {
          stepSize: yAxisStepSize,
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

  // Transform invoice data from API to table format
  const invoicesListData = Array.isArray(invoiceData) ? invoiceData.map(invoice => ({
    id: invoice.user_id || invoice._id,
    employeeName: invoice.employee_name || "Unknown",
    installmentTotal: `${invoice.amount ? invoice.amount.toLocaleString() : '0 PKR'} PKR`,
    paidAmount: invoice.status == 'approved' ? '0 PKR' : `${invoice.amount ? invoice.amount.toLocaleString() : '0 PKR'} PKR`,
    remainingAmount:
      (invoice.status === 'rejected' || invoice.status === 'pending')
        ? '0 PKR'
        : `${invoice.amount ? invoice.amount.toLocaleString() : '0'} PKR`,
    settlementMethod: invoice.type == 1 ? 'One time' : 'Installment',
  })) : [];

  const tabs = ["Expense Analysis", "Expense List", "Invoices"];

  // Handle view invoice detail
  const handleViewInvoice = async (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetailModal(true);
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

  // Modern Stat Card Component
  const StatCard = ({ title, value, icon, colorClass, bgColorClass, subValue, onClick }) => {
    const handleClick = () => {
      console.log(`StatCard clicked: ${title}`);
      if (onClick && typeof onClick === 'function') {
        onClick();
      } else {
        console.error(`onClick handler for ${title} is not a function:`, onClick);
      }
    };

    return (
      <motion.div
        whileHover={{ y: -5 }}
        className={`relative overflow-hidden rounded-2xl p-5 ${bgColorClass} shadow-sm border border-transparent hover:shadow-md transition-all duration-300 cursor-pointer group`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between z-10 relative">
          <div className="flex flex-col gap-1">
            <Typography className="text-sm font-medium text-white/90 font-poppins">
              {title}
            </Typography>
            <Typography className="text-2xl font-bold text-white font-poppins">
              {value}
            </Typography>
            {subValue && (
              <Typography className="text-xs text-white/80 font-poppins mt-1">
                {subValue}
              </Typography>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white ${colorClass}`}>
            {icon}
          </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen   font-poppins">
      <div className=" mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage company expenses and approvals</p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-40">
              <label className="text-gray-600 text-xs font-medium mb-1 block pl-1">Month</label>
              <CustomSelect
                placeHolderTitle="Select Month"
                value={selectedMonthOption}
                options={months?.map((month) => ({ value: month.id, label: month.title }))}
                onChangeHandler={(selectedOption) => handleMonthChange(selectedOption, "month")}
                thinScrollbar={true}
                menuLoading={loading}
              />
            </div>
            <div className="w-32">
              <label className="text-gray-600 text-xs font-medium mb-1 block pl-1">Year</label>
              <CustomSelect
                placeHolderTitle="Select Year"
                value={selectedYear ? { value: selectedYear, label: selectedYear } : null}
                options={years?.map((year) => ({ value: year, label: year }))}
                onChangeHandler={(selectedOption) => handleYearChange(selectedOption, "year")}
                thinScrollbar={true}
                menuLoading={loading}
              />
            </div>
            <Button
              className="flex items-center gap-2 bg-bgBlue hover:bg-blue-600 shadow-blue-500/20 hover:shadow-blue-500/40 rounded-xl py-2.5 px-4 h-[42px] normal-case"
              onClick={openSettlementDrawer}
            >
              <FaPlus className="text-xs" /> New Expense
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        {loading ? (
          <ExpenseStatCardsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Approved Expense"
              value={`${approvedExpense.toLocaleString()}`}
              icon={<FaCheckCircle className="text-xl" />}
              bgColorClass="bg-[#0ACF97]"
              onClick={openApprovedExpensesDrawer}
            />
            <StatCard
              title="Pending Approvals"
              value={`${pendingApprovalsCount}`}
              subValue={`${pendingAmount} PKR`}
              icon={<FaClock className="text-xl" />}
              bgColorClass="bg-[#3DA5F4]"
              onClick={openPendingApprovalsDrawer}
            />
            <StatCard
              title="Rejected Expense"
              value={`${rejected_expense?.toLocaleString() || 0}`}
              icon={<FaWallet className="text-xl" />}
              bgColorClass="bg-[#FF4979]"
              onClick={openRejectedExpensesDrawer}
            />
            <StatCard
              title="Total Expenses"
              value={`${totalExpensesAmount.toLocaleString()}`}
              icon={<FaReceipt className="text-xl" />}
              bgColorClass="bg-[#FDA006]"
              onClick={openTotalExpensesDrawer}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white rounded-xl w-fit shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-bgBlue rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              // ================= Expense Analysis =================
              if (activeTab === "Expense Analysis") {
                if (loading) return <ExpenseAnalysisTabSkeleton />;

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Section */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[450px]">
                      <Typography className="text-lg font-bold text-gray-800 mb-6 font-poppins">
                        Expense Overview
                      </Typography>
                      <div className="h-[350px] w-full">
                        <Bar data={chartData} options={chartOptions} />
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[450px] flex flex-col">
                      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <Typography className="text-lg font-bold text-gray-800 font-poppins">
                          Recent Activity
                        </Typography>
                      </div>

                      <div className="p-0 overflow-y-auto flex-1 customScroll">
                        {recentActivities.length > 0 ? (
                          <div className="divide-y divide-gray-50">
                            {recentActivities.map((activity, index) => (
                              <div
                                key={index}
                                className="p-4 hover:bg-blue-50/30 transition-colors"
                              >
                                <div className="flex gap-3">
                                  <div className="mt-1 min-w-[8px] h-2 rounded-full bg-blue-400"></div>
                                  <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1">
                                      {activity.date}
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {formatActivityMessage(activity)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                            <FaReceipt className="text-4xl mb-2 opacity-20" />
                            <p className="text-sm">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // ================= Expense List =================
              if (activeTab === "Expense List") {
                if (loading) return <ExpenseListTableSkeleton />;

                return (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto customScroll">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                          <tr>
                            {expenseTableHeaders.map((head, i) => (
                              <th
                                key={i}
                                className="p-4 first:pl-6 last:pr-6 whitespace-nowrap"
                              >
                                <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                                  {head}
                                </Typography>
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                          {expenseListData?.length > 0 ? (
                            expenseListData.map((expense, i) => (
                              <tr
                                key={i}
                                className="hover:bg-blue-50/30 transition-colors group"
                              >
                                <td className="p-4 first:pl-6">
                                  <span className="font-medium text-gray-900 text-sm font-poppins">
                                    {expense?.["Expense ID"]}
                                  </span>
                                </td>

                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                      {expense?.["Employee Name"]?.charAt(0) || "U"}
                                    </div>
                                    <span className="font-medium text-gray-700 text-sm font-poppins">
                                      {expense?.["Employee Name"]}
                                    </span>
                                  </div>
                                </td>

                                <td className="p-4">
                                  <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                                    {expense?.Category}
                                  </span>
                                </td>

                                <td className="p-4">
                                  <span className="font-semibold text-gray-800 text-sm">
                                    {expense?.Amount}
                                  </span>
                                </td>

                                <td className="p-4 text-sm text-gray-500">
                                  {expense?.Date}
                                </td>

                                <td className="p-4">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${expense?.Status === "Approved"
                                      ? "bg-green-50 text-green-600 border border-green-100"
                                      : expense?.Status === "Pending"
                                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                                        : "bg-red-50 text-red-600 border border-red-100"
                                      }`}
                                  >
                                    {expense?.Status}
                                  </span>
                                </td>

                                <td className="p-4 max-w-[200px]">
                                  <p
                                    className="truncate text-sm text-gray-500"
                                    title={expense?.Description}
                                  >
                                    {expense?.Description}
                                  </p>
                                </td>

                                <td className="p-4 last:pr-6 text-center">
                                  <IconButton
                                    variant="text"
                                    color="blue"
                                    size="sm"
                                    onClick={() => handleViewExpense(expense)}
                                    className="rounded-full hover:bg-blue-50"
                                  >
                                    <PiEyeLight className="text-lg" />
                                  </IconButton>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="p-12 text-center text-gray-400">
                                <div className="flex flex-col items-center justify-center gap-3">
                                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                    <FaReceipt className="text-3xl text-gray-300" />
                                  </div>
                                  <p className="font-medium">No expenses found</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {tablePagination.has_next_page && (
                      <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                        <Button
                          onClick={handleLoadMore}
                          disabled={loadMoreLoading}
                          variant="text"
                          className="text-blue-600 hover:bg-blue-50 normal-case"
                        >
                          {loadMoreLoading ? "Loading..." : "Load More"}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              }

              // ================= Invoices =================
              if (loading) return <InvoicesTableSkeleton />;

              return (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto customScroll">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                        <tr>
                          {invoicesTableHeaders.map((head, i) => (
                            <th
                              key={i}
                              className="p-4 first:pl-6 last:pr-6 whitespace-nowrap"
                            >
                              <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                                {head}
                              </Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-50">
                        {invoicesListData?.length > 0 ? (
                          invoicesListData.map((invoice, i) => (
                            <tr
                              key={i}
                              className="hover:bg-blue-50/30 transition-colors group"
                            >
                              <td className="p-4 first:pl-6 text-sm font-medium text-gray-900">
                                {invoice?.id}
                              </td>

                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                    {invoice?.employeeName?.charAt(0) || "U"}
                                  </div>
                                  <span className="font-medium text-gray-700 text-sm">
                                    {invoice?.employeeName}
                                  </span>
                                </div>
                              </td>

                              <td className="p-4 text-sm font-medium text-gray-800">
                                {invoice?.installmentTotal}
                              </td>

                              <td className="p-4 text-sm text-green-600 font-medium">
                                {invoice?.paidAmount}
                              </td>

                              <td className="p-4 text-sm text-red-600 font-medium">
                                {invoice?.remainingAmount}
                              </td>

                              <td className="p-4 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${invoice?.settlementMethod === "One time"
                                    ? "bg-purple-50 text-purple-700"
                                    : "bg-orange-50 text-orange-700"
                                    }`}
                                >
                                  {invoice?.settlementMethod}
                                </span>
                              </td>

                              <td className="p-4 last:pr-6 text-center">
                                <IconButton
                                  variant="text"
                                  color="blue"
                                  size="sm"
                                  onClick={() => handleViewInvoice(invoice)}
                                  className="rounded-full hover:bg-blue-50"
                                >
                                  <PiEyeLight className="text-lg" />
                                </IconButton>
                              </td>
                            </tr>
                          ))
                        ) : invoiceDataLoading ? (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-gray-400">
                              <div className="flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                                <p>Loading invoice data...</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-gray-400">
                              <p>No invoices found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </AnimatePresence>

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
            widthSize={620}
          />
        )}

        {/* Total Expenses Drawer */}
        {showTotalExpensesDrawer && (
          <CustomDrawer
            open={showTotalExpensesDrawer}
            closeDrawer={closeTotalExpensesDrawer}
            compo={
              <TotalExpensesDrawer
                closeDrawer={closeTotalExpensesDrawer}
                totalExpenses={totalExpenses}
                totalExpensesLoading={totalExpensesLoading}
              />
            }
            title="Total Expenses"
            widthSize={620}
          />
        )}

        {/* Rejected Expenses Drawer */}
        {showRejectedExpensesDrawer && (
          <CustomDrawer
            open={showRejectedExpensesDrawer}
            closeDrawer={closeRejectedExpensesDrawer}
            compo={
              <RejectedExpensesDrawer
                closeDrawer={closeRejectedExpensesDrawer}
                rejectedExpenses={rejectedExpenses}
                rejectedExpensesLoading={rejectedExpensesLoading}
              />
            }
            title="Rejected Expenses"
            widthSize={620}
          />
        )}

        {/* Approved Expenses Drawer */}
        {showApprovedExpensesDrawer && (
          <CustomDrawer
            open={showApprovedExpensesDrawer}
            closeDrawer={closeApprovedExpensesDrawer}
            compo={
              <ApprovedExpensesDrawer
                closeDrawer={closeApprovedExpensesDrawer}
                approvedExpenses={approvedExpensesList}
                approvedExpensesLoading={approvedExpensesLoading}
              />
            }
            title="Approved Expenses"
            widthSize={620}
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
            widthSize={620}
          />
        )}

        {/* Expense Detail Modal */}
        <CustomDrawer
          open={showExpenseDetailModal}
          closeDrawer={handleCloseExpenseDetailModal}
          title="Expense Details"
          widthSize={620}
          compo={
            isLoadingExpenseDetail ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <Typography className="text-gray-500 text-sm">Loading details...</Typography>
                </div>
              </div>
            ) : selectedExpenseDetail ? (
              <div className="p-6 space-y-8 font-poppins">
                {/* Employee Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: "Employee Name", value: selectedExpenseDetail.employee_name, icon: <FaUser /> },
                    { label: "User ID", value: selectedExpenseDetail.user_id, icon: <HiMiniUser /> },
                    { label: "Expense Title", value: selectedExpenseDetail.title, icon: <FaFileInvoiceDollar /> },
                    { label: "Payment Type", value: selectedExpenseDetail.type === 0 ? "One-time" : "Installment", icon: <FaMoneyBill1Wave /> },
                    { label: "Date", value: selectedExpenseDetail.date ? formatDateDMY(selectedExpenseDetail.date) : "N/A", icon: <IoCalendar /> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-800">{item.value || "N/A"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFileSignature className="text-blue-500" />
                    <span className="text-sm font-semibold text-gray-700">Description</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedExpenseDetail.desc || "No description provided."}</p>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Expense Items */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AiOutlineBars className="text-blue-500" /> Expense Items
                  </h3>
                  {selectedExpenseDetail.items && selectedExpenseDetail.items.length > 0 ? (
                    <div className="space-y-3">
                      {selectedExpenseDetail.items.map((item, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 shadow-sm transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{item.item || "Unknown Item"}</p>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md mt-1 inline-block">
                                {item.category || "General"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 md:mt-0 text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {item.amount ? `${item.amount.toLocaleString()} PKR` : "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 text-sm">No items found for this expense.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-20 text-gray-500">
                No expense details available
              </div>
            )
          }
        />

        {/* Invoice Detail Modal */}
        <CustomDrawer
          open={showInvoiceDetailModal}
          closeDrawer={handleCloseInvoiceDetailModal}
          title="Invoice Details"
          widthSize={620}
          compo={
            selectedInvoice ? (
              <div className="p-6 space-y-8 font-poppins">
                <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 text-lg font-bold shadow-sm">
                    {selectedInvoice.employeeName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedInvoice.employeeName || "N/A"}</h3>
                    <p className="text-sm text-gray-500">ID: {selectedInvoice.id || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Installment</p>
                    <p className="text-lg font-bold text-gray-900">{selectedInvoice.installmentTotal || "N/A"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100 shadow-sm text-center">
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">Paid Amount</p>
                    <p className="text-lg font-bold text-green-700">{selectedInvoice.paidAmount || "N/A"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 shadow-sm text-center">
                    <p className="text-xs text-red-600 uppercase font-medium mb-1">Remaining</p>
                    <p className="text-lg font-bold text-red-700">{selectedInvoice.remainingAmount || "N/A"}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaFileSignature className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Settlement Method</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedInvoice.settlementMethod === "One time"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-orange-100 text-orange-700"
                    }`}>
                    {selectedInvoice.settlementMethod || "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-20 text-gray-500">
                No invoice details available
              </div>
            )
          }
        />
      </div>
    </div>
  );
};

export default ExpenseDashboard;