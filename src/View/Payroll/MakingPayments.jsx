import React, { useState, useEffect, useMemo, useRef } from "react";
import { flushSync } from "react-dom";
import {
  Button,
  Checkbox,
  Typography,
  Option,
  Select,
  Input,
  Popover,
  PopoverContent,
  PopoverHandler,
  Textarea,
} from "@material-tailwind/react";
// import { BiSearch } from 'react-icons/bi'
import { FaEye, FaTrash, FaCheck, FaEllipsisV } from "react-icons/fa";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import useStore from "../../Store/store";
import { gettingDepartmentsServices } from "../../services/__frequentApiServices";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { showToast } from "../../Components/Toaster/Toaster";
import Calendar from "react-calendar";
import ExportPayslip from "./ExportPayslip";
import { useNavigate } from "react-router-dom";
import payrollApi from "../../Model/Data/Payroll/Payroll";
import { MakingPaymentsTableBodySkeleton } from "./PayrollSkeletons";
import { escapeHtml, getDigitalOfficeSignature } from "../../services/officeSignatureService";

// Convert salary_month "0126" (MMYY) to "January/2026" - first 2 digits = month, last 2 = year (use current century)
const formatSalaryMonthFTM = (salaryMonth) => {
  if (!salaryMonth || typeof salaryMonth !== "string" || salaryMonth.length < 4) return "N/A";
  const monthStr = salaryMonth.slice(0, 2);
  const yearSuffix = salaryMonth.slice(-2);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthNum = parseInt(monthStr, 10) || 1;
  const monthName = monthNames[Math.min(monthNum - 1, 11)] || monthNames[0];
  const currentCentury = String(new Date().getFullYear()).slice(0, 2);
  const fullYear = `${currentCentury}${yearSuffix}`;
  return `${monthName}/${fullYear}`;
};

// Default "All Branches" option for first load
const ALL_BRANCHES_OPTION = { value: 0, label: "All Branches" };

const MAKING_PAYMENTS_FILTERS_KEY = "makingPaymentsFilters";

const loadMakingPaymentsDepartment = () => {
  try {
    const raw = localStorage.getItem(MAKING_PAYMENTS_FILTERS_KEY);
    if (!raw) return null;
    const { department_id } = JSON.parse(raw);
    if (
      department_id &&
      typeof department_id === "object" &&
      department_id.value !== undefined &&
      department_id.value !== null
    ) {
      return department_id;
    }
  } catch {
    /* ignore */
  }
  return null;
};

const saveMakingPaymentsDepartment = (department) => {
  try {
    localStorage.setItem(
      MAKING_PAYMENTS_FILTERS_KEY,
      JSON.stringify({ department_id: department })
    );
  } catch {
    /* ignore */
  }
};

/** Clear persisted Making Payments filter (department only); branch always defaults to All Branches on load */
export const clearMakingPaymentsFilters = () => {
  try {
    localStorage.removeItem(MAKING_PAYMENTS_FILTERS_KEY);
  } catch {
    /* ignore */
  }
};

const MakingPayments = () => {
  const navigate = useNavigate();
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(ALL_BRANCHES_OPTION);
  const [departments, setDepartments] = useState([
    { value: 0, label: "All Departments" },
  ]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentMenuLoading, setDepartmentMenuLoading] = useState(false);
  /** Table area only — filters stay mounted (avoid full-page skeleton on payslip refetch) */
  const [tableLoading, setTableLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const makingPaymentsFiltersReady = useRef(false);

  // Main page filter states
  const [mainFilter, setMainFilter] = useState(null);
  const [mainStatus, setMainStatus] = useState(null);
  const [mainEmployeeIdSearch, setMainEmployeeIdSearch] = useState("");
  const [mainSelectedDate, setMainSelectedDate] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Delete functionality states
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); // Store all employees for filtering
  
  // Pagination states
  const [currentPageId, setCurrentPageId] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [accumulatedEmployees, setAccumulatedEmployees] = useState([]); // Store all loaded employees across pages

  // Mark paid functionality states
  const [markPaidDialog, setMarkPaidDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetail, setPaymentDetail] = useState("");
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  // Individual action dropdown states
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [singleDeleteDialog, setSingleDeleteDialog] = useState(false);
  const [singleMarkPaidDialog, setSingleMarkPaidDialog] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Get branches and payslips from store
  const getAllBranchesPayroll = useStore(
    (state) => state.getAllBranchesPayroll
  );
  const branchesLoaded = useStore((state) => state.branchesLoaded);
  const copyBranchesData = useStore((state) => state.copyBranchesData);
  const gettingPayslips = useStore((state) => state.gettingPayslips);
  const payslips = useStore((state) => state.payslips);

  const fetchPayslipsTable = async (params, forceReload = true) => {
    flushSync(() => {
      setTableLoading(true);
    });
    try {
      await gettingPayslips(params, forceReload, false);
    } finally {
      setTableLoading(false);
    }
  };
  const totalPayslipsCount = useStore((state) => state.totalPayslipsCount);
  const payslipsPagination = useStore((state) => state.payslipsPagination);
  const deletingBulkPayslips = useStore((state) => state.deletingBulkPayslips);
  const deleteSinglePayslip = useStore((state) => state.deleteSinglePayslip);
  const markingInvoiceAsPaid = useStore((state) => state.markingInvoiceAsPaid);

  // Global drawer functions
  const openDrawer = useStore((state) => state.openDrawer);
  // const closeDrawer = useStore((state) => state.closeDrawer)
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle);
  const settingDrawerSize = useStore((state) => state.settingDrawerSize);
  const settingComponent = useStore((state) => state.settingComponent);

  const handleSelectAll = () => {
    const newSelectedAll = !selectedAll;
    setSelectedAll(newSelectedAll);

    // Update all employees' selected state and selected employees array
    setEmployees((prevEmployees) => {
      const updatedEmployees = prevEmployees.map((emp) => ({
        ...emp,
        selected: newSelectedAll,
      }));

      // Update selected employees array based on new state
      if (newSelectedAll) {
        setSelectedEmployees(updatedEmployees.map((emp) => emp.id));
      } else {
        setSelectedEmployees([]);
      }

      return updatedEmployees;
    });
  };

  const handleRowSelect = (employeeId) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.id === employeeId ? { ...emp, selected: !emp.selected } : emp
      )
    );

    setSelectedEmployees((prevSelected) => {
      if (prevSelected.includes(employeeId)) {
        return prevSelected.filter((id) => id !== employeeId);
      } else {
        return [...prevSelected, employeeId];
      }
    });
  };

  const handleDeleteMarked = () => {
    // Check if there are any employees in the table
    if (employees.length === 0) {
      showToast("Payslips is not generated?", "error");
      return;
    }

    // Check if any employees are selected
    if (selectedEmployees.length === 0) {
      showToast("Please select employees to delete", "error");
      return;
    }

    // Open confirmation dialog
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      // Call API to delete payslips
      const result = await deletingBulkPayslips(selectedEmployees);

      if (result.success) {
        // Clear selected employees
        setSelectedEmployees([]);
        setSelectedAll(false);

        // Close dialog
        setDeleteDialog(false);

        // Show success message
        showToast(
          `Successfully deleted ${result.deletedCount} payslip(s)`,
          "success"
        );
      } else {
        // Show error message
        showToast(result.error || "Failed to delete payslips", "error");
        setDeleteDialog(false);
      }
    } catch (error) {
      console.error("Error during delete confirmation:", error);
      showToast("An error occurred while deleting payslips", "error");
      setDeleteDialog(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle mark paid
  const handleMarkPaid = () => {
    // Check if there are any employees in the table
    if (employees.length === 0) {
      showToast("No payslips available", "error");
      return;
    }

    // Check if any employees are selected
    if (selectedEmployees.length === 0) {
      showToast("Please select payslips to mark as paid", "error");
      return;
    }

    // Open mark paid dialog
    setPaymentMethod("");
    setPaymentDetail("");
    setMarkPaidDialog(true);
  };

  // Confirm mark paid
  const confirmMarkPaid = async () => {
    if (!paymentMethod) {
      showToast("Please select a payment method", "error");
      return;
    }

    setIsMarkingPaid(true);

    try {
      // Mark each selected payslip as paid
      const results = await Promise.all(
        selectedEmployees.map((id) =>
          markingInvoiceAsPaid(id, paymentMethod, paymentDetail)
        )
      );

      // Count successes
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        showToast(
          `Successfully marked ${successCount} payslip(s) as paid${
            failCount > 0 ? `, ${failCount} failed` : ""
          }`,
          successCount === results.length ? "success" : "warning"
        );

        // Clear selections
        setSelectedEmployees([]);
        setSelectedAll(false);
      } else {
        showToast("Failed to mark payslips as paid", "error");
      }

      // Close dialog
      setMarkPaidDialog(false);
    } catch (error) {
      console.error("Error marking payslips as paid:", error);
      showToast("An error occurred while marking payslips as paid", "error");
      setMarkPaidDialog(false);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // Export drawer handler
  const handleExportClick = () => {
    openDrawer();
    settingDrawerTitle("Export Payslips");
    settingDrawerSize("45vw");
    settingComponent(<ExportPayslip />);
  };

  // Print All handler - Call bulk-details API with payslip IDs, then print
  const handlePrintAllClick = async () => {
    if (!payslips || payslips.length === 0) {
      showToast("No payslips available to print", "error");
      return;
    }

    try {
      const payslipIds = payslips.map((p) => p.id);
      const response = await payrollApi.getPayslipsBulkDetails(payslipIds);
      const data = response?.data;
      if (data?.STATUS !== "SUCCESSFUL" || !data?.DB_DATA?.payslips) {
        showToast(data?.ERROR_DESCRIPTION || "Failed to load payslips for print", "error");
        return;
      }
      const payslipsToPrint = data.DB_DATA.payslips;
      const officeSignatureText = await getDigitalOfficeSignature();
      const officeSignatureEscaped = escapeHtml(officeSignatureText || "");

      // Create a temporary div for print content
      const printContent = document.createElement("div");
      printContent.innerHTML = `
        <style>
          @media print {
            @page {
              margin: 0;
              size: A4;
            }
            html, body {
              background: #ffffff !important;
            }
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              padding-top: 35px;
              left: 0;
              top: 0;
              width: 100%;
              background: #ffffff !important;
            }
            .sideMenu, .flex, .h-\\[calc\\(100vh-66px\\)\\], header, nav, button, .bg-\\[\\#8bc9f8\\] {
              display: none !important;
            }
          }
          .payslip-container {
            margin: 0 0 12px 0;
            page-break-after: always;
            page-break-inside: avoid;
            break-inside: avoid-page;
            font-family: "Poppins", Arial, sans-serif;
            font-size: 13px;
            color: #0f172a;
            padding: 10px;
            background: #ffffff;
          }
          .payslip-container:last-child { page-break-after: auto; }
          .print-shell {
            background: #ffffff;
            border-radius: 24px;
            padding: 16px;
          }
          .print-card {
            background: rgba(255, 255, 255, 0.92);
            border-radius: 24px;
            padding: 16px;
          }
          .hero {
            border-radius: 12px;
            margin-bottom: 12px;
            padding: 14px 16px;
            color: #fff;
            background: linear-gradient(to right, #4f46e5, #2563eb, #06b6d4);
            display: flex;
            justify-content: space-between;
            align-items: end;
            gap: 12px;
          }
          .hero-subtitle {
            font-size: 11px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            font-weight: 600;
            opacity: 0.9;
            margin-bottom: 2px;
          }
          .hero-title { font-size: 30px; line-height: 1.1; font-weight: 700; }
          .hero-month {
            font-size: 12px;
            font-weight: 600;
            border: 1px solid rgba(255,255,255,0.35);
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            padding: 6px 10px;
            white-space: nowrap;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .info-box {
            border: none;
            border-radius: 10px;
            padding: 10px;
            background: #fff;
          }
          .info-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #1e293b;
            margin-bottom: 4px;
          }
          .info-row { display: flex; gap: 8px; line-height: 1.35; margin-bottom: 1px; }
          .info-label { min-width: 118px; font-weight: 700; font-size: 12px; color: #1e293b; }
          .info-value { font-size: 11px; color: #475569; }
          .summary-box {
            border: none;
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 10px;
            background: #fff;
          }
          .summary-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #b45309;
            margin-bottom: 6px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            color: #0f172a;
            font-size: 12px;
          }
          .summary-item b { margin-right: 4px; }
          .print-table-shell {
            border: none;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 10px;
            background: #fff;
          }
          .print-heading {
            background: linear-gradient(to right, #4f46e5, #2563eb, #06b6d4);
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            padding: 9px 10px;
          }
          .all-items-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 12px;
          }
          .all-items-table td {
            padding: 8px 10px;
            border-bottom: none;
            color: #475569;
          }
          .all-items-table tr:last-child td { border-bottom: none; }
          .all-items-table td:last-child {
            text-align: right;
            font-weight: 600;
            color: #0f172a;
            font-variant-numeric: tabular-nums;
          }
          .pf-breakdown-row {
            width: 100%;
            display: flex;
            align-items: stretch;
            color: #334155;
          }
          .pf-breakdown-col {
            padding: 10px 12px;
            text-align: left;
            line-height: 1.5;
          }
          .pf-breakdown-col + .pf-breakdown-col {
            border-left: none;
          }
          .pf-col-title {
            width: 34%;
            font-weight: 500;
          }
          .pf-col-detail {
            width: 42%;
          }
          .pf-col-value {
            width: 24%;
            font-weight: 500;
          }
          .pf-emp-row {
            padding-bottom: 4px;
            margin-bottom: 4px;
            border-bottom: 1px solid #e5e7eb;
          }
          .total-pay-row td {
            background: linear-gradient(to right, #ecfdf5, rgba(240,253,250,0.9));
            color: #065f46 !important;
            font-weight: 700 !important;
          }
          .total-deduct-row td {
            background: linear-gradient(to right, #fff1f2, rgba(255,241,242,0.9));
            color: #9f1239 !important;
            font-weight: 700 !important;
          }
          .amount-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 24px;
          }
          .amount-card {
            border-radius: 12px;
            padding: 14px;
            text-align: center;
            border: none;
            background: #ecfdf5;
          }
          .amount-card.deductions {
            background: #fff1f2;
          }
          .amount-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 6px;
          }
          .amount-value {
            color: #0f172a;
            font-weight: 700;
            font-size: 26px;
          }
          .amount-value.small { font-size: 22px; }
          .signatures {
            margin-top: 18px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .signature-line {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .signature-underline {
            border-bottom: 1px solid #e5e7eb;
            min-height: 24px;
            display: flex;
            align-items: flex-end;
            padding-bottom: 2px;
          }
          .signature-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 600;
            color: #475569;
          }
          .signature-value {
            font-size: 11px;
            font-weight: 500;
            color: #334155;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
        <div class="print-content">
          ${payslipsToPrint
            .map((payslip) => {
              // Extract employee data from payslips structure
              const employee = payslip.wf_employee || {};

              // Parse salary month (format: "1025" = Oct 2025)
              const salaryMonth = payslip.salary_month || "";
              const month =
                salaryMonth.length >= 2 ? salaryMonth.slice(0, 2) : "10";
              const year =
                salaryMonth.length >= 4
                  ? "20" + salaryMonth.slice(2)
                  : new Date().getFullYear();
              const monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              const monthName = monthNames[parseInt(month) - 1] || "Oct";

              // Calculate working hours and days
              const totalWorkingHours = payslip.total_working
                ? payslip.total_working / 3600
                : 0;
              const totalPresentHours = payslip.total_present
                ? payslip.total_present / 3600
                : 0;
              // Use total_days from payslip_config (API value) if available, otherwise calculate from total_working
              const totalDays =
                payslip.payslip_config?.total_days !== undefined &&
                payslip.payslip_config?.total_days !== null
                  ? parseInt(payslip.payslip_config.total_days)
                  : Math.round(totalWorkingHours / 8);
              const presentDays = Math.round(totalPresentHours / 8);
              const absentDays = totalDays - presentDays;

              // Basic Pay and Total Pay: use salary_amount from API (DB_DATA.salary_amount)
              const basicSalary = parseFloat(payslip.salary_amount ?? payslip.wf_employee?.basic_pay ?? payslip.rate ?? 0);
              const incentive = parseFloat(payslip.incentive || 0);
              const netPayable = parseFloat(payslip.paid_amount || 0);

              // Handle incentive_deduction_details (similar to IndividualPayslipPreview)
              const incentiveDeductionArray = (() => {
                if (
                  payslip.incentive_deduction_details &&
                  Array.isArray(payslip.incentive_deduction_details)
                ) {
                  return payslip.incentive_deduction_details.map((item) => ({
                    id: item.id,
                    amount: item.amount || item.details?.original_amount || 0,
                    monthly_amount: item.details?.monthly_amount || 0,
                    title: item.details?.title || "Incentive/Deduction",
                    d_type:
                      item.details?.d_type ||
                      (item.type === "incen" ? "INCENTIVE" : "DEDUCTION"),
                    description: item.details?.description || "",
                    re_occuring: item.details?.re_occuring || "NO",
                    start_date: item.details?.start_date,
                    end_date: item.details?.end_date,
                    status: item.details?.status || "0",
                    ...item.details,
                  }));
                }
                return [];
              })();

              // Calculate deductions from incentive_deduction_details
              const deductionsFromIncentiveArray = incentiveDeductionArray
                .filter((item) => item.d_type === "DEDUCTION")
                .reduce(
                  (sum, item) =>
                    sum +
                    parseFloat(
                      item.monthly_amount > 0
                        ? item.monthly_amount
                        : item.amount || 0
                    ),
                  0
                );

              // Handle income_tax - preserve null, use 0 for calculations
              const getIncomeTaxAmount = (incomeTax) => {
                if (incomeTax === null) return null;
                if (incomeTax === undefined || incomeTax === "") return null;
                if (
                  typeof incomeTax === "object" &&
                  incomeTax.amount !== undefined
                ) {
                  return parseFloat(incomeTax.amount) || null;
                }
                return parseFloat(incomeTax) || null;
              };

              // Handle EOBI - preserve null, use 0 for calculations
              const getEobiEmpContribution = (eobiRecord) => {
                if (eobiRecord === null) return null;
                if (eobiRecord === undefined || eobiRecord === "") return null;
                if (
                  typeof eobiRecord === "object" &&
                  eobiRecord.emp_contribution !== undefined
                ) {
                  return parseFloat(eobiRecord.emp_contribution) || null;
                }
                return parseFloat(eobiRecord) || null;
              };

              // Handle Provident Fund - preserve null, use 0 for calculations
              const getProvidentFundEmpContribution = (providentFund) => {
                if (providentFund === null) return null;
                if (providentFund === undefined || providentFund === "")
                  return null;
                if (
                  typeof providentFund === "object" &&
                  providentFund.emp_contribution !== undefined
                ) {
                  return parseFloat(providentFund.emp_contribution) || null;
                }
                return parseFloat(providentFund) || null;
              };

              const incomeTax = getIncomeTaxAmount(payslip.income_tax);
              const incomeTaxForCalc = incomeTax === null ? 0 : incomeTax;
              const eobi = getEobiEmpContribution(
                payslip.eobi_record || payslip.eobi
              );
              const eobiForCalc = eobi === null ? 0 : eobi;
              const pfEmployee = getProvidentFundEmpContribution(
                payslip.provident_fund
              );
              const pfEmployeeForCalc = pfEmployee === null ? 0 : pfEmployee;
              const pfEmployer =
                payslip.provident_fund &&
                typeof payslip.provident_fund === "object" &&
                payslip.provident_fund.employer_contribution !== undefined
                  ? parseFloat(payslip.provident_fund.employer_contribution) || 0
                  : 0;
              const pfTotal =
                payslip.provident_fund &&
                typeof payslip.provident_fund === "object" &&
                payslip.provident_fund.total_pf !== undefined
                  ? parseFloat(payslip.provident_fund.total_pf) || 0
                  : 0;
              /**
               * Use explicit `other_deductions` only — not `payslip.deduction` (often duplicates itemized loan rows).
               * If legacy data still echoes the same figure in `deduction` and itemized lines, count once.
               */
              const rawOtherDeductions = parseFloat(payslip.other_deductions || 0);
              const aggregateDeduction = parseFloat(payslip.deduction || 0);
              const duplicateOtherWithItemized =
                rawOtherDeductions > 0 &&
                deductionsFromIncentiveArray > 0 &&
                Math.abs(rawOtherDeductions - deductionsFromIncentiveArray) < 0.01 &&
                Math.abs(rawOtherDeductions - aggregateDeduction) < 0.01;
              const otherDeductions = duplicateOtherWithItemized ? 0 : rawOtherDeductions;

              // Get calculated deductions from attendance_summary
              const calculatedAbsenteeDeduction = payslip.attendance_summary
                ?.calculated_absentee_deduction
                ? parseFloat(
                    payslip.attendance_summary.calculated_absentee_deduction
                  )
                : 0;
              const calculatedLateDeduction = payslip.attendance_summary
                ?.calculated_late_deduction
                ? parseFloat(
                    payslip.attendance_summary.calculated_late_deduction
                  )
                : 0;
              const downtimeDeduction = payslip.attendance_summary?.early_leave_downtime != null
                ? parseFloat(payslip.attendance_summary.early_leave_downtime)
                : 0;

              // Attendance Deduction should be the sum of calculated_absentee_deduction and calculated_late_deduction
              // If attendance_summary values exist, use their sum; otherwise fallback to att_deductions
              const attendanceDeductionFromSummary =
                calculatedAbsenteeDeduction + calculatedLateDeduction;
              const attendanceDeduction =
                attendanceDeductionFromSummary > 0
                  ? attendanceDeductionFromSummary
                  : parseFloat(payslip.att_deductions || 0);

              // Calculate total deductions
              // Note: attendanceDeduction already includes calculatedAbsenteeDeduction + calculatedLateDeduction, so don't add them separately
              const totalDeductions =
                attendanceDeduction +
                deductionsFromIncentiveArray +
                eobiForCalc +
                pfEmployeeForCalc +
                incomeTaxForCalc +
                downtimeDeduction +
                otherDeductions;

              // Get incentives from incentive_deduction_details
              const incentivesFromArray = incentiveDeductionArray
                .filter((item) => item.d_type === "INCENTIVE")
                .map((item) => ({
                  title: item.title,
                  amount: parseFloat(item.amount || 0),
                }));

              const overtimeAmount = parseFloat(payslip.overtime_amount || 0);
              const salaryEarnedAmount = parseFloat(payslip.salary_amount || 0);
              const totalPay = salaryEarnedAmount + incentive;
              const requiredDays =
                payslip.payslip_config?.total_days !== undefined &&
                payslip.payslip_config?.total_days !== null
                  ? parseInt(payslip.payslip_config.total_days, 10)
                  : totalDays;
              const showPaymentSection = basicSalary > 0 || overtimeAmount > 0 || incentive > 0 || salaryEarnedAmount > 0 || totalPay > 0;
              const hasPrintDeductionContent =
                (pfEmployee !== null && pfEmployee > 0) ||
                (eobi !== null && eobi > 0) ||
                (incomeTax !== null && incomeTax > 0) ||
                calculatedAbsenteeDeduction > 0 ||
                calculatedLateDeduction > 0 ||
                downtimeDeduction > 0 ||
                attendanceDeduction > 0 ||
                otherDeductions > 0 ||
                incentiveDeductionArray.some((item) => item.d_type === "DEDUCTION" && parseFloat(item.monthly_amount > 0 ? item.monthly_amount : item.amount || 0) > 0);
              const deductionRows = incentiveDeductionArray.filter((item) => item.d_type === "DEDUCTION");
              const formatPkr = (n) => `PKR ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}/-`;
              const formatPkrAmount = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
              const normalizeEpochToMs = (value) => {
                if (value === null || value === undefined) return value;
                const s = String(value).trim();
                if (!s) return value;
                const n = Number(s);
                if (!Number.isFinite(n)) return value;
                // API sometimes sends epoch seconds (e.g. 1640977200); JS Date expects ms.
                if (n > 0 && n < 1e12) return n * 1000;
                return n;
              };
              const joinDate = employee.joining_date || employee.date_of_joining || employee.join_date;
              const joinDateLabel = joinDate ? new Date(normalizeEpochToMs(joinDate)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
              const generatedOn = payslip.timestamp ? new Date(payslip.timestamp * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
              const displayName = employee.name || "N/A";
              const bankBranchDisplay = employee.bank_branch || employee.bank_branch_name || "—";
              const bankAccountMasked = employee.bank_account_no ? `****${String(employee.bank_account_no).replace(/\s/g, "").slice(-4)}` : "—";

              return `
              <div class="payslip-container">
                <div class="print-shell">
                  <div class="print-card">
                    <div class="hero">
                      <div>
                        <div class="hero-subtitle">Employee</div>
                        <div class="hero-title">${displayName}</div>
                      </div>
                      <div class="hero-month">${monthName} ${year}</div>
                    </div>

                    <div class="info-grid">
                      <div class="info-box">
                        <div class="info-title">Profile</div>
                        <div class="info-row"><span class="info-label">CNIC/Passport</span><span class="info-value">${employee.passport_no || "—"}</span></div>
                        <div class="info-row"><span class="info-label">Employee ID</span><span class="info-value">${employee.emp_id || "—"}</span></div>
                        <div class="info-row"><span class="info-label">Biometric ID</span><span class="info-value">${employee.bio_id || "—"}</span></div>
                        <div class="info-row"><span class="info-label">Branch</span><span class="info-value">${employee.branch_name || "—"}</span></div>
                        <div class="info-row"><span class="info-label">Department</span><span class="info-value">${employee.department_name || "—"}</span></div>
                        <div class="info-row"><span class="info-label">Designation</span><span class="info-value">${employee.designation || "—"}</span></div>
                        <div class="info-row"><span class="info-label">Joined on</span><span class="info-value">${joinDateLabel}</span></div>
                        <div class="info-row"><span class="info-label">Generated on</span><span class="info-value">${generatedOn}</span></div>
                      </div>
                      <div class="info-box">
                        <div class="info-title">Bank details</div>
                        <div class="info-row"><span class="info-label">Bank</span><span class="info-value">${employee.bank_name || "—"}</span></div>
                        <div class="info-row"><span class="info-label">Bank Branch</span><span class="info-value">${bankBranchDisplay}</span></div>
                        <div class="info-row"><span class="info-label">Branch Code</span><span class="info-value">${employee.bank_branch_code || "—"}</span></div>
                        <div class="info-row"><span class="info-label">Account No</span><span class="info-value">${bankAccountMasked}</span></div>
                        <div class="info-row"><span class="info-label">Account Title</span><span class="info-value">${employee.bank_account_title || displayName}</span></div>
                      </div>
                    </div>

                    <div class="summary-box">
                      <div class="summary-title">Payroll summary</div>
                      <div class="summary-row">
                        <span class="summary-item"><b>Total days</b>${totalDays}</span>
                        <span class="summary-item"><b>Required days</b>${requiredDays}</span>
                        <span class="summary-item"><b>Present days</b>${presentDays}</span>
                        <span class="summary-item"><b>Absent days</b>${absentDays}</span>
                        <span class="summary-item"><b>Leaves</b>${payslip.leaves_encashable || 0}</span>
                      </div>
                    </div>

                    ${showPaymentSection ? `
                    <div class="print-table-shell">
                      <div class="print-heading">Payment details</div>
                      <table class="all-items-table">
                        <tbody>
                          ${basicSalary > 0 ? `<tr><td>Basic Pay</td><td>${formatPkr(basicSalary)}</td></tr>` : ""}
                          ${overtimeAmount > 0 ? `<tr><td>Overtime</td><td>${formatPkr(overtimeAmount)}</td></tr>` : ""}
                          ${incentive > 0 ? `<tr><td>Incremented Amount</td><td>${formatPkr(incentive)}</td></tr>` : ""}
                          ${salaryEarnedAmount > 0 ? `<tr><td><b>Total Earned</b></td><td>${formatPkr(salaryEarnedAmount)}</td></tr>` : ""}
                          ${totalPay > 0 ? `<tr class="total-pay-row"><td>Total Pay</td><td>${formatPkr(totalPay)}</td></tr>` : ""}
                        </tbody>
                      </table>
                    </div>` : ""}

                    ${incentivesFromArray.length > 0 ? `
                    <div class="print-table-shell">
                      <div class="print-heading">Extra additions</div>
                      <table class="all-items-table"><tbody>
                        ${incentivesFromArray.map((inc) => `<tr><td>${inc.title || "Addition"}</td><td>${formatPkr(inc.amount)}</td></tr>`).join("")}
                      </tbody></table>
                    </div>` : ""}

                    ${hasPrintDeductionContent ? `
                    <div class="print-table-shell">
                      <div class="print-heading">Deductions</div>
                      <table class="all-items-table"><tbody>
                        ${pfEmployee !== null && pfEmployee > 0 ? `
                        <tr><td colspan="2" style="padding:0;">
                              <div class="pf-breakdown-row">
                                <div class="pf-breakdown-col pf-col-title" style="border-right:1px solid #e5e7eb;">Provident Fund Deductions</div>
                                <div class="pf-breakdown-col pf-col-detail">
                              <div class="pf-emp-row">Employee Contribution: PKR ${pfEmployeeForCalc.toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 })}</div>
                              <div>Employer Contribution: PKR ${pfEmployer.toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 })}</div>
                              <div style="margin-top:6px;font-weight:500;">Total: PKR ${pfTotal.toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 })}</div>
                            </div>
                            <div class="pf-breakdown-col pf-col-value">PKR ${pfEmployeeForCalc.toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 })}</div>
                          </div>
                        </td></tr>` : ""}
                        ${eobi !== null && eobi > 0 ? `<tr><td>EOBI</td><td>${formatPkr(eobi)}</td></tr>` : ""}
                        ${incomeTax !== null && incomeTax > 0 ? `<tr><td>Income Tax</td><td>${formatPkr(incomeTax)}</td></tr>` : ""}
                        ${calculatedAbsenteeDeduction > 0 ? `<tr><td>Absentee Deduction</td><td>${formatPkr(calculatedAbsenteeDeduction)}</td></tr>` : ""}
                        ${calculatedLateDeduction > 0 ? `<tr><td>Late Minute Deduction</td><td>${formatPkr(calculatedLateDeduction)}</td></tr>` : ""}
                        ${downtimeDeduction > 0 ? `<tr><td>Downtime (Early Leave)</td><td>${formatPkr(downtimeDeduction)}</td></tr>` : ""}
                        ${otherDeductions > 0 ? `<tr><td>Other Deductions</td><td>${formatPkr(otherDeductions)}</td></tr>` : ""}
                        ${deductionRows.map((item) => {
                          const amt = parseFloat(item.monthly_amount > 0 ? item.monthly_amount : item.amount || 0);
                          if (amt <= 0) return "";
                          return `<tr><td>${item.title || "Deduction"}</td><td>${formatPkr(amt)}</td></tr>`;
                        }).join("")}
                        ${attendanceDeduction > 0 ? `<tr class="total-deduct-row"><td>Attendance Deduction</td><td>${formatPkr(attendanceDeduction)}</td></tr>` : ""}
                      </tbody></table>
                    </div>` : ""}

                    <div class="amount-grid">
                      <div class="amount-card">
                        <div class="amount-title">Payable</div>
                        <div class="amount-value">PKR ${formatPkrAmount(netPayable)}/-</div>
                      </div>
                      <div class="amount-card deductions">
                        <div class="amount-title">Total Deductions</div>
                        <div class="amount-value small">PKR ${formatPkrAmount(totalDeductions)}/-</div>
                      </div>
                    </div>

                    <div class="signatures">
                      <div class="signature-line"><span class="signature-label">Officer signature</span><div class="signature-underline"><span class="signature-value">${officeSignatureEscaped}</span></div></div>
                      <div class="signature-line"><span class="signature-label">Employee signature</span><div class="signature-underline"></div></div>
                    </div>
                  </div>
                </div>
              </div>`;
            })
            .join("")}
        </div>
      `;

      // Append to body temporarily
      document.body.appendChild(printContent);

      // Print the content
      window.print();

      // Remove the temporary content after printing
      setTimeout(() => {
        document.body.removeChild(printContent);
      }, 1000);
    } catch (error) {
      console.error("Error printing payslips:", error);
      showToast("Error printing payslips", "error");
    }
  };

  // Individual action handlers
  const toggleDropdown = (payslipId) => {
    setOpenDropdowns((prev) => {
      // If the clicked dropdown is already open, close it
      if (prev[payslipId]) {
        return {};
      }
      // Otherwise, close all others and open only this one
      return {
        [payslipId]: true,
      };
    });
  };

  const handleViewPayslip = (employee) => {
    // Find the original payslip data from the payslips array
    const originalPayslip = payslips.find(
      (p) => p.emp_id === employee.emp_id || p.id === employee.id
    );

    if (!originalPayslip) {
      showToast("Payslip data not found", "error");
      return;
    }

    // Transform the payslip data to match the required format
    const employeeData = originalPayslip.wf_employee || {};

    // Calculate working hours (convert seconds to hours)
    const totalWorkingHours = originalPayslip.total_working
      ? originalPayslip.total_working / 3600
      : 0;
    const totalPresentHours = originalPayslip.total_present
      ? originalPayslip.total_present / 3600
      : 0;

    // Parse salary month (format: "1025" = Oct 2025)
    const salaryMonth = originalPayslip.salary_month || "";
    const month = salaryMonth.length >= 2 ? salaryMonth.slice(0, 2) : "10";
    const year =
      salaryMonth.length >= 4
        ? "20" + salaryMonth.slice(2)
        : new Date().getFullYear();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[parseInt(month) - 1] || "Oct";

    // Calculate days (assuming 8 hours per day)
    const totalDays = Math.round(totalWorkingHours / 8);
    const presentDays = Math.round(totalPresentHours / 8);
    const absentDays = totalDays - presentDays;

    const payslipData = {
      // Original payslip data fields (for IndividualPayslipPreview component)
      id: originalPayslip.id,
      name: employeeData.name || employee.name || "N/A",
      employee_id: employeeData.emp_id || employee.emp_id || "N/A",
      biometric_id: employeeData.bio_id || "N/A",
      branch_name: employeeData.branch_name || selectedBranch?.label || "N/A",
      department_name:
        employeeData.department_name || selectedDepartment?.label || "N/A",
      designation: employeeData.designation || "N/A",
      generated_date: originalPayslip.timestamp
        ? new Date(originalPayslip.timestamp * 1000).toISOString()
        : new Date().toISOString(),
      present_days: presentDays,
      total_days: totalDays,
      absent_days: absentDays,
      leave_days: originalPayslip.leaves_encashable || 0,
      earned_hours: totalPresentHours,
      expected_hours: totalWorkingHours,
      month: monthName,
      year: year,
      basic_salary: parseFloat(originalPayslip.rate || 0),
      emp_salary: parseFloat(originalPayslip.salary_amount || 0),
      total_pay:
        parseFloat(originalPayslip.salary_amount || 0) +
        parseFloat(originalPayslip.incentive || 0),
      absentees_deduction: parseFloat(originalPayslip.att_deductions || 0),
      income_tax: parseFloat(
        originalPayslip.income_tax || originalPayslip.tax || 0
      ),
      eobi: parseFloat(
        originalPayslip.eobi || originalPayslip.eobi_amount || 0
      ),
      provident_fund: parseFloat(
        originalPayslip.provident_fund || originalPayslip.pf_amount || 0
      ),
      other_deductions: parseFloat(originalPayslip.other_deductions || 0),
      net_salary: parseFloat(originalPayslip.paid_amount || 0),
      payable_amount: parseFloat(originalPayslip.paid_amount || 0),
      payment_method: originalPayslip.pay_method || "Cash",
      status: originalPayslip.status || "due",

      // Add the original API response fields that IndividualPayslipPreview expects
      total_working: originalPayslip.total_working || 0,
      total_present: originalPayslip.total_present || 0,
      rate: originalPayslip.rate || 0,
      salary_amount: originalPayslip.salary_amount || 0,
      att_deductions: originalPayslip.att_deductions || 0,
      deduction: originalPayslip.deduction || 0,
      paid_amount: originalPayslip.paid_amount || 0,
      pay_method: originalPayslip.pay_method || "Cash",
      leaves_encashable: originalPayslip.leaves_encashable || 0,
    };

    // Close dropdown
    setOpenDropdowns({});

    // Navigate to individual payslip preview with payslip ID (data will be fetched from store or API)
    navigate(`/individual-payslip-preview/${originalPayslip.id}`);
  };

  const handleDeleteSinglePayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setSingleDeleteDialog(true);
    setOpenDropdowns({}); // Close all dropdowns
  };

  const handleMarkSinglePaid = (payslip) => {
    setSelectedPayslip(payslip);
    setPaymentMethod("");
    setPaymentDetail("");
    setSingleMarkPaidDialog(true);
    setOpenDropdowns({}); // Close all dropdowns
  };

  const confirmSingleDelete = async () => {
    setLoading(true);
    if (!selectedPayslip) return;

    try {
      const result = await deleteSinglePayslip(selectedPayslip.id);

      if (result.success) {
        showToast(
          `Successfully deleted payslip for ${selectedPayslip.name}`,
          "success"
        );
        setSingleDeleteDialog(false);
        setSelectedPayslip(null);
      } else {
        showToast(result.error || "Failed to delete payslip", "error");
        setSingleDeleteDialog(false);
      }
    } catch (error) {
      console.error("Error deleting payslip:", error);
      showToast("An error occurred while deleting payslip", "error");
      setSingleDeleteDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmSingleMarkPaid = async () => {
    if (!selectedPayslip || !paymentMethod) return;

    setIsMarkingPaid(true);

    try {
      const result = await markingInvoiceAsPaid(
        selectedPayslip.id,
        paymentMethod,
        paymentDetail
      );

      if (result.success) {
        showToast(
          `Successfully marked payslip for ${selectedPayslip.name} as paid`,
          "success"
        );
        setSingleMarkPaidDialog(false);
        setSelectedPayslip(null);
      } else {
        showToast(result.error || "Failed to mark payslip as paid", "error");
        setSingleMarkPaidDialog(false);
      }
    } catch (error) {
      console.error("Error marking payslip as paid:", error);
      showToast("An error occurred while marking payslip as paid", "error");
      setSingleMarkPaidDialog(false);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // Persist department only after initial load has applied saved department (avoid wiping localStorage before read)
  useEffect(() => {
    if (!makingPaymentsFiltersReady.current) return;
    saveMakingPaymentsDepartment(selectedDepartment);
  }, [selectedDepartment]);

  // Load branches, department list for "all branches", optional saved department, then payslips — always branch_id 0 on entry
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      flushSync(() => {
        setTableLoading(true);
      });

      setSelectedBranch(ALL_BRANCHES_OPTION);

      if (
        !copyBranchesData ||
        !Array.isArray(copyBranchesData) ||
        copyBranchesData.length === 0
      ) {
        await getAllBranchesPayroll();
      }

      setCurrentPageId(0);
      setAccumulatedEmployees([]);

      const savedDept = loadMakingPaymentsDepartment();

      setDepartmentMenuLoading(true);
      let deptsList = [];
      try {
        deptsList = await gettingDepartmentsServices(0);
      } finally {
        setDepartmentMenuLoading(false);
      }
      if (cancelled) return;

      if (!Array.isArray(deptsList)) deptsList = [];

      setDepartments([
        { value: 0, label: "All Departments" },
        ...deptsList,
      ]);

      let deptToUse = null;
      if (savedDept) {
        if (savedDept.value === 0 || savedDept.value === "0") {
          deptToUse = { value: 0, label: "All Departments" };
        } else if (
          deptsList.some((d) => String(d.value) === String(savedDept.value))
        ) {
          deptToUse = savedDept;
        }
      }
      setSelectedDepartment(deptToUse);
      makingPaymentsFiltersReady.current = true;

      const params = {
        page: 0,
        limit: 15,
      };
      if (
        ALL_BRANCHES_OPTION &&
        (ALL_BRANCHES_OPTION.value === 0 || ALL_BRANCHES_OPTION.value)
      ) {
        params.branch_id = ALL_BRANCHES_OPTION.value;
      }
      if (
        deptToUse &&
        (deptToUse.value === 0 || deptToUse.value)
      ) {
        params.department_id = deptToUse.value;
      }
      if (
        ALL_BRANCHES_OPTION &&
        deptToUse &&
        (ALL_BRANCHES_OPTION.value === 0 || ALL_BRANCHES_OPTION.value) &&
        (deptToUse.value === 0 || deptToUse.value)
      ) {
        params.pagination = false;
        delete params.limit;
        delete params.page;
      }

      const filterKeyForComparison = JSON.stringify({
        ...params,
        page: undefined,
      });
      if (!cancelled) {
        const st = useStore.getState();
        if (
          st.payslipsLoaded &&
          st.lastPayslipFilters === filterKeyForComparison
        ) {
          setTableLoading(false);
          return;
        }
      }

      try {
        await gettingPayslips(params, false);
      } finally {
        setTableLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setOpenDropdowns({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to transform payslips to employees
  const transformPayslipsToEmployees = (payslipsData) => {
    if (!payslipsData || !Array.isArray(payslipsData)) {
      return [];
    }
    return payslipsData.map((payslip) => ({
      id: payslip.id,
      emp_id: payslip.emp_id ?? payslip.wf_employee?.emp_id ?? null,
      name: payslip.wf_employee?.name || payslip.name || "N/A",
      branch_id: payslip.branch_id || null,
      department_id: payslip.department_id || null,
      salary: `${payslip.salary_currency || "PKR"} ${parseFloat(
        payslip.salary_amount || 0
      ).toLocaleString()}`,
      netSalary: `${payslip.salary_currency || "PKR"} ${parseFloat(
        payslip.paid_amount || 0
      ).toLocaleString()}`,
      tada: `${payslip.salary_currency || "PKR"} ${parseFloat(
        payslip.overtime_amount || 0
      ).toLocaleString()}`,
      medAllowance: "N/A", // Not available in API response, can be calculated from allowances if needed
      incentives: `${payslip.salary_currency || "PKR"} ${parseFloat(
        payslip.incentive || 0
      ).toLocaleString()}`,
      deductions: `${payslip.salary_currency || "PKR"} ${parseFloat(
        payslip.deduction || 0
      ).toLocaleString()}`,
      salaryFTM: formatSalaryMonthFTM(payslip.salary_month),
      status:
        payslip.status === "due"
          ? "Due"
          : payslip.status === "paid"
          ? "Paid"
          : payslip.status,
      selected: false,
      // Add original payslip data for filtering
      originalPayslip: payslip,
    }));
  };

  // Update employees when payslips data changes
  useEffect(() => {
    if (payslips && Array.isArray(payslips)) {
      const transformedEmployees = transformPayslipsToEmployees(payslips);
      
      // Since the ViewModel now handles appending for loadMore, 
      // we just need to update the local state with all payslips
      setAccumulatedEmployees(transformedEmployees);
      setAllEmployees(transformedEmployees);
      setEmployees(transformedEmployees);
      
      // Reset loading state if it was set
      if (isLoadingMore) {
        setIsLoadingMore(false);
      }
    } else {
      // If no data, clear everything
      setAllEmployees([]);
      setEmployees([]);
      setAccumulatedEmployees([]);
      if (isLoadingMore) {
        setIsLoadingMore(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payslips]);

  // Update selectAll state when individual selections change
  useEffect(() => {
    if (employees.length === 0) {
      setSelectedAll(false);
    } else {
      const allSelected = employees.every((emp) => emp.selected);
      setSelectedAll(allSelected);
    }
  }, [employees]);

  // Frontend filtering function
  const applyFrontendFilters = () => {
    let filteredEmployees = [...allEmployees];

    // If no filter is selected, show all employees
    if (!mainFilter?.value) {
      setEmployees(filteredEmployees);
      return;
    }

    // Employee ID/name search is handled by backend (filter=emp_id or emp_name, search=term) - no frontend filter

    // Apply status filter
    if (mainFilter.value === "status" && mainStatus?.value) {
      filteredEmployees = filteredEmployees.filter(
        (emp) => emp.status?.toLowerCase() === mainStatus.value.toLowerCase()
      );
    }

    // Apply specific month filter
    if (
      mainFilter.value === "specific_month" &&
      selectedMonth &&
      selectedYear
    ) {
      // Convert selected month/year to MMYY format (e.g., "1025" for October 2025)
      const monthStr = String(selectedMonth).padStart(2, "0");
      const yearStr = String(selectedYear).slice(-2); // Get last 2 digits of year
      const targetSalaryMonth = `${monthStr}${yearStr}`;

      filteredEmployees = filteredEmployees.filter((emp) => {
        const payslipSalaryMonth = emp.originalPayslip?.salary_month || "";
        return payslipSalaryMonth === targetSalaryMonth;
      });
    }

    setEmployees(filteredEmployees);
  };

  // Helper function to build filter params (overridePage = 0-based page, overrideSelectedDate = use this date instead of state for specific_month)
  const buildFilterParams = (includePagination = false, overridePage = undefined, overrideSelectedDate = undefined) => {
    const params = {};
    
    // Pagination params (default: paginate)
    if (overridePage !== undefined) {
      params.page = overridePage;
      params.limit = 15;
    } else if (includePagination) {
      params.page = currentPageId;
      params.limit = 15;
    } else {
      // Reset pagination when filters change
      params.page = 0;
      params.limit = 15;
    }

    // Branch filter
    if (
      selectedBranch &&
      (selectedBranch.value === 0 || selectedBranch.value)
    ) {
      params.branch_id = selectedBranch.value;
    }

    // Department filter
    if (
      selectedDepartment &&
      (selectedDepartment.value === 0 || selectedDepartment.value)
    ) {
      params.department_id = selectedDepartment.value;
    }

    // Requirement: when Branch + Department are selected, call API without limit and with pagination=false
    if (
      selectedBranch &&
      selectedDepartment &&
      (selectedBranch.value === 0 || selectedBranch.value) &&
      (selectedDepartment.value === 0 || selectedDepartment.value)
    ) {
      params.pagination = false;
      delete params.limit;
      delete params.page;
    }

    // Main filter - backend: emp_id when search is numeric, emp_name otherwise
    if (mainFilter?.value === "status" && mainStatus?.value) {
      params.filter = "status";
      params.search = mainStatus.value;
    } else if (
      mainFilter?.value === "employee_id" &&
      mainEmployeeIdSearch.trim()
    ) {
      const term = mainEmployeeIdSearch.trim();
      params.filter = /^\d+$/.test(term) ? "emp_id" : "emp_name";
      params.search = term;
    } else if (mainFilter?.value === "specific_month") {
      const dateToUse = overrideSelectedDate ?? mainSelectedDate;
      if (dateToUse) {
        const month = String(dateToUse.getMonth() + 1).padStart(2, "0");
        const year = String(dateToUse.getFullYear()).slice(-2);
        params.filter = "month";
        params.search = `${month}${year}`;
      }
    }

    return params;
  };

  // Pagination helpers (same pattern as AttAdustmentRequest) - API uses 0-based page
  const getPaginationData = () => {
    const totalPages = payslipsPagination?.totalPages ?? 0;
    const currentPageDisplay = currentPageId + 1; // 1-based for UI
    const hasMore = payslipsPagination?.hasMore ?? false;
    return {
      currentPage: currentPageDisplay,
      totalPages: Math.max(1, totalPages),
      hasMore,
    };
  };

  const goToNextPage = async () => {
    if (isLoadingMore) return;
    const paginationData = getPaginationData();
    if (paginationData.currentPage < paginationData.totalPages) {
      setIsLoadingMore(true);
      const nextPage0Based = currentPageId + 1;
      setCurrentPageId(nextPage0Based);
      try {
        const params = buildFilterParams(false, nextPage0Based);
        await gettingPayslips(params, true);
      } catch (error) {
        showToast("Failed to load next page", "error");
        setCurrentPageId(currentPageId);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const goToPreviousPage = async () => {
    if (isLoadingMore) return;
    if (currentPageId > 0) {
      setIsLoadingMore(true);
      const prevPage0Based = currentPageId - 1;
      setCurrentPageId(prevPage0Based);
      try {
        const params = buildFilterParams(false, prevPage0Based);
        await gettingPayslips(params, true);
      } catch (error) {
        showToast("Failed to load previous page", "error");
        setCurrentPageId(currentPageId);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const goToPage = async (pageNumber) => {
    if (isLoadingMore) return;
    const targetPage1Based = parseInt(pageNumber, 10);
    const targetPage0Based = targetPage1Based - 1;
    const paginationData = getPaginationData();
    if (targetPage1Based >= 1 && targetPage1Based <= paginationData.totalPages) {
      setIsLoadingMore(true);
      setCurrentPageId(targetPage0Based);
      try {
        const params = buildFilterParams(false, targetPage0Based);
        await gettingPayslips(params, true);
      } catch (error) {
        showToast("Failed to load page", "error");
        setCurrentPageId(currentPageId);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // Handle branch selection - build params with selectedOption so branch_id is sent on first select (state updates are async)
  const handleBranchChange = async (selectedOption) => {
    flushSync(() => {
      setTableLoading(true);
    });

    setSelectedBranch(selectedOption);
    setSelectedDepartment(null); // Reset department when branch changes
    setDepartments([{ value: 0, label: "All Departments" }]); // Clear departments list immediately

    // Reset pagination when filter changes
    setCurrentPageId(0);
    setAccumulatedEmployees([]);

    // Build params using the new selectedOption so branch_id is included on first selection
    const params = { page: 0, limit: 15 };
    if (selectedOption && (selectedOption.value === 0 || selectedOption.value)) {
      params.branch_id = selectedOption.value;
    }
    // Add main filter params (backend expects filter + search)
    if (mainFilter?.value === "status" && mainStatus?.value) {
      params.filter = "status";
      params.search = mainStatus.value;
    } else if (mainFilter?.value === "employee_id" && mainEmployeeIdSearch.trim()) {
      params.filter = "employee";
      params.search = mainEmployeeIdSearch.trim();
    } else if (mainFilter?.value === "specific_month" && mainSelectedDate) {
      const month = String(mainSelectedDate.getMonth() + 1).padStart(2, "0");
      const year = String(mainSelectedDate.getFullYear()).slice(-2);
      params.filter = "month";
      params.search = `${month}${year}`;
    }

    if (
      selectedOption &&
      (selectedOption.value === 0 || selectedOption.value)
    ) {
      setDepartmentMenuLoading(true);
      try {
        // Fetch departments for selected branch (0 for all branches)
        const branchId = selectedOption.value === 0 ? 0 : selectedOption.value;
        const departmentsData = await gettingDepartmentsServices(branchId);
        setDepartments([
          { value: 0, label: "All Departments" },
          ...(departmentsData || []),
        ]);

        // Call API with params that include branch_id (no dependency on state update)
        await fetchPayslipsTable(params, true);
      } catch (error) {
        setDepartments([{ value: 0, label: "All Departments" }]);
      } finally {
        setDepartmentMenuLoading(false);
      }
    } else {
      // No branch selected - call API without branch_id
      await fetchPayslipsTable(params, true);
    }
  };

  // Handle department selection
  const handleDepartmentChange = async (selectedOption) => {
    setSelectedDepartment(selectedOption);

    // Reset pagination when filter changes
    setCurrentPageId(0);
    setAccumulatedEmployees([]);

    // Build params with all active filters
    const params = buildFilterParams(false);
    await fetchPayslipsTable(params, true);
  };

  // Main page filter handlers
  const handleMainFilterChange = async (selectedOption) => {
    setMainFilter(selectedOption);
    // Reset dependent fields when filter changes
    setMainStatus(null);
    setMainEmployeeIdSearch("");
    setMainSelectedDate(null);
    setSelectedMonthYear(null);
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(null);
    setIsDatePickerOpen(false);

    // Reset pagination when filter changes
    setCurrentPageId(0);
    setAccumulatedEmployees([]);

    // If clearing the filter, reload with no main filter
    if (!selectedOption || !selectedOption.value) {
      const params = buildFilterParams(false);
      await fetchPayslipsTable(params, true);
    } else {
      // All main filters (employee_id, status, specific_month) are handled by backend - reload from API
      const params = buildFilterParams(false);
      await fetchPayslipsTable(params, true);
    }
  };

  const handleMainStatusChange = (selectedOption) => {
    setMainStatus(selectedOption);
    // Apply frontend filtering
    applyFrontendFilters();
  };

  const handleMainDateSelect = async (date) => {
    setMainSelectedDate(date);
    
    // Reset pagination when filter changes
    setCurrentPageId(0);
    setAccumulatedEmployees([]);
    
    // Use date directly - state updates are async, so pass it to avoid stale value
    const params = buildFilterParams(false, undefined, date);
    await fetchPayslipsTable(params, true);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    // Reset month when year changes
    setSelectedMonth(null);
    setSelectedMonthYear(null);
  };

  const handleMonthChange = async (month) => {
    setSelectedMonth(month);
    // Create a date object for the selected month/year
    const date = new Date(selectedYear, month - 1, 1);
    setSelectedMonthYear(date);
    setMainSelectedDate(date);
    // Close the date picker
    setIsDatePickerOpen(false);
    
    // Reset pagination when filter changes
    setCurrentPageId(0);
    setAccumulatedEmployees([]);
    
    // Use date directly - state updates are async, so pass it to avoid stale/previous value
    const params = buildFilterParams(false, undefined, date);
    await fetchPayslipsTable(params, true);
  };

  const handleClearMonthYear = () => {
    setSelectedMonthYear(null);
    setSelectedMonth(null);
    setSelectedYear(new Date().getFullYear());
    setIsDatePickerOpen(false);
    applyFrontendFilters();
  };

  const handleThisMonth = async () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
    setSelectedMonthYear(today);
    setMainSelectedDate(today);
    setIsDatePickerOpen(false);
    
    // Reset pagination when filter changes
    setCurrentPageId(0);
    setAccumulatedEmployees([]);
    
    // Use today directly - state updates are async
    const params = buildFilterParams(false, undefined, today);
    await fetchPayslipsTable(params, true);
  };

  // Handle employee search via backend API (debounced)
  useEffect(() => {
    if (mainFilter?.value !== "employee_id") return;
    const timeoutId = setTimeout(() => {
      setCurrentPageId(0);
      setAccumulatedEmployees([]);
      const params = buildFilterParams(false);
      void fetchPayslipsTable(params, true);
    }, 350);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainEmployeeIdSearch, mainFilter]);

  // Apply frontend filters when allEmployees changes
  useEffect(() => {
    if (allEmployees.length > 0) {
      applyFrontendFilters();
    }
  }, [allEmployees]);

  // Apply frontend filters when status or date changes
  useEffect(() => {
    if (
      mainFilter?.value === "status" ||
      mainFilter?.value === "specific_month"
    ) {
      applyFrontendFilters();
    }
  }, [
    mainStatus,
    mainSelectedDate,
    selectedMonthYear,
    selectedMonth,
    selectedYear,
    mainFilter,
  ]);

  // Prepare branch options
  const branchOptions = [
    { value: 0, label: "All Branches" },
    ...(copyBranchesData && Array.isArray(copyBranchesData)
      ? copyBranchesData.map((branch) => ({
          value: branch.id,
          label: branch.branch_name,
        }))
      : []),
  ];

  // Keep displayed branch aligned with options (always "All Branches" by default, never a stale first branch)
  const resolvedBranchValue = useMemo(() => {
    const match = branchOptions.find(
      (o) => String(o.value) === String(selectedBranch?.value)
    );
    return match ?? branchOptions[0] ?? ALL_BRANCHES_OPTION;
  }, [branchOptions, selectedBranch]);

  const resolvedDepartmentValue = useMemo(() => {
    if (!selectedDepartment) return null;
    const match = departments.find(
      (o) => String(o.value) === String(selectedDepartment.value)
    );
    return match ?? selectedDepartment;
  }, [departments, selectedDepartment]);

  // const filterOptions = [
  //   { value: 'all', label: 'All' },
  //   { value: 'paid', label: 'Paid' },
  //   { value: 'pending', label: 'Pending' }
  // ]

  // Main page filter options
  const mainFilterOptions = [
    { value: "status", label: "Filter by status" },
    { value: "specific_month", label: "Specific month" },
    { value: "employee_id", label: "Filter employee id/name" },
  ];

  const mainStatusOptions = [
    { value: "paid", label: "Paid" },
    { value: "due", label: "Due" },
  ];

  return (
    <div className="flex flex-col gap-4 lg:px-2 md:px-2 px-0">
      {/* Filter and Action Bar - Modern Toolbar Design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-2">
        {/* Top Section: Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Section Label */}
            <div className="flex items-center gap-2 text-gray-500 min-w-fit">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
            </div>
            
            {/* Filters Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
              {/* Branch */}
              <CustomSelect
                placeHolderTitle="All Branches"
                value={resolvedBranchValue}
                options={branchOptions}
                onChangeHandler={handleBranchChange}
                customStyles={false}
                menuLoading={!branchesLoaded}
                menuLoadingLabel="Loading branches..."
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              />

              {/* Department */}
              <CustomSelect
                placeHolderTitle="All Departments"
                value={resolvedDepartmentValue}
                options={departments}
                onChangeHandler={handleDepartmentChange}
                customStyles={false}
                menuLoading={departmentMenuLoading}
                menuLoadingLabel="Loading departments..."
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              />

              {/* Main Filter */}
              <CustomSelect
                placeHolderTitle="Filter by..."
                value={mainFilter}
                options={mainFilterOptions}
                onChangeHandler={handleMainFilterChange}
                customStyles={false}
                isSearchable={false}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              />

              {/* Status (Conditional) */}
              {mainFilter?.value === "status" && (
                <CustomSelect
                  placeHolderTitle="Status"
                  value={mainStatus}
                  options={mainStatusOptions}
                  onChangeHandler={handleMainStatusChange}
                  customStyles={false}
                  isSearchable={false}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                />
              )}

              {/* Month/Year (Conditional) */}
              {mainFilter?.value === "specific_month" && (
                <Popover
                  placement="bottom-start"
                  open={isDatePickerOpen}
                  handler={setIsDatePickerOpen}
                >
                  <PopoverHandler>
                    <div className="relative cursor-pointer">
                      <Input
                        label="Month & Year"
                        color="blue"
                        value={
                          selectedMonth && selectedYear
                            ? `${new Date(selectedYear, selectedMonth - 1).toLocaleDateString("en-US", { month: "short" })} ${selectedYear}`
                            : ""
                        }
                        placeholder="Select..."
                        readOnly
                        className="cursor-pointer bg-white text-customBlack-100 text-[13px] h-[38px]! pr-8"
                        containerProps={{ className: "h-[38px]! min-w-[unset]!" }}
                        labelProps={{ className: "hidden" }}
                      />
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </PopoverHandler>
                  <PopoverContent className="p-4 w-[260px] z-9999">
                    <div className="flex flex-col gap-3">
                      <div className="border-b pb-2">
                        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Year</div>
                        <div className="max-h-28 overflow-y-auto border rounded-md customScroll">
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <button
                                key={year}
                                onClick={() => handleYearChange(year)}
                                className={`w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50 transition-colors ${
                                  selectedYear === year ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"
                                }`}
                              >
                                {year}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Month</div>
                        <div className="grid grid-cols-4 gap-1">
                          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => (
                            <button
                              key={month}
                              onClick={() => handleMonthChange(index + 1)}
                              className={`px-1 py-1.5 text-xs font-medium rounded transition-colors ${
                                selectedMonth === index + 1
                                  ? "bg-blue-500 text-white"
                                  : "text-gray-600 hover:bg-blue-50"
                              }`}
                            >
                              {month}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <button onClick={handleClearMonthYear} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
                        <button onClick={handleThisMonth} className="text-xs text-blue-600 hover:text-blue-800 font-medium">This Month</button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Employee Search (Conditional) */}
              {mainFilter?.value === "employee_id" && (
                <div className="relative">
                  <Input
                    color="blue"
                    value={mainEmployeeIdSearch}
                    onChange={(e) => setMainEmployeeIdSearch(e.target.value)}
                    placeholder="Search employee..."
                    className="w-full h-[38px]! pl-9 text-[13px] border border-gray-200 rounded-lg focus:border-blue-500"
                    containerProps={{ className: "h-[38px]! min-w-[unset]!" }}
                    labelProps={{ className: "hidden" }}
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Actions */}
        <div className="bg-gray-50/60 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {tableLoading ? "…" : employees.length}
            </span>
            <span>records found</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Secondary Actions */}
            <Button
              variant="outlined"
              size="sm"
              className="normal-case cursor-pointer text-gray-600 border-gray-300 hover:bg-white hover:border-gray-400 px-3 py-2 text-[12px] flex items-center gap-1.5"
              onClick={handleExportClick}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </Button>
            <Button
              variant="outlined"
              size="sm"
              className="normal-case cursor-pointer text-gray-600 border-gray-300 hover:bg-white hover:border-gray-400 px-3 py-2 text-[12px] flex items-center gap-1.5"
              onClick={handlePrintAllClick}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </Button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            {/* Primary Actions */}
            <Button
              size="sm"
              className="normal-case cursor-pointer bg-[#FF4979] hover:bg-[#e63e6b] text-white px-3 py-2 text-[12px] flex items-center gap-1.5 shadow-sm hover:shadow transition-all"
              onClick={handleDeleteMarked}
              disabled={loading || selectedEmployees.length === 0}
              loading={loading}
            >
              <FaTrash className="w-3 h-3" />
              Delete ({selectedEmployees.length})
            </Button>
            <Button
              size="sm"
              className="normal-case cursor-pointer bg-[#0ACF97] hover:bg-[#09b989] text-white px-3 py-2 text-[12px] flex items-center gap-1.5 shadow-sm hover:shadow transition-all"
              onClick={handleMarkPaid}
              disabled={isMarkingPaid || selectedEmployees.length === 0}
              loading={isMarkingPaid}
            >
              <FaCheck className="w-3 h-3" />
              Mark Paid
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="p-2 bg-white rounded-[10px] drop-shadow-md w-full">
        <div className="relative w-full overflow-auto customScroll">
          <table className="min-w-full table-fixed text-center">
          <colgroup>
    <col style={{ width: '8%' }} />
    <col style={{ width: '8%' }} />
    <col style={{ width: '8%' }} />
    <col style={{ width: '8%' }} />
    <col style={{ width: '8%' }} />
    <col style={{ width: '8%' }} />
    <col style={{ width: '8%' }} />
    <col style={{ width: '8%' }} />
    <col style={{ width: '8%' }} />
    <col style={{ width: '8%' }} />
    <col style={{ width: '8%' }} />
  </colgroup>
            <thead className="rounded-[8px] bg-[#F8F9FA] sticky top-[0px] z-20">
              <tr className="rounded-[8px] bg-[#F8F9FA]">
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Checkbox
                    color="blue"
                    checked={selectedAll}
                    onChange={handleSelectAll}
                    disabled={tableLoading || employees.length === 0}
                  />
                </th>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    // color="#474747"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Name
                  </Typography>
                </th>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    // color="blue-gray"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Salary
                  </Typography>
                </th>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    // color="blue-gray"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Net Salary
                  </Typography>
                </th>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    // color="blue-gray"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    TA/DA
                  </Typography>
                </th>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    // color="blue-gray"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Med Allowance
                  </Typography>
                </th>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    // color="blue-gray"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Incentives
                  </Typography>
                </th>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    // color="blue-gray"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Deductions
                  </Typography>
                </th>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    // color="blue-gray"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Salary FTM
                  </Typography>
                </th>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    // color="blue-gray"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Status
                  </Typography>
                </th>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    // color="blue-gray"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Action
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <MakingPaymentsTableBodySkeleton />
              ) : employees.length > 0 ? (
                employees.map((employee, index) => {
                  const isLast = index === employees.length - 1;
                  const classes = isLast
                    ? "px-[clamp(4px,0.8vw,12px)] py-4"
                    : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";

                  return (
                    <tr key={employee.id} className={classes}>
                      <td className="px-[clamp(4px,0.8vw,12px)] py-4">
                        <Checkbox
                          color="blue"
                          checked={employee.selected}
                          onChange={() => handleRowSelect(employee.id)}
                        />
                      </td>
                      <td>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {employee?.originalPayslip?.name}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {employee.salary}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {employee.netSalary}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {employee.tada}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          PKR 0
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {employee.incentives}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {employee.deductions}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {employee.salaryFTM}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          <span
                            className={`px-4 py-2 rounded-[7px] text-[clamp(10px,0.9vw,14px)] font-medium font-Urbanist ${
                              employee.status?.toLowerCase() === "paid"
                                ? "bg-[#DBFFF5] text-[#0ACF97]"
                                : "bg-[#FFF0F4] text-[#FF4979]"
                            }`}
                          >
                            {employee.status}
                          </span>
                        </Typography>
                      </td>
                      <td>
                        <div className="relative dropdown-container">
                          <Button
                            className="bg-[#EFF8FF] cursor-pointer border border-[#3DA5F4] capitalize px-3 py-2 font-normal text-[clamp(10px,0.8vw,13px)] flex items-center gap-1 text-[#3DA5F4] rounded-[7px]"
                            size="sm"
                            onClick={(e) => {
                              // e.stopPropagation()
                              toggleDropdown(employee.id);
                            }}
                          >
                            <FaEllipsisV className="w-3 h-3" />
                            Actions
                          </Button>

                          {/* Dropdown Menu */}
                          {openDropdowns[employee.id] && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[9999]">
                              <div className="py-1">
                                {/* View Button - Always visible */}
                                <button
                                  className="w-full px-4 py-2 cursor-pointer text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  onClick={(e) => {
                                    // e.stopPropagation()
                                    handleViewPayslip(employee);
                                  }}
                                >
                                  <FaEye className="w-3 h-3 text-blue-600" />
                                  View Payslip
                                </button>

                                {/* Delete Button - Always visible */}
                                <button
                                  className="w-full px-4 py-2 cursor-pointer text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  onClick={(e) => {
                                    // e.stopPropagation()
                                    handleDeleteSinglePayslip(employee);
                                  }}
                                >
                                  <FaTrash className="w-3 h-3 text-red-600" />
                                  Delete Payslip
                                </button>

                                {/* Mark Paid Button - Only for Due status */}
                                {employee.status?.toLowerCase() === "due" && (
                                  <button
                                    className="w-full px-4 py-2 cursor-pointer text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={(e) => {
                                      // e.stopPropagation()
                                      handleMarkSinglePaid(employee);
                                    }}
                                  >
                                    <FaCheck className="w-3 h-3 text-green-600" />
                                    Mark as Paid
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="p-8 text-center">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      No data found
                    </Typography>
                  </td>
                </tr>
              )}
              {/* Pagination row - same pattern as AttAdustmentRequest */}
              {!tableLoading && employees && employees.length > 0 && (() => {
                const paginationData = getPaginationData();
                return paginationData.totalPages >= 1 && (
                  <tr>
                    <td colSpan={11} className="p-4 w-full" style={{ width: "100%" }}>
                      <div className="w-full flex justify-center items-center gap-1">
                        {/* Previous Button */}
                        {paginationData.currentPage > 1 ? (
                          <button
                            title="Previous Page"
                            className="px-3 py-2 cursor-pointer text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={goToPreviousPage}
                            disabled={isLoadingMore}
                          >
                            <span>‹</span>
                            <span>Previous</span>
                          </button>
                        ) : (
                          <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1">
                            <span>‹</span>
                            <span>Previous</span>
                          </div>
                        )}
                        {/* Page Numbers */}
                        <div className="flex items-center gap-1 flex-wrap justify-center">
                          {paginationData.totalPages <= 10 ? (
                            Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((pageNum) => (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                disabled={isLoadingMore}
                                className={`px-3 py-1.5 cursor-pointer text-[clamp(12px,1vw,14px)] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  pageNum === paginationData.currentPage
                                    ? "bg-[#1a73e8] text-white font-medium"
                                    : "text-[#1a73e8] hover:bg-gray-100"
                                }`}
                              >
                                {pageNum}
                              </button>
                            ))
                          ) : (
                            (() => {
                              const currentPage = paginationData.currentPage;
                              const totalPages = paginationData.totalPages;
                              const pages = [];
                              pages.push(1);
                              if (currentPage > 3) pages.push("ellipsis-start");
                              const startPage = Math.max(2, currentPage - 1);
                              const endPage = Math.min(totalPages - 1, currentPage + 1);
                              for (let i = startPage; i <= endPage; i++) {
                                if (i !== 1 && i !== totalPages) pages.push(i);
                              }
                              if (currentPage < totalPages - 2) pages.push("ellipsis-end");
                              pages.push(totalPages);
                              const uniquePages = [];
                              const seen = new Set();
                              pages.forEach((page) => {
                                if (typeof page === "number" && !seen.has(page)) {
                                  seen.add(page);
                                  uniquePages.push(page);
                                } else if (typeof page === "string") {
                                  uniquePages.push(page);
                                }
                              });
                              return uniquePages.map((page, index) => {
                                if (page === "ellipsis-start" || page === "ellipsis-end") {
                                  return (
                                    <span
                                      key={`ellipsis-${index}`}
                                      className="px-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8]"
                                    >
                                      ...
                                    </span>
                                  );
                                }
                                return (
                                  <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    disabled={isLoadingMore}
                                    className={`px-3 py-1.5 cursor-pointer text-[clamp(12px,1vw,14px)] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                      page === currentPage
                                        ? "bg-[#1a73e8] text-white font-medium"
                                        : "text-[#1a73e8] hover:bg-gray-100"
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              });
                            })()
                          )}
                        </div>
                        {/* Next Button */}
                        {paginationData.currentPage < paginationData.totalPages ? (
                          <button
                            title="Next Page"
                            className="px-3 py-2 cursor-pointer text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={goToNextPage}
                            disabled={isLoadingMore}
                          >
                            <span>Next</span>
                            <span>›</span>
                          </button>
                        ) : (
                          <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1">
                            <span>Next</span>
                            <span>›</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {/* <div className='flex justify-center items-center py-4'>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <span>Powered by</span>
          <span className='font-semibold text-blue-600'>Veevo Tech</span>
        </div>
      </div> */}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        openDialog={deleteDialog}
        handleOpen={() => setDeleteDialog(false)}
        handleConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${selectedEmployees.length} selected payslip(s)?`}
      />

      {/* Mark Paid Dialog */}
      {markPaidDialog && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-[#EAEFF5]">
            <div className="px-5 py-4 border-b border-[#EEF2F6]">
              <Typography className="text-[#474747] font-Urbanist font-medium text-[16px]">
                Mark Payslips as Paid
              </Typography>
            </div>

            <div className="space-y-4 px-5 py-4">
          {/* Selected Count */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <Typography variant="small" color="blue-gray">
              Selected Payslips:{" "}
              <span className="font-medium font-Urbanist text-[14px] text-[#474747]">
                {selectedEmployees.length}
              </span>
            </Typography>
          </div>

          {/* Payment Method Selector */}
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-1 font-medium font-Urbanist text-[14px] text-[#474747]"
            >
              Payment Method <span className="text-red-500">*</span>
            </Typography>
            <Select
              label="Select Payment Method"
              color="blue"
              value={paymentMethod}
              onChange={(val) => setPaymentMethod(val)}
            >
              <Option value="cash">Cash</Option>
              <Option value="bank_transfer">Bank Transfer</Option>
              <Option value="cheque">Cheque</Option>
              <Option value="online">Online Payment</Option>
              <Option value="card">Credit/Debit Card</Option>
            </Select>
          </div>

          {/* Payment Details */}
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-1 font-medium font-Urbanist text-[14px] text-[#474747]"
            >
              Payment Details (Optional)
            </Typography>
            <Textarea
              label="Enter payment details, reference number, or notes"
              color="blue"
              value={paymentDetail}
              onChange={(e) => setPaymentDetail(e.target.value)}
              rows={3}
            />
          </div>
            </div>

            <div className="px-5 py-4 border-t border-[#EEF2F6] flex justify-end gap-2">
              <Button
                className="bg-[#FF4979] cursor-pointer text-white font-medium font-Urbanist text-[14px] rounded-[7px] px-4 py-2 cursor-pointer hover:bg-[#e63f6f] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => setMarkPaidDialog(false)}
                disabled={isMarkingPaid}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#0ACF97] text-white cursor-pointer font-medium font-Urbanist text-[14px] rounded-[7px] px-4 py-2 cursor-pointer hover:bg-[#08b784] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={confirmMarkPaid}
                disabled={isMarkingPaid || !paymentMethod}
                loading={isMarkingPaid}
              >
                {isMarkingPaid ? "Processing..." : "Mark as Paid"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Dialog */}
      <ConfirmationDialog
        openDialog={singleDeleteDialog}
        handleOpen={() => setSingleDeleteDialog(false)}
        handleConfirm={confirmSingleDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the payslip for ${selectedPayslip?.name}?`}
      />

      {/* Single Mark Paid Dialog */}
      {singleMarkPaidDialog && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-[#EAEFF5]">
            <div className="px-5 py-4 border-b border-[#EEF2F6]">
              <Typography className="text-[#474747] font-Urbanist font-medium text-[16px]">
                Mark Payslip as Paid
              </Typography>
            </div>

            <div className="space-y-4 px-5 py-4">
          {/* Employee Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <Typography variant="small" color="blue-gray">
              Employee:{" "}
              <span className="font-medium font-Urbanist text-[14px] text-[#474747]">
                {selectedPayslip?.name}
              </span>
            </Typography>
          </div>

          {/* Payment Method Selector */}
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-1 font-medium font-Urbanist text-[14px] text-[#474747]"
            >
              Payment Method <span className="text-red-500">*</span>
            </Typography>
            <Select
              label="Select Payment Method"
              color="blue"
              value={paymentMethod}
              onChange={(val) => setPaymentMethod(val)}
            >
              <Option value="cash">Cash</Option>
              <Option value="bank_transfer">Bank Transfer</Option>
              <Option value="cheque">Cheque</Option>
              <Option value="online">Online Payment</Option>
              <Option value="card">Credit/Debit Card</Option>
            </Select>
          </div>

          {/* Payment Details */}
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="mb-1 font-medium font-Urbanist text-[14px] text-[#474747]"
            >
              Payment Details (Optional)
            </Typography>
            <Textarea
              label="Enter payment details, reference number, or notes"
              color="blue"
              value={paymentDetail}
              onChange={(e) => setPaymentDetail(e.target.value)}
              rows={3}
            />
          </div>
            </div>

            <div className="px-5 py-4 border-t border-[#EEF2F6] flex justify-end gap-2">
              <Button
                className="bg-[#FF4979] cursor-pointer text-white font-medium font-Urbanist text-[14px] rounded-[7px] px-4 py-2 cursor-pointer hover:bg-[#e63f6f] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => setSingleMarkPaidDialog(false)}
                disabled={isMarkingPaid}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#0ACF97] cursor-pointer text-white font-medium font-Urbanist text-[14px] rounded-[7px] px-4 py-2 cursor-pointer hover:bg-[#08b784] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={confirmSingleMarkPaid}
                disabled={isMarkingPaid || !paymentMethod}
                loading={isMarkingPaid}
              >
                {isMarkingPaid ? "Processing..." : "Mark as Paid"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MakingPayments;