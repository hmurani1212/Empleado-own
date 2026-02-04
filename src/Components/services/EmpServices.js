import { format, parse } from "date-fns";
import { FaMoneyCheckAlt, FaUser, FaUserAltSlash, FaCalendarAlt } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa6";
import { BsFillSendFill } from 'react-icons/bs'
import { RiCashFill } from 'react-icons/ri'

export const contractData = [
  { id: 1, name: 'Permanent' },
  { id: 2, name: 'Probation' },
  { id: 3, name: 'Casual' },
  { id: 4, name: 'Contract' },
  { id: 5, name: 'Consultancy' },
  { id: 6, name: 'Daily Wages' },
  { id: 7, name: 'Trainee' },
]

export const mobileNetwroks = [
  { id: 1, networkName: 'Mobilink' },
  { id: 2, networkName: 'Ufone' },
  { id: 3, networkName: 'Zong' },
  { id: 4, networkName: 'Warid' },
  { id: 5, networkName: 'Telenor' },
]


export const convertToYMD = (dateStamp) => {
  const dateObject = parse(dateStamp, "MMMM do, yyyy", new Date());

  if (isNaN(dateObject.getTime())) {
    return dateStamp;
  }

  const formattedDate = format(dateObject, "yyyy-MM-dd");

  return formattedDate;

}

export const genderList = [
  { id: 0, title: 'Female' },
  { id: 1, title: 'Male' },
  { id: 2, title: 'Other' },
]

export const maritalStatusList = [
  { id: 0, title: 'Single' },
  { id: 1, title: 'Married' },
  { id: 2, title: 'Other' },

]


export const contactTypeList = [
  { id: 1, name: 'Mobile Number', value: 'mobile' },
  { id: 2, name: "Phone Number", value: 'phone' },
  { id: 3, name: 'Email', value: 'email' },
  { id: 4, name: 'Address', value: 'address' }
]



export const contactMobileNetwroks = [
  { id: 1, networkName: 'Network', value: '' },
  { id: 2, networkName: 'Mobilink', value: 'Mobilink-PK' },
  { id: 3, networkName: 'Ufone', value: 'Ufone-PK' },
  { id: 4, networkName: 'Zong', value: 'Zong-PK' },
  { id: 5, networkName: 'Warid', value: 'Warid-PK' },
  { id: 6, networkName: 'Telenor', value: 'Telenor-PK' },
]


export const officialInfoTage = [
  { id: '0', tag_name: 'Select if applicable', value: '0' },
  { id: 'other', tag_name: 'Other', value: 'other' },
]

export const eobiData = [
  { id: 1, title: 'Yes', value: '1' },
  { id: 2, title: 'No', value: '0' },
]
export const gratuityData = [
  { id: 1, title: 'Yes', value: '1' },
  { id: 2, title: 'No', value: '0' },
]
export const exGratia = [
  { id: 1, title: 'Yes', value: '1' },
  { id: 2, title: 'No', value: '0' },
]
export const socialSecurity = [
  { id: 1, title: 'Yes', value: '1' },
  { id: 2, title: 'No', value: '0' },
]
export const healthBenefit = [
  { id: 1, title: 'Yes', value: '1' },
  { id: 2, title: 'No', value: '0' },
]
export const providentFund = [
  { id: 1, title: 'Available', value: '1' },
  { id: 2, title: 'Not Available', value: '0' },
]

export const insurenceData = [
  { id: 1, title: 'Yes', value: '1' },
  { id: 2, title: 'No', value: '0' },
]



export const paymentMethod = [
  { id: 1, title: 'Cash', value: 'cash' },
  { id: 2, title: 'Bank', value: 'bank' },
  { id: 3, title: 'Cheque', value: 'cheque' },
  { id: 4, title: 'Other', value: 'other' },
]

export const customStudyType = [
  { id: 1, title: 'Regular', value: 'regular' },
  { id: 2, title: 'Private', value: 'private' },
]


export const customGrade = [
  { id: 1, name: 'A Grade', value: 'A' },
  { id: 2, name: 'B Grade', value: 'B' },
  { id: 3, name: 'C Grade', value: 'C' },
  { id: 4, name: 'D Grade', value: 'D' },
  { id: 5, name: 'E Grade', value: 'E' },
  { id: 6, name: 'F Grade', value: 'F' },
]


export const customDivision = [
  { id: 1, name: '1st Division', value: '1' },
  { id: 2, name: '2nd Division', value: '2' },
  { id: 3, name: '3rd Division', value: '3' }
]


export const customGender = [
  { id: 1, name: 'Male', value: '1' },
  { id: 2, name: 'Female', value: '0' },
]
export const customSource = [
  { id: 1, name: 'Internal', value: '1' },
  { id: 2, name: 'External', value: '0' },
]



export const customPrivileges = [
  { id: 1, title: 'Employee', value: '0' },
  { id: 2, title: 'Super Admin', value: '1' },
  { id: 3, title: 'Branch Admin', value: '2' },
  { id: 4, title: 'Department Admin', value: '3' },
]




export const customPrivilegesData = [
  { id: 1, title: 'Full Access', value: "1" },
  { id: 2, title: 'Read Only', value: "2" },
  { id: 3, title: 'No Access', value: "0" },
]


export const customPrivilegesDataSub = [
  { id: 1, title: 'Allow', value: "1" },
  { id: 2, title: 'Deny', value: "0" },
]


export const customRepetitionUnit = [
  { id: 1, title: 'Day', value: "day" },
  { id: 2, title: 'Week', value: "week" },
  { id: 3, title: 'Month', value: "month" },
  { id: 4, title: 'Year', value: "year" },
]




export const empActionList = [
  { id: 1, title: 'Profile', icon: <FaUser />, color: '#8bc9f8' },
  { id: 2, title: 'Attendance', icon: <FaUserCheck />, color: '#0ACF97' },
  { id: 3, title: 'Salary Details', icon: <FaMoneyCheckAlt />, color: '#52b69a' },
  { id: 4, title: 'View Payslip', icon: <RiCashFill />, color: '#414833' },
  { id: 5, title: 'Send SMS', icon: <BsFillSendFill />, color: '#0ACF97' },
  { id: 6, title: 'Leave Application', icon: <FaCalendarAlt />, color: '#3DA5F4' },
  { id: 7, title: 'Deactivate', icon: <FaUserAltSlash />, color: '#f44336' }
]

export const exportEmployeesToExcel = (employeesData) => {
  // Import XLSX library
  const XLSX = require('xlsx');

  // Define the columns for the table
  const columns = [
    'Employee ID',
    'Bio ID',
    'ID',
    'Name',
    'Placement',
    'Department',
    'Mobile#'
  ];

  // Transform the data into the format required for Excel
  const rows = employeesData?.employees?.map(employee => [
    employee?.id || '',
    employee?.bio_id || '',
    employee?.emp_id || '',
    employee?.name || '',
    employee?.branch?.branch_name || '',
    employee?.department?.name || '',
    employee?.mobile || ''
  ]);

  // Create worksheet data with headers
  const worksheetData = [columns, ...(rows || [])];

  // Create a new workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Employee ID
    { wch: 15 }, // Bio ID
    { wch: 15 }, // ID
    { wch: 25 }, // Name
    { wch: 25 }, // Placement
    { wch: 25 }, // Department
    { wch: 20 }  // Mobile#
  ];
  worksheet['!cols'] = columnWidths;

  // Style the header row
  const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3DA5F4" } },
      alignment: { horizontal: "center" }
    };
  }

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees List');

  // Save the Excel file
  XLSX.writeFile(workbook, 'employees-list.xlsx');
}; 