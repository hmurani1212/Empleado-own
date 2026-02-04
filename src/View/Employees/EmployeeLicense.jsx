import React, { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { showToast } from '../../Components/Toaster/Toaster';
import useStore from '../../Store/store';
import TailwindSelect from '../../Components/CustomSelect/TailwindSelect';

const EmployeeLicense = ({
    employeeData,
    employeeId,
    openLicenseDrawer,
    setOpenLicenseDrawer,
    isUpdating,
    setIsUpdating,
    setEmployeeData,
    editingRecord,
    setEditingRecord,
    onDeleteLicense
}) => {
    const addEmployeeLicense = useStore((state) => state.addEmployeeLicense);
    const gettingEmployeeProfile = useStore((state) => state.gettingEmployeeProfile);
    
    const [licenseForm, setLicenseForm] = useState({
        licenseTitle: '',
        licenseType: '',
        licenseNumber: '',
        issuingAuthority: '',
        issueDate: '',
        expiryDate: ''
    });

    // License type options
    const licenseTypeOptions = [
        { value: '1', label: 'Driving License' },
        { value: '2', label: 'Professional License' },
        { value: '3', label: 'Medical License' },
        { value: '4', label: 'Teaching License' },
        { value: '5', label: 'Engineering License' },
        { value: '6', label: 'Legal License' },
        { value: '7', label: 'Other' }
    ];

    // Reset form when drawer closes or populate when editing
    useEffect(() => {
        if (!openLicenseDrawer) {
            setLicenseForm({
                licenseTitle: '',
                licenseType: '',
                licenseNumber: '',
                issuingAuthority: '',
                issueDate: '',
                expiryDate: ''
            });
            setEditingRecord(null);
        } else if (editingRecord) {
            // Populate form with editing record data
            setLicenseForm({
                licenseTitle: editingRecord.license_title || '',
                licenseType: editingRecord.license_type?.toString() || '',
                licenseNumber: editingRecord.license_number || '',
                issuingAuthority: editingRecord.issuing_authority || '',
                issueDate: editingRecord.issue_date ? editingRecord.issue_date.split('T')[0] : '',
                expiryDate: editingRecord.expiry_date ? editingRecord.expiry_date.split('T')[0] : ''
            });
        }
    }, [openLicenseDrawer, editingRecord, setEditingRecord]);

    const handleLicenseChange = (field, value) => {
        setLicenseForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLicenseSubmit = async () => {
        try {
            setIsUpdating(true);

            // Form validation
            if (!licenseForm.licenseTitle || !String(licenseForm.licenseTitle).trim()) {
                showToast('License Title is required', 'error');
                return;
            }
            if (!licenseForm.licenseType || !String(licenseForm.licenseType).trim()) {
                showToast('License Type is required', 'error');
                return;
            }
            if (!licenseForm.licenseNumber || !String(licenseForm.licenseNumber).trim()) {
                showToast('License Number is required', 'error');
                return;
            }

            // Validate license number contains only numbers and common separators
            const licenseNumberValue = String(licenseForm.licenseNumber).trim();
            const licenseNumberRegex = /^[0-9\-\s]+$/;
            if (!licenseNumberRegex.test(licenseNumberValue)) {
                showToast('License Number must contain only numbers, hyphens, and spaces (e.g., 123456789 or DL-123456789)', 'error');
                return;
            }
            if (!licenseForm.issuingAuthority || !String(licenseForm.issuingAuthority).trim()) {
                showToast('Issuing Authority is required', 'error');
                return;
            }
            if (!licenseForm.issueDate || !String(licenseForm.issueDate).trim()) {
                showToast('Issue Date is required', 'error');
                return;
            }
            if (!licenseForm.expiryDate || !String(licenseForm.expiryDate).trim()) {
                showToast('Expiry Date is required', 'error');
                return;
            }

            // Validate dates
            const issueDate = new Date(licenseForm.issueDate);
            const expiryDate = new Date(licenseForm.expiryDate);
            
            if (expiryDate <= issueDate) {
                showToast('Expiry Date must be after Issue Date', 'error');
                return;
            }

            // Prepare payload for add/update license API
            const payload = {
                license_type: parseInt(licenseForm.licenseType),
                license_title: licenseForm.licenseTitle,
                license_number: licenseForm.licenseNumber,
                issuing_authority: licenseForm.issuingAuthority,
                issue_date: licenseForm.issueDate,
                expiry_date: licenseForm.expiryDate,
                branch_id: employeeData?.Official_Info?.branch?.id || 0
            };

            // Add operation and id for update
            if (editingRecord) {
                payload.operation = "update_license";
                payload.id = editingRecord.id;
            }

            // console.log(editingRecord ? 'Updating license record with payload:' : 'Adding license record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeLicense(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast(editingRecord ? 'License record updated successfully' : 'License record added successfully', 'success');
                
                // Refresh employee profile data and update parent state
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        // console.log('Employee profile refreshed successfully');
                        
                        // Update the parent component's employeeData state
                        setEmployeeData(prevData => ({
                            ...prevData,
                            ...refreshedData.DB_DATA
                        }));
                    }
                } catch (refreshError) {
                    console.error('Error refreshing employee profile:', refreshError);
                    // Don't show error to user as the main operation was successful
                }
                
                setOpenLicenseDrawer(false);
                
                // Reset form
                setLicenseForm({
                    licenseTitle: '',
                    licenseType: '',
                    licenseNumber: '',
                    issuingAuthority: '',
                    issueDate: '',
                    expiryDate: ''
                });
            } else {
                showToast('Failed to add license record', 'error');
            }
        } catch (error) {
            console.error('Error adding license record:', error);
            showToast('Failed to add license record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteLicense = async (licenseId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete license API
            const payload = {
                operation: "delete_license",
                id: licenseId
            };

            // console.log('Deleting license record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeLicense(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast('License record deleted successfully', 'success');
                
                // Refresh employee profile data and update parent state
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        // console.log('Employee profile refreshed successfully');
                        
                        // Update the parent component's employeeData state
                        setEmployeeData(prevData => ({
                            ...prevData,
                            ...refreshedData.DB_DATA
                        }));
                    }
                } catch (refreshError) {
                    console.error('Error refreshing employee profile:', refreshError);
                    // Don't show error to user as the main operation was successful
                }
            } else {
                showToast('Failed to delete license record', 'error');
            }
        } catch (error) {
            console.error('Error deleting license record:', error);
            showToast('Failed to delete license record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <PortalDrawer
            open={openLicenseDrawer}
            closeDrawer={() => setOpenLicenseDrawer(false)}
            title={editingRecord ? "Edit License Record" : "Add employee license info"}
            widthSize={600}
            compo={
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* License Title */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                License Title
                            </label>
                            <input
                                type="text"
                                value={licenseForm.licenseTitle}
                                onChange={(e) => handleLicenseChange('licenseTitle', e.target.value)}
                                placeholder="Enter license title"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* License Type */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                License Type
                            </label>
                            <TailwindSelect
                                value={licenseForm.licenseType || ""}
                                options={licenseTypeOptions}
                                onChange={(selectedValue) => {
                                    handleLicenseChange('licenseType', selectedValue);
                                }}
                                placeholder="Select license type"
                            />
                        </div>

                        {/* License Number */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                License Number
                            </label>
                            <input
                                type="text"
                                value={licenseForm.licenseNumber}
                                onChange={(e) => handleLicenseChange('licenseNumber', e.target.value)}
                                placeholder="Enter license number (e.g., 123456789 or DL-123456789)"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* Issuing Authority Detail */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Issuing Authority Detail
                            </label>
                            <textarea
                                value={licenseForm.issuingAuthority}
                                onChange={(e) => handleLicenseChange('issuingAuthority', e.target.value)}
                                placeholder="Enter issuing authority details"
                                rows={3}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* Issue Date and Expiry Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Issue Date
                                </label>
                                <input
                                    type="date"
                                    value={licenseForm.issueDate}
                                    onChange={(e) => handleLicenseChange('issueDate', e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Expiry Date
                                </label>
                                <input
                                    type="date"
                                    value={licenseForm.expiryDate}
                                    onChange={(e) => handleLicenseChange('expiryDate', e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-start gap-3 pt-4">
                        <Button
                            color="blue"
                            onClick={handleLicenseSubmit}
                            disabled={isUpdating}
                            className="px-6 py-2"
                        >
                            {isUpdating ? (editingRecord ? 'Updating...' : 'Adding...') : (editingRecord ? 'Update License' : 'Add License')}
                        </Button>
                        <Button
                            color="gray"
                            variant="outlined"
                            onClick={() => setOpenLicenseDrawer(false)}
                            disabled={isUpdating}
                            className="px-6 py-2"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            }
        />
    );
};

export default EmployeeLicense;
