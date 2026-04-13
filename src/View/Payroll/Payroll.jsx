import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";
import { HiOutlineCurrencyDollar } from "react-icons/hi2";

const PAYSLIP_GENERATION_OPTIONS_KEY = "payslipGenerationOptions";
const GENERATE_PAYSLIP_SEARCH_FILTER_KEY = "generatePayrollSearchFilter";
const GENERATE_PAYSLIP_FILTERS_KEY = "generatePayrollFilters";
const MAKING_PAYMENTS_FILTERS_KEY = "makingPaymentsFilters";

const clearAllGeneratePayrollData = () => {
  try {
    localStorage.removeItem(PAYSLIP_GENERATION_OPTIONS_KEY);
    localStorage.removeItem(GENERATE_PAYSLIP_SEARCH_FILTER_KEY);
    localStorage.removeItem(GENERATE_PAYSLIP_FILTERS_KEY);
    localStorage.removeItem(MAKING_PAYMENTS_FILTERS_KEY);
  } catch (error) {
    console.error("Error clearing Generate Payslip data from localStorage:", error);
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

  const isTabActive = (link) => {
    if (!link || link === "#") return false;
    if (link === "/payroll" || link === "/payroll/payroll_overview")
      return location.pathname === "/payroll" || location.pathname === "/payroll/payroll_overview";
    return location.pathname === link || location.pathname.startsWith(link + "/");
  };

  useEffect(() => {
    const currentPath = location.pathname;
    if (!currentPath.startsWith("/payroll")) clearAllGeneratePayrollData();
    return () => {
      if (!window.location.pathname.startsWith("/payroll")) clearAllGeneratePayrollData();
    };
  }, [location.pathname]);

  const handleNavLinksPayroll = (e, link, id) => {
    e.preventDefault();
    navigate(link);
    if (id === 1) getDataGrossNet();
    else if (id === 2) getAllBranchesPayroll();
    else if (id === 3) gettingManageEmpSalary(null, null, "", false, null, true);
  };

  return (
    <div className="min-h-screen p-6 font-poppins">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-bgBlue shadow-sm border border-blue-100">
              <HiOutlineCurrencyDollar className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Overview, salary templates, payslips & reports
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex flex-wrap gap-1"
        >
          {payrollNavTitles.map((ele) => (
            <NavLink
              key={ele.id}
              to={ele.link}
              onClick={(e) => handleNavLinksPayroll(e, ele.link, ele.id)}
              className={({ isActive }) => {
                const active = isTabActive(ele.link);
                return `relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out z-10 ${
                  active
                    ? "text-white shadow-md shadow-blue-500/20"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`;
              }}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {isTabActive(ele.link) && (
                <motion.span
                  layoutId="payrollActiveTab"
                  className="absolute inset-0 bg-bgBlue rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-20">{ele.title}</span>
            </NavLink>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default Payroll;
