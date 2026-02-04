import React, { useState, useEffect } from 'react';
import { Button, Input, Typography, Select, Option, Textarea, Checkbox } from '@material-tailwind/react';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { showToast } from '../../Components/Toaster/Toaster';
import useStore from '../../Store/store';
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices';

const EmployeeDuties = ({
    employeeData,
    employeeId,
    openDutiesDrawer,
    setOpenDutiesDrawer,
    isUpdating,
    setIsUpdating,
    setEmployeeData,
    editingRecord,
    setEditingRecord
}) => {
    const { addEmployeeDuty, updateEmployeeDuty } = useEmployees();
    const { gettingEmployeeProfile } = useStore();

    // Debug: Check if functions are available
    useEffect(() => {
        console.log('EmployeeDuties - Functions available:', {
            addEmployeeDuty: typeof addEmployeeDuty,
            updateEmployeeDuty: typeof updateEmployeeDuty,
            gettingEmployeeProfile: typeof gettingEmployeeProfile
        });
    }, [addEmployeeDuty, updateEmployeeDuty, gettingEmployeeProfile]);

    const [dutiesForm, setDutiesForm] = useState({
        title: '',
        repetitionUnit: '',
        repetitionDuration: '',
        effectiveFrom: '',
        enforceTill: '',
        isPermanent: false,
        description: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Repetition unit options
    const repetitionUnits = [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' }
    ];

    console.log("EditingRecords", editingRecord)

    // Reset form when drawer closes or populate when editing
    useEffect(() => {
        if (!openDutiesDrawer) {
            setDutiesForm({
                title: '',
                repetitionUnit: '',
                repetitionDuration: '',
                effectiveFrom: '',
                enforceTill: '',
                isPermanent: false,
                description: ''
            });
            setEditingRecord(null);
        } else if (editingRecord) {
            // Populate form with editing record data
            setDutiesForm({
                title: editingRecord.title || '',
                repetitionUnit: editingRecord.repetition_unit || '',
                repetitionDuration: editingRecord.repetition_duration || '',
                effectiveFrom: editingRecord.effective_from ?
                    new Date(editingRecord.effective_from * 1000).toISOString().split('T')[0] : '',
                enforceTill: editingRecord.enforce_till ?
                    new Date(editingRecord.enforce_till * 1000).toISOString().split('T')[0] : '',
                isPermanent: editingRecord.enforce_till === null || editingRecord.enforce_till === 0,
                description: editingRecord.description || ''
            });
        }
    }, [openDutiesDrawer, editingRecord]);

    const handleInputChange = (field, value) => {
        setDutiesForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePermanentChange = (checked) => {
        setDutiesForm(prev => ({
            ...prev,
            isPermanent: checked,
            enforceTill: checked ? '' : prev.enforceTill
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsUpdating(true);

            // Form validation
            if (!dutiesForm.title || !dutiesForm.title.trim()) {
                showToast('Job Title is required', 'error');
                return;
            }
            if (!dutiesForm.repetitionUnit || !dutiesForm.repetitionUnit.trim()) {
                showToast('Repetition Unit is required', 'error');
                return;
            }
            if (!dutiesForm.repetitionDuration) {
                showToast('Repetitive Duration is required', 'error');
                return;
            }
            if (!dutiesForm.effectiveFrom || !dutiesForm.effectiveFrom.trim()) {
                showToast('Effective From date is required', 'error');
                return;
            }
            if (!dutiesForm.isPermanent && (!dutiesForm.enforceTill || !dutiesForm.enforceTill.trim())) {
                showToast('Enforced Till date is required when not permanent', 'error');
                return;
            }

            // Validate dates
            const effectiveFromDate = new Date(dutiesForm.effectiveFrom);
            const enforceTillDate = dutiesForm.enforceTill ? new Date(dutiesForm.enforceTill) : null;

            if (enforceTillDate && enforceTillDate <= effectiveFromDate) {
                showToast('Enforced Till date must be after Effective From date', 'error');
                return;
            }

            // Validate repetition duration is a positive number
            const duration = parseInt(dutiesForm.repetitionDuration);
            if (isNaN(duration) || duration <= 0) {
                showToast('Repetitive Duration must be a positive number', 'error');
                return;
            }

            // Prepare payload
            const payload = {
                title: dutiesForm.title.trim(),
                repetition_unit: dutiesForm.repetitionUnit,
                repetition_duration: duration,
                effective_from: Math.floor(effectiveFromDate.getTime() / 1000),
                enforce_till: dutiesForm.isPermanent ? 0 : Math.floor(enforceTillDate.getTime() / 1000),
                description: dutiesForm.description ? dutiesForm.description.trim() : ''
            };

            console.log('Submitting duty with payload:', payload);

            // Call API - use updateEmployeeDuty if editing, otherwise addEmployeeDuty
            let result;
            if (editingRecord) {
                console.log('Calling updateEmployeeDuty with ID:', editingRecord.id);

                if (!updateEmployeeDuty) {
                    console.error('updateEmployeeDuty function is not available!');
                    showToast('Update function not available', 'error');
                    return;
                }

                result = await updateEmployeeDuty(editingRecord.id, payload);
            } else {
                console.log('Calling addEmployeeDuty with employee ID:', employeeId);

                if (!addEmployeeDuty) {
                    console.error('addEmployeeDuty function is not available!');
                    showToast('Add function not available', 'error');
                    return;
                }

                result = await addEmployeeDuty(employeeId, payload);
            }

            console.log('API Result:', result);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast(editingRecord ? 'Duty updated successfully' : 'Duty assigned successfully', 'success');

                // Refresh employee profile data
                try {
                    console.log('Refreshing employee data for ID:', employeeId);

                    // Add small delay to ensure backend has processed the update
                    await new Promise(resolve => setTimeout(resolve, 300));

                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    console.log('Refreshed data:', refreshedData);

                    if (refreshedData && refreshedData.DB_DATA) {
                        console.log('Setting employee data with refreshed data');
                        console.log('Repetitive_Duties in refresh:', refreshedData.DB_DATA.Repetitive_Duties);
                        // Directly replace employee data with fresh API data
                        setEmployeeData(refreshedData.DB_DATA);
                        console.log('Employee data updated successfully');
                    } else {
                        console.warn('No DB_DATA in refreshed response');
                    }
                } catch (error) {
                    console.error('Error refreshing employee data:', error);
                }

                // Clear editing record and close drawer
                setEditingRecord(null);
                setOpenDutiesDrawer(false);
            } else {
                console.error('API call failed. Result:', result);
                showToast(editingRecord ? 'Failed to update duty' : 'Failed to assign duty', 'error');
            }
        } catch (error) {
            console.error('Error submitting duty:', error);
            console.error('Error details:', error.message, error.stack);
            showToast(editingRecord ? 'Failed to update duty' : 'Failed to assign duty', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <PortalDrawer
            open={openDutiesDrawer}
            closeDrawer={() => setOpenDutiesDrawer(false)}
            title={editingRecord ? "Edit Duty" : "Assign new duty"}
            widthSize={600}
            compo={
                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Job Title */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Job Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={dutiesForm.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Enter job title"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* Repetition Unit and Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Repetition Unit <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={dutiesForm.repetitionUnit}
                                    onChange={(e) => handleInputChange('repetitionUnit', e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select one</option>
                                    {repetitionUnits.map((unit) => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Repetitive Duration <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={dutiesForm.repetitionDuration}
                                    onChange={(e) => handleInputChange('repetitionDuration', e.target.value)}
                                    placeholder="Enter duration"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Effective From and Enforced Till */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Effective From <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={dutiesForm.effectiveFrom}
                                    onChange={(e) => handleInputChange('effectiveFrom', e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                        Enforced Till <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={dutiesForm.isPermanent}
                                            onChange={(e) => handlePermanentChange(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                            Permanent
                                        </label>
                                    </div>
                                </div>
                                <input
                                    type="date"
                                    value={dutiesForm.enforceTill}
                                    onChange={(e) => handleInputChange('enforceTill', e.target.value)}
                                    disabled={dutiesForm.isPermanent}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    required={!dutiesForm.isPermanent}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Description
                            </label>
                            <textarea
                                value={dutiesForm.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Enter duty description"
                                rows={4}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                color="blue"
                                disabled={isUpdating}
                                className="px-8"
                            >
                                {isUpdating ? 'Submitting...' : 'Submit'}
                            </Button>
                        </div>
                    </form>
                </div>
            }
        />
    );
};

export default EmployeeDuties;
