import React, { useState, useEffect } from "react";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllMonths, getAllYears } from "../../services/__appServicesData";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { Typography } from "@material-tailwind/react";

const tableHeader = ["Date", "Time", "Machine"];

const RawAttendanceLog = (props) => {
  const {
    rawAttendanceValue,
    handleSearchEmpRaw,
    handleSelectRawAttendance,
    getRawAttendance,
    loading,
  } = props;
  const months = getAllMonths();
  const years = getAllYears();

  // State for employee search
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Update search term when employee is selected
  useEffect(() => {
    if (rawAttendanceValue?.empId?.label) {
      setEmployeeSearchTerm(rawAttendanceValue.empId.label);
    }
  }, [rawAttendanceValue?.empId]);

  // Handle employee search input
  const handleEmployeeSearch = (e) => {
    const value = e.target.value;
    setEmployeeSearchTerm(value);
    setShowSuggestions(true);

    if (!value || value.trim() === "") {
      setFilteredEmployees([]);
      handleSelectRawAttendance(null, "empId");
      return;
    }

    // Filter employees by name or ID
    const searchLower = value.toLowerCase();
    const filtered = (rawAttendanceValue?.empList || []).filter((emp) => {
      const empName = (emp.name || "").toLowerCase();
      const empId = String(emp.id || emp.emp_id || emp.employee_id || "");
      return empName.includes(searchLower) || empId.includes(value);
    });

    setFilteredEmployees(filtered);
  };

  // Handle selecting an employee from suggestions
  const handleSelectEmployee = (employee) => {
    const selectedEmployee = { value: employee.id, label: employee.name };
    handleSelectRawAttendance(selectedEmployee, "empId");
    setEmployeeSearchTerm(employee.name);
    setShowSuggestions(false);
    setFilteredEmployees([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".employee-search-container")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="space-y-2 w-64">
          <label className="text-[#698592] text-[12px]">Employee</label>
          <div className="relative employee-search-container">
            <input
              type="text"
              value={employeeSearchTerm}
              onChange={handleEmployeeSearch}
              onFocus={() => {
                if (filteredEmployees.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Search Employee by Name or ID"
              className="w-full h-9 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredEmployees.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                  {filteredEmployees.length} employee
                  {filteredEmployees.length > 1 ? "s" : ""} found
                </div>
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSelectEmployee(emp)}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {emp.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {emp.id || emp.emp_id || emp.employee_id}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No results message */}
            {showSuggestions &&
              employeeSearchTerm &&
              filteredEmployees.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    No employees found
                  </div>
                </div>
              )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[#698592] text-[12px]">Month</label>
          <CustomSelect
            placeHolderTitle="Month"
            value={rawAttendanceValue.month}
            options={months?.map((month) => ({
              value: month.id,
              label: month.title,
            }))}
            onChangeHandler={(selectedOption) =>
              handleSelectRawAttendance(selectedOption, "month")
            }
            customStyles={false}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[#698592] text-[12px]">Year</label>
          <CustomSelect
            placeHolderTitle="Year"
            value={rawAttendanceValue.year}
            options={years?.map((year) => ({ value: year, label: year }))}
            onChangeHandler={(selectedOption) =>
              handleSelectRawAttendance(selectedOption, "year")
            }
            customStyles={false}
          />
        </div>
        <div className="flex items-end justify-center mt-7">
          <CustomButton
            loading={loading}
            title="Get Attendance"
            onClick={getRawAttendance}
            // loading={rawAttendanceValue.loading}
          />
        </div>
      </div>
      <div className="mt-4 bg-white rounded-[10px] drop-shadow-md p-2">
        <div className="max-h-[calc(100vh-100px)] overflow-auto customScroll">
          {rawAttendanceValue?.rawAttendanceData?.attendance?.length > 0 ? (
            <table className="w-full text-center h-full">
              <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  {tableHeader?.map((head, i) => (
                    <th key={i} className="bg-[#F2F2F9] p-4">
                      <Typography
                        // variant="small"
                        // color="blue-gray"
                        className="font-medium leading-none font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] capitalize"
                      >
                        {/* {head} */}
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawAttendanceValue?.rawAttendanceData?.attendance?.map(
                  (ele, index) => {
                    const isLast =
                      index ===
                      rawAttendanceValue?.rawAttendanceData?.attendance
                        ?.length -
                        1;
                    const classes = isLast
                      ? "p-4"
                      : "p-4 border-b border-[#F2F2F9]";

                    return (
                      <tr key={index} className="text-[#474747]">
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal font-Urbanist text-[clamp(12px,0.9vw,14px)] text-[#474747]"
                          >
                            {ele.day}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal font-Urbanist text-[clamp(12px,0.9vw,14px)] text-[#474747]"
                          >
                            {ele.time}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal font-Urbanist text-[clamp(12px,0.9vw,14px)] text-[#474747]"
                          >
                            {ele.device}
                          </Typography>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          ) : (
            <div>
              <span>No attendance record found.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RawAttendanceLog;