import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { showToast } from '../../Components/Toaster/Toaster'
import useStore from '../../Store/store'
import payrollApi from '../../Model/Data/Payroll/Payroll'

// Helper function to format string values - show "--" if empty/null
const formatString = (value) => {
  if (value === null || value === undefined || value === '' || String(value).trim() === '') {
    return '--'
  }
  return String(value)
}

// Helper for API requirement: when any field is null show 0 (string display)
const formatNullAsZero = (value) => {
  if (value === null || value === undefined || value === '' || String(value).trim() === '') {
    return '0'
  }
  return String(value)
}

// Helper function to format number values - show 0 if null/empty
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '' || String(value).trim() === '') {
    return 0
  }
  const numValue = typeof value === 'string' ? parseFloat(String(value).replace(/,/g, '')) : Number(value)
  return isNaN(numValue) ? 0 : numValue
}

// Normalize nested API object: every numeric field null/undefined → 0
const normalizePayslipConfig = (config) => {
  if (!config || typeof config !== 'object') return { payslip_id: 0, formula: 0, daily_req_hrs: 0, total_days: 0, payslip_generation_type: '0', payslip_from: 0, payslip_upto: 0 }
  return {
    payslip_id: formatNumber(config.payslip_id),
    formula: formatNumber(config.formula),
    daily_req_hrs: formatNumber(config.daily_req_hrs),
    total_days: formatNumber(config.total_days),
    payslip_generation_type: config.payslip_generation_type != null ? String(config.payslip_generation_type) : '0',
    payslip_from: formatNumber(config.payslip_from),
    payslip_upto: formatNumber(config.payslip_upto),
  }
}
const normalizeAttendanceSummary = (summary) => {
  if (!summary || typeof summary !== 'object') return { total_adjusted_late_min: 0, total_late_minutes_used: 0, calculated_absentee_deduction: 0, calculated_late_deduction: 0, att_deductions_from_payslip: 0, early_leave_downtime: 0, calculation_method: '0', formula: 0, daily_req_hrs: 0, total_days: 0, present_days: 0, absent_days: 0, leaves: 0, payroll_type: '' }
  return {
    total_adjusted_late_min: formatNumber(summary.total_adjusted_late_min),
    total_late_minutes_used: formatNumber(summary.total_late_minutes_used),
    calculated_absentee_deduction: formatNumber(summary.calculated_absentee_deduction),
    calculated_late_deduction: formatNumber(summary.calculated_late_deduction),
    att_deductions_from_payslip: formatNumber(summary.att_deductions_from_payslip),
    early_leave_downtime: formatNumber(summary.early_leave_downtime),
    calculation_method: summary.calculation_method != null ? String(summary.calculation_method) : '0',
    formula: formatNumber(summary.formula),
    daily_req_hrs: formatNumber(summary.daily_req_hrs),
    total_days: formatNumber(summary.total_days),
    present_days: formatNumber(summary.present_days),
    absent_days: formatNumber(summary.absent_days),
    leaves: formatNumber(summary.leaves),
    payroll_type: summary.payroll_type != null && summary.payroll_type !== '' ? String(summary.payroll_type) : '',
  }
}

// Format payroll_type from API (e.g. "time_based") for display (e.g. "Time based")
const formatPayrollTypeLabel = (payrollType) => {
  if (!payrollType || String(payrollType).trim() === '') return 'Attendance base'
  return String(payrollType)
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Helper function to format seconds to hours and minutes
const formatHoursMinutes = (seconds) => {
  if (!seconds || seconds === 0) {
    return '0 hrs 0 mins'
  }
  const totalSeconds = Number(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const remainingSeconds = totalSeconds % 3600
  const minutes = Math.floor(remainingSeconds / 60)
  
  return `${hours} hrs ${minutes} mins`
}

const maskBankAccountDisplay = (accountNo) => {
  const s = accountNo == null ? '' : String(accountNo).replace(/\s/g, '')
  if (!s || s === '0' || s === '--') return '--'
  if (s.length <= 4) return `****${s}`
  return `****${s.slice(-4)}`
}

const normalizeEpochToMs = (value) => {
  if (value == null) return value
  const s = String(value).trim()
  if (!s) return value
  // If API sends epoch seconds (10 digits-ish), convert to ms.
  // Example: 1640977200 => 1640977200000
  const n = Number(s)
  if (!Number.isFinite(n)) return value
  if (n > 0 && n < 1e12) return n * 1000
  return n
}

const formatDisplayJoinDate = (raw) => {
  if (raw == null || raw === '' || String(raw).trim() === '' || String(raw) === '0') return null
  const d = new Date(normalizeEpochToMs(raw))
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return String(raw)
}

// Helper function to get income tax amount from object or value - show 0 if null
const getIncomeTaxAmount = (incomeTax) => {
  if (incomeTax === null || incomeTax === undefined || incomeTax === '') return 0
  if (typeof incomeTax === 'object' && incomeTax.amount !== undefined) {
    return formatNumber(incomeTax.amount)
  }
  return formatNumber(incomeTax)
}

// Helper function to get provident fund employee contribution from object or value - show 0 if null
const getProvidentFundEmpContribution = (providentFund) => {
  if (providentFund === null || providentFund === undefined || providentFund === '') return 0
  if (typeof providentFund === 'object' && providentFund.emp_contribution !== undefined) {
    return formatNumber(providentFund.emp_contribution)
  }
  return formatNumber(providentFund)
}

// Helper function to get EOBI employee contribution from object or value - show 0 if null
const getEobiEmpContribution = (eobiRecord) => {
  if (eobiRecord === null || eobiRecord === undefined || eobiRecord === '') return 0
  if (typeof eobiRecord === 'object' && eobiRecord.emp_contribution !== undefined) {
    return formatNumber(eobiRecord.emp_contribution)
  }
  return formatNumber(eobiRecord)
}

// Helper function to get social security amount (preserves null)
// const getSocialSecurityAmount = (socialSecurity) => {
//   if (socialSecurity === null) return null
//   if (socialSecurity === undefined || socialSecurity === '') return null
//   if (typeof socialSecurity === 'object' && socialSecurity.amount !== undefined) {
//     return preserveNullAndFormat(socialSecurity.amount)
//   }
//   return preserveNullAndFormat(socialSecurity)
// }

const IndividualPayslipPreview = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [payslipData, setPayslipData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Get payslips from store
  const payslips = useStore((state) => state.payslips)
  const gettingPayslips = useStore((state) => state.gettingPayslips)
  const hasLoadedRef = useRef(false)

  // Helper function to transform payslip data
  const transformPayslipData = useCallback((payslip) => {
    const employeeData = payslip.wf_employee || {}
    const totalWorkingHours = payslip.total_working ? payslip.total_working / 3600 : 0
    const totalPresentHours = payslip.total_present ? payslip.total_present / 3600 : 0
    const salaryMonth = payslip.salary_month || ''
    const month = salaryMonth.length >= 2 ? salaryMonth.slice(0, 2) : '10'
    const year = salaryMonth.length >= 4 ? '20' + salaryMonth.slice(2) : new Date().getFullYear()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthName = monthNames[parseInt(month) - 1] || 'Oct'
    const summary = payslip.attendance_summary
    // Prefer attendance_summary from API for days (authoritative); else payslip_config; else derived
    const totalDays = summary?.total_days !== undefined && summary?.total_days !== null
      ? formatNumber(summary.total_days)
      : (payslip.payslip_config?.total_days !== undefined && payslip.payslip_config?.total_days !== null
          ? formatNumber(payslip.payslip_config.total_days)
          : Math.round(totalWorkingHours / 8))
    const presentDays = summary?.present_days !== undefined && summary?.present_days !== null
      ? formatNumber(summary.present_days)
      : Math.round(totalPresentHours / 8)
    const absentDays = summary?.absent_days !== undefined && summary?.absent_days !== null
      ? formatNumber(summary.absent_days)
      : Math.max(0, totalDays - presentDays)

    
    return {
      // Basic info
      id: formatNumber(payslip.id),
      emp_id: formatNumber(payslip.emp_id || employeeData.emp_id),
      
      // Employee info from wf_employee (null from API shown as 0)
      name: formatNullAsZero(employeeData.name),
      employee_id: formatNullAsZero(employeeData.emp_id),
      biometric_id: formatNumber(employeeData.bio_id),
      branch_name: formatNullAsZero(employeeData.branch_name),
      department_name: formatNullAsZero(employeeData.department_name),
      designation: formatNullAsZero(employeeData.designation),
      branch_id: formatNumber(employeeData.branch_id),
      deptt_id: formatNumber(employeeData.deptt_id),
      basic_pay: formatNumber(employeeData.basic_pay),
      
      // Bank information from wf_employee (null → 0)
      bank_name: formatNullAsZero(employeeData.bank_name),
      bank_branch_code: formatNullAsZero(employeeData.bank_branch_code),
      bank_account_no: formatNullAsZero(employeeData.bank_account_no),
      bank_account_title: formatNullAsZero(employeeData.bank_account_title),
      bank_account_type: formatNumber(employeeData.bank_account_type),
      passport_no: formatNullAsZero(employeeData.passport_no),
      joining_date_raw: employeeData.joining_date || employeeData.date_of_joining || employeeData.join_date || '',
      bank_branch: formatNullAsZero(employeeData.bank_branch || employeeData.bank_branch_name),
      holidays: formatNumber(payslip.holidays ?? payslip.holiday_days ?? payslip.attendance_summary?.holidays),
      
      // Date and time
      generated_date: payslip.timestamp ? new Date(payslip.timestamp * 1000).toISOString() : new Date().toISOString(),
      timestamp: formatNumber(payslip.timestamp),
      month: monthName,
      year: year,
      salary_month: formatNullAsZero(payslip.salary_month),
      overtime_month: formatNullAsZero(payslip.overtime_month),
      
      // Attendance fields
      attendance: formatNumber(payslip.attendance),
      attendance_hourly: formatNumber(payslip.attendance_hourly),
      total_working: formatNumber(payslip.total_working),
      total_present: formatNumber(payslip.total_present),
      present_days: presentDays,
      total_days: totalDays,
      absent_days: absentDays,
      earned_hours: totalPresentHours,
      expected_hours: totalWorkingHours,
      leave_days: summary?.leaves !== undefined && summary?.leaves !== null ? formatNumber(summary.leaves) : formatNumber(payslip.leaves_encashable),
      leaves_encashable: summary?.leaves !== undefined && summary?.leaves !== null ? formatNumber(summary.leaves) : formatNumber(payslip.leaves_encashable),
      
      // Salary fields
      basic_salary: formatNumber(payslip.rate),
      rate: formatNumber(payslip.rate),
      salary_amount: formatNumber(payslip.salary_amount),
      emp_salary: formatNumber(payslip.salary_amount),
      salary_currency: formatString(payslip.salary_currency),
      per_day_salary: formatNumber(payslip.per_day_salary),
      salary_template: formatNumber(payslip.salary_template),
      
      // Overtime fields
      overtime: formatNumber(payslip.overtime),
      overtime_amount: formatNumber(payslip.overtime_amount),
      overtime_rate: formatNumber(payslip.overtime_rate),
      overtime_payable: formatNullAsZero(payslip.overtime_payable),
      
      // Incentive fields
      incentive: formatNumber(payslip.incentive),
      incentive_deduction_ids: formatNullAsZero(payslip.incentive_deduction_ids),
      // Handle incentive_deduction_details from API response (new format)
      // Transform incentive_deduction_details to match expected format
      incentive_deduction: (() => {
        // First, try to use incentive_deduction_details from payslip (new format)
        if (payslip.incentive_deduction_details && Array.isArray(payslip.incentive_deduction_details)) {
          return payslip.incentive_deduction_details.map(item => ({
            id: item.id,
            amount: formatNumber(item.amount ?? item.details?.original_amount),
            monthly_amount: formatNumber(item.details?.monthly_amount),
            title: item.details?.title || 'Incentive/Deduction',
            d_type: item.details?.d_type || (item.type === 'incen' ? 'INCENTIVE' : 'DEDUCTION'),
            description: item.details?.description ?? '0',
            re_occuring: item.details?.re_occuring || 'NO',
            start_date: item.details?.start_date,
            end_date: item.details?.end_date,
            status: item.details?.status || '0',
            ...item.details
          }))
        }
        // Fallback to employeeData.incentive_deduction (old format)
        if (Array.isArray(employeeData.incentive_deduction)) {
          return employeeData.incentive_deduction
        }
        return []
      })(),
      
      // Deduction fields (null from API shown as 0)
      att_deductions: formatNumber(payslip.att_deductions),
      absentees_deduction: formatNumber(payslip.att_deductions),
      deduction: formatNumber(payslip.deduction),
      // Only use explicit `other_deductions` from API — do not copy `payslip.deduction` here:
      // `deduction` often mirrors itemized rows (e.g. loan in incentive_deduction_details), which would double-count.
      other_deductions: formatNumber(payslip.other_deductions ?? 0),
      income_tax: getIncomeTaxAmount(payslip.income_tax),
      eobi: getEobiEmpContribution(payslip.eobi_record || payslip.eobi),
      eobi_emp_contribution: getEobiEmpContribution(payslip.eobi_record || payslip.eobi),
      eobi_employer_contribution: (payslip.eobi_record || payslip.eobi) && typeof (payslip.eobi_record || payslip.eobi) === 'object' && (payslip.eobi_record || payslip.eobi).employer_contribution !== undefined ? formatNumber((payslip.eobi_record || payslip.eobi).employer_contribution) : 0,
      provident_fund: getProvidentFundEmpContribution(payslip.provident_fund),
      provident_fund_emp_contribution: getProvidentFundEmpContribution(payslip.provident_fund),
      provident_fund_employer_contribution: payslip.provident_fund && typeof payslip.provident_fund === 'object' && payslip.provident_fund.employer_contribution !== undefined ? formatNumber(payslip.provident_fund.employer_contribution) : 0,
      provident_fund_total: payslip.provident_fund && typeof payslip.provident_fund === 'object' && payslip.provident_fund.total_pf !== undefined ? formatNumber(payslip.provident_fund.total_pf) : 0,
      // social_security: getSocialSecurityAmount(payslip.social_security || payslip.social_security_deduction),
      // social_security_deduction: getSocialSecurityAmount(payslip.social_security || payslip.social_security_deduction),
      
      // Payment fields
      paid_amount: formatNumber(payslip.paid_amount),
      net_salary: formatNumber(payslip.paid_amount),
      payable_amount: formatNumber(payslip.paid_amount),
      pay_method: formatNullAsZero(payslip.pay_method) !== '0' ? formatNullAsZero(payslip.pay_method) : 'Cash',
      payment_method: formatNullAsZero(payslip.pay_method) !== '0' ? formatNullAsZero(payslip.pay_method) : 'Cash',
      
      // Status and other (null from API shown as 0)
      status: formatNullAsZero(payslip.status) !== '0' ? formatNullAsZero(payslip.status) : 'due',
      payroll_type: formatNullAsZero(payslip.payroll_type),
      description: formatNullAsZero(payslip.description),
      exGratiaAmount: formatNumber(payslip.exGratiaAmount),
      org_id: formatNumber(payslip.org_id),
      
      // Calculated fields
      total_pay: formatNumber(payslip.salary_amount) + formatNumber(payslip.incentive),
      required_days:
        payslip.payslip_config?.total_days !== undefined && payslip.payslip_config?.total_days !== null
          ? formatNumber(payslip.payslip_config.total_days)
          : totalDays,
      
      // Normalize nested objects so any null from API shows as 0
      payslip_config: normalizePayslipConfig(payslip.payslip_config),
      attendance_summary: normalizeAttendanceSummary(payslip.attendance_summary),
    }
  }, [])

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    const loadPayslipData = async () => {
      if (!id) {
        showToast('Payslip ID not provided', 'error')
        navigate(-1)
        return
      }

      setIsLoading(true)

      try {
        // Call GET /manage_payslip/payslips/:id to fetch full payslip for preview
        const response = await payrollApi.getPayslipById(id)
        const data = response?.data

        if (data && data.STATUS === 'SUCCESSFUL' && data.DB_DATA) {
          // Single payslip: DB_DATA may be the payslip object or { payslip: {...} }
          const rawPayslip = data.DB_DATA.payslip ?? data.DB_DATA
          if (rawPayslip && (rawPayslip.id || rawPayslip.id === 0)) {
            const transformedData = transformPayslipData(rawPayslip)
            setPayslipData(transformedData)
            setIsLoading(false)
            return
          }
        }

        // Fallback: find in store if API did not return expected shape
        const foundPayslip = payslips?.find(p => p.id === parseInt(id, 10) || p.id === id)
        if (foundPayslip) {
          const transformedData = transformPayslipData(foundPayslip)
          setPayslipData(transformedData)
          setIsLoading(false)
          return
        }

        // Last fallback: fetch list and retry from store
        await gettingPayslips({}, true)
        const updatedPayslips = useStore.getState().payslips
        const retryFoundPayslip = updatedPayslips?.find(p => p.id === parseInt(id, 10) || p.id === id)
        if (retryFoundPayslip) {
          const transformedData = transformPayslipData(retryFoundPayslip)
          setPayslipData(transformedData)
        } else {
          showToast('Payslip not found', 'error')
          navigate(-1)
        }
      } catch (error) {
        console.error('Error loading payslip data:', error)
        showToast(error?.response?.data?.ERROR_DESCRIPTION || 'Error loading payslip data', 'error')
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }

    loadPayslipData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate, transformPayslipData])

  const handleClose = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate('/payroll/manage_payslip', { state: { showMakingPayments: true } })
  }

  const handlePrint = () => {
    window.print()
  }


  // Add print styles
  useEffect(() => {
    const printStyles = `
      @media print {
        /* Hide everything by default */
        body * {
          visibility: hidden !important;
        }
        
        /* Show only the invoice container and its children */
        .invoice-container,
        .invoice-container * {
          visibility: visible !important;
        }
        
        /* Show print title */
        .print-title {
          display: block !important;
          visibility: visible !important;
        }
        
        /* Force hide header and all its elements */
        .no-print,
        .no-print *,
        header,
        header *,
        .header,
        .header *,
        nav,
        nav *,
        button,
        .bg-blue-500,
        .bg-blue-600 {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Invoice container — padding handled by @page so every page has inset (not only first) */
        .invoice-container {
          position: relative !important;
          width: 100% !important;
          max-width: none !important;
          box-shadow: none !important;
          border: none !important;
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          height: auto !important;
          max-height: none !important;
        }
        
        /* p-2 (~0.5rem) margin on every printed page (including top of page 2+) */
        @page {
          margin: 0.5rem !important;
          size: A4 portrait;
        }
        
        /* Body reset: allow full document height so print is not clipped */
        html, body {
          height: auto !important;
          overflow: visible !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        /*
         * Critical: main layout uses h-screen + overflow-y-auto; print engines often
         * treat that as a single-page viewport. Reset the #root chain so height follows content.
         */
        #root,
        .app-root-shell,
        .app-root-shell > div:nth-of-type(2),
        .app-root-shell > div:nth-of-type(2) > div {
          height: auto !important;
          max-height: none !important;
          min-height: 0 !important;
          overflow: visible !important;
        }
        .app-root-shell > div:nth-of-type(2) {
          flex: none !important;
        }
        .app-root-shell > div:nth-of-type(2) > div:last-child > div {
          min-height: 0 !important;
          height: auto !important;
          overflow: visible !important;
        }
        .payslip-print-user-info-grid,
        .payslip-print-user-info-grid > * {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          background: #fff !important;
        }

        /* Print payslip: no clipping, tables may continue on next page */
        .payslip-print-template,
        .payslip-print-root,
        .payslip-print-root > div {
          overflow: visible !important;
          max-height: none !important;
          height: auto !important;
          break-inside: auto !important;
          page-break-inside: auto !important;
        }
        .payslip-print-table-shell {
          overflow: visible !important;
          break-inside: auto !important;
          page-break-inside: auto !important;
          border: none !important;
        }
        table.payslip-print-data-table {
          width: 100% !important;
          break-inside: auto !important;
          page-break-inside: auto !important;
        }
        /*
         * table-header-group repeats thead on each printed page when the table breaks.
         * Use table-row-group so "Deductions" / "Payment details" / etc. print only once.
         */
        table.payslip-print-data-table thead {
          display: table-row-group !important;
        }
        table.payslip-print-data-table tbody,
        table.payslip-print-data-table tbody tr {
          break-inside: auto !important;
          page-break-inside: auto !important;
        }
        table.payslip-print-data-table tbody tr {
          border: none !important;
        }
        /* Blue section titles: no borders (overrides global table th,td rules below) */
        table.payslip-print-data-table thead th,
        .payslip-print-table-heading {
          border: none !important;
          border-top: none !important;
          border-bottom: none !important;
          outline: none !important;
        }
        table.payslip-print-data-table thead tr {
          border: none !important;
        }
        table.payslip-print-data-table tbody td {
          border: none !important;
          border-top: none !important;
          border-bottom: none !important;
        }
        table.payslip-print-data-table tbody tr:last-child td {
          border-bottom: none !important;
        }
        .payslip-print-payroll-summary {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          background: #fff !important;
        }
        .payslip-print-section-title {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        /* Blue gradient bars for Payment details, Extra additions, Deductions */
        .payslip-print-heading-gradient {
          background: linear-gradient(to right, #4f46e5, #2563eb, #06b6d4) !important;
          color: #fff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .payslip-print-payable-card {
          background: #ecfdf5 !important;
          border: 1px solid #a7f3d0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .payslip-print-total-deductions-card {
          background: #fff1f2 !important;
          border: 1px solid #fecdd3 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Print header grid */
        .print-header {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          column-gap: 16px !important;
          row-gap: 4px !important;
          margin-bottom: 16px !important;
        }
        .print-header .left,
        .print-header .right {
          display: block !important;
        }
        .print-header .row {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 8px !important;
          margin-bottom: 4px !important;
        }
        .label { font-weight: 600 !important; }
        .value { font-weight: 400 !important; }
        
        /* Layout fixes for print */
        .earnings-deductions-container {
          display: flex !important;
          gap: 20px !important;
          width: 100% !important;
        }
        .earnings-table,
        .deductions-table {
          flex: 1 !important;
          width: 50% !important;
        }
        .extra-additions-deductions-container {
          display: flex !important;
          gap: 20px !important;
          width: 100% !important;
        }
        .extra-additions-table,
        .deductions-table-2 {
          flex: 1 !important;
          width: 50% !important;
        }
        .net-pay-section {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          width: 100% !important;
        }
        .net-pay-section > div {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          width: 100% !important;
        }
        .net-pay-section > div > * {
          margin-right: 16px !important;
        }
        .net-pay-section > div > *:last-child {
          margin-right: 0 !important;
        }
        .payroll-summary {
          display: block !important;
          width: 100% !important;
        }
        .payroll-summary > div {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
          margin-bottom: 8px !important;
          flex-wrap: wrap !important;
        }
        .payroll-summary > div > span {
          margin-right: 8px !important;
          white-space: nowrap !important;
        }
        .space-y-4 > * + * {
          margin-top: 16px !important;
        }
        
        /* Hide app sections in print; show print template only */
        .hide-in-print { display: none !important; }
        .payslip-print-template {
          display: block !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Template layout */
        .tpl-header {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          column-gap: 24px !important;
          align-items: start !important;
          margin-bottom: 20px !important; /* Section 1 bottom gap */
        }
        .col-span-2 { grid-column: 1 / span 2 !important; }
        .tpl-left, .tpl-right { font-size: 12px !important; color: #111827 !important; }
        .tpl-left .row, .tpl-right .row { margin: 2px 0 !important; }
        .tpl-strong { font-weight: 500 !important; } /* medium weight */
        .tpl-muted { color: #374151 !important; }

        .tpl-metrics {
          display: grid !important;
          grid-template-columns: repeat(6, 1fr) !important;
          gap: 16px !important;
          margin: 16px 0 20px 0 !important; /* Section 2 vertical gap */
          font-size: 12px !important;
          color: #111827 !important;
        }
        .tpl-metric { text-align: center !important; }
        .tpl-title { text-align: center !important; font-weight: 500 !important; margin: 12px 0 12px 0 !important; }
        .tpl-sep { height: 1px !important; background: #e5e7eb !important; width: 100% !important; margin: 8px 0 16px 0 !important; }

        .tpl-table { width: 100% !important; border-collapse: collapse !important; font-size: 12px !important; }
        .equal-cols { table-layout: fixed !important; }
        .tpl-table th, .tpl-table td { border: 1px solid #e5e7eb !important; padding: 8px 10px !important; }
        .tpl-th { background: #f9fafb !important; text-align: left !important; font-weight: 500 !important; }
        /* Center vertical border same as others */
        .tpl-table td:first-child, .tpl-table th:first-child { border-right: 1px solid #e5e7eb !important; }
        .tpl-center { text-align: center !important; }
        .tpl-row { }
        /* Payment details rows */
        .pd { display: flex !important; flex-direction: column !important; gap: 6px !important; }
        .pd-row { display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 12px !important; }
        .center-flex { display: flex !important; align-items: center !important; justify-content: center !important; gap: 16px !important; text-align: center !important; }
        .tpl-payable { font-weight: 500 !important; }

        .tpl-signatures { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 40px !important; margin-top: 40px !important; /* increased spacing above signatures */ }
        .tpl-sign-line { display: flex !important; align-items: center !important; gap: 10px !important; padding-top: 12px !important; /* increased padding-top for signature lines */ }
        .tpl-underline { border-bottom: 1px solid #cbd5e1 !important; flex: 1 !important; height: 16px !important; }

        /* Hide old sections in print */
        .payroll-summary, .earnings-deductions-container, .extra-deductions-container, .net-pay-section { display: none !important; }
        
        /* Table styles (legacy on-screen tables; skip payslip print tables) */
        table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        table:not(.payslip-print-data-table) th,
        table:not(.payslip-print-data-table) td {
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 8px !important;
        }
        table:not(.payslip-print-data-table) thead th {
          border-top: 1px solid #e2e8f0 !important;
        }
        
        /* Typography */
        .text-xs {
          font-size: 12px !important;
        }
        .text-sm {
          font-size: 14px !important;
        }
        .font-bold {
          font-weight: bold !important;
        }
        .font-light {
          font-weight: 300 !important;
        }
        .text-gray-600 {
          color: #4b5563 !important;
        }
        .text-blue-600 {
          color: #2563eb !important;
        }
        
        /* Spacing and margins */
        .mb-6 {
          margin-bottom: 24px !important;
        }
        .mb-8 {
          margin-bottom: 32px !important;
        }
        .gap-4 {
          gap: 16px !important;
        }
        .gap-8 {
          gap: 32px !important;
        }
        .p-2 {
          padding: 8px !important;
        }
        .px-8 {
          padding-left: 32px !important;
          padding-right: 32px !important;
        }
        .py-1 {
          padding-top: 4px !important;
          padding-bottom: 4px !important;
        }
        
        /* Text formatting for print */
        .text-left {
          text-align: left !important;
        }
        .text-center {
          text-align: center !important;
        }
        .text-right {
          text-align: right !important;
        }
        
        /* Ensure proper spacing between elements */
        .flex {
          display: flex !important;
        }
        .justify-between {
          justify-content: space-between !important;
        }
        .items-center {
          align-items: center !important;
        }
        .w-full {
          width: 100% !important;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-shadow: none !important; /* remove shadows in print */
        }
      }
    `
    
    const styleElement = document.createElement('style')
    styleElement.textContent = printStyles
    document.head.appendChild(styleElement)
    
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  if (isLoading || !payslipData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading payslip data...</div>
        </div>
      </div>
    )
  }

  // Optional balances (for Leaves balance display)
  const leavesBalanceUsed = payslipData.leaves_balance_used || payslipData.leaves_used || payslipData.leave_balance_used
  const leavesBalanceTotal = payslipData.leaves_balance_total || payslipData.leaves_total || payslipData.total_leaves
  const leavesBalanceStr = (leavesBalanceUsed !== undefined && leavesBalanceTotal !== undefined)
    ? `${leavesBalanceUsed}/${leavesBalanceTotal}`
    : null

  // Basic Pay and Total Earned: use salary_amount from API (DB_DATA.salary_amount)
  const basicPay = Number(payslipData.salary_amount ?? payslipData.basic_pay ?? payslipData.rate ?? 0)
  const incrementedAmount = Number(payslipData.incentive || 0)
  const empSalary = Number(payslipData.emp_salary || payslipData.salary_amount || 0)
  const totalPay = Number(payslipData.total_pay || (empSalary + incrementedAmount))
  
  // Handle income_tax - preserve null, use 0 for calculations
  const incomeTaxRaw = payslipData.income_tax !== undefined ? payslipData.income_tax : (payslipData.tax !== undefined ? payslipData.tax : null)
  const incomeTax = incomeTaxRaw === null ? null : (isNaN(Number(incomeTaxRaw)) ? null : Number(incomeTaxRaw))
  const incomeTaxForCalc = incomeTax === null ? 0 : incomeTax
  
  // EOBI - preserve null, use 0 for calculations
  const eobiRaw = payslipData.eobi !== undefined ? payslipData.eobi : (payslipData.eobi_emp_contribution !== undefined ? payslipData.eobi_emp_contribution : null)
  const eobi = eobiRaw === null ? null : (isNaN(Number(eobiRaw)) ? null : Number(eobiRaw))
  const eobiForCalc = eobi === null ? 0 : eobi
  
  // Provident Fund - preserve null, use 0 for calculations
  const providentFundRaw = payslipData.provident_fund !== undefined ? payslipData.provident_fund : (payslipData.provident_fund_emp_contribution !== undefined ? payslipData.provident_fund_emp_contribution : null)
  const pfEmployeeRaw = payslipData.provident_fund_emp_contribution !== undefined ? payslipData.provident_fund_emp_contribution : (payslipData.pf_employee !== undefined ? payslipData.pf_employee : (payslipData.provident_employee !== undefined ? payslipData.provident_employee : providentFundRaw))
  const pfEmployee = pfEmployeeRaw === null ? null : (isNaN(Number(pfEmployeeRaw)) ? null : Number(pfEmployeeRaw))
  const pfEmployeeForCalc = pfEmployee === null ? 0 : pfEmployee
  const pfEmployerForCalc = Number(payslipData.provident_fund_employer_contribution || 0)
  const pfTotalForCalc = Number(payslipData.provident_fund_total ?? (pfEmployeeForCalc + pfEmployerForCalc))
  
  // Social Security - preserve null, use 0 for calculations
  // const socialSecurityRaw = payslipData.social_security !== undefined ? payslipData.social_security : (payslipData.social_security_deduction !== undefined ? payslipData.social_security_deduction : null)
  // const socialSecurity = socialSecurityRaw === null ? null : (isNaN(Number(socialSecurityRaw)) ? null : Number(socialSecurityRaw))
  // const socialSecurityForCalc = socialSecurity === null ? 0 : socialSecurity
  const socialSecurityForCalc = 0
  
  // Extra deduction line-items coming from incentive/deduction array (DEDUCTION only)
  const deductionLineItems =
    payslipData.incentive_deduction && Array.isArray(payslipData.incentive_deduction)
      ? payslipData.incentive_deduction.filter((item) => item.d_type === 'DEDUCTION')
      : []

  const deductionsFromIncentiveArray = deductionLineItems.reduce((sum, item) => {
    const raw = item.monthly_amount > 0 ? item.monthly_amount : item.amount
    const amt = parseFloat(raw || 0)
    return sum + (Number.isNaN(amt) ? 0 : amt)
  }, 0)

  /**
   * Standalone "other" amount from API only. If legacy payloads still echo `deduction`
   * into `other_deductions` and the same amount is already summed in itemized DEDUCTION rows,
   * do not count it twice (e.g. loan shown once in the table but present in both fields).
   */
  const rawOtherDeductions = Number(payslipData.other_deductions || 0)
  const aggregateDeductionField = Number(payslipData.deduction || 0)
  const duplicateOtherWithItemized =
    rawOtherDeductions > 0 &&
    deductionsFromIncentiveArray > 0 &&
    Math.abs(rawOtherDeductions - deductionsFromIncentiveArray) < 0.01 &&
    Math.abs(rawOtherDeductions - aggregateDeductionField) < 0.01
  const otherDeductions = duplicateOtherWithItemized ? 0 : rawOtherDeductions
  
  // Get attendance_summary deduction values
  const calculatedAbsenteeDeduction = payslipData.attendance_summary?.calculated_absentee_deduction 
    ? parseFloat(payslipData.attendance_summary.calculated_absentee_deduction) 
    : 0
  const calculatedLateDeduction = payslipData.attendance_summary?.calculated_late_deduction 
    ? parseFloat(payslipData.attendance_summary.calculated_late_deduction) 
    : 0
  const downtimeDeduction = payslipData.attendance_summary?.early_leave_downtime != null
    ? parseFloat(payslipData.attendance_summary.early_leave_downtime)
    : 0
  
  // Attendance Deduction should be the sum of calculated_absentee_deduction and calculated_late_deduction
  // If attendance_summary values exist, use their sum; otherwise fallback to att_deductions
  const attendanceDeductionFromSummary = calculatedAbsenteeDeduction + calculatedLateDeduction
  const attendanceDeduction = attendanceDeductionFromSummary > 0 
    ? attendanceDeductionFromSummary 
    : Number(payslipData.absentees_deduction || payslipData.att_deductions || 0)
  
  // Calculate total deductions: Income Tax + EOBI + Social Security + Provident Fund + Attendance Deduction + Downtime + Other Deductions + Deductions from incentive array
  // Use ForCalc versions to handle null values (convert to 0 for calculations)
  // Note: Social Security is commented out
  // Note: attendanceDeduction already includes calculatedAbsenteeDeduction + calculatedLateDeduction, so don't add them separately
  const totalDeductions =
    attendanceDeduction +
    deductionsFromIncentiveArray +
    eobiForCalc +
    socialSecurityForCalc +
    pfEmployeeForCalc +
    incomeTaxForCalc +
    downtimeDeduction +
    otherDeductions
  
  // Calculate net pay: Total Pay - Total Deductions (for future use if needed)
  // const calculatedNetPay = Math.max(0, totalPay - totalDeductions)
  
  // Attendance fields - use API values from transformPayslipData (preserve 0; only fallback when missing)
  const totalDays = (payslipData.total_days !== undefined && payslipData.total_days !== null)
    ? Number(payslipData.total_days)
    : Math.round((payslipData.total_working || 0) / 3600 / 8)
  const presentDays = (payslipData.present_days !== undefined && payslipData.present_days !== null)
    ? Number(payslipData.present_days)
    : Math.round((payslipData.total_present || 0) / 3600 / 8)
  const absentDays = (payslipData.absent_days !== undefined && payslipData.absent_days !== null)
    ? Number(payslipData.absent_days)
    : Math.max(0, totalDays - presentDays)

  const requiredDays =
    payslipData.required_days !== undefined && payslipData.required_days !== null
      ? Number(payslipData.required_days)
      : totalDays
  const leaveCount = Number(payslipData.leave_days ?? payslipData.leaves_encashable ?? 0)
  const incentiveRows =
    payslipData.incentive_deduction && Array.isArray(payslipData.incentive_deduction)
      ? payslipData.incentive_deduction.filter((item) => item.d_type === 'INCENTIVE')
      : []
  const incentiveExtrasTotal = incentiveRows.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0),
    0
  )
  const displayEmployeeName = payslipData.name && payslipData.name !== '0' ? payslipData.name : '--'
  const joinDateLabel = formatDisplayJoinDate(payslipData.joining_date_raw)
  const bankBranchDisplay =
    payslipData.bank_branch && payslipData.bank_branch !== '0' ? payslipData.bank_branch : '--'
  const hasExtraAdditionsTable = incentiveRows.length > 0

  const overtimeAmount = Number(payslipData.overtime_amount || 0)
  const salaryEarnedAmount = Number(payslipData.salary_amount || 0)

  const showPrintPaymentSection =
    basicPay > 0 ||
    overtimeAmount > 0 ||
    incrementedAmount > 0 ||
    salaryEarnedAmount > 0 ||
    totalPay > 0

  const showPrintProvidentFundRow = pfEmployeeForCalc > 0

  const formatPkr = (n) =>
    `PKR ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}/-`

  const formatPkrAmount = (n) =>
    Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })

  const incentiveRowsPrint = incentiveRows.filter((item) => parseFloat(item.amount || 0) > 0)
  const incentiveExtrasTotalPrint = incentiveRowsPrint.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0),
    0
  )

  const hasPrintDeductionContent =
    showPrintProvidentFundRow ||
    eobiForCalc > 0 ||
    incomeTaxForCalc > 0 ||
    calculatedAbsenteeDeduction > 0 ||
    calculatedLateDeduction > 0 ||
    downtimeDeduction > 0 ||
    otherDeductions > 0 ||
    attendanceDeduction > 0 ||
    deductionLineItems.some(
      (item) => parseFloat(item.monthly_amount > 0 ? item.monthly_amount : item.amount || 0) > 0
    )

  return (
    // Scroll is handled by App main content (`overflow-y-auto`); avoid max-h-screen here or tall content is clipped.
      <div className="w-full max-w-full min-h-0 pt-4 pb-12 print:pt-0 print:pb-0 print:px-0">
        {/* Header with Close and Print buttons on top right */}
        <div className="no-print mb-6 relative px-8">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-xs text-gray-600">
              <span className="font-bold">{payslipData.name}</span> <span className="font-light">Invoice for the month of {payslipData.month}/{payslipData.year}</span>
            </h1>
          </div>
          
          {/* Close and Print buttons positioned on top right */}
          <div className="absolute top-0 right-0 flex gap-2 px-8">
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs cursor-pointer select-none transition-colors duration-150"
              type="button"
            >
              Print
            </button>
            <button
              onClick={handleClose}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs cursor-pointer select-none transition-colors duration-150 active:bg-blue-700"
              type="button"
            >
              close
            </button>
          </div>
        </div>

        {/* Payslip Content */}
        <div className="invoice-container bg-white rounded-lg p-5 print:p-2 print:m-0 print:rounded-none print:max-w-none">
          <div className="hide-in-print">
            <div className="mb-6">
              <h1 className="text-sm text-gray-600 font-bold">Payslip</h1>
            </div>
          {/* Payroll Summary - Full Width with Light Text */}
          <div className="payroll-summary mb-8">
            <div className="w-full space-y-4">
               {/* First Row */}
               <div className="flex justify-between items-center w-full text-left">
                 <span className="text-xs text-gray-600 font-bold">Payroll</span>
                 <span className="text-xs text-gray-600">{formatPayrollTypeLabel(payslipData.attendance_summary?.payroll_type)}</span>
                 <span className="text-xs text-gray-600 font-bold">Required</span>
                 <span className="text-xs text-gray-600">{formatHoursMinutes(payslipData.total_working || 0)} +Holidays: 0</span>
                 <span className="text-xs text-gray-600 font-bold">Earned</span>
                 <span className="text-xs text-gray-600">{formatHoursMinutes(payslipData.total_present || 0)} +Holidays: 0</span>
                 <span className="text-xs text-gray-600 font-bold">Adjusted Late min</span>
                 <span className="text-xs text-gray-600">{payslipData.attendance_summary?.total_adjusted_late_min || 0}</span>
               </div>
               
               {/* Second Row - use attendance_summary-backed totalDays, presentDays, absentDays, leave_days */}
               <div className="flex justify-between items-center w-full text-left">
                 <span className="text-xs text-gray-600 font-bold">Total days</span>
                 <span className="text-xs text-gray-600">{totalDays}</span>
                 <span className="text-xs text-gray-600 font-bold">Present days</span>
                 <span className="text-xs text-gray-600">{presentDays}</span>
                 <span className="text-xs text-gray-600 font-bold">Absent days</span>
                 <span className="text-xs text-gray-600">{absentDays}</span>
                 <span className="text-xs text-gray-600 font-bold">Leaves</span>
                 <span className="text-xs text-gray-600">{payslipData.leave_days ?? payslipData.leaves_encashable ?? 0}</span>
               </div>
            </div>
          </div>

          {/* Earnings and Deductions - Separate Tables */}
          <div className="earnings-deductions-container mb-8 flex gap-8">
            {/* Earnings Table */}
            <div className="earnings-table flex-1">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-xs font-semibold text-gray-600 border-b border-gray-300 p-2 text-left">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                   <tr>
                     <td className="border-b border-gray-300 p-2">
                       <div className="flex justify-between items-center gap-4">
                         <span className="text-xs text-gray-600">Basic Pay</span>
                         <span className="text-xs text-blue-600 text-center">PKR {parseFloat(basicPay || 0).toLocaleString()}</span>
                       </div>
                     </td>
                   </tr>
                   <tr>
                     <td className="border-b border-gray-300 p-2">
                       <div className="flex justify-between items-center gap-4">
                         <span className="text-xs text-gray-600">Overtime</span>
                         <span className="text-xs text-blue-600 text-center">PKR {parseFloat(payslipData.overtime_amount || 0).toLocaleString()}</span>
                       </div>
                     </td>
                   </tr>
                   <tr>
                     <td className="border-b border-gray-300 p-2">
                       <div className="flex justify-between items-center gap-4">
                         <span className="text-xs text-gray-600 font-bold">Total Earned</span>
                         <span className="text-xs text-gray-600 text-center">PKR {parseFloat(payslipData.salary_amount || 0).toLocaleString()}</span>
                       </div>
                     </td>
                   </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions Table */}
            <div className="deductions-table flex-1">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-xs font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 p-2 text-left bg-slate-100">
                      Deductions
                    </th>
                  </tr>
                </thead>
                <tbody>
                   {showPrintProvidentFundRow ? (
                     <tr>
                       <td className="border-b border-gray-300 p-2">
                         <div className="grid grid-cols-[minmax(0,34%)_minmax(0,42%)_minmax(0,24%)] gap-x-2 text-xs text-gray-600 items-start">
                           <div className="font-medium text-gray-700">
                             Provident Fund Deductions
                           </div>
                           <div className="leading-relaxed">
                             <div>Employee Contribution: PKR {pfEmployeeForCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                             <div>Employer Contribution: PKR {pfEmployerForCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                             <div className="mt-1 font-medium text-gray-700">Total: PKR {pfTotalForCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                           </div>
                           <div className="text-right text-blue-600 tabular-nums">
                             PKR {pfEmployeeForCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                           </div>
                         </div>
                       </td>
                     </tr>
                   ) : null}
                   {eobi !== null && eobi !== undefined && (
                     <tr>
                       <td className="border-b border-gray-300 p-2">
                         <div className="flex justify-between items-center gap-4">
                           <span className="text-xs text-gray-600">EOBI Deduction</span>
                           <span className="text-xs text-blue-600 text-center">PKR {eobi.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                         </div>
                       </td>
                     </tr>
                   )}
                   {/* {socialSecurity !== null && socialSecurity !== undefined && (
                     <tr>
                       <td className="border-b border-gray-300 p-2">
                         <div className="flex justify-between items-center gap-4">
                           <span className="text-xs text-gray-600">Social Security Deduction</span>
                           <span className="text-xs text-blue-600 text-center">PKR {socialSecurity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                         </div>
                       </td>
                     </tr>
                   )} */}
                     <tr>
                       <td className="border-b border-gray-300 p-2">
                         <div className="flex justify-between items-center gap-4">
                           <span className="text-xs text-gray-600">Income Tax</span>
                           <span className="text-xs text-blue-600 text-center">PKR {incomeTax === null ? 0 : incomeTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                         </div>
                       </td>
                     </tr>
                   {/* Calculated deductions from attendance_summary - only show if > 0 */}
                   {calculatedAbsenteeDeduction > 0 && (
                     <tr>
                       <td className="border-b border-gray-300 p-2">
                         <div className="flex justify-between items-center gap-4">
                           <span className="text-xs text-gray-600">Absentee Deduction</span>
                           <span className="text-xs text-blue-600 text-center">PKR {calculatedAbsenteeDeduction.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                         </div>
                       </td>
                     </tr>
                   )}
                   {calculatedLateDeduction > 0 && (
                     <tr>
                       <td className="border-b border-gray-300 p-2">
                         <div className="flex justify-between items-center gap-4">
                           <span className="text-xs text-gray-600">Late Minute Deduction</span>
                           <span className="text-xs text-blue-600 text-center">PKR {calculatedLateDeduction.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                         </div>
                       </td>
                     </tr>
                   )}
                   <tr>
                     <td className="border-b border-gray-300 p-2">
                       <div className="flex justify-between items-center gap-4">
                         <span className="text-xs text-gray-600">Downtime <span className="text-[10px]">(Early Leave)</span></span>
                         <span className="text-xs text-blue-600 text-center">PKR {(downtimeDeduction || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                         </div>
                     </td>
                   </tr>
                   {attendanceDeduction > 0 && (
                     <tr>
                       <td className="p-2" style={{ borderBottom: 'none', borderTop: '2px solid #d1d5db' }}>
                         <div className="flex justify-between items-center gap-4 font-semibold">
                           <span className="text-xs text-gray-600">Attendance Deduction</span>
                           <span className="text-xs text-gray-600 text-center">PKR {attendanceDeduction.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                         </div>
                       </td>
                     </tr>
                   )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Extra Additions and Deductions - Separate Tables */}
          <div className="extra-deductions-container mb-8 flex gap-8">
             {/* Extra Additions Table */}
             <div className="extra-additions-table flex-1">
               <table className="w-full">
                 <thead>
                   <tr>
                     <th className="text-xs font-semibold text-gray-600 p-2 text-left">Extra Additions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {payslipData.incentive_deduction && Array.isArray(payslipData.incentive_deduction) && payslipData.incentive_deduction
                     .filter(item => item.d_type === "INCENTIVE")
                     .map((item, index) => (
                       <tr key={item.id || index}>
                         <td className="border-b border-gray-300 p-2">
                           <div className="flex justify-between items-start gap-4">
                             <div className="flex flex-col">
                              <span className="text-xs text-gray-600">{item.title || 'Incentive'}</span>
                              {item.description && <span style={{ fontSize: '0.65em', color: '#666' }}>({item.description})</span>}
                             </div>
                             <span className="text-xs text-blue-600 text-center">PKR {parseFloat(item.amount || 0).toLocaleString()}</span>
                           </div>
                         </td>
                       </tr>
                     ))}
                   {(!payslipData.incentive_deduction || !Array.isArray(payslipData.incentive_deduction) || payslipData.incentive_deduction.filter(item => item.d_type === "INCENTIVE").length === 0) && (
                   <tr>
                     <td className="p-2">
                         {/* Empty section if no incentives */}
                     </td>
                   </tr>
                   )}
                 </tbody>
               </table>
             </div>

            {/* Second Deductions Table */}
            <div className="deductions-table flex-1">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-xs font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 p-2 text-left bg-slate-100">
                      Deductions
                    </th>
                  </tr>
                </thead>
                <tbody>
                   {/* Additional deductions from incentive_deduction array - shown as key-value pairs */}
                   {payslipData.incentive_deduction && Array.isArray(payslipData.incentive_deduction) && payslipData.incentive_deduction
                     .filter(item => item.d_type === "DEDUCTION")
                     .map((item, index) => (
                       <tr key={item.id || index}>
                         <td className="border-b border-gray-300 p-2">
                           <div className="flex justify-between items-center gap-4">
                             <span className="text-xs text-gray-600">{item.title || 'Deduction'}:</span>
                             <span className="text-xs text-blue-600 text-center">PKR {parseFloat(item.monthly_amount > 0 ? item.monthly_amount : item.amount || 0).toLocaleString()}</span>
                           </div>
                         </td>
                       </tr>
                     ))}
                   {/* Show message if no deductions */}
                   {(!payslipData.incentive_deduction || !Array.isArray(payslipData.incentive_deduction) || payslipData.incentive_deduction.filter(item => item.d_type === "DEDUCTION").length === 0) && (
                     <tr>
                       <td className="p-2">
                         <span className="text-xs text-gray-400">No deductions</span>
                       </td>
                     </tr>
                   )}
                   {/* Calculate total only for deductions shown in this table */}
                   {(() => {
                     const deductionsFromArray = payslipData.incentive_deduction && Array.isArray(payslipData.incentive_deduction)
                       ? payslipData.incentive_deduction
                           .filter(item => item.d_type === "DEDUCTION")
                           .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
                       : 0;
                     
                     return deductionsFromArray > 0 ? (
                       <tr>
                         <td className="border-b border-gray-300 p-2">
                           <div className="flex justify-between items-center gap-4 font-semibold">
                             <span className="text-xs text-gray-600">Total Deduction</span>
                             <span className="text-xs text-gray-600 text-center">PKR {parseFloat(totalDeductions || 0).toLocaleString()}</span>
                           </div>
                         </td>
                       </tr>
                     ) : null;
                   })()}
                </tbody>
              </table>
            </div>
          </div>

           {/* Net Pay Section */}
           <div className="net-pay-section w-full">
             {/* <div className="flex justify-between items-center"> */}
               <div className="flex items-center justify-between">
                 <h3 className="text-sm font-semibold text-gray-600 font-bold">Net Pay</h3>
                 <span className="text-sm font-semibold text-gray-600 font-bold">PKR {parseFloat(payslipData.paid_amount || 0).toLocaleString()}</span>
                 <span className="text-xs text-gray-600 font-bold">Payment Mode: {payslipData.pay_method}</span>
               </div>
             {/* </div> */}
           </div>
           </div>

          <div className="payslip-print-template hidden max-w-3xl mx-auto print:max-w-none print:w-full print:mx-0">
            <div className="payslip-print-root bg-gradient-to-b from-slate-100 via-white to-indigo-50/40 p-4 sm:p-6 rounded-3xl print:p-0 print:rounded-none print:from-white print:to-white print:bg-white print:overflow-visible">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-0 border-transparent shadow-xl shadow-slate-300/40 ring-0 p-4 sm:p-5 print:shadow-none print:rounded-none print:border-0 print:ring-0 print:backdrop-blur-none print:bg-white print:overflow-visible print:p-3">
                <div className="rounded-xl print:rounded-lg mb-4 print:mb-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-4 py-4 sm:px-5 sm:py-4 shadow-sm print:shadow-none">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 mb-1">Employee</p>
                      <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                        {displayEmployeeName}
                      </h1>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex items-center rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/35">
                        {payslipData.month} {payslipData.year}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="payslip-print-user-info-grid grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3 print:mb-2.5">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-slate-700">
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-1">Profile</p>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">CNIC/Passport</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{payslipData.passport_no && payslipData.passport_no !== '0' ? payslipData.passport_no : '—'}</span></div>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">Employee ID</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{payslipData.employee_id || payslipData.emp_id || '—'}</span></div>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">Biometric ID</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{payslipData.biometric_id && payslipData.biometric_id !== 0 ? payslipData.biometric_id : '—'}</span></div>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">Branch</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{payslipData.branch_name && payslipData.branch_name !== '0' ? payslipData.branch_name : '—'}</span></div>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">Department</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{payslipData.department_name && payslipData.department_name !== '0' ? payslipData.department_name : '—'}</span></div>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">Designation</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{payslipData.designation && payslipData.designation !== '0' ? payslipData.designation : '—'}</span></div>
                    <div className="flex gap-2 py-0 leading-snug border-0 print:border-0">
                      <span className="text-sm font-bold text-slate-800 min-w-[120px]">Joined on</span>
                      <span className="text-slate-500">:</span>
                      <span className="text-xs text-slate-600">{joinDateLabel || '—'}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-slate-700">
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-1">Bank details</p>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">Bank</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{payslipData.bank_name && payslipData.bank_name !== '0' ? payslipData.bank_name : '—'}</span></div>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">Bank Branch</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{bankBranchDisplay}</span></div>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">Branch Code</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{payslipData.bank_branch_code && payslipData.bank_branch_code !== '0' ? payslipData.bank_branch_code : '—'}</span></div>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">Account No</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{maskBankAccountDisplay(payslipData.bank_account_no)}</span></div>
                    <div className="flex gap-2 py-0 leading-snug"><span className="text-sm font-bold text-slate-800 min-w-[120px]">Account Title</span><span className="text-slate-500">:</span><span className="text-xs text-slate-600">{payslipData.bank_account_title && payslipData.bank_account_title !== '0' ? payslipData.bank_account_title : displayEmployeeName}</span></div>
                  </div>
                </div>

                <div className="payslip-print-payroll-summary rounded-lg border border-slate-200 bg-white p-3 mb-3 print:mb-2.5 text-sm text-gray-900">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-[0.12em] text-[#b45309] mb-1.5">
                    Payroll summary
                  </h2>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-gray-900">
                    <span className="inline-flex items-baseline gap-1.5 text-sm">
                      <span className="font-bold text-slate-900">Total days</span>
                      <span className="text-xs tabular-nums font-normal text-slate-600">{totalDays}</span>
                    </span>
                    <span className="inline-flex items-baseline gap-1.5 text-sm">
                      <span className="font-bold text-slate-900">Required days</span>
                      <span className="text-xs tabular-nums font-normal text-slate-600">{requiredDays}</span>
                    </span>
                    <span className="inline-flex items-baseline gap-1.5 text-sm">
                      <span className="font-bold text-slate-900">Present days</span>
                      <span className="text-xs tabular-nums font-normal text-slate-600">{presentDays}</span>
                    </span>
                    <span className="inline-flex items-baseline gap-1.5 text-sm">
                      <span className="font-bold text-slate-900">Absent days</span>
                      <span className="text-xs tabular-nums font-normal text-slate-600">{absentDays}</span>
                    </span>
                    <span className="inline-flex items-baseline gap-1.5 text-sm">
                      <span className="font-bold text-slate-900">Leaves</span>
                      <span className="text-xs tabular-nums font-normal text-slate-600">
                        {leaveCount}
                        {leavesBalanceStr ? ` (${leavesBalanceStr})` : ''}
                      </span>
                    </span>
                  </div>
                </div>

                {showPrintPaymentSection ? (
                  <div className="payslip-print-table-shell rounded-lg overflow-hidden print:overflow-visible border border-slate-200 bg-white mb-3 print:mb-2.5 shadow-none">
                    <div className="payslip-print-section-title payslip-print-heading-gradient rounded-t-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 py-2.5 px-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                      Payment details
                    </div>
                    <table className="payslip-print-data-table w-full text-sm">
                      <tbody>
                        {basicPay > 0 ? (
                          <tr className="bg-white">
                            <td className="py-2 px-3 text-slate-600">Basic Pay</td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900 tabular-nums">{formatPkr(basicPay)}</td>
                          </tr>
                        ) : null}
                        {overtimeAmount > 0 ? (
                          <tr className="bg-slate-50/40">
                            <td className="py-2 px-3 text-slate-600">Overtime</td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900 tabular-nums">{formatPkr(overtimeAmount)}</td>
                          </tr>
                        ) : null}
                        {incrementedAmount > 0 ? (
                          <tr className="bg-white">
                            <td className="py-2 px-3 text-slate-600">Incremented Amount</td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900 tabular-nums">{formatPkr(incrementedAmount)}</td>
                          </tr>
                        ) : null}
                        {salaryEarnedAmount > 0 ? (
                          <tr className="bg-slate-50/40">
                            <td className="py-2 px-3 font-semibold text-slate-800">Total Earned</td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900 tabular-nums">{formatPkr(salaryEarnedAmount)}</td>
                          </tr>
                        ) : null}
                        {totalPay > 0 ? (
                          <tr className="bg-gradient-to-r from-emerald-50 to-teal-50/80">
                            <td className="py-2.5 px-3 font-bold text-emerald-900">Total Pay</td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-900 tabular-nums">{formatPkr(totalPay)}</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {incentiveRowsPrint.length > 0 ? (
                  <div className="payslip-print-table-shell rounded-lg overflow-hidden print:overflow-visible border border-slate-200 bg-white mb-3 print:mb-2.5 shadow-none">
                    <div className="payslip-print-section-title payslip-print-heading-gradient rounded-t-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 py-2.5 px-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                      Extra additions
                    </div>
                    <table className="payslip-print-data-table w-full text-sm">
                      <tbody>
                        {incentiveRowsPrint.map((item, index) => (
                          <tr key={item.id || index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                            <td className="py-2 px-3 text-slate-600">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-slate-800">{item.title || 'Addition'}</span>
                                {item.description ? (
                                  <span className="text-xs text-slate-500">({item.description})</span>
                                ) : null}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900 tabular-nums">
                              {formatPkr(parseFloat(item.amount || 0))}
                            </td>
                          </tr>
                        ))}
                        {incentiveExtrasTotalPrint > 0 ? (
                          <tr className="bg-gradient-to-r from-emerald-50 to-teal-50/80">
                            <td className="py-2.5 px-3 font-bold text-emerald-900">
                              {incentiveRowsPrint.length === 1 ? incentiveRowsPrint[0].title || 'Total additions' : 'Total additions'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-900 tabular-nums">{formatPkr(incentiveExtrasTotalPrint)}</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {hasPrintDeductionContent ? (
                  <div className="payslip-print-table-shell rounded-lg overflow-hidden print:overflow-visible border border-slate-200 bg-white mb-3 print:mb-2.5 shadow-none">
                    <div className="payslip-print-section-title payslip-print-heading-gradient rounded-t-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 py-2.5 px-3 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                      Deductions
                    </div>
                    <table className="payslip-print-data-table w-full text-sm">
                      <tbody>
                        {showPrintProvidentFundRow ? (
                          <tr className="bg-white">
                            <td colSpan={2} className="p-0">
                              <div className="grid grid-cols-[34%_42%_24%] text-slate-700 text-sm">
                                <div className="px-3 py-2 font-medium" style={{ borderRight: '1px solid #e5e7eb' }}>
                                  Provident Fund Deductions
                                </div>
                                <div className="px-3 py-2 leading-relaxed" style={{ borderRight: '1px solid #e5e7eb' }}>
                                  <div className="pb-1 mb-1" style={{ borderBottom: '1px solid #e5e7eb' }}>Employee Contribution: PKR {pfEmployeeForCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                  <div>Employer Contribution: PKR {pfEmployerForCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                  <div className="mt-1 font-medium">Total: PKR {pfTotalForCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                                <div className="px-3 py-2 font-medium tabular-nums text-slate-900">
                                  PKR {pfEmployeeForCalc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                        {eobiForCalc > 0 ? (
                          <tr className="bg-slate-50/40">
                            <td className="py-2 px-3 text-slate-600">EOBI</td>
                            <td className="py-2 px-3 text-right font-semibold tabular-nums text-slate-900">{formatPkr(eobiForCalc)}</td>
                          </tr>
                        ) : null}
                        {incomeTaxForCalc > 0 ? (
                          <tr className="bg-white">
                            <td className="py-2 px-3 text-slate-600">Income Tax</td>
                            <td className="py-2 px-3 text-right font-semibold tabular-nums text-slate-900">{formatPkr(incomeTaxForCalc)}</td>
                          </tr>
                        ) : null}
                        {calculatedAbsenteeDeduction > 0 ? (
                          <tr className="bg-slate-50/40">
                            <td className="py-2 px-3 text-slate-600">Absentee Deduction</td>
                            <td className="py-2 px-3 text-right font-semibold tabular-nums text-slate-900">{formatPkr(calculatedAbsenteeDeduction)}</td>
                          </tr>
                        ) : null}
                        {calculatedLateDeduction > 0 ? (
                          <tr className="bg-white">
                            <td className="py-2 px-3 text-slate-600">Late Minute Deduction</td>
                            <td className="py-2 px-3 text-right font-semibold tabular-nums text-slate-900">{formatPkr(calculatedLateDeduction)}</td>
                          </tr>
                        ) : null}
                        {downtimeDeduction > 0 ? (
                          <tr className="bg-slate-50/40">
                            <td className="py-2 px-3 text-slate-600">
                              Downtime <span className="text-xs text-slate-500">(Early Leave)</span>
                            </td>
                            <td className="py-2 px-3 text-right font-semibold tabular-nums text-slate-900">{formatPkr(downtimeDeduction)}</td>
                          </tr>
                        ) : null}
                        {deductionLineItems.map((item, index) => {
                          const amt = parseFloat(item.monthly_amount > 0 ? item.monthly_amount : item.amount || 0)
                          if (amt <= 0) return null
                          const zebra = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                          return (
                            <tr key={item.id || index} className={zebra}>
                              <td className="py-2 px-3 text-slate-600">{item.title || 'Deduction'}</td>
                              <td className="py-2 px-3 text-right font-semibold tabular-nums text-slate-900">{formatPkr(amt)}</td>
                            </tr>
                          )
                        })}
                        {otherDeductions > 0 ? (
                          <tr className="bg-white">
                            <td className="py-2 px-3 text-slate-600">Other Deductions</td>
                            <td className="py-2 px-3 text-right font-semibold tabular-nums text-slate-900">{formatPkr(otherDeductions)}</td>
                          </tr>
                        ) : null}
                        {attendanceDeduction > 0 ? (
                          <tr className="bg-gradient-to-r from-rose-50 to-red-50/90">
                            <td className="py-2.5 px-3 font-bold text-red-900">Attendance Deduction</td>
                            <td className="py-2.5 px-3 text-right font-bold text-red-900 tabular-nums">
                              {formatPkr(attendanceDeduction)}
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 print:mb-2.5 print:gap-3">
                  <div className="payslip-print-payable-card rounded-xl border border-emerald-200/70 bg-emerald-50/90 px-5 py-4 text-center shadow-none print:shadow-none">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Payable</p>
                    <p className="text-slate-800 leading-tight">
                      <span className="text-sm font-normal">PKR </span>
                      <span className="text-2xl font-bold tabular-nums">{formatPkrAmount(payslipData.paid_amount || 0)}</span>
                      <span className="text-sm font-normal">/-</span>
                    </p>
                  </div>
                  <div className="payslip-print-total-deductions-card rounded-xl border border-rose-200/70 bg-rose-50/90 px-5 py-4 text-center shadow-none print:shadow-none">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Total Deductions</p>
                    <p className="text-slate-800 leading-tight">
                      <span className="text-sm font-normal">PKR </span>
                      <span className="text-xl font-bold tabular-nums">{formatPkrAmount(totalDeductions)}</span>
                      <span className="text-sm font-normal">/-</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 print:gap-6 pt-4 print:pt-5 border-0">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Officer signature</span>
                    <div className="w-full min-h-[28px] border-b border-slate-300 print:border-slate-400" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Employee signature</span>
                    <div className="w-full min-h-[28px] border-b border-slate-300 print:border-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    // </div>
  )
}

export default IndividualPayslipPreview
