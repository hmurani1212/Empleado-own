import React, { useEffect, useState } from "react";
import deptImage from "../../assets/images/departement 1.png";
import {
  Card,
  CardBody,
  Typography,
  Button,
  MenuItem,
} from "@material-tailwind/react";
import CustomDrawer from "../../Components/CustomDrawer/CustomDrawer";
import useDepartments from "../../ViewModel/DepartmentsViewModel/DepartmentsServices";
import AddNewDepartment from "./AddNewDepartment";
import { FaEye, FaChevronDown } from "react-icons/fa";
import { HiOutlineUserGroup, HiOutlineOfficeBuilding } from "react-icons/hi"; // New icons
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import useSubDept from "../../ViewModel/DepartmentsViewModel/SubDeptServices";
import { Outlet, useLocation, useParams } from "react-router";
import useDropdownService from "../../services/__dropDownHoverService";
import CustomButton from "../../Components/CustomButton/CustomButton";

/** Skeleton row mirroring table columns: Dept Name (left), Description, Employees, Head of Dept, Sub Depts, Designations, Actions */
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
    <td className="p-4 first:pl-6 text-left">
      <div className="h-4 bg-gray-100 rounded w-32 max-w-[200px]" />
    </td>
    <td className="p-4 max-w-[250px]">
      <div className="h-4 bg-gray-100 rounded w-full max-w-[220px] mx-auto" />
    </td>
    <td className="p-4">
      <div className="flex items-center justify-center gap-2">
        <div className="h-6 w-12 bg-gray-100 rounded-full" />
        <div className="h-4 w-10 bg-gray-100 rounded" />
      </div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
    </td>
    <td className="p-4">
      <div className="flex items-center justify-center gap-2">
        <div className="h-6 w-6 rounded-full bg-gray-100" />
        <div className="h-4 w-10 bg-gray-100 rounded" />
      </div>
    </td>
    <td className="p-4">
      <div className="h-8 w-8 rounded-full bg-gray-100 mx-auto" />
    </td>
    <td className="p-4 last:pr-6">
      <div className="h-8 w-16 bg-gray-100 rounded-lg mx-auto" />
    </td>
  </tr>
);

const Departments = () => {
  const {
    addNewDepartment,
    allDeptDetails,
    deptPagination,
    getManageDept,
    branchIdset,
    openDialogDept,
    handleEmpDetails,
    handleNavigateCreateNewDept,
    handleDeleteDept,
    handleDialogDept,
    showDrawer,
    deptActionTitle,
    openMenuDept,
    toggleMenuDept,
    closeDeptDrawer,
    handleMenuDept,
    handleDesignation,
    handleBackDept,
    settingBranchId,
  } = useDepartments();
  const { triggerRefs, getDropdownPosition } = useDropdownService();
  const { handleSubDept } = useSubDept();
  
  const deptData = [
    "Dept Name",
    "Description",
    "Employees",
    "Head of Dept",
    "Sub Depts",
    "Designations",
    "Actions",
  ];

  const params = useParams();
  const location = useLocation();

  const [isLoadingDeptPage, setIsLoadingDeptPage] = useState(false);
  const branchId = branchIdset || params.id;

  useEffect(() => {
    if (params.id && location.pathname.includes("manageDept")) {
      settingBranchId(params.id);
      // Simulate a loading state if not provided by ViewModel
      setIsLoadingDeptPage(true);
      getManageDept(params.id, 1, 10).finally(() => setIsLoadingDeptPage(false));
    }
  }, [params.id]);

  const getDeptPaginationData = () => {
    const p = deptPagination || {};
    return {
      currentPage: p.current_page || 1,
      totalPages: p.total_pages || Math.ceil((p.total_records || 0) / (p.per_page || 10)) || 1,
      hasMore: (p.current_page || 1) < (p.total_pages || 1),
    };
  };

  const goToDeptPage = async (pageNumber) => {
    if (isLoadingDeptPage || !branchId) return;
    const paginationData = getDeptPaginationData();
    const targetPage = parseInt(pageNumber, 10);
    if (targetPage < 1 || targetPage > paginationData.totalPages) return;
    setIsLoadingDeptPage(true);
    try {
      await getManageDept(branchId, targetPage, 10);
    } finally {
      setIsLoadingDeptPage(false);
    }
  };

  const goToDeptPreviousPage = async () => {
    const paginationData = getDeptPaginationData();
    if (paginationData.currentPage > 1) {
      await goToDeptPage(paginationData.currentPage - 1);
    }
  };

  const goToDeptNextPage = async () => {
    const paginationData = getDeptPaginationData();
    if (paginationData.currentPage < paginationData.totalPages) {
      await goToDeptPage(paginationData.currentPage + 1);
    }
  };

  // Server returns one page; render allDeptDetails as-is (no client-side slice)
  const displayDeptDetails = allDeptDetails || [];

  return (
    <>
      {location.pathname.includes("manage_sub_dep") ? (
        <Outlet />
      ) : (
        <div className="min-h-screen  ">
          {allDeptDetails?.length > 0 || isLoadingDeptPage ? (
            <div className=" mx-auto space-y-6">
              
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                    Manage Departments
                  </h1>
                  <p className="text-sm text-gray-500 font-poppins mt-1">
                    Overview and management of your organization's structure
                  </p>
                </div>
                <div className="flex items-center gap-3">
                   <CustomButton
                    className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm font-medium transition-all"
                    onClick={handleBackDept}
                    title="Back"
                  >
                    Back
                  </CustomButton>
                  <CustomButton
                    className="bg-bgBlue text-white hover:bg-blue-600 px-4 py-2 rounded-lg shadow-lg shadow-blue-500/20 font-medium transition-all flex items-center gap-2"
                    onClick={handleNavigateCreateNewDept}
                    title="Add Department"
                  >
                    <span className="text-lg">+</span> Add Department
                  </CustomButton>
                </div>
              </div>

              {/* Glassy Table Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-center min-w-[1000px] table-auto">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        {deptData?.map((head, i) => (
                          <th key={i} className={`p-4 first:pl-6 last:pr-6 ${i === 0 ? 'text-left' : 'text-center'}`}>
                            <Typography className="font-semibold uppercase tracking-wider text-[11px] text-gray-500 font-poppins">
                              {head}
                            </Typography>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50">
                      {isLoadingDeptPage ? (
                         [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                      ) : (
                        displayDeptDetails.map((t_data, index) => (
                          <motion.tr
                            key={t_data.id ?? index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-blue-50/30 transition-colors group"
                          >
                            {/* Dept Name */}
                            <td className="p-4 first:pl-6 text-left">
                              <Typography className="text-sm font-semibold text-gray-900 font-poppins">
                                {t_data.name || t_data.dept_name}
                              </Typography>
                            </td>

                            {/* Description */}
                            <td className="p-4 max-w-[250px]">
                              <Typography className="text-sm text-gray-500 font-poppins truncate" title={t_data.description}>
                                {t_data.description || "—"}
                              </Typography>
                            </td>

                            {/* Number Of Employees */}
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
                                  <HiOutlineUserGroup size={14} />
                                  {t_data?._count?.employees ?? "0"}
                                </span>
                                <button
                                  type="button"
                                  className="text-xs text-blue-500 hover:text-blue-700 font-medium font-poppins transition-colors underline decoration-blue-200 hover:decoration-blue-500 underline-offset-2"
                                  onClick={() => handleEmpDetails(t_data.id)}
                                >
                                  View
                                </button>
                              </div>
                            </td>

                            {/* Head Of Department */}
                            <td className="p-4">
                              <Typography className="text-sm font-medium text-gray-700 font-poppins">
                                {t_data?.Hod || <span className="text-gray-400 italic">Unassigned</span>}
                              </Typography>
                            </td>

                            {/* Sub Departments */}
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                                  {t_data.childDepartments || "0"}
                                </span>
                                <button
                                  type="button"
                                  className="text-xs text-blue-500 hover:text-blue-700 font-medium font-poppins transition-colors underline decoration-blue-200 hover:decoration-blue-500 underline-offset-2"
                                  onClick={() => handleSubDept(t_data, params.id)}
                                >
                                  Manage
                                </button>
                              </div>
                            </td>

                            {/* Designation(s) */}
                            <td className="p-4">
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleDesignation(t_data.designation, t_data.id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-all shadow-sm border border-blue-100"
                                  title="View Designations"
                                >
                                  <FaEye size={14} />
                                </button>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4 last:pr-6 relative">
                                <div
                                  ref={(el) => (triggerRefs.current[index] = el)}
                                  onMouseEnter={() => toggleMenuDept(index, true)}
                                  onMouseLeave={() => toggleMenuDept(index, false)}
                                  className="relative inline-block"
                                >
                                  <Button
                                    className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all normal-case"
                                    variant="text"
                                  >
                                    Action
                                    <FaChevronDown
                                      size={10}
                                      className={`transition-transform duration-200 ${openMenuDept[index] ? "rotate-180" : ""}`}
                                    />
                                  </Button>

                                  <AnimatePresence>
                                    {openMenuDept[index] && (() => {
                                       const isFirstRow = index === 0;
                                       const isLastRow = index === displayDeptDetails.length - 1;
                                       const isOpenUp = isFirstRow ? false : isLastRow ? true : getDropdownPosition(index) === "top";
                                      
                                      return (
                                        <motion.div
                                          initial={{ opacity: 0, y: isOpenUp ? 10 : -10, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: isOpenUp ? 10 : -10, scale: 0.95 }}
                                          transition={{ duration: 0.15, ease: "easeOut" }}
                                          className={`absolute z-50 bg-white border border-gray-100 rounded-xl shadow-xl w-40 right-0 ${
                                            isOpenUp ? "bottom-full mb-2" : "top-full mt-2"
                                          }`}
                                        >
                                          <ul className="flex flex-col py-1">
                                            {deptActionTitle.map((menuItem) => (
                                              <li key={menuItem.id}>
                                                <button
                                                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between transition-colors"
                                                  onClick={() => handleMenuDept(menuItem.id, t_data)}
                                                >
                                                  {menuItem.title}
                                                  <span style={{ color: menuItem.color }}>{menuItem.icon}</span>
                                                </button>
                                              </li>
                                            ))}
                                          </ul>
                                        </motion.div>
                                      );
                                    })()}
                                  </AnimatePresence>
                                </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {displayDeptDetails.length > 0 && !isLoadingDeptPage && (() => {
                    const paginationData = getDeptPaginationData();
                    return paginationData.totalPages > 1 && (
                      <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2 pb-4">
                        {/* Previous Button */}
                        <button
                          title="Previous Page"
                          disabled={paginationData.currentPage <= 1}
                          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                            paginationData.currentPage > 1
                              ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                              : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                          }`}
                          onClick={goToDeptPreviousPage}
                        >
                          ‹
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex items-center gap-1.5">
                          {(() => {
                            const currentPage = paginationData.currentPage;
                            const totalPages = paginationData.totalPages;
                            
                            const renderPageButton = (page) => (
                              <button
                                key={page}
                                onClick={() => goToDeptPage(page)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                  page === currentPage
                                    ? 'bg-bgBlue text-white shadow-md shadow-blue-500/20'
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
                          disabled={paginationData.currentPage >= paginationData.totalPages}
                          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                            paginationData.currentPage < paginationData.totalPages
                              ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                              : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                          }`}
                          onClick={goToDeptNextPage}
                        >
                          ›
                        </button>
                      </div>
                    );
                  })()
                }
              </div>

              <ConfirmationDialog
                openDialog={openDialogDept}
                handleOpen={handleDialogDept}
                handleConfirm={(e) => handleDeleteDept(e)}
                title={"Confirm Delete"}
                message={"Are you sure to Delete this Department?"}
              />
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full"
                >
                  <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <img
                      src={deptImage}
                      alt="No Departments"
                      className="w-20 h-20 opacity-80 mix-blend-multiply"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-poppins">
                    No Departments Found
                  </h3>
                  <p className="text-gray-500 mb-8 font-poppins text-sm">
                    You haven't created any departments yet. Start by building your organization structure.
                  </p>
                  <CustomButton
                    className="w-full bg-bgBlue text-white hover:bg-blue-600 py-3 rounded-xl shadow-lg shadow-blue-500/20 font-semibold transition-all"
                    onClick={() => handleNavigateCreateNewDept()}
                    title="Add Your First Department"
                  >
                    Add New Department
                  </CustomButton>
                </motion.div>
             </div>
          )}

          <CustomDrawer
            open={showDrawer}
            closeDrawer={closeDeptDrawer}
            compo={<AddNewDepartment />}
            title="Add New Department"
          />
        </div>
      )}
    </>
  );
};

export default Departments;