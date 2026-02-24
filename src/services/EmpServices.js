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

/** Get mobile/phone from employee: prefer contacts (Contact Number / Mobile), then top-level mobile/emp_phone */
const getEmployeeMobile = (employee) => {
  if (employee?.mobile != null && String(employee.mobile).trim() !== '') return String(employee.mobile).trim();
  if (employee?.emp_phone != null && String(employee.emp_phone).trim() !== '') return String(employee.emp_phone).trim();
  const contacts = Array.isArray(employee?.contacts) ? employee.contacts : [];
  const mobileType = (c) => (c?.contact_type && /contact number|mobile|phone/i.test(String(c.contact_type)));
  const preferred = contacts.find(mobileType);
  if (preferred?.contact != null && String(preferred.contact).trim() !== '') return String(preferred.contact).trim();
  const first = contacts[0];
  return (first?.contact != null && String(first.contact).trim() !== '') ? String(first.contact).trim() : '';
};

/** Get all emergency contacts (phones and emails) as comma-separated string, e.g. "0349..., abc@gmail.com, emrg@gmail.com". */
const getEmergencyContacts = (employee) => {
  const contacts = Array.isArray(employee?.contacts) ? employee.contacts : [];
  const isEmergency = (c) => (c?.contact_title && String(c.contact_title).toLowerCase().includes('emergency'));
  const isPhoneOrEmail = (c) => (c?.contact_type && (/contact number|mobile|phone|email/i.test(String(c.contact_type))));
  const values = contacts
    .filter((c) => isEmergency(c) && isPhoneOrEmail(c) && c?.contact?.trim?.())
    .map((c) => String(c.contact).trim());
  return values.length ? values.join(', ') : '';
};

/** Get net salary for Excel: prefer full_salary_data.summary.net_salary (from profile API), then current_salary, then basic_salary/salary. */
const getNetSalary = (employee) => {
  const net = employee?.Salary_Settings?.full_salary_data?.summary?.net_salary ??
    employee?.full_salary_data?.summary?.net_salary ??
    employee?.net_salary;
  if (net != null && net !== '') return Number(net);
  const cur = employee?.Salary_Settings?.full_salary_data?.salary?.current_salary ??
    employee?.full_salary_data?.salary?.current_salary ??
    employee?.current_salary;
  if (cur != null && cur !== '') return Number(cur);
  const basic = employee?.salary ?? employee?.basic_salary;
  return (basic != null && basic !== '') ? Number(basic) : '';
};

/** Get gross salary for Excel from full_salary_data.summary.gross_salary or fallbacks. */
const getGrossSalary = (employee) => {
  const gross = employee?.Salary_Settings?.full_salary_data?.summary?.gross_salary ??
    employee?.full_salary_data?.summary?.gross_salary ??
    employee?.gross_salary;
  if (gross != null && gross !== '') return Number(gross);
  return '';
};

/** Format date for Excel: unix timestamp or date string -> DD/MM/YYYY */
const formatDateForExcel = (value) => {
  if (value == null || value === '') return '';
  const str = String(value).trim();
  const num = parseInt(str, 10);
  const date = !Number.isNaN(num) && num > 0 ? new Date(num > 1e10 ? num : num * 1000) : new Date(str);
  if (Number.isNaN(date.getTime())) return str;
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

/** Exit date for Excel: when status is 0 (inactive) use job_exit_date; when job_exit_date is 0 leave empty; else format as DD/MM/YYYY. */
const getExitDateForExcel = (employee) => {
  const jobExitDate = employee?.job_exit_date ?? employee?.Official_Info?.job_exit_date;
  if (jobExitDate == null || jobExitDate === '' || Number(jobExitDate) === 0) return '';
  return formatDateForExcel(jobExitDate);
};

export const exportEmployeesToExcel = async (employeesData, options = {}) => {
  const employees = employeesData?.employees ?? [];
  /** When statusFilter is 'active', hide Exit column; show for 'all' and 'inactive'. */
  const showExitColumn = options.statusFilter !== 'active';

  const columns = [
    'S.No',
    'Employee ID',
    'BIO ID',
    'Name',
    'Father Name',
    'Branch',
    'Department',
    'Date of Birth',
    'Join Date',
    ...(showExitColumn ? ['Exit Date'] : []),
    'Designation',
    'Salary',
    'NIC/Passport',
    'Contact',
    'Email',
    'Blood Group',
    'HR Policy',
    'Emergency Contact',
  ];
  const EMAIL_COLUMN_INDEX = columns.indexOf('Email') + 1;

  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Employees Data', { views: [{ state: 'frozen', ySplit: 2 }] });

  const thinBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

  const lastCol = String.fromCharCode(64 + columns.length);
  sheet.mergeCells(`A1:${lastCol}1`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'Employees Data';
  titleCell.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF1E3A5F' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF5' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.border = { ...thinBorder, bottom: { style: 'medium' } };
  sheet.getRow(1).height = 32;

  columns.forEach((col, i) => {
    const cell = sheet.getCell(2, i + 1);
    cell.value = col;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { ...thinBorder, bottom: { style: 'medium' } };
  });
  sheet.getRow(2).height = 24;

  employees.forEach((employee, index) => {
    const row = [
      index + 1,
      employee?.id ?? '',
      employee?.bio_id ?? '',
      employee?.name ?? '',
      employee?.f_name ?? employee?.fname ?? '',
      employee?.branch?.branch_name ?? '',
      employee?.department?.name ?? '',
      formatDateForExcel(employee?.dob),
      formatDateForExcel(employee?.join_date),
      ...(showExitColumn ? [getExitDateForExcel(employee)] : []),
      employee?.designation_name ?? employee?.designation ?? '',
      getGrossSalary(employee),
      employee?.passport_no ?? employee?.ntn_no ?? '',
      getEmployeeMobile(employee),
      employee?.email ?? employee?.work_email ?? '',
      employee?.blood_group != null && String(employee.blood_group).trim() !== '' ? String(employee.blood_group).trim() : '',
      employee?.policy_id ?? employee?.hr_policy_id ?? employee?.work_policy?.value ?? employee?.work_policy ?? '',
      getEmergencyContacts(employee),
    ];
    sheet.addRow(row);
  });

  const dataRowCount = sheet.rowCount;
  const zebraLight = 'FFF8FAFC';
  const zebraDark = 'FFEFF4F8';
  if (dataRowCount > 2) {
    for (let r = 3; r <= dataRowCount; r++) {
      const isEvenRow = (r - 3) % 2 === 0;
      const rowFill = isEvenRow ? zebraLight : zebraDark;
      for (let c = 1; c <= columns.length; c++) {
        const cell = sheet.getCell(r, c);
        cell.border = thinBorder;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } };
        cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF334155' } };
        const isEmailCol = c === EMAIL_COLUMN_INDEX;
        cell.alignment = { vertical: 'middle', wrapText: !isEmailCol, horizontal: isEmailCol ? 'left' : 'left' };
      }
      sheet.getRow(r).height = 20;
    }
  }

  const colWidths = showExitColumn
    ? [8, 12, 8, 30, 30, 22, 22, 12, 12, 12, 30, 12, 22, 16, 50, 12, 14, 28]
    : [8, 12, 8, 30, 30, 22, 22, 12, 12, 30, 12, 22, 16, 50, 12, 14, 28];
  columns.forEach((_, i) => {
    sheet.getColumn(i + 1).width = colWidths[i] || 14;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Employees-Data.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}; 