import React, { useState, useEffect, useLayoutEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { Typography, Progress, Button } from "@material-tailwind/react";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaTrophy,
  FaChartBar,
  FaMedal,
  FaComments,
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import useStore from "../../Store/store";
import { formatTimestampToDate } from "../../services/__dateTimeServices";
import { HistorySkeleton } from "./PerformanceSkeletons";
import { motion, AnimatePresence } from "framer-motion";
// import ProfileManagement from './ProfileManagement';

const History = ({
  handleCloseProfile,
  profileData,
  selectedEmployeeId,
} = {}) => {
  const [historyData, setHistoryData] = useState([]);
  const [selectedReviewCycle, setSelectedReviewCycle] = useState("");
  const [searchText, setSearchText] = useState("");
  const [expandedCycles, setExpandedCycles] = useState({});

  // Get data from store
  const {
    mainHistoryData,
    gettingMainHistory,
    employeeHistoryData,
    gettingEmployeeHistory,
    currentEmployeeId,
    historyLoading,
    historyPaginationData,
    goToNextHistoryPage,
    goToPreviousHistoryPage,
    goToHistoryPage,
  } = useStore();

  // Check if we're in profile view (employee-specific history)
  // Force main table view if we're on the /performance/history route
  const isMainHistoryRoute =
    window.location.pathname === "/performance/history";
  const isProfileView =
    !isMainHistoryRoute && selectedEmployeeId && profileData;

  useEffect(() => {
    // Fetch appropriate history data based on view type
    const fetchHistoryData = async () => {
      try {
        if (isProfileView) {
          // Fetch employee-specific history
          const employeeId = selectedEmployeeId || currentEmployeeId;
          await gettingEmployeeHistory(employeeId);
        } else {
          // Fetch main history - start with page 1
          await gettingMainHistory(1, 10);
        }
      } catch (error) {
        console.error("Error fetching history data:", error);
      }
    };

    fetchHistoryData();
  }, [
    isProfileView,
    currentEmployeeId,
    selectedEmployeeId,
    gettingMainHistory,
    gettingEmployeeHistory,
  ]);

  useEffect(() => {
    if (isProfileView) {
      setHistoryData(employeeHistoryData ? [employeeHistoryData] : []);
    } else {
      setHistoryData(Array.isArray(mainHistoryData) ? mainHistoryData : []);
    }
  }, [mainHistoryData, employeeHistoryData, isProfileView]);

  // Function to display competency progress (already provided percentage)
  const calculateCompetencyProgress = (competencyRate) => {
    const numericValue = Number(competencyRate);
    if (Number.isNaN(numericValue)) return 0;
    if (numericValue > 100) return 100;
    if (numericValue < 0) return 0;
    return Math.round(numericValue);
  };

  // Function to format date for display
  const formatDisplayDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return formatTimestampToDate(timestamp);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Toggle expanded state for review cycles
  const toggleExpanded = (cycleId) => {
    setExpandedCycles((prev) => ({
      ...prev,
      [cycleId]: !prev[cycleId],
    }));
  };

  // Filter data based on search and selected review cycle
  const filteredData = historyData.filter((item) => {
    if (isProfileView) {
      // For profile view, we don't filter as it's employee-specific
      return true;
    }
    const matchesSearch =
      searchText === "" ||
      item.name?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCycle =
      selectedReviewCycle === "" || item.name === selectedReviewCycle;
    return matchesSearch && matchesCycle;
  });

  const handleBackToMain = () => {
    // Call the handleCloseProfile function to return to main history view
    if (handleCloseProfile) {
      handleCloseProfile();
    }
  };

  if (historyLoading) {
    return (
      <div className="flex flex-col gap-6 py-2 pb-1">
        <HistorySkeleton />
      </div>
    );
  }

  // Profile View - Employee-specific history
  if (isProfileView) {
    return (
      <div className="flex flex-col gap-4 py-2 pb-1">
        {/* Profile Management Component */}
        {/* <ProfileManagement 
                    profileData={profileData || setProfileData}
                    onClose={handleCloseProfile}
                /> */}

        {/* Back Navigation */}
        <div className="flex items-center mb-4">
          <Button
            variant="text"
            className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800 font-medium transition-colors p-2 cursor-pointer"
            onClick={handleBackToMain}
          >
            <FaArrowLeft className="text-sm" />
            Back to History
          </Button>
        </div>

        {/* Employee History Content */}
        {employeeHistoryData && (
          <div className="space-y-4">
            {/* Current Month Data */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpanded("current")}
              >
                <Typography className="font-medium text-[14px] font-Urbanist text-[#474747]">
                  Performance Review Cycle September
                </Typography>
                {expandedCycles.current ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </div>

              {expandedCycles.current && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Goals */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FaChartBar className="text-blue-600 text-xl" />
                      <div>
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal"
                        >
                          Goals
                        </Typography>
                        <Typography
                          variant="h6"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {employeeHistoryData.Current_month_data?.Total_Goal ||
                            0}
                        </Typography>
                      </div>
                    </div>

                    {/* Competency */}
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <FaMedal className="text-green-600 text-xl" />
                      <div>
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal"
                        >
                          Competency
                        </Typography>
                        <Typography
                          variant="h6"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {employeeHistoryData.Current_month_data
                            ?.Total_competency || 0}
                        </Typography>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <FaComments className="text-purple-600 text-xl" />
                      <div>
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal"
                        >
                          Feedback
                        </Typography>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <FaThumbsUp className="text-green-500 text-sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {employeeHistoryData.Current_month_data?.Feedback
                                ?.Like || 0}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaThumbsDown className="text-red-500 text-sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {employeeHistoryData.Current_month_data?.Feedback
                                ?.Dislike || 0}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaTrophy className="text-yellow-500 text-sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {employeeHistoryData.Current_month_data?.Feedback
                                ?.Reward || 0}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="flex items-center justify-center p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                      <div className="text-center">
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal"
                        >
                          Total Score
                        </Typography>
                        <Typography
                          variant="h5"
                          color="blue"
                          className="font-bold"
                        >
                          {employeeHistoryData.Current_month_data
                            ?.Total_score || 0}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Previous Month Data */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpanded("previous")}
              >
                <Typography className="font-medium text-[14px] text-[#474747] font-Urbanist">
                  Performance Review Cycle October
                </Typography>
                {expandedCycles.previous ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </div>

              {expandedCycles.previous && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Goals */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FaChartBar className="text-blue-600 text-xl" />
                      <div>
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal"
                        >
                          Goals
                        </Typography>
                        <Typography
                          variant="h6"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {employeeHistoryData.pre_month_data?.Total_Goal || 0}
                        </Typography>
                      </div>
                    </div>

                    {/* Competency */}
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <FaMedal className="text-green-600 text-xl" />
                      <div>
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal"
                        >
                          Competency
                        </Typography>
                        <Typography
                          variant="h6"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {employeeHistoryData.pre_month_data
                            ?.Total_competency || 0}
                        </Typography>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <FaComments className="text-purple-600 text-xl" />
                      <div>
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal"
                        >
                          Feedback
                        </Typography>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <FaThumbsUp className="text-green-500 text-sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {employeeHistoryData.pre_month_data?.Feedback
                                ?.Like || 0}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaThumbsDown className="text-red-500 text-sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {employeeHistoryData.pre_month_data?.Feedback
                                ?.Dislike || 0}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaTrophy className="text-yellow-500 text-sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {employeeHistoryData.pre_month_data?.Feedback
                                ?.Reward || 0}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="flex items-center justify-center p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                      <div className="text-center">
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal"
                        >
                          Total Score
                        </Typography>
                        <Typography
                          variant="h5"
                          color="blue"
                          className="font-bold"
                        >
                          {employeeHistoryData.pre_month_data?.Total_score || 0}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(!employeeHistoryData ||
          Object.keys(employeeHistoryData).length === 0) && (
          <div className="text-center py-8">
            <Typography variant="h6" color="gray" className="font-normal">
              No history data found for this employee
            </Typography>
          </div>
        )}
      </div>
    );
  }

  // Main History View - Table format
  const tableHeader = [
    "Name of Review Cycle",
    "Start Date",
    "End Date",
    "Goal Progress",
    "Competency Progress",
  ];

  return (
    <div className="flex flex-col gap-6 py-2 pb-1">
      {/* Filter and Search Section */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {/* Performance Review Cycle Dropdown */}
          <div className="relative w-72">
            <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
              Select Cycle
            </label>
            <select
              className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
              value={selectedReviewCycle}
              onChange={(e) => setSelectedReviewCycle(e.target.value)}
            >
              <option value="">Select Performance Review Cycle</option>
              {historyData.map((item, index) => (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card p-1 border border-gray-100 overflow-hidden">
        <div className="relative w-full min-h-[calc(100vh-200px)] overflow-auto customScroll">
          <table className="min-w-full table-fixed text-center border-collapse">
            <colgroup>
              <col span="5" />
            </colgroup>
            <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
              <tr>
                {tableHeader?.map((head, i) => (
                  <th key={i} className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-poppins first:rounded-tl-lg last:rounded-tr-lg">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {historyLoading &&
                [...Array(6)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="animate-pulse border-b border-gray-100">
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full max-w-[120px] mx-auto" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full max-w-[100px] mx-auto" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full max-w-[100px] mx-auto" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-8 bg-gray-100 rounded w-full max-w-[120px] mx-auto" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-8 bg-gray-100 rounded w-full max-w-[120px] mx-auto" />
                    </td>
                  </tr>
                ))}
              {!historyLoading && filteredData && filteredData.length > 0 && (
                filteredData.map((item, i) => {
                  const competencyProgress = calculateCompetencyProgress(
                    item.competency_progress || 0
                  );

                  return (
                    <motion.tr
                      key={item._id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-brand-50/30 transition-colors duration-200 group"
                    >
                      <td className="px-4 py-4">
                        <Typography className="text-sm font-semibold text-gray-800 font-poppins group-hover:text-brand-600 transition-colors">
                          {item.name || "N/A"}
                        </Typography>
                      </td>
                      <td className="px-4 py-4">
                        <Typography className="text-sm font-normal text-gray-600 font-poppins">
                          {formatDisplayDate(item.startDate || item.closing_date)}
                        </Typography>
                      </td>
                      <td className="px-4 py-4">
                        <Typography className="text-sm font-normal text-gray-600 font-poppins">
                          {formatDisplayDate(item.endDate || item.closing_date)}
                        </Typography>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-full flex flex-col items-center justify-center gap-2">
                          <Typography className="text-sm font-normal text-gray-600 font-poppins">
                            {item.goal_progress || 0}%
                          </Typography>
                          <Progress
                            value={item.goal_progress || 0}
                            color="blue"
                            className="h-2 w-full"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-full flex flex-col items-center justify-center gap-2">
                          <Typography className="text-sm font-normal text-gray-600 font-poppins">
                            {competencyProgress}%
                          </Typography>
                          <Progress
                            value={competencyProgress}
                            color="blue"
                            className="h-2 w-full"
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}

              {!historyLoading && filteredData && filteredData.length === 0 && (
                <tr>
                  <td colSpan={tableHeader.length} className="p-10 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <Typography className="font-medium">
                        {historyData?.length === 0
                          ? "No performance history found"
                          : "No results match your search criteria"}
                      </Typography>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredData && filteredData.length > 0 && historyPaginationData && historyPaginationData.totalPages > 1 && (
            <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2">
              {/* Previous Button */}
              <button
                title="Previous Page"
                disabled={historyPaginationData.currentPage <= 1}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                  historyPaginationData.currentPage > 1
                    ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                onClick={goToPreviousHistoryPage}
              >
                ‹
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1.5">
                {(() => {
                  const currentPage = historyPaginationData.currentPage;
                  const totalPages = historyPaginationData.totalPages;
                  
                  const renderPageButton = (page) => (
                    <button
                      key={page}
                      onClick={() => goToHistoryPage(page)}
                      className={`w-8 h-8 flex items-center cursor-pointer justify-center rounded-lg text-xs font-medium transition-all ${
                        page === currentPage
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );

                  // If 7 or fewer pages, show all
                  if (totalPages <= 7) {
                    return Array.from({ length: totalPages }, (_, i) => i + 1).map(renderPageButton);
                  }
                  
                  const pages = [];
                  pages.push(renderPageButton(1));
                  
                  if (currentPage > 3) {
                    pages.push(<span key="start-ellipsis" className="text-gray-400 px-1">...</span>);
                  }
                  
                  const startPage = Math.max(2, currentPage - 1);
                  const endPage = Math.min(totalPages - 1, currentPage + 1);
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(renderPageButton(i));
                  }
                  
                  if (currentPage < totalPages - 2) {
                    pages.push(<span key="end-ellipsis" className="text-gray-400 px-1">...</span>);
                  }
                  
                  pages.push(renderPageButton(totalPages));
                  
                  return pages;
                })()}
              </div>
              
              {/* Next Button */}
              <button
                title="Next Page"
                disabled={historyPaginationData.currentPage >= historyPaginationData.totalPages}
                className={`flex items-center justify-center cursor-pointer w-8 h-8 rounded-lg border transition-all ${
                  historyPaginationData.currentPage < historyPaginationData.totalPages
                    ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                onClick={goToNextHistoryPage}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;