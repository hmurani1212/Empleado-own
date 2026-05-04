import React, { useEffect, useState } from "react";
import Calendar from "../../Components/Calendar/Calendar";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { motion } from "framer-motion";
import { getOrganizationData, getUserData } from "../../Authentication/jwt_decode";
import useIndividualAttendanceServices from "../../ViewModel/AttendanceViewModel/IndividualAttendanceServices";
import { getAllMonths, getAllYears } from "../../services/__appServicesData";
import { secondsIntoHrs } from "../../services/__dateTimeServices";
import {
  formatAttendanceData,
  secondsToHoursMinutes,
} from "../../services/__attendanceDataFormatter";
import AttendanceSummary from "./AttendanceSummary";
import useExtraAttendanceServices from "../../ViewModel/AttendanceViewModel/extraAttendanceService";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import ViewPolicy from "../HRPolicies/ViewPolicy";
import useRawAttendanceLog from "../../ViewModel/AttendanceViewModel/rawAttendanceLogServices";
import useTrackPolicy from "../../ViewModel/AttendanceViewModel/trackPolicyServices";
import RawAttendanceLog from "./RawAttendanceLog";
import TrackPolicy from "./TrackPolicy";
import { useNavigate, useLocation } from "react-router";
import MonthlyWorkingHoursChart from "./MonthlyWorkingHoursChart";
import { Card, CardBody } from "@material-tailwind/react";
import { attendanceColorData } from "../../services/__attendanceServices";
import { BiSearch } from "react-icons/bi";
import { appendExcelSignatureRowExcelJS } from "../../utils/excelExportSignature";

// Match ExportPayslip / payroll Excel styling
const ATTENDANCE_EXPORT_COL_COUNT = 14;
const ORG_HEADER_BG = "FF1F4E79";
const DATE_HEADER_BG = "FF2E75B6";
const COLUMN_HEADER_BG = "FF1F4E79";
const GRID_COLOR = "FFD1D5DB";
const ROW_FILL_WHITE = "FFFFFFFF";

// MAL uses its own fill (#eb0dbc); not included here
const LEAVE_ATT_LABELS = new Set([
  "L", "CL", "AL", "SL", "ML", "EL", "FL", "PL", "LWOP", "HL",
]);

const MAL_STATUS_FILL = "FFEB0DBC"; // #eb0dbc

/** Normalize API unix timestamp (seconds or ms) to seconds, or null if invalid. */
const toUnixSeconds = (raw) => {
  if (raw == null || raw === "" || raw === "0") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n > 1e12) return Math.floor(n / 1000);
  return Math.floor(n);
};

/** Build 12-hour time with AM/PM for export; supports unix sec/ms and "HH:MM" / "HH:MM:SS" strings. */
const formatTimeForExcel = (raw) => {
  if (raw == null || raw === "") return "";
  if (typeof raw === "string") {
    const s = raw.trim();
    if (/am|pm/i.test(s)) return s;
    if (/^\d{1,2}:\d{2}/.test(s)) {
      const [hStr, mPart] = s.split(":");
      const mStr = (mPart || "0").slice(0, 2);
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10) || 0;
      if (Number.isNaN(h)) return s;
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    }
  }
  const sec = toUnixSeconds(raw);
  if (sec == null) return "";
  const d = new Date(sec * 1000);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  });
};

const getFirstInLastOutFromRecord = (record) => {
  let inTime = "";
  let outTime = "";

  if (Array.isArray(record.timings) && record.timings.length > 0) {
    inTime = formatTimeForExcel(record.timings[0]) || "";
    if (record.timings.length >= 2) {
      const last = record.timings.length - 1;
      const secondLast = last - 1;
      outTime =
        record.timings.length % 2 === 0
          ? formatTimeForExcel(record.timings[last]) || ""
          : formatTimeForExcel(record.timings[secondLast]) || "";
    }
  }

  if (!inTime && record.in_1 != null) inTime = formatTimeForExcel(record.in_1);
  if (!outTime && record.out_1 != null) outTime = formatTimeForExcel(record.out_1);
  if (!inTime && record.first_in != null) inTime = formatTimeForExcel(record.first_in);
  if (!outTime && record.last_out != null) outTime = formatTimeForExcel(record.last_out);
  if (!inTime && record.check_in != null) inTime = formatTimeForExcel(record.check_in);
  if (!outTime && record.check_out != null) outTime = formatTimeForExcel(record.check_out);
  if (!inTime && record.in_time != null) inTime = formatTimeForExcel(record.in_time);
  if (!outTime && record.out_time != null) outTime = formatTimeForExcel(record.out_time);

  return { inTime, outTime };
};

const getLateMinutesFromRecord = (record) => {
  const v =
    record.late_minutes ??
    record.late_minute ??
    record.late_mins_adjusted ??
    record.late_mins ??
    null;
  if (v == null || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : String(v);
};

const pickEmployeeFromList = (empList, empIdSelect) => {
  if (!empList?.length || empIdSelect == null || empIdSelect === "") return null;
  const sel = String(empIdSelect);
  return (
    empList.find(
      (emp) =>
        String(emp.id) === sel ||
        String(emp.emp_id) === sel ||
        String(emp.bio_id) === sel ||
        String(emp.employee_id) === sel ||
        (emp.oneid != null && String(emp.oneid) === sel)
    ) || null
  );
};

const getDesignationLabel = (emp) => {
  if (!emp) return "N/A";
  const d = emp.designation;
  if (typeof d === "string") return d || "N/A";
  return d?.title || d?.name || emp.designation_title || emp.designation_name || "N/A";
};

const getDepartmentLabel = (emp) => {
  if (!emp) return "N/A";
  const d = emp.department;
  if (typeof d === "string") return d || "N/A";
  return d?.name || emp.department_name || emp.dept_name || "N/A";
};

const getBranchLabel = (emp) => {
  if (!emp) return "N/A";
  const b = emp.branch;
  if (typeof b === "string") return b || "N/A";
  return b?.branch_name || emp.branch_name || "N/A";
};

// Using ExcelJS for styling support (colors, fonts, etc.)

const IndividualAttendanceReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const attendanceHubPath = location.pathname.includes("/my-attendance/")
    ? "/my-attendance"
    : "/attendance";
  const months = getAllMonths();
  const years = getAllYears();
  const {
    searchingEmpValue,
    handleSelectAttendance,
    attendanceData,
    daysArray,
    handleNextMonth,
    handlePreviousMonth,
    getAttendanceLabel,
    getBackgroundColor,
    getExtraAttribute,
    handleSingleDayDate,
    singleDayService,
    toggleSingleAttendance,
    addMoreInput,
    closeModal,
    updateSingleDayData,
    onDataRefreshed,
    showCalendar,
    handleCalendarNavigation,
  } = useIndividualAttendanceServices();

  // Debug effect to log state changes
  useEffect(() => {
    /// console.log('searchingEmpValue updated:', searchingEmpValue);
  }, [searchingEmpValue]);

  // State for custom select dropdown
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

  // Handler for custom employee select
  const handleEmployeeSelect = (employee) => {
    ///console.log('Selected employee:', employee);
    const empObject = { value: employee.id, label: employee.name };
    ///console.log('Setting employee object:', empObject);
    handleSelectAttendance(empObject, "empId");
    setEmployeeSearchTerm(employee.name);
    setIsEmployeeDropdownOpen(false);
  };

  // Filter employees based on search term (name or ID)
  const filteredEmployees = Array.isArray(searchingEmpValue?.empList)
    ? searchingEmpValue.empList
        .filter((emp) => {
          const search = employeeSearchTerm.toLowerCase();

          const empName = String(emp.name || "").toLowerCase();
          const empId = String(emp.id || "");
          const empBioId = String(emp.bio_id || "");
          const empEmpId = String(emp.emp_id || "");
          const empOneId =
            emp.oneid != null && emp.oneid !== "" ? String(emp.oneid) : "";

          return (
            empName.includes(search) ||
            empId.includes(search) ||
            empBioId.includes(search) ||
            empEmpId.includes(search) ||
            (empOneId && empOneId.includes(search))
          );
        })
        .sort((a, b) => {
          const search = employeeSearchTerm.toLowerCase();

          const getRank = (emp) => {
            const values = [
              String(emp.id || ""),
              String(emp.emp_id || ""),
              String(emp.bio_id || ""),
              emp.oneid != null && emp.oneid !== "" ? String(emp.oneid) : "",
              String(emp.name || "").toLowerCase(),
            ];

            // 0 = exact match
            if (values.some((v) => v === search)) return 0;

            // 1 = startsWith
            if (values.some((v) => v.startsWith(search))) return 1;

            // 2 = includes
            return 2;
          };

          return getRank(a) - getRank(b);
        })
    : [];

  // Handle input change for search
  const handleEmployeeInputChange = (e) => {
    const value = e.target.value;
    setEmployeeSearchTerm(value);
    setIsEmployeeDropdownOpen(true);

    // If input is cleared, clear selection
    if (!value) {
      handleSelectAttendance(null, "empId");
    }
  };

  // Handle input focus
  const handleEmployeeInputFocus = () => {
    setIsEmployeeDropdownOpen(true);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".employee-select-container")) {
        setIsEmployeeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update search term when employee is selected from outside
  useEffect(() => {
    if (searchingEmpValue?.empId?.label) {
      setEmployeeSearchTerm(searchingEmpValue.empId.label);
    }
  }, [searchingEmpValue?.empId]);

  // Export Attendance to Excel — ExcelJS styling aligned with Payroll ExportPayslip
  const exportAttendanceToExcel = async () => {
    if (
      !searchingEmpValue?.empId ||
      !attendanceData?.attendanceAttr?.attendance ||
      attendanceData.attendanceAttr.attendance.length === 0
    ) {
      alert("Please select an employee and ensure attendance data is loaded");
      return;
    }

    const ExcelJS = (await import("exceljs")).default;

    const userData = getUserData();
    const orgName =
      getOrganizationData()?.orgName || userData?.org_name || "Organization";
    const fromList = pickEmployeeFromList(
      searchingEmpValue.empList,
      searchingEmpValue.empId?.value
    );
    const snap = attendanceData?.attendanceAttr?.employeeSnapshot;
    // List first, then snapshot: attendance API fills designation/department on snapshot;
    // employee list rows may omit them or set null, which would overwrite if snapshot were spread first.
    const selectedEmployee = {
      ...(fromList && typeof fromList === "object" ? fromList : {}),
      ...(snap && typeof snap === "object" ? snap : {}),
    };
    const year = searchingEmpValue.year?.label || new Date().getFullYear();
    const month = searchingEmpValue.month?.value || new Date().getMonth() + 1;
    const monthTitle =
      searchingEmpValue.month?.label ||
      new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", {
        month: "long",
      });
    const reportDate = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const employeeName =
      selectedEmployee?.name || searchingEmpValue.empId?.label || "N/A";
    const displayEmpId =
      selectedEmployee?.emp_id ??
      selectedEmployee?.bio_id ??
      selectedEmployee?.id ??
      searchingEmpValue.empId?.value ??
      "";
    const branchName = getBranchLabel(selectedEmployee);
    const designation = getDesignationLabel(selectedEmployee);
    const department = getDepartmentLabel(selectedEmployee);

    const secondsToHoursMinutesObj = (seconds) => {
      const s = Number(seconds) || 0;
      if (!s) return { hours: 0, minutes: 0 };
      const hours = Math.floor(s / 3600);
      const minutes = Math.floor((s % 3600) / 60);
      return { hours, minutes };
    };

    const getDayName = (dateString) => {
      if (!dateString || !String(dateString).includes("-")) return "";
      const [day, m, y] = dateString.split("-");
      const date = new Date(Number(y), Number(m) - 1, Number(day));
      return date.toLocaleDateString("en-US", { weekday: "short" });
    };

    const attendanceRecords = (
      attendanceData.attendanceAttr.attendance || []
    ).map((record) => {
      const earned = secondsToHoursMinutesObj(record.earned);
      const expected = secondsToHoursMinutesObj(record.expected);
      const overtime = secondsToHoursMinutesObj(record.overtime);
      const { inTime, outTime } = getFirstInLastOutFromRecord(record);

      let statusText = record.att_label != null ? String(record.att_label) : "";
      const statusCodeRaw = statusText.toUpperCase().trim();

      if (statusCodeRaw === "P" || statusCodeRaw === "PRESENT") statusText = "Present";
      else if (statusCodeRaw === "A" || statusCodeRaw === "ABSENT") statusText = "Absent";
      else if (
        statusCodeRaw === "H" ||
        statusCodeRaw === "HOLIDAY" ||
        statusText.toLowerCase().includes("holiday")
      ) {
        statusText = "Holiday";
      }

      const originalCode =
        record.att_label != null ? String(record.att_label).toUpperCase().trim() : statusCodeRaw;

      return {
        Date: record.date_string,
        Day: getDayName(record.date_string),
        "In time": inTime,
        "Out time": outTime,
        "Late min": getLateMinutesFromRecord(record),
        Status: statusText,
        StatusCode: originalCode,
        "Earned Hours": earned.hours,
        "Earned Minutes": earned.minutes,
        "Overtime Hours": overtime.hours,
        "Overtime Minutes": overtime.minutes,
        "Expected Hours": expected.hours,
        "Expected Minutes": expected.minutes,
        "Policy #": record.policy ?? "",
        "Shift #": record.shift ?? "",
      };
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report", {
      views: [{ rightToLeft: false }],
    });
    const cCount = ATTENDANCE_EXPORT_COL_COUNT;

    worksheet.columns = [
      { width: 12 }, { width: 8 }, { width: 10 }, { width: 10 }, { width: 10 },
      { width: 14 }, { width: 9 }, { width: 9 }, { width: 9 }, { width: 9 },
      { width: 9 }, { width: 9 }, { width: 11 }, { width: 10 },
    ];

    const thinGrid = {
      top: { style: "thin", color: { argb: GRID_COLOR } },
      bottom: { style: "thin", color: { argb: GRID_COLOR } },
      left: { style: "thin", color: { argb: GRID_COLOR } },
      right: { style: "thin", color: { argb: GRID_COLOR } },
    };

    const orgRow = worksheet.addRow([`Organization: ${orgName}`]);
    orgRow.height = 26;
    worksheet.mergeCells(1, 1, 1, cCount);
    orgRow.getCell(1).font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    orgRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    orgRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: ORG_HEADER_BG },
    };

    const titleRow = worksheet.addRow([
      `Individual Attendance Report — ${monthTitle} ${year} (exported ${reportDate})`,
    ]);
    titleRow.height = 28;
    worksheet.mergeCells(2, 1, 2, cCount);
    titleRow.getCell(1).font = { bold: true, size: 15, color: { argb: "FFFFFFFF" } };
    titleRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    titleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: DATE_HEADER_BG },
    };

    const detailText = [
      `Employee: ${employeeName}`,
      `ID: ${displayEmpId}`,
      `Branch: ${branchName}`,
      `Designation: ${designation}`,
      `Department: ${department}`,
    ].join("   |   ");
    const detailRow = worksheet.addRow([detailText]);
    detailRow.height = 24;
    worksheet.mergeCells(3, 1, 3, cCount);
    detailRow.getCell(1).font = { bold: true, size: 11, color: { argb: "FF1E293B" } };
    detailRow.getCell(1).alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
    detailRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF1F5F9" },
    };
    for (let c = 1; c <= cCount; c++) {
      detailRow.getCell(c).border = thinGrid;
    }

    const row5 = worksheet.addRow([
      "Date", "Day", "In time", "Out time", "Late min", "Status",
      "Earned Hours", "", "Overtime", "", "Expected Hours", "", "Policy #", "Shift #",
    ]);
    row5.height = 22;
    worksheet.mergeCells(4, 7, 4, 8);
    worksheet.mergeCells(4, 9, 4, 10);
    worksheet.mergeCells(4, 11, 4, 12);
    for (let c = 1; c <= cCount; c++) {
      const cell = row5.getCell(c);
      cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLUMN_HEADER_BG },
      };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = thinGrid;
    }

    const row6 = worksheet.addRow([
      "", "", "", "", "", "", "Hours", "Minutes", "Hours", "Minutes", "Hours", "Minutes", "", "",
    ]);
    row6.height = 20;
    for (let c = 1; c <= cCount; c++) {
      const cell = row6.getCell(c);
      cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLUMN_HEADER_BG },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = thinGrid;
    }

    const statusStyle = (record) => {
      const statusValue = record.Status;
      const code = (record.StatusCode || "").toUpperCase();
      const lower = String(statusValue).toLowerCase();

      if (code === "P" || lower.includes("present")) {
        return {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF00B050" } },
          font: { size: 10, color: { argb: "FFFFFFFF" }, bold: true },
        };
      }
      if (code === "A" || lower.includes("absent")) {
        return {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: ROW_FILL_WHITE } },
          font: { size: 10, color: { argb: "FFDC2626" }, bold: true },
        };
      }
      if (code === "H" || lower.includes("holiday") || lower.includes("weekly")) {
        return {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE047" } },
          font: { size: 10, color: { argb: "FF000000" }, bold: true },
        };
      }
      if (code === "MAL" || lower === "mal") {
        return {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: MAL_STATUS_FILL } },
          font: { size: 10, color: { argb: "FFFFFFFF" }, bold: true },
        };
      }
      if (
        LEAVE_ATT_LABELS.has(code) ||
        lower.includes("leave") ||
        lower.includes("monthly")
      ) {
        return {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDE047" } },
          font: { size: 10, color: { argb: "FF000000" }, bold: true },
        };
      }
      return { font: { size: 10 }, fill: undefined };
    };

    attendanceRecords.forEach((record) => {
      const row = worksheet.addRow([
        record.Date,
        record.Day,
        record["In time"],
        record["Out time"],
        record["Late min"],
        record.Status,
        record["Earned Hours"],
        record["Earned Minutes"],
        record["Overtime Hours"],
        record["Overtime Minutes"],
        record["Expected Hours"],
        record["Expected Minutes"],
        record["Policy #"],
        record["Shift #"],
      ]);
      row.height = 20;
      const st = statusStyle(record);
      row.eachCell((cell, colNumber) => {
        cell.border = thinGrid;
        cell.alignment = {
          horizontal: colNumber >= 7 && colNumber <= 12 ? "center" : "left",
          vertical: "middle",
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: ROW_FILL_WHITE },
        };
        cell.font = { size: 10, color: { argb: "FF334155" } };
        if (colNumber === 6 && st.fill) {
          cell.fill = st.fill;
          cell.font = st.font;
        } else if (colNumber === 6) {
          cell.font = st.font;
        }
      });
    });

    const safeFileEmp = String(displayEmpId || "emp").replace(/[^\w-]+/g, "_");
    const fileName = `individual_attendance_${safeFileEmp}_${year}-${String(month).padStart(2, "0")}_${new Date().toISOString().split("T")[0]}.xlsx`;

    await appendExcelSignatureRowExcelJS(worksheet, cCount);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const {
    handleViewHRPolicy,
    currentHRPolicyShow,
    viewPolicyData,
    viewPolicy,
    toggleHRPolicy,
  } = useExtraAttendanceServices();

  const {
    rawAttendanceValue,
    toggleRawAttendance,
    handleRawAttendanceLog,
    handleSearchEmpRaw,
    handleSelectRawAttendance,
    getRawAttendance,
  } = useRawAttendanceLog();

  const {
    trackPolicyValue,
    toggleTrackPolicy,
    handleTrackPolicyOpen,
    getTrackPolicy,
  } = useTrackPolicy();

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Search Filter Section */}
      <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
        <div className="flex flex-col md:flex-row gap-5 items-end justify-between">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto flex-1">
            <div className="w-full md:w-64">
              <label className="text-gray-700 text-xs font-semibold px-1 mb-1 block">
                Search Employee
              </label>
              <div className="relative employee-select-container">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <BiSearch className="text-lg" />
                    </div>
                    <input
                      type="text"
                      value={employeeSearchTerm}
                      onChange={handleEmployeeInputChange}
                      onFocus={handleEmployeeInputFocus}
                      placeholder="Name or ID"
                      className="w-full h-[42px] pl-10 pr-4 text-gray-700 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-gray-50 transition-all"
                    />
                </div>

                {/* Suggestions Dropdown */}
                {isEmployeeDropdownOpen && employeeSearchTerm && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto customScroll">
                    {filteredEmployees.length > 0 ? (
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 sticky top-0">
                          {filteredEmployees.length} result{filteredEmployees.length !== 1 ? "s" : ""}
                        </div>
                        {filteredEmployees.map((emp, index) => (
                          <div
                            key={`emp-${emp.id}-${String(emp.emp_id ?? emp.bio_id ?? "")}-${index}`}
                            className="px-4 py-2.5 hover:bg-brand-50 hover:text-brand-700 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                            onClick={() => handleEmployeeSelect(emp)}
                          >
                            <div className="text-sm font-medium">
                              {emp.name}
                              <span className="text-xs text-gray-400 ml-2 font-normal">
                                ({emp.emp_id || emp.id || emp.bio_id})
                              </span>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No employees found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-40">
              <label className="text-gray-700 text-xs font-semibold px-1 mb-1 block">
                Month
              </label>
              <CustomSelect
                placeHolderTitle="Month"
                value={searchingEmpValue.month}
                options={months?.map((month) => ({
                  value: month.id,
                  label: month.title,
                }))}
                onChangeHandler={(selectedOption) =>
                  handleSelectAttendance(selectedOption, "month")
                }
                customStyles={false}
                thinScrollbar={true}
              />
            </div>
            
            <div className="w-full md:w-32">
              <label className="text-gray-700 text-xs font-semibold px-1 mb-1 block">
                Year
              </label>
              <CustomSelect
                placeHolderTitle="Year"
                value={searchingEmpValue.year}
                options={years?.map((year) => ({ value: year, label: year }))}
                onChangeHandler={(selectedOption) =>
                  handleSelectAttendance(selectedOption, "year")
                }
                customStyles={false}
                thinScrollbar={true}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <button
                onClick={exportAttendanceToExcel}
                className="px-4 py-2.5 bg-green-50 cursor-pointer text-green-600 hover:bg-green-100 hover:text-green-700 rounded-xl text-sm font-medium transition-colors border border-green-200 flex items-center gap-2"
             >
                <span>Export Excel</span>
             </button>
             
              {showCalendar ? (
                <CustomButton title="Back to List" onClick={handleCalendarNavigation} />
              ) : (
                <CustomButton
                  title="Back"
                  onClick={() => navigate(attendanceHubPath)}
                />
              )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
          <div className="lg:col-span-8 md:col-span-8 col-span-12 bg-white rounded-2xl shadow-card border border-gray-100 p-6 min-h-[500px]">
            <Calendar
              attendanceData={attendanceData.attendanceAttr}
              data={attendanceData}
              toggleSingleAttendance={toggleSingleAttendance}
              singleDayService={singleDayService}
              updateSingleDayData={updateSingleDayData}
              onDataRefreshed={onDataRefreshed}
              daysArray={daysArray}
              handleNextMonth={handleNextMonth}
              handlePreviousMonth={handlePreviousMonth}
              getAttendanceLabel={getAttendanceLabel}
              getBackgroundColor={getBackgroundColor}
              getExtraAttribute={getExtraAttribute}
              searchingEmpValue={searchingEmpValue}
              handleSingleDayDate={handleSingleDayDate}
              addMoreInput={closeModal}
            />
          </div>
          
          <div className="lg:col-span-4 md:col-span-4 col-span-12 flex flex-col gap-6">
            {/* Attendance Summary Section */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance Details</h3>
                <AttendanceSummary attendanceData={attendanceData} />
            </div>
          </div>
      </div>

        {/* Graph and Legend as separate sections (same layout as Calendar + Attendance Details) */}
        <div className="grid grid-cols-12 gap-6">
          {/* Working Hours Graph - separate section */}
          <div className="lg:col-span-8 md:col-span-8 col-span-12 bg-white rounded-2xl shadow-card border border-gray-100 p-6 min-h-[400px]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Working Hours Analysis</h3>
                <p className="text-sm text-gray-500">Monthly breakdown of working hours vs expected hours</p>
              </div>
              <span className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold border border-brand-100">
                {searchingEmpValue?.month?.label} {searchingEmpValue?.year?.label}
              </span>
            </div>
            <div className="h-[350px] w-full">
              <MonthlyWorkingHoursChart
                attendanceData={attendanceData}
                monthLabel={searchingEmpValue?.month?.label}
              />
            </div>
          </div>

          {/* Color Legend - separate section (same pattern as Attendance Details) */}
          <div className="lg:col-span-4 md:col-span-4 col-span-12">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Legend</h3>
              <div className="grid grid-cols-2 gap-3">
                {attendanceColorData.map((ele) => (
                  <div key={ele.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <span
                      className="h-4 w-4 rounded-full shadow-sm ring-2 ring-gray-100 flex-shrink-0"
                      style={{ backgroundColor: ele.color }}
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      {ele.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {(currentHRPolicyShow.show || rawAttendanceValue.show || trackPolicyValue.show) &&
                <PortalDrawer
                    open={currentHRPolicyShow.show ? currentHRPolicyShow.show : rawAttendanceValue.show ? rawAttendanceValue.show : trackPolicyValue.show ? trackPolicyValue.show : null}
                    compo={
                        currentHRPolicyShow.show ?
                            <ViewPolicy
                                viewPolicy={viewPolicy}
                                viewPolicyData={viewPolicyData}
                            />
                            :
                            rawAttendanceValue.show ?
                                <RawAttendanceLog
                                    rawAttendanceValue={rawAttendanceValue}
                                    handleSearchEmpRaw={handleSearchEmpRaw}
                                    handleSelectRawAttendance={handleSelectRawAttendance}
                                    getRawAttendance={getRawAttendance}
                                />
                                :
                                trackPolicyValue.show ?
                                <TrackPolicy
                                    trackPolicyValue={trackPolicyValue}
                                    getTrackPolicy={getTrackPolicy}
                                />
                                :
                                null
                    }
                    title={currentHRPolicyShow.show ? 'View Policy' : rawAttendanceValue.show ? 'Raw Attendance Logs' : trackPolicyValue.show ? 'HR Policy Track' : null}
                    widthSize={currentHRPolicyShow.show ? 600 : rawAttendanceValue.show ? 1200 : trackPolicyValue.show ? 900 : null}
                    closeDrawer={currentHRPolicyShow.show ? toggleHRPolicy : rawAttendanceValue.show ? toggleRawAttendance : trackPolicyValue.show ? toggleTrackPolicy : null}

                />
            }
    </div>
  );
};

export default IndividualAttendanceReport;