import React, { useState, useRef, useEffect } from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'

const CreateNewRequest = (props) => {
  const {formValue, handleChangeAdjustRequest, handleNewTimeRequest, isAdminSide, employeeList, selectedEmployee, handleEmployeeChange, loading: newAdjustRequestLoading} = props
  
  // State for employee dropdown
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter employees based on search term
  const filteredEmployees = Array.isArray(employeeList)
    ? employeeList.filter(emp =>
        emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
      )
    : [];

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    handleEmployeeChange(employee);
    setEmployeeSearchTerm(employee.name);
    setIsEmployeeDropdownOpen(false);
  };

  // Handle input change for search
  const handleEmployeeInputChange = (e) => {
    const value = e.target.value;
    setEmployeeSearchTerm(value);
    setIsEmployeeDropdownOpen(true);

    // If input is cleared, clear selection
    if (!value) {
      handleEmployeeChange(null);
    }
  };

  // Handle input focus
  const handleEmployeeInputFocus = () => {
    setIsEmployeeDropdownOpen(true);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update search term when selectedEmployee changes
  useEffect(() => {
    if (selectedEmployee) {
      setEmployeeSearchTerm(selectedEmployee.name);
    } else {
      setEmployeeSearchTerm('');
    }
  }, [selectedEmployee]);

  return (
    <form className='space-y-2' onSubmit={handleNewTimeRequest}>
        {isAdminSide && (
          <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Select Employee *</label>
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                value={employeeSearchTerm}
                onChange={handleEmployeeInputChange}
                onFocus={handleEmployeeInputFocus}
                placeholder="Search and select employee"
                className="w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              {/* Dropdown Arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown Menu */}
              {isEmployeeDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="px-3 py-2 text-[12px] text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors duration-150"
                        onClick={() => handleEmployeeSelect(emp)}
                      >
                        {emp.name} ({emp.id})
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-[12px] text-gray-500">
                      No employees found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Date</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='date' 
                name='date' 
                onChange={handleChangeAdjustRequest}
                value={formValue.date}
            />
        </div>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>In Time</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='time' 
                name='inTime'
                onChange={handleChangeAdjustRequest}
                value={formValue.inTime} 
            />
        </div>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Out Time</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='time' 
                name='outTime'
                onChange={handleChangeAdjustRequest}
                value={formValue.outTime} 
            />
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 flex flex-col px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Reason</label>
                <textarea 
                  rows="3" 
                  // cols="50" 
                  name="reason"
                  className='text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                  onChange={handleChangeAdjustRequest}
                  value={formValue.reason}
                >
                </textarea>
            </div>
        </div>
        <div>
          <CustomButton 
            title='submit'
            loading={newAdjustRequestLoading}
          />
        </div>
    </form>
  )
}

export default CreateNewRequest