import React, { useState } from 'react';
import { Button, Input, Popover, PopoverContent, PopoverHandler, Typography, Card, CardBody } from '@material-tailwind/react';
import Calendar from 'react-calendar';
import PayslipDisplay from './PayslipDisplay';
import { toast } from 'react-toastify';
import usePayslipHook from './usePayslipHook';
import { motion } from 'framer-motion';
import { FaFileInvoiceDollar, FaCloudDownloadAlt, FaCalendarAlt } from 'react-icons/fa';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className='flex flex-col gap-6 p-4 md:p-6 min-h-screen bg-gray-50/50 font-poppins'
    >
      {/* Header */}
      <motion.div variants={itemVariants} className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
        <div className='flex items-center gap-4'>
           <div className='p-3 bg-brand-50 rounded-xl text-brand-500'>
             <FaFileInvoiceDollar className='text-2xl' />
           </div>
           <div>
              <h1 className='text-2xl font-bold text-gray-800'>Export Payslip</h1>
              <p className='text-sm text-gray-500 mt-1'>Download your monthly payslip</p>
           </div>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="max-w-xl">
        <Card className="rounded-2xl shadow-card border border-gray-100">
          <CardBody className="p-6 space-y-6">
             <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-bold uppercase tracking-wide text-xs">
                  Select Period
                </Typography>
                <Popover 
                  placement="bottom" 
                  open={isCalendarOpen} 
                  handler={setIsCalendarOpen}
                >
                  <PopoverHandler>
                    <div className="relative cursor-pointer group">
                        <Input
                          label="Choose month and year"
                          value={selectedMonthYear}
                          readOnly
                          className="cursor-pointer !border-gray-200 focus:!border-brand-500 rounded-lg"
                          placeholder="Select Month"
                          labelProps={{
                            className: "hidden",
                          }}
                          containerProps={{
                            className: "min-w-0",
                          }}
                        />
                        <div className="absolute right-3 top-3 text-gray-400 group-hover:text-brand-500 transition-colors pointer-events-none">
                            <FaCalendarAlt />
                        </div>
                        {!selectedMonthYear && (
                            <div className="absolute left-3 top-2.5 text-gray-500 pointer-events-none text-sm">
                                Select Month & Year
                            </div>
                        )}
                    </div>
                  </PopoverHandler>
                  <PopoverContent className="p-0 border-0 shadow-xl rounded-xl overflow-hidden z-50">
                    <Calendar
                      onChange={handleDateChange}
                      value={selectedDate}
                      className='border-0 font-poppins p-2'
                      maxDetail="year"
                      minDetail="year"
                      view="year"
                      formatYear={(locale, date) => date.getFullYear()}
                      formatMonth={(locale, date) => {
                        const month = months[date.getMonth()];
                        return month.label.substring(0, 3);
                      }}
                      tileClassName={({ date, view }) => {
                        if (view === 'year' && selectedDate) {
                          const isSelected = date.getMonth() === selectedDate.getMonth() && 
                                           date.getFullYear() === selectedDate.getFullYear();
                          return isSelected ? 'bg-brand-500 text-white rounded-lg !text-white' : 'hover:bg-brand-50 rounded-lg text-sm';
                        }
                        return 'text-sm font-medium';
                      }}
                    />
                  </PopoverContent>
                </Popover>
             </div>

             <Button
                onClick={handleDownload}
                disabled={isLoading}
                className="w-full bg-brand-500 hover:bg-brand-600 shadow-md shadow-brand-500/20 py-3 rounded-xl flex items-center justify-center gap-2 capitalize text-sm font-semibold"
             >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaCloudDownloadAlt className="text-lg" />
                    <span>Preview & Download Payslip</span>
                  </>
                )}
             </Button>
          </CardBody>
        </Card>
      </motion.div>

      {showPayslip && (
        <PayslipDisplay
          monthYear={selectedMonthYear}
          selectedDate={selectedDate}
          payslipData={payslipData}
          onClose={closePayslip}
        />
      )}
    </motion.div>
  );
};

export default PayslipExport;
