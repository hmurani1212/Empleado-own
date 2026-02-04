import React, { useState } from 'react';
import { Button, Input, Popover, PopoverContent, PopoverHandler, Typography } from '@material-tailwind/react';
import Calendar from 'react-calendar';
import PayslipDisplay from './PayslipDisplay';
import { toast } from 'react-toastify';
import usePayslipHook from './usePayslipHook';

const PayslipExport = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Use custom hook for payslip functionality
  const { 
    isLoading, 
    payslipData, 
    showPayslip, 
    downloadPayslip, 
    closePayslip 
  } = usePayslipHook();

  // Generate month options for display
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];

  const handleDateChange = (date) => {
    // Ensure we have a proper date object for the first day of the selected month
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), 1);
    setSelectedDate(selectedDate);
    const month = months[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    setSelectedMonthYear(`${month.label} ${year}`);
    setIsCalendarOpen(false); // Close calendar after selection
  };

  const handleDownload = async () => {
    if (!selectedDate) {
      toast.error('Please select a month and year first');
      return;
    }
    
    const month = selectedDate.getMonth() + 1; // JavaScript months are 0-based, API expects 1-based
    const year = selectedDate.getFullYear();
    
    // Call the download payslip function from the hook
    await downloadPayslip(year, month);
  };

  return (
    <div className='flex flex-col gap-8 p-2'>
      <div className=''>
        <span className='text-[20px]'>Export Payslip</span>
        <Typography variant="small" color="gray" className="mt-2">
          Select the month and year for which you want to download your payslip
        </Typography>
      </div>
      
      <div className="w-96 bg-white p-4 rounded-[10px] drop-shadow-md">
        <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
          Select Month & Year *
        </Typography>
        <Popover 
          placement="bottom" 
          open={isCalendarOpen} 
          handler={setIsCalendarOpen}
        >
          <PopoverHandler>
            <Input
              label="Choose month and year"
              value={selectedMonthYear}
              readOnly
              className="cursor-pointer"
              placeholder="Click to select month and year"
            />
          </PopoverHandler>
          <PopoverContent className="p-0">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className='border-0'
              maxDetail="year"
              minDetail="year"
              view="year"
              formatYear={(locale, date) => date.getFullYear()}
              formatMonth={(locale, date) => {
                const month = months[date.getMonth()];
                return month.label.substring(0, 3); // Show only first 3 letters (Jan, Feb, etc.)
              }}
              tileClassName={({ date, view }) => {
                // Ensure proper styling for selected month
                if (view === 'year' && selectedDate) {
                  const isSelected = date.getMonth() === selectedDate.getMonth() && 
                                   date.getFullYear() === selectedDate.getFullYear();
                  return isSelected ? 'react-calendar__tile--active' : '';
                }
                return '';
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="w-96">
        <Button
          onClick={handleDownload}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Payslip...
            </div>
          ) : (
            'Preview Payslip'
          )}
        </Button>
      </div>

      {showPayslip && (
        <PayslipDisplay
          monthYear={selectedMonthYear}
          selectedDate={selectedDate}
          payslipData={payslipData}
          onClose={closePayslip}
        />
      )}
    </div>
  );
};

export default PayslipExport;
