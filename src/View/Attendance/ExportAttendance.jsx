import { Checkbox, Input, Option, Radio, Select } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import employeesApi from '../../Model/Data/Employees/Employees'
import useStore from '../../Store/store'
import { showToast } from '../../Components/Toaster/Toaster'
import { useNavigate } from 'react-router'
import useSocket from '../../Components/useSocket/useSocket'
const ExportAttendance = () => {
  const { individualExport, handleCheckboxChangeAtt, handleSelectChangeAttendance, excelLayoutOptions, loading } = useAttendance();
  const scheduleReport = useStore((state) => state.scheduleReport)
  const closeDrawer = useStore((state) => state.closeDrawer)
  const navigate = useNavigate()
  const { socketIoRef } = useSocket()
  
  // State for API data (same as BranchWiseListReporting)
  const [empBranches, setEmpBranches] = useState([])
  const [dept_subDept, setDept_subDept] = useState([])
  const [empList, setEmpList] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [employeeSuggestions, setEmployeeSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null)

  // Form state for export
  const [formData, setFormData] = useState({
    reportType: '', // Datewise or Monthly - no default, user must select
    branch: null,
    department: null,
    employee: null,
    employeeId: '',
    employeeType: 'Active', // Active, In-Active, Both Active & In-Active
    exportType: 'Export full attendance', // Radio button selection
    excelLayout: 'calender_full', // Default to Calendrical Full view
    complianceReport: false,
    individualExport: false,
    sendViaEmail: false, // New field for send via email option
    // Date fields
    fromDate: '',
    toDate: '',
    month: '',
    year: ''
  })

  // Load branches on component mount
  useEffect(() => {
    fetchBranches()
  }, [])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
      }
    }
  }, [searchDebounceTimer])

  // Listen for attendance_report_ready socket event
  useEffect(() => {
    if (!socketIoRef.current) return;

    const handleAttendanceReportReady = (data) => {
      // Validate socket data
      if (!data || !data.file_url) {
        showToast('Failed to download report: Invalid data received', 'error');
        return;
      }

      // Show success notification
      showToast('Your attendance report is ready! Downloading...', 'success');
      setIsDownloading(false)
      setIsExporting(false)
      
      // Automatically download the file
      try {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = data.file_url;
        link.rel = 'noopener noreferrer'; // Security best practice
        
        // Use the file_name from socket data or generate a meaningful filename
        const filename = data.file_name || `${data.report_type}_${data.export_type}_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.download = filename;
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        showToast('Failed to download the report', 'error');
      }
    };

    // Add listener
    socketIoRef.current.on('attendance_report_ready', handleAttendanceReportReady);

    // Cleanup listener on unmount
    return () => {
      if (socketIoRef.current) {
        socketIoRef.current.off('attendance_report_ready', handleAttendanceReportReady);
      }
    };
  }, [socketIoRef])

  // Fetch branches from API (same as BranchWiseListReporting)
  const fetchBranches = async () => {
    setLoadingBranches(true)
    try {
      const response = await employeesApi.gettingAllBranches();
      const data = response.data;
      if (data.STATUS === "SUCCESSFUL") {
        setEmpBranches(data.DB_DATA.branches || [])
      }
    } catch (err) {
      // Error fetching branches
    } finally {
      setLoadingBranches(false)
    }
  };

  // Fetch departments when branch is selected (same as BranchWiseListReporting)
  const fetchDepartments = async (branchId) => {
    setLoadingDepartments(true)
    try {
      const isAllBranches = branchId === '0' || branchId === 0
      const data = { parent_id: 0, branch_id: branchId, getAll: true, get_all_departments: isAllBranches }
      const response = await employeesApi.gettingSubDepts(data)
      const resData = response.data;
      if (resData.STATUS === "SUCCESSFUL") {
        setDept_subDept(resData.DB_DATA)
      } else {
        setDept_subDept([])
      }
    } catch (err) {
      setDept_subDept([])
    } finally {
      setLoadingDepartments(false)
    }
  }

  // Fetch employees when department is selected (same as BranchWiseListReporting)
  const fetchEmployees = async (departmentId) => {
    setLoadingEmployees(true)
    try {
      const response = await employeesApi.get_all_employeee(departmentId)
      const data = response.data;
      console.log('data', data)
      if (data.STATUS === "SUCCESSFUL") {
        setEmpList(data.DB_DATA || [])
      } else {
        setEmpList([])
      }
    } catch (err) {
      setEmpList([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  // Handle branch selection (same as BranchWiseListReporting)
  const handleBranchSelect = (selectedOption) => {
    if (selectedOption) {
      // Reset department and employee lists
      setDept_subDept([])
      setEmpList([])
      // Fetch departments for selected branch (including '0' for all branches)
      fetchDepartments(selectedOption.value)
    } else {
      // If no branch selected, reset everything
      setDept_subDept([])
      setEmpList([])
    }
    handleSelectChangeAttendance(selectedOption, 'branch')
  }

  // Handle department selection (same as BranchWiseListReporting)
  const handleDepartmentSelect = (selectedOption) => {
    if (selectedOption) {
      // Reset employee list
      setEmpList([])
      // Fetch employees for selected department (including '0' for all departments)
      fetchEmployees(selectedOption.value)
    }
    handleSelectChangeAttendance(selectedOption, 'department')
  }

  // Flatten options for departments (same as BranchWiseListReporting)
  const flattenDeptOptions = (data) => {
    let flattenedOptions = [];
    const send_data = data?.departments
    if (send_data && Array.isArray(send_data)) {
      send_data?.forEach((dept) => {
        flattenedOptions.push({
          label: dept.name,
          value: dept.id,
          isParent: true
        });
      });
    }
    return flattenedOptions;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle employee ID search with debouncing
  const handleEmployeeIdSearch = (employeeId) => {
    // Update the employee ID field
    handleInputChange('employeeId', employeeId)
    
    // Clear previous timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }
    
    // If empty, clear everything
    if (!employeeId || employeeId.trim() === '') {
      setEmployeeSuggestions([])
      setShowSuggestions(false)
      handleInputChange('employee', null)
      return
    }
    
    // Only search if employee list is available
    if (empList.length > 0) {
      // Show suggestions immediately (partial matching)
      const matchingEmployees = empList.filter(emp => {
        const empId = String(emp.id || emp.emp_id || emp.employee_id || '')
        const empName = String(emp.name || '').toLowerCase()
        const searchTerm = employeeId.toLowerCase()
        
        return empId.includes(employeeId) || empName.includes(searchTerm)
      })
      
      setEmployeeSuggestions(matchingEmployees)
      setShowSuggestions(matchingEmployees.length > 0)
      
      // Set debounce timer for toast messages (2-3 seconds)
      const timer = setTimeout(() => {
        if (matchingEmployees.length === 0) {
          showToast('No employee found with this ID', 'error')
        } else if (matchingEmployees.length === 1) {
          // Auto-select if only one match after debounce
          const selectedEmployee = { 
            value: matchingEmployees[0].id, 
            label: matchingEmployees[0].name 
          }
          handleInputChange('employee', selectedEmployee)
          setShowSuggestions(false)
          showToast(`Employee selected: ${matchingEmployees[0].name}`, 'success')
        }
      }, 2500) // 2.5 seconds debounce
      
      setSearchDebounceTimer(timer)
    }
  }

  // Handle selecting an employee from suggestions
  const handleSelectSuggestion = (employee) => {
    const selectedEmployee = { 
      value: employee.id, 
      label: employee.name 
    }
    handleInputChange('employee', selectedEmployee)
    handleInputChange('employeeId', String(employee.id || employee.emp_id || employee.employee_id || ''))
    setShowSuggestions(false)
    setEmployeeSuggestions([])
    
    // Clear debounce timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }
  }

  // Handle export submission
  const handleExport = async (e, isSendEmail = false) => {
    e.preventDefault() // Prevent form submission and page reload
    
    // Validate required fields
    if (!formData.reportType) {
      showToast('Please select a report type', 'error')
      return
    }

    if (!formData.branch) {
      showToast('Please select a branch', 'error')
      return
    }

    if (formData.reportType === 'Datewise' && (!formData.fromDate || !formData.toDate)) {
      showToast('Please select both From Date and To Date', 'error')
      return
    }

    if (formData.reportType === 'Monthly' && (!formData.month || !formData.year)) {
      showToast('Please select both Month and Year', 'error')
      return
    }

    if (formData.individualExport && !formData.employee && !formData.employeeId) {
      showToast('Please select an employee or enter Employee ID for individual export', 'error')
      return
    }

    if (!formData.excelLayout || formData.excelLayout === '') {
      showToast('Please select an Excel Layout', 'error')
      return
    }

    
    try {
      setIsExporting(true)
      // Map form data to API payload
      const isAllBranches = formData.branch?.value === '0'
      const payload = {
        month: formData.reportType === 'Monthly' ? formData.month : '',
        year: formData.reportType === 'Monthly' ? formData.year : '',
        branch: isAllBranches ? '0' : (formData.branch?.value ? String(formData.branch.value) : ''),
        ...(isAllBranches && { branch_id: 0, get_all_departments: true }),
        dept: formData.department?.value === '0' ? '' : (formData.department?.value ? String(formData.department.value) : ''),
        sub_dep: '', // Not used in current form
        layout: formData.excelLayout || 'calender_full',
        empId: formData.individualExport ? String(formData.employee?.value || formData.employeeId) : '',
        reportType: 'attendance', // Default value
        exportType: formData.reportType === 'Monthly' ? 'monthly' : 'regular',
        date: formData.reportType === 'Datewise' ? formData.fromDate : '',
        to_date: formData.reportType === 'Datewise' ? formData.toDate : '',
        emp_type: formData.employeeType,
        first_in_last_out: '', // Not used in current form
        select_type: '', // Not used in current form
        custom_report_type: formData.exportType === 'Export Simple Report' ? 'simple_attendance' : 
                           formData.exportType === 'Export Comprehensive Report' ? 'comprehensive_attendance' :
                           formData.exportType === 'Export Leave Report only' ? 'leave_report' :
                           formData.exportType === 'Export Absentees only' ? 'absentees_report' : 'attendance',
        compliance_report: formData.complianceReport ? '1' : '',
        send_email: isSendEmail ? true : false
      }

      ///console.log('Sending payload:', payload)

      // Call the API
      const result = await scheduleReport(payload)

      if (result.success) {
        // setIsExporting(true)
        setIsDownloading(true)
        // showToast('Report scheduled successfully! You will be notified when it is ready.', 'success')
        // setIsExporting(true)
        
        // // Close the drawer immediately
        // closeDrawer()
        
        // Wait for socket event 'attendance_report_ready' to get notification
      } else {
        showToast(result.error || 'Failed to schedule report', 'error')
      }
    } catch (error) {
      showToast('An error occurred while scheduling the report', 'error')
      setIsDownloading(false)
    } finally {
      setIsExporting(false)
      // setIsDownloading(false)
    }
  };
  

  return (
    <>
      {/* Export Attendance */}
      <form onSubmit={handleExport} className='pt-4'>
        <div className='flex flex-col space-y-6'>
          {/* Report Type and Employee Type Row */}
          <div className='flex gap-6'>
            <div className='flex-1'>
              <Select 
                label='Report Type' 
                color='blue'
                value={formData.reportType}
                onChange={(value) => handleInputChange('reportType', value)}
              >
                <Option value="" disabled>Select Report Type</Option>
                <Option value="Datewise">Datewise</Option>
                <Option value="Monthly">Monthly</Option>
              </Select>
            </div>
            <div className='flex-1'>
              <Select 
                label='Employee Type' 
                color='blue'
                value={formData.employeeType}
                onChange={(value) => handleInputChange('employeeType', value)}
              >
                <Option value="Active">Active</Option>
                <Option value="In-Active">In-Active</Option>
                <Option value="Both Active & In-Active">Both Active & In-Active</Option>
              </Select>
            </div>
          </div>

          {/* Date fields for Datewise report - Second Position */}
          {formData.reportType === 'Datewise' && (
            <div className='flex gap-6'>
              <div className='flex-1'>
                <label className='text-[#698592] text-[12px] mb-1 block'>From Date</label>
                <input 
                  type='date'
                  value={formData.fromDate}
                  onChange={(e) => handleInputChange('fromDate', e.target.value)}
                  className='w-full text-gray-600 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <div className='flex-1'>
                <label className='text-[#698592] text-[12px] mb-1 block'>To Date</label>
                <input 
                  type='date'
                  value={formData.toDate}
                  onChange={(e) => handleInputChange('toDate', e.target.value)}
                  className='w-full text-gray-600 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>
          )}

          {/* Month/Year fields for Monthly report - Second Position */}
          {formData.reportType === 'Monthly' && (
            <div className='flex gap-6 w-full'>
              <div className='w-full'>
                <Select 
                  label='Month' 
                  color='blue'
                  value={formData.month}
                  onChange={(value) => handleInputChange('month', value)}
                  className='bg-white'
                >
                  <Option value="">Select Month</Option>
                  <Option value="1">January</Option>
                  <Option value="2">February</Option>
                  <Option value="3">March</Option>
                  <Option value="4">April</Option>
                  <Option value="5">May</Option>
                  <Option value="6">June</Option>
                  <Option value="7">July</Option>
                  <Option value="8">August</Option>
                  <Option value="9">September</Option>
                  <Option value="10">October</Option>
                  <Option value="11">November</Option>
                  <Option value="12">December</Option>
                </Select>
              </div>
              <div className='w-full'>
                <Select 
                  label='Year' 
                  color='blue'
                  value={formData.year || ''}
                  onChange={(value) => handleInputChange('year', String(value))}
                  className='bg-white'
                >
                  {["", ...Array.from({ length: new Date().getFullYear() - 2015 + 1 }, (_, i) => 2015 + i).reverse()].map((year, index) => (
                    <Option key={index} value={year ? String(year) : ""}>
                      {year || "Select Year"}
                    </Option>
                  ))}

                </Select>
              </div>
            </div>
          )}

          {/* Branch and Department Row - Third Position */}
          <div className='flex gap-6'>
            <div className='flex-1'>
              <label className='text-[#698592] text-[12px] mb-1 block'>Select Branch</label>
              <CustomSelect
                placeHolderTitle='Branch'
                value={formData.branch}
                options={[
                  { value: '0', label: 'All Branches' },
                  ...(empBranches?.map((branch) => ({ value: branch.id, label: branch.branch_name })) || [])
                ]}
                onChangeHandler={(selectedOption) => {
                  handleInputChange('branch', selectedOption)
                  handleBranchSelect(selectedOption)
                }}
                customStyles={false}
              />
              {loadingBranches && <div className="text-sm text-gray-500 mt-1">Loading branches...</div>}
            </div>
            <div className='flex-1'>
              <label className='text-[#698592] text-[12px] mb-1 block'>Select Department</label>
              <CustomSelect
                placeHolderTitle='Department'
                value={formData.department}
                options={
                  formData.branch 
                    ? [
                        { value: '0', label: 'All Departments' },
                        ...flattenDeptOptions(dept_subDept)
                      ]
                    : flattenDeptOptions(dept_subDept)
                }
                onChangeHandler={(selectedOption) => {
                  handleInputChange('department', selectedOption)
                  handleDepartmentSelect(selectedOption)
                }}
                cStyle={true}
                isDisabled={!formData.branch || (!dept_subDept.length && !loadingDepartments)}
              />
              {loadingDepartments && <div className="text-sm text-gray-500 mt-1">Loading departments...</div>}
            </div>
          </div>
        </div>

        <div className='flex flex-col space-y-4'>
          <div className='text-[14px]'>
            <div>
              <Radio 
                name='exportType' 
                label='Export full attendance' 
                color='blue' 
                style={{ width: '15px', height: '15px' }}
                checked={formData.exportType === 'Export full attendance'}
                onChange={() => handleInputChange('exportType', 'Export full attendance')}
              />
            </div>

            <div>
              <Radio 
                name='exportType' 
                label='Export Simple Report' 
                color='blue' 
                style={{ width: '15px', height: '15px' }}
                checked={formData.exportType === 'Export Simple Report'}
                onChange={() => handleInputChange('exportType', 'Export Simple Report')}
              />
            </div>

            <div>
              <Radio 
                name='exportType' 
                label='Export Comprehensive Report' 
                color='blue' 
                style={{ width: '15px', height: '15px' }}
                checked={formData.exportType === 'Export Comprehensive Report'}
                onChange={() => handleInputChange('exportType', 'Export Comprehensive Report')}
              />
            </div>

            <div>
              <Radio 
                name='exportType' 
                label='Export Leave Report only' 
                color='blue'
                style={{ width: '15px', height: '15px' }} 
                checked={formData.exportType === 'Export Leave Report only'}
                onChange={() => handleInputChange('exportType', 'Export Leave Report only')}
              />
            </div>

            <div>
              <Radio 
                name='exportType' 
                label='Export Absentees only' 
                color='blue' 
                style={{ width: '15px', height: '15px' }}
                checked={formData.exportType === 'Export Absentees only'}
                onChange={() => handleInputChange('exportType', 'Export Absentees only')}
              />
            </div>
          </div>

          <hr />

          <div className='text-[14px]'>
            <div>
              <Checkbox 
                label='Export Compliance Report' 
                color='blue' 
                style={{ width: '17px', height: '17px' }}
                checked={formData.complianceReport}
                onChange={(e) => handleInputChange('complianceReport', e.target.checked)}
              />
            </div>

            <div>
              <Checkbox 
                label='Export an individual attendance' 
                color='blue' 
                style={{ width: '17px', height: '17px' }}
                checked={formData.individualExport}
                onChange={(e) => {
                  handleInputChange('individualExport', e.target.checked)
                  handleCheckboxChangeAtt(e)
                }}
              />
            </div>
            {
              formData.individualExport && (
                <div className='w-96 pl-[10px] space-y-2'>
                  {/* <div>
                    <label className='text-[#698592] text-[12px] mb-1 block'>Select Employee (Optional)</label>
                    <CustomSelect
                      placeHolderTitle='Employee'
                      value={formData.employee}
                      options={empList?.map((emp) => ({ value: emp.id, label: emp.name })) || []}
                      onChangeHandler={(selectedOption) => {
                        handleInputChange('employee', selectedOption)
                        // Clear employee ID when manually selecting from dropdown
                        if (selectedOption) {
                          handleInputChange('employeeId', '')
                        }
                      }}
                      cStyle={true}
                      isDisabled={!empList.length} // Disable if no employees loaded
                    />
                    {loadingEmployees && <div className="text-sm text-gray-500 mt-1">Loading employees...</div>}
                  </div> */}
                  <div className="relative">
                    <label className='text-[#698592] text-[12px] mb-1 block'>Employee Name/ID</label>
                    <Input 
                      label='Enter Employee Name/ID' 
                      color='blue' 
                      value={formData.employeeId}
                      onChange={(e) => handleEmployeeIdSearch(e.target.value)}
                      placeholder='Enter Employee ID to search'
                      onFocus={() => {
                        if (employeeSuggestions.length > 0) {
                          setShowSuggestions(true)
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow click on suggestion
                        setTimeout(() => setShowSuggestions(false), 200)
                      }}
                    />
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && employeeSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                          {employeeSuggestions.length} employee{employeeSuggestions.length > 1 ? 's' : ''} found
                        </div>
                        {employeeSuggestions.map((emp) => (
                          <div
                            key={emp.id}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleSelectSuggestion(emp)}
                          >
                            <div className="text-sm font-medium text-gray-600">{`${emp.name} [${emp.emp_id}]`}</div>
                            {/* <div className="text-xs text-gray-500">
                              ID: {emp.id || emp.emp_id || emp.employee_id}
                            </div> */}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            }
          </div>

          <div className='w-96 pl-[10px]'>
            <Select 
              label='Excel Layout *' 
              color='blue'
              value={formData.excelLayout}
              onChange={(value) => handleInputChange('excelLayout', value)}
            >
              <Option value="list">List View (Multi Sheet)</Option>
              <Option value="calender">Calendrical View</Option>
              <Option value="calender_full">Calendrical Full View</Option>
            </Select>
          </div>

          <div className='flex gap-4'>
            <CustomButton 
              loading={loading}
              title={isExporting || isDownloading ? 'Downloading...' : 'Export'} 
              onClick={(e) => handleExport(e, false)}
              disabled={isExporting || isDownloading}
              className={isExporting || isDownloading ? 'opacity-50 cursor-not-allowed' : ''}
            />
            {/* <CustomButton 
              title={isExporting ? 'Sending...' : 'Send Report via Email'} 
              onClick={(e) => handleExport(e, true)}
              disabled={isExporting}
              className={isExporting ? 'opacity-50 cursor-not-allowed' : ''}
            /> */}
          </div>

        </div>



      </form>

    </>
  )
}

export default ExportAttendance