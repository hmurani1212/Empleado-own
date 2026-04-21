import {
  Button,
  Typography,
} from "@material-tailwind/react";
import React, { useRef, useState, useCallback, useLayoutEffect, useEffect } from "react";
import ReactDOM from "react-dom";
import useSubDept from "../../ViewModel/DepartmentsViewModel/SubDeptServices";
import { useParams } from "react-router";
import { FaChevronDown, FaEye } from "react-icons/fa";
import { HiOutlineOfficeBuilding, HiOutlineUserGroup } from "react-icons/hi"; // New icons
import useDepartments from "../../ViewModel/DepartmentsViewModel/DepartmentsServices";
import { motion } from "framer-motion";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import useStore from "../../Store/store";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { getUserData } from "../../Authentication/jwt_decode";
import { isDepartmentAdmin } from "../../Authentication/roleHelpers";

/** Skeleton row for sub-department table: Dept Name (left), Employees, Head, Sub Depts, Designations, Action */
const SubDeptSkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
    <td className="p-4 first:pl-6 text-left">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
        <div className="h-4 bg-gray-100 rounded w-36 max-w-[200px]" />
      </div>
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

const ManageSubDepartments = () => {
  const subDeptHeader = [
    "Department Name",
    "Employees",
    "Head Of Department",
    "Sub Departments",
    "Designations",
    "Action",
  ];
  // const allDeptDetails = ['0']
  const params = useParams();
  // console.log(params)
  const {
    handleDesignation,
    handleEmpDetails,
    handleMenuDept,
    deptActionTitle,
    toggleMenuDept,
    openMenuDept,
    openDialogDept,
    handleDialogDept,
    handleDeleteDept,
    showDrawer,
  } = useDepartments();
  const {
    subDept,
    subDeptLoading,
    handleNestedSubDept,
    backToParent,
    handleAddSubDept,
    backToHome,
  } = useSubDept();
  const drawerOpen = useStore((state) => state.drawerOpen);
  const hideCreateDepartmentButton = isDepartmentAdmin(getUserData()?.roleId);

  const displaySubDepts = subDept || [];
  const scrollContainerRef = useRef(null);
  const tableHorizontalScrollRef = useRef(null);
  const triggerRefs = useRef([]);
  const [portalState, setPortalState] = useState({
    openIndex: -1,
    top: 0,
    left: 0,
    bottom: undefined,
  });

  const updatePortalPosition = useCallback(() => {
    const openIndex = displaySubDepts.findIndex((_, i) => openMenuDept[i]);
    if (openIndex < 0) {
      setPortalState((s) => (s.openIndex < 0 ? s : { ...s, openIndex: -1 }));
      return;
    }
    const triggerEl = triggerRefs.current?.[openIndex];
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    const openAbove = openIndex >= displaySubDepts.length - 3;
    const dropdownWidth = 192;
    const left = Math.max(4, Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - 4));
    setPortalState({
      openIndex,
      left,
      top: openAbove ? undefined : rect.bottom + 0,
      bottom: openAbove ? window.innerHeight - rect.top + 0 : undefined,
    });
  }, [openMenuDept, displaySubDepts]);

  useLayoutEffect(() => {
    updatePortalPosition();
  }, [openMenuDept, updatePortalPosition]);

  useEffect(() => {
    if (portalState.openIndex < 0) return;
    const onScroll = () => updatePortalPosition();
    const scrollEls = [scrollContainerRef.current, tableHorizontalScrollRef.current].filter(Boolean);
    scrollEls.forEach((el) => el.addEventListener("scroll", onScroll, true));
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      scrollEls.forEach((el) => el.removeEventListener("scroll", onScroll, true));
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [portalState.openIndex, updatePortalPosition]);

  const isAnyActionMenuOpen = Object.values(openMenuDept || {}).some(Boolean);

  useEffect(() => {
    if (showDrawer || drawerOpen) {
      Object.keys(openMenuDept || {}).forEach((i) => toggleMenuDept(Number(i), false));
    }
  }, [showDrawer, drawerOpen]);

  return (
    <div className="min-h-screen">
      <div className=" mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">
              Manage Sub-Departments
            </h1>
            <p className="text-sm text-gray-500 font-poppins mt-1">
              Organize and view hierarchy within this department
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CustomButton
              className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm font-medium transition-all"
              onClick={() => backToHome(params)}
              title="Back"
            >
              Back
            </CustomButton>
            {!hideCreateDepartmentButton && (
              <CustomButton
                className="bg-bgBlue text-white hover:bg-blue-600 px-4 py-2 rounded-lg shadow-lg shadow-blue-500/20 font-medium transition-all flex items-center gap-2"
                onClick={() => handleAddSubDept(params)}
                title="Add Sub-Department"
              >
                <span className="text-lg">+</span> Add Sub-Department
              </CustomButton>
            )}
          </div>
        </div>

        {/* Glassy Table Card — scroll ref syncs portal menu position; menu rendered via portal so it stays above table/overflow */}
        <div
          ref={scrollContainerRef}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative w-full overflow-auto customScroll"
        >
          <div ref={tableHorizontalScrollRef} className="overflow-x-auto">
            <table className="w-full text-center min-w-[1000px] table-auto border-collapse">
              <thead className="sticky top-0 z-20 bg-gray-50/80 shadow-sm">
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {subDeptHeader?.map((head, i) => (
                    <th
                      key={i}
                      className={`p-4 first:pl-6 last:pr-6 ${i === 0 ? 'text-left' : 'text-center'}`}
                    >
                      <Typography className="font-semibold uppercase tracking-wider text-[11px] text-gray-500 font-poppins">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-50 bg-white ${isAnyActionMenuOpen ? "relative z-[25]" : ""}`}>
                {subDeptLoading ? (
                  [...Array(6)].map((_, i) => <SubDeptSkeletonRow key={i} />)
                ) : subDept?.length > 0 ? (
                  subDept?.map((department, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`hover:bg-blue-50/30 transition-colors group ${openMenuDept[index] ? "relative z-[40] isolate" : ""}`}
                    >
                      {/* Department Name */}
                      <td className="p-4 first:pl-6 text-left">
                        <div className="flex items-center justify-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                            <HiOutlineOfficeBuilding size={18} />
                          </div>
                          <Typography className="text-sm font-semibold text-gray-900 font-poppins">
                            {department.name || department.dept_name || department.title}
                          </Typography>
                        </div>
                      </td>

                      {/* Number of Employees */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
                            <HiOutlineUserGroup size={14} />
                            {department?._count?.employees || "0"}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-blue-500 hover:text-blue-700 font-medium font-poppins transition-colors underline decoration-blue-200 hover:decoration-blue-500 underline-offset-2"
                            onClick={() => handleEmpDetails(department.id)}
                          >
                            View
                          </button>
                        </div>
                      </td>

                      {/* Head Of Department */}
                      <td className="p-4">
                        <Typography className="text-sm font-medium text-gray-700 font-poppins">
                          {department.Hod_dep || <span className="text-gray-400 italic">Unassigned</span>}
                        </Typography>
                      </td>

                      {/* Sub Departments Count */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                            {department.subDpt_count || "0"}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-blue-500 hover:text-blue-700 font-medium font-poppins transition-colors underline decoration-blue-200 hover:decoration-blue-500 underline-offset-2"
                            onClick={() => handleNestedSubDept(department, params.id)}
                          >
                            View
                          </button>
                        </div>
                      </td>

                      {/* Designations */}
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleDesignation(department.designation, department.id)}
                            className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-all shadow-sm border border-blue-100"
                            title="View Designations"
                          >
                            <FaEye size={14} />
                          </button>
                        </div>
                      </td>

                      {/* Actions — dropdown rendered via portal so it stays on top of table rows and scroll containers */}
                      <td className={`p-4 last:pr-6 relative ${openMenuDept[index] ? "z-[30]" : ""}`}>
                        <div
                          ref={(el) => (triggerRefs.current[index] = el)}
                          onMouseEnter={() => toggleMenuDept(index, true)}
                          onMouseLeave={() => toggleMenuDept(index, false)}
                          className="relative flex justify-center"
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
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={subDeptHeader.length} className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <HiOutlineOfficeBuilding className="w-8 h-8 text-gray-300" />
                        </div>
                        <Typography color="gray" className="font-medium font-poppins">
                          No Sub-Departments Found
                        </Typography>
                        <Typography className="text-sm text-gray-400 mt-1 font-poppins">
                          Get started by adding a new sub-department
                        </Typography>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {portalState.openIndex >= 0 &&
          ReactDOM.createPortal(
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="fixed w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[9990]"
              style={{
                left: portalState.left,
                top: portalState.top,
                bottom: portalState.bottom,
              }}
              onMouseEnter={() => toggleMenuDept(portalState.openIndex, true)}
              onMouseLeave={() => toggleMenuDept(portalState.openIndex, false)}
            >
              <ul className="flex w-full flex-col py-1">
                {deptActionTitle.map((menuItem) => (
                  <li
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors text-gray-700 hover:text-blue-600"
                    key={menuItem.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuDept(menuItem.id, displaySubDepts[portalState.openIndex]);
                    }}
                  >
                    <Typography variant="small" className="text-xs font-medium font-poppins">
                      {menuItem.title}
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

        <ConfirmationDialog
          openDialog={openDialogDept}
          handleOpen={handleDialogDept}
          handleConfirm={(e) => handleDeleteDept(e)}
          title={"Confirm Delete"}
          message={"Are you sure to Delete this Department?"}
        />
      </div>
    </div>
  );
};

export default ManageSubDepartments;
