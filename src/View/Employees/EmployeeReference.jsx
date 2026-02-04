import React, { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { showToast } from '../../Components/Toaster/Toaster';
import useStore from '../../Store/store';
import TailwindSelect from '../../Components/CustomSelect/TailwindSelect';

const EmployeeReference = ({
    employeeData,
    employeeId,
    openReferenceDrawer,
    setOpenReferenceDrawer,
    isUpdating,
    setIsUpdating,
    setEmployeeData,
    editingRecord,
    setEditingRecord,
    onDeleteReference
}) => {
    const addEmployeeReference = useStore((state) => state.addEmployeeReference);
    const gettingEmployeeProfile = useStore((state) => state.gettingEmployeeProfile);
    
    const [referenceForm, setReferenceForm] = useState({
        refName: '',
        refRelation: '',
        refSource: '1',
        refAddress: '',
        refContact: ''
    });

    // Source options
    const sourceOptions = [
        { value: '1', label: 'External' },
        { value: '2', label: 'Internal' },
        { value: '3', label: 'Professional' },
        { value: '4', label: 'Personal' }
    ];

    // Reset form when drawer closes or populate when editing
    useEffect(() => {
        if (!openReferenceDrawer) {
            setReferenceForm({
                refName: '',
                refRelation: '',
                refSource: '1',
                refAddress: '',
                refContact: ''
            });
            setEditingRecord(null);
        } else if (editingRecord) {
            // Populate form with editing record data
            setReferenceForm({
                refName: editingRecord.ref_name || '',
                refRelation: editingRecord.ref_relation || '',
                refSource: editingRecord.ref_source?.toString() || '1',
                refAddress: editingRecord.ref_address || '',
                refContact: editingRecord.ref_contact || ''
            });
        }
    }, [openReferenceDrawer, editingRecord, setEditingRecord]);

    const handleReferenceChange = (field, value) => {
        setReferenceForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleReferenceSubmit = async () => {
        try {
            setIsUpdating(true);

            // Form validation
            if (!referenceForm.refName || !String(referenceForm.refName).trim()) {
                showToast('Name is required', 'error');
                return;
            }
            if (!referenceForm.refRelation || !String(referenceForm.refRelation).trim()) {
                showToast('Relation is required', 'error');
                return;
            }
            if (!referenceForm.refSource || !String(referenceForm.refSource).trim()) {
                showToast('Source is required', 'error');
                return;
            }
            if (!referenceForm.refAddress || !String(referenceForm.refAddress).trim()) {
                showToast('Address is required', 'error');
                return;
            }
            if (!referenceForm.refContact || !String(referenceForm.refContact).trim()) {
                showToast('Contact is required', 'error');
                return;
            }

            // Validate contact is a valid phone number
            const contactValue = String(referenceForm.refContact).trim();
            const phoneRegex = /^[+]?[0-9\s\-()]{7,15}$/;
            if (!phoneRegex.test(contactValue)) {
                showToast('Contact must be a valid phone number (e.g., +1-555-123-4567 or 03001234567)', 'error');
                return;
            }

            // Prepare payload for add/update reference API
            const payload = {
                ref_name: referenceForm.refName,
                ref_source: parseInt(referenceForm.refSource),
                ref_relation: referenceForm.refRelation,
                ref_address: referenceForm.refAddress,
                ref_contact: referenceForm.refContact
            };

            // Add operation and id for update
            if (editingRecord) {
                payload.operation = "update_references";
                payload.id = editingRecord.id;
            }

            // console.log(editingRecord ? 'Updating reference record with payload:' : 'Adding reference record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeReference(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast(editingRecord ? 'Reference record updated successfully' : 'Reference record added successfully', 'success');
                
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
                
                setOpenReferenceDrawer(false);
                
                // Reset form
                setReferenceForm({
                    refName: '',
                    refRelation: '',
                    refSource: '1',
                    refAddress: '',
                    refContact: ''
                });
            } else {
                showToast('Failed to add reference record', 'error');
            }
        } catch (error) {
            console.error('Error adding reference record:', error);
            showToast('Failed to add reference record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteReference = async (referenceId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete reference API
            const payload = {
                operation: "delete_references",
                id: referenceId
            };

            // console.log('Deleting reference record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeReference(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast('Reference record deleted successfully', 'success');
                
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
                showToast('Failed to delete reference record', 'error');
            }
        } catch (error) {
            console.error('Error deleting reference record:', error);
            showToast('Failed to delete reference record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <PortalDrawer
            open={openReferenceDrawer}
            closeDrawer={() => setOpenReferenceDrawer(false)}
            title={editingRecord ? "Edit Reference Record" : "Add employee references"}
            widthSize={600}
            compo={
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Name and Relation - Two column layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={referenceForm.refName}
                                    onChange={(e) => handleReferenceChange('refName', e.target.value)}
                                    placeholder="Enter reference name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Relation
                                </label>
                                <input
                                    type="text"
                                    value={referenceForm.refRelation}
                                    onChange={(e) => handleReferenceChange('refRelation', e.target.value)}
                                    placeholder="Enter relation (e.g., Former Manager)"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Source */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Source
                            </label>
                            <TailwindSelect
                                value={referenceForm.refSource || ""}
                                options={sourceOptions}
                                onChange={(selectedValue) => {
                                    handleReferenceChange('refSource', selectedValue);
                                }}
                                placeholder="Select source"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Address
                            </label>
                            <textarea
                                value={referenceForm.refAddress}
                                onChange={(e) => handleReferenceChange('refAddress', e.target.value)}
                                placeholder="Enter complete address"
                                rows={4}
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
                                value={referenceForm.refContact}
                                onChange={(e) => handleReferenceChange('refContact', e.target.value)}
                                placeholder="Enter contact number (e.g., +1-555-123-4567)"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-start gap-3 pt-4">
                        <Button
                            color="blue"
                            onClick={handleReferenceSubmit}
                            disabled={isUpdating}
                            className="px-6 py-2"
                        >
                            {isUpdating ? (editingRecord ? 'Updating...' : 'Adding...') : (editingRecord ? 'Update Reference' : 'Submit')}
                        </Button>
                        <Button
                            color="gray"
                            variant="outlined"
                            onClick={() => setOpenReferenceDrawer(false)}
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

export default EmployeeReference;
