// PayslipDataTemplate.js - Template for payslip data structure
// This file defines the expected data structure for API responses

export const PayslipDataTemplate = {
  // Employee Information
  employee: {
    id: "413",
    name: "Hassan Raza",
    department: "DevOps",
    biometricId: "413",
    designation: "Jr. Web Engineer (Node js)",
    branch: "Islamabad Branch",
    generatedOn: "3rd Oct 2025"
  },

  // Bank Details
  bankDetails: {
    bank: "---",
    accountType: "---",
    branch: "---",
    accountTitle: "---",
    branchCode: "---",
    accountNo: "---"
  },

  // Attendance Details
  attendance: {
    totalDays: "22",
    absentDays: "0",
    presentDays: "22",
    leaves: "1"
  },

  // Payment Details
  payment: {
    basicPay: "35,000",
    incrementAmount: "15,000",
    totalPay: "50,000"
  },

  // Deductions
  deductions: {
    lateMinutes: "897.00",
    downtime: "0.00",
    incomeTax: "0",
    eobiDeductions: "0.00",
    providentFundDeductions: "0.00",
    totalDeductions: "897"
  },

  // Extra Additions
  additions: {
    tada: "0",
    medicalAllowance: "99",
    leaveEncashment: "0",
    overtime: "0"
  },

  // Final Calculation
  totalPayable: "49202"
};

// API Response Structure Template
export const ApiResponseTemplate = {
  STATUS: "SUCCESSFUL",
  ERROR_CODE: "",
  ERROR_FILTER: "",
  ERROR_DESCRIPTION: "",
  DB_DATA: {
    payslip: PayslipDataTemplate,
    employee: PayslipDataTemplate.employee,
    bankDetails: PayslipDataTemplate.bankDetails,
    attendance: PayslipDataTemplate.attendance,
    payment: PayslipDataTemplate.payment,
    deductions: PayslipDataTemplate.deductions,
    additions: PayslipDataTemplate.additions,
    totalPayable: PayslipDataTemplate.totalPayable
  }
};

// Helper function to transform API response to payslip data
export const transformApiResponseToPayslipData = (apiResponse, month, year) => {
  if (!apiResponse || apiResponse.STATUS !== "SUCCESSFUL") {
    throw new Error("Invalid API response");
  }

  const data = apiResponse.DB_DATA;
  
  return {
    employeeName: data.employee?.name || "Unknown Employee",
    monthYear: `${month} ${year}`,
    month: month,
    year: year,
    employeeId: data.employee?.id || "---",
    department: data.employee?.department || "---",
    biometricId: data.employee?.biometricId || "---",
    designation: data.employee?.designation || "---",
    branch: data.employee?.branch || "---",
    generatedOn: data.employee?.generatedOn || new Date().toLocaleDateString(),
    bank: data.bankDetails?.bank || "---",
    accountType: data.bankDetails?.accountType || "---",
    branch: data.bankDetails?.branch || "---",
    accountTitle: data.bankDetails?.accountTitle || "---",
    branchCode: data.bankDetails?.branchCode || "---",
    accountNo: data.bankDetails?.accountNo || "---",
    totalDays: data.attendance?.totalDays || "0",
    absentDays: data.attendance?.absentDays || "0",
    presentDays: data.attendance?.presentDays || "0",
    leaves: data.attendance?.leaves || "0",
    basicPay: data.payment?.basicPay || "0",
    incrementAmount: data.payment?.incrementAmount || "0",
    totalPay: data.payment?.totalPay || "0",
    lateMinutes: data.deductions?.lateMinutes || "0.00",
    downtime: data.deductions?.downtime || "0.00",
    incomeTax: data.deductions?.incomeTax || "0",
    eobiDeductions: data.deductions?.eobiDeductions || "0.00",
    providentFundDeductions: data.deductions?.providentFundDeductions || "0.00",
    totalDeductions: data.deductions?.totalDeductions || "0",
    tada: data.additions?.tada || "0",
    medicalAllowance: data.additions?.medicalAllowance || "0",
    leaveEncashment: data.additions?.leaveEncashment || "0",
    overtime: data.additions?.overtime || "0",
    totalPayable: data.totalPayable || "0"
  };
};

export default PayslipDataTemplate;
