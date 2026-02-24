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
  if (!summary || typeof summary !== 'object') return { total_adjusted_late_min: 0, total_late_minutes_used: 0, calculated_absentee_deduction: 0, calculated_late_deduction: 0, att_deductions_from_payslip: 0, early_leave_downtime: 0, calculation_method: '0', formula: 0, daily_req_hrs: 0, total_days: 0, present_days: 0, absent_days: 0, leaves: 0 }
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
  }
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
      other_deductions: formatNumber(payslip.deduction),
      income_tax: getIncomeTaxAmount(payslip.income_tax),
      eobi: getEobiEmpContribution(payslip.eobi_record || payslip.eobi),
      eobi_emp_contribution: getEobiEmpContribution(payslip.eobi_record || payslip.eobi),
      eobi_employer_contribution: (payslip.eobi_record || payslip.eobi) && typeof (payslip.eobi_record || payslip.eobi) === 'object' && (payslip.eobi_record || payslip.eobi).employer_contribution !== undefined ? formatNumber((payslip.eobi_record || payslip.eobi).employer_contribution) : 0,
      provident_fund: getProvidentFundEmpContribution(payslip.provident_fund),
      provident_fund_emp_contribution: getProvidentFundEmpContribution(payslip.provident_fund),
      provident_fund_employer_contribution: payslip.provident_fund && typeof payslip.provident_fund === 'object' && payslip.provident_fund.employer_contribution !== undefined ? formatNumber(payslip.provident_fund.employer_contribution) : 0,
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

  useEffect(() => {
    console.log(payslipData)
  },)

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
        
        /* Invoice container styles */
        .invoice-container {
          position: relative !important;
          width: 100% !important; /* full page width */
          max-width: none !important;
          box-shadow: none !important;
          border: none !important;
          // padding: 20px !important;
          background: white !important;
          margin: 0 !important;
        }
        
        /* Page setup */
        @page {
          margin: 0mm !important;
          // size: A4 !important;
        }
        
        /* Body reset */
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
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
        .payslip-print-template { display: block !important; }

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
        .tpl-underline { border-bottom: 1px solid #111827 !important; flex: 1 !important; height: 16px !important; }

        /* Hide old sections in print */
        .payroll-summary, .earnings-deductions-container, .extra-deductions-container, .net-pay-section { display: none !important; }
        
        /* Table styles */
        table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        th, td {
          border-bottom: 1px solid #d1d5db !important;
          padding: 8px !important;
        }
        thead th { border-top: 1px solid #d1d5db !important; }
        
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

  // Dynamic monetary fields with safe fallbacks - use basic_pay from API when present (including 0); only fallback to rate when basic_pay is null/undefined
  const basicPay = payslipData.basic_pay != null ? Number(payslipData.basic_pay) : Number(payslipData.rate || 0)
  const incrementedAmount = Number(payslipData.incentive || 0)
  const empSalary = Number(payslipData.emp_salary || payslipData.salary_amount || 0)
  const totalPay = Number(payslipData.total_pay || (empSalary + incrementedAmount))
  const otherDeductions = Number(payslipData.other_deductions || payslipData.deduction || 0)
  
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
  
  // Social Security - preserve null, use 0 for calculations
  // const socialSecurityRaw = payslipData.social_security !== undefined ? payslipData.social_security : (payslipData.social_security_deduction !== undefined ? payslipData.social_security_deduction : null)
  // const socialSecurity = socialSecurityRaw === null ? null : (isNaN(Number(socialSecurityRaw)) ? null : Number(socialSecurityRaw))
  // const socialSecurityForCalc = socialSecurity === null ? 0 : socialSecurity
  const socialSecurityForCalc = 0
  
  // Calculate total deductions including all deduction types
  const deductionsFromIncentiveArray = payslipData.incentive_deduction && Array.isArray(payslipData.incentive_deduction)
    ? payslipData.incentive_deduction
        .filter(item => item.d_type === "DEDUCTION")
        .reduce((sum, item) => sum + parseFloat(item.monthly_amount > 0 ? item.monthly_amount : item.amount || 0), 0)
    : 0
  
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
  const totalDeductions = attendanceDeduction + deductionsFromIncentiveArray + eobiForCalc + socialSecurityForCalc + pfEmployeeForCalc + incomeTaxForCalc + downtimeDeduction
  
  // Calculate net pay: Total Pay - Total Deductions (for future use if needed)
  // const calculatedNetPay = Math.max(0, totalPay - totalDeductions)
  
  // Attendance fields - use the calculated values from transformPayslipData
  const totalDays = payslipData.total_days || Math.round((payslipData.total_working || 0) / 3600 / 8)
  const presentDays = payslipData.present_days || Math.round((payslipData.total_present || 0) / 3600 / 8)
  const absentDays = payslipData.absent_days || Math.max(0, totalDays - presentDays)

  return (
    // <div className="h-screen w-full bg-gray-50 p-4 overflow-auto">
      <div className="w-full pt-4 overflow-auto max-h-screen">
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
        <div className="invoice-container bg-white rounded-lg p-5">
          {/* Screen layout (hidden in print) */}
          <div className="hide-in-print">
            {/* Print Title - visible on screen as context */}
            <div className="mb-6">
              <h1 className="text-sm text-gray-600 font-bold">Payslip</h1>
            </div>
          </div>

          {/* Print-only template matching reference image */}
          <div className="payslip-print-template hidden">
            {/* Header with employee and bank/meta info */}
            <div className="tpl-header">
              <div className="row col-span-2"><span className="tpl-strong">{payslipData.name}</span></div>
              <div className="tpl-left">
                <div className="row"><span className="tpl-strong">CNIC/Passport No </span> <span className="tpl-muted">: {payslipData.passport_no || '--'}</span></div>
                <div className="row"><span className="tpl-strong">Employee ID</span> <span className="tpl-muted">: {payslipData.employee_id || payslipData.emp_id || '--'}</span></div>
                <div className="row"><span className="tpl-strong">Biometric ID</span> <span className="tpl-muted">: {payslipData.biometric_id || '--'}</span></div>
                <div className="row"><span className="tpl-strong">Branch</span> <span className="tpl-muted">: {payslipData.branch_name || '--'}</span></div>
                <div className="row"><span className="tpl-strong">Department</span> <span className="tpl-muted">: {payslipData.department_name || '--'}</span></div>
                <div className="row"><span className="tpl-strong">Designation</span> <span className="tpl-muted">: {payslipData.designation || '--'}</span></div>
                <div className="row"><span className="tpl-strong">Generated on</span> <span className="tpl-muted">: {payslipData.generated_date ? new Date(payslipData.generated_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
              </div>
              <div className="tpl-right">
                <div className="row"><span className="tpl-strong">Bank</span> <span className="tpl-muted">: {payslipData.bank_name || '--'}</span></div>
                <div className="row"><span className="tpl-strong">Bank Branch</span> <span className="tpl-muted">: {payslipData.branch_name || '--'}</span></div>
                <div className="row"><span className="tpl-strong">Branch Code</span> <span className="tpl-muted">: {payslipData.bank_branch_code || '--'}</span></div>
                <div className="row"><span className="tpl-strong">Account Type</span> <span className="tpl-muted">: {payslipData.bank_account_type === 1 ? 'Current' : payslipData.bank_account_type === 2 ? 'Saving' : payslipData.bank_account_type > 0 ? String(payslipData.bank_account_type) : '--'}</span></div>
                <div className="row"><span className="tpl-strong">Account Title</span> <span className="tpl-muted">: {payslipData.bank_account_title || payslipData.name || '--'}</span></div>
                <div className="row"><span className="tpl-strong">Account No</span> <span className="tpl-muted">: {payslipData.bank_account_no || '--'}</span></div>
              </div>
            </div>

            {/* Metrics row */}
            <div className="tpl-metrics flex items-ccenter justify-between ">
              <div className="tpl-metric"><span className="tpl-strong">Total days</span> : {totalDays}</div>
              <div className="tpl-metric"><span className="tpl-strong">Required days</span> : {totalDays}</div>
              <div className="tpl-metric"><span className="tpl-strong">Present days</span> : {presentDays}</div>
              <div className="tpl-metric"><span className="tpl-strong">Absent days</span> : {absentDays}</div>
              <div className="tpl-metric"><span className="tpl-strong">Holidays</span> : {payslipData.holidays || 0}</div>
              <div className="tpl-metric">
                <div><span className="tpl-strong">Leaves</span> : {payslipData.leave_days || payslipData.leaves_encashable || 0}</div>
                {leavesBalanceStr && (<div className="tpl-muted">(Balance: {leavesBalanceStr})</div>)}
              </div>
            </div>

            <div className="tpl-title">Payslip for the month of {payslipData.month} {payslipData.year}</div>
            <div className="tpl-sep"></div>

            {/* Single table: Payment details, Deductions, Payable (block direction) */}
            <table className="tpl-table equal-cols">
              <colgroup>
                <col style={{width:'50%'}} />
                <col style={{width:'50%'}} />
              </colgroup>
              <thead>
                <tr>
                  <th className="tpl-th tpl-center" colSpan={2}>Payment details</th>
                </tr>
              </thead>
              <tbody>
                {/* Payment details rows */}
                <tr className="tpl-row"><td>Basic Pay</td><td className="text-right">PKR {basicPay.toLocaleString()}/-</td></tr>
                {incrementedAmount > 0 && (
                <tr className="tpl-row"><td>Incremented Amount</td><td className="text-right">PKR {incrementedAmount.toLocaleString()}/-</td></tr>
                )}
                <tr className="tpl-row"><td>Total Pay</td><td className="text-right">PKR {totalPay.toLocaleString()}/-</td></tr>

                {/* Extra Additions section - only show if there are incentives */}
                {payslipData.incentive_deduction && Array.isArray(payslipData.incentive_deduction) && payslipData.incentive_deduction.filter(item => item.d_type === "INCENTIVE").length > 0 && (
                  <>
                    <tr><th className="tpl-th tpl-center" colSpan={2}>Extra Additions</th></tr>
                    {payslipData.incentive_deduction
                      .filter(item => item.d_type === "INCENTIVE")
                      .map((item, index) => (
                        <tr key={item.id || index} className="tpl-row">
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{item.title || 'Incentive'}</span>
                              {item.description && <span style={{ fontSize: '0.85em', color: '#666' }}>({item.description})</span>}
                            </div>
                          </td>
                          <td className="text-right">PKR {parseFloat(item.amount || 0).toLocaleString()}/-</td>
                        </tr>
                        
                      ))}
                  </>
                )}

                {/* Deductions section - only show if there are deductions */}
                {totalDeductions > 0 && (
                  <>
                <tr><th className="tpl-th tpl-center" colSpan={2}>Deductions</th></tr>
                    {/* Deductions rows - showing each deduction as key-value pairs */}
                    {incomeTax > 0 && (
                  <tr className="tpl-row">
                        <td>Income Tax</td>
                        <td className="text-right">PKR {incomeTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/-</td>
                  </tr>
                )}
                    {eobi !== null && eobi !== undefined && eobi > 0 && (
                      <tr className="tpl-row">
                        <td>EOBI</td>
                        <td className="text-right">PKR {eobi.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/-</td>
                      </tr>
                )}
                    {/* {socialSecurity !== null && socialSecurity !== undefined && socialSecurity > 0 && (
                      <tr className="tpl-row">
                        <td>Social Security</td>
                        <td className="text-right">PKR {socialSecurity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/-</td>
                      </tr>
                )} */}
                    {pfEmployee !== null && pfEmployee !== undefined && pfEmployee > 0 && (
                      <tr className="tpl-row">
                        <td>Provident Fund</td>
                        <td className="text-right">PKR {pfEmployee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/-</td>
                      </tr>
                )}
                    {/* Calculated deductions from attendance_summary - only show if > 0 */}
                    {calculatedAbsenteeDeduction > 0 && (
                      <tr className="tpl-row">
                        <td>Absentee Deduction</td>
                        <td className="text-right">PKR {calculatedAbsenteeDeduction.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/-</td>
                      </tr>
                    )}
                    {calculatedLateDeduction > 0 && (
                      <tr className="tpl-row">
                        <td>Late Minute Deduction</td>
                        <td className="text-right">PKR {calculatedLateDeduction.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/-</td>
                      </tr>
                    )}
                    {(downtimeDeduction > 0 || (downtimeDeduction === 0 && totalDeductions > 0)) && (
                      <tr className="tpl-row">
                        <td>Downtime <span style={{ fontSize: '0.85em' }}>(Early Leave)</span></td>
                        <td className="text-right">PKR {downtimeDeduction.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/-</td>
                      </tr>
                    )}
                    {attendanceDeduction > 0 && (
                  <tr className="tpl-row text-semibold" style={{ borderBottom: 'none', borderTop: '2px solid #111827' }}>
                        <td style={{ borderBottom: 'none', borderTop: '2px solid #111827' }}>Attendance Deduction</td>
                        <td className="text-right text-gray-600" style={{ borderBottom: 'none', borderTop: '2px solid #111827' }}>PKR {attendanceDeduction.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/-</td>
                  </tr>
                )}
                {otherDeductions > 0 && (
                      <tr className="tpl-row">
                        <td>Other Deductions</td>
                        <td className="text-right">PKR {otherDeductions.toLocaleString()}/-</td>
                      </tr>
                    )}
                    {/* Additional deductions from incentive_deduction array */}
                    {payslipData.incentive_deduction && Array.isArray(payslipData.incentive_deduction) && payslipData.incentive_deduction
                      .filter(item => item.d_type === "DEDUCTION")
                      .map((item, index) => (
                        <tr key={item.id || index} className="tpl-row">
                          <td>{item.title || 'Deduction'}</td>
                          <td className="text-right">PKR {parseFloat(item.monthly_amount > 0 ? item.monthly_amount : item.amount || 0).toLocaleString()}/-</td>
                        </tr>
                      ))}
                    {/* Total Deductions */}
                    <tr className="tpl-row tpl-payable">
                      <td className="font-semibold">Total Deductions</td>
                      <td className="text-right font-semibold">PKR {parseFloat(totalDeductions || 0).toLocaleString()}/-</td>
                    </tr>
                  </>
                )}

                {/* Payable header and row */}
                <tr><th className="tpl-th tpl-center" colSpan={2}>Payable</th></tr>
                <tr className="tpl-row tpl-payable">
                  <td className="text-center">Payable</td>
                  <td className="text-center">PKR {parseFloat(payslipData.paid_amount || 0).toLocaleString()}/-</td>
                </tr>
              </tbody>
            </table>

            {/* Signatures */}
            <div className="tpl-signatures">
              <div className="tpl-sign-line"><span>Officer signature</span><span className="tpl-underline"></span></div>
              <div className="tpl-sign-line"><span>Employee signature</span><span className="tpl-underline"></span></div>
            </div>
          </div>
          {/* Screen-only legacy sections (hidden in print) */}
          <div className="hide-in-print">
          {/* Payroll Summary - Full Width with Light Text */}
          <div className="payroll-summary mb-8">
            <div className="w-full space-y-4">
               {/* First Row */}
               <div className="flex justify-between items-center w-full text-left">
                 <span className="text-xs text-gray-600 font-bold">Payroll</span>
                 <span className="text-xs text-gray-600">Attendance base</span>
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
                    <th className="text-xs font-semibold text-gray-600 border-b border-gray-300 p-2 text-left">Deductions</th>
                  </tr>
                </thead>
                <tbody>
                   {pfEmployee !== null && pfEmployee !== undefined && (
                     <tr>
                       <td className="border-b border-gray-300 p-2">
                         <div className="flex justify-between items-center gap-4">
                           <span className="text-xs text-gray-600">Provident Fund</span>
                           <span className="text-xs text-blue-600 text-center">PKR {pfEmployee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                         </div>
                       </td>
                     </tr>
                   )}
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
                    <th className="text-xs font-semibold text-gray-600 border-b border-gray-300 p-2 text-left">Deductions</th>
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
        </div>
      </div>
    // </div>
  )
}

export default IndividualPayslipPreview
