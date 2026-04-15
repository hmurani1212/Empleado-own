import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@material-tailwind/react'
import useStore from '../../Store/store'
import { gettingDepartmentsServices } from '../../services/__frequentApiServices'
import { showToast } from '../../Components/Toaster/Toaster'
import debounce from 'lodash.debounce'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import employeesApi from '../../Model/Data/Employees/Employees'
import jsPDF from 'jspdf'
import { getOrganizationData, getUserData } from '../../Authentication/jwt_decode'

// Excel styling constants — matched to Individual Attendance Report
const ORG_HEADER_BG = 'FF1F4E79'
const DATE_HEADER_BG = 'FF2E75B6'
const COLUMN_HEADER_BG = 'FF1F4E79'
const GRID_COLOR = 'FFD1D5DB'
const ROW_FILL_WHITE = 'FFFFFFFF'
const INCENTIVE_EXPORT_COL_COUNT = 7

const ALL_BRANCHES_OPTION = { value: 0, label: 'All Branches' }
const ALL_DEPARTMENTS_OPTION = { value: 0, label: 'All Departments' }

const IncentiveDeductionReportForm = () => {
  // Get global drawer close function
  const closeDrawer = useStore((state) => state.closeDrawer)
  
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    type: null,
    branch_id: null,
    department_id: null,
    exportIndividualAttendance: false,
    exportFormat: 'excel', // 'pdf' or 'excel'
    employeeId: '',
    selectedEmployee: null
  })
  
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [employeeSearchResults, setEmployeeSearchResults] = useState([])
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
  const [searchingEmployees, setSearchingEmployees] = useState(false)
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('')
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [reportData, setReportData] = useState([])
  
  // Get branches from store
  const branches_payroll = useStore((state) => state.branches_payroll)
  const getAllBranchesPayroll = useStore((state) => state.getAllBranchesPayroll)
  
  // Get report generation method from store
  const generateIncentiveDeductionsReport = useStore((state) => state.generateIncentiveDeductionsReport)

  // Search employees based on query
  const searchEmployees = useCallback(async (query) => {
    if (!formData.branch_id || !formData.department_id || !query || query.length < 2) {
      setEmployeeSearchResults([])
      setShowEmployeeDropdown(false)
      return
    }

    try {
      setSearchingEmployees(true)
      const response = await employeesApi.getEmployeesWithFilters({
        branch_id: formData.branch_id.value,
        dept_id: formData.department_id.value,
        text: query,
        limit: 50 // Limit results for better performance
      })

      console.log('Employee Search API Response:', response)

      // Handle new response structure: DB_DATA.employees
      if (response && response.DB_DATA && response.DB_DATA.employees) {
        const employees = response.DB_DATA.employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          employee_id: emp.emp_id,
          department: emp.department?.name || 'N/A'
        }))
        setEmployeeSearchResults(employees)
        setShowEmployeeDropdown(true)
        console.log('Processed search results:', employees)
      }
      // Handle response.data structure: response.data.DB_DATA.employees
      else if (response && response.data && response.data.DB_DATA && response.data.DB_DATA.employees) {
        const employees = response.data.DB_DATA.employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          employee_id: emp.emp_id,
          department: emp.department?.name || 'N/A'
        }))
        setEmployeeSearchResults(employees)
        setShowEmployeeDropdown(true)
        console.log('Processed search results (data):', employees)
      }
      // Fallback to old structure: data.data
      else if (response && response.data && response.data.data) {
        const employees = response.data.data.map(emp => ({
          id: emp.id,
          name: emp.name,
          employee_id: emp.employee_id,
          department: emp.department?.name || 'N/A'
        }))
        setEmployeeSearchResults(employees)
        setShowEmployeeDropdown(true)
        console.log('Processed search results (fallback):', employees)
      } else {
        console.log('No employee data found in search response')
        setEmployeeSearchResults([])
        setShowEmployeeDropdown(false)
      }
    } catch (error) {
      console.error('Error searching employees:', error)
      setEmployeeSearchResults([])
      setShowEmployeeDropdown(false)
    } finally {
      setSearchingEmployees(false)
    }
  }, [formData.branch_id, formData.department_id])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      searchEmployees(query)
    }, 300),
    [searchEmployees]
  )

  // Handle employee search input change
  const handleEmployeeSearchChange = (e) => {
    const query = e.target.value
    setEmployeeSearchQuery(query)
    
    if (query.length >= 2) {
      debouncedSearch(query)
    } else {
      setEmployeeSearchResults([])
      setShowEmployeeDropdown(false)
    }
  }

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    setFormData(prev => ({
      ...prev,
      selectedEmployee: employee
    }))
    setEmployeeSearchQuery(employee.name)
    setShowEmployeeDropdown(false)
  }

  // Clear employee selection
  const clearEmployeeSelection = () => {
    setFormData(prev => ({
      ...prev,
      selectedEmployee: null
    }))
    setEmployeeSearchQuery('')
    setEmployeeSearchResults([])
    setShowEmployeeDropdown(false)
  }

  // Auto-fetch data function
  const handleAutoFetchData = useCallback(async () => {
    if (!formData.branch_id || !formData.department_id || !formData.type || !formData.fromDate || !formData.toDate) {
      return
    }

    try {
      const requestData = {
        // All Branches / All Departments should send 0
        branch_id: formData.branch_id?.value ?? 0,
        dept_id: formData.department_id?.value ?? 0,
        time1: formData.fromDate,
        time2: formData.toDate,
        type: formData.type.value,
        ...(formData.selectedEmployee && { emp_ids: [formData.selectedEmployee.id] })
      }

      const result = await generateIncentiveDeductionsReport(requestData)

      if (result && result.success && result.data) {
        setReportData(result.data)
      } else {
        setReportData([])
      }
    } catch (error) {
      console.error('Error auto-fetching data:', error)
      setReportData([])
    }
  }, [formData.branch_id, formData.department_id, formData.type, formData.fromDate, formData.toDate, formData.selectedEmployee, generateIncentiveDeductionsReport])

  // Auto-fetch data when branch, department, type, and dates are selected
  useEffect(() => {
    if (formData.branch_id && formData.department_id && formData.type && formData.fromDate && formData.toDate) {
      handleAutoFetchData()
    } else {
      setReportData([])
    }
  }, [formData.branch_id, formData.department_id, formData.type, formData.fromDate, formData.toDate, formData.selectedEmployee, handleAutoFetchData])

  // Type options
  const typeOptions = [
    { value: 'both', label: 'Both' },
    { value: 'incentive', label: 'Incentive' },
    { value: 'deduction', label: 'Deduction' }
  ]

  // Category options (disabled per requirement)

  // Load branches on component mount
  useEffect(() => {
    if (branches_payroll.length === 0) {
      getAllBranchesPayroll()
    }
  }, [branches_payroll.length, getAllBranchesPayroll])

  // Handle branch selection
  const handleBranchChange = async (selectedBranch) => {
    setFormData(prev => ({
      ...prev,
      branch_id: selectedBranch,
      department_id: null // Reset department when branch changes
    }))
    
    setDepartments([]) // Clear departments
    
    if (selectedBranch) {
      try {
        setLoading(true)
        const deptData = await gettingDepartmentsServices(selectedBranch.value)
        const deptOptions = Array.isArray(deptData) ? deptData : []
        setDepartments([ALL_DEPARTMENTS_OPTION, ...deptOptions])
      } catch (error) {
        console.error('Error fetching departments:', error)
        showToast('Error loading departments', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle department selection
  const handleDepartmentChange = (selectedDepartment) => {
    setFormData(prev => ({
      ...prev,
      department_id: selectedDepartment
    }))
  }

  // Handle type selection
  const handleTypeChange = (selectedType) => {
    setFormData(prev => ({
      ...prev,
      type: selectedType
    }))
  }

  // Category selection handler (disabled per requirement)

  // Handle date changes
  const handleFromDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      fromDate: e.target.value
    }))
  }

  const handleToDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      toDate: e.target.value
    }))
  }

  // Handle checkbox change
  const handleIndividualAttendanceChange = (e) => {
    setFormData(prev => ({
      ...prev,
      exportIndividualAttendance: e.target.checked
    }))
  }

  // Handle export format change
  const handleExportFormatChange = (format) => {
    setFormData(prev => ({
      ...prev,
      exportFormat: format
    }))
  }





  // Export to Excel — ExcelJS styling matched to Individual Attendance Report
  const exportToExcel = async (data, filename) => {
    try {
      const ExcelJS = (await import('exceljs')).default

      // Handle different data structures
      const actualData = Array.isArray(data) ? data : (data?.DATA || data?.data || [])

      if (!Array.isArray(actualData) || actualData.length === 0) {
        throw new Error('No data available to export')
      }

      // Remove duplicates based on emp_id and date
      const uniqueData = actualData.filter((item, index, self) => {
        const key = `${item.emp_id || item.employee_id}_${item.date || item.incentive_date || 'no_date'}`
        return index === self.findIndex(t => `${t.emp_id || t.employee_id}_${t.date || t.incentive_date || 'no_date'}` === key)
      })

      // Gather context info
      const userData = getUserData()
      const orgName = getOrganizationData()?.orgName || userData?.org_name || 'Organization'
      const reportDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      })
      const branchLabel = formData.branch_id?.label || 'All Branches'
      const deptLabel = formData.department_id?.label || 'All Departments'
      const typeLabel = formData.type?.label || 'Both'
      const dateRange = formData.fromDate && formData.toDate
        ? `${formData.fromDate} to ${formData.toDate}`
        : 'N/A'

      const cCount = INCENTIVE_EXPORT_COL_COUNT

      const thinGrid = {
        top:    { style: 'thin', color: { argb: GRID_COLOR } },
        bottom: { style: 'thin', color: { argb: GRID_COLOR } },
        left:   { style: 'thin', color: { argb: GRID_COLOR } },
        right:  { style: 'thin', color: { argb: GRID_COLOR } },
      }

      // --- Create workbook & worksheet ---
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Incentive Deduction Report', {
        views: [{ rightToLeft: false }],
      })

      worksheet.columns = [
        { width: 8 },   // S.No
        { width: 14 },  // Emp ID
        { width: 24 },  // Name
        { width: 24 },  // Father Name
        { width: 22 },  // Designation
        { width: 16 },  // Type
        { width: 18 },  // Amount
      ]

      // --- Row 1: Organization header ---
      const orgRow = worksheet.addRow([`Organization: ${orgName}`])
      orgRow.height = 26
      worksheet.mergeCells(1, 1, 1, cCount)
      orgRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
      orgRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }
      orgRow.getCell(1).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: ORG_HEADER_BG },
      }

      // --- Row 2: Report title ---
      const titleRow = worksheet.addRow([
        `Incentive & Deduction Report — ${dateRange} (exported ${reportDate})`,
      ])
      titleRow.height = 28
      worksheet.mergeCells(2, 1, 2, cCount)
      titleRow.getCell(1).font = { bold: true, size: 15, color: { argb: 'FFFFFFFF' } }
      titleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }
      titleRow.getCell(1).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: DATE_HEADER_BG },
      }

      // --- Row 3: Filter details ---
      const detailParts = [
        `Branch: ${branchLabel}`,
        `Department: ${deptLabel}`,
        `Type: ${typeLabel}`,
        `Date Range: ${dateRange}`,
      ]
      if (formData.selectedEmployee) {
        detailParts.unshift(`Employee: ${formData.selectedEmployee.name} (ID: ${formData.selectedEmployee.employee_id || formData.selectedEmployee.id})`)
      }
      const detailRow = worksheet.addRow([detailParts.join('   |   ')])
      detailRow.height = 24
      worksheet.mergeCells(3, 1, 3, cCount)
      detailRow.getCell(1).font = { bold: true, size: 11, color: { argb: 'FF1E293B' } }
      detailRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
      detailRow.getCell(1).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' },
      }
      for (let c = 1; c <= cCount; c++) {
        detailRow.getCell(c).border = thinGrid
      }

      // --- Row 4: Column headers ---
      const headerRow = worksheet.addRow([
        'S.No', 'Emp ID', 'Name', 'Father Name', 'Designation', 'Type', 'Amount',
      ])
      headerRow.height = 22
      for (let c = 1; c <= cCount; c++) {
        const cell = headerRow.getCell(c)
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
        cell.fill = {
          type: 'pattern', pattern: 'solid', fgColor: { argb: COLUMN_HEADER_BG },
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        cell.border = thinGrid
      }

      // --- Data rows ---
      uniqueData.forEach((item, index) => {
        const row = worksheet.addRow([
          index + 1,
          item.emp_id || item.employee_id || '-',
          item.name || item.employee_name || '-',
          item.f_name || item.father_name || '-',
          item.designation || item.employee_designation || '-',
          item.type || item.incentive_type || '-',
          item.amount || item.incentive_amount || '0',
        ])
        row.height = 20
        row.eachCell((cell, colNumber) => {
          cell.border = thinGrid
          cell.fill = {
            type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_FILL_WHITE },
          }
          cell.font = { size: 10, color: { argb: 'FF334155' } }
          // S.No and Amount: center aligned
          if (colNumber === 1 || colNumber === 7) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' }
          }
        })
      })

      // --- Download file ---
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.xlsx`
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Excel export error:', error)
      throw error
    }
  }

  // Export to PDF
  const exportToPDF = (data, filename) => {
    try {
      // Handle different data structures
      const actualData = Array.isArray(data) ? data : (data?.DATA || data?.data || [])
      console.log('Exporting to PDF:', { dataLength: actualData.length, filename, originalData: data })

      if (!Array.isArray(actualData) || actualData.length === 0) {
        throw new Error('No data available to export')
      }

      // Remove duplicates based on emp_id and date
      const uniqueData = actualData.filter((item, index, self) => {
        const key = `${item.emp_id || item.employee_id}_${item.date || item.incentive_date || 'no_date'}`
        return index === self.findIndex(t => `${t.emp_id || t.employee_id}_${t.date || t.incentive_date || 'no_date'}` === key)
      })

      console.log('📊 Deduplication:', {
        originalCount: actualData.length,
        uniqueCount: uniqueData.length,
        duplicatesRemoved: actualData.length - uniqueData.length
      })

      const doc = new jsPDF()

      // Add title
      doc.setFontSize(16)
      doc.text('Incentive & Deduction Report', 20, 20)

      // Add table using simple text layout
      let yPosition = 40
      const lineHeight = 10

      // Table headers
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.text('S.No', 20, yPosition)
      doc.text('Name', 35, yPosition)
      doc.text('Father Name', 75, yPosition)
      doc.text('Designation', 115, yPosition)
      doc.text('Type', 155, yPosition)
      doc.text('Amount', 185, yPosition)

      yPosition += lineHeight

      // Table rows
      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')

      uniqueData.forEach((item, index) => {
        doc.text((index + 1).toString(), 20, yPosition)
        doc.text(item.name || '-', 35, yPosition)
        doc.text(item.f_name || item.father_name || '-', 75, yPosition)
        doc.text(item.designation || '-', 115, yPosition)
        doc.text(item.type || item.incentive_type || '-', 155, yPosition)
        doc.text((item.amount || item.incentive_amount || '0').toString(), 185, yPosition)
        yPosition += lineHeight
      })

      // Save PDF
      doc.save(`${filename}.pdf`)
      console.log('PDF export completed successfully')
    } catch (error) {
      console.error('PDF export error:', error)
      throw error
    }
  }


  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* First Row - From Date and To Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Date */}
          <div className="space-y-2">
            <label className="text-[#698592] text-[12px] font-medium">From Date</label>
            <div className="relative">
              <input
                type="date"
                value={formData.fromDate}
                onChange={handleFromDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <label className="text-[#698592] text-[12px] font-medium">To Date</label>
            <div className="relative">
              <input
                type="date"
                value={formData.toDate}
                onChange={handleToDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Second Row - Type and Branch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-[#698592] text-[12px] font-medium">Type</label>
            <CustomSelect
              placeHolderTitle="Both"
              value={formData.type}
              options={typeOptions}
              onChangeHandler={handleTypeChange}
              customStyles={false}
              isSearchable={false}
              isClearable={false}
            />
          </div>

          {/* Branch Selection */}
          <div className="space-y-2">
            <label className="text-[#698592] text-[12px] font-medium">Branch</label>
            <CustomSelect
              placeHolderTitle="Choose branch"
              value={formData.branch_id}
              options={[
                ALL_BRANCHES_OPTION,
                ...(branches_payroll?.map((branch) => ({
                  value: branch.id,
                  label: branch.branch_name
                })) || [])
              ]}
              onChangeHandler={handleBranchChange}
              customStyles={false}
              isSearchable={true}
              isClearable={false}
            />
          </div>
        </div>

        {/* Third Row - Department (Category disabled) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Selection (disabled per requirement) */}
          {/* <div className="space-y-2">
            <label className="text-[#698592] text-[12px] font-medium">Category</label>
            <CustomSelect
              placeHolderTitle="Select Category"
              value={formData.category}
              options={categoryOptions}
              onChangeHandler={handleCategoryChange}
              customStyles={false}
              isSearchable={false}
              isClearable={false}
            />
          </div> */}

          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-[#698592] text-[12px] font-medium">Department</label>
            <CustomSelect
              placeHolderTitle="Filter by dept"
              value={formData.department_id}
              options={departments || [ALL_DEPARTMENTS_OPTION]}
              onChangeHandler={handleDepartmentChange}
              customStyles={false}
              isSearchable={true}
              isClearable={false}
              disabled={!formData.branch_id || loading}
            />
            {loading && (
              <p className="text-xs text-gray-500 mt-1">Loading departments...</p>
            )}
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Export Options</h3>
          
          {/* Individual Attendance Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="individualAttendance"
              checked={formData.exportIndividualAttendance}
              onChange={handleIndividualAttendanceChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="individualAttendance" className="text-sm text-gray-700">
              Export an individual attendance
            </label>
          </div>

          {/* Employee Search - Show only when individual attendance is checked */}
          {formData.exportIndividualAttendance && (
            <div className="space-y-2">
              <label className="text-[#698592] text-[12px] font-medium">Search Employee (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  value={employeeSearchQuery}
                  onChange={handleEmployeeSearchChange}
                  placeholder="Type employee name or ID to search..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.branch_id || !formData.department_id}
                />
                
                {/* Clear button */}
                {employeeSearchQuery && (
                  <button
                    type="button"
                    onClick={clearEmployeeSelection}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}

                {/* Search dropdown */}
                {showEmployeeDropdown && employeeSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {employeeSearchResults.map((employee) => (
                      <div
                        key={employee.id}
                        onClick={() => handleEmployeeSelect(employee)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-xs text-gray-500">ID: {employee.employee_id} | {employee.department}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showEmployeeDropdown && employeeSearchResults.length === 0 && employeeSearchQuery.length >= 2 && !searchingEmployees && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-sm text-gray-500">
                    No employees found matching "{employeeSearchQuery}"
                  </div>
                )}
              </div>

              {/* Loading indicator */}
              {searchingEmployees && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  Searching employees...
                </div>
              )}

              {/* Selected employee display */}
              {formData.selectedEmployee && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Selected:</span> {formData.selectedEmployee.name}
                    <span className="text-blue-600"> (ID: {formData.selectedEmployee.employee_id})</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export Format Radio Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Export Format:</label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="exportPdf"
                  name="exportFormat"
                  value="pdf"
                  checked={formData.exportFormat === 'pdf'}
                  onChange={() => handleExportFormatChange('pdf')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="exportPdf" className="text-sm text-gray-700">
                  PDF
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="exportExcel"
                  name="exportFormat"
                  value="excel"
                  checked={formData.exportFormat === 'excel'}
                  onChange={() => handleExportFormatChange('excel')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="exportExcel" className="text-sm text-gray-700">
                  Excel
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button - Always show */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {/* <Button
            type="button"
            onClick={closeDrawer}
            className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Close
          </Button> */}
          <Button
            type="button"
            onClick={async () => {
              try {

                // If no data and individual employee is selected, try to fetch data first
                if ((!reportData || reportData.length === 0) && formData.selectedEmployee) {
                  console.log('🔄 No data found, attempting to fetch for selected employee...')
                  showToast('Fetching data for selected employee...', 'info')

                  // Try to fetch data for the selected employee
                  await handleAutoFetchData()

                  // Wait a moment for the data to be set
                  setTimeout(() => {
                    if (!reportData || reportData.length === 0) {
                      showToast('No incentive/deduction data found for the selected employee', 'warning')
                      return
                    }
                  }, 1000)
                  return
                }

                // Use reportData if available, otherwise show message
                if (!reportData || reportData.length === 0) {
                  showToast('No data available to export. Please ensure all fields are filled and data is loaded.', 'warning')
                  return
                }

                // Show export options instead of direct export
                setShowExportOptions(true)
              } catch (error) {
                console.error('Export error:', error)
                showToast('Error preparing export', 'error')
              }
            }}
            className="px-6 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Export
          </Button>
        </div>

        {/* Export Options - Show after clicking Export */}
        {showExportOptions && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose Export Format</h3>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={async () => {
                  try {
                    const timestamp = new Date().toISOString().split('T')[0]
                    const employeeInfo = formData.selectedEmployee
                      ? `_${formData.selectedEmployee.name.replace(/\s+/g, '_')}`
                      : '_All_Employees'
                    const filename = `Incentive_Deduction_Report_${timestamp}${employeeInfo}`

                    if (formData.exportFormat === 'excel') {
                      await exportToExcel(reportData, filename)
                      showToast('Excel file downloaded successfully', 'success')
                    } else {
                      // Default to Excel if no format selected
                      await exportToExcel(reportData, filename)
                      showToast('Excel file downloaded successfully', 'success')
                    }
                    setShowExportOptions(false)
                  } catch (error) {
                    console.error('Excel export error:', error)
                    showToast('Error exporting Excel file', 'error')
                  }
                }}
                className="px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Export as Excel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  try {
                    const timestamp = new Date().toISOString().split('T')[0]
                    const employeeInfo = formData.selectedEmployee
                      ? `_${formData.selectedEmployee.name.replace(/\s+/g, '_')}`
                      : '_All_Employees'
                    const filename = `Incentive_Deduction_Report_${timestamp}${employeeInfo}`

                    if (formData.exportFormat === 'pdf') {
                      exportToPDF(reportData, filename)
                      showToast('PDF file downloaded successfully', 'success')
                    } else {
                      // Default to PDF if no format selected
                      exportToPDF(reportData, filename)
                      showToast('PDF file downloaded successfully', 'success')
                    }
                    setShowExportOptions(false)
                  } catch (error) {
                    console.error('PDF export error:', error)
                    showToast('Error exporting PDF file', 'error')
                  }
                }}
                className="px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Export as PDF
              </Button>
              <Button
                type="button"
                onClick={() => setShowExportOptions(false)}
                className="px-4 py-2 text-gray-600 cursor-pointer bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IncentiveDeductionReportForm
