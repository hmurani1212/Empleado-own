import React, { useState, useEffect, useLayoutEffect } from "react";
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";
import { Outlet, useNavigate } from "react-router";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import EmployeesBulkWrapper from "./EmployeesBulkWrapper";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { use } from "react";
import { employeesListPageRef } from "../../ViewModel/EmployeeViewModel/employeesListPageRef";

const Employees = () => {
  const { empTitles, setSkipGetAllEmployeeOnListPage } = useEmployees();
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [targetPath, setTargetPath] = useState("");
  const [bulkService, setBulkService] = useState(null);

  const isListPage = location.pathname === "/employees/all_employess" || location.pathname === "/employees";
  // Set ref during render so Get_All_Employeefn skips API before useLayoutEffect runs (avoids extra get_all_employee call)
  employeesListPageRef.current = isListPage;

  // Check if we're on the bulk employee page
  const isBulkPage = location.pathname === "/employees/add_bulk_emp";
  const handleNavLinkClick = (e, path) => {
    e.preventDefault();
    
    // Check if coming from bulk employee page with unsaved changes
    if (location.pathname === "/employees/add_bulk_emp" && bulkService?.showExcelTable) {
      setTargetPath(path);
      setShowConfirmation(true);
    } else {
      navigate(path);
      if (bulkService?.toggleOffExcelTable) {
        bulkService.toggleOffExcelTable();
      }
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirmation(false);
    navigate(targetPath);
    if (bulkService?.toggleOffExcelTable) {
      bulkService.toggleOffExcelTable();
    }
  };

  const handleCancelLeave = () => {
    setShowConfirmation(false);
  };

  // Set skip for get_all_employee before paint so reload/list page never calls that API (runs before other useEffects)
  useLayoutEffect(() => {
    setSkipGetAllEmployeeOnListPage(isListPage);
    return () => {
      setSkipGetAllEmployeeOnListPage(false);
      employeesListPageRef.current = false;
    };
  }, [isListPage, setSkipGetAllEmployeeOnListPage]);

  const content = (
    <div className="flex flex-col gap-4 py-2 lg:px-2 md:px-2 px-0 z-10">
      <div className="">
        <span className="text-[20px] font-Urbanist font-semibold text-[#474747]">Employees Management</span>
      </div>

      <div className="flex flex-col gap-2 pb-3 w-full">
        <div className="flex justify-between items-center gap-5 py-5">
          <div className="flex flex-wrap items-center gap-5">
            {empTitles.map((ele) => (
              <NavLink
                key={ele.id}
                className={`${
                  location.pathname === ele.link
                    ? "text-white"
                    : "hover:text-[#474747]/60 text-[#474747]"
                } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
                // to={ele.link}
                onClick={(e) => handleNavLinkClick(e, ele.link)}
              >
                {location.pathname === ele.link && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 z-10 bg-[#8bc9f8]"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative cursor-pointer text-[14px] z-20">
                  {ele.title}
                </span>
              </NavLink>
            ))}
          </div>
          <div></div>
        </div>

        <div>
          <Outlet />
        </div>
      </div>

      <ConfirmationDialog
        openDialog={showConfirmation}
        handleOpen={handleCancelLeave}
        title="Leave Page"
        message="Changes you made may not be saved"
        handleConfirm={handleConfirmLeave}
      />
    </div>
  );

  // Only wrap with bulk service when on bulk page
  return isBulkPage ? (
    <EmployeesBulkWrapper onBulkServiceReady={setBulkService}>
      {content}
    </EmployeesBulkWrapper>
  ) : (
    content
  );
};

export default Employees;
