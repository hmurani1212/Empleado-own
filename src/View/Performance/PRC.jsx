import React, { useEffect, useState, useLayoutEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { BiSearch } from "react-icons/bi";
import { Button, MenuItem, Typography } from "@material-tailwind/react";
import usePRCServices from "../../ViewModel/PerformnaceViewModel/PRCServices";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddEditPRC from "./AddEditPRC";
import usePerformanceServices from "../../ViewModel/PerformnaceViewModel/performanceServices";
import { motion, AnimatePresence } from "framer-motion";
import useDropdownService from "../../services/__dropDownHoverService";
import { PRCActionList } from "../../services/__performanceServices";
import { FaChevronDown } from "react-icons/fa6";
import ViewPRC from "./ViewPRC";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { PerformanceTableSkeleton } from "./PerformanceSkeletons";

const PRC = () => {
  const tableHeader = [
    "S.No",
    "Title",
    "Assigned To",
    "Start Date",
    "End Date",
    "Actions",
  ];

  // Helper function to format timestamps to dates
  const formatTimestampToDate = (timestamp) => {
    if (!timestamp) return "";

    let date;
    // If timestamp is a number
    if (typeof timestamp === "number") {
      // If timestamp is in seconds (10 digits), convert to milliseconds
      if (timestamp.toString().length === 10) {
        date = new Date(timestamp * 1000);
      } else {
        // If timestamp is already in milliseconds (13 digits)
        date = new Date(timestamp);
      }
    } else {
      // If timestamp is a string, try to parse it
      date = new Date(timestamp);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid timestamp:", timestamp);
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const {
    PRCAddValue,
    toggleAddPRC,
    handlePRCMenuList,
    viewPRC,
    toggleViewPRC,
    deleteValue,
    confirmDelete,
    toggleDeleteConfirmatio,
    handleChangeRPC,
    handleSelectAddPRC,
    handleSubmitPRC,
    handleRemoveEmp,
    handleUpdatePRC,
    searchValue,
    handlePRCSearch,
    searchLoading,
  } = usePRCServices();

  const {
    PRCData,
    toggleMenuValue,
    openMenuValue,
    performanceScrollRef,
    gettingPRCData,
    PRCLoading,
    PRCPaginationData,
    goToNextPRCPage,
    goToPreviousPRCPage,
    goToPRCPage,
  } = usePerformanceServices();

  const { getDropdownPosition, triggerRefs } = useDropdownService();

  const [portalState, setPortalState] = useState({
    openIndex: -1,
    top: 0,
    left: 0,
    bottom: undefined,
    openAbove: false,
  });

  const scrollContainerRef = React.useRef(null);

  const updatePortalPosition = React.useCallback(() => {
    if (!PRCData || !Array.isArray(PRCData)) return;
    const openIndex = PRCData.findIndex((_, i) => openMenuValue[i]);
    if (openIndex < 0) {
      setPortalState((s) => (s.openIndex < 0 ? s : { ...s, openIndex: -1 }));
      return;
    }
    const triggerEl = triggerRefs.current?.[openIndex];
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    const openAbove = openIndex >= PRCData.length - 3;
    const dropdownWidth = 200;
    const left = Math.max(4, Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - 4));
    setPortalState({
      openIndex,
      left,
      top: openAbove ? undefined : rect.bottom + 0,
      bottom: openAbove ? window.innerHeight - rect.top + 0 : undefined,
      openAbove,
    });
  }, [openMenuValue, PRCData]);

  useLayoutEffect(() => {
    updatePortalPosition();
  }, [openMenuValue, updatePortalPosition]);

  useEffect(() => {
    if (portalState.openIndex < 0) return;
    const scrollEl = scrollContainerRef.current;
    const onScroll = () => updatePortalPosition();
    scrollEl?.addEventListener("scroll", onScroll, true);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      scrollEl?.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [portalState.openIndex, updatePortalPosition]);

  const isAnyActionMenuOpen = Object.values(openMenuValue || {}).some(Boolean);

  useEffect(() => {
    gettingPRCData(1, 10);
  }, []);

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* <h1 className='text-3xl'>Performance</h1> */}

      <div className="flex items-end justify-between">
        <div className="relative w-96">
          <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
            Search Review Cycle
          </label>
          <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-1/2 mt-3 right-3 -translate-y-2/4">
            {searchLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            ) : (
              <span>
                <BiSearch />
              </span>
            )}
          </div>
          <input
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
            placeholder="Search Review Cycle"
            name="name"
            value={searchValue.name}
            onChange={handlePRCSearch}
            disabled={searchLoading}
          />
        </div>
        <div>
          <CustomButton
            className="bg-[#8bc9f8]"
            title="Create Performance Review Cycle"
            onClick={toggleAddPRC}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-card p-1 border border-gray-100 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="relative w-full min-h-[calc(100vh-200px)] overflow-auto customScroll"
        >
          <table className="min-w-full table-fixed text-center border-collapse">
            <colgroup>
              <col span="6" />
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
            <tbody className={`bg-white divide-y divide-gray-100 ${isAnyActionMenuOpen ? "relative z-[25]" : ""}`}>
              {PRCLoading &&
                [...Array(6)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="animate-pulse border-b border-gray-100">
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full max-w-[40px] mx-auto" />
                    </td>
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
                      <div className="h-4 bg-gray-100 rounded w-full max-w-[100px] mx-auto" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-8 bg-gray-100 rounded-lg w-full max-w-[64px] mx-auto" />
                    </td>
                  </tr>
                ))}
              {!PRCLoading && PRCData && PRCData.length > 0 && (
                PRCData.map((ele, i) => {
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`hover:bg-brand-50/30 transition-colors duration-200 group ${openMenuValue[i] ? "relative z-[40] isolate" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <Typography className="text-sm font-normal text-gray-600 font-poppins">
                          {i + 1}
                        </Typography>
                      </td>
                      <td className="px-4 py-4">
                        <Typography className="text-sm font-semibold text-gray-800 font-poppins group-hover:text-brand-600 transition-colors">
                          {ele.name || "-"}
                        </Typography>
                      </td>
                      <td className="px-4 py-4">
                        <Typography className="text-sm font-normal text-gray-600 font-poppins">
                          {ele.assign_to ?? "-"}
                        </Typography>
                      </td>
                      <td className="px-4 py-4">
                        <Typography className="text-sm font-normal text-gray-600 font-poppins">
                          {formatTimestampToDate(ele.startDate) || "-"}
                        </Typography>
                      </td>
                      <td className="px-4 py-4">
                        <Typography className="text-sm font-normal text-gray-600 font-poppins">
                          {formatTimestampToDate(ele.endDate) || "-"}
                        </Typography>
                      </td>
                      <td className={`px-4 py-4 relative ${openMenuValue[i] ? "z-[30]" : ""}`}>
                        <div
                          ref={(el) => (triggerRefs.current[i] = el)}
                          onMouseEnter={() => toggleMenuValue(i, true)}
                          onMouseLeave={() => toggleMenuValue(i, false)}
                          className="relative flex justify-center"
                        >
                          <Button
                            className="flex items-center gap-2 capitalize font-medium bg-white hover:bg-brand-50 text-brand-500 border border-brand-200 hover:border-brand-300 rounded-lg text-xs px-3 py-1.5 shadow-sm transition-all"
                          >
                            Action
                            <FaChevronDown
                              className={`w-3 h-3 transition-transform duration-200 ${
                                openMenuValue[i] ? "rotate-180" : ""
                              }`}
                            />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}

              {!PRCLoading && PRCData && PRCData.length === 0 && (
                <tr>
                  <td colSpan={tableHeader.length} className="p-10 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <Typography className="font-medium">
                        {searchValue.name.trim()
                          ? "No search results found"
                          : "No performance review cycles found"}
                      </Typography>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {PRCData && PRCData.length > 0 && PRCPaginationData && PRCPaginationData.totalPages > 1 && (
            <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2">
              {/* Previous Button */}
              <button
                title="Previous Page"
                disabled={PRCPaginationData.currentPage <= 1}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                  PRCPaginationData.currentPage > 1
                    ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                onClick={goToPreviousPRCPage}
              >
                ‹
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1.5">
                {(() => {
                  const currentPage = PRCPaginationData.currentPage;
                  const totalPages = PRCPaginationData.totalPages;
                  
                  const renderPageButton = (page) => (
                    <button
                      key={page}
                      onClick={() => goToPRCPage(page)}
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
                disabled={PRCPaginationData.currentPage >= PRCPaginationData.totalPages}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                  PRCPaginationData.currentPage < PRCPaginationData.totalPages
                    ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                onClick={goToNextPRCPage}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {portalState.openIndex >= 0 &&
        ReactDOM.createPortal(
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="fixed w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[9999]"
            style={{
              left: portalState.left,
              top: portalState.top,
              bottom: portalState.bottom,
            }}
            onMouseEnter={() => toggleMenuValue(portalState.openIndex, true)}
            onMouseLeave={() => toggleMenuValue(portalState.openIndex, false)}
          >
            <ul className="flex w-full flex-col py-1">
              {PRCActionList.map((menuItem) => (
                <li
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors text-gray-700 hover:text-brand-600"
                  key={menuItem.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePRCMenuList(PRCData[portalState.openIndex], menuItem);
                  }}
                >
                  <Typography variant="small" className="text-xs font-medium font-poppins">
                    {menuItem.name}
                  </Typography>
                  <span style={{ color: menuItem.color }} className="text-sm opacity-80">
                    {menuItem.icon}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>,
          document.body
        )}

      {(PRCAddValue.show || viewPRC.show) && (
        <PortalDrawer
          open={PRCAddValue.show || viewPRC.show}
          compo={
            PRCAddValue.show ? (
              <AddEditPRC
                handleChangeRPC={handleChangeRPC}
                PRCAddValue={PRCAddValue}
                handleSelectAddPRC={handleSelectAddPRC}
                handleSubmitPRC={handleSubmitPRC}
                handleRemoveEmp={handleRemoveEmp}
                handleUpdatePRC={handleUpdatePRC}
              />
            ) : viewPRC.show ? (
              <ViewPRC data={viewPRC.singleData} />
            ) : null
          }
          title={
            PRCAddValue.show
              ? !PRCAddValue.update
                ? "Create Performance Review Cycle"
                : "Update Performance Review Cycle"
              : viewPRC.show
              ? "Performance Review Cycle"
              : null
          }
          closeDrawer={
            PRCAddValue.show
              ? toggleAddPRC
              : viewPRC.show
              ? toggleViewPRC
              : null
          }
          widthSize={PRCAddValue.show ? 550 : viewPRC.show ? 750 : null}
        />
      )}

      {deleteValue.show && (
        <ConfirmationDialog
          openDialog={deleteValue.show}
          handleOpen={toggleDeleteConfirmatio}
          handleConfirm={confirmDelete}
          loading={deleteValue.loading}
          title="Delete Confirmation"
          message="Are you sure you want to delete this ?"
        />
      )}
    </div>
  );
};

export default PRC;