import React, { useState } from 'react';
import { Button, Input, Radio, Textarea, Typography, IconButton } from '@material-tailwind/react';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import useExpenseService from '../../ViewModel/ExpenseViewModel/ExpenseServices';
import { showToast } from '../../Components/Toaster/Toaster';
import { FaPlus, FaTrash } from 'react-icons/fa';

const SettlementAcceptanceModal = ({ closeModal }) => {
  // Get employee data from expense service
  const { allEmployees, employeesLoading, addExpense, addExpenseLoading } = useExpenseService();
  
  const [formData, setFormData] = useState({
    deductionType: 'oneTime', // 'oneTime' or 'installments'
    employee: null,
    category: null,
    totalAmount: '',
    reason: '',
    startingYear: { value: '2025', label: '2025' },
    endingYear: { value: '2025', label: '2025' },
    startingMonth: { value: 'January', label: 'January' },
    endingMonth: { value: 'January', label: 'January' },
    deductEqually: true,
    monthlyDeductions: {},
    // Dynamic month/year selections for deduct equally
    dynamicSelections: [
      { month: { value: 'January', label: 'January' }, year: { value: '2025', label: '2025' }, amount: '' }
    ]
  });

  // Transform employee data from API to dropdown format
  const employees = allEmployees.map(emp => ({
    value: emp.id.toString(),
    label: emp.name
  }));

  const categories = [
    { value: '1', label: 'Travel' },
    { value: '2', label: 'Meals' },
    { value: '3', label: 'Office Supplies' },
    { value: '4', label: 'Training' }
  ];

  const years = [
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' }
  ];

  const months = [
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' }
  ];

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
  };

  const handleSelectChange = (selectedOption, fieldName) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [fieldName]: selectedOption
      };
      
      // If changing start or end date, validate and update dynamic selections (only for installments)
      if (prev.deductionType === 'installments' && 
          (fieldName === 'startingYear' || fieldName === 'startingMonth' || 
           fieldName === 'endingYear' || fieldName === 'endingMonth')) {
        
        const startYear = fieldName === 'startingYear' ? selectedOption.value : prev.startingYear.value;
        const startMonth = fieldName === 'startingMonth' ? selectedOption.value : prev.startingMonth.value;
        const endYear = fieldName === 'endingYear' ? selectedOption.value : prev.endingYear.value;
        const endMonth = fieldName === 'endingMonth' ? selectedOption.value : prev.endingMonth.value;
        
        // Validate date range for installments
        if (validateDateRange(startYear, startMonth, endYear, endMonth)) {
          // Update dynamic selections with available months
          const availableMonths = getAvailableMonths(startYear, startMonth, endYear, endMonth);
          newFormData.dynamicSelections = availableMonths.length > 0 ? availableMonths : [
            { month: { value: 'January', label: 'January' }, year: { value: '2025', label: '2025' }, amount: '' }
          ];
        }
      }
      
      // For one-time deduction, validate if date is not in past
      if (prev.deductionType === 'oneTime' && 
          (fieldName === 'startingYear' || fieldName === 'startingMonth')) {
        const year = fieldName === 'startingYear' ? selectedOption.value : prev.startingYear.value;
        const month = fieldName === 'startingMonth' ? selectedOption.value : prev.startingMonth.value;
        validateDateNotInPast(year, month);
      }
      
      return newFormData;
    });
  };

  const handleMonthlyDeductionChange = (month, value) => {
    setFormData(prev => ({
      ...prev,
      monthlyDeductions: {
        ...prev.monthlyDeductions,
        [month]: value
      }
    }));
  };

  // Add new dynamic month/year selection
  const addDynamicSelection = () => {
    setFormData(prev => {
      const availableMonths = getAvailableMonths(
        prev.startingYear.value, 
        prev.startingMonth.value, 
        prev.endingYear.value, 
        prev.endingMonth.value
      );
      
      // Find the first available month that's not already selected
      const selectedMonths = prev.dynamicSelections.map(s => `${s.month.value} ${s.year.value}`);
      const nextAvailable = availableMonths.find(month => 
        !selectedMonths.includes(`${month.month.value} ${month.year.value}`)
      );
      
      if (nextAvailable) {
        return {
          ...prev,
          dynamicSelections: [...prev.dynamicSelections, { ...nextAvailable, amount: '' }]
        };
      }
      
      return prev; // No more available months
    });
  };

  // Remove dynamic month/year selection
  const removeDynamicSelection = (index) => {
    setFormData(prev => ({
      ...prev,
      dynamicSelections: prev.dynamicSelections.filter((_, i) => i !== index)
    }));
  };

  // Update dynamic selection
  const updateDynamicSelection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      dynamicSelections: prev.dynamicSelections.map((selection, i) => 
        i === index ? { ...selection, [field]: value } : selection
      )
    }));
  };


  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get month number from month name
  const getMonthNumber = (monthName) => {
    const months = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    return months[monthName] || '01';
  };

  // Get month abbreviation
  const getMonthAbbr = (monthName) => {
    return monthName.substring(0, 3).toLowerCase();
  };

  // Validate if selected date is not in the past
  const validateDateNotInPast = (year, month) => {
    const selectedYear = parseInt(year);
    const selectedMonth = months.findIndex(m => m.value === month);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    console.log('Date validation:', {
      selectedYear,
      selectedMonth,
      selectedMonthName: month,
      currentYear,
      currentMonth,
      currentMonthName: months[currentMonth]?.value
    });
    
    // Compare year first, then month
    if (selectedYear < currentYear) {
      console.log('Past year detected');
      showToast('You cannot select a past date for expense payment', 'error');
      return false;
    } else if (selectedYear === currentYear && selectedMonth < currentMonth) {
      console.log('Past month detected');
      showToast('You cannot select a past date for expense payment', 'error');
      return false;
    }
    
    console.log('Date is valid (future or current)');
    return true;
  };

  // Validate start and end dates for installments
  const validateDateRange = (startYear, startMonth, endYear, endMonth) => {
    const startDate = new Date(parseInt(startYear), months.findIndex(m => m.value === startMonth));
    const endDate = new Date(parseInt(endYear), months.findIndex(m => m.value === endMonth));
    
    if (startDate > endDate) {
      showToast('Start date must be before or equal to end date', 'error');
      return false;
    }
    return true;
  };

  // Get available months between start and end date
  const getAvailableMonths = (startYear, startMonth, endYear, endMonth) => {
    const startDate = new Date(parseInt(startYear), months.findIndex(m => m.value === startMonth));
    const endDate = new Date(parseInt(endYear), months.findIndex(m => m.value === endMonth));
    const availableMonths = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthName = months[currentDate.getMonth()].value;
      const year = currentDate.getFullYear().toString();
      availableMonths.push({
        month: { value: monthName, label: monthName },
        year: { value: year, label: year }
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return availableMonths;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.employee) {
      showToast('Please select an employee', 'error');
      return;
    }
    if (!formData.totalAmount || formData.totalAmount <= 0) {
      showToast('Please enter a valid amount greater than 0', 'error');
      return;
    }
    if (!formData.reason) {
      showToast('Please enter reason for deduction', 'error');
      return;
    }

    // Validate date based on deduction type
    if (formData.deductionType === 'oneTime') {
      // For one-time deduction, validate if date is not in past
      if (!validateDateNotInPast(formData.startingYear.value, formData.startingMonth.value)) {
        return;
      }
    } else if (formData.deductionType === 'installments') {
      // For installments, validate date range
      if (!validateDateRange(
        formData.startingYear.value, 
        formData.startingMonth.value, 
        formData.endingYear.value, 
        formData.endingMonth.value
      )) {
        return;
      }

      // Validate custom amounts if not deduct equally
      if (!formData.deductEqually) {
        console.log('Dynamic selections:', formData.dynamicSelections);
        
        // Check if dynamic selections are empty
        if (formData.dynamicSelections.length === 0) {
          showToast('Please set up the installment period first to generate monthly selections', 'error');
          return;
        }
        
        const hasInvalidAmount = formData.dynamicSelections.some(selection => 
          !selection.amount || selection.amount <= 0
        );
        
        if (hasInvalidAmount) {
          showToast('Please enter valid amounts greater than 0 for all months in the dynamic selections below', 'error');
          return;
        }
      }
    }

    try {
      let payload;

      if (formData.deductionType === 'oneTime') {
        // One-time deduction payload
        payload = {
          user_id: formData.employee.value,
          title: formData.category?.label || 'Expense',
          desc: formData.reason,
          amount: parseInt(formData.totalAmount),
          category: formData.category?.label || 'General',
          date: getCurrentDate()
        };
      } else {
        // Installment deduction payload
        let months, amounts;
        
        if (formData.deductEqually) {
          // Use dynamic selections for deduct equally
          months = formData.dynamicSelections.map(selection => getMonthAbbr(selection.month.value));
          amounts = formData.dynamicSelections.map(() => (formData.totalAmount / formData.dynamicSelections.length).toString());
        } else {
          // Use dynamic selections for custom amounts (user enters amounts manually)
          months = formData.dynamicSelections.map(selection => getMonthAbbr(selection.month.value));
          amounts = formData.dynamicSelections.map(selection => selection.amount || '0');
        }
        
        payload = {
          user_id: formData.employee.value,
          title: formData.category?.label || 'Expense',
          employee_name: formData.employee.label,
          desc: formData.reason,
          type: 1,
          date: getCurrentDate(),
          amount: formData.totalAmount,
          category: formData.category?.label || 'General',
          installment_period: {
            starting_year: formData.startingYear.value,
            end_year: formData.endingYear.value,
            start_month: getMonthNumber(formData.startingMonth.value),
            end_month: getMonthNumber(formData.endingMonth.value),
            deduct_equally: formData.deductEqually,
            month: months,
            amount: amounts
          }
        };
      }

      console.log('Submitting payload:', payload);
      
      const result = await addExpense(payload);
      if (result.success) {
        closeModal();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="p-6">

      {/* Deduction Type Selection */}
      <div className="mb-6">
        <div className="flex gap-6">
          <Radio
            label="Deduct one time"
            value="oneTime"
            name="deductionType"
            checked={formData.deductionType === 'oneTime'}
            onChange={() => handleInputChange('deductionType', 'oneTime')}
          />
          <Radio
            label="Deduct on installments"
            value="installments"
            name="deductionType"
            checked={formData.deductionType === 'installments'}
            onChange={() => handleInputChange('deductionType', 'installments')}
          />
        </div>
      </div>

      {/* Employee Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Employee Field */}
        <div>
          <label className="text-[#698592]">Employee<span className="text-red-500">*</span></label>
          <CustomSelect
            placeHolderTitle={employeesLoading ? "Loading employees..." : "Enter employee name"}
            value={formData.employee}
            options={employees}
            onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'employee')}
            customStyles={false}
            menuLoading={employeesLoading}
            isLoading={employeesLoading}
            isDisabled={employeesLoading}
          />
        </div>

        {/* Category Field */}
        <div>
          <label className="text-[#698592]">Category</label>
          <CustomSelect
            placeHolderTitle="Category"
            value={formData.category}
            options={categories}
            onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'category')}
            cStyle={true}
          />
        </div>
      </div>

      {/* Deduction Details Section */}
      <div className="mb-6">
        <div className="mb-4">
          <Input
            label="Total Amount to Deduct (PKR)"
            color="blue"
            name="totalAmount"
            type="number"
            min="1"
            value={formData.totalAmount}
            onChange={(e) => handleInputChange('totalAmount', e.target.value)}
          />
        </div>

        <div>
          <Textarea
            label="Reason for Deduction"
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* One Time Deduction - Month and Year Selection */}
      {formData.deductionType === 'oneTime' && (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#698592] text-sm">Month</label>
              <CustomSelect
                placeHolderTitle="Month"
                value={formData.startingMonth}
                options={months}
                onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'startingMonth')}
                customStyles={false}
              />
            </div>
            <div>
              <label className="text-[#698592] text-sm">Year</label>
              <CustomSelect
                placeHolderTitle="Year"
                value={formData.startingYear}
                options={years}
                onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'startingYear')}
                customStyles={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Installment Period (Only show if installments is selected) */}
      {formData.deductionType === 'installments' && (
        <div className="mb-6">
          <Typography variant="h6" color="blue-gray" className="font-semibold mb-4">
            Installment Period
          </Typography>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[#698592] text-sm">Starting From</label>
              <CustomSelect
                placeHolderTitle="Year"
                value={formData.startingYear}
                options={years}
                onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'startingYear')}
                customStyles={false}
              />
            </div>
            <div>
              <label className="text-[#698592] text-sm">To</label>
              <CustomSelect
                placeHolderTitle="Year"
                value={formData.endingYear}
                options={years}
                onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'endingYear')}
                customStyles={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#698592] text-sm">Starting From</label>
              <CustomSelect
                placeHolderTitle="Month"
                value={formData.startingMonth}
                options={months}
                onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'startingMonth')}
                customStyles={false}
              />
            </div>
            <div>
              <label className="text-[#698592] text-sm">To</label>
              <CustomSelect
                placeHolderTitle="Month"
                value={formData.endingMonth}
                options={months}
                onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'endingMonth')}
                customStyles={false}
              />
            </div>
          </div>
          
        </div>
      )}

      {/* Deduct Equally Option */}
      {formData.deductionType === 'installments' && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="deductEqually"
              checked={formData.deductEqually}
              onChange={(e) => handleInputChange('deductEqually', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="deductEqually" className="text-[#698592] text-sm font-medium">
              Deduct Equally
            </label>
          </div>

          {/* Dynamic Month/Year Selections */}
          {formData.deductEqually && (
            <div className="mb-4">
              <Typography variant="h6" color="blue-gray" className="font-semibold mb-3">
                Select Months and Years
              </Typography>
              
              {formData.dynamicSelections.map((selection, index) => (
                <div key={index} className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <label className="text-[#698592] text-sm">Month</label>
                    <CustomSelect
                      placeHolderTitle="Select Month"
                      value={selection.month}
                      options={months}
                      onChangeHandler={(selectedOption) => updateDynamicSelection(index, 'month', selectedOption)}
                      customStyles={false}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-[#698592] text-sm">Year</label>
                    <CustomSelect
                      placeHolderTitle="Select Year"
                      value={selection.year}
                      options={years}
                      onChangeHandler={(selectedOption) => updateDynamicSelection(index, 'year', selectedOption)}
                      customStyles={false}
                    />
                  </div>
                  
                  {!formData.deductEqually && (
                    <div className="flex-1">
                      <label className="text-[#698592] text-sm">Amount</label>
                      <Input
                        value={selection.amount}
                        onChange={(e) => updateDynamicSelection(index, 'amount', e.target.value)}
                        color="blue"
                        type="number"
                        min="1"
                        placeholder="0"
                        size="sm"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center relative top-2 gap-2">
                    <IconButton
                      size="sm"
                      color="blue"
                      onClick={addDynamicSelection}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <FaPlus className="w-4 h-4" />
                    </IconButton>
                    
                    {formData.dynamicSelections.length > 1 && (
                      <IconButton
                        size="sm"
                        color="red"
                        onClick={() => removeDynamicSelection(index)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <FaTrash className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          size="md"
          className="bg-blue-500 text-white border-0 cursor-pointer shadow-sm hover:bg-blue-600 px-8 py-2 rounded-lg"
          onClick={handleSubmit}
          disabled={addExpenseLoading}
        >
          {addExpenseLoading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default SettlementAcceptanceModal;
