import { Checkbox, Input, Option, Radio, Select, Button } from '@material-tailwind/react'
import React, { useEffect, useRef, useState } from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import employeesApi from '../../Model/Data/Employees/Employees'
import useStore from '../../Store/store'
import { showToast } from '../../Components/Toaster/Toaster'
import { useNavigate } from 'react-router'
import useSocket from '../../Components/useSocket/useSocket'
import { getContentByLabel } from '../../services/getContentService'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'
import { FaInfoCircle } from 'react-icons/fa'
import { getDecodedToken } from '../../Authentication/jwt_decode'

/** Generate a unique request id for this export so socket event can be matched to this user/session. */
const generateReportRequestId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `att-report-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// OLD duplicate from merge (incoming branch — same implementation):
// const generateReportRequestId = () => {
//   if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
//   return `att-report-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
// }
const ATTENDANCE_PENDING_EXPORT_KEY = 'attendance_pending_export'
const ExportAttendance = () => {
  const { individualExport, handleCheckboxChangeAtt, excelLayoutOptions } = useAttendance();
  const scheduleReport = useStore((state) => state.scheduleReport)
  const closeDrawer = useStore((state) => state.closeDrawer)
  const navigate = useNavigate()
  const { socketIoRef } = useSocket()
  const pendingReportRequestIdRef = useRef(null)
  const downloadTimeoutRef = useRef(null)
  const exportStartedAtRef = useRef(null)
  const currentExportMetaRef = useRef(null)
  const longWaitToastTimeoutRef = useRef(null)

  const DOWNLOAD_WAIT_MS = 5 * 60 * 1000

  const scheduleAttendanceLongWaitToast = () => {
    if (longWaitToastTimeoutRef.current) clearTimeout(longWaitToastTimeoutRef.current)
    // Show a gentle heads-up if report generation takes time.
    longWaitToastTimeoutRef.current = setTimeout(() => {
      showToast('Generating attendance report… this may take a while. You can keep working.', 'info')
    }, 12000)
  }

  const clearAttendanceLongWaitToast = () => {
    if (longWaitToastTimeoutRef.current) {
      clearTimeout(longWaitToastTimeoutRef.current)
      longWaitToastTimeoutRef.current = null
    }
  }

  // OLD (incoming branch) — only DOWNLOAD_WAIT_MS, no long-wait toast / extra refs:
  // const DOWNLOAD_WAIT_MS = 5 * 60 * 1000
  // State for API data (same as BranchWiseListReporting)
  const [empBranches, setEmpBranches] = useState([])
  const [dept_subDept, setDept_subDept] = useState([])
  const [empList, setEmpList] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [employeeSuggestions, setEmployeeSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null)

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false)
  const [contentData, setContentData] = useState(null)
  const [contentLang, setContentLang] = useState('ENGLISH')
  const [contentLoading, setContentLoading] = useState(false)

  const openContentDrawer = async (contentLabel) => {
    setContentDrawerOpen(true)
    setContentLang('ENGLISH')
    setContentLoading(true)
    setContentData(null)
    try {
      const res = await getContentByLabel(contentLabel)
      if (res?.STATUS === 'SUCCESSFUL' && res?.DATA?.[0]?.contents?.length) {
        setContentData(res.DATA[0])
      } else {
        showToast('Content not available', 'error')
        setContentDrawerOpen(false)
      }
    } catch (err) {
      showToast('Failed to load content', 'error')
      setContentDrawerOpen(false)
    } finally {
      setContentLoading(false)
    }
  }

  const exportLayoutSelectOptions = [
    { value: 'list', label: 'List View (Multi Sheet)' },
    { value: 'calender', label: 'Calendrical View' },
    { value: 'calender_full', label: 'Calendrical Full View' }
  ]

  // Form state for export
  const [formData, setFormData] = useState({
    reportType: '', // Datewise or Monthly - no default, user must select
    branch: null,
    department: null,
    employee: null,
    employeeId: '',
    employeeType: 'Active', // Active, In-Active, Both Active & In-Active
    exportType: 'Export full attendance', // Radio button selection
    firstInLastOut: false, // When true, export only first in and last out per day (for Export full attendance)
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

  // Cleanup download timeout on unmount
  useEffect(() => {
    return () => {
      if (downloadTimeoutRef.current) {
        clearTimeout(downloadTimeoutRef.current)
      }
    }
  }, [])

  // Listen for attendance_report_ready — only handle events meant for this user (prevents cross-org download)
  useEffect(() => {
    if (!socketIoRef.current) return;

    const handleAttendanceReportReady = (data) => {
      if (!data || !data.file_url) return;
      const requestIdMatch =
        data.request_id != null &&
        pendingReportRequestIdRef.current != null &&
        String(data.request_id) === String(pendingReportRequestIdRef.current)
      // OLD: const requestIdMatch = data.request_id != null && data.request_id === pendingReportRequestIdRef.current
      const oneIdMatch = data.one_id != null && getDecodedToken()?.oneid != null && String(data.one_id) === String(getDecodedToken().oneid)
      const legacyNoId = pendingReportRequestIdRef.current != null && data.request_id == null && data.one_id == null

      if (!requestIdMatch && !oneIdMatch && !legacyNoId) return
      clearAttendanceLongWaitToast()
      // OLD: (incoming had no clearAttendanceLongWaitToast here)
      if (pendingReportRequestIdRef.current != null) pendingReportRequestIdRef.current = null
      if (downloadTimeoutRef.current) {
        clearTimeout(downloadTimeoutRef.current)
        downloadTimeoutRef.current = null
      }

      const elapsedMs = exportStartedAtRef.current ? Date.now() - exportStartedAtRef.current : null
      const elapsedSec = elapsedMs != null ? (elapsedMs / 1000).toFixed(1) : null
      console.log('📥 Attendance report socket response received', {
        requestId: data.request_id || pendingReportRequestIdRef.current,
        oneId: data.one_id,
        reportType: data.report_type,
        exportType: data.export_type,
        elapsedMs,
        elapsedSec
      })

      setIsDownloading(false)
      setIsExporting(false)
      setIsSendingEmail(false)
      exportStartedAtRef.current = null
      currentExportMetaRef.current = null
      localStorage.removeItem(ATTENDANCE_PENDING_EXPORT_KEY)
      showToast('Your attendance report is ready! Downloading...', 'success')
      // OLD (incoming branch):
      // showToast('Your attendance report is ready! Downloading...', 'success')
      // setIsDownloading(false)
      // setIsExporting(false)
      // setIsSendingEmail(false)

      try {
        const link = document.createElement('a')
        link.href = data.file_url
        link.rel = 'noopener noreferrer'
        const filename = data.file_name || `${data.report_type}_${data.export_type}_${new Date().toISOString().split('T')[0]}.xlsx`
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        showToast('Failed to download the report', 'error')
      }
    }

    socketIoRef.current.on('attendance_report_ready', handleAttendanceReportReady)
    return () => {
      if (socketIoRef.current) {
        socketIoRef.current.off('attendance_report_ready', handleAttendanceReportReady)
      }
    }
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
      const data = { parent_id: 0, branch_id: branchId, getAll: true, get_all_departments: true }
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

  // Handle branch selection - use only local state and Node API (fetchDepartments).
  // Do not call handleSelectChangeAttendance here; it would trigger PHP get_data.php.
  const handleBranchSelect = (selectedOption) => {
    if (selectedOption) {
      // Reset department and employee lists
      setDept_subDept([])
      setEmpList([])
      // Fetch departments for selected branch (Node API: /api/v1/departments)
      fetchDepartments(selectedOption.value)
    } else {
      // If no branch selected, reset everything
      setDept_subDept([])
      setEmpList([])
    }
  }

  // Handle department selection - use only local state; no need to sync with attendance view model.
  const handleDepartmentSelect = (selectedOption) => {
    if (selectedOption) {
      // Reset employee list
      setEmpList([])
      // Fetch employees for selected department (including '0' for all departments)
      fetchEmployees(selectedOption.value)
    }
  }

  // Flatten options for departments - support both array response and { departments: [] }
  const flattenDeptOptions = (data) => {
    if (!data) return [];
    const list = Array.isArray(data) ? data : (data?.departments || []);
    if (!Array.isArray(list)) return [];
    return list.map((dept) => ({
      label: dept.name ?? dept.label ?? String(dept.id ?? ''),
      value: dept.id,
      isParent: true
    }));
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
    e.preventDefault()
    e.stopPropagation()
    // Prevent double execution when only one button should run
    if (isExporting || isSendingEmail || isDownloading) return

    // Validate required fields
    if (!formData.reportType) {
      showToast('Please select a report type', 'error')
      return
    }

    if (!formData.individualExport && !formData.branch) {
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

    // if (!formData.excelLayout || formData.excelLayout === '') {
    //   showToast('Please select an Excel Layout', 'error')
    //   return
    // }

    try {
      if (isSendEmail) {
        setIsSendingEmail(true)
      } else {
        setIsExporting(true)
      }
      const requestId = generateReportRequestId()
      pendingReportRequestIdRef.current = requestId

      const isAllBranches = formData.branch?.value === '0'
      const payload = {
        request_id: requestId,
        month: formData.reportType === 'Monthly' ? formData.month : '',
        year: formData.reportType === 'Monthly' ? formData.year : '',
        branch: formData.individualExport ? '' : (isAllBranches ? '0' : (formData.branch?.value ? String(formData.branch.value) : '')),
        dept: formData.individualExport ? '' : (formData.department?.value === '0' ? '' : (formData.department?.value ? String(formData.department.value) : '')),
        sub_dep: '', // Not used in current form
        layout: formData.excelLayout || 'calender_full',
        empId: formData.individualExport ? String(formData.employee?.value || formData.employeeId) : '',
        reportType: 'attendance', // Default value
        exportType: formData.reportType === 'Monthly' ? 'monthly' : 'regular',
        date: formData.reportType === 'Datewise' ? formData.fromDate : '',
        to_date: formData.reportType === 'Datewise' ? formData.toDate : '',
        emp_type: formData.employeeType === 'Active' ? '1' : formData.employeeType === 'In-Active' ? '0' : '2',
        first_in_last_out: formData.exportType === 'Export full attendance' && formData.firstInLastOut ? '1' : '',
        select_type: '',
        custom_report_type: formData.exportType === 'Export Simple Report' ? 'simple_attendance' :
                           formData.exportType === 'Export Comprehensive Report' ? 'comprehensive_attendance' :
                           formData.exportType === 'Export Leave Report only' ? 'leave_report' :
                           formData.exportType === 'Export Absentees only' ? 'absentees_report' : 'attendance',
        compliance_report: formData.complianceReport ? '1' : '',
        send_email: isSendEmail ? true : false
      }

      const result = await scheduleReport(payload)

      if (result.success) {
        exportStartedAtRef.current = Date.now()
        currentExportMetaRef.current = {
          requestId,
          reportType: formData.reportType,
          exportType: formData.exportType,
          isSendEmail
        }
        console.log('⏳ Attendance report scheduled, waiting for socket response...', currentExportMetaRef.current)
        scheduleAttendanceLongWaitToast()
        localStorage.setItem(
          ATTENDANCE_PENDING_EXPORT_KEY,
          JSON.stringify({
            requestId,
            startedAt: exportStartedAtRef.current,
            reportType: formData.reportType,
            exportType: formData.exportType,
            oneId: getDecodedToken()?.oneid ?? null
          })
        )

        if (downloadTimeoutRef.current) clearTimeout(downloadTimeoutRef.current)
        downloadTimeoutRef.current = setTimeout(() => {
          downloadTimeoutRef.current = null
          const elapsedMs = exportStartedAtRef.current ? Date.now() - exportStartedAtRef.current : null
          const elapsedSec = elapsedMs != null ? (elapsedMs / 1000).toFixed(1) : null
          console.log('⌛ Attendance report wait timeout reached', {
            ...currentExportMetaRef.current,
            elapsedMs,
            elapsedSec
          })
          pendingReportRequestIdRef.current = null
          exportStartedAtRef.current = null
          currentExportMetaRef.current = null
          localStorage.removeItem(ATTENDANCE_PENDING_EXPORT_KEY)
          clearAttendanceLongWaitToast()
          // OLD (incoming branch) — minimal timeout body only had:
          // pendingReportRequestIdRef.current = null
          // then setIsDownloading(false) + showToast (same as below)
          setIsDownloading(false)
          showToast('Report did not arrive in time. Check Attendance Report Archive or try again.', 'error')
        }, DOWNLOAD_WAIT_MS)
        setIsDownloading(true)
      } else {
        pendingReportRequestIdRef.current = null
        exportStartedAtRef.current = null
        currentExportMetaRef.current = null
        localStorage.removeItem(ATTENDANCE_PENDING_EXPORT_KEY)
        clearAttendanceLongWaitToast()
        // OLD (incoming): only pendingReportRequestIdRef.current = null before showToast
        showToast(result.error || 'Failed to schedule report', 'error')
      }
    } catch (error) {
      pendingReportRequestIdRef.current = null
      exportStartedAtRef.current = null
      currentExportMetaRef.current = null
      localStorage.removeItem(ATTENDANCE_PENDING_EXPORT_KEY)
      clearAttendanceLongWaitToast()
      // OLD (incoming): only pendingReportRequestIdRef.current = null before showToast
      showToast('An error occurred while scheduling the report', 'error')
      setIsDownloading(false)
    } finally {
      if (isSendEmail) {
        setIsSendingEmail(false)
      } else {
        setIsExporting(false)
      }
    }
  };
  

  return (
    <>
      {/* Export Attendance - prevent form submit on Enter; export only on button click */}
      <form onSubmit={(e) => e.preventDefault()} className='pt-4'>
        <div className='flex flex-col space-y-6'>
          {/* Report Type and Employee Type Row */}
          <div className='flex gap-6'>
            <div className='flex-1'>
              <label className='text-[#698592] text-[12px] mb-1 block'>Select Report Type</label>
              <CustomSelect
                placeHolderTitle='Select Report Type'
                value={formData.reportType ? { value: formData.reportType, label: formData.reportType } : null}
                options={[
                  { value: 'Datewise', label: 'Datewise' },
                  { value: 'Monthly', label: 'Monthly' }
                ]}
                onChangeHandler={(selectedOption) => handleInputChange('reportType', selectedOption?.value ?? '')}
                customStyles={false}
              />
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-1.5 mb-1'>
                <label className='text-[#698592] text-[12px]'>Select Employee Type</label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer('EXPORT_ATTENDENCE')} />
              </div>
              <CustomSelect
                placeHolderTitle='Select Employee Type'
                value={formData.employeeType ? { value: formData.employeeType, label: formData.employeeType } : null}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'In-Active', label: 'In-Active' },
                  { value: 'Both Active & In-Active', label: 'Both Active & In-Active' }
                ]}
                onChangeHandler={(selectedOption) => handleInputChange('employeeType', selectedOption?.value ?? 'Active')}
                customStyles={false}
              />
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

          {/* Branch and Department Row - hidden when Export an individual attendance is selected */}
          {!formData.individualExport && (
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
                      : []
                  }
                  onChangeHandler={(selectedOption) => {
                    handleInputChange('department', selectedOption)
                    handleDepartmentSelect(selectedOption)
                  }}
                  customStyles={false}
                  disabled={!formData.branch}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                />
                {loadingDepartments && <div className="text-sm text-gray-500 mt-1">Loading departments...</div>}
              </div>
            </div>
          )}
        </div>

        <div className='flex flex-col space-y-4'>
          <div className='text-[14px]'>
            <div className='flex items-center gap-1.5'>
              <Radio 
                name='exportType' 
                label='Export full attendance' 
                color='blue' 
                style={{ width: '15px', height: '15px' }}
                checked={formData.exportType === 'Export full attendance'}
                onChange={() => handleInputChange('exportType', 'Export full attendance')}
              />
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openContentDrawer('ATTENDENCE_REPORT_TYPE'); }} />
            </div>
            {formData.exportType === 'Export full attendance' && (
              <div className='pl-6'>
                <Checkbox 
                  label='First in last out' 
                  color='blue' 
                  style={{ width: '17px', height: '17px' }}
                  checked={formData.firstInLastOut}
                  onChange={(e) => handleInputChange('firstInLastOut', e.target.checked)}
                />
              </div>
            )}

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

            {/* <div>
              <Radio 
                name='exportType' 
                label='Export Comprehensive Report' 
                color='blue' 
                style={{ width: '15px', height: '15px' }}
                checked={formData.exportType === 'Export Comprehensive Report'}
                onChange={() => handleInputChange('exportType', 'Export Comprehensive Report')}
              />
            </div> */}

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
            {/* <div className='flex items-center gap-1.5'>
              <Checkbox 
                label='Export Compliance Report' 
                color='blue' 
                style={{ width: '17px', height: '17px' }}
                checked={formData.complianceReport}
                onChange={(e) => handleInputChange('complianceReport', e.target.checked)}
              />
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openContentDrawer('COMPLIANCE_AND_INDIVIDUAL_REPORT'); }} />
            </div> */}

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

          {/* <div className='flex-1 max-w-[24rem] pl-[10px]'>
            <div className='flex items-center gap-1.5 mb-1'>
              <label className='text-[#698592] text-[12px]'>Export layout</label>
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer('REPORT_EXCEL_LAYOUT')} />
            </div>
            <CustomSelect
              placeHolderTitle='Select Excel Layout'
              value={formData.excelLayout ? { value: formData.excelLayout, label: exportLayoutSelectOptions.find((o) => o.value === formData.excelLayout)?.label ?? formData.excelLayout } : null}
              options={exportLayoutSelectOptions}
              onChangeHandler={(selectedOption) => handleInputChange('excelLayout', selectedOption?.value ?? '')}
              customStyles={false}
            />
          </div> */}

          <div className='flex gap-4'>
            <CustomButton 
              type="button"
              loading={isExporting}
              title={isExporting || isDownloading ? 'Downloading...' : 'Export'} 
              onClick={(e) => { e.stopPropagation(); handleExport(e, false); }}
              disabled={isExporting || isSendingEmail || isDownloading}
              className={isExporting || isSendingEmail || isDownloading ? 'opacity-50 cursor-not-allowed' : ''}
            />
            <CustomButton 
              type="button"
              loading={isSendingEmail}
              title={isSendingEmail ? 'Sending...' : 'Send Via Email'} 
              onClick={(e) => { e.stopPropagation(); handleExport(e, true); }}
              disabled={isExporting || isSendingEmail || isDownloading}
              className={isExporting || isSendingEmail || isDownloading ? 'opacity-50 cursor-not-allowed' : ''}
            />
          </div>

        </div>



      </form>

      <PortalDrawer
        open={contentDrawerOpen}
        closeDrawer={() => setContentDrawerOpen(false)}
        direction="right"
        widthSize="45vw"
        title={
          contentData?.contents?.find((c) => c.lang === contentLang)?.main_heading ?? ''
        }
        compo={
          <div className="flex flex-col gap-4">
            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contentData?.contents?.length ? (
              <>
                <div
                  className="text-gray-800 text-sm font-Urbanist leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      contentData.contents.find((c) => c.lang === contentLang)?.content ??
                      contentData.contents.find((c) => c.lang === 'ENGLISH')?.content ??
                      '',
                  }}
                />
                <div className="flex gap-2 mt-4 border-t border-gray-200 pt-4">
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${
                      contentLang === 'ENGLISH' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setContentLang('ENGLISH')}
                  >
                    ENGLISH
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${
                      contentLang === 'URDU' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setContentLang('URDU')}
                  >
                    URDU
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        }
      />
    </>
  )
}

export default ExportAttendance