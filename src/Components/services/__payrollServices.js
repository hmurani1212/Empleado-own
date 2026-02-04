import { FaReceipt, FaDollarSign } from 'react-icons/fa6'
export function formatDateString(dateStr) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Split the date string into parts
  const parts = dateStr.split("-");

  // Extract year, month index (1-based), and day
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1; // Convert to 0-based index
  // const day = parts[2]; // Not used in current implementation

  // Get the month name
  const monthName = months[monthIndex];

  // Format the new date string
  return `${year}-${monthName}`;
}
  
export const customManageSlip = [
  {id:1, title:'Generate Payslip', icon:<FaReceipt />, color:'#0ACF97', bgColor:'#EDFFF0'},
  {id:2, title:'Making Payment', icon:<FaDollarSign  />, color:'#7571F9', bgColor:'#F5F2FF'},
]

export const customSelectData = [
  {id:1, title:'Select All'},
  {id:2, title:'Selected'},
  {id:3, title:'Unselected'},
]

export const customGenerationType = [
  {id:1, title:'Monthly'},
  {id:2, title:'Date Range'},
]


export const salaryCalculationFormula = [
  {id:1, title:'Rate' , rateDescrip: 'Total salary divided by required hours', payable:'Payable ', formula: 'Rate * earned hours', otDescrip:'Overtime rate is calculated per 30 days'},
  {id:2, title:'Rate' , rateDescrip: 'Total salary divided by 30', payable:'Payable ', formula: 'Rate * earned hours', otDescrip:''},
  {id:3, title:'Rate' , rateDescrip: 'Total salary divided by number of days in the month', payable:'Payable ', formula: 'Rate * earned hours', otDescrip:'Overtime rate is calculated per 30 days'},
]


export const salraySubChecboxData = [
  {id: 1, title:'Leave Encashment (for monthly leaves)'},
  {id: 2, title:'Monthly Reward (for completing required hours) '},
  {id:3, title:"Don't do Deductions (for attendance)"},
  {id:4, title:"Don't do Deductions (for late coming & early leaving)"},
  {id:5, title:"Do not pay overtime"},
  {id:6, title: " Adjust overtime in late comings"},
  {id:7, title:"Do not consider this month overtime "}

]


export const overtimeCustomData = [
  {id:1, title:'Overtime x 1.5', value:1.5},
  {id:2, title:'Double', value:2},
  {id:3, title:'Overtime x 2.5', value:2.5},
  {id:4, title:'Triple', value:3},
]


