import React, { useState, useEffect } from 'react';
import { Typography, Button, Textarea, Tooltip } from '@material-tailwind/react';
import { FaPlus, FaTimes, FaEdit } from 'react-icons/fa';
import useStore from '../../Store/store';
import AddSignatureForm from '../../Components/AddSignatureForm/AddSignatureForm';
import AddDigitalSignatureForm from '../../Components/AddDigitalSignatureForm/AddDigitalSignatureForm';
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import { showToast } from '../../Components/Toaster/Toaster';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('signatures');
  
  // Confirmation dialog state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    signatureId: null,
    loading: false
  });

  // Logo upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Birthday Template state
  const [birthdayTemplateText, setBirthdayTemplateText] = useState('');

  // Retirement and Probation state
  const [retirementAge, setRetirementAge] = useState('');
  const [probationPeriod, setProbationPeriod] = useState('');

  // Reporting Email state
  const [selectedBranch, setSelectedBranch] = useState('');
  const [reportingEmailInput, setReportingEmailInput] = useState('');

  // Excel Heading state
  const [excelHeadingBranch, setExcelHeadingBranch] = useState('');
  const [excelHeadingHeaderText, setExcelHeadingHeaderText] = useState('');

  // Branches for Excel Heading dropdown
  const branchesAll = useStore((state) => state.branchesAll);
  const gettingAllBranches = useStore((state) => state.gettingAllBranches);

  // Drawer functions from store
  const openDrawer = useStore((state) => state.openDrawer);
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle);
  const settingDrawerSize = useStore((state) => state.settingDrawerSize);
  const settingComponent = useStore((state) => state.settingComponent);

  // Signature and Logo functions from useEmployees
  const { 
    signatures, 
    isLoadingSignatures, 
    getSignatures, 
    addSignature, 
    deleteSignature,
    digitalSignature,
    isLoadingDigitalSignature,
    getDigitalSignature,
    addDigitalSignature,
    birthdayTemplate,
    isLoadingBirthdayTemplate,
    isSavingBirthdayTemplate,
    getBirthdayTemplate,
    updateBirthdayTemplate,
    mobileAttendanceConfig,
    isLoadingMobileAttendance,
    isTogglingMobileAttendance,
    isTogglingLocationLog,
    getMobileAttendanceConfig,
    toggleMobileAttendance,
    toggleMobileAttendanceLocationLog,
    retirementData,
    isLoadingRetirementData,
    isSavingRetirementData,
    getRetirementData,
    setRetirementData,
    reportingEmails,
    isLoadingReportingEmails,
    isSavingReportingEmail,
    getReportingEmails,
    sendReportingEmail,
    orgLogo,
    isLoadingLogo,
    getOrgLogo,
    updateOrgLogo
  } = useEmployees();

  // Fetch data based on active section
  useEffect(() => {
    if (activeSection === 'signatures') {
      getSignatures();
      getDigitalSignature();
    } else if (activeSection === 'company_logo') {
      getOrgLogo();
    } else if (activeSection === 'birthday_template') {
      getBirthdayTemplate();
    } else if (activeSection === 'mobile_attendance') {
      getMobileAttendanceConfig();
    } else if (activeSection === 'employee_misc') {
      getRetirementData();
    } else if (activeSection === 'reporting_mail') {
      getReportingEmails();
    } else if (activeSection === 'excel_heading') {
      gettingAllBranches?.({ limit: 1000 });
    }
  }, [activeSection, getSignatures, getDigitalSignature, getOrgLogo, getBirthdayTemplate, getMobileAttendanceConfig, getRetirementData, getReportingEmails, gettingAllBranches]);

  // Update birthday template text when data is fetched
  useEffect(() => {
    if (birthdayTemplate) {
      setBirthdayTemplateText(birthdayTemplate);
    }
  }, [birthdayTemplate]);

  // Update retirement data when fetched
  useEffect(() => {
    if (retirementData) {
      setRetirementAge(retirementData.retirement_age || '');
      setProbationPeriod(retirementData.probation_period || '');
    }
  }, [retirementData]);

  const settingsSections = [
    { id: 'signatures', title: 'Signatures' },
    { id: 'excel_heading', title: 'Excel Heading' },
    { id: 'company_logo', title: 'Company/Org Logo' },
    { id: 'birthday_template', title: 'Birthday Template' },
    { id: 'mobile_attendance', title: 'Mobile Attendance' },
    { id: 'employee_misc', title: 'Employee Misc Setting' },
    { id: 'reporting_mail', title: 'Reporting Mail' }
  ];

  // Handler for opening Add Signature drawer
  const handleAddSignature = () => {
    const closeDrawer = useStore.getState().closeDrawer;
    settingComponent(<AddSignatureForm onClose={closeDrawer} />);
    settingDrawerTitle('Add Signature');
    settingDrawerSize(500);
    openDrawer();
  };

  // Handler for opening Add/Edit Digital Signature drawer
  const handleAddDigitalSignature = () => {
    const closeDrawer = useStore.getState().closeDrawer;
    const title = digitalSignature ? 'Edit Digital Signature' : 'Add Digital Signature';
    settingComponent(
      <AddDigitalSignatureForm 
        onClose={() => {
          closeDrawer();
          // Refresh digital signature after closing drawer
          getDigitalSignature();
        }} 
        existingSignature={digitalSignature}
      />
    );
    settingDrawerTitle(title);
    settingDrawerSize(500);
    openDrawer();
  };

  // Handler for opening delete confirmation
  const handleDeleteSignature = (signatureId) => {
    setDeleteConfirmation({
      show: true,
      signatureId: signatureId,
      loading: false
    });
  };

  // Handler for confirming delete
  const confirmDeleteSignature = async () => {
    setDeleteConfirmation(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await deleteSignature(deleteConfirmation.signatureId);
      if (result.success) {
        // Signature will be automatically refreshed by the deleteSignature function
        console.log('Signature deleted successfully');
      } else {
        console.error('Failed to delete signature:', result.error);
      }
    } catch (error) {
      console.error('Error deleting signature:', error);
    } finally {
      setDeleteConfirmation({
        show: false,
        signatureId: null,
        loading: false
      });
    }
  };

  // Handler for closing delete confirmation
  const toggleDeleteConfirmation = () => {
    setDeleteConfirmation({
      show: false,
      signatureId: null,
      loading: false
    });
  };

  const renderSignaturesSection = () => (
    <div className="space-y-6">
      {/* Excel Signatures */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" className="text-gray-800">
            Excel Signatures
          </Typography>
          <Button
            size="sm"
            className="bg-[#3DA5F4] hover:bg-[#2B8CE6] flex items-center gap-2"
            onClick={handleAddSignature}
          >
            <FaPlus size={12} />
            Add Signature
          </Button>
        </div>
        
        {isLoadingSignatures ? (
          <div className="text-center py-8">
            <Typography variant="small" className="text-gray-500">
              Loading signatures...
            </Typography>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Signature</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {signatures && signatures.length > 0 ? (
                  signatures.map((signature) => (
                    <tr key={signature.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-800">{signature.signature}</td>
                      <td className="py-3 px-4">
                        <button 
                          className="text-red-500 hover:text-red-700 p-1"
                          onClick={() => handleDeleteSignature(signature.id)}
                        >
                          <FaTimes size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-8 text-center text-gray-500">
                      No signatures found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Digital Signature */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" className="text-gray-800">
            Digital Signature
          </Typography>
          <Button
            size="sm"
            className="bg-[#3DA5F4] hover:bg-[#2B8CE6] flex items-center gap-2"
            onClick={handleAddDigitalSignature}
          >
            {digitalSignature ? (
              <>
                <FaEdit size={12} />
                Edit Digital Signature
              </>
            ) : (
              <>
            <FaPlus size={12} />
            Add Digital Signature
              </>
            )}
          </Button>
        </div>
        
        {isLoadingDigitalSignature ? (
          <div className="text-center py-8">
            <Typography variant="small" className="text-gray-500">
              Loading digital signature...
            </Typography>
          </div>
        ) : (
        <div className="text-gray-600">
            <Typography variant="small" className="mb-2 font-semibold">Digital Signature:</Typography>
            {digitalSignature && digitalSignature.signature_text ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                <Typography variant="small" className="text-gray-800">
                  {digitalSignature.signature_text}
                </Typography>
              </div>
            ) : (
          <Typography variant="small" className="text-gray-500 italic">
            No data found!
          </Typography>
            )}
        </div>
        )}
      </div>
    </div>
  );

  const handleExcelHeadingSave = () => {
    const branchId = excelHeadingBranch?.value ?? excelHeadingBranch;
    if (branchId === undefined || branchId === null || branchId === '') {
      showToast('Please select a branch', 'error');
      return;
    }
    if (!excelHeadingHeaderText.trim()) {
      showToast('Please enter the header text', 'error');
      return;
    }
    if (excelHeadingHeaderText.length > 100) {
      showToast('Header text must be max 100 characters', 'error');
      return;
    }
    // TODO: wire to API when backend endpoint is ready
    showToast('Excel heading save to be connected to API', 'info');
  };

  const renderExcelHeadingSection = () => {
    const branchesList = Array.isArray(branchesAll) ? branchesAll : [];
    const branchOptions = branchesList.map((branch) => ({
      value: branch.id,
      label: branch.branch_name
    }));
    const selectedBranchOption = excelHeadingBranch && (typeof excelHeadingBranch === 'object' && 'value' in excelHeadingBranch)
      ? excelHeadingBranch
      : excelHeadingBranch != null && excelHeadingBranch !== ''
        ? { value: excelHeadingBranch, label: branchesList.find((b) => b.id === excelHeadingBranch || b.id == excelHeadingBranch)?.branch_name || 'Branch' }
        : null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Typography variant="h6" className="text-blue-500 mb-6">
          Excel Heading
        </Typography>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">
              <Typography variant="small" className="text-gray-700 font-medium">
                Select Branch
              </Typography>
            </label>
            <CustomSelect
              placeHolderTitle="Choose a branch"
              value={selectedBranchOption}
              options={branchOptions}
              onChangeHandler={(option) => setExcelHeadingBranch(option)}
              customStyles={false}
              isSearchable={true}
            />
          </div>

          <div>
            <label className="block mb-2">
              <Typography variant="small" className="text-gray-700 font-medium">
                Put the header in below field
              </Typography>
            </label>
            <input
              type="text"
              value={excelHeadingHeaderText}
              onChange={(e) => setExcelHeadingHeaderText(e.target.value.slice(0, 100))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Max 100 character"
              maxLength={100}
            />
          </div>

          <Button
            className="bg-[#3DA5F4] hover:bg-[#2B8CE6]"
            onClick={handleExcelHeadingSave}
            disabled={!selectedBranchOption || !excelHeadingHeaderText.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file (PNG or JPG)', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSaveLogo = async () => {
    if (!selectedFile) {
      showToast('Please select a file first', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const result = await updateOrgLogo(selectedFile);
      if (result.success) {
        showToast('Logo updated successfully!', 'success');
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('logo-file-input');
        if (fileInput) fileInput.value = '';
      } else {
        showToast(result.error || 'Failed to update logo', 'error');
      }
    } catch (error) {
      showToast('An error occurred while updating logo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const renderCompanyLogoSection = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Typography variant="h6" className="text-gray-800 mb-4">
          Company/Org Logo
        </Typography>
        
        <div className="flex gap-6">
          {/* Left side - File upload */}
          <div className="flex-1">
            <div className="mb-4">
              <Typography variant="small" className="text-gray-600 mb-2">
                Logo (png or jpg image)
              </Typography>
              <div className="flex gap-2">
                <input
                  id="logo-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <Button
                  size="sm"
                  className="bg-[#3DA5F4] hover:bg-[#2B8CE6]"
                  onClick={handleSaveLogo}
                  disabled={!selectedFile || isUploading}
                  loading={isUploading}
                >
                  {isUploading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Current logo display */}
          <div className="flex-1">
            {isLoadingLogo ? (
              <div className="text-center py-8">
                <Typography variant="small" className="text-gray-500">
                  Loading logo...
                </Typography>
              </div>
            ) : orgLogo && orgLogo.logo ? (
              <div className="text-center">
                <Typography variant="small" className="text-gray-600 mb-2">
                  Current Logo
                </Typography>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <img
                    src={orgLogo.logo}
                    alt="Company Logo"
                    className="max-w-full max-h-32 mx-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }} className="text-gray-500 text-sm">
                    Logo not available
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Typography variant="small" className="text-gray-500">
                  No logo uploaded yet
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleBirthdayTemplateChange = (e) => {
    setBirthdayTemplateText(e.target.value);
  };

  // Validate birthday template
  const validateBirthdayTemplate = (text) => {
    const trimmedText = text.trim();
    
    // Check if empty
    if (!trimmedText) {
      return { isValid: false, message: 'Birthday template cannot be empty' };
    }

    // Check character count (max 240 characters)
    if (trimmedText.length > 240) {
      return { isValid: false, message: 'Birthday template cannot exceed 240 characters' };
    }

    // Check word count (max 18 words)
    const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 18) {
      return { isValid: false, message: 'Birthday template cannot exceed 18 words' };
    }

    return { isValid: true, message: '' };
  };

  const handleSaveBirthdayTemplate = async () => {
    // Validate template
    const validation = validateBirthdayTemplate(birthdayTemplateText);
    if (!validation.isValid) {
      showToast(validation.message, 'error');
      return;
    }

    try {
      const result = await updateBirthdayTemplate(birthdayTemplateText.trim());
      if (result.success) {
        showToast('Birthday template saved successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to save birthday template', 'error');
      }
    } catch (error) {
      showToast('An error occurred while saving birthday template', 'error');
    }
  };

  const renderBirthdayTemplateSection = () => {
    // Calculate current character and word count
    const charCount = birthdayTemplateText.length;
    const wordCount = birthdayTemplateText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const isCharLimitExceeded = charCount > 240;
    const isWordLimitExceeded = wordCount > 18;

    return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <Typography variant="h6" className="text-gray-800 mb-4">
        Birthday Template
      </Typography>
        <Typography variant="small" className="text-gray-500 mb-4">
        Configure birthday notification templates and settings.
      </Typography>

        {isLoadingBirthdayTemplate ? (
          <div className="text-center py-8">
            <Typography variant="small" className="text-gray-500">
              Loading birthday template...
            </Typography>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Typography variant="small" className="text-gray-700 mb-2 font-semibold">
                Birthday Template Text:
              </Typography>
              <Textarea
                label="Enter Birthday Template"
                value={birthdayTemplateText}
                onChange={handleBirthdayTemplateChange}
                className="w-full"
                rows={6}
                color="blue"
              />
              
              {/* Character and Word Count */}
              <div className="flex justify-between items-center mt-2">
                <Typography variant="small" className={`${isCharLimitExceeded ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                  Characters: {charCount}/240
                </Typography>
                <Typography variant="small" className={`${isWordLimitExceeded ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                  Words: {wordCount}/18
                </Typography>
              </div>

              {/* Validation Messages */}
              {isCharLimitExceeded && (
                <Typography variant="small" className="text-red-500 mt-1">
                  Template exceeds 240 characters limit
                </Typography>
              )}
              {isWordLimitExceeded && (
                <Typography variant="small" className="text-red-500 mt-1">
                  Template exceeds 18 words limit
                </Typography>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                className="bg-[#3DA5F4] hover:bg-[#2B8CE6]"
                onClick={handleSaveBirthdayTemplate}
                disabled={isSavingBirthdayTemplate || !birthdayTemplateText.trim() || isCharLimitExceeded || isWordLimitExceeded}
                loading={isSavingBirthdayTemplate}
              >
                {isSavingBirthdayTemplate ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}
    </div>
  );
  };

  const handleMobileAttendanceToggle = async () => {
    try {
      const result = await toggleMobileAttendance();
      if (result.success) {
        showToast('Mobile Attendance toggled successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to toggle mobile attendance', 'error');
      }
    } catch (error) {
      showToast('An error occurred while toggling mobile attendance', 'error');
    }
  };

  const handleLocationLogsToggle = async () => {
    try {
      const result = await toggleMobileAttendanceLocationLog();
      if (result.success) {
        showToast('Attendance Location logs toggled successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to toggle location logs', 'error');
      }
    } catch (error) {
      showToast('An error occurred while toggling location logs', 'error');
    }
  };

  const renderMobileAttendanceSection = () => {
    // Extract config values with proper fallbacks
    const isConfigured = mobileAttendanceConfig?.mobile_attendance === 1;
    const locationLogsEnabled = mobileAttendanceConfig?.att_premises === "1" || mobileAttendanceConfig?.att_premises === 1;

    return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Typography variant="h6" className="text-blue-500 mb-6">
          Mobile Attendance Configuration
      </Typography>

        {isLoadingMobileAttendance ? (
          <div className="text-center py-8">
      <Typography variant="small" className="text-gray-500">
              Loading mobile attendance configuration...
            </Typography>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Mobile Attendance Toggle */}
            <div className="flex justify-between items-center py-4 border-b border-gray-200 min-h-[60px]">
              <div className="flex items-center">
                <Tooltip 
                  content={
                    <div className="text-xs">
                      <div>Allow Employee to mark</div>
                      <div>attendance from mobile application</div>
                    </div>
                  } 
                  placement="top"
                >
                  <Typography variant="small" className="text-gray-700 font-medium cursor-help">
                    Mobile Attendance
                  </Typography>
                </Tooltip>
              </div>
              <Tooltip 
                content={
                  <div className="text-xs">
                    <div>Allow Employee to mark</div>
                    <div>attendance from mobile application</div>
                  </div>
                } 
                placement="top"
              >
                <button
                  onClick={handleMobileAttendanceToggle}
                  disabled={isTogglingMobileAttendance}
                  className={`px-4 py-1 rounded text-xs font-semibold transition-colors min-w-[100px] ${
                    isConfigured
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${isTogglingMobileAttendance ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isTogglingMobileAttendance ? 'UPDATING...' : (isConfigured ? 'CONFIGURED' : 'CONFIGURE')}
                </button>
              </Tooltip>
            </div>

            {/* Attendance Location Logs Toggle */}
            <div className="flex justify-between items-center py-4 border-b border-gray-200 min-h-[60px]">
              <div className="flex items-center">
                <Tooltip 
                  content={
                    <div className="text-xs">
                      <div>Enable Employee Mobile</div>
                      <div>Attendance Location Tracking</div>
                    </div>
                  } 
                  placement="top"
                >
                  <Typography variant="small" className="text-gray-700 font-medium cursor-help">
                    Attendance Location logs
                  </Typography>
                </Tooltip>
              </div>
              <Tooltip 
                content={
                  <div className="text-xs">
                    <div>Enable Employee Mobile</div>
                    <div>Attendance Location Tracking</div>
                  </div>
                } 
                placement="top"
              >
                <button
                  onClick={handleLocationLogsToggle}
                  disabled={isTogglingLocationLog}
                  className={`px-4 py-1 rounded text-xs font-semibold transition-colors min-w-[100px] ${
                    locationLogsEnabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  } ${isTogglingLocationLog ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isTogglingLocationLog ? 'UPDATING...' : (locationLogsEnabled ? 'ENABLED' : 'DISABLED')}
                </button>
              </Tooltip>
            </div>

            {/* Configuration Status Message */}
            {isConfigured && (
              <div className="py-4 min-h-[50px]">
                <Typography variant="small" className="text-green-600 italic">
                  already configured
      </Typography>
              </div>
            )}
          </div>
        )}
    </div>
  );
  };

  const handleRetirementDataChange = (field, value) => {
    if (field === 'retirement_age') {
      setRetirementAge(value);
    } else if (field === 'probation_period') {
      setProbationPeriod(value);
    }
  };

  const handleSaveRetirementData = async () => {
    // Validation
    if (!retirementAge || !probationPeriod) {
      showToast('Please fill all fields', 'error');
      return;
    }

    const retirementAgeNum = parseInt(retirementAge);
    const probationPeriodNum = parseInt(probationPeriod);

    if (isNaN(retirementAgeNum) || retirementAgeNum <= 0) {
      showToast('Please enter a valid retirement age', 'error');
      return;
    }

    if (isNaN(probationPeriodNum) || probationPeriodNum < 0) {
      showToast('Please enter a valid probation period', 'error');
      return;
    }

    try {
      const result = await setRetirementData({
        retirement_age: retirementAgeNum,
        probation_period: probationPeriodNum
      });

      if (result.success) {
        showToast('Retirement data saved successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to save retirement data', 'error');
      }
    } catch (error) {
      showToast('An error occurred while saving retirement data', 'error');
    }
  };

  const renderEmployeeMiscSection = () => {
    const retirementAgeValue = retirementData?.retirement_age || 0;
    const probationPeriodValue = retirementData?.probation_period || 0;

    return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Typography variant="h6" className="text-blue-500 mb-6">
          Employee Retirement / Probation Configuration
      </Typography>

        {isLoadingRetirementData ? (
          <div className="text-center py-8">
      <Typography variant="small" className="text-gray-500">
              Loading retirement data...
            </Typography>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Configuration Display */}
            <div className="space-y-4">
              <div className="flex justify-between items-start py-3 border-b border-gray-200">
                <Typography variant="small" className="text-gray-700 font-medium">
                  Age (years)
                </Typography>
                <Typography variant="small" className="text-gray-600 text-right max-w-[300px]">
                  Every employee would be retired at the age of <span className="text-blue-500 font-semibold">{retirementAgeValue}</span>
                </Typography>
              </div>

              <div className="flex justify-between items-start py-3 border-b border-gray-200">
                <Typography variant="small" className="text-gray-700 font-medium">
                  Probation Period
                </Typography>
                <Typography variant="small" className="text-gray-600 text-right max-w-[300px]">
                  Employee become permanent after <span className="text-blue-500 font-semibold">{probationPeriodValue} month(s)</span>
                </Typography>
              </div>

              {retirementData && (
                <div className="py-2">
                  <Typography variant="small" className="text-green-600 italic">
                    already configured
      </Typography>
                </div>
              )}
            </div>

            {/* Input Fields */}
            <div className="space-y-4 pt-4">
              <div>
                <label className="block mb-2">
                  <Typography variant="small" className="text-gray-700 font-medium">
                    Enter Retirement age
                  </Typography>
                </label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) => handleRetirementDataChange('retirement_age', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="60"
                  min="1"
                />
              </div>

              <div>
                <label className="block mb-2">
                  <Typography variant="small" className="text-gray-700 font-medium">
                    Enter Probation period in month(s)
                  </Typography>
                </label>
                <input
                  type="number"
                  value={probationPeriod}
                  onChange={(e) => handleRetirementDataChange('probation_period', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="3"
                  min="0"
                />
              </div>

              <Button
                className="bg-[#3DA5F4] hover:bg-[#2B8CE6]"
                onClick={handleSaveRetirementData}
                disabled={isSavingRetirementData || !retirementAge || !probationPeriod}
                loading={isSavingRetirementData}
              >
                {isSavingRetirementData ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}
    </div>
  );
  };

  const handleBranchSelect = (branchName) => {
    setSelectedBranch(branchName);
    // Find the email for the selected branch
    const branch = reportingEmails.find(b => b.branch_name === branchName);
    if (branch) {
      setReportingEmailInput(branch.email_add);
    } else {
      setReportingEmailInput('');
    }
  };

  const handleSaveReportingEmail = async () => {
    if (!selectedBranch) {
      showToast('Please select a branch', 'error');
      return;
    }

    if (!reportingEmailInput || !reportingEmailInput.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reportingEmailInput)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      const result = await sendReportingEmail({
        branch_name: selectedBranch,
        email_add: reportingEmailInput
      });

      if (result.success) {
        showToast(result.message || 'Reporting email saved successfully!', 'success');
        setSelectedBranch('');
        setReportingEmailInput('');
      } else {
        showToast(result.error || 'Failed to save reporting email', 'error');
      }
    } catch (error) {
      showToast('An error occurred while saving reporting email', 'error');
    }
  };

  const renderReportingMailSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <Typography variant="h6" className="text-blue-500 mb-6">
        Reporting Mails Configuration
      </Typography>

      {isLoadingReportingEmails ? (
        <div className="text-center py-8">
      <Typography variant="small" className="text-gray-500">
            Loading reporting emails...
          </Typography>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-300">
              <Typography variant="small" className="font-semibold text-gray-700">
                Branch Name
              </Typography>
              <Typography variant="small" className="font-semibold text-gray-700">
                Reporting Email
              </Typography>
            </div>

            {/* Table Body */}
            {reportingEmails && reportingEmails.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {reportingEmails.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 py-3">
                    <Typography variant="small" className="text-orange-500">
                      {item.branch_name}
                    </Typography>
                    <Typography variant="small" className="text-blue-500">
                      {item.email_add}
                    </Typography>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <Typography variant="small" className="text-gray-500 italic">
                  No reporting emails configured yet
      </Typography>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="space-y-4 pt-4">
            <div>
              <label className="block mb-2">
                <Typography variant="small" className="text-gray-700 font-medium">
                  Select Branch
                </Typography>
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => handleBranchSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Choose a branch</option>
                {reportingEmails && reportingEmails.map((item, index) => (
                  <option key={index} value={item.branch_name}>
                    {item.branch_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">
                <Typography variant="small" className="text-gray-700 font-medium">
                  Email Address
                </Typography>
              </label>
              <input
                type="email"
                value={reportingEmailInput}
                onChange={(e) => setReportingEmailInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter email address"
              />
            </div>

            <Button
              className="bg-[#3DA5F4] hover:bg-[#2B8CE6]"
              onClick={handleSaveReportingEmail}
              disabled={isSavingReportingEmail || !selectedBranch || !reportingEmailInput}
              loading={isSavingReportingEmail}
            >
              {isSavingReportingEmail ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'signatures':
        return renderSignaturesSection();
      case 'excel_heading':
        return renderExcelHeadingSection();
      case 'company_logo':
        return renderCompanyLogoSection();
      case 'birthday_template':
        return renderBirthdayTemplateSection();
      case 'mobile_attendance':
        return renderMobileAttendanceSection();
      case 'employee_misc':
        return renderEmployeeMiscSection();
      case 'reporting_mail':
        return renderReportingMailSection();
      default:
        return renderSignaturesSection();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <Typography variant="h4" className="text-gray-800 font-bold">
          Setting
        </Typography>
      </div>

      <div className="flex gap-6">
        {/* Left Navigation */}
        <div className="w-80 bg-white rounded-lg border border-gray-200 p-4">
          <div className="space-y-4">
            {settingsSections.map((section, index) => (
              <div key={section.id} className="relative flex items-center">
                {/* Connection Line - positioned to connect circles properly */}
                {index > 0 && (
                  <div className="absolute left-3 w-0.5 h-8 bg-[#3DA5F4] -top-4"></div>
                )}
                
                {/* Circle and Text */}
                <div className="flex items-center gap-3 ml-2 relative top-2">
                  <div
                    className={`w-3 h-3 rounded-full border-2 transition-colors ${
                      activeSection === section.id
                        ? 'bg-[#3DA5F4] border-[#3DA5F4]'
                        : 'bg-white border-[#3DA5F4]'
                    }`}
                  ></div>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`text-left transition-colors ${
                      activeSection === section.id
                        ? 'text-[#3DA5F4] font-medium'
                        : 'text-gray-600 hover:text-[#3DA5F4]'
                    }`}
                  >
                    <Typography variant="small">
                      {section.title}
                    </Typography>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog 
        openDialog={deleteConfirmation.show}
        title="Delete Confirmation"
        message="Are you sure you want to delete this signature?"
        handleConfirm={confirmDeleteSignature}
        handleOpen={toggleDeleteConfirmation}
        loading={deleteConfirmation.loading}
      />
    </div>
  );
};

export default Settings;
