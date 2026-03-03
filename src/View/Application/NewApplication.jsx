import React, { useEffect, useState, useRef } from 'react'
import { Form, Input, Button } from '@material-tailwind/react'
import { BsFillInfoCircleFill } from "react-icons/bs";
import MedicalApp from './MedicalApp';
import TaApplication from './TaApplication';
import LeaveEncash from './LeaveEncash';
import { ApplicationType } from '../../services/__applicationServices';
import useNewApplication from '../../ViewModel/ApplicationViewModel/addNewApplicationServices';
import useApplication from '../../ViewModel/ApplicationViewModel/ApplicationServices';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";
import { getContentByLabel } from '../../services/getContentService';
import { showToast } from '../../Components/Toaster/Toaster';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { FaInfoCircle } from 'react-icons/fa';

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
    // Leave Application drawer
    openLeaveApplicationDrawer,
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
    const empName = option.label.split(' (ID:')[0].trim(); // Extract name if label has format "Name (ID: ...)" or just use full label

    // Helper to set both ID and Name for all app types
    const setEmpData = (type) => {
        const typeStr = String(type);
        if (typeStr === '1' || typeStr === '3' || typeStr === '4' || typeStr === '5') {
             handleSelectChangeMedicalApp('emp_id', empId);
             handleSelectChangeMedicalApp('emp_name', empName);
        }
        if (typeStr === '2' || typeStr === '3' || typeStr === '4' || typeStr === '5') {
             handleSelectChangeTaDaApp('emp_id', empId);
             handleSelectChangeTaDaApp('emp_name', empName);
        }
    };

    setEmpData(applicationType);

    // When Application Type is Leave Application (3), open the sidebar immediately after selecting employee
    if (String(applicationType) === '3' && openLeaveApplicationDrawer) {
      openLeaveApplicationDrawer(empId, empName);
    }
  };

  // Get selected employee object for CustomSelect value
  const getSelectedEmployeeOption = () => {
    let selectedEmpId = '';
    const appTypeStr = String(applicationType);
    
    if (appTypeStr === '1') selectedEmpId = medicalAppValue?.emp_id;
    else if (appTypeStr === '2') selectedEmpId = taDaAppValue?.emp_id;
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

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [contentLang, setContentLang] = useState('ENGLISH');
  const [contentLoading, setContentLoading] = useState(false);

  const openContentDrawer = async (contentLabel) => {
    setContentDrawerOpen(true);
    setContentLang('ENGLISH');
    setContentLoading(true);
    setContentData(null);
    try {
      const res = await getContentByLabel(contentLabel);
      if (res?.STATUS === 'SUCCESSFUL' && res?.DATA?.[0]?.contents?.length) {
        setContentData(res.DATA[0]);
      } else {
        showToast('Content not available', 'error');
        setContentDrawerOpen(false);
      }
    } catch (err) {
      showToast('Failed to load content', 'error');
      setContentDrawerOpen(false);
    } finally {
      setContentLoading(false);
    }
  };

  return (
    <div className='w-full px-2 py-4'>
      <div className='max-w-4xl mx-auto'>
        
        {/* Main Selection Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Application Type */}
                <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-1.5'>
                      <label className='text-sm font-semibold text-gray-700 font-poppins'>Application Type</label>
                      <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer('APPLICATIONTYPE_APPLICATION_EMP')} />
                    </div>
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
                    <div className='flex items-center gap-1.5'>
                      <label className='text-sm font-semibold text-gray-700 font-poppins'>Employee</label>
                      <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer('ONBEHALFOF_APPLICATION_EMP')} />
                    </div>
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

      <PortalDrawer
        open={contentDrawerOpen}
        closeDrawer={() => setContentDrawerOpen(false)}
        direction="right"
        widthSize="45vw"
        title={contentData?.contents?.find((c) => c.lang === contentLang)?.main_heading ?? ''}
        compo={
          <div className="flex flex-col gap-4">
            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contentData?.contents?.length ? (
              <>
                <div
                  className="text-gray-800 text-sm font-Urbanist leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      contentData.contents.find((c) => c.lang === contentLang)?.content ??
                      contentData.contents.find((c) => c.lang === 'ENGLISH')?.content ??
                      '',
                  }}
                />
                <div className="flex gap-2 mt-4 border-t border-gray-200 pt-4">
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${contentLang === 'ENGLISH' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setContentLang('ENGLISH')}
                  >
                    ENGLISH
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${contentLang === 'URDU' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setContentLang('URDU')}
                  >
                    URDU
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        }
      />
    </div>
  )
}

export default NewApplication