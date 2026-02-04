import React, { useEffect, useState, useRef } from 'react'
import { Form, Input } from '@material-tailwind/react'
import { BsFillInfoCircleFill } from "react-icons/bs";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import MedicalApp from './MedicalApp';
import TaApplication from './TaApplication';
import LeaveEncash from './LeaveEncash';
import { ApplicationType } from '../../services/__applicationServices';
import useNewApplication from '../../ViewModel/ApplicationViewModel/addNewApplicationServices';
import useApplication from '../../ViewModel/ApplicationViewModel/ApplicationServices';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices"


function NewApplication() {

  const { handleApplicationChange,
    applicationType, handleChangeEmpName,
    applicationEmpList, medicalAppValue,
    handleMedicalApplication,
    handleSelectChangeMedicalApp, handleChangeMedicalApp,
    handleFileUpload, uploadedFileUrl, isUploading,
    // TA/DA functions
    handleTaDaApplication, handleChangeTaDaApp, taDaAppValue,
    handleSelectChangeTaDaApp, handleTaDaDateChange, handleTaDaFileUpload,
    taDaUploadedFiles,
    // Leave Encashment functions
    handleLeaveEncashment, handleChangeLeaveEncash, leaveEncashValue,
  } = useNewApplication()
  const { Get_All_Employee, Get_All_Employeefn } = useEmployees()

  // State for employee dropdown
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const firstOptionRef = useRef(null);

  // Load employees when component mounts
  useEffect(() => {
    Get_All_Employeefn();
  }, [Get_All_Employeefn]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
        setEmployeeSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isEmployeeDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isEmployeeDropdownOpen]);

  // Get selected employee for display
  const getSelectedEmployee = () => {
    let selectedEmpId = '';

    if (applicationType === '1') {
      selectedEmpId = medicalAppValue?.emp_id;
    } else if (applicationType === '2') {
      selectedEmpId = taDaAppValue?.emp_id;
    } else if (applicationType === '3') {
      selectedEmpId = medicalAppValue?.emp_id || taDaAppValue?.emp_id;
    } else if (applicationType === '4') {
      selectedEmpId = medicalAppValue?.emp_id || taDaAppValue?.emp_id;
    } else {
      selectedEmpId = medicalAppValue?.emp_id || taDaAppValue?.emp_id;
    }

    if (selectedEmpId) {
      return Get_All_Employee?.find(emp =>
        emp.id === selectedEmpId ||
        emp.id === String(selectedEmpId) ||
        String(emp.id) === String(selectedEmpId)
      );
    }
    return null;
  };

  // Filter employees based on search term
  const filteredEmployees = Get_All_Employee?.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  ) || [];

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    const empName = employee.name;
    const empId = employee.id;

    if (applicationType === '1') {
      handleSelectChangeMedicalApp('emp_id', empId);
      handleSelectChangeMedicalApp('emp_name', empName);
    } else if (applicationType === '2') {
      handleSelectChangeTaDaApp('emp_id', empId);
      handleSelectChangeTaDaApp('emp_name', empName);
    } else if (applicationType === '3') {
      handleSelectChangeMedicalApp('emp_id', empId);
      handleSelectChangeMedicalApp('emp_name', empName);
      handleSelectChangeTaDaApp('emp_id', empId);
      handleSelectChangeTaDaApp('emp_name', empName);
    } else if (applicationType === '4') {
      handleSelectChangeMedicalApp('emp_id', empId);
      handleSelectChangeMedicalApp('emp_name', empName);
    } else {
      handleSelectChangeMedicalApp('emp_id', empId);
      handleSelectChangeMedicalApp('emp_name', empName);
      handleSelectChangeTaDaApp('emp_id', empId);
      handleSelectChangeTaDaApp('emp_name', empName);
    }

    setIsEmployeeDropdownOpen(false);
    setEmployeeSearchTerm('');
  };

  const selectedEmployee = getSelectedEmployee();


  // const { GetSubmitted_AppLi } = useApplication();


  return (
    <>
      {/* Debug Information */}
      {/* <div className="w-full p-4 bg-gray-100 rounded-lg mb-4">
        <h4 className="text-sm font-bold mb-2">Debug Information:</h4>
        <div className="text-xs space-y-1">
          <div>Application Type: <span className="font-mono">{applicationType || 'None'}</span></div>
          <div>Medical App Employee ID: <span className="font-mono">{medicalAppValue?.emp_id || 'None'}</span></div>
          <div>TA/DA App Employee ID: <span className="font-mono">{taDaAppValue?.emp_id || 'None'}</span></div>
          <div>Total Employees: <span className="font-mono">{Get_All_Employee?.length || 0}</span></div>
        </div>
      </div> */}

      <div className='w-full flex items-center flex-col gap-4 sm:gap-6 px-2 sm:px-4 py-4 sm:py-0'>
        <div className='w-full max-w-sm sm:max-w-2xl mt-4 sm:mt-7'>
          <div className='w-full bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-lg'>
            <div className='flex flex-col lg:flex-row gap-4 sm:gap-5 items-start'>
              {/* Employee Name/ID Select */}
              <div className='w-full lg:w-1/2 flex-1'>
                <label className='block text-xs sm:text-sm font-semibold text-gray-700 mb-2'>
                  Employee Name/ID
                </label>
                <div className='relative h-[46px]' ref={dropdownRef}>
                  {/* Select Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen);
                      if (!isEmployeeDropdownOpen) {
                        setEmployeeSearchTerm('');
                      }
                    }}
                    className="w-full h-10 px-3 py-0 text-left bg-white border-none rounded-[10px] focus:outline-none flex items-center justify-between"
                    style={{
                      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      color: '#495057'
                    }}
                  >
                    <span className={`block truncate ${!selectedEmployee ? 'text-[#698592]' : 'text-[#495057]'}`}>
                      {selectedEmployee?.name || 'Select Employee'}
                    </span>
                    <ChevronDownIcon
                      className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isEmployeeDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {isEmployeeDropdownOpen && (
                    <div className="absolute z-[9999999] w-full mt-1 bg-white border border-gray-300 rounded-[10px] shadow-lg">
                      {/* Search Input */}
                      <div className="p-2 border-b border-gray-200">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={employeeSearchTerm}
                          onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowDown' && filteredEmployees.length > 0) {
                              e.preventDefault();
                              firstOptionRef.current?.focus();
                            }
                          }}
                          placeholder="Search employees..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Options List */}
                      <div className="max-h-[200px] overflow-auto">
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((employee, index) => (
                            <button
                              key={employee.id}
                              ref={index === 0 ? firstOptionRef : null}
                              type="button"
                              onClick={() => handleEmployeeSelect(employee)}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  e.target.nextElementSibling?.focus();
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  if (e.target.previousElementSibling) {
                                    e.target.previousElementSibling.focus();
                                  } else {
                                    searchInputRef.current?.focus();
                                  }
                                } else if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleEmployeeSelect(employee);
                                }
                              }}
                              className="w-full px-[10px] py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                              style={{ fontSize: '12px' }}
                            >
                              {employee.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-[10px] py-2 text-gray-500" style={{ fontSize: '12px' }}>
                            No employees found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Application Type Select */}
              <div className='w-full lg:w-1/2 flex-1'>
                <label className='block text-xs sm:text-sm font-semibold text-gray-700 mb-2'>
                  Application Type
                </label>
                <div className='h-[46px]'>
                  <CustomSelect
                    placeHolderTitle='Select Application Type'
                    value={applicationType ? { value: applicationType, label: ApplicationType.find(t => t.id === applicationType)?.title } : ''}
                    options={ApplicationType.map((ele) => ({ value: ele.id, label: ele.title }))}
                    onChangeHandler={(selectedOption) => {
                      const selectedAppType = ApplicationType.find(t => t.id === selectedOption?.value);
                      if (selectedAppType) {
                        handleApplicationChange(selectedAppType);
                      }
                    }}
                    customStyle={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full max-w-sm sm:max-w-2xl pb-4 sm:pb-0'>
          {applicationType == '1' && <MedicalApp
            handleMedicalApplication={handleMedicalApplication}
            handleChangeMedicalApp={handleChangeMedicalApp}
            medicalAppValue={medicalAppValue}
            handleSelectChangeMedicalApp={handleSelectChangeMedicalApp}
            handleFileUpload={handleFileUpload}
            uploadedFileUrl={uploadedFileUrl}
            isUploading={isUploading}
          />}
          {applicationType == '2' && <TaApplication
            handleTaDaApplication={handleTaDaApplication}
            handleChangeTaDaApp={handleChangeTaDaApp}
            taDaAppValue={taDaAppValue}
            handleTaDaDateChange={handleTaDaDateChange}
            handleTaDaFileUpload={handleTaDaFileUpload}
            taDaUploadedFiles={taDaUploadedFiles}
            isUploading={isUploading}
          />}
          {/* Leave Application (id: 3) - Opens in drawer, no form displayed */}
          {applicationType == '4' && <LeaveEncash
            handleLeaveEncashment={handleLeaveEncashment}
            handleChangeLeaveEncash={handleChangeLeaveEncash}
            leaveEncashValue={leaveEncashValue}
          />}
        </div>

      </div>
    </>
  )
}

export default NewApplication