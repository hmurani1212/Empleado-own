import { Typography, Button } from "@material-tailwind/react";
import React, { useEffect, useState, useLayoutEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { BiSearch } from "react-icons/bi";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import useCometencyServices from "../../ViewModel/PerformnaceViewModel/competencyServices";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddCompetency from "./AddCompetency";
import EmployeeCompetency from "./EmployeeCompetency";
import { FaEye, FaPlus, FaClipboardList } from "react-icons/fa6";
import {
  Outlet,
  useLocation,
  useOutletContext,
  useNavigate,
} from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PerformanceTableSkeleton } from "./PerformanceSkeletons";

const Competency = () => {
  const {
    gettingPRCSelect,
    competencyValue,
    comptencyData,
    addCompetencyValue,
    handleToggleAddCompetency,
    handleAddCompetency,
    handleSelectAddCompetency,
    handleSelectCompetency,
    handleSearchCompetency,
    handleChangeAddCompetency,
    addComptency,
    deleteCompteny,
    handleSubmitAddCompetency,
    handleRemoveEmp,
    competencyLoading,
    competencyPaginationData,
    goToNextCompetencyPage,
    goToPreviousCompetencyPage,
    goToCompetencyPage,
  } = useCometencyServices();

  // Get the profile view handler from the parent component
  const {
    handleProfileView,
    currentView,
    showProfile,
    competencyData: competencyDataFromContext,
  } = useOutletContext() || {};

  const tableHeader = [
    "Emp ID",
    "Employee Name",
    "Total Competency Scales",
    "Score",
    "Actions",
  ];

  const location = useLocation();
  const navigate = useNavigate();

  const handleProfileClick = async (employeeId) => {
    try {
      // Trigger the profile view with competency type
      if (handleProfileView) {
        handleProfileView(employeeId, "competency");
      }
    } catch (error) {
      console.error("Error fetching employee profile:", error);
    }
  };

  useEffect(() => {
    gettingPRCSelect();
  }, []);

  return (
    <>
      {location.pathname.includes("sub-competency") ? (
        <Outlet />
      ) : showProfile &&
        currentView === "competency" &&
        competencyDataFromContext &&
        competencyDataFromContext.length > 0 ? (
        <EmployeeCompetency />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="w-full md:w-64">
                <CustomSelect
                  placeHolderTitle="Filter by Performance"
                  value={competencyValue.performance_id}
                  options={[
                    { value: null, label: "All Cycles" },
                    ...competencyValue.performance?.map((ele) => ({
                      value: ele._id,
                      label: ele.name,
                    })),
                  ]}
                  onChangeHandler={(selectedOption) =>
                    handleSelectCompetency(selectedOption, "performance_id")
                  }
                  customStyles={false}
                />
              </div>

              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                  placeholder="Search Employee..."
                  name="name"
                  value={competencyValue.searchText}
                  onChange={(e) => handleSearchCompetency(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="bg-bgBlue text-white shadow-blue-500/20 hover:shadow-blue-500/40 capitalize font-medium text-sm px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
              onClick={handleAddCompetency}
            >
              <FaPlus size={12} /> Create Competency
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
                  {competencyLoading &&
                    [...Array(6)].map((_, rowIndex) => (
                      <tr key={rowIndex} className="animate-pulse border-b border-gray-100">
                        <td className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded w-full max-w-[60px] mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded w-full max-w-[120px] mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-6 bg-gray-100 rounded-full w-full max-w-[100px] mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded w-full max-w-[60px] mx-auto" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-8 bg-gray-100 rounded-lg w-full max-w-[64px] mx-auto" />
                        </td>
                      </tr>
                    ))}
                  {!competencyLoading && comptencyData && comptencyData.length > 0 && (
                    comptencyData.map((ele, i) => {
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
                              {ele.total_competency || 0} Scales
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Typography className="text-sm font-normal text-gray-600 font-poppins">
                              {ele.total_score || "-"}
                            </Typography>
                          </td>
                          <td className="px-4 py-4">
                            <Button
                              variant="text"
                              className="p-2 rounded-lg text-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                              onClick={() => handleProfileClick(ele.employee_id)}
                            >
                              <FaEye size={18} />
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}

                  {!competencyLoading && comptencyData && comptencyData.length === 0 && (
                    <tr>
                      <td colSpan={tableHeader.length} className="p-10 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          <Typography className="font-medium">No competencies found</Typography>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {comptencyData && comptencyData.length > 0 && competencyPaginationData && competencyPaginationData.totalPages > 1 && (
                <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2">
                  {/* Previous Button */}
                  <button
                    title="Previous Page"
                    disabled={competencyPaginationData.currentPage <= 1}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                      competencyPaginationData.currentPage > 1
                        ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                        : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                    onClick={goToPreviousCompetencyPage}
                  >
                    ‹
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const currentPage = competencyPaginationData.currentPage;
                      const totalPages = competencyPaginationData.totalPages;
                      
                      const renderPageButton = (page) => (
                        <button
                          key={page}
                          onClick={() => goToCompetencyPage(page)}
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
                    disabled={competencyPaginationData.currentPage >= competencyPaginationData.totalPages}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                      competencyPaginationData.currentPage < competencyPaginationData.totalPages
                        ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                        : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                    onClick={goToNextCompetencyPage}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>

          <PortalDrawer
            open={addCompetencyValue.show}
            compo={
              addCompetencyValue.show ? (
                <AddCompetency
                  addCompetencyValue={addCompetencyValue}
                  performance={competencyValue.performance}
                  handleSelectAddCompetency={handleSelectAddCompetency}
                  handleChangeAddCompetency={handleChangeAddCompetency}
                  addComptency={addComptency}
                  deleteCompteny={deleteCompteny}
                  handleSubmitAddCompetency={handleSubmitAddCompetency}
                  handleRemoveEmp={handleRemoveEmp}
                />
              ) : null
            }
            title={addCompetencyValue.show ? "Add Competency" : ""}
            closeDrawer={addCompetencyValue.show ? handleToggleAddCompetency : () => {}}
            widthSize={620}
          />
        </div>
      )}
    </>
  );
};

export default Competency;