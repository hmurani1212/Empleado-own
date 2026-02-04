import React, { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { showToast } from '../../Components/Toaster/Toaster';
import useStore from '../../Store/store';

const EmployeeExperience = ({
    employeeData,
    employeeId,
    openExperienceDrawer,
    setOpenExperienceDrawer,
    isUpdating,
    setIsUpdating,
    setEmployeeData,
    editingRecord,
    setEditingRecord,
    onDeleteExperience
}) => {
    const addEmployeeExperience = useStore((state) => state.addEmployeeExperience);
    const gettingEmployeeProfile = useStore((state) => state.gettingEmployeeProfile);
    
    const [experienceForm, setExperienceForm] = useState({
        orgInstituteName: '',
        designation: '',
        fromDate: '',
        toDate: '',
        salary: '',
        reasonOfLeaving: ''
    });

    // Reset form when drawer closes or populate when editing
    useEffect(() => {
        if (!openExperienceDrawer) {
            setExperienceForm({
                orgInstituteName: '',
                designation: '',
                fromDate: '',
                toDate: '',
                salary: '',
                reasonOfLeaving: ''
            });
            setEditingRecord(null);
        } else if (editingRecord) {
            // Populate form with editing record data
            setExperienceForm({
                orgInstituteName: editingRecord.org_name || '',
                designation: editingRecord.designation || '',
                fromDate: editingRecord.from_date ? editingRecord.from_date.split('T')[0] : '',
                toDate: editingRecord.to_date ? editingRecord.to_date.split('T')[0] : '',
                salary: editingRecord.salary || '',
                reasonOfLeaving: editingRecord.leave_reason || ''
            });
        }
    }, [openExperienceDrawer, editingRecord, setEditingRecord]);

    const handleExperienceChange = (field, value) => {
        setExperienceForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleExperienceSubmit = async () => {
        try {
            setIsUpdating(true);

            // Form validation
            if (!experienceForm.orgInstituteName || !String(experienceForm.orgInstituteName).trim()) {
                showToast('Organization/Institute Name is required', 'error');
                return;
            }
            if (!experienceForm.designation || !String(experienceForm.designation).trim()) {
                showToast('Designation is required', 'error');
                return;
            }
            if (!experienceForm.fromDate || !String(experienceForm.fromDate).trim()) {
                showToast('From Date is required', 'error');
                return;
            }
            if (!experienceForm.toDate || !String(experienceForm.toDate).trim()) {
                showToast('To Date is required', 'error');
                return;
            }
            if (!experienceForm.salary || !String(experienceForm.salary).trim()) {
                showToast('Salary is required', 'error');
                return;
            }

            // Validate salary is a number
            const salaryNumber = parseFloat(experienceForm.salary);
            if (isNaN(salaryNumber) || salaryNumber < 0) {
                showToast('Salary must be a valid positive number', 'error');
                return;
            }
            if (!experienceForm.reasonOfLeaving || !String(experienceForm.reasonOfLeaving).trim()) {
                showToast('Reason of Leaving is required', 'error');
                return;
            }

            // Prepare payload for add/update experience API
            const payload = {
                org_name: experienceForm.orgInstituteName,
                designation: experienceForm.designation,
                from_date: experienceForm.fromDate,
                to_date: experienceForm.toDate,
                salary: salaryNumber, // Send as number
                leave_reason: experienceForm.reasonOfLeaving
            };

            // Add operation and id for update
            if (editingRecord) {
                payload.operation = "update_experience";
                payload.id = editingRecord.id;
            }

            // console.log(editingRecord ? 'Updating experience record with payload:' : 'Adding experience record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeExperience(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast(editingRecord ? 'Experience record updated successfully' : 'Experience record added successfully', 'success');
                
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
                
                setOpenExperienceDrawer(false);
                
                // Reset form
                setExperienceForm({
                    orgInstituteName: '',
                    designation: '',
                    fromDate: '',
                    toDate: '',
                    salary: '',
                    reasonOfLeaving: ''
                });
            } else {
                showToast('Failed to add experience record', 'error');
            }
        } catch (error) {
            console.error('Error adding experience record:', error);
            showToast('Failed to add experience record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteExperience = async (experienceId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete experience API
            const payload = {
                operation: "delete_experience",
                id: experienceId
            };

            // console.log('Deleting experience record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeExperience(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast('Experience record deleted successfully', 'success');
                
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
                showToast('Failed to delete experience record', 'error');
            }
        } catch (error) {
            console.error('Error deleting experience record:', error);
            showToast('Failed to delete experience record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <PortalDrawer
            open={openExperienceDrawer}
            closeDrawer={() => setOpenExperienceDrawer(false)}
            title={editingRecord ? "Edit Experience Record" : "Add Experience"}
            widthSize={800}
            compo={
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Org/Institute Name */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Org/Institute Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={experienceForm.orgInstituteName}
                                onChange={(e) => handleExperienceChange('orgInstituteName', e.target.value)}
                                placeholder="Enter organization or institute name"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* Designation */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Designation <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={experienceForm.designation}
                                onChange={(e) => handleExperienceChange('designation', e.target.value)}
                                placeholder="Enter designation"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* From and To Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    From <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={experienceForm.fromDate}
                                    onChange={(e) => handleExperienceChange('fromDate', e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    To <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={experienceForm.toDate}
                                    onChange={(e) => handleExperienceChange('toDate', e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Salary */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Salary <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={experienceForm.salary}
                                onChange={(e) => handleExperienceChange('salary', e.target.value)}
                                placeholder="Enter salary (e.g., 75000.00)"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* Reason of Leaving */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Reason of Leaving <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={experienceForm.reasonOfLeaving}
                                onChange={(e) => handleExperienceChange('reasonOfLeaving', e.target.value)}
                                placeholder="Enter reason of leaving"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-start gap-3 pt-4">
                        <Button
                            color="blue"
                            onClick={handleExperienceSubmit}
                            disabled={isUpdating}
                            className="px-6 py-2"
                        >
                            {isUpdating ? (editingRecord ? 'Updating...' : 'Adding...') : (editingRecord ? 'Update Experience' : 'Add Experience')}
                        </Button>
                        <Button
                            color="gray"
                            variant="outlined"
                            onClick={() => setOpenExperienceDrawer(false)}
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

export default EmployeeExperience;
