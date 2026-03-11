import React, { useEffect, useState, useRef } from "react";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Typography } from "@material-tailwind/react";
import useAttendance from "../../ViewModel/AttendanceViewModel/AttendanceServices";
import formatTime, {
  convertSecondsToTime,
} from "../../services/__attendanceServices";
import { formatTimestamp } from "../../services/__formApprovalServices";
import { convertToYMD } from "../../services/EmpServices";
import { formatTimestampToDate } from "../../services/__dateTimeServices";
import { FaEye, FaRegEye, FaSearch, FaArrowLeft, FaPlus } from "react-icons/fa";
import { HiOutlineRefresh } from "react-icons/hi";
import useNewAdjustRequest from "../../ViewModel/AttendanceViewModel/newAdjustRequest";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import CreateNewRequest from "./CreateNewRequest";
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";
import useSocket from "../../Components/useSocket/useSocket";
import { showToast } from "../../Components/Toaster/Toaster";
import { BiSearch } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

/** Format time string (e.g. "09:22", "19:22") to 12-hour with AM/PM; safe for null/empty. */
function formatTimeDisplay(val) {
  if (val == null || val === "") return "—";
  if (typeof val === "string" && val.includes(":")) return formatTime(val);
  return String(val);
}

const AttAdustmentRequest = () => {
  const {
    requestData,
    requestPagination,
    handleDetailRequest,
    gettingRequestAdj,
  } = useAttendance();
  const [isLoadingPagination, setIsLoadingPagination] = useState(false);
  const {
    formValue,
    handleChangeAdjustRequest,
    toggleAddNewAdjustRequest,
    NewAdjustRequest,
    handleNewTimeRequest,
    handleEmployeeChange,
    loading: newAdjustRequestLoading,
  } = useNewAdjustRequest();
  const { Get_All_Employeefn, Get_All_Employee } = useEmployees();
  const { socketIoRef } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const title = [
    "Emp ID",
    "Name",
    "Requested Timings",
    "Received",
    "Reason",
    "Status",
    "Action"
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchDebounceRef = useRef(null);

  const DEBOUNCE_DELAY_MS = 350;

  // Debounced search handler - updates debouncedSearchTerm after delay
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    if (!value || value.trim() === "") {
      setDebouncedSearchTerm("");
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value.trim().toLowerCase());
      searchDebounceRef.current = null;
    }, DEBOUNCE_DELAY_MS);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  // Filter requestData by name and emp_id (one_id)
  const filteredRequestData = debouncedSearchTerm
    ? requestData.filter((ele) => {
        const empId = String(ele.one_id || ele.emp_id || "").toLowerCase();
        const name = String(ele.name || "").toLowerCase();
        return empId.includes(debouncedSearchTerm) || name.includes(debouncedSearchTerm);
      })
    : requestData;

  // Pagination helpers
  const getPaginationData = () => {
    const { page, limit, total, totalPages: storedTotalPages } = requestPagination || {};
    const currentPage = page || 1;
    const perPage = limit || 20;
    const totalRecords = total || 0;
    const totalPages = storedTotalPages ?? Math.max(1, Math.ceil(totalRecords / perPage));
    return {
      currentPage,
      totalPages,
      hasMore: requestPagination?.hasMore ?? (currentPage < totalPages)
    };
  };

  const goToNextPage = async () => {
    if (isLoadingPagination) return;
    const paginationData = getPaginationData();
    if (paginationData.currentPage < paginationData.totalPages) {
      setIsLoadingPagination(true);
      try {
        await gettingRequestAdj(false, paginationData.currentPage + 1);
      } finally {
        setIsLoadingPagination(false);
      }
    }
  };

  const goToPreviousPage = async () => {
    if (isLoadingPagination) return;
    const paginationData = getPaginationData();
    if (paginationData.currentPage > 1) {
      setIsLoadingPagination(true);
      try {
        await gettingRequestAdj(false, paginationData.currentPage - 1);
      } finally {
        setIsLoadingPagination(false);
      }
    }
  };

  const goToPage = async (pageNumber) => {
    if (isLoadingPagination) return;
    const targetPage = parseInt(pageNumber, 10);
    const paginationData = getPaginationData();
    if (targetPage >= 1 && targetPage <= paginationData.totalPages) {
      setIsLoadingPagination(true);
      try {
        await gettingRequestAdj(false, targetPage);
      } finally {
        setIsLoadingPagination(false);
      }
    }
  };

  // Fetch all employees on component mount
  useEffect(() => {
    gettingRequestAdj();
  }, []);

  // Fetch employees when form opens (for admin side)
  useEffect(() => {
    if (formValue.show && formValue.isAdminSide) {
      Get_All_Employeefn();
    }
  }, [formValue.show, formValue.isAdminSide]);

  // Listen for new time adjustment request socket event
  useEffect(() => {
    if (!socketIoRef.current) return;

    const handleNewTimeAdjustmentRequest = (data) => {
      showToast("New time adjustment request received!", "success");
    };

    socketIoRef.current.on(
      "new_time_adjustment_request",
      handleNewTimeAdjustmentRequest
    );

    return () => {
      if (socketIoRef.current) {
        socketIoRef.current.off(
          "new_time_adjustment_request",
          handleNewTimeAdjustmentRequest
        );
      }
    };
  }, [socketIoRef]);

  return (
    <>
      {location.pathname.includes("detail_card") ? (
        <Outlet />
      ) : (
        <div className="flex flex-col gap-6 animate-fade-in-up">
           {/* Header Section */}
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate("/attendance")}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                   <FaArrowLeft />
                </button>
                <div>
                   <h1 className="text-xl font-bold text-gray-800 tracking-tight">Time Adjustment Requests</h1>
                   <p className="text-sm text-gray-500 mt-0.5">Manage and approve attendance corrections</p>
                </div>
             </div>
             
             <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative group w-full md:w-64">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                   <BiSearch className="text-lg" />
                 </div>
                 <input
                   className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                   placeholder="Search by ID or Name..."
                   name="searchTerm"
                   value={searchTerm}
                   onChange={handleSearch}
                 />
               </div>
               
               <button
                  onClick={() => NewAdjustRequest(true)}
                  className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
               >
                 <FaPlus className="text-sm" />
                 <span>New Request</span>
               </button>
             </div>
           </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden flex flex-col">
            <div className="overflow-x-auto customScroll">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {title.map((head, i) => (
                      <th key={i} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                  {filteredRequestData.length > 0 ? (
                    filteredRequestData.map((ele, index) => {
                      return (
                        <motion.tr 
                          key={ele._id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                             <span className="font-mono text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                {ele.one_id}
                             </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-800">{ele.name}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                               <span className="text-xs text-gray-500 flex items-center gap-1">
                                  Date: <span className="font-medium text-gray-700">{ele && ele.form_data && convertToYMD(ele.form_data.date)}</span>
                               </span>
                               <div className="flex items-center gap-2 text-xs">
                                  <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                    In: {formatTimeDisplay(ele?.form_data?.in_time)}
                                  </span>
                                  <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100">
                                    Out: {formatTimeDisplay(ele?.form_data?.out_time)}
                                  </span>
                               </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTimestampToDate(ele.entry_time)}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={ele?.form_data?.reason}>
                            {ele?.form_data?.reason || "-"}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-semibold inline-flex items-center gap-1.5 ${
                                ele.status === 1
                                  ? "bg-green-50 text-green-600 border border-green-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-100"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${ele.status === 1 ? "bg-green-500" : "bg-amber-500"}`}></span>
                              {ele.status === 1 ? "Approved" : "Pending"}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => handleDetailRequest(ele._id)}
                                className="text-gray-400 hover:text-brand-500 hover:bg-brand-50 p-2 rounded-lg transition-all"
                                title="View Details"
                              >
                                <FaRegEye size={18} />
                              </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <BiSearch className="text-3xl text-gray-300" />
                          </div>
                          <h3 className="text-gray-800 font-medium text-lg">No requests found</h3>
                          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or create a new request.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {requestData.length > 0 && (() => {
              const paginationData = getPaginationData();
              return paginationData.totalPages >= 1 && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
                   <div className="text-xs text-gray-500 font-medium">
                      Page {paginationData.currentPage} of {paginationData.totalPages}
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button
                        onClick={goToPreviousPage}
                        disabled={isLoadingPagination || paginationData.currentPage <= 1}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-600 hover:border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {/* Simplified pagination for mobile/space - could be expanded if needed */}
                         {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                            // Logic to show window around current page could be complex, keeping it simple for now
                            // showing first 5 or logic like before
                            // For improved UI, let's just show current page input or simple list
                            let pageNum = i + 1;
                            if (paginationData.currentPage > 3 && paginationData.totalPages > 5) {
                                pageNum = paginationData.currentPage - 2 + i;
                            }
                            if (pageNum > paginationData.totalPages) return null;
                            
                            return (
                               <button
                                 key={pageNum}
                                 onClick={() => goToPage(pageNum)}
                                 className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                    pageNum === paginationData.currentPage 
                                    ? "bg-brand-500 text-white shadow-sm" 
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                 }`}
                               >
                                 {pageNum}
                               </button>
                            );
                         })}
                      </div>

                      <button
                        onClick={goToNextPage}
                        disabled={isLoadingPagination || paginationData.currentPage >= paginationData.totalPages}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-600 hover:border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        Next
                      </button>
                   </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {formValue.show && (
        <PortalDrawer
          open={formValue.show}
          closeDrawer={toggleAddNewAdjustRequest}
          compo={
            <CreateNewRequest
              loading={newAdjustRequestLoading}
              formValue={formValue}
              handleChangeAdjustRequest={handleChangeAdjustRequest}
              handleNewTimeRequest={handleNewTimeRequest}
              isAdminSide={formValue.isAdminSide}
              employeeList={Get_All_Employee}
              selectedEmployee={formValue.selectedEmployee}
              handleEmployeeChange={handleEmployeeChange}
            />
          }
          title="Create New Request"
          widthSize={600}
        />
      )}
    </>
  );
};

export default AttAdustmentRequest;