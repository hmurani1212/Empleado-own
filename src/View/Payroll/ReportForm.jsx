import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@material-tailwind/react";
import { FaTimes } from "react-icons/fa";
import useStore from "../../Store/store";
import { gettingDepartmentsServices } from "../../services/__frequentApiServices";
import { showToast } from "../../Components/Toaster/Toaster";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import employeesApi from "../../Model/Data/Employees/Employees";

const ALL_BRANCHES_OPTION = { value: 0, label: "All Branches" };
const ALL_DEPARTMENTS_OPTION = { value: 0, label: "All Departments" };

const ReportForm = ({ reportType, onClose }) => {
  const [formData, setFormData] = useState({
    branch_id: null,
    department_id: null,
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPayslipSection, setShowPayslipSection] = useState(false);
  const [payslipData, setPayslipData] = useState({
    employeeSearch: "",
    selectedEmployee: null,
    timeFilter: null,
    selectedYear: null,
    selectedMonth: null,
    startDate: "",
    endDate: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [hasRecords, setHasRecords] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [searchingEmployees, setSearchingEmployees] = useState(false);

  // Get branches from store
  const branches_payroll = useStore((state) => state.branches_payroll);
  const getAllBranchesPayroll = useStore(
    (state) => state.getAllBranchesPayroll
  );

  // Get report generation methods from store
  const generatePayrollReport = useStore(
    (state) => state.generatePayrollReport
  );
  const generateIncomeTaxReport = useStore(
    (state) => state.generateIncomeTaxReport
  );

  // Frontend employee search function (no API call)
  const searchEmployees = useCallback(
    (searchText) => {
      if (!searchText || searchText.length < 1) {
        setEmployeeSearchResults([]);
        return;
      }

      if (!formData.branch_id) {
        showToast("Please select a branch first", "error");
        return;
      }

      // Filter from existing reportData (all employees already loaded)
      const allEmployees = reportData || [];

      // Filter employees whose names start with the search text
      const filteredEmployees = allEmployees.filter((emp) =>
        (emp.name || emp.employee_name || emp.full_name || "")
          .toLowerCase()
          .startsWith(searchText.toLowerCase())
      );

      console.log(
        "🔍 Frontend filtered employees (name starts with):",
        filteredEmployees
      );

      setEmployeeSearchResults(filteredEmployees);
    },
    [formData.branch_id, reportData]
  );

  // Debounce the search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchText) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => searchEmployees(searchText), 100); // Reduced delay since it's frontend only
      };
    })(),
    [searchEmployees]
  );

  // Time filter options
  const timeFilterOptions = [
    { value: "time_filter", label: "Time Filter" },
    { value: "specific_month", label: "Specific Month" },
    { value: "time_frame", label: "Time Frame" },
  ];

  // Year options (last 10 years)
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: year.toString() };
  });

  // Month options
  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Load branches on component mount
  useEffect(() => {
    if (branches_payroll.length === 0) {
      getAllBranchesPayroll();
    }
  }, []);

  // Handle branch selection
  const handleBranchChange = async (selectedBranch) => {
    setFormData((prev) => ({
      ...prev,
      branch_id: selectedBranch,
      department_id: null, // Reset department when branch changes
    }));

    setDepartments([]); // Clear departments

    if (selectedBranch) {
      try {
        setLoading(true);
        const deptData = await gettingDepartmentsServices(selectedBranch.value);
        const deptOptions = Array.isArray(deptData) ? deptData : [];
        setDepartments([ALL_DEPARTMENTS_OPTION, ...deptOptions]);
      } catch (error) {
        console.error("Error fetching departments:", error);
        showToast("Error loading departments", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle department selection
  const handleDepartmentChange = (selectedDepartment) => {
    setFormData((prev) => ({
      ...prev,
      department_id: selectedDepartment,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.branch_id) {
      showToast("Please select a branch", "error");
      return;
    }

    if (!formData.department_id) {
      showToast("Please select a department", "error");
      return;
    }

    setErrorMessage("");
    setIsLoadingReport(true);
    setReportData([]);
    setHasRecords(false);

    try {
      const requestData = {
        branch_id: formData.branch_id?.value ?? 0,
        dept_id: formData.department_id?.value ?? 0,
        ...(payslipData.timeFilter?.value && {
          time_duration_filter: payslipData.timeFilter.value,
        }),
        ...(payslipData.selectedYear?.value && {
          year: payslipData.selectedYear.value,
        }),
        ...(payslipData.selectedMonth?.value && {
          month: payslipData.selectedMonth.value,
        }),
        ...(payslipData.startDate && { time1: payslipData.startDate }),
        ...(payslipData.endDate && { time2: payslipData.endDate }),
      };

      // Use specific method for Income Tax reports, generic method for others
      const result =
        reportType === "Income Tax"
          ? await generateIncomeTaxReport(requestData)
          : await generatePayrollReport(reportType, requestData);

      if (result && result.success && result.data) {
        setReportData(result.data);
        setHasRecords(result.data.length > 0);
        showToast(`${reportType} report generated successfully`, "success");

        // Show the payslip section for further processing
        setShowPayslipSection(true);
        setErrorMessage("");
      } else {
        setReportData([]);
        setHasRecords(false);
        const errorMsg =
          result.error || `Failed to generate ${reportType} report`;
        showToast(errorMsg, "error");
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setReportData([]);
      setHasRecords(false);
      const errorMsg = "Error generating report";
      showToast(errorMsg, "error");
      setErrorMessage(errorMsg);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Handle payslip section close
  const handleClosePayslipSection = () => {
    setShowPayslipSection(false);
    setPayslipData({
      employeeSearch: "",
      selectedEmployee: null,
      timeFilter: null,
      selectedYear: null,
      selectedMonth: null,
      startDate: "",
      endDate: "",
    });
    setErrorMessage("");
    setHasRecords(false);
    setIsSearching(false);
  };

  // Handle time filter change
  const handleTimeFilterChange = (selectedOption) => {
    setPayslipData((prev) => ({
      ...prev,
      timeFilter: selectedOption,
      // Reset other fields when time filter changes
      selectedYear: null,
      selectedMonth: null,
      startDate: "",
      endDate: "",
    }));

    // Reset records state when time filter changes
    setHasRecords(null);

    // Auto-trigger search if we have basic filters
    if (formData.branch_id && formData.department_id) {
      setTimeout(() => handleSearch(), 100);
    }
  };

  // Handle year selection
  const handleYearChange = (selectedOption) => {
    setPayslipData((prev) => ({
      ...prev,
      selectedYear: selectedOption,
    }));

    // Auto-trigger search if we have basic filters
    if (formData.branch_id && formData.department_id) {
      setTimeout(() => handleSearch(), 100);
    }
  };

  // Handle month selection
  const handleMonthChange = (selectedOption) => {
    setPayslipData((prev) => ({
      ...prev,
      selectedMonth: selectedOption,
    }));

    // Auto-trigger search if we have basic filters
    if (formData.branch_id && formData.department_id) {
      setTimeout(() => handleSearch(), 100);
    }
  };

  // Handle start date change
  const handleStartDateChange = (e) => {
    setPayslipData((prev) => ({
      ...prev,
      startDate: e.target.value,
    }));

    // Auto-trigger search if we have basic filters
    if (formData.branch_id && formData.department_id) {
      setTimeout(() => handleSearch(), 100);
    }
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    setPayslipData((prev) => ({
      ...prev,
      endDate: e.target.value,
    }));

    // Auto-trigger search if we have basic filters
    if (formData.branch_id && formData.department_id) {
      setTimeout(() => handleSearch(), 100);
    }
  };

  // Handle employee search input change
  const handleEmployeeSearchChange = (e) => {
    const value = e.target.value;
    setPayslipData((prev) => ({
      ...prev,
      employeeSearch: value,
      selectedEmployee: null, // Reset selected employee when typing
    }));

    // Clear search results when input is cleared
    if (value === "") {
      console.log("🔍 Search cleared - showing all data");
      setEmployeeSearchResults([]);
      // No need to call API - just clear search results and show all data
      return;
    }

    // Trigger debounced search for employee suggestions (frontend only)
    debouncedSearch(value);
  };

  // Handle search action (search for records based on selected filters)
  const handleSearch = async () => {
    // Clear error message
    setErrorMessage("");
    setIsSearching(true);

    try {
      // Frontend search is handled separately, so we always do the normal report search

      // Original report search logic
      const searchData = {
        branch_id: formData.branch_id?.value || 0,
        dept_id: formData.department_id?.value || 0,
        time_duration_filter: payslipData.timeFilter?.value || "month",
        ...(payslipData.selectedYear?.value && {
          year: payslipData.selectedYear.value,
        }),
        ...(payslipData.selectedMonth?.value && {
          month: payslipData.selectedMonth.value,
        }),
        ...(payslipData.startDate && { time1: payslipData.startDate }),
        ...(payslipData.endDate && { time2: payslipData.endDate }),
        ...(payslipData.employeeSearch &&
          payslipData.employeeSearch.length > 0 && {
            emp_id: payslipData.employeeSearch,
          }),
      };

      console.log("🔍 Search Data:", searchData);

      // Use specific method for Income Tax reports, generic method for others
      const result =
        reportType === "Income Tax"
          ? await generateIncomeTaxReport(searchData)
          : await generatePayrollReport(reportType, searchData);

      if (result && result.success && result.data) {
        setReportData(result.data);
        setHasRecords(result.data.length > 0);
      } else {
        setReportData([]);
        setHasRecords(false);
      }
    } catch (error) {
      console.error("Error searching records:", error);
      setReportData([]);
      setHasRecords(false);
      showToast("Error searching for records", "error");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle print action
  const handlePrint = () => {
    const printContent = document.getElementById("print-content");
    if (printContent) {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>${reportType} Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                font-size: 12px;
              }
              th, td {
                border: 1px solid #333;
                padding: 8px;
                text-align: left;
                vertical-align: top;
              }
              th {
                background-color: #f5f5f5;
                font-weight: bold;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .no-data {
                text-align: center;
                margin: 60px 0;
                color: #666;
                font-size: 18px;
                font-weight: bold;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 15px;
                }
                table {
                  font-size: 11px;
                }
                th, td {
                  padding: 6px;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();

      // Wait a bit for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // Handle export action
  const handleExport = () => {
    if (!hasRecords || !reportData || reportData.length === 0) {
      showToast("No records to export", "error");
      return;
    }

    try {
      // Import xlsx dynamically
      import("xlsx")
        .then((XLSX) => {
          // Prepare data for Excel
          const excelData = reportData.map((item, index) => ({
            "S.No": index + 1,
            Name: item.name || item.employee_name || item.full_name || "-",
            "Father Name":
              item.f_name || item.father_name || item.fatherName || "-",
            Designation:
              item.designation ||
              item.employee_designation ||
              item.position ||
              "-",
            Amount:
              item.amount ||
              item.tax_amount ||
              item.total_amount ||
              item.salary ||
              "0",
          }));

          // Create workbook and worksheet
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(excelData);

          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(wb, ws, `${reportType} Report`);

          // Generate filename
          const timestamp = new Date().toISOString().split("T")[0];
          const filename = `${reportType}_Report_${timestamp}.xlsx`;

          // Save file
          XLSX.writeFile(wb, filename);

          showToast(`${reportType} report exported successfully`, "success");
        })
        .catch((error) => {
          console.error("Error exporting Excel file:", error);
          showToast("Error exporting file", "error");
        });
    } catch (error) {
      console.error("Error in export function:", error);
      showToast("Error exporting file", "error");
    }
  };

  return (
    <>
      {/* Hidden Print Content */}
      <div id="print-content" className="hidden">
        {hasRecords && reportData.length > 0 ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #333",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  S.No
                </th>
                <th
                  style={{
                    border: "1px solid #333",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    border: "1px solid #333",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  Father Name
                </th>
                <th
                  style={{
                    border: "1px solid #333",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  Designation
                </th>
                <th
                  style={{
                    border: "1px solid #333",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #333", padding: "8px" }}>
                    {index + 1}
                  </td>
                  <td style={{ border: "1px solid #333", padding: "8px" }}>
                    {item.name || item.employee_name || item.full_name || "-"}
                  </td>
                  <td style={{ border: "1px solid #333", padding: "8px" }}>
                    {item.f_name || item.father_name || item.fatherName || "-"}
                  </td>
                  <td style={{ border: "1px solid #333", padding: "8px" }}>
                    {item.designation ||
                      item.employee_designation ||
                      item.position ||
                      "-"}
                  </td>
                  <td style={{ border: "1px solid #333", padding: "8px" }}>
                    {item.amount ||
                      item.tax_amount ||
                      item.total_amount ||
                      item.salary ||
                      "0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            style={{
              textAlign: "center",
              margin: "60px 0",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            No Record Found
          </div>
        )}
      </div>

      <div className="mt-8">
        {/* Header */}
        <div className="">
          <h2 className="text-[18px] font-semibold text-[#474747]">
            {reportType}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="flex flex-wrap gap-4">
            {/* Branch Selection */}
            <div className="w-full lg:w-80 md:w-80">
              <label className="text-[#474747] text-[12px] font-medium px-2">
                Branch
              </label>
              <CustomSelect
                placeHolderTitle="Branch"
                value={formData.branch_id}
                options={[
                  ALL_BRANCHES_OPTION,
                  ...(branches_payroll?.map((branch) => ({
                    value: branch.id,
                    label: branch.branch_name,
                  })) || []),
                ]}
                onChangeHandler={handleBranchChange}
                customStyles={true}
                isSearchable={true}
                isClearable={false}
              />
            </div>

            {/* Department Selection */}
            <div className="w-full lg:w-80 md:w-80">
              <label className="text-[#474747] text-[12px] font-medium px-2">
                Department
              </label>
              <CustomSelect
                placeHolderTitle="Department"
                value={formData.department_id}
                options={departments}
                onChangeHandler={handleDepartmentChange}
                className="rounded-[10px]"
                cStyle={true}
                isSearchable={true}
                isClearable={false}
                disabled={!formData.branch_id || loading}
              />
              {loading && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading departments...
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={
                  loading || !formData.branch_id || !formData.department_id
                }
                className="bg-bgBlue hover:bg-blue-700 text-white font-medium px-6 h-fit rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Submit"}
              </Button>
            </div>
          </div>
        </form>

        {/* Filter Section */}
        {showPayslipSection && (
          <div className="mt-6 border-t border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {reportType}
              </h3>
              <button
                onClick={handleClosePayslipSection}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 bg-gray-300 rounded-md transition-colors"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {/* Search Fields in Flex */}
              <div className="flex flex-wrap items-end gap-3">
                {/* Search Employee Input */}
                <div className="w-full lg:w-64 md:w-64">
                  <label className="text-[#474747] text-[12px] font-medium px-2">
                    Search employee by ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search employee by ID or name..."
                      value={payslipData.employeeSearch}
                      onChange={handleEmployeeSearchChange}
                      className="w-full h-[39px] px-3 text-black shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] py-2 text-[12px] border-none outline-none rounded-[10px] bg-white text-left"
                      disabled={!formData.branch_id}
                    />

                    {/* Loading indicator */}
                    {searchingEmployees && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Filter */}
                <div className="w-full lg:w-48 md:w-48">
                  <label className="text-[#474747] text-[12px] font-medium px-2">
                    Time Filter
                  </label>
                  <CustomSelect
                    placeHolderTitle="Select time filter"
                    value={payslipData.timeFilter}
                    options={timeFilterOptions}
                    onChangeHandler={handleTimeFilterChange}
                    customStyles={false}
                    isSearchable={true}
                    isClearable={false}
                  />
                </div>

                {/* Print Button */}
                <div>
                  <Button
                    onClick={handlePrint}
                    disabled={!hasRecords}
                    className="bg-bgBlue hover:bg-blue-700 text-white font-medium px-4 py-2 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Print
                  </Button>
                </div>

                {/* Export Button */}
                <div>
                  <Button
                    onClick={handleExport}
                    disabled={!hasRecords}
                    className="bg-green-600 hover:bg-green-700 font-medium text-white px-4 py-2 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export
                  </Button>
                </div>
              </div>

              {/* Conditional Fields Based on Time Filter Selection */}
              {payslipData.timeFilter?.value === "specific_month" && (
                <div className="flex items-end gap-3">
                  {/* Year Selection */}
                  <div className="w-full lg:w-36 md:w-36">
                    <label className="text-[#474747] text-[12px] font-medium px-2">
                      Year
                    </label>
                    <CustomSelect
                      placeHolderTitle="Select Year"
                      value={payslipData.selectedYear}
                      options={yearOptions}
                      onChangeHandler={handleYearChange}
                      customStyles={false}
                      isSearchable={true}
                      isClearable={false}
                    />
                  </div>

                  {/* Month Selection */}
                  <div className="w-full lg:w-36 md:w-36">
                    <label className="text-[#474747] text-[12px] font-medium px-2">
                      Month
                    </label>
                    <CustomSelect
                      placeHolderTitle="Select Month"
                      value={payslipData.selectedMonth}
                      options={monthOptions}
                      onChangeHandler={handleMonthChange}
                      customStyles={false}
                      isSearchable={true}
                      isClearable={false}
                    />
                  </div>
                </div>
              )}

              {payslipData.timeFilter?.value === "time_frame" && (
                <div className="flex items-end gap-3">
                  {/* Start Date */}
                  <div className="w-full lg:w-40 md:w-40">
                    <label className="text-[#474747] text-[12px] font-medium">
                      Start Date
                    </label>
                    <input
                      type="date"
                      placeholder="Start Date"
                      value={payslipData.startDate}
                      onChange={handleStartDateChange}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* End Date */}
                  <div className="w-full lg:w-40 md:w-40">
                    <label className="text-[#474747] text-[12px] font-medium">
                      End Date
                    </label>
                    <input
                      type="date"
                      placeholder="End Date"
                      value={payslipData.endDate}
                      onChange={handleEndDateChange}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Results Section */}
              {!isSearching && hasRecords !== null && (
                <div className="mt-4">
                  {(
                    payslipData.employeeSearch &&
                    payslipData.employeeSearch.length > 0
                      ? employeeSearchResults.length > 0
                      : hasRecords
                  ) ? (
                    <div>
                      {/* Actual Data Table */}
                      <div className="mt-4 overflow-x-auto bg-white p-2 rounded-[10px] drop-shadow-md">
                        <table className="w-full text-center h-full text-[12px]">
                          <thead className="rounded-[8px] bg-[#F8F9FA] text-center">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium text-[#474747] capitalize text-[14px] font-Urbanist text-center">
                                S.No
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-[#474747] capitalize text-[14px] font-Urbanist text-center">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-[#474747] capitalize text-[14px] font-Urbanist text-center">
                                Father Name
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-[#474747] capitalize text-[14px] font-Urbanist text-center">
                                Designation
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-[#474747] capitalize text-[14px] font-Urbanist text-center">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {(() => {
                              const displayData =
                                payslipData.employeeSearch &&
                                payslipData.employeeSearch.length > 0 &&
                                employeeSearchResults.length > 0
                                  ? employeeSearchResults
                                  : reportData;
                              return displayData;
                            })().map((item, index) => (
                              <tr key={index} className="">
                                <td className="px-4 py-2 text-[14px] text-[#474747] font-normal font-Urbanist">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-2 text-[14px] text-[#474747] font-normal font-Urbanist">
                                  {item.name ||
                                    item.employee_name ||
                                    item.full_name ||
                                    "-"}
                                </td>
                                <td className="px-4 py-2 text-[14px] text-[#474747] font-normal font-Urbanist">
                                  {item.f_name ||
                                    item.father_name ||
                                    item.fatherName ||
                                    "-"}
                                </td>
                                <td className="px-4 py-2 text-[14px] text-[#474747] font-normal font-Urbanist">
                                  {item.designation ||
                                    item.employee_designation ||
                                    item.position ||
                                    "-"}
                                </td>
                                <td className="px-4 py-2 text-[14px] text-[#474747] font-normal font-Urbanist">
                                  {item.amount ||
                                    item.tax_amount ||
                                    item.total_amount ||
                                    item.salary ||
                                    "0"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-black">
                      <p className="text-[12px] font-medium text-[#474747]">
                        No Record Found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="text-red-600 text-sm mt-2">{errorMessage}</div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ReportForm;