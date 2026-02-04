import React, { useEffect, useState } from "react";
import useAttendance from "../../ViewModel/AttendanceViewModel/AttendanceServices";
import CustomButton from "../../Components/CustomButton/CustomButton";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllMonths, getAllYears } from "../../services/__appServicesData";
import { Progress, Typography } from "@material-tailwind/react";
import { convertSecondsToTime } from "../../services/__attendanceServices";
import employeesApi from "../../Model/Data/Employees/Employees";
import { showToast } from "../../Components/Toaster/Toaster";
import * as XLSX from 'xlsx';

const BranchWiseListReporting = () => {
  const {
    backNavigate,
    branchwiseRep,
    handleSelectChangeAttendance,
    attBranchList,
    showTable,
    handleGetAttendance,
    loading,
  } = useAttendance();
  /////console.log(attBranchList)

  const months = getAllMonths();
  const years = getAllYears();

  const dataAtt = [
    "S.No",
    "Emp ID",
    "Employee Name",
    "Earned/Expected",
    "Attendance",
  ];
  const employeesAttendance = attBranchList?.employees_attendance || {};
  const employeeKeys = Object.keys(employeesAttendance);

  ///console.log('what is the result', employeesAttendance)

  // State for API data
  const [empBranches, setEmpBranches] = useState([]);
  const [dept_subDept, setDept_subDept] = useState([]);
  const [empList, setEmpList] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Fetch branches from API (same as AddNewEmployee)
  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await employeesApi.gettingAllBranches();
      const data = response.data;
      if (data.STATUS === "SUCCESSFUL") {
        setEmpBranches(data.DB_DATA.branches || []);
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    } finally {
      setLoadingBranches(false);
    }
  };

  // Debug branch data
  // console.log('empBranches array:', empBranches)
  // console.log('empBranches length:', empBranches?.length)

  // Fetch departments when branch is selected (same as AddNewEmployee)
  const fetchDepartments = async (branchId) => {
    setLoadingDepartments(true);
    try {
      const data = { parent_id: 0, branch_id: branchId, getAll: true };
      const response = await employeesApi.gettingSubDepts(data);
      const resData = response.data;
      ////console.log('what is the data', resData)
      if (resData.STATUS === "SUCCESSFUL") {
        setDept_subDept(resData.DB_DATA);
      } else {
        setDept_subDept([]);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDept_subDept([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Fetch employees when department is selected
  const fetchEmployees = async (departmentId) => {
    setLoadingEmployees(true);
    try {
      const response = await employeesApi.get_all_employeee(departmentId);
      const data = response.data;
      // console.log('what is the data', data)
      if (data.STATUS === "SUCCESSFUL") {
        setEmpList(data.DB_DATA || []);
      } else {
        setEmpList([]);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmpList([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Handle branch selection
  const handleBranchSelect = (selectedOption) => {
    if (selectedOption) {
      // Reset department and employee lists
      setDept_subDept([]);
      setEmpList([]);
      // Fetch departments for selected branch
      fetchDepartments(selectedOption.value);
    } else {
      // If no branch selected, reset everything
      setDept_subDept([]);
      setEmpList([]);
    }
    handleSelectChangeAttendance(selectedOption, "branch");
  };

  // Handle department selection
  const handleDepartmentSelect = (selectedOption) => {
    if (selectedOption && branchwiseRep?.branch) {
      // Reset employee list
      setEmpList([]);
      // Fetch employees for selected department
      fetchEmployees(selectedOption.value);
    }
    handleSelectChangeAttendance(selectedOption, "department");
  };

  // Flatten options for departments (same as AddNewEmployee)
  const flattenDeptOptions = (data) => {
    let flattenedOptions = [{ value: 0, label: "All Departments" }];
    const send_data = data?.departments;
    if (send_data && Array.isArray(send_data)) {
      send_data?.forEach((dept) => {
        flattenedOptions.push({
          label: dept.name,
          value: dept.id,
          isParent: true,
        });
      });
    }
    return flattenedOptions;
  };

  // Helper function to convert seconds to hours and minutes format
  const convertSecondsToHoursMinutes = (seconds) => {
    if (!seconds || seconds === 0) return "0 hrs";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hrs${minutes > 0 ? `, ${minutes} min` : ""}`;
  };

  // Helper function to convert seconds to minutes format
  const convertSecondsToMinutes = (seconds) => {
    if (!seconds || seconds === 0) return "0 min";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Helper function to format annual leaves
  const formatAnnualLeaves = (availed, total) => {
    const remaining = total - availed;
    return `Availed = ${availed}, Total = ${total}, Remaining = ${remaining}`;
  };

  // Helper function to calculate total days
  const calculateTotalDays = (present, absent, holidays, leaves) => {
    return present + absent + holidays + leaves;
  };

  // Export Branch Wise Attendance to Excel
  const exportBranchWiseAttendanceToExcel = () => {
    if (employeeKeys.length === 0) {
      showToast("No data available to export", "error");
      return;
    }

    try {
      setIsExporting(true);
      
      // Define the columns for the table (matching the Excel image)
      const columns = [
        "Employee ID",
        "Name",
        "Designation",
        "Department",
        "Expected Hours",
        "Earned Hours",
        "Overtime",
        "Late Coming",
        "Used Bucket",
        "Total Days",
        "Present Days",
        "Holidays",
        "Annual Leaves",
        "Leaves",
        "Absent Days",
        "Attendance Percentage",
      ];

      // Transform the data into the format required for Excel
      const rows = employeeKeys.map((key, index) => {
        const employee = employeesAttendance[key];
        const totalDays = calculateTotalDays(
          employee.present_days || 0,
          employee.absent_days || 0,
          employee.holidays || 0,
          employee.leaves || 0
        );

        return [
          employee.emp_id || "", // Employee ID
          employee.name || "", // Name
          employee.designation || "", // Designation
          employee.dept || "", // Department
          convertSecondsToHoursMinutes(employee.working_secs || 0), // Expected Hours
          convertSecondsToHoursMinutes(employee.earned_secs || 0), // Earned Hours
          convertSecondsToHoursMinutes(employee.overtime_seconds || 0), // Overtime
          convertSecondsToMinutes(employee.late_coming_seconds || 0), // Late Coming
          employee.total_adjusted_late_min || 0, // Used Bucket
          totalDays, // Total Days
          employee.present_days || 0, // Present Days
          employee.holidays || 0, // Holidays
          formatAnnualLeaves(
            employee.availed_leave_balance || 0,
            employee.total_leave_balance || 0
          ), // Annual Leaves
          employee.leaves || 0, // Leaves
          employee.absent_days || 0, // Absent Days
          employee.percentage || 0, // Attendance Percentage
        ];
      });

      // Create worksheet data with headers
      const worksheetData = [columns, ...rows];

      // Create a new workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths (matching the Excel image)
      const columnWidths = [
        { wch: 12 }, // Employee ID
        { wch: 20 }, // Name
        { wch: 15 }, // Designation
        { wch: 15 }, // Department
        { wch: 15 }, // Expected Hours
        { wch: 15 }, // Earned Hours
        { wch: 15 }, // Overtime
        { wch: 15 }, // Late Coming
        { wch: 12 }, // Used Bucket
        { wch: 12 }, // Total Days
        { wch: 12 }, // Present Days
        { wch: 12 }, // Holidays
        { wch: 35 }, // Annual Leaves
        { wch: 10 }, // Leaves
        { wch: 12 }, // Absent Days
        { wch: 18 }, // Attendance Percentage
      ];
      worksheet["!cols"] = columnWidths;

      // Style the header row
      const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "3DA5F4" } },
          alignment: { horizontal: "center" },
        };
      }

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Branch Wise Attendance"
      );

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `branch-wise-attendance-${currentDate}.xlsx`;

      // Save the Excel file
      XLSX.writeFile(workbook, filename);

      showToast("Branch wise attendance exported successfully", "success");
    } catch (error) {
      console.error("Export error:", error);
      showToast("Failed to export attendance data", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <div>
            <span className="text-[#3da5f4] font-semibold">
              Branch wise List Reporting
            </span>
          </div>
          <div>
            <CustomButton onClick={backNavigate} title="Back" />
          </div>
        </div>

        <div>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-4 items-center">
              <div className="w-96">
                <label className="text-[#474747] text-[12px] font-medium font-Urbanist px-2">
                  Select Branch
                </label>
                <CustomSelect
                  placeHolderTitle="Branch"
                  value={branchwiseRep?.branch}
                  options={[
                    { value: 0, label: "All Branches" },
                    ...(empBranches?.map((branch) => ({
                      value: branch.id,
                      label: branch.branch_name,
                    })) || []),
                  ]}
                  onChangeHandler={handleBranchSelect}
                  customStyles={false}
                />
                {loadingBranches && (
                  <div className="text-sm text-gray-500 mt-1">
                    Loading branches...
                  </div>
                )}
              </div>

              <div className="w-96">
                <label className="text-[#474747] text-[12px] font-medium font-Urbanist px-2">
                  Select Department
                </label>
                <CustomSelect
                  placeHolderTitle="Department"
                  value={branchwiseRep?.department}
                  options={flattenDeptOptions(dept_subDept)}
                  onChangeHandler={handleDepartmentSelect}
                  cStyle={true}
                />
                {loadingDepartments && (
                  <div className="text-sm text-gray-500 mt-1">
                    Loading departments...
                  </div>
                )}
              </div>

              <div className="w-96">
                <label className="text-[#474747] text-[12px] font-medium font-Urbanist px-2">
                  Select Month
                </label>
                <CustomSelect
                  placeHolderTitle="Month"
                  value={branchwiseRep?.month}
                  options={months.map((month) => ({
                    value: month.id,
                    label: month.title,
                  }))}
                  onChangeHandler={(selectedOption, e) =>
                    handleSelectChangeAttendance(selectedOption, "month", e)
                  }
                  cStyle={true}
                />
              </div>

              <div className="w-96">
                <label className="text-[#474747] text-[12px] font-medium font-Urbanist px-2">
                  Select Year
                </label>
                <CustomSelect
                  placeHolderTitle="Year"
                  value={branchwiseRep?.year}
                  options={years.map((year) => ({ value: year, label: year }))}
                  onChangeHandler={(selectedOption) =>
                    handleSelectChangeAttendance(selectedOption, "year")
                  }
                  cStyle={true}
                />
              </div>
              {/* 
                            <div className='w-96'>
                                <label className='text-[#698592]'>Select Employee (Optional)</label>
                                <CustomSelect
                                    placeHolderTitle='Employee'
                                    value={branchwiseRep?.employee}
                                    options={empList?.map((emp) => ({ value: emp.id, label: emp.name }))}
                                    onChangeHandler={(selectedOption) => handleSelectChangeAttendance(selectedOption, 'employee')}
                                    cStyle={true}
                                />
                                {loadingEmployees && <div className="text-sm text-gray-500 mt-1">Loading employees...</div>}
                            </div> */}

              <div>
                <CustomButton
                  loading={loading}
                  title="Get Attendance"
                  onClick={handleGetAttendance}
                  disabled={!branchwiseRep?.branch}
                  className={
                    !branchwiseRep?.branch
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                />
              </div>
            </div>

            <div>
              {showTable && (
                <div className="flex flex-col space-y-4 bg-white rounded-[10px] drop-shadow-md p-2">
                  <div className="max-h-[calc(100vh-100px)] overflow-auto customScroll">
                    <table className="w-full text-center">
                      <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                        <tr>
                          {dataAtt.map((head, i) => (
                            <th key={i} className="bg-[#F8F9FA] p-4">
                              <Typography
                                // variant='small'
                                // color='blue-gray'
                                className="font-medium leading-none  capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist text-[#474747]"
                              >
                                {head}
                              </Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {employeeKeys.length > 0 ? (
                          employeeKeys.map((key, index) => {
                            const employee = employeesAttendance[key];
                            const isLast = index === employeeKeys.length - 1;
                            const classes = isLast
                              ? "p-4"
                              : "p-4 border-b border-[#F2F2F9]";

                            return (
                              <tr key={employee.id}>
                                <td className={classes}>
                                  <Typography
                                    // variant="small"
                                    // color="blue-gray"
                                    className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist"
                                  >
                                    {index + 1}
                                  </Typography>
                                </td>

                                <td className={classes}>
                                  <Typography
                                    // variant="small"
                                    // color="blue-gray"
                                    className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist"
                                  >
                                    {employee.emp_id}
                                  </Typography>
                                </td>

                                <td className={classes}>
                                  <Typography
                                    // variant="small"
                                    // color="blue-gray"
                                    className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist"
                                  >
                                    {employee.name}
                                  </Typography>
                                </td>

                                <td className={classes}>
                                  <Typography
                                    // variant="small"
                                    // color="blue-gray"
                                    className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist"
                                  >
                                    {`${convertSecondsToTime(
                                      employee.earned_secs
                                    )}/${convertSecondsToTime(
                                      employee.working_secs
                                    )}`}
                                  </Typography>
                                </td>

                                <td className={classes}>
                                  <Typography
                                    // variant="small"
                                    // color="blue-gray"
                                    className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist"
                                  >
                                    {employee.percentage
                                      ? employee.percentage
                                      : 0}
                                    %
                                  </Typography>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={dataAtt.length}
                              className="text-center p-4"
                            >
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
                      </tbody>
                    </table>

                    <div>
                      {employeeKeys.length > 0 ? (
                        <CustomButton
                          loading={loading}
                          title={
                            isExporting ? "Exporting..." : "Export to Excel"
                          }
                          onClick={exportBranchWiseAttendanceToExcel}
                          disabled={isExporting}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BranchWiseListReporting;