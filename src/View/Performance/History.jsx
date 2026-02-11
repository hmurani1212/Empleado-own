import React, { useState, useEffect } from "react";
import { Typography, Progress, Button } from "@material-tailwind/react";
import { BiSearch } from "react-icons/bi";
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
// import ProfileManagement from './ProfileManagement';

const History = ({
  handleCloseProfile,
  profileData,
  selectedEmployeeId,
} = {}) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
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
          // Fetch main history
          await gettingMainHistory();
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
    // Update local state when store data changes
    if (isProfileView) {
      if (employeeHistoryData) {
        setHistoryData([employeeHistoryData]); // Wrap in array for consistency
      }
    } else {
      if (mainHistoryData && mainHistoryData.length > 0) {
        setHistoryData(mainHistoryData);
      }
    }
    setLoading(false);
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

  if (loading || historyLoading) {
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
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors p-2 cursor-pointer"
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

          {/* Search Employee Input */}
          <div className="relative w-64">
            <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
              Search Employee
            </label>
            <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-1/2 mt-3 right-3 -translate-y-2/4">
              <span>
                <BiSearch />
              </span>
            </div>
            <input
              className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
              placeholder="Search Employee"
              name="name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[10px] drop-shadow-md p-2">
        <div className="h-[calc(100vh-100px)] overflow-auto customScroll">
          <table className="w-full text-center">
            <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
              <tr>
                {tableHeader?.map((head, i) => (
                  <th key={i} className="bg-[#F8F9FA] p-4">
                    <Typography
                      // variant="small"
                      // color="blue-gray"
                      className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData?.map((item, i) => {
                const isLast = i === filteredData?.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-[#F2F2F9]";
                const competencyProgress = calculateCompetencyProgress(
                  item.competency_progress || 0
                );

                return (
                  <tr key={item._id || i}>
                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color="blue-gray"
                        className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {item.name || "N/A"}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color="blue-gray"
                        className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {formatDisplayDate(item.startDate || item.closing_date)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color="blue-gray"
                        className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {formatDisplayDate(item.endDate || item.closing_date)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="w-full flex items-center justify-center">
                        <Progress
                          value={item.goal_progress || 0}
                          color="blue"
                          className="h-2"
                        />
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize mt-1"
                        >
                          {item.goal_progress || 0}% progress
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="w-full flex items-center justify-center">
                        <Progress
                          value={competencyProgress}
                          color="blue"
                          className="h-2"
                        />
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize mt-1"
                        >
                          {competencyProgress}% progress
                        </Typography>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData?.length === 0 && (
            <div className="text-center py-8">
              <Typography variant="h6" color="gray" className="font-normal">
                {historyData?.length === 0
                  ? "No performance history found"
                  : "No results match your search criteria"}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;