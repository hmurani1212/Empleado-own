import React, { useLayoutEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { BiSearch } from "react-icons/bi";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { Typography, Button } from "@material-tailwind/react";
import useGoalServices from "../../ViewModel/PerformnaceViewModel/goalServices";
import useStore from "../../Store/store";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { FaEye, FaPlus, FaClipboardList } from "react-icons/fa6";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddEditGoal from "./AddEditGoal";
import EmployeeGoals from "./EmployeeGoals";
import {
  Outlet,
  useLocation,
  useOutletContext,
  useNavigate,
} from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PerformanceTableSkeleton } from "./PerformanceSkeletons";

const Goals = () => {
  const tableHeader = [
    "Emp ID",
    "Employee Name",
    "No. of Goals",
    "Score",
    "Actions",
  ];
  const {
    gettingPRCSelect,
    goalsValue,
    handleSelectGoals,
    goalsData,
    handleAddGoal,
    toggleAddGoal,
    addGoalValue,
    handleChangeAddGoal,
    handleNewGoal,
    handleRemoveEmp,
    handleViewEmployeeGoals,
    employeeGoalsData,
    handleGoalsSearch,
    goalsLoading,
    goalsPaginationData,
    goToNextGoalsPage,
    goToPreviousGoalsPage,
    goToGoalsPage,
  } = useGoalServices();

  const location = useLocation();
  const navigate = useNavigate();

  const handleProfileClick = async (employeeId) => {
    try {
      console.log("Profile click - Employee ID:", employeeId);
      handleViewEmployeeGoals(employeeId, "Employee Name");
    } catch (error) {
      console.error("Error fetching employee profile:", error);
    }
  };

  useLayoutEffect(() => {
    gettingPRCSelect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount: cycles + goals list
  }, []);

  return (
    <>
      {location.pathname.includes("sub-goals") ? (
        <Outlet />
      ) : employeeGoalsData && employeeGoalsData.length > 0 ? (
        <EmployeeGoals />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="w-full md:w-64">
                <CustomSelect
                  placeHolderTitle={goalsValue.performanceListLoading ? "Loading cycles..." : "Select Cycle"}
                  value={goalsValue.performance_id}
                  options={[
                    { value: null, label: "All Cycles" },
                    ...goalsValue.performance?.map((ele) => ({
                      value: ele._id,
                      label: ele.name,
                    })),
                  ]}
                  onChangeHandler={(selectedOption) =>
                    handleSelectGoals(selectedOption, "performance_id")
                  }
                  customStyles={false}
                  menuLoading={goalsValue.performanceListLoading}
                  menuLoadingLabel="Loading review cycles..."
                />
              </div>
              
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={goalsValue.searchText}
                  onChange={handleGoalsSearch}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                />
                {goalsValue.searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>

            <Button
              className="bg-bgBlue text-white cursor-pointer shadow-blue-500/20 hover:shadow-blue-500/40 capitalize font-medium text-sm px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
              onClick={handleAddGoal}
            >
              <FaPlus size={12} /> Add Goal
            </Button>
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
                  {goalsLoading &&
                    [...Array(6)].map((_, rowIndex) => (
                      <tr key={rowIndex} className="animate-pulse border-b border-gray-100">
                        <td className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded w-full max-w-[60px] mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded w-full max-w-[120px] mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-6 bg-gray-100 rounded-full w-full max-w-[80px] mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded w-full max-w-[60px] mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-8 bg-gray-100 rounded-lg w-full max-w-[64px] mx-auto" />
                        </td>
                      </tr>
                    ))}
                  {!goalsLoading && goalsData && goalsData.length > 0 && (
                    goalsData.map((ele, i) => {
                      return (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-brand-50/30 transition-colors duration-200 group"
                        >
                          <td className="px-4 py-4">
                            <Typography className="text-sm font-normal text-gray-600 font-poppins">
                              {ele.employee_id || "-"}
                            </Typography>
                          </td>
                          <td className="px-4 py-4">
                            <Typography className="text-sm font-semibold text-gray-800 font-poppins group-hover:text-brand-600 transition-colors">
                              {ele.employee_name || "-"}
                            </Typography>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {ele.total_goals || 0} Goals
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Typography className="text-sm font-normal text-gray-600 font-poppins">
                              {ele.total_score && Number(ele.total_score) > 0 ? `${ele.total_score}/10` : '0/10'}
                            </Typography>
                          </td>
                          <td className="px-4 py-4">
                            <Button
                              variant="text"
                              className="p-2 rounded-lg text-brand-500 cursor-pointer hover:bg-brand-50 hover:text-brand-700 transition-colors"
                              onClick={() => handleProfileClick(ele.employee_id)}
                              title="View Employee Profile"
                            >
                              <FaEye size={18} />
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}

                  {!goalsLoading && goalsData && goalsData.length === 0 && (
                    <tr>
                      <td colSpan={tableHeader.length} className="p-10 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          <Typography className="font-medium">No goals found</Typography>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {goalsData && goalsData.length > 0 && goalsPaginationData && goalsPaginationData.totalPages > 1 && (
                <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2">
                  {/* Previous Button */}
                  <button
                    title="Previous Page"
                    disabled={goalsPaginationData.currentPage <= 1}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                      goalsPaginationData.currentPage > 1
                        ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                        : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                    onClick={goToPreviousGoalsPage}
                  >
                    ‹
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const currentPage = goalsPaginationData.currentPage;
                      const totalPages = goalsPaginationData.totalPages;
                      
                      const renderPageButton = (page) => (
                        <button
                          key={page}
                          onClick={() => goToGoalsPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
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
                    disabled={goalsPaginationData.currentPage >= goalsPaginationData.totalPages}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                      goalsPaginationData.currentPage < goalsPaginationData.totalPages
                        ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                        : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                    onClick={goToNextGoalsPage}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>

          <PortalDrawer
            open={addGoalValue.show}
            compo={
              addGoalValue.show ? (
                <AddEditGoal
                  performance={goalsValue.performance}
                  performanceListLoading={goalsValue.performanceListLoading}
                  employeesLoading={addGoalValue.employeesLoading}
                  handleSelectGoals={handleSelectGoals}
                  addGoalValue={addGoalValue}
                  handleChangeAddGoal={handleChangeAddGoal}
                  handleNewGoal={handleNewGoal}
                  handleRemoveEmp={handleRemoveEmp}
                />
              ) : null
            }
            title={addGoalValue.show ? "Add Goal" : ""}
            closeDrawer={addGoalValue.show ? toggleAddGoal : () => {}}
            widthSize={620}
          />
        </div>
      )}
    </>
  );
};

export default Goals;