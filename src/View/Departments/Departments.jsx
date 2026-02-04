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
import { motion } from "framer-motion";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import useSubDept from "../../ViewModel/DepartmentsViewModel/SubDeptServices";
import { Outlet, useLocation, useParams } from "react-router";
import useDropdownService from "../../services/__dropDownHoverService";
import CustomButton from "../../Components/CustomButton/CustomButton";


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
    "Number of Employees",
    "Head of Department",
    "Sub Departments",
    "Designation(s)",
    "Actions",
  ];

  const params = useParams();
  const location = useLocation();

  const [isLoadingDeptPage, setIsLoadingDeptPage] = useState(false);
  const branchId = branchIdset || params.id;

  useEffect(() => {
    if (params.id && location.pathname.includes("manageDept")) {
      settingBranchId(params.id);
      getManageDept(params.id, 1, 10);
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

  const centerCols = [0, 1, 2, 3, 4, 5, 6];
  const minWidths = {
    0: "min-w-[220px]", // Dept Name
    1: "min-w-[260px]", // Description
    2: "min-w-[180px]", // Number Of Employees
    3: "min-w-[180px]", // Head Of Department
    4: "min-w-[170px]", // Sub Departments
    5: "min-w-[140px]", // Designation(s)
    6: "min-w-[120px]", // Actions
  };
  return (
    <>
      {location.pathname.includes("manage_sub_dep") ? (
        <Outlet />
      ) : (
        <div>
          {allDeptDetails?.length > 0 ? (
            <>
              <div className="flex flex-col space-y-4 px-2">
                <div className="flex flex-row items-center justify-between gap-4">
                  <span className="font-medium text-[16px] capitalize text-bgBlue font-Urbanist">
                    Manage existing department
                  </span>
                  <div className="flex items-center gap-2">
                    <CustomButton
                      className="capitalize font-medium bg-[#8bc9f8] p-2"
                      onClick={handleNavigateCreateNewDept}
                      title="Add new department"
                    >
                      {/* Add new department */}
                    </CustomButton>
                    <CustomButton
                      title="back"
                      onClick={handleBackDept}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-[10px] drop-shadow-md p-2 z-20">
                  <div className="relative w-full overflow-auto customScroll">
                    <table className="w-full text-center min-w-max">
                      <thead className="sticky top-0 z-20 bg-[#F8F9FA] rounded-[8px]">
                        <tr>
                          {deptData?.map((head, i) => (
                            <th key={i} className="bg-[#F8F9FA] p-4 text-center">
                              <Typography className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist">
                                {head}
                              </Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {displayDeptDetails.map((t_data, index) => {
                          const isLast = index === displayDeptDetails.length - 1;
                          const cellClasses = isLast ? "p-4 text-center" : "p-4 border-b border-[#F2F2F9] text-center";

                          return (
                            <tr key={t_data.id ?? index} className="hover:bg-gray-50 transition-colors">
                              {/* Dept Name */}
                              <td className={cellClasses}>
                                <Typography className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal">
                                  {t_data.name || t_data.dept_name}
                                </Typography>
                              </td>

                              {/* Description */}
                              <td className={cellClasses}>
                                <Typography className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal">
                                  {t_data.description}
                                </Typography>
                              </td>

                              {/* Number Of Employees (count + View) */}
                              <td className={cellClasses}>
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                  <Typography className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal">
                                    <span className="px-2 py-0.5 border border-gray-200 rounded text-[#474747]">
                                      {t_data?._count?.employees ?? "0"}
                                    </span>
                                  </Typography>
                                  <button
                                    type="button"
                                    className="text-[clamp(12px,0.9vw,14px)] text-[#3DA5F4] font-Urbanist font-normal hover:underline transition-colors"
                                    onClick={() => handleEmpDetails(t_data.id)}
                                  >
                                    View
                                  </button>
                                </div>
                              </td>

                              {/* Head Of Department */}
                              <td className={cellClasses}>
                                <Typography className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal">
                                  {t_data?.Hod || "—"}
                                </Typography>
                              </td>

                              {/* Sub Departments (count + View) */}
                              <td className={cellClasses}>
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                  <Typography className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal">
                                    <span className="px-2 py-0.5 border border-gray-200 rounded text-[#474747]">
                                      {t_data.childDepartments || "0"}
                                    </span>
                                  </Typography>
                                  <button
                                    type="button"
                                    className="text-[clamp(12px,0.9vw,14px)] text-[#3DA5F4] font-Urbanist font-normal hover:underline transition-colors"
                                    onClick={() => handleSubDept(t_data, params.id)}
                                  >
                                    View
                                  </button>
                                </div>
                              </td>

                              {/* Designation(s) - View icon like ApplicationsList */}
                              <td className={cellClasses}>
                                <div className="flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDesignation(t_data.designation, t_data.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors cursor-pointer bg-transparent p-0 outline-none focus:outline-none"
                                    title="View Designations"
                                    aria-label="View designations"
                                  >
                                    <FaEye className="text-blue-500" size={18} />
                                  </button>
                                </div>
                              </td>

                              {/* Actions - same design as Application/Training table */}
                              <td className={cellClasses}>
                                <div
                                  ref={(el) =>
                                    (triggerRefs.current[index] = el)
                                  }
                                  onMouseEnter={() =>
                                    toggleMenuDept(index, true)
                                  }
                                  onMouseLeave={() =>
                                    toggleMenuDept(index, false)
                                  }
                                  className="relative flex justify-center"
                                >
                                  <Button
                                    className="flex items-center gap-2 capitalize font-medium bg-[#EFF8FF] rounded-[8px] text-[clamp(12px,0.9vw,14px)] border border-[#3DA5F4] text-[#3DA5F4] px-[10px] py-[5px] hover:bg-blue-50 hover:border-blue-400 transition-colors"
                                    variant="outlined"
                                  >
                                    Action
                                    <FaChevronDown
                                      strokeWidth={2.5}
                                      className={`transition-transform transform ${openMenuDept[index]
                                          ? "rotate-180"
                                          : ""
                                        }`}
                                    />
                                  </Button>

                                  {openMenuDept[index] && (() => {
                                    const isFirstRow = index === 0;
                                    const isLastRow = index === displayDeptDetails.length - 1;
                                    const isOpenUp = isFirstRow
                                      ? false
                                      : isLastRow
                                        ? true
                                        : getDropdownPosition(index) === "top";
                                    return (
                                      <div
                                        className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white w-[200px] left-[-100px] shadow-lg mt-0 ${isOpenUp
                                            ? "bottom-full mb-1"
                                            : "top-full mt-0"
                                          }`}
                                      >
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            y: isOpenUp ? 10 : -10,
                                          }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <ul className="flex w-full flex-col">
                                            {deptActionTitle.map(
                                              (menuItem) => (
                                                <MenuItem
                                                  className="flex items-center justify-between"
                                                  key={menuItem.id}
                                                  onClick={() =>
                                                    handleMenuDept(
                                                      menuItem.id,
                                                      t_data
                                                    )
                                                  }
                                                >
                                                  <Typography
                                                    variant="small"
                                                    style={{ fontSize: "10px" }}
                                                  >
                                                    {menuItem.title}
                                                  </Typography>
                                                  <span
                                                    style={{
                                                      color: menuItem.color,
                                                    }}
                                                  >
                                                    {menuItem.icon}
                                                  </span>
                                                </MenuItem>
                                              )
                                            )}
                                          </ul>
                                        </motion.div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Sticky pagination bar - fixed position below table, aligned like Application */}
                  {displayDeptDetails.length > 0 && (() => {
                    const paginationData = getDeptPaginationData();
                    return paginationData.totalPages > 1 && (
                      <div className="flex-shrink-0 border-t border-[#F2F2F9]  rounded-b-[10px] min-h-[52px] flex justify-center items-center gap-1 py-3 px-4">
                        {paginationData.currentPage > 1 ? (
                          <button
                            title="Previous Page"
                            className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed font-Urbanist"
                            onClick={goToDeptPreviousPage}
                            disabled={isLoadingDeptPage}
                          >
                            <span>‹</span>
                            <span>Previous</span>
                          </button>
                        ) : (
                          <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1 font-Urbanist">
                            <span>‹</span>
                            <span>Previous</span>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-1 min-w-[120px]">
                          {(() => {
                            const currentPage = paginationData.currentPage;
                            const totalPages = paginationData.totalPages;
                            if (totalPages <= 10) {
                              return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                  key={pageNum}
                                  onClick={() => goToDeptPage(pageNum)}
                                  disabled={isLoadingDeptPage}
                                  className={`min-w-[32px] px-3 py-1.5 text-[clamp(12px,1vw,14px)] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-Urbanist font-medium ${pageNum === currentPage
                                      ? "bg-[#1a73e8] text-white"
                                      : "text-[#1a73e8] hover:bg-gray-100"
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              ));
                            }
                            const pages = [1];
                            if (currentPage > 3) pages.push("ellipsis-start");
                            const startPage = Math.max(2, currentPage - 1);
                            const endPage = Math.min(totalPages - 1, currentPage + 1);
                            for (let i = startPage; i <= endPage; i++) {
                              if (i !== 1 && i !== totalPages) pages.push(i);
                            }
                            if (currentPage < totalPages - 2) pages.push("ellipsis-end");
                            pages.push(totalPages);
                            const uniquePages = [...new Set(pages)];
                            return uniquePages.map((page, index) => {
                              if (page === "ellipsis-start" || page === "ellipsis-end") {
                                return (
                                  <span key={`ellipsis-${index}`} className="px-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] font-Urbanist">
                                    ...
                                  </span>
                                );
                              }
                              return (
                                <button
                                  key={page}
                                  onClick={() => goToDeptPage(page)}
                                  disabled={isLoadingDeptPage}
                                  className={`min-w-[32px] px-3 py-1.5 text-[clamp(12px,1vw,14px)] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-Urbanist font-medium ${page === currentPage
                                      ? "bg-[#1a73e8] text-white"
                                      : "text-[#1a73e8] hover:bg-gray-100"
                                    }`}
                                >
                                  {page}
                                </button>
                              );
                            });
                          })()}
                        </div>
                        {paginationData.currentPage < paginationData.totalPages ? (
                          <button
                            title="Next Page"
                            className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed font-Urbanist"
                            onClick={goToDeptNextPage}
                            disabled={isLoadingDeptPage}
                          >
                            <span>Next</span>
                            <span>›</span>
                          </button>
                        ) : (
                          <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1 font-Urbanist">
                            <span>Next</span>
                            <span>›</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <ConfirmationDialog
                    openDialog={openDialogDept}
                    handleOpen={handleDialogDept}
                    handleConfirm={(e) => handleDeleteDept(e)}
                    title={"Confirm Delete"}
                    message={"Are you sure to Delete this Department?"}
                  />

                  {/* <table className="w-full text-left h-full min-w-[1200px] whitespace-nowrap table-auto">
                        <thead className="sticky top-[-9px] z-10">
                          <tr>
                            {deptData?.map((head, i) => (
                              <th
                                key={i}
                                className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                              >
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-normal leading-none opacity-70 capitalize"
                                >
                                  {head}
                                </Typography>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {allDeptDetails?.map((department, index) => {
                            const isLast = index === allDeptDetails.length - 1;
                            const classes = isLast
                              ? "p-4"
                              : "p-4 border-b border-blue-gray-50";

                            return (
                              <tr key={index} className={classes}>
                                <td className={classes}>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                  >
                                    {department.name || department.dept_name}
                                  </Typography>
                                </td>

                                <td className={classes}>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                  >
                                    {department.description}
                                  </Typography>
                                </td>

                                <td className={classes}>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                  >
                                    <div className="flex gap-2 items-center">
                                      <div className="border p-[4px] text-[#ffae42]">
                                        {department?._count?.employees || "0"}
                                      </div>
                                      <span
                                        className="cursor-pointer"
                                        onClick={() =>
                                          handleEmpDetails(department.id)
                                        }
                                      >
                                        View
                                      </span>
                                    </div>
                                  </Typography>
                                </td>

                                <td className={classes}>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                  >
                                    {department.child_departments_count}
                                  </Typography>
                                </td>

                                <td className={classes}>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                  >
                                    <div className="flex gap-2 items-center">
                                      <div
                                        className="border p-[4px] text-[#ffae42]"
                                        onClick={() =>
                                          handleSubDept(department, params.id)
                                        }
                                      >
                                        {department.Sub_dep || "0"}
                                      </div>
                                      <span
                                        className="cursor-pointer"
                                        onClick={() =>
                                          handleSubDept(department, params.id)
                                        }
                                      >
                                        View
                                      </span>
                                    </div>
                                  </Typography>
                                </td>
                                <td>
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                  >
                                    <FaEye
                                      className="border-solid border-2 border-[#8bc9f8] p-[3px] text-[27px] text-[#8bc9f8] cursor-pointer"
                                      onClick={() =>
                                        handleDesignation(
                                          department.designation,
                                          department.id
                                        )
                                      }
                                    />
                                  </Typography>
                                </td>

                                <td className={classes}>
                                  <div
                                    ref={(el) =>
                                      (triggerRefs.current[index] = el)
                                    }
                                    onMouseEnter={() =>
                                      toggleMenuDept(index, true)
                                    }
                                    onMouseLeave={() =>
                                      toggleMenuDept(index, false)
                                    }
                                    className="relative"
                                  >
                                    <Button
                                      className="flex items-center gap-2 capitalize font-normal text-[13px] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]"
                                      variant="outlined"
                                    >
                                      Action
                                      <FaChevronDown
                                        strokeWidth={2.5}
                                        className={`transition-transform transform ${openMenuDept[index]
                                          ? "rotate-180"
                                          : ""
                                          }`}
                                      />
                                    </Button>
                                    {openMenuDept[index] && (
                                      <div
                                        className={`border border-gray-200 rounded-lg absolute z-10 bg-white w-[200px] left-[-120px] shadow-md  ${getDropdownPosition(index) === "top"
                                          ? "bottom-full"
                                          : "top-full"
                                          }`}
                                      >
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            y:
                                              getDropdownPosition(index) ===
                                                "top"
                                                ? -50
                                                : 50,
                                          }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{
                                            opacity: 0,
                                            y:
                                              getDropdownPosition(index) ===
                                                "top"
                                                ? -50
                                                : 50,
                                          }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <ul className="flex w-full flex-col gap-1">
                                            {deptActionTitle.map((menuItem) => (
                                              <MenuItem
                                                className="flex items-center justify-between"
                                                key={menuItem.id}
                                                onClick={() =>
                                                  handleMenuDept(
                                                    menuItem.id,
                                                    department
                                                  )
                                                }
                                              >
                                                <Typography variant="small">
                                                  {menuItem.title}
                                                </Typography>
                                                <span>{menuItem.icon}</span>
                                              </MenuItem>
                                            ))}
                                          </ul>
                                        </motion.div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>

                        <ConfirmationDialog
                          openDialog={openDialogDept}
                          handleOpen={handleDialogDept}
                          handleConfirm={(e) => handleDeleteDept(e)}
                          title={"Confirm Delete"}
                          message={"Are you sure to Delete this Department?"}
                        />
                      </table> */}
                </div>
              </div>
            </>
          ) : (
            <div className="gap-4 py-2 pb-1 pl-2 h-full">
              <div className="flex justify-between">
                <Button
                  className="capitalize font-medium bg-[#8bc9f8] p-2"
                  onClick={() => handleNavigateCreateNewDept()}
                >
                  Add new department
                </Button>
              </div>
              <div className="text-center">
                <img
                  src={deptImage}
                  alt="department_image"
                  className="mx-auto block"
                ></img>
                <span className="text-[20px] font-semibold">
                  You Haven’t Created Any Department Yet!
                </span>
              </div>
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