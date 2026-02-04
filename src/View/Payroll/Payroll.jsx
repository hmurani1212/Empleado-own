import { Button } from "@material-tailwind/react";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";

// localStorage keys for clearing persisted data
const PAYSLIP_GENERATION_OPTIONS_KEY = "payslipGenerationOptions";
const GENERATE_PAYSLIP_SEARCH_FILTER_KEY = "generatePayslipSearchFilter";
const GENERATE_PAYSLIP_FILTERS_KEY = "generatePayslipFilters";

// Function to clear all Generate Payslip persisted data
const clearAllGeneratePayslipData = () => {
  try {
    localStorage.removeItem(PAYSLIP_GENERATION_OPTIONS_KEY);
    localStorage.removeItem(GENERATE_PAYSLIP_SEARCH_FILTER_KEY);
    localStorage.removeItem(GENERATE_PAYSLIP_FILTERS_KEY);
  } catch (error) {
    console.error(
      "Error clearing Generate Payslip data from localStorage:",
      error
    );
  }
};

const Payroll = () => {
  const {
    payrollNavTitles,
    gettingSalaryTemp,
    getDataGrossNet,
    gettingManageEmpSalary,
    getAllBranchesPayroll,
  } = usePayroll();
  const location = useLocation();
  const navigate = useNavigate();

  // Clear persisted Generate Payslip data when leaving the payroll module
  useEffect(() => {
    // Check if we're navigating away from payroll routes
    const currentPath = location.pathname;
    const isInPayrollModule = currentPath.startsWith("/payroll");

    // If we're not in the payroll module, clear the persisted data
    if (!isInPayrollModule) {
      clearAllGeneratePayslipData();
    }

    // Cleanup function: clear data when component unmounts (leaving payroll module entirely)
    return () => {
      // Only clear if we're actually leaving (not just navigating within payroll)
      const pathOnUnmount = window.location.pathname;
      if (!pathOnUnmount.startsWith("/payroll")) {
        clearAllGeneratePayslipData();
      }
    };
  }, [location.pathname]);

  // Tooba
  // Manage Payslips, Export Reports, Settings
  const handleNavLinksPayroll = (e, link, id) => {
    e.preventDefault();
    navigate(link);

    if (id === 1) {
      getDataGrossNet();
    } else if (id === 2) {
      getAllBranchesPayroll();
    } else if (id === 3) {
      // No template filter - pass null for template_id
      gettingManageEmpSalary(null, null, "", false, null, true);
    }
  };

  return (
    <>
      <div className="py-2 lg:px-2 md:px-2 px-0">
        <span className="text-[20px] font-Urbanist font-semibold text-[#474747]">
          Payroll
        </span>
      </div>

      <div className="flex flex-col gap-2 pb-3 rounded-[10px]">
        <div className="flex justify-between items-center gap-5 lg:px-2 md:px-2 px-0 py-5">
          <div className="flex items-center gap-5 w-full flex-wrap">
            {payrollNavTitles.map((ele) => (
              <NavLink
                key={ele.id}
                className={`${
                  location.pathname === ele.link
                    ? "text-white"
                    : "hover:text-black/60 text-[#474747]"
                } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
                onClick={(e) => handleNavLinksPayroll(e, ele.link, ele.id)}
              >
                {location.pathname === ele.link && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 z-10 bg-[#8bc9f8]"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative cursor-pointer text-[14px] z-20 font-Urbanist">
                  {ele.title}
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Payroll;