import React, { useEffect, useState, useRef } from 'react'
import { Form, Input } from '@material-tailwind/react'
import { BsFillInfoCircleFill } from "react-icons/bs";
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

  // Load employees when component mounts
  useEffect(() => {
    Get_All_Employeefn();
  }, [Get_All_Employeefn]);

  // Handle employee selection
  const handleEmployeeSelect = (option) => {
    if (!option) return;
    
    const empId = option.value;
    const empName = option.label.split(' (ID:')[0]; // Extract name if label has format "Name (ID: ...)" or just use full label

    // Helper to set both ID and Name for all app types
    const setEmpData = (type) => {
        if (type === '1' || type === '3' || type === '4' || type === '5') { // Medical, etc.
             handleSelectChangeMedicalApp('emp_id', empId);
             handleSelectChangeMedicalApp('emp_name', empName);
        }
        if (type === '2' || type === '3' || type === '4' || type === '5') { // TA/DA, etc.
             handleSelectChangeTaDaApp('emp_id', empId);
             handleSelectChangeTaDaApp('emp_name', empName);
        }
    };

    setEmpData(applicationType);
  };

  // Get selected employee object for CustomSelect value
  const getSelectedEmployeeOption = () => {
    let selectedEmpId = '';
    if (applicationType === '1') selectedEmpId = medicalAppValue?.emp_id;
    else if (applicationType === '2') selectedEmpId = taDaAppValue?.emp_id;
    else selectedEmpId = medicalAppValue?.emp_id || taDaAppValue?.emp_id;

    if (selectedEmpId) {
      const emp = Get_All_Employee?.find(e => 
        String(e.id) === String(selectedEmpId) || String(e.emp_id) === String(selectedEmpId)
      );
      if (emp) return { value: emp.id || emp.emp_id, label: `${emp.name} (ID: ${emp.id || emp.emp_id})` };
    }
    return null;
  };

  const employeeOptions = Get_All_Employee?.map(emp => ({
      value: emp.id || emp.emp_id,
      label: `${emp.name} (ID: ${emp.id || emp.emp_id})`
  })) || [];


  return (
    <div className='w-full px-2 py-4'>
      <div className='max-w-4xl mx-auto'>
        
        {/* Main Selection Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Application Type */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-gray-700 font-poppins'>Application Type</label>
                    <CustomSelect
                        placeHolderTitle='Select Application Type'
                        value={applicationType ? { value: applicationType, label: ApplicationType.find(t => t.id === applicationType)?.title } : null}
                        options={ApplicationType.map((ele) => ({ value: ele.id, label: ele.title }))}
                        onChangeHandler={(option) => {
                            const type = ApplicationType.find(t => t.id === option?.value);
                            if (type) handleApplicationChange(type);
                        }}
                        customStyles={false}
                    />
                </div>

                {/* Employee Selection */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-gray-700 font-poppins'>Employee</label>
                    <CustomSelect
                        placeHolderTitle='Search Employee by Name or ID'
                        value={getSelectedEmployeeOption()}
                        options={employeeOptions}
                        onChangeHandler={handleEmployeeSelect}
                        isSearchable={true}
                        customStyles={false}
                    />
                </div>
            </div>
        </div>

        {/* Dynamic Form Content */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]'>
            {!applicationType ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                    <BsFillInfoCircleFill size={32} className="mb-3 text-blue-200"/>
                    <p className="font-poppins text-sm">Please select an application type to proceed</p>
                </div>
            ) : (
                <>
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
                    {applicationType == '4' && <LeaveEncash
                        handleLeaveEncashment={handleLeaveEncashment}
                        handleChangeLeaveEncash={handleChangeLeaveEncash}
                        leaveEncashValue={leaveEncashValue}
                    />}
                </>
            )}
        </div>

      </div>
    </div>
  )
}

export default NewApplication