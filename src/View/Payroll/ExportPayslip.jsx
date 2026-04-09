import React, { useState, useEffect, useMemo } from 'react'
import { Button, Input, Popover, PopoverContent, PopoverHandler } from '@material-tailwind/react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useStore from '../../Store/store'
import { gettingDepartmentsServices } from '../../services/__frequentApiServices'
import { showToast } from '../../Components/Toaster/Toaster'
import Calendar from 'react-calendar'
import { FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa'
import { useDebouncedValue } from '../../services/__debounceServices'
// OLD: import { useDebounce } from '../../services/__debounceServices'
import { getOrganizationData, getUserData } from '../../Authentication/jwt_decode'
import payrollApi from '../../Model/Data/Payroll/Payroll'

/** Split IDs into batches for bulk-details API (avoid oversized payloads). */
const chunkIds = (ids, size) => {
  const out = []
  for (let i = 0; i < ids.length; i += size) out.push(ids.slice(i, i + size))
  return out
}

/**
 * Merge full payslip rows from bulk-details into the same order as list results.
 * List GET often omits nested wf_employee / attendance_summary / seconds fields.
 */
/** Fetch payslips without touching global store (Making Payments must not refresh when export filters change). */
const fetchPayslipsListForExport = async (params) => {
  const response = await payrollApi.getPayslips(params)
  const data = response?.data
  if (data?.STATUS === 'SUCCESSFUL' && Array.isArray(data?.DB_DATA?.payslips)) {
    return data.DB_DATA.payslips
  }
  return []
}

const enrichPayslipsWithBulkDetails = async (listPayslips) => {
  if (!listPayslips?.length) return listPayslips
  const ids = listPayslips.map((p) => p.id).filter((id) => id != null && id !== '')
  if (ids.length === 0) return listPayslips

  const mergedById = new Map()
  const batches = chunkIds(ids, 100)
  for (const batch of batches) {
    try {
      const response = await payrollApi.getPayslipsBulkDetails(batch)
      const data = response?.data
      if (data?.STATUS === 'SUCCESSFUL' && Array.isArray(data?.DB_DATA?.payslips)) {
        data.DB_DATA.payslips.forEach((p) => {
          if (p?.id != null) mergedById.set(p.id, p)
        })
      }
    } catch (e) {
      console.warn('getPayslipsBulkDetails batch failed:', e)
    }
  }
  if (mergedById.size === 0) return listPayslips
  return listPayslips.map((p) => mergedById.get(p.id) || p)
}

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

/** Main columns (single header row in PDF; Excel merges with row below for earnings/deductions block). */
const PAYSLIP_MAIN_COLUMNS = [
  { key: 'sNo', header: 'S.No', pdfHeader: '#', width: 7, hideWhenAllZero: false },
  { key: 'employmentNumber', header: 'Emp #', pdfHeader: 'Emp #', width: 13, hideWhenAllZero: false },
  { key: 'name', header: 'Name', pdfHeader: 'Name', width: 34, hideWhenAllZero: false },
  { key: 'branch', header: 'Branch', pdfHeader: 'Branch', width: 22, hideWhenAllZero: false },
  { key: 'department', header: 'Dept', pdfHeader: 'Dept', width: 24, hideWhenAllZero: false },
  { key: 'designation', header: 'Designation', pdfHeader: 'Title', width: 30, hideWhenAllZero: false },
  { key: 'empSalary', header: 'Emp Salary', pdfHeader: 'Emp Salary', width: 14, hideWhenAllZero: true },
  { key: 'expected', header: 'Expected Hrs', pdfHeader: 'Exp. Hrs', width: 20, hideWhenAllZero: false },
  { key: 'earned', header: 'Earned Hrs', pdfHeader: 'Earn. Hrs', width: 20, hideWhenAllZero: false },
  { key: 'totalDays', header: 'Total Days', pdfHeader: 'Tot. Days', width: 12, hideWhenAllZero: false },
  { key: 'presentDays', header: 'Present Days', pdfHeader: 'Pres. Days', width: 13, hideWhenAllZero: false },
  { key: 'leaveDays', header: 'Total Leaves', pdfHeader: 'Tot. Leaves', width: 13, hideWhenAllZero: false },
  { key: 'absentDays', header: 'Absent Days', pdfHeader: 'Abs. Days', width: 12, hideWhenAllZero: false },
  { key: 'overtimeMinutes', header: 'OT (mins)', pdfHeader: 'OT min', width: 11, hideWhenAllZero: true },
  { key: 'status', header: 'Status', pdfHeader: 'Status', width: 12, hideWhenAllZero: false },
  /* OLD alternative PAYSLIP_COLUMNS (incoming merge): no med/incentives/increments/status; had `absenties`
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
  */
]

/** Earnings — parent group (after main). Incentive line items from `incentive_deduction_details` are added dynamically before these. */
const PAYSLIP_EARNINGS_COLUMNS = [
  { key: 'taDa', header: 'TA / DA', pdfHeader: 'TA/DA', width: 12, hideWhenAllZero: true },
  { key: 'medAllowance', header: 'Med Allowance', pdfHeader: 'Med', width: 14, hideWhenAllZero: true },
  { key: 'increments', header: 'Increments', pdfHeader: 'Incr.', width: 13, hideWhenAllZero: true },
  { key: 'overtimeAmount', header: 'Overtime (amount)', pdfHeader: 'OT Amt', width: 14, hideWhenAllZero: true },
  { key: 'fuel', header: 'Fuel', pdfHeader: 'Fuel', width: 10, hideWhenAllZero: true },
]

/** Last column(s) after Earnings & Deductions groups. */
const PAYSLIP_TRAILING_COLUMNS = [
  { key: 'totalPayableSalary', header: 'Net Pay', pdfHeader: 'Net Pay', width: 15, hideWhenAllZero: true },
]

/** Deductions — parent group at end (after Earnings). */
const PAYSLIP_DEDUCTIONS_COLUMNS = [
  { key: 'incomeTax', header: 'Income Tax', pdfHeader: 'Tax', width: 12, hideWhenAllZero: true },
  { key: 'eobi', header: 'EOBI', pdfHeader: 'EOBI', width: 10, hideWhenAllZero: true },
  { key: 'provident', header: 'Provident Fund', pdfHeader: 'PF', width: 16, hideWhenAllZero: true },
  { key: 'bikeLoan', header: 'Bike Loan', pdfHeader: 'Bike', width: 11, hideWhenAllZero: true },
  { key: 'loan', header: 'Loan', pdfHeader: 'Loan', width: 11, hideWhenAllZero: true },
  { key: 'lateMins', header: 'Late (mins)', pdfHeader: 'Late', width: 12, hideWhenAllZero: true },
]

const filterColumnsByZero = (columns, data) => {
  if (!data || data.length === 0) return columns
  return columns.filter((col) => {
    if (!col.hideWhenAllZero) return true
    const hasAnyPositive = data.some((row) => (parseFloat(row[col.key]) || 0) > 0)
    return hasAnyPositive
  })
}

const slugifyIncentiveTitle = (title) => {
  const s = String(title || 'item')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return s || 'item'
}

/** `details.d_type` for incentive-style rows (API may use INCENTIVE or INCENTIVES). */
const isIncentiveDType = (dType) => {
  const u = String(dType || '')
    .toUpperCase()
    .trim()
  return u === 'INCENTIVE' || u === 'INCENTIVES'
}

const getIncentiveDeductionLineTitle = (item) => {
  const t = item?.details?.title != null ? String(item.details.title).trim() : ''
  return t || `Line ${item?.id ?? ''}`
}

/**
 * Scan all payslips for unique incentive/deduction line titles from `incentive_deduction_details`
 * (by details.d_type INCENTIVE* vs other).
 */
const buildExportColumnMeta = (payslips) => {
  const incentiveMap = new Map()
  const deductionMap = new Map()
  ;(payslips || []).forEach((p) => {
    const arr = Array.isArray(p.incentive_deduction_details) ? p.incentive_deduction_details : []
    arr.forEach((item) => {
      const dType = item?.details?.d_type
      const title = getIncentiveDeductionLineTitle(item)
      const slug = slugifyIncentiveTitle(title)
      if (isIncentiveDType(dType)) {
        incentiveMap.set(slug, title)
      } else if (dType) {
        deductionMap.set(slug, title)
      }
    })
  })
  const makeDyn = (slug, title, prefix) => ({
    key: `${prefix}${slug}`,
    header: title,
    pdfHeader: title.length > 14 ? `${title.slice(0, 12)}…` : title,
    width: 16,
    hideWhenAllZero: true,
  })
  return {
    incentiveCols: [...incentiveMap.entries()].map(([slug, title]) => makeDyn(slug, title, 'earn_dyn_')),
    deductionCols: [...deductionMap.entries()].map(([slug, title]) => makeDyn(slug, title, 'ded_dyn_')),
  }
}

/** Grouped visible columns: Main → Earnings (dynamic + static) → Deductions (dynamic + static) → Net Pay. */
const getVisiblePayslipColumnGroups = (data, columnMeta) => {
  const meta = columnMeta || { incentiveCols: [], deductionCols: [] }
  const earnings = [
    ...filterColumnsByZero(meta.incentiveCols || [], data),
    ...filterColumnsByZero(PAYSLIP_EARNINGS_COLUMNS, data),
  ]
  const deductions = [
    ...filterColumnsByZero(meta.deductionCols || [], data),
    ...filterColumnsByZero(PAYSLIP_DEDUCTIONS_COLUMNS, data),
  ]
  return {
    main: filterColumnsByZero(PAYSLIP_MAIN_COLUMNS, data),
    earnings,
    deductions,
    trailing: filterColumnsByZero(PAYSLIP_TRAILING_COLUMNS, data),
  }
}

const getVisiblePayslipColumns = (data, columnMeta) => {
  const g = getVisiblePayslipColumnGroups(data, columnMeta)
  return [...g.main, ...g.earnings, ...g.deductions, ...g.trailing]
}

const buildSearchableEmployeeText = (payslip) => {
  const wfEmployee = payslip?.wf_employee || {}
  return [
    payslip?.emp_id,
    payslip?.employee_id,
    wfEmployee?.emp_id,
    wfEmployee?.employee_id,
    wfEmployee?.bio_id,
    wfEmployee?.name,
    payslip?.name,
    `${wfEmployee?.first_name || ''} ${wfEmployee?.last_name || ''}`.trim(),
  ]
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
    .map((value) => String(value).toLowerCase())
}

const getPayslipEmployeeName = (payslip) => {
  const wfEmployee = payslip?.wf_employee || {}
  const fullName = `${wfEmployee?.first_name || ''} ${wfEmployee?.last_name || ''}`.trim()
  return (
    wfEmployee?.name ||
    payslip?.name ||
    fullName ||
    'N/A'
  )
}

const getPayslipEmployeeId = (payslip) => {
  const wfEmployee = payslip?.wf_employee || {}
  return payslip?.emp_id || payslip?.employee_id || wfEmployee?.emp_id || wfEmployee?.employee_id || wfEmployee?.bio_id || 'N/A'
}

/** Match IndividualPayslipPreview number coercion (null/invalid → 0). */
const toExportNum = (value) => {
  if (value === null || value === undefined || value === '' || String(value).trim() === '') return 0
  const numValue = typeof value === 'string' ? parseFloat(String(value).replace(/,/g, '')) : Number(value)
  return Number.isNaN(numValue) ? 0 : numValue
}

const extractExportDepartment = (payslip) => {
  const wfEmployee = payslip?.wf_employee || {}
  const raw =
    wfEmployee.department_name ||
    wfEmployee.department?.name ||
    wfEmployee.dept?.name ||
    wfEmployee.dept_name ||
    payslip.department_name ||
    payslip.dept_name ||
    payslip.wf_depts?.name ||
    payslip.wf_department?.name ||
    ''
  return raw != null && String(raw).trim() !== '' ? String(raw).trim() : ''
}

const extractExportDesignation = (payslip) => {
  const wfEmployee = payslip?.wf_employee || {}
  const des = wfEmployee.designation ?? payslip.designation
  if (typeof des === 'string' && des.trim()) return des.trim()
  if (des && typeof des === 'object') {
    const t = des.title ?? des.name ?? des.designation
    if (t != null && String(t).trim() !== '') return String(t).trim()
  }
  return (
    payslip.wf_designation?.title ||
    payslip.wf_designation?.name ||
    ''
  )
}

const extractExportBranch = (payslip) => {
  const wfEmployee = payslip?.wf_employee || {}
  const raw =
    payslip.branch_name ||
    wfEmployee.branch_name ||
    wfEmployee.branch?.name ||
    wfEmployee.branch?.branch_name ||
    payslip.wf_branch?.name ||
    payslip.wf_branch?.branch_name ||
    ''
  return raw != null && String(raw).trim() !== '' ? String(raw).trim() : ''
}

const extractProvidentFundTotal = (pf) => {
  if (pf == null || pf === '') return 0
  if (typeof pf === 'object' && pf !== null) {
    if (pf.total_pf != null && pf.total_pf !== '') return toExportNum(pf.total_pf)
    const emp = toExportNum(pf.emp_contribution)
    const er = toExportNum(pf.employer_contribution)
    if (emp > 0 || er > 0) return emp + er
  }
  return toExportNum(pf)
}

/** One export row — supports bulk list shape (expected_hrs, total_working_days, …) and detailed wf_employee / attendance_summary shape. */
const mapPayslipToExportRow = (payslip, index, columnMeta) => {
  const wfEmployee = payslip?.wf_employee || {}
  const summary = payslip.attendance_summary || {}
  const cfg = payslip.payslip_config || {}
  const dailyHrs = toExportNum(summary.daily_req_hrs) || toExportNum(cfg.daily_req_hrs) || 8

  // Seconds: detailed payslips use total_working / total_present; list API uses expected_hrs / earned_hrs
  let workingSecRaw = 0
  if (payslip.total_working != null && payslip.total_working !== '') {
    workingSecRaw = Number(payslip.total_working)
  } else if (payslip.expected_hrs != null && payslip.expected_hrs !== '') {
    workingSecRaw = Number(payslip.expected_hrs)
  }

  let presentSecRaw = 0
  if (payslip.total_present != null && payslip.total_present !== '') {
    presentSecRaw = Number(payslip.total_present)
  } else if (payslip.earned_hrs != null && payslip.earned_hrs !== '') {
    presentSecRaw = Number(payslip.earned_hrs)
  }

  const totalWorkingHoursFromSec = Number.isFinite(workingSecRaw) ? workingSecRaw / 3600 : 0
  const totalPresentHoursFromSec = Number.isFinite(presentSecRaw) ? presentSecRaw / 3600 : 0

  const totalDays =
    summary.total_days !== undefined && summary.total_days !== null
      ? toExportNum(summary.total_days)
      : payslip.total_working_days !== undefined && payslip.total_working_days !== null
        ? toExportNum(payslip.total_working_days)
        : payslip.total_days !== undefined && payslip.total_days !== null
          ? toExportNum(payslip.total_days)
          : cfg.total_days !== undefined && cfg.total_days !== null
            ? toExportNum(cfg.total_days)
            : Math.round(totalWorkingHoursFromSec / dailyHrs)

  const presentDays =
    summary.present_days !== undefined && summary.present_days !== null
      ? toExportNum(summary.present_days)
      : payslip.present_days !== undefined && payslip.present_days !== null
        ? toExportNum(payslip.present_days)
        : Math.round(totalPresentHoursFromSec / dailyHrs)

  const absentDays =
    summary.absent_days !== undefined && summary.absent_days !== null
      ? toExportNum(summary.absent_days)
      : payslip.absent_days !== undefined && payslip.absent_days !== null
        ? toExportNum(payslip.absent_days)
        : Math.max(0, totalDays - presentDays)

  const leaveDays =
    summary.leaves !== undefined && summary.leaves !== null
      ? toExportNum(summary.leaves)
      : payslip.leaves !== undefined && payslip.leaves !== null
        ? toExportNum(payslip.leaves)
        : toExportNum(payslip.leave_days ?? payslip.leaves_encashable)

  let totalWorkingSec = Number.isFinite(workingSecRaw) ? workingSecRaw : 0
  let totalPresentSec = Number.isFinite(presentSecRaw) ? presentSecRaw : 0
  if (totalWorkingSec === 0 && totalDays > 0) {
    totalWorkingSec = totalDays * dailyHrs * 3600
  }
  if (totalPresentSec === 0 && presentDays > 0) {
    totalPresentSec = presentDays * dailyHrs * 3600
  }

  const meta = columnMeta || { incentiveCols: [], deductionCols: [] }
  const od = payslip.overtime_data || {}
  const overtimeSecRaw = Number(od.overtime_time != null ? od.overtime_time : 0)

  const overtimeMinutesTotal =
    Number.isFinite(overtimeSecRaw) && overtimeSecRaw > 0 ? Math.floor(overtimeSecRaw / 60) : 0

  const row = {
    sNo: index + 1,
    employmentNumber: payslip.emp_id ?? payslip.employee_id ?? wfEmployee.emp_id ?? wfEmployee.employee_id ?? '',
    name: getPayslipEmployeeName(payslip),
    branch: extractExportBranch(payslip),
    department: extractExportDepartment(payslip),
    designation: extractExportDesignation(payslip),
    empSalary: toExportNum(payslip.salary_amount ?? payslip.salary_ftm),
    taDa: toExportNum(payslip.ta_da),
    medAllowance: toExportNum(payslip.med_allowance),
    increments: toExportNum(payslip.increment_amount ?? payslip.inc_amount ?? payslip.increment ?? payslip.incremented_amount),
    expected: formatSecondsToHrsMin(totalWorkingSec),
    earned: formatSecondsToHrsMin(totalPresentSec),
    totalDays,
    presentDays,
    leaveDays,
    absentDays,
    overtimeMinutes: overtimeMinutesTotal,
    overtimeAmount: toExportNum(od.overtime_amount ?? payslip.overtime_amount ?? payslip.overtime),
    fuel: toExportNum(payslip.fuel_allowance),
    lateMins: toExportNum(payslip.late_minutes),
    incomeTax: toExportNum(payslip.income_tax?.amount ?? payslip.income_tax),
    eobi: toExportNum(
      payslip.eobi_record?.emp_contribution ?? payslip.eobi_record?.amount ?? payslip.eobi
    ),
    provident: extractProvidentFundTotal(payslip.provident_fund),
    bikeLoan: toExportNum(payslip.bike_loan),
    loan: toExportNum(payslip.loan_deduction),
    totalPayableSalary: toExportNum(payslip.paid_amount),
    status: (payslip.status ?? '').toString().trim() || '—',
  }

  meta.incentiveCols.forEach((c) => {
    row[c.key] = 0
  })
  meta.deductionCols.forEach((c) => {
    row[c.key] = 0
  })
  const idDetails = Array.isArray(payslip.incentive_deduction_details) ? payslip.incentive_deduction_details : []
  idDetails.forEach((item) => {
    const title = getIncentiveDeductionLineTitle(item)
    const slug = slugifyIncentiveTitle(title)
    const dType = item?.details?.d_type
    const amt = toExportNum(item.amount)
    if (isIncentiveDType(dType)) {
      const key = `earn_dyn_${slug}`
      if (Object.prototype.hasOwnProperty.call(row, key)) row[key] += amt
    } else if (dType) {
      const key = `ded_dyn_${slug}`
      if (Object.prototype.hasOwnProperty.call(row, key)) row[key] += amt
    }
  })

  return row
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
  const [exportColumnMeta, setExportColumnMeta] = useState({ incentiveCols: [], deductionCols: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [allPayslipsData, setAllPayslipsData] = useState([])
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false)

  // Get branches and payslips from store
  const getAllBranchesPayroll = useStore((state) => state.getAllBranchesPayroll)
  const copyBranchesData = useStore((state) => state.copyBranchesData)

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

  // Debounced search term value for in-memory dropdown filtering
  const debouncedSearchTerm = useDebouncedValue(employeeIdSearch.trim(), 300)

  // Derived search results (no useEffect = no setState loop). Used for dropdown list.
  // Filter by employee ID or Name only (not designation)
  const employeeSearchResultsDerived = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 1) return []
    if (!allPayslipsData || allPayslipsData.length === 0) return []
    const searchTermLower = debouncedSearchTerm.toLowerCase()
    return allPayslipsData.filter((payslip) => {
      const searchableValues = buildSearchableEmployeeText(payslip)
      return searchableValues.some((value) => value.includes(searchTermLower))
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
        pagination: false
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

      let currentPayslips = await fetchPayslipsListForExport(params)
      if (Array.isArray(currentPayslips) && currentPayslips.length > 0) {
        currentPayslips = await enrichPayslipsWithBulkDetails(currentPayslips)
      }
      const hasData = currentPayslips && Array.isArray(currentPayslips) && currentPayslips.length > 0
      if (currentPayslips && Array.isArray(currentPayslips)) {
        setAllPayslipsData(currentPayslips)
        const columnMeta = buildExportColumnMeta(currentPayslips)
        setExportColumnMeta(columnMeta)
        const transformedData = currentPayslips.map((payslip, index) =>
          mapPayslipToExportRow(payslip, index, columnMeta)
        )
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
        setExportColumnMeta({ incentiveCols: [], deductionCols: [] })
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
    if (
      col.key.startsWith('earn_dyn_') ||
      col.key.startsWith('ded_dyn_') ||
      ['taDa', 'overtimeAmount', 'overtimeMinutes', 'fuel', 'lateMins', 'incomeTax', 'eobi', 'provident', 'bikeLoan', 'loan', 'medAllowance', 'increments'].includes(col.key)
    ) {
      return formatOptionalNum(val)
    }
    if (col.key === 'name' || col.key === 'branch' || col.key === 'department' || col.key === 'designation' || col.key === 'employmentNumber' || col.key === 'status') {
      return val || '—'
    }
    return val
  }

  const handleExcelExport = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default
      const { main: mainCols, earnings: earnCols, deductions: dedCols, trailing: trailCols } = getVisiblePayslipColumnGroups(
        exportData,
        exportColumnMeta
      )
      const visibleCols = [...mainCols, ...earnCols, ...dedCols, ...trailCols]
      const colCount = visibleCols.length
      const mainCount = mainCols.length
      const earnCount = earnCols.length
      const dedCount = dedCols.length
      const trailCount = trailCols.length

      const orgName = getOrganizationData()?.orgName || getUserData()?.org_name || 'Organization Name'

      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Payslips', {
        views: [{ rightToLeft: false }],
        properties: { defaultRowHeight: 28 },
      })
      // OLD: const sheet = workbook.addWorksheet('Payslips', { views: [{ rightToLeft: false }] })

      sheet.columns = visibleCols.map((col) => ({ width: col.width }))

      const ORG_HEADER_BG = 'FF1F4E79'
      const DATE_HEADER_BG = 'FF2E75B6'
      const COLUMN_HEADER_BG = 'FF1F4E79'
      const EARNINGS_HEADER_BG = 'FFC6EFCE'
      const EARNINGS_HEADER_FONT = 'FF14532D'
      const DEDUCTIONS_HEADER_BG = 'FFFFCDD2'
      const DEDUCTIONS_HEADER_FONT = 'FFB71C1C'
      const GRID_COLOR = 'FFD1D5DB'
      const ROW_FILL_WHITE = 'FFFFFFFF'

      const EXCEL_WRAP_TEXT_KEYS = new Set(['name', 'branch', 'department', 'designation', 'expected', 'earned', 'status'])
      const EXCEL_NUM_KEYS = new Set([
        'sNo',
        'empSalary',
        'taDa',
        'increments',
        'totalDays',
        'presentDays',
        'leaveDays',
        'absentDays',
        'overtimeMinutes',
        'overtimeAmount',
        'fuel',
        'lateMins',
        'incomeTax',
        'eobi',
        'provident',
        'bikeLoan',
        'loan',
        'totalPayableSalary',
        'medAllowance',
      ])

      const styleHeaderCell = (cell) => {
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLUMN_HEADER_BG } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, indent: 0 }
        cell.border = {
          top: { style: 'thin', color: { argb: GRID_COLOR } },
          bottom: { style: 'thin', color: { argb: GRID_COLOR } },
          left: { style: 'thin', color: { argb: GRID_COLOR } },
          right: { style: 'thin', color: { argb: GRID_COLOR } },
        }
        // OLD: cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      }

      const styleEarningsHeaderCell = (cell) => {
        cell.font = { bold: true, size: 11, color: { argb: EARNINGS_HEADER_FONT } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EARNINGS_HEADER_BG } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, indent: 0 }
        cell.border = {
          top: { style: 'thin', color: { argb: GRID_COLOR } },
          bottom: { style: 'thin', color: { argb: GRID_COLOR } },
          left: { style: 'thin', color: { argb: GRID_COLOR } },
          right: { style: 'thin', color: { argb: GRID_COLOR } },
        }
      }

      const styleDeductionsHeaderCell = (cell) => {
        cell.font = { bold: true, size: 11, color: { argb: DEDUCTIONS_HEADER_FONT } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DEDUCTIONS_HEADER_BG } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, indent: 0 }
        cell.border = {
          top: { style: 'thin', color: { argb: GRID_COLOR } },
          bottom: { style: 'thin', color: { argb: GRID_COLOR } },
          left: { style: 'thin', color: { argb: GRID_COLOR } },
          right: { style: 'thin', color: { argb: GRID_COLOR } },
        }
      }

      const orgRow = sheet.addRow([`Organization: ${orgName}`])
      orgRow.height = 32
      sheet.mergeCells(1, 1, 1, colCount)
      orgRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
      orgRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
      orgRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ORG_HEADER_BG } }

      const titleRow = sheet.addRow(['Payslips Export'])
      titleRow.height = 34
      sheet.mergeCells(2, 1, 2, colCount)
      titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
      titleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
      titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DATE_HEADER_BG } }

      const r3 = []
      for (let i = 0; i < mainCount; i++) r3.push(mainCols[i].header)
      for (let i = 0; i < earnCount; i++) r3.push('')
      for (let i = 0; i < dedCount; i++) r3.push('')
      for (let i = 0; i < trailCount; i++) r3.push('')
      sheet.addRow(r3)
      sheet.getRow(3).height = 28

      const r4 = []
      for (let i = 0; i < mainCount; i++) r4.push('')
      earnCols.forEach((col) => r4.push(col.header))
      dedCols.forEach((col) => r4.push(col.header))
      trailCols.forEach((col) => r4.push(col.header))
      sheet.addRow(r4)
      sheet.getRow(4).height = 28

      for (let c = 1; c <= mainCount; c++) {
        sheet.mergeCells(3, c, 4, c)
        const cell = sheet.getCell(3, c)
        cell.value = mainCols[c - 1].header
        styleHeaderCell(cell)
      }

      let colIdx = mainCount + 1
      if (earnCount > 0) {
        sheet.mergeCells(3, colIdx, 3, colIdx + earnCount - 1)
        const earnParent = sheet.getCell(3, colIdx)
        earnParent.value = 'Earnings'
        styleEarningsHeaderCell(earnParent)
        for (let j = 0; j < earnCount; j++) {
          const cell = sheet.getCell(4, colIdx + j)
          cell.value = earnCols[j].header
          styleEarningsHeaderCell(cell)
        }
        colIdx += earnCount
      }
      if (dedCount > 0) {
        sheet.mergeCells(3, colIdx, 3, colIdx + dedCount - 1)
        const dedParent = sheet.getCell(3, colIdx)
        dedParent.value = 'Deductions'
        styleDeductionsHeaderCell(dedParent)
        for (let j = 0; j < dedCount; j++) {
          const cell = sheet.getCell(4, colIdx + j)
          cell.value = dedCols[j].header
          styleDeductionsHeaderCell(cell)
        }
        colIdx += dedCount
      }
      if (trailCount > 0) {
        for (let t = 0; t < trailCount; t++) {
          sheet.mergeCells(3, colIdx + t, 4, colIdx + t)
          const cell = sheet.getCell(3, colIdx + t)
          cell.value = trailCols[t].header
          styleHeaderCell(cell)
        }
      }

      if (exportData.length > 0) {
        exportData.forEach((row) => {
          const cellValues = visibleCols.map((col) => getCellDisplayValue(row, col))
          const dataRow = sheet.addRow(cellValues)
          dataRow.height = 30
          for (let c = 1; c <= colCount; c++) {
            const cell = dataRow.getCell(c)
            const col = visibleCols[c - 1]
            const isNumCol =
              EXCEL_NUM_KEYS.has(col.key) ||
              col.key.startsWith('earn_dyn_') ||
              col.key.startsWith('ded_dyn_')
            const wrap = EXCEL_WRAP_TEXT_KEYS.has(col.key)
            cell.font = { size: 11 }
            cell.alignment = {
              horizontal: isNumCol ? 'center' : 'left',
              vertical: 'middle',
              wrapText: wrap,
              indent: !isNumCol && !wrap ? 1 : 0,
            }
            /* OLD: dataRow.height = 20; isNumCol via list incl. absenties
            const isNumCol = ['sNo', 'empSalary', ...].includes(col.key)
            cell.alignment = { horizontal: isNumCol ? 'center' : 'left', vertical: 'middle', wrapText: false }
            */
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
      const { main: mainCols, earnings: earnCols, deductions: dedCols, trailing: trailCols } = getVisiblePayslipColumnGroups(
        exportData,
        exportColumnMeta
      )
      const visibleCols = [...mainCols, ...earnCols, ...dedCols, ...trailCols]
      const colCount = visibleCols.length
      const earnCount = earnCols.length
      const dedCount = dedCols.length
      const numHeaderKeys = [
        'sNo',
        'empSalary',
        'taDa',
        'increments',
        'totalDays',
        'presentDays',
        'leaveDays',
        'absentDays',
        'overtimeMinutes',
        'overtimeAmount',
        'fuel',
        'lateMins',
        'incomeTax',
        'eobi',
        'provident',
        'bikeLoan',
        'loan',
        'totalPayableSalary',
        'medAllowance',
      ]
      const isPdfNumericCol = (key) =>
        numHeaderKeys.includes(key) || key.startsWith('earn_dyn_') || key.startsWith('ded_dyn_')

      const orgName = getOrganizationData()?.orgName || getUserData()?.org_name || 'Organization Name'
      const tableRows =
        exportData.length > 0
          ? exportData.map(
              (row) => {
                const tds = visibleCols.map((col) => {
                  const val = getCellDisplayValue(row, col)
                  const display = typeof val === 'number' ? Number(val).toLocaleString() : val
                  const isNum = isPdfNumericCol(col.key)
                  return `<td class="${isNum ? 'td-num' : 'td-text'}">${display}</td>`
                }).join('')
                return `<tr class="row-body">${tds}</tr>`
              }
            ).join('')
          : `<tr><td colspan="${colCount}" class="no-data">No data available for export.</td></tr>`

      const thMain = (col) => {
        const isNum = isPdfNumericCol(col.key)
        return `<th rowspan="2" class="th-main ${isNum ? 'th-num' : ''}">${col.pdfHeader}</th>`
      }
      const thTrailing = (col) => {
        const isNum = isPdfNumericCol(col.key)
        return `<th rowspan="2" class="th-main th-trail ${isNum ? 'th-num' : ''}">${col.pdfHeader}</th>`
      }
      const pdfHeaderRow1 = `${mainCols.map(thMain).join('')}${earnCount > 0 ? `<th colspan="${earnCount}" class="th-group th-group-earn">Earnings</th>` : ''}${dedCount > 0 ? `<th colspan="${dedCount}" class="th-group th-group-ded">Deductions</th>` : ''}${trailCols.map(thTrailing).join('')}`
      const pdfHeaderRow2 = `${earnCols.map((col) => {
        const isNum = isPdfNumericCol(col.key)
        return isNum ? `<th class="th-num th-sub th-earn">${col.pdfHeader}</th>` : `<th class="th-sub th-earn">${col.pdfHeader}</th>`
      }).join('')}${dedCols.map((col) => {
        const isNum = isPdfNumericCol(col.key)
        return isNum ? `<th class="th-num th-sub th-ded">${col.pdfHeader}</th>` : `<th class="th-sub th-ded">${col.pdfHeader}</th>`
      }).join('')}`
      const hasGroupedSubRow = earnCount > 0 || dedCount > 0
      const pdfHeadInner = hasGroupedSubRow
        ? `<tr>${pdfHeaderRow1}</tr><tr>${pdfHeaderRow2}</tr>`
        : `<tr>${visibleCols.map((col) => {
            const isNum = isPdfNumericCol(col.key)
            return `<th class="th-main ${isNum ? 'th-num' : ''}">${col.pdfHeader}</th>`
          }).join('')}</tr>`

      const colgroupCols = visibleCols
        .map((col) => `<col class="col-dyn" style="min-width:${Math.max(48, Math.min(col.width * 7, 220))}px" />`)
        .join('')

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payslips Export</title>
          <style>
            @page { margin: 12mm; size: A4 landscape; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 16px 20px 24px;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 11px;
              color: #334155;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* Match Excel banner rows */
            .header-org {
              background: #1F4E79;
              color: #fff;
              padding: 10px 16px;
              min-height: 32px;
              line-height: 1.35;
              text-align: left;
              font-weight: 700;
              font-size: 14px;
              letter-spacing: 0.02em;
              border: 1px solid #d1d5db;
            }
            .header-date {
              background: #2E75B6;
              color: #fff;
              padding: 12px 16px;
              min-height: 34px;
              line-height: 1.35;
              text-align: left;
              font-weight: 700;
              font-size: 16px;
              letter-spacing: 0.02em;
              border: 1px solid #d1d5db;
              border-top: none;
              margin-bottom: 0;
            }
            .table-wrap {
              overflow: visible;
              margin-top: 0;
              border: 1px solid #d1d5db;
              border-top: none;
            }
            table.payslip-table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              font-size: 11px;
            }
            col.col-dyn { min-width: 48px; }
            /* Main + Net Pay headers — same as Excel COLUMN_HEADER_BG */
            th.th-main {
              background: #1F4E79 !important;
              color: #fff !important;
              font-weight: 700;
              font-size: 11px;
              text-align: center !important;
              vertical-align: middle;
              padding: 8px 6px;
              border: 1px solid #d1d5db !important;
              white-space: normal;
              word-wrap: break-word;
              line-height: 1.25;
            }
            th.th-main.th-num { text-align: center !important; }
            thead tr:first-child th.th-main { border-top: 1px solid #d1d5db; }
            th.th-group {
              text-align: center;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.03em;
              padding: 8px 6px;
              vertical-align: middle;
              border: 1px solid #d1d5db !important;
            }
            th.th-group-earn {
              background: #C6EFCE !important;
              color: #14532d !important;
            }
            th.th-group-ded {
              background: #FFCDD2 !important;
              color: #b71c1c !important;
            }
            th.th-sub {
              font-size: 10px;
              font-weight: 700;
              padding: 8px 5px;
              vertical-align: middle;
              border: 1px solid #d1d5db !important;
            }
            th.th-earn {
              background: #e8f5e9 !important;
              color: #14532d !important;
            }
            th.th-ded {
              background: #ffebee !important;
              color: #b71c1c !important;
            }
            th.th-num { font-variant-numeric: tabular-nums; }
            tbody td {
              padding: 8px 6px;
              border: 1px solid #d1d5db;
              vertical-align: middle;
              min-height: 30px;
              line-height: 1.35;
            }
            .row-body td {
              background: #fff;
              color: #334155;
              font-size: 11px;
            }
            .row-body td.td-text {
              text-align: left;
              padding-left: 10px;
            }
            /* Excel uses center for numeric data cells */
            .row-body td.td-num {
              text-align: center;
              font-variant-numeric: tabular-nums;
            }
            .no-data {
              text-align: center;
              padding: 40px;
              color: #64748b;
              font-style: italic;
              border: 1px solid #d1d5db;
              background: #fff;
            }
          </style>
        </head>
        <body>
          <div class="header-org">Organization: ${orgName}</div>
          <div class="header-date">Payslips Export</div>
          <div class="table-wrap">
            <table class="payslip-table">
              <colgroup>${colgroupCols}</colgroup>
              <thead>
                ${pdfHeadInner}
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
    setExportColumnMeta({ incentiveCols: [], deductionCols: [] })
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
            department_id: departmentValue,
            pagination: false,
          }
          const currentPayslips = await fetchPayslipsListForExport(params)
          setAllPayslipsData(Array.isArray(currentPayslips) ? currentPayslips : [])
        } catch (error) {
          console.error('Error loading payslips for search:', error)
          setAllPayslipsData([])
        }
      } else {
        setAllPayslipsData([])
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
                          setEmployeeIdSearch(getPayslipEmployeeName(employee))
                          setSearchDropdownOpen(false)
                        }}
                      >
                        <div className='text-sm font-medium text-gray-900'>
                          {getPayslipEmployeeName(employee)}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          <span className='font-medium'>ID:</span> {getPayslipEmployeeId(employee)}
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
