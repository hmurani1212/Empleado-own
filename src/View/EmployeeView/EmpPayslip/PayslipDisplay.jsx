import React, { useRef } from 'react';
import { useState } from 'react';
import { Button } from '@material-tailwind/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DEFAULT_LOGO_URL = 'https://emp-beta.veevotech.com/files/images/4d513d3d/15_logo-5838-1642596925.png';

const PayslipDisplay = ({ monthYear, selectedDate, payslipData, onClose }) => {
  const payslipRef = useRef(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Debug logging
  console.log('PayslipDisplay - Received data:', {
    monthYear,
    selectedDate,
    payslipData,
    hasData: !!payslipData
  });

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString();
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Helper function to get month name from date
  const getMonthName = (date) => {
    if (!date) return "Unknown";
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  // Use API data if available, otherwise fallback to static data
  const displayData = payslipData ? {
    // Employee Details
    employeeName: payslipData.DATA?.employee?.name || "N/A",
    employeeId: payslipData.DATA?.employee?.emp_id || "N/A",
    department: payslipData.DATA?.employee?.department || "N/A",
    biometricId: payslipData.DATA?.employee?.bio_id || "N/A",
    designation: payslipData.DATA?.employee?.designation || "N/A",
    branch: payslipData.DATA?.employee?.branch || "N/A",
    
    // Month/Year Details
    monthYear: payslipData.DATA?.metadata?.salary_month || monthYear || "N/A",
    month: selectedDate ? getMonthName(selectedDate) : "N/A",
    year: selectedDate ? selectedDate.getFullYear() : new Date().getFullYear(),
    generatedOn: payslipData.DATA?.metadata?.generated_on || formatDate(new Date()),
    
    // Bank Details
    bank: payslipData.DATA?.bankDetails?.bank_name || "---",
    accountType: payslipData.DATA?.bankDetails?.account_type || "---",
    bankBranch: payslipData.DATA?.bankDetails?.branch_name || "---",
    accountTitle: payslipData.DATA?.bankDetails?.account_title || "---",
    branchCode: payslipData.DATA?.bankDetails?.branch_code || "---",
    accountNo: payslipData.DATA?.bankDetails?.account_no || "---",
    
    // Attendance Details
    totalDays: payslipData.DATA?.attendanceDetails?.total_days || "0",
    absentDays: payslipData.DATA?.attendanceDetails?.absent_days || "0",
    presentDays: payslipData.DATA?.attendanceDetails?.present_days || "0",
    leaves: payslipData.DATA?.attendanceDetails?.leaves || "0",
    
    // Payment Details
    basicPay: payslipData.DATA?.paymentDetails?.basic_salary || "0",
    incrementAmount: payslipData.DATA?.paymentDetails?.increment_amount || "0",
    totalPay: payslipData.DATA?.paymentDetails?.total_pay || "0",
    overtime: payslipData.DATA?.paymentDetails?.overtime_amount || "0",
    medicalAllowance: payslipData.DATA?.paymentDetails?.medical_allowance || "0",
    leaveEncashment: payslipData.DATA?.paymentDetails?.leave_encashment || "0",
    tada: payslipData.DATA?.paymentDetails?.tada_amount || "0",
    fuelAllowance: payslipData.DATA?.paymentDetails?.fuel_allowance || "0",
    
    // Deductions (placeholder for now - will be calculated from deductions array)
    lateMinutes: "0.00",
    downtime: "0.00",
    incomeTax: "0",
    eobiDeductions: "0.00",
    providentFundDeductions: "0.00",
    totalDeductions: payslipData.DATA?.totals?.total_deductions || "0",
    totalIncentives: payslipData.DATA?.totals?.total_incentives || "0",
    
    // Total Payable
    totalPayable: payslipData.DATA?.totals?.payable_salary || "0"
  } : {
    // Fallback static data
    employeeName: "N/A",
    monthYear: monthYear || "N/A",
    month: selectedDate ? getMonthName(selectedDate) : "N/A",
    year: selectedDate ? selectedDate.getFullYear() : new Date().getFullYear(),
    employeeId: "N/A",
    department: "N/A",
    biometricId: "N/A",
    designation: "N/A",
    branch: "N/A",
    generatedOn: formatDate(new Date()),
    bank: "---",
    accountType: "---",
    bankBranch: "---",
    accountTitle: "---",
    branchCode: "---",
    accountNo: "---",
    totalDays: "0",
    absentDays: "0",
    presentDays: "0",
    leaves: "0",
    basicPay: "0",
    incrementAmount: "0",
    totalPay: "0",
    lateMinutes: "0.00",
    downtime: "0.00",
    incomeTax: "0",
    eobiDeductions: "0.00",
    providentFundDeductions: "0.00",
    totalDeductions: "0",
    tada: "0",
    medicalAllowance: "0",
    leaveEncashment: "0",
    overtime: "0",
    totalPayable: "0"
  };

  // Extract deductions and incentives arrays
  const deductions = payslipData?.DATA?.deductions || [];
  const incentives = payslipData?.DATA?.incentives || [];
  const hasIncentives = incentives && incentives.length > 0;

  // Org logo: use API logo when present (DATA.metadata.logo), otherwise default
  const logoUrl = (payslipData?.DATA?.metadata?.logo && String(payslipData.DATA.metadata.logo).trim()) || DEFAULT_LOGO_URL;


  const downloadPDF = async () => {
    if (!payslipRef.current) return;

    setIsDownloadingPDF(true);

    try {
      const container = payslipRef.current;
      const canvas = await html2canvas(container, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidthMm = 210;
      const pageHeightMm = 295;
      let imgWidthMm = pageWidthMm;
      let imgHeightMm = pageWidthMm * (canvas.height / canvas.width);
      if (imgHeightMm > pageHeightMm) {
        imgHeightMm = pageHeightMm;
        imgWidthMm = pageHeightMm * (canvas.width / canvas.height);
      }
      const xOffset = (pageWidthMm - imgWidthMm) / 2;
      const yOffset = (pageHeightMm - imgHeightMm) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthMm, imgHeightMm);

      const fileName = `Payslip_${displayData.employeeName.replace(/\s+/g, '_')}_${displayData.month}_${displayData.year}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Payslip Preview</h2>
        <div className="flex gap-2">
          <Button
            onClick={downloadPDF}
            disabled={isDownloadingPDF}
            className="bg-green-400 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloadingPDF ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </div>
            ) : (
              'Download PDF'
            )}
          </Button>
          <Button
            onClick={onClose}
            variant="outlined"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </Button>
        </div>
      </div>

      <div 
        ref={payslipRef}
        className="bg-white p-4 shadow-lg"
        style={{
          fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '7px',
          lineHeight: '1.4',
          color: '#222222',
          width: '90%',
          margin: '0 auto'
        }}
      >
        {/* Header with decorative elements */}
        <div className="relative mb-4">
          <div 
            className="absolute top-0 left-3 w-48 h-8"
            style={{
              background: '#004aab',
              transform: 'skew(337deg, 0deg)',
              marginTop: '-15px',
              marginLeft: '-22px'
            }}
          ></div>
          <div 
            className="absolute top-0 h-8"
            style={{
              width: '50px',
              background: '#312828',
              marginLeft: '36%',
              marginTop: '-15px',
              transform: 'skew(337deg, 0deg)'
            }}
          ></div>
          
          <div className="flex justify-between items-start pt-6">
            <div>
              <h4 className="text-2xl font-medium text-black mt-6">
                <strong>{displayData.employeeName}</strong>
              </h4>
            </div>
            <div className="text-center">
              <p className="text-base text-black mt-10">
                Payslip for the month of {displayData.monthYear}
              </p>
            </div>
            <div className="w-24 h-24">
              <img 
                src={logoUrl} 
                alt="Company Logo"
                style={{ height: '65px' }}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Payslip Content */}
        <div className="w-full">
          <table className="w-full border-collapse" style={{ fontSize: '12px' }}>
            <tbody>
              {/* Employee Details */}
              <tr>
                <td colSpan="4" className="text-center text-white p-3" style={{ backgroundColor: '#004aab' }}>
                  <strong>Employee Details</strong>
                </td>
              </tr>
              <tr>
                <td className="p-2 w-1/4"><strong>Employee ID</strong></td>
                <td className="p-2 w-1/4">{displayData.employeeId}</td>
                <td className="p-2 w-1/4"><strong>Department</strong></td>
                <td className="p-2 w-1/4">{displayData.department}</td>
              </tr>
              <tr>
                <td className="p-2"><strong>Biometric ID</strong></td>
                <td className="p-2">{displayData.biometricId}</td>
                <td className="p-2"><strong>Designation</strong></td>
                <td className="p-2">{displayData.designation}</td>
              </tr>
              <tr>
                <td className="p-2"><strong>Branch</strong></td>
                <td className="p-2">{displayData.branch}</td>
                <td className="p-2"><strong>Generated on</strong></td>
                <td className="p-2">{displayData.generatedOn}</td>
              </tr>

              {/* Bank Details */}
              <tr>
                <td colSpan="4" className="text-center text-white p-2" style={{ backgroundColor: '#004aab' }}>
                  <strong>Bank Details</strong>
                </td>
              </tr>
              <tr>
                <td className="p-2"><strong>Bank</strong></td>
                <td className="p-2">{displayData.bank}</td>
                <td className="p-2"><strong>Account Type</strong></td>
                <td className="p-2">{displayData.accountType}</td>
              </tr>
              <tr>
                <td className="p-2"><strong>Branch</strong></td>
                <td className="p-2">{displayData.bankBranch}</td>
                <td className="p-2"><strong>Account Title</strong></td>
                <td className="p-2">{displayData.accountTitle}</td>
              </tr>
              <tr>
                <td className="p-2"><strong>Branch Code</strong></td>
                <td className="p-2">{displayData.branchCode}</td>
                <td className="p-2"><strong>Account No.</strong></td>
                <td className="p-2">{displayData.accountNo}</td>
              </tr>

              {/* Attendance Details */}
              <tr>
                <td colSpan="4" className="text-center text-white p-2" style={{ backgroundColor: '#004aab' }}>
                  <strong>Attendance Details</strong>
                </td>
              </tr>
              <tr>
                <td className="p-2"><strong>Total Days</strong></td>
                <td className="p-2">{displayData.totalDays}</td>
                <td className="p-2"><strong>Absent Days</strong></td>
                <td className="p-2">{displayData.absentDays}</td>
              </tr>
              <tr>
                <td className="p-2"><strong>Present Days</strong></td>
                <td className="p-2">{displayData.presentDays}</td>
                <td className="p-2"><strong>Leaves</strong></td>
                <td className="p-2">{displayData.leaves}</td>
              </tr>

              {/* Payment Details */}
              <tr>
                <td colSpan="4" className="text-center text-white p-2" style={{ backgroundColor: '#004aab' }}>
                  <strong>Payment Details</strong>
                </td>
              </tr>
              <tr>
                <td className="p-2"><strong>Basic Pay</strong></td>
                <td className="p-2">{(displayData.basicPay).toLocaleString()}/-</td>
                <td className="p-2"><strong>Increment Amount</strong></td>
                <td className="p-2">{displayData.incrementAmount.toLocaleString()}/-</td>
              </tr>
              <tr>
                <td className="p-2"><strong>Total Pay</strong></td>
                <td className="p-2">{displayData.totalPay.toLocaleString()}/-</td>
                <td className="p-2"></td>
                <td className="p-2"></td>
              </tr>

              {/* Additions - Only show if incentives exist */}
              {hasIncentives && (
                <>
                  <tr>
                    <td colSpan="4" className="text-center text-white p-2" style={{ backgroundColor: '#004aab' }}>
                      <strong>Additions</strong>
                    </td>
                  </tr>
                  {incentives.map((incentive, index) => {
                    // Display 2 incentives per row
                    if (index % 2 === 0) {
                      const firstIncentive = incentives[index];
                      const secondIncentive = incentives[index + 1];
                      return (
                        <tr key={index}>
                          <td className="p-2"><strong>{firstIncentive.title}</strong></td>
                          <td className="p-2">{Number(firstIncentive.amount || 0).toLocaleString()} /-</td>
                          {secondIncentive ? (
                            <>
                              <td className="p-2"><strong>{secondIncentive.title}</strong></td>
                              <td className="p-2">{Number(secondIncentive.amount || 0).toLocaleString()} /-</td>
                            </>
                          ) : (
                            <>
                              <td className="p-2"></td>
                              <td className="p-2"></td>
                            </>
                          )}
                        </tr>
                      );
                    }
                    return null;
                  })}
                  {incentives.length > 0 && (
                    <tr className="bg-gray-50">
                      <td className="p-2"></td>
                      <td className="p-2"><strong>Total Additions</strong></td>
                      <td className="p-2 font-medium">{Number(displayData.totalIncentives || 0).toLocaleString()}/-</td>
                      <td className="p-2"></td>
                    </tr>
                  )}
                </>
              )}

              {/* Deductions */}
              <tr>
                <td colSpan="4" className="text-center text-white p-2" style={{ backgroundColor: '#004aab' }}>
                  <strong>Deductions</strong>
                </td>
              </tr>
              {deductions.map((deduction, index) => {
                // Display 2 deductions per row
                if (index % 2 === 0) {
                  const firstDeduction = deductions[index];
                  const secondDeduction = deductions[index + 1];
                  return (
                    <tr key={index}>
                      <td className="p-2"><strong>{firstDeduction.title}</strong></td>
                      <td className="p-2">{Number(firstDeduction.amount || 0).toLocaleString()} /-</td>
                      {secondDeduction ? (
                        <>
                          <td className="p-2"><strong>{secondDeduction.title}</strong></td>
                          <td className="p-2">{Number(secondDeduction.amount || 0).toLocaleString()} /-</td>
                        </>
                      ) : (
                        <>
                          <td className="p-2"></td>
                          <td className="p-2"></td>
                        </>
                      )}
                    </tr>
                  );
                }
                return null;
              })}
              {deductions.length === 0 && (
                <tr>
                  <td className="p-2"><strong>No Deductions</strong></td>
                  <td className="p-2">0 /-</td>
                  <td className="p-2"></td>
                  <td className="p-2"></td>
                </tr>
              )}
              <tr className="bg-gray-50">
                <td className="p-2"></td>
                <td className="p-2"><strong>Total Deductions</strong></td>
                <td className="p-2 font-medium">{Number(displayData.totalDeductions || 0).toLocaleString()}/-</td>
                <td className="p-2"></td>
              </tr>

              {/* Total Payable */}
              <tr className="bg-green-50">
                <td className="p-2"></td>
                <td className="p-2"><strong>Total Payable</strong></td>
                <td className="p-2 font-medium">{Number(displayData.totalPayable || 0).toLocaleString()}/-</td>
                <td className="p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <div className="text-center mb-4">
            <p className="text-xs text-black">
              This payslip is generated by Empleado & does not require any sign/stamp
              <img 
                src={logoUrl} 
                alt="Empleado Logo"
                style={{ width: '65px', height: 'fit-content' }}
                className="inline-block ml-2"
              />
            </p>
          </div>

          <div className="flex items-center gap-10 relative">
            <div className="ml-4">
              <p className="text-xs text-black mb-1">
                <img 
                  src="https://emp-beta.veevotech.com/emp/assets/img/phone-square-alt-solid.png"
                  alt="Phone"
                  style={{ width: '12px', height: 'fit-content' }}
                  className="inline-block mr-1"
                />
                UAN: +92 - 304 - 1118333
              </p>
              <p className="text-xs text-black">
                <img 
                  src="https://emp-beta.veevotech.com/emp/assets/img/envelope-solid.png"
                  alt="Website"
                  style={{ width: '12px', height: 'fit-content' }}
                  className="inline-block mr-1"
                />
                www.veevotech.com
              </p>
            </div>
            <div>
              <p className="text-xs text-black">
                <img 
                  src="https://emp-beta.veevotech.com/emp/assets/img/globe-solid.png"
                  alt="Email"
                  style={{ width: '12px', height: 'fit-content' }}
                  className="inline-block mr-1"
                />
                Biz@VeevoTech.com
              </p>
            </div>
            <div className="absolute bottom-6 right-5">
              <div 
                className="absolute w-48 h-8"
                style={{
                  background: '#004aab',
                  transform: 'skew(337deg, 0deg)',
                  right: '-30px',
                  bottom: '-40px'
                }}
              ></div>
              <div 
                className="absolute w-12 h-8"
                style={{
                  background: '#312828',
                  transform: 'skew(337deg, 0deg)',
                  right: '180px',
                  bottom: '-40px'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipDisplay;
