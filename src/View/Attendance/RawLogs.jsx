import React, { useState, useEffect } from "react";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllMonths, getAllYears } from "../../services/__appServicesData";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { Typography } from "@material-tailwind/react";
import useStore from "../../Store/store";
import useAttendance from "../../ViewModel/AttendanceViewModel/AttendanceServices";
import { showToast } from "../../Components/Toaster/Toaster";
import attendanceApi from "../../Model/Data/Attendance/Attendance";

const tableHeader = ["Date", "Time", "Machine"];

const RawLogs = () => {
  const rawAttendanceLogParams = useStore(
    (state) => state.rawAttendanceLogParams
  );
  const {
    empListAtt,
    empSuggestionListAtt,
    rawLogsAtt,
    setRawLogsAtt,
    onChangeRaw,
    handleGetAttRawLogs,
    showTableRaw,
    setShowTableRaw,
    loading,
    setLoading,
  } = useAttendance();
  const months = getAllMonths();
  const years = getAllYears();

  // Local state for form
  const [rawAtt, setRawAtt] = useState({
    emp_Id: null,
    month: null,
    year: null,
  });

  // State for employee search
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

  // Load employees on mount
  useEffect(() => {
    empSuggestionListAtt();
  }, [empSuggestionListAtt]);

  // Initialize component with stored params on mount
  useEffect(() => {
    if (
      rawAttendanceLogParams?.empId?.value &&
      rawAttendanceLogParams?.month?.value &&
      rawAttendanceLogParams?.year?.value
    ) {
      // Initialize both local state and hook's state with stored params
      const empId = rawAttendanceLogParams.empId;
      const month = rawAttendanceLogParams.month;
      const year = rawAttendanceLogParams.year;

      // Set hook's state first using onChangeRaw (this updates the hook's internal rawAtt state)
      // Call them synchronously to ensure state is set
      onChangeRaw(empId, "emp_Id");
      onChangeRaw(month, "month");
      onChangeRaw(year, "year");

      // Also set local state for UI display
      setRawAtt({
        emp_Id: empId,
        month: month,
        year: year,
      });

      // Set employee search term for display
      if (empId?.label) {
        setEmployeeSearchTerm(empId.label);
      }

      // Fetch data automatically after state is set
      // Use a longer timeout to ensure all state updates are processed
      // The hook's state updates are async, so we need to wait
      setTimeout(() => {
        // Call the API directly with the params to avoid state timing issues
        const rawLogs = {
          empId: empId.value,
          month: month.value,
          year: year.value,
        };
        fetchRawAttendanceDirectly(rawLogs);
      }, 500);
    } else if (rawAttendanceLogParams?.empId?.value) {
      // If only empId is set, show a message
      showToast(
        "Please select month and year in the individual attendance report first.",
        "info"
      );
    } else {
      showToast(
        "No employee selected. Please view an employee's attendance first.",
        "info"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Direct API call function to avoid state timing issues
  const fetchRawAttendanceDirectly = async (rawLogs) => {
    setLoading(true);
    try {
      const response = await attendanceApi.getRawAttLogs(rawLogs);
      const data = response.data;
      if (data.STATUS === "SUCCESS") {
        // Update the hook's state directly
        setRawLogsAtt(data.DB_DATA);
        setShowTableRaw(true);
      } else {
        setRawLogsAtt([]);
        setShowTableRaw(true);
        showToast("No record found", "info");
      }
    } catch (error) {
      console.log(error);
      setRawLogsAtt([]);
      setShowTableRaw(true);
      showToast("Failed to fetch raw attendance logs", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search term (name or ID)
  const filteredEmployees = Array.isArray(empListAtt)
    ? empListAtt
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

  // Handle employee selection from search dropdown
  const handleEmployeeSelect = (employee) => {
    const empObject = { value: employee.id, label: employee.name };
    handleChangeRaw(empObject, "emp_Id");
    setEmployeeSearchTerm(employee.name);
    setIsEmployeeDropdownOpen(false);
  };

  // Handle input change for search
  const handleEmployeeInputChange = (e) => {
    const value = e.target.value;
    setEmployeeSearchTerm(value);
    setIsEmployeeDropdownOpen(true);

    // If input is cleared, clear selection
    if (!value) {
      handleChangeRaw(null, "emp_Id");
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
    if (rawAtt?.emp_Id?.label) {
      setEmployeeSearchTerm(rawAtt.emp_Id.label);
    }
  }, [rawAtt?.emp_Id]);

  // Handle form field changes
  const handleChangeRaw = (selectedOption, field) => {
    setRawAtt((prevState) => ({
      ...prevState,
      [field]: selectedOption,
    }));
    // Also update via hook for consistency
    onChangeRaw(selectedOption, field);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full lg:w-64 md:w-64">
          <label className="text-[#474747] text-[12px] font-medium px-2">
            Search Employee
          </label>
          <div className="relative employee-select-container">
            <input
              type="text"
              value={employeeSearchTerm}
              onChange={handleEmployeeInputChange}
              onFocus={handleEmployeeInputFocus}
              placeholder="Search Employee by Name or ID"
              className="w-full h-[39px] px-3 text-black shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] py-2 text-[12px] border-none outline-none rounded-[10px] bg-white text-left"
            />

            {/* Suggestions Dropdown */}
            {isEmployeeDropdownOpen && employeeSearchTerm && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredEmployees.length > 0 ? (
                  <>
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                      {filteredEmployees.length} employee
                      {filteredEmployees.length > 1 ? "s" : ""} found
                    </div>
                    {filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleEmployeeSelect(emp)}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {emp.name}
                          <span className="font-Urbanist text-[10px] text-[#474747]">
                            ({emp.emp_id || emp.id || emp.bio_id})
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    No employees found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-48 md:w-48">
          <label className="text-[#474747] text-[12px] font-medium px-2">
            Month
          </label>
          <CustomSelect
            placeHolderTitle="Month"
            value={rawAtt?.month}
            options={months.map((month) => ({
              value: month.id,
              label: month.title,
            }))}
            onChangeHandler={(selectedOption, e) =>
              handleChangeRaw(selectedOption, "month", e)
            }
            cStyle={true}
          />
        </div>

        <div className="w-full lg:w-48 md:w-48">
          <label className="text-[#474747] text-[12px] font-medium px-2">
            Year
          </label>
          <CustomSelect
            placeHolderTitle="Year"
            value={rawAtt?.year}
            options={years.map((year) => ({ value: year, label: year }))}
            onChangeHandler={(selectedOption) =>
              handleChangeRaw(selectedOption, "year")
            }
            cStyle={true}
          />
        </div>

        <div className="flex items-end justify-center lg:mt-7 md:mt-7 mt-0">
          <CustomButton
            title="Get Attendance"
            onClick={handleGetAttRawLogs}
            loading={loading}
          />
        </div>
      </div>
      <div className="mt-4 bg-white rounded-[10px] drop-shadow-md p-2">
        <div className="relative w-full overflow-auto customScroll">
          <table className="min-w-full table-fixed text-center">
            <colgroup>
              <col style={{ width: '33%' }} />
              <col style={{ width: '33%' }} />
              <col style={{ width: '33%' }} />
            </colgroup>
            <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
              <tr>
                {tableHeader.map((head, i) => (
                  <th key={i} className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                    <Typography
                      // variant="small"
                      // color='blue-gray'
                      className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {showTableRaw && rawLogsAtt?.attendance?.length > 0 ? (
                rawLogsAtt.attendance?.map((ele, index) => {
                  const isLast = index === rawLogsAtt.length - 1;
                  const classes = isLast
                    ? "px-[clamp(4px,0.8vw,12px)] py-4"
                    : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";
                  return (
                    <tr key={ele.id || index}>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {ele.day}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {ele.time}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {ele.device}
                        </Typography>
                      </td>
                    </tr>
                  );
                })
              ) : <tr>
                <td colSpan={tableHeader.length} className="p-6 text-center">
                  <span className="font-Urbanist text-[12px] text-[#474747]">
                    No record found
                  </span>
                </td>
              </tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RawLogs;