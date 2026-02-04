import React, { useEffect, useState } from "react";
import Calendar from "../../Components/Calendar/Calendar";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { motion } from "framer-motion";
import { getUserData } from "../../Authentication/jwt_decode";
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
import { useNavigate } from "react-router";
import MonthlyWorkingHoursChart from "./MonthlyWorkingHoursChart";
import { Card, CardBody } from "@material-tailwind/react";
import { attendanceColorData } from "../../services/__attendanceServices";
import { BiSearch } from "react-icons/bi";

// Using ExcelJS for styling support (colors, fonts, etc.)

const IndividualAttendanceReport = () => {
  const navigate = useNavigate();
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

          return (
            empName.includes(search) ||
            empId.includes(search) ||
            empBioId.includes(search) ||
            empEmpId.includes(search)
          );
        })
        .sort((a, b) => {
          const search = employeeSearchTerm.toLowerCase();

          const getRank = (emp) => {
            const values = [
              String(emp.id || ""),
              String(emp.emp_id || ""),
              String(emp.bio_id || ""),
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

  useEffect(() => {
    console.log("filteredEmployees", filteredEmployees);
  }, [filteredEmployees]);

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

  // Export Attendance to Excel - Using ExcelJS for styling support
  const exportAttendanceToExcel = async () => {
    if (
      !searchingEmpValue?.empId ||
      !attendanceData?.attendanceAttr?.attendance ||
      attendanceData.attendanceAttr.attendance.length === 0
    ) {
      alert("Please select an employee and ensure attendance data is loaded");
      return;
    }

    // Import ExcelJS dynamically
    const ExcelJS = (await import("exceljs")).default;

    const userData = getUserData();
    const selectedEmployee = searchingEmpValue.empList?.find(
      (emp) => emp.id === searchingEmpValue.empId.value
    );
    const year = searchingEmpValue.year?.label || new Date().getFullYear();
    const month = searchingEmpValue.month?.value || new Date().getMonth() + 1;

    // Get employee details
    const employeeName = selectedEmployee?.name || "N/A";
    const employeeId =
      selectedEmployee?.id ||
      selectedEmployee?.emp_id ||
      selectedEmployee?.employee_id ||
      "";
    const branchName =
      selectedEmployee?.branch?.branch_name ||
      attendanceData?.branch ||
      attendanceData?.branch_name ||
      "N/A";
    const designation =
      selectedEmployee?.designation?.title ||
      selectedEmployee?.designation ||
      attendanceData?.designation?.title ||
      attendanceData?.designation ||
      "N/A";
    const department =
      selectedEmployee?.department?.name ||
      selectedEmployee?.department ||
      attendanceData?.department?.name ||
      attendanceData?.department ||
      "N/A";

    // Helper function to convert seconds to hours and minutes
    const secondsToHoursMinutesObj = (seconds) => {
      if (!seconds) return { hours: 0, minutes: 0 };
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return { hours, minutes };
    };

    // Helper function to convert timestamp to time string
    const timestampToTime = (timestamp) => {
      if (!timestamp) return "";
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Helper function to get day name from date string
    const getDayName = (dateString) => {
      const [day, month, year] = dateString.split("-");
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", { weekday: "short" });
    };

    // Prepare data for Excel
    const attendanceRecords = (
      attendanceData.attendanceAttr.attendance || []
    ).map((record) => {
      const earned = secondsToHoursMinutesObj(record.earned);
      const expected = secondsToHoursMinutesObj(record.expected);
      const overtime = secondsToHoursMinutesObj(record.overtime);
      const inTime =
        record.timings && record.timings[0]
          ? timestampToTime(record.timings[0])
          : "";
      const outTime =
        record.timings && record.timings[1]
          ? timestampToTime(record.timings[1])
          : "";

      // Map status codes to full words
      let statusText = record.att_label || "";
      const statusCode = statusText.toUpperCase().trim();

      // Convert single letter codes to full words
      if (statusCode === "P" || statusCode === "PRESENT") {
        statusText = "Present";
      } else if (statusCode === "A" || statusCode === "ABSENT") {
        statusText = "Absent";
      } else if (
        statusCode === "H" ||
        statusCode === "HOLIDAY" ||
        statusText.toLowerCase().includes("holiday")
      ) {
        statusText = "Holiday";
      }

      return {
        Date: record.date_string,
        Day: getDayName(record.date_string),
        "In time": inTime,
        "Out time": outTime,
        "Late min": record.late_minutes || "",
        Status: statusText,
        StatusCode: statusCode,
        "Earned Hours": earned.hours,
        "Earned Minutes": earned.minutes,
        "Overtime Hours": overtime.hours,
        "Overtime Minutes": overtime.minutes,
        "Expected Hours": expected.hours,
        "Expected Minutes": expected.minutes,
        "Policy #": record.policy || "",
        "Shift #": record.shift || "",
      };
    });

    // Create workbook and worksheet using ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    // Set column widths
    worksheet.columns = [
      { width: 12 }, // A - Date
      { width: 8 }, // B - Day
      { width: 10 }, // C - In time
      { width: 10 }, // D - Out time
      { width: 10 }, // E - Late min
      { width: 12 }, // F - Status
      { width: 8 }, // G - Hours
      { width: 8 }, // H - Minutes
      { width: 8 }, // I - Hours
      { width: 8 }, // J - Minutes
      { width: 8 }, // K - Hours
      { width: 8 }, // L - Minutes
      { width: 10 }, // M - Policy #
      { width: 10 }, // N - Shift #
    ];

    // Excel formatting logic here (kept as is from original file)
    // Row 1: Organization name
    const row1 = worksheet.addRow([
      `Organization: ${userData.org_name || "Testing_Hassan"}`, "", "", "", "", "", "", "", "", "", "", "", "", ""
    ]);
    row1.height = 30;
    worksheet.mergeCells("A1:J1");
    row1.getCell(1).font = { bold: true, size: 25 };
    row1.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

    // Row 2: Branch name
    const row2 = worksheet.addRow([branchName, "", "", "", "", "", "", "", "", "", "", "", "", ""]);
    row2.height = 22;
    worksheet.mergeCells("A2:J2");
    row2.getCell(1).font = { bold: true, size: 14 };
    row2.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

    // Row 3: Report period
    const row3 = worksheet.addRow([`For the month ${month}/${year}`, "", "", "", "", "", "", "", "", "", "", "", "", ""]);
    row3.height = 22;
    worksheet.mergeCells("A3:J3");
    row3.getCell(1).font = { bold: true, size: 14 };
    row3.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

    // Row 4: Employee details
    const row4 = worksheet.addRow([
      `${employeeName}  ${employeeId}`, "", "", "", branchName, "", "", `Designation: ${designation}`, "", "", `Department: ${department}`, "", "", ""
    ]);
    row4.height = 22;
    worksheet.mergeCells("A4:D4");
    worksheet.mergeCells("E4:G4");
    worksheet.mergeCells("H4:J4");
    worksheet.mergeCells("K4:M4");
    row4.font = { bold: true, size: 11 };
    row4.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
    row4.alignment = { horizontal: "left", vertical: "middle" };
    row4.eachCell((cell) => {
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });

    // Row 5: Main headers
    const row5 = worksheet.addRow([
      "Date", "Day", "In time", "Out time", "Late min", "Status", "Earned Hours", "", "Overtime", "", "Expected Hours", "", "Policy #", "Shift #"
    ]);
    row5.height = 25;
    worksheet.mergeCells("G5:H5");
    worksheet.mergeCells("I5:J5");
    worksheet.mergeCells("K5:L5");
    row5.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    row5.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF808080" } };
    row5.alignment = { horizontal: "center", vertical: "middle" };
    row5.eachCell((cell) => {
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });

    // Row 6: Sub headers
    const row6 = worksheet.addRow(["", "", "", "", "", "", "Hours", "Minutes", "Hours", "Minutes", "Hours", "Minutes", "", ""]);
    row6.height = 20;
    row6.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    row6.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF808080" } };
    row6.alignment = { horizontal: "center", vertical: "middle" };
    row6.eachCell((cell) => {
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });

    // Add data rows (Row 7 onwards)
    attendanceRecords.forEach((record) => {
      const row = worksheet.addRow([
        record["Date"], record["Day"], record["In time"], record["Out time"], record["Late min"],
        record["Status"], record["Earned Hours"], record["Earned Minutes"], record["Overtime Hours"],
        record["Overtime Minutes"], record["Expected Hours"], record["Expected Minutes"], record["Policy #"], record["Shift #"]
      ]);
      row.height = 18;

      row.eachCell((cell, colNumber) => {
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
        cell.alignment = { horizontal: colNumber >= 7 && colNumber <= 12 ? "center" : "left", vertical: "middle" };
        cell.font = { size: 10 };

        if (colNumber === 6) {
          const statusValue = record["Status"];
          const statusCode = record["StatusCode"] || "";

          if (statusCode === "P" || statusValue.toLowerCase().includes("present")) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF00B050" } };
            cell.font = { size: 10, color: { argb: "FFFFFFFF" }, bold: true };
          } else if (statusCode === "A" || statusValue.toLowerCase().includes("absent")) {
            cell.font = { size: 10, color: { argb: "FFFF0000" }, bold: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
          } else if (statusCode === "H" || statusValue.toLowerCase().includes("holiday") || statusValue.toLowerCase().includes("weekly")) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };
            cell.font = { size: 10, color: { argb: "FF000000" }, bold: true };
          } else if (statusValue && (statusValue.toLowerCase().includes("monthly") || statusValue.toLowerCase().includes("leave"))) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };
            cell.font = { size: 10, color: { argb: "FF000000" }, bold: true };
          }
        }
      });
    });

    // Generate filename
    const now = new Date();
    const fileName = `Att_Report_${year}-${String(month).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}_${String(now.getMinutes()).padStart(2, "0")} am.xlsx`;

    // Save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
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
                        {filteredEmployees.map((emp) => (
                          <div
                            key={emp.id}
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
                className="px-4 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-xl text-sm font-medium transition-colors border border-green-200 flex items-center gap-2"
             >
                <span>Export Excel</span>
             </button>
             
              {showCalendar ? (
                <CustomButton title="Back to List" onClick={handleCalendarNavigation} />
              ) : (
                <CustomButton
                  title="Back"
                  onClick={() => navigate("/attendance")}
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

            {/* Color Legend */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Legend</h3>
                <div className="grid grid-cols-2 gap-3">
                    {attendanceColorData.map((ele) => (
                      <div key={ele.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <span
                          className="h-4 w-4 rounded-full shadow-sm ring-2 ring-gray-100"
                          style={{ backgroundColor: ele.color }}
                        ></span>
                        <span className="text-sm text-gray-600 font-medium">
                          {ele.title}
                        </span>
                      </div>
                    ))}
                </div>
            </div>
          </div>
      </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Monthly Working Hours Graph */}
          <div className="col-span-12 bg-white rounded-2xl shadow-card border border-gray-100 p-6">
               <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Working Hours Analysis</h3>
                        <p className="text-sm text-gray-500">Monthly breakdown of working hours vs expected hours</p>
                    </div>
                    <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold border border-brand-100">
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