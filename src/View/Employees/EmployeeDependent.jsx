import React, { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { showToast } from '../../Components/Toaster/Toaster';
import useStore from '../../Store/store';

const EmployeeDependent = ({
    employeeData,
    employeeId,
    openDependentDrawer,
    setOpenDependentDrawer,
    isUpdating,
    setIsUpdating,
    setEmployeeData,
    editingRecord,
    setEditingRecord,
    onDeleteDependent,
    onRefreshDocuments
}) => {
    const addEmployeeDependent = useStore((state) => state.addEmployeeDependent);
    
    const [dependentForm, setDependentForm] = useState({
        name: '',
        relationship: '',
        gender: '',
        dob: '',
        contact: ''
    });

    const mapDependentToForm = (record) => ({
        name: record.name || '',
        relationship: record.relationship || '',
        gender: record.gender === '0' ? 'Male' : record.gender === '1' ? 'Female' : '',
        dob: record.dob ? record.dob.split('T')[0] : '',
        contact: record.contact || ''
    });

    // Reset form when drawer closes; when opening, populate from editing record or latest dependent
    useEffect(() => {
        if (!openDependentDrawer) {
            setDependentForm({
                name: '',
                relationship: '',
                gender: '',
                dob: '',
                contact: ''
            });
            setEditingRecord(null);
        } else if (editingRecord) {
            setDependentForm(mapDependentToForm(editingRecord));
        } else {
            const list = employeeData?.employee_documents?.depanedent;
            if (list && Array.isArray(list) && list.length > 0) {
                setDependentForm(mapDependentToForm(list[list.length - 1]));
            }
        }
    }, [openDependentDrawer, editingRecord, setEditingRecord]);

    const handleDependentChange = (field, value) => {
        setDependentForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDependentSubmit = async () => {
        try {
            setIsUpdating(true);

            // Form validation
            if (!dependentForm.name || !String(dependentForm.name).trim()) {
                showToast('Dependent Name is required', 'error');
                return;
            }
            if (!dependentForm.relationship || !String(dependentForm.relationship).trim()) {
                showToast('Relationship is required', 'error');
                return;
            }
            if (!dependentForm.gender || !String(dependentForm.gender).trim()) {
                showToast('Gender is required', 'error');
                return;
            }
            if (!dependentForm.dob || !String(dependentForm.dob).trim()) {
                showToast('Date of Birth is required', 'error');
                return;
            }
            if (!dependentForm.contact || !String(dependentForm.contact).trim()) {
                showToast('Contact is required', 'error');
                return;
            }

            // Validate contact is a valid phone number
            const contactValue = String(dependentForm.contact).trim();
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
            if (!phoneRegex.test(contactValue)) {
                showToast('Contact must be a valid phone number (e.g., +92-300-1234567 or 03001234567)', 'error');
                return;
            }

            // Prepare payload for add/update dependent API
            const payload = {
                name: dependentForm.name,
                relationship: dependentForm.relationship,
                gender: dependentForm.gender === 'Male' ? '0' : '1', // 0 for Male, 1 for Female
                dob: dependentForm.dob,
                contact: dependentForm.contact
            };

            // Add operation and id for update
            if (editingRecord) {
                payload.operation = "update_dependents";
                payload.id = editingRecord.id;
            }

            // console.log(editingRecord ? 'Updating dependent record with payload:' : 'Adding dependent record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeDependent(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast(editingRecord ? 'Dependent record updated successfully' : 'Dependent record added successfully', 'success');

                if (onRefreshDocuments) await onRefreshDocuments();

                setOpenDependentDrawer(false);
                
                // Reset form
                setDependentForm({
                    name: '',
                    relationship: '',
                    gender: '',
                    dob: '',
                    contact: ''
                });
            } else {
                showToast('Failed to add dependent record', 'error');
            }
        } catch (error) {
            console.error('Error adding dependent record:', error);
            showToast('Failed to add dependent record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteDependent = async (dependentId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete dependent API
            const payload = {
                operation: "delete_dependents",
                id: dependentId
            };

            // console.log('Deleting dependent record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeDependent(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast('Dependent record deleted successfully', 'success');

                if (onRefreshDocuments) await onRefreshDocuments();
            } else {
                showToast('Failed to delete dependent record', 'error');
            }
        } catch (error) {
            console.error('Error deleting dependent record:', error);
            showToast('Failed to delete dependent record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <PortalDrawer
            open={openDependentDrawer}
            closeDrawer={() => setOpenDependentDrawer(false)}
            title={editingRecord ? "Edit Dependent Record" : "Add employee dependent"}
            widthSize={600}
            compo={
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Dependent Name */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Dependent Name
                            </label>
                            <input
                                type="text"
                                value={dependentForm.name}
                                onChange={(e) => handleDependentChange('name', e.target.value)}
                                placeholder="Enter dependent name"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={dependentForm.dob}
                                onChange={(e) => handleDependentChange('dob', e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* Relationship */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Relationship
                            </label>
                            <input
                                type="text"
                                value={dependentForm.relationship}
                                onChange={(e) => handleDependentChange('relationship', e.target.value)}
                                placeholder="Enter relationship (e.g., Spouse, Child, Parent)"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* Contact */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Contact
                            </label>
                            <input
                                type="tel"
                                value={dependentForm.contact}
                                onChange={(e) => handleDependentChange('contact', e.target.value)}
                                placeholder="Enter contact number (e.g., +92-300-1234567)"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Gender
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Female"
                                        checked={dependentForm.gender === 'Female'}
                                        onChange={(e) => handleDependentChange('gender', e.target.value)}
                                        className="mr-2"
                                    />
                                    Female
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Male"
                                        checked={dependentForm.gender === 'Male'}
                                        onChange={(e) => handleDependentChange('gender', e.target.value)}
                                        className="mr-2"
                                    />
                                    Male
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            color="gray"
                            variant="outlined"
                            onClick={() => setOpenDependentDrawer(false)}
                            disabled={isUpdating}
                            className="px-6 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            color="blue"
                            onClick={handleDependentSubmit}
                            disabled={isUpdating}
                            className="px-6 py-2"
                        >
                            {isUpdating ? (editingRecord ? 'Updating...' : 'Adding...') : (editingRecord ? 'Update Dependent' : 'Add Dependent')}
                        </Button>
                    </div>
                </div>
            }
        />
    );
};

export default EmployeeDependent;
