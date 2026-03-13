import React, { useState, useEffect, useMemo } from 'react'
import { Button, Input, Popover, PopoverContent, PopoverHandler } from '@material-tailwind/react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useStore from '../../Store/store'
import { gettingDepartmentsServices } from '../../services/__frequentApiServices'
import { showToast } from '../../Components/Toaster/Toaster'
import Calendar from 'react-calendar'
import { FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa'
import { useDebouncedValue } from '../../services/__debounceServices'
import { useDebounce } from '../../services/__debounceServices'
import { getOrganizationData, getUserData } from '../../Authentication/jwt_decode'

/** Format seconds to "X hrs Y min" for expected/earned. */
const formatSecondsToHrsMin = (seconds) => {
  if (seconds == null || Number(seconds) === 0) return '0 hrs 0 min'
  const total = Math.max(0, Math.floor(Number(seconds)))
  const hrs = Math.floor(total / 3600)
  const min = Math.floor((total % 3600) / 60)
  return `${hrs} hrs ${min} min`
}

/** Display value only when > 0; otherwise "—". */
const formatOptionalNum = (val) => {
  const n = parseFloat(val)
  if (Number.isNaN(n) || n <= 0) return '—'
  return Number(n).toLocaleString()
}

/** Payslip column definition: key, Excel header, PDF header, width, hide column when all values are 0 */
const PAYSLIP_COLUMNS = [
  { key: 'sNo', header: 'S.No', pdfHeader: 'S.No', width: 6, hideWhenAllZero: false },
  { key: 'employmentNumber', header: 'Employment #', pdfHeader: 'Emp #', width: 14, hideWhenAllZero: false },
  { key: 'name', header: 'Name', pdfHeader: 'Name', width: 40, hideWhenAllZero: false },
  { key: 'department', header: 'Department', pdfHeader: 'Department', width: 32, hideWhenAllZero: false },
  { key: 'designation', header: 'Designation', pdfHeader: 'Designation', width: 36, hideWhenAllZero: false },
  { key: 'empSalary', header: 'Emp Salary', pdfHeader: 'Salary', width: 14, hideWhenAllZero: true },
  { key: 'expected', header: 'Expected', pdfHeader: 'Expected', width: 10, hideWhenAllZero: false },
  { key: 'earned', header: 'Earned', pdfHeader: 'Earned', width: 10, hideWhenAllZero: false },
  { key: 'totalDays', header: 'Total Days', pdfHeader: 'Days', width: 12, hideWhenAllZero: false },
  { key: 'presentDays', header: 'Present Days', pdfHeader: 'Present', width: 16, hideWhenAllZero: false },
  { key: 'leaveDays', header: 'Leave Days', pdfHeader: 'Leave', width: 12, hideWhenAllZero: false },
  { key: 'absentDays', header: 'Absent Days', pdfHeader: 'Absent', width: 12, hideWhenAllZero: false },
  { key: 'overTime', header: 'Over Time', pdfHeader: 'OT', width: 12, hideWhenAllZero: true },
  { key: 'fuel', header: 'Fuel', pdfHeader: 'Fuel', width: 10, hideWhenAllZero: true },
  { key: 'lateMins', header: 'Late Mins', pdfHeader: 'Late', width: 10, hideWhenAllZero: true },
  { key: 'absenties', header: 'Absenties', pdfHeader: 'Abs', width: 10, hideWhenAllZero: true },
  { key: 'incomeTax', header: 'Income Tax', pdfHeader: 'Tax', width: 12, hideWhenAllZero: true },
  { key: 'eobi', header: 'EOBI', pdfHeader: 'EOBI', width: 10, hideWhenAllZero: true },
  { key: 'provident', header: 'Provident', pdfHeader: 'Provident', width: 12, hideWhenAllZero: true },
  { key: 'testing', header: 'Testing', pdfHeader: 'Testing', width: 10, hideWhenAllZero: true },
  { key: 'bikeLoan', header: 'Bike Loan', pdfHeader: 'Bike Loan', width: 12, hideWhenAllZero: true },
  { key: 'loan', header: 'Loan', pdfHeader: 'Loan', width: 12, hideWhenAllZero: true },
  { key: 'deduction', header: 'Deduction', pdfHeader: 'Deduct', width: 12, hideWhenAllZero: true },
  { key: 'totalPayableSalary', header: 'Total Payable', pdfHeader: 'Net Pay', width: 16, hideWhenAllZero: true },
]

/** Get columns to display: hide columns where hideWhenAllZero and every row value is <= 0 */
const getVisiblePayslipColumns = (data) => {
  if (!data || data.length === 0) return PAYSLIP_COLUMNS
  return PAYSLIP_COLUMNS.filter((col) => {
    if (!col.hideWhenAllZero) return true
    const hasAnyPositive = data.some((row) => (parseFloat(row[col.key]) || 0) > 0)
    return hasAnyPositive
  })
}

const ExportPayslip = () => {
  const [loading, setLoading] = useState(false)
  // Export states
  const [exportBranch, setExportBranch] = useState(null)
  const [exportDepartments, setExportDepartments] = useState([])
  const [exportDepartment, setExportDepartment] = useState(null)
  const [exportFilter, setExportFilter] = useState(null)
  const [exportStatus, setExportStatus] = useState(null)
  const [employeeIdSearch, setEmployeeIdSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)

  // Export functionality states
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [exportData, setExportData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [allPayslipsData, setAllPayslipsData] = useState([])
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false)

  // Get branches and payslips from store
  const getAllBranchesPayroll = useStore((state) => state.getAllBranchesPayroll)
  const copyBranchesData = useStore((state) => state.copyBranchesData)
  const gettingPayslips = useStore((state) => state.gettingPayslips)
  const payslips = useStore((state) => state.payslips)

  // Global drawer functions
  const openDrawer = useStore((state) => state.openDrawer)
  const closeDrawer = useStore((state) => state.closeDrawer)
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
  const settingDrawerSize = useStore((state) => state.settingDrawerSize)
  const settingComponent = useStore((state) => state.settingComponent)

  // Export drawer options
  const exportFilterOptions = [
    { value: 'status', label: 'Filter by status' },
    { value: 'employee_id', label: 'Filter by Employee ID/Name' },
    { value: 'specific_month', label: 'Filter by month' }
  ]

  const exportStatusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'due', label: 'Due' }
  ]

  // Month options for selection
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

  // Prepare branch options with "All Branches" first (memoized so Select doesn't get new reference every render)
  const branchOptions = useMemo(() => {
    const allBranch = { value: 0, label: 'All Branches' }
    if (!copyBranchesData || !Array.isArray(copyBranchesData)) return [allBranch]
    const list = copyBranchesData.map((branch) => ({
      value: branch.id,
      label: branch.branch_name
    }))
    return [allBranch, ...list]
  }, [copyBranchesData])

  // Debug branch data (commented out to prevent infinite logs)
  // console.log('🔍 ExportPayslip - copyBranchesData:', copyBranchesData)
  // console.log('🔍 ExportPayslip - branchOptions:', branchOptions)
  // console.log('🔍 ExportPayslip - exportBranch:', exportBranch)

  // Export drawer handlers
  const handleExportBranchChange = async (selectedOption) => {
    console.log('Export Branch Changed:', selectedOption)
    setExportBranch(selectedOption)
    setExportDepartment(null) // Reset department when branch changes

    if (selectedOption && (selectedOption.value === 0 || selectedOption.value === '0' || selectedOption.value)) {
      try {
        const branchId = selectedOption.value === 0 || selectedOption.value === '0' ? 0 : selectedOption.value
        const departmentsData = await gettingDepartmentsServices(branchId)
        const formattedDepartments = Array.isArray(departmentsData) ? departmentsData : []
        const withAllDept = [{ value: 0, label: 'All Departments' }, ...formattedDepartments]
        setExportDepartments(withAllDept)
        console.log('Export Departments loaded:', withAllDept.length)
      } catch (error) {
        console.error('Error loading departments:', error)
        setExportDepartments([{ value: 0, label: 'All Departments' }])
      }
    } else {
      setExportDepartments([])
    }
  }

  const handleExportDepartmentChange = (selectedOption) => {
    console.log('Export Department Changed:', selectedOption)
    setExportDepartment(selectedOption)
  }

  const handleExportFilterChange = (selectedOption) => {
    console.log('Export Filter Changed:', selectedOption)
    setExportFilter(selectedOption)
    // Reset dependent fields when filter changes
    setExportStatus(null)
    setEmployeeIdSearch('')
    setSelectedMonth(null)
    setSelectedYear(null)
  }

  const handleExportStatusChange = (selectedOption) => {
    console.log('Export Status Changed:', selectedOption)
    setExportStatus(selectedOption)
  }

  const handleMonthChange = (selectedOption) => {
    setSelectedMonth(selectedOption)
  }

  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption)
  }

  // Year options: current year and past several years
  const currentYear = new Date().getFullYear()
  const yearOptions = useMemo(() => {
    const years = []
    for (let y = currentYear; y >= currentYear - 5; y--) {
      years.push({ value: String(y), label: String(y) })
    }
    return years
  }, [])

  // Debounced search term
  const debouncedSearchTerm = useDebouncedValue(employeeIdSearch, 300)

  // Derived search results (no useEffect = no setState loop). Used for dropdown list.
  // Filter by employee ID or Name only (not designation)
  const employeeSearchResultsDerived = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 1) return []
    if (!allPayslipsData || allPayslipsData.length === 0) return []
    const searchTermLower = debouncedSearchTerm.toLowerCase()
    return allPayslipsData.filter((payslip) => {
      const empId = String(payslip.emp_id || '').toLowerCase()
      const empName = (payslip.wf_employee?.name || '').toLowerCase()
      const altEmpName = (payslip.name || '').toLowerCase()
      const altEmpId = (payslip.employee_id || '').toLowerCase()
      return (
        empId.includes(searchTermLower) ||
        empName.includes(searchTermLower) ||
        altEmpName.includes(searchTermLower) ||
        altEmpId.includes(searchTermLower)
      )
    })
  }, [debouncedSearchTerm, allPayslipsData])

  // Show dropdown when user has typed and we have derived results (or show "no results" / "select branch" messages)
  const showSearchDropdown = searchDropdownOpen && employeeIdSearch.length > 0
  const searchResultsToShow = showSearchDropdown ? employeeSearchResultsDerived : []

  const handleEmployeeSearchChange = (e) => {
    const value = e.target.value
    setEmployeeIdSearch(value)
    setSearchDropdownOpen(true)
  }

  const handleExportSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Build params for API (branch, department + filter: status / employee / month)
      const params = {
        page: 0,
        limit: 9999
      }
      if (exportBranch != null && (exportBranch.value === 0 || exportBranch.value === '0' || exportBranch.value)) {
        params.branch_id = exportBranch.value
      }
      if (exportDepartment != null && (exportDepartment.value === 0 || exportDepartment.value === '0' || exportDepartment.value)) {
        params.department_id = exportDepartment.value
      }
      // Pass filter to API so backend can filter
      if (exportFilter?.value === 'status' && exportStatus?.value) {
        params.status = exportStatus.value
      } else if (exportFilter?.value === 'employee_id' && employeeIdSearch.trim()) {
        const search = employeeIdSearch.trim()
        const looksLikeId = /^\d+$/.test(search)
        params.filter = looksLikeId ? 'emp_id' : 'emp_name'
        params.search = search
      } else if (exportFilter?.value === 'specific_month' && selectedYear?.value && selectedMonth?.value) {
        params.salary_month = `${selectedYear.value}-${selectedMonth.value}`
      }
      
      console.log('🔍 Fetching export data with params:', params)
      
      await gettingPayslips(params, true)
      
      const currentPayslips = useStore.getState().payslips
      const hasData = currentPayslips && Array.isArray(currentPayslips) && currentPayslips.length > 0
      if (currentPayslips && Array.isArray(currentPayslips)) {
        setAllPayslipsData(currentPayslips)
        const transformedData = currentPayslips.map((payslip, index) => {
          const totalWorkingSec = payslip.total_working != null ? Number(payslip.total_working) : 0
          const totalPresentSec = payslip.total_present != null ? Number(payslip.total_present) : 0
          const totalWorkingHours = totalWorkingSec / 3600
          const totalDays = payslip.payslip_config?.total_days != null
            ? parseInt(payslip.payslip_config.total_days, 10)
            : Math.round(totalWorkingHours / 8)
          const presentDays = Math.round(totalPresentSec / 3600 / 8)
          const absentDays = Math.max(0, totalDays - presentDays)
          const leaveDays = payslip.leave_days != null ? parseInt(payslip.leave_days, 10) : 0
          return {
            sNo: index + 1,
            employmentNumber: payslip.emp_id || '',
            name: payslip.wf_employee?.name || payslip.name || '',
            department: payslip.wf_employee?.department?.name || payslip.wf_employee?.department_name || payslip.wf_depts?.name || payslip.department_name || '',
            designation: payslip.wf_employee?.designation?.title || payslip.wf_employee?.designation || payslip.designation || '',
            empSalary: parseFloat(payslip.salary_amount || 0),
            expected: formatSecondsToHrsMin(payslip.total_working),
            earned: formatSecondsToHrsMin(payslip.total_present),
            totalDays: totalDays || '',
            presentDays: presentDays ?? '',
            leaveDays: leaveDays ?? '',
            absentDays: absentDays ?? '',
            overTime: parseFloat(payslip.overtime_amount || 0),
            fuel: parseFloat(payslip.fuel_allowance || 0),
            lateMins: parseFloat(payslip.late_minutes || 0),
            absenties: parseFloat(payslip.absent_days || 0),
            incomeTax: parseFloat(payslip.income_tax?.amount ?? payslip.income_tax ?? 0),
            eobi: parseFloat(payslip.eobi_record?.emp_contribution ?? payslip.eobi ?? 0),
            provident: parseFloat(payslip.provident_fund || 0),
            testing: parseFloat(payslip.testing_allowance || 0),
            bikeLoan: parseFloat(payslip.bike_loan || 0),
            loan: parseFloat(payslip.loan_deduction || 0),
            deduction: parseFloat(payslip.total_deductions || 0),
            totalPayableSalary: parseFloat(payslip.paid_amount || 0)
          }
        })
        setExportData(transformedData)
        if (hasData) {
          setShowExportOptions(true)
          showToast(`Data loaded successfully (${currentPayslips.length} records). Choose export format.`, 'success')
        } else {
          setShowExportOptions(false)
          showToast('No data found for the selected filters.', 'warning')
        }
      } else {
        setExportData([])
        setShowExportOptions(false)
        showToast('No data for selected branch/department.', 'warning')
      }
    } catch (error) {
      console.error('Error fetching export data:', error)
      showToast('Error loading data for export', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const getCellDisplayValue = (row, col) => {
    const val = row[col.key]
    if (col.hideWhenAllZero && (parseFloat(val) || 0) <= 0) return '—'
    if (col.key === 'empSalary' || col.key === 'totalPayableSalary') {
      return (parseFloat(val) || 0) > 0 ? Number(val) : '—'
    }
    if (['overTime', 'fuel', 'lateMins', 'absenties', 'incomeTax', 'eobi', 'provident', 'testing', 'bikeLoan', 'loan', 'deduction'].includes(col.key)) {
      return formatOptionalNum(val)
    }
    if (col.key === 'name' || col.key === 'department' || col.key === 'designation' || col.key === 'employmentNumber') {
      return val || '—'
    }
    return val
  }

  const handleExcelExport = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default
      const visibleCols = getVisiblePayslipColumns(exportData)
      const colCount = visibleCols.length

      const orgName = getOrganizationData()?.orgName || getUserData()?.org_name || 'Organization Name'
      const reportDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Payslips', { views: [{ rightToLeft: false }] })

      sheet.columns = visibleCols.map((col) => ({ width: col.width }))

      const ORG_HEADER_BG = 'FF1F4E79'
      const DATE_HEADER_BG = 'FF2E75B6'
      const COLUMN_HEADER_BG = 'FF1F4E79'
      const GRID_COLOR = 'FFD1D5DB'
      const ROW_FILL_WHITE = 'FFFFFFFF'

      const orgRow = sheet.addRow([`Organization: ${orgName}`])
      orgRow.height = 26
      sheet.mergeCells(1, 1, 1, colCount)
      orgRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
      orgRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }
      orgRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ORG_HEADER_BG } }

      const titleRow = sheet.addRow([`Payslips Export — ${reportDate}`])
      titleRow.height = 28
      sheet.mergeCells(2, 1, 2, colCount)
      titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
      titleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }
      titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DATE_HEADER_BG } }

      const headerLabels = visibleCols.map((c) => c.header)
      const headerRow = sheet.addRow(headerLabels)
      headerRow.height = 22
      for (let c = 1; c <= colCount; c++) {
        const cell = headerRow.getCell(c)
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLUMN_HEADER_BG } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      }

      if (exportData.length > 0) {
        exportData.forEach((row) => {
          const cellValues = visibleCols.map((col) => getCellDisplayValue(row, col))
          const dataRow = sheet.addRow(cellValues)
          dataRow.height = 20
          for (let c = 1; c <= colCount; c++) {
            const cell = dataRow.getCell(c)
            const col = visibleCols[c - 1]
            const isNumCol = ['sNo', 'empSalary', 'totalDays', 'presentDays', 'leaveDays', 'absentDays', 'overTime', 'fuel', 'lateMins', 'absenties', 'incomeTax', 'eobi', 'provident', 'testing', 'bikeLoan', 'loan', 'deduction', 'totalPayableSalary'].includes(col.key)
            cell.alignment = { horizontal: isNumCol ? 'center' : 'left', vertical: 'middle', wrapText: false }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_FILL_WHITE } }
            cell.border = {
              top: { style: 'thin', color: { argb: GRID_COLOR } },
              bottom: { style: 'thin', color: { argb: GRID_COLOR } },
              left: { style: 'thin', color: { argb: GRID_COLOR } },
              right: { style: 'thin', color: { argb: GRID_COLOR } },
            }
          }
        })
      }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payslips_export_${new Date().toISOString().split('T')[0]}.xlsx`
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showToast('Excel file downloaded successfully', 'success')
      closeDrawer()
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      showToast('Error exporting to Excel', 'error')
    }
  }
  
  const handlePdfExport = () => {
    try {
      const printWindow = window.open('', '_blank', 'width=1000,height=700')
      if (!printWindow) {
        showToast('Please allow popups to print PDF', 'warning')
        return
      }
      const visibleCols = getVisiblePayslipColumns(exportData)
      const colCount = visibleCols.length
      const numHeaderKeys = ['sNo', 'empSalary', 'totalDays', 'presentDays', 'leaveDays', 'absentDays', 'overTime', 'fuel', 'lateMins', 'absenties', 'incomeTax', 'eobi', 'provident', 'testing', 'bikeLoan', 'loan', 'deduction', 'totalPayableSalary']

      const orgName = getOrganizationData()?.orgName || getUserData()?.org_name || 'Organization Name'
      const reportDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      const tableRows =
        exportData.length > 0
          ? exportData.map(
              (row) => {
                const tds = visibleCols.map((col) => {
                  const val = getCellDisplayValue(row, col)
                  const display = typeof val === 'number' ? Number(val).toLocaleString() : val
                  const isNum = numHeaderKeys.includes(col.key)
                  return `<td class="${isNum ? 'td-num' : ''}">${display}</td>`
                }).join('')
                return `<tr class="row-body">${tds}</tr>`
              }
            ).join('')
          : `<tr><td colspan="${colCount}" class="no-data">No data available for export.</td></tr>`

      const pdfHeaders = visibleCols.map((col) => {
        const isNum = numHeaderKeys.includes(col.key)
        return isNum ? `<th class="th-num">${col.pdfHeader}</th>` : `<th>${col.pdfHeader}</th>`
      }).join('')
      const colgroupCols = visibleCols.map(() => '<col class="col-dyn">').join('')

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payslips Export</title>
          <style>
            @page { margin: 1cm; size: A4 landscape; }
            * { box-sizing: border-box; }
            body { margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
            .header-org { background: #1F4E79; color: #fff; padding: 12px 20px; text-align: left; font-weight: 700; font-size: 15px; letter-spacing: 0.02em; }
            .header-date { background: #2E75B6; color: #fff; padding: 14px 20px; text-align: left; font-weight: 700; font-size: 17px; letter-spacing: 0.02em; }
            .table-wrap { overflow-x: auto; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 11px; }
            col.col-dyn { min-width: 50px; }
            th, td { padding: 10px 8px; border: 1px solid #e2e8f0; }
            th { background: #1F4E79; color: #fff; font-weight: 600; font-size: 10px; text-align: left; white-space: nowrap; }
            th.th-num { text-align: right; }
            .row-body td { background: #fff; color: #334155; }
            .row-body td.td-num { text-align: right; font-variant-numeric: tabular-nums; }
            .no-data { text-align: center; padding: 40px; color: #64748b; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header-org">Organization: ${orgName}</div>
          <div class="header-date">Payslips Export — ${reportDate}</div>
          <div class="table-wrap">
            <table>
              <colgroup>${colgroupCols}</colgroup>
              <thead>
                <tr>${pdfHeaders}</tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </body>
        </html>
      `
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
        setTimeout(() => printWindow.close(), 1000)
      }
      showToast('PDF print dialog opened', 'success')
      closeDrawer()
    } catch (error) {
      console.error('Error printing PDF:', error)
      showToast('Error printing PDF', 'error')
    }
  }

  const handleCancel = () => {
    setExportBranch(null)
    setExportDepartment(null)
    setExportDepartments([])
    setExportFilter(null)
    setExportStatus(null)
    setEmployeeIdSearch('')
    setSelectedMonth(null)
    setSelectedYear(null)
    setShowExportOptions(false)
    setExportData([])
    setAllPayslipsData([])
    setSearchDropdownOpen(false)
    closeDrawer()
  }

  const canExport = () => {
    if (!exportBranch || !exportDepartment) return false
    if (exportFilter?.value === 'specific_month') return !!(selectedYear && selectedMonth)
    return true
  }

  // Load branches on component mount (use length so we don't re-run when store returns new array reference)
  const branchesLength = copyBranchesData && Array.isArray(copyBranchesData) ? copyBranchesData.length : 0
  useEffect(() => {
    if (branchesLength === 0) {
      getAllBranchesPayroll()
    }
  }, [branchesLength])

  // Click outside handler to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDropdownOpen) {
        const searchContainer = event.target.closest('.employee-search-container')
        if (!searchContainer) {
          setSearchDropdownOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchDropdownOpen])

  // Load payslips data when branch and department are selected (depend on primitive values to avoid object-reference loops)
  const branchValue = exportBranch?.value ?? null
  const departmentValue = exportDepartment?.value ?? null
  useEffect(() => {
    const loadPayslipsForSearch = async () => {
      if (branchValue != null && departmentValue != null) {
        try {
          const params = {
            branch_id: branchValue,
            department_id: departmentValue
          }
          await gettingPayslips(params, true)
          setTimeout(() => {
            const currentPayslips = useStore.getState().payslips
            if (currentPayslips && Array.isArray(currentPayslips)) {
              setAllPayslipsData(currentPayslips)
            }
          }, 500)
        } catch (error) {
          console.error('Error loading payslips for search:', error)
        }
      } else {
        if (allPayslipsData.length > 0) setAllPayslipsData([])
        setSearchDropdownOpen(false)
      }
    }

    loadPayslipsForSearch()
  }, [branchValue, departmentValue])


  return (
    <div className='p-6 space-y-6'>
      <div className='flex gap-4'>
        {/* Select Branch */}
        <div className='flex-1'>
          <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Branch</label>
          <div className='w-full'>
            <CustomSelect
              key={`export-branch-select-${exportBranch?.value || 'empty'}`}
              placeHolderTitle='Select Branch'
              value={exportBranch}
              options={branchOptions}
              onChangeHandler={handleExportBranchChange}
              customStyles={false}
            />
          </div>
        </div>

        {/* Select Department */}
        <div className='flex-1'>
          <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Department</label>
          <div className='w-full'>
            <CustomSelect
              key={`export-department-select-${exportDepartment?.value || 'empty'}`}
              placeHolderTitle='Select Department'
              value={exportDepartment}
              options={exportDepartments}
              onChangeHandler={handleExportDepartmentChange}
              customStyles={false}
              disabled={!exportBranch}
            />
          </div>
        </div>
      </div>

      {/* Select Filter and Conditional Fields - Properly Aligned */}
      <div className='flex items-start gap-6'>
        {/* Select Filter */}
        <div className='w-[250px]'>
          <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Filter</label>
          <CustomSelect
            key={`export-filter-select-${exportFilter?.value || 'empty'}`}
            placeHolderTitle='Select Filter'
            value={exportFilter}
            options={exportFilterOptions}
            onChangeHandler={handleExportFilterChange}
            customStyles={false}
            isClearable={false}
            isSearchable={false}
          />
        </div>

        {/* Conditional Fields - Aligned to the right with proper margin */}
        <div className='flex-1'>
          {/* Status Dropdown */}
          {exportFilter?.value === 'status' && (
            <div>
              <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Status</label>
              <div className='w-[250px]'>
                <CustomSelect
                  key={`export-status-select-${exportStatus?.value || 'empty'}`}
                  placeHolderTitle='Select Status'
                  value={exportStatus}
                  options={exportStatusOptions}
                  onChangeHandler={handleExportStatusChange}
                  customStyles={false}
                  isClearable={false}
                  isSearchable={false}
                />
              </div>
            </div>
          )}

          {/* Employee Search Input */}
          {exportFilter?.value === 'employee_id' && (
            <div>
              <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Search by Employee ID / Name</label>
              <div className='w-[300px] relative employee-search-container'>
                <Input
                  label='Employee ID or Name'
                  color='blue'
                  value={employeeIdSearch}
                  onChange={handleEmployeeSearchChange}
                  placeholder='Type ID or name to search...'
                />
                
                {/* Search Results Dropdown */}
                {searchResultsToShow.length > 0 && (
                  <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto'>
                    <div className='px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b'>
                      Found {searchResultsToShow.length} employee(s)
                    </div>
                    {searchResultsToShow.map((employee, index) => (
                      <div
                        key={index}
                        className='px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                        onClick={() => {
                          setEmployeeIdSearch(employee.wf_employee?.name || employee.emp_id || '')
                          setSearchDropdownOpen(false)
                        }}
                      >
                        <div className='text-sm font-medium text-gray-900'>
                          {employee.wf_employee?.name || 'N/A'}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          <span className='font-medium'>ID:</span> {employee.emp_id || 'N/A'}
                          {employee.wf_employee?.department?.name && (
                            <> &middot; <span className='font-medium'>Dept:</span> {employee.wf_employee.department.name}</>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show loading or no data message */}
                {employeeIdSearch.length > 0 && searchResultsToShow.length === 0 && allPayslipsData.length > 0 && (
                  <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3'>
                    <div className='text-sm text-gray-500 text-center'>
                      No employees found matching "{employeeIdSearch}"
                    </div>
                  </div>
                )}
                
                {/* Show message when no data is loaded */}
                {employeeIdSearch.length > 0 && allPayslipsData.length === 0 && (
                  <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3'>
                    <div className='text-sm text-gray-500 text-center'>
                      Please select branch and department first
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Year and Month Selection */}
          {exportFilter?.value === 'specific_month' && (
            <div className='flex gap-4'>
              <div>
                <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Year</label>
                <div className='w-[140px]'>
                  <CustomSelect
                    key={`export-year-select-${selectedYear?.value || 'empty'}`}
                    placeHolderTitle='Year'
                    value={selectedYear}
                    options={yearOptions}
                    onChangeHandler={handleYearChange}
                    customStyles={false}
                    isClearable={false}
                    isSearchable={false}
                  />
                </div>
              </div>
              <div>
                <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Month</label>
                <div className='w-[200px]'>
                  <CustomSelect
                    key={`export-month-select-${selectedMonth?.value || 'empty'}`}
                    placeHolderTitle='Month'
                    value={selectedMonth}
                    options={monthOptions}
                    onChangeHandler={handleMonthChange}
                    customStyles={false}
                    isClearable={false}
                    isSearchable={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-end gap-3 pt-6'>
        <Button
          variant='outlined'
          color='blue-gray'
          onClick={handleCancel}
          className='px-6'
        >
          Cancel
        </Button>
        
        {!showExportOptions ? (
        <Button
          color='blue'
          onClick={handleExportSubmit}
          className='px-6'
          disabled={isLoading || !canExport()}
        >
          {isLoading ? 'Loading...' : 'Export'}
        </Button>
        ) : (
          <div className='flex gap-3'>
            <Button
              color='green'
              onClick={handleExcelExport}
              className='px-6 py-2 flex items-center gap-2'
            >
              <FaFileExcel className='text-lg' />
              Excel
            </Button>
            
            <Button
              color='red'
              onClick={handlePdfExport}
              className='px-6 py-2 flex items-center gap-2'
            >
              <FaFilePdf className='text-lg' />
              PDF
        </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExportPayslip
