import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { Button } from '@material-tailwind/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const HEADER_GRADIENT = 'linear-gradient(to right, #4338ca, #2563eb, #06b6d4)';

const PayslipDisplay = ({ monthYear, selectedDate, payslipData, onClose }) => {
  const payslipRef = useRef(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [resolvedLogoUrl, setResolvedLogoUrl] = useState(null);

  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString();
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getMonthName = (date) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  const formatCurrency = (value) => {
    const numeric = Number(value || 0);
    return `PKR ${numeric.toLocaleString()}/-`;
  };

  const displayData = payslipData
    ? {
        employeeName: payslipData.DATA?.employee?.name || 'N/A',
        employeeId: payslipData.DATA?.employee?.emp_id || 'N/A',
        department: payslipData.DATA?.employee?.department || 'N/A',
        biometricId: payslipData.DATA?.employee?.bio_id || 'N/A',
        designation: payslipData.DATA?.employee?.designation || 'N/A',
        branch: payslipData.DATA?.employee?.branch || 'N/A',
        monthYear: payslipData.DATA?.metadata?.salary_month || monthYear || 'N/A',
        month: selectedDate ? getMonthName(selectedDate) : 'N/A',
        year: selectedDate ? selectedDate.getFullYear() : new Date().getFullYear(),
        generatedOn: payslipData.DATA?.metadata?.generated_on || formatDate(new Date()),
        bank: payslipData.DATA?.bankDetails?.bank_name || '---',
        accountType: payslipData.DATA?.bankDetails?.account_type || '---',
        bankBranch: payslipData.DATA?.bankDetails?.branch_name || '---',
        accountTitle: payslipData.DATA?.bankDetails?.account_title || '---',
        branchCode: payslipData.DATA?.bankDetails?.branch_code || '---',
        accountNo: payslipData.DATA?.bankDetails?.account_no || '---',
        totalDays: payslipData.DATA?.attendanceDetails?.total_days || '0',
        absentDays: payslipData.DATA?.attendanceDetails?.absent_days || '0',
        presentDays: payslipData.DATA?.attendanceDetails?.present_days || '0',
        leaves: payslipData.DATA?.attendanceDetails?.leaves || '0',
        basicPay: payslipData.DATA?.paymentDetails?.basic_salary || '0',
        incrementAmount: payslipData.DATA?.paymentDetails?.increment_amount || '0',
        totalPay: payslipData.DATA?.paymentDetails?.total_pay || '0',
        overtime: payslipData.DATA?.paymentDetails?.overtime_amount || '0',
        medicalAllowance: payslipData.DATA?.paymentDetails?.medical_allowance || '0',
        leaveEncashment: payslipData.DATA?.paymentDetails?.leave_encashment || '0',
        tada: payslipData.DATA?.paymentDetails?.tada_amount || '0',
        fuelAllowance: payslipData.DATA?.paymentDetails?.fuel_allowance || '0',
        totalDeductions: payslipData.DATA?.totals?.total_deductions || '0',
        totalIncentives: payslipData.DATA?.totals?.total_incentives || '0',
        totalPayable: payslipData.DATA?.totals?.payable_salary || '0',
      }
    : {
        employeeName: 'N/A',
        monthYear: monthYear || 'N/A',
        month: selectedDate ? getMonthName(selectedDate) : 'N/A',
        year: selectedDate ? selectedDate.getFullYear() : new Date().getFullYear(),
        employeeId: 'N/A',
        department: 'N/A',
        biometricId: 'N/A',
        designation: 'N/A',
        branch: 'N/A',
        generatedOn: formatDate(new Date()),
        bank: '---',
        accountType: '---',
        bankBranch: '---',
        accountTitle: '---',
        branchCode: '---',
        accountNo: '---',
        totalDays: '0',
        absentDays: '0',
        presentDays: '0',
        leaves: '0',
        basicPay: '0',
        incrementAmount: '0',
        totalPay: '0',
        totalDeductions: '0',
        tada: '0',
        medicalAllowance: '0',
        leaveEncashment: '0',
        overtime: '0',
        totalPayable: '0',
        totalIncentives: '0',
      };

  const deductions = payslipData?.DATA?.deductions || [];
  const incentives = payslipData?.DATA?.incentives || [];
  const hasIncentives = incentives && incentives.length > 0;

  const getItemDescription = (item) => {
    const description = String(item?.description || '').trim();
    return description ? `(${description})` : '(No Description)';
  };

  const rawLogoUrl =
    payslipData?.DATA?.metadata?.logo &&
    String(payslipData.DATA.metadata.logo).trim();

  useEffect(() => {
    let isMounted = true;

    if (!rawLogoUrl) {
      setResolvedLogoUrl(null);
      return;
    }

    const resolveLogoSource = async () => {
      try {
        const response = await fetch(rawLogoUrl, { mode: 'cors', cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!isMounted) return;
          setResolvedLogoUrl(typeof reader.result === 'string' ? reader.result : null);
        };
        reader.onerror = () => {
          if (isMounted) setResolvedLogoUrl(null);
        };
        reader.readAsDataURL(blob);
      } catch {
        if (isMounted) setResolvedLogoUrl(null);
      }
    };

    resolveLogoSource();

    return () => {
      isMounted = false;
    };
  }, [rawLogoUrl]);

  const downloadPDF = async () => {
    if (!payslipRef.current) return;
    setIsDownloadingPDF(true);

    // Fixed capture width in px — matches A4 at 96 dpi (794px) with a small margin
    const CAPTURE_WIDTH = 820;

    let cloneNode = null;
    let cloneWrapper = null;

    try {
      // Clone the payslip node so we can set a fixed width without affecting the UI
      cloneNode = payslipRef.current.cloneNode(true);
      Object.assign(cloneNode.style, {
        width: `${CAPTURE_WIDTH}px`,
        maxWidth: `${CAPTURE_WIDTH}px`,
        margin: '0',
        boxShadow: 'none',
        position: 'static',
      });

      cloneWrapper = document.createElement('div');
      Object.assign(cloneWrapper.style, {
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: `${CAPTURE_WIDTH}px`,
        overflow: 'hidden',
      });
      cloneWrapper.appendChild(cloneNode);
      document.body.appendChild(cloneWrapper);

      const canvas = await html2canvas(cloneNode, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
        width: CAPTURE_WIDTH,
        windowWidth: CAPTURE_WIDTH,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Fill full A4 width; height auto-scaled to preserve aspect ratio
      const pageWidthMm = 210;
      const imgHeightMm = pageWidthMm * (canvas.height / canvas.width);

      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, imgHeightMm);

      const safeName = String(displayData.employeeName || 'Employee')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      pdf.save(`Payslip_${safeName}_${displayData.month}_${displayData.year}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      if (cloneWrapper && cloneWrapper.parentNode) {
        cloneWrapper.parentNode.removeChild(cloneWrapper);
      }
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="w-full">
      {/* Action bar — outside payslipRef so it won't appear in PDF */}
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating PDF...
              </div>
            ) : (
              'Download Payslip'
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

      {/* Payslip body — captured by html2canvas */}
      <div
        ref={payslipRef}
        style={{
          fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: '12px',
          lineHeight: '1.4',
          color: '#222222',
          width: '100%',
          maxWidth: '860px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: HEADER_GRADIENT,
            borderRadius: '12px',
            padding: '16px',
            color: '#ffffff',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px' }}>
              Employee
            </p>
            <h3 style={{ fontSize: '28px', fontWeight: '700', lineHeight: '1.2', margin: 0 }}>
              {displayData.employeeName}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {resolvedLogoUrl && (
              <img
                src={resolvedLogoUrl}
                alt="Company Logo"
                style={{
                  height: '48px',
                  width: 'auto',
                  objectFit: 'contain',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                }}
              />
            )}
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '6px',
                padding: '4px 12px',
              }}
            >
              {displayData.monthYear}
            </span>
          </div>
        </div>

        {/* Profile + Bank */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1f2937', marginBottom: '8px' }}>
              Profile
            </h4>
            {[
              ['Employee ID', displayData.employeeId],
              ['Biometric ID', displayData.biometricId],
              ['Branch', displayData.branch],
              ['Department', displayData.department],
              ['Designation', displayData.designation],
              ['Generated on', displayData.generatedOn],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', minWidth: '112px' }}>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1f2937', marginBottom: '8px' }}>
              Bank Details
            </h4>
            {[
              ['Bank', displayData.bank],
              ['Bank Branch', displayData.bankBranch],
              ['Account No', displayData.accountNo],
              ['Account Code', displayData.branchCode],
              ['Account Title', displayData.accountTitle],
              ['Account Type', displayData.accountType],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', minWidth: '112px' }}>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payroll Summary */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b45309', marginBottom: '8px' }}>
            Payroll Summary
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', fontSize: '11px' }}>
            {[
              ['Total days', displayData.totalDays],
              ['Required days', displayData.totalDays],
              ['Present days', displayData.presentDays],
              ['Absent days', displayData.absentDays],
              ['Leaves', displayData.leaves],
            ].map(([label, value]) => (
              <div key={label}>
                <span style={{ fontWeight: '600' }}>{label} </span>
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* Section header helper */}
        {/* Payment Details */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              background: HEADER_GRADIENT,
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '6px',
              textAlign: 'center',
              marginBottom: '6px',
            }}
          >
            Payment Details
          </div>
          <div style={{ fontSize: '11px' }}>
            <div style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
              <span style={{ display: 'table-cell', color: '#4b5563', verticalAlign: 'middle' }}>Basic Pay</span>
              <span style={{ display: 'table-cell', fontWeight: '600', textAlign: 'right', verticalAlign: 'middle' }}>{formatCurrency(displayData.basicPay)}</span>
            </div>
            <div style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
              <span style={{ display: 'table-cell', color: '#4b5563', fontWeight: '600', verticalAlign: 'middle' }}>Total Earned</span>
              <span style={{ display: 'table-cell', fontWeight: '600', textAlign: 'right', verticalAlign: 'middle' }}>{formatCurrency(displayData.totalPay)}</span>
            </div>
            <div style={{ display: 'table', width: '100%', backgroundColor: '#e9fdf1', padding: '4px 8px', borderRadius: '4px' }}>
              <span style={{ display: 'table-cell', fontWeight: '700', color: '#374151', verticalAlign: 'middle' }}>Total Pay</span>
              <span style={{ display: 'table-cell', fontWeight: '700', textAlign: 'right', verticalAlign: 'middle' }}>{formatCurrency(displayData.totalPay)}</span>
            </div>
          </div>
        </div>

        {/* Additions */}
        {hasIncentives && (
          <div style={{ marginBottom: '12px' }}>
            <div
              style={{
                background: HEADER_GRADIENT,
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '6px',
                textAlign: 'center',
                marginBottom: '6px',
              }}
            >
              Additions
            </div>
            <div style={{ fontSize: '11px' }}>
              {incentives.map((item, i) => (
                <div key={item.id || i} style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
                  <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
                    <div style={{ color: '#374151' }}>{item.title || 'Addition'}</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>{getItemDescription(item)}</div>
                  </div>
                  <div style={{ display: 'table-cell', fontWeight: '600', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap', paddingLeft: '8px' }}>{formatCurrency(item.amount)}</div>
                </div>
              ))}
              <div style={{ display: 'table', width: '100%', backgroundColor: '#e9fdf1', padding: '4px 8px', borderRadius: '4px' }}>
                <span style={{ display: 'table-cell', fontWeight: '700', verticalAlign: 'middle' }}>Total Additions</span>
                <span style={{ display: 'table-cell', fontWeight: '700', textAlign: 'right', verticalAlign: 'middle' }}>{formatCurrency(displayData.totalIncentives)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Deductions */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              background: HEADER_GRADIENT,
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '6px',
              textAlign: 'center',
              marginBottom: '6px',
            }}
          >
            Deductions
          </div>
          <div style={{ fontSize: '11px' }}>
            {deductions.length > 0
              ? deductions.map((item, i) => (
                  <div key={item.id || i} style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
                    <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
                      <div style={{ color: '#374151' }}>{item.title || 'Deduction'}</div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>{getItemDescription(item)}</div>
                    </div>
                    <div style={{ display: 'table-cell', fontWeight: '600', color: '#dc2626', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap', paddingLeft: '8px' }}>{formatCurrency(item.amount)}</div>
                  </div>
                ))
              : (
                  <div style={{ display: 'table', width: '100%', marginBottom: '4px' }}>
                    <span style={{ display: 'table-cell', color: '#374151', verticalAlign: 'middle' }}>No Deductions</span>
                    <span style={{ display: 'table-cell', fontWeight: '600', textAlign: 'right', verticalAlign: 'middle' }}>{formatCurrency(0)}</span>
                  </div>
                )}
            <div style={{ display: 'table', width: '100%', backgroundColor: '#fff1f2', padding: '4px 8px', borderRadius: '4px' }}>
              <span style={{ display: 'table-cell', fontWeight: '700', color: '#b91c1c', verticalAlign: 'middle' }}>Total Deductions</span>
              <span style={{ display: 'table-cell', fontWeight: '700', color: '#b91c1c', textAlign: 'right', verticalAlign: 'middle' }}>{formatCurrency(displayData.totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* Payable summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ backgroundColor: '#e8f7f1', borderRadius: '8px', textAlign: 'center', padding: '12px' }}>
            <p style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: '4px' }}>
              Payable
            </p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#0b1d4d', margin: 0 }}>
              {formatCurrency(displayData.totalPayable)}
            </p>
          </div>
          <div style={{ backgroundColor: '#f8ecee', borderRadius: '8px', textAlign: 'center', padding: '12px' }}>
            <p style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: '4px' }}>
              Total Deductions
            </p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#0b1d4d', margin: 0 }}>
              {formatCurrency(displayData.totalDeductions)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipDisplay;
