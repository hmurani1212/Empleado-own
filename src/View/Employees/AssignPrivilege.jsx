import React, { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { showToast } from '../../Components/Toaster/Toaster';
import useStore from '../../Store/store';

const AssignPrivilege = ({
    employeeData,
    employeeId,
    openAssignPrivilegeDrawer,
    setOpenAssignPrivilegeDrawer,
    isUpdating,
    setIsUpdating,
    setEmployeeData,
    editingRecord,
    setEditingRecord
}) => {
    const assignEmployeePrivilege = useStore((state) => state.assignEmployeePrivilege);
    const gettingEmployeeProfile = useStore((state) => state.gettingEmployeeProfile);
    
    const [privilegeForm, setPrivilegeForm] = useState({
        privilege: '1',
        ipFilter: ''
    });

    // Reset form when drawer closes or populate when editing
    useEffect(() => {
        if (!openAssignPrivilegeDrawer) {
            setPrivilegeForm({
                privilege: '1',
                ipFilter: ''
            });
            setEditingRecord(null);
        } else if (editingRecord) {
            // Populate form with editing record data
            setPrivilegeForm({
                privilege: editingRecord.privileges || '1',
                ipFilter: editingRecord.ip_filter || ''
            });
        }
    }, [openAssignPrivilegeDrawer, editingRecord]);

    const handlePrivilegeChange = (field, value) => {
        setPrivilegeForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePrivilegeSubmit = async () => {
        try {
            setIsUpdating(true);

            // Form validation
            if (!privilegeForm.privilege || !String(privilegeForm.privilege).trim()) {
                showToast('Privilege level is required', 'error');
                return;
            }
            if (!privilegeForm.ipFilter || !String(privilegeForm.ipFilter).trim()) {
                showToast('IP Filter is required', 'error');
                return;
            }

            // Validate IP address format
            const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            if (!ipRegex.test(privilegeForm.ipFilter)) {
                showToast('Please enter a valid IP address (e.g., 172.18.0.24)', 'error');
                return;
            }

            // Map UI privilege values to API one_id_roll values
            // UI: '0' = No Privilege, '1' = Super Admin, '2' = Branch Admin, '3' = Department Admin
            // API: 1 = Employee, 2 = Super Admin, 3 = Branch Admin, 4 = Department Admin
            const mapPrivilegeToOneIdRoll = (privilegeValue) => {
                const privilegeNum = parseInt(privilegeValue);
                // Map: 0→1, 1→2, 2→3, 3→4
                return privilegeNum + 1;
            };

            // Prepare payload for assign privilege API
            const payload = {
                emp_id: employeeId,
                one_id_roll: mapPrivilegeToOneIdRoll(privilegeForm.privilege),
                ip_filter: privilegeForm.ipFilter
            };

            // console.log('Assigning privilege with payload:', payload);

            // Call the actual API
            const result = await assignEmployeePrivilege(payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast('Privilege assigned successfully', 'success');
                
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
                
                setOpenAssignPrivilegeDrawer(false);
                
                // Reset form
                setPrivilegeForm({
                    privilege: '1',
                    ipFilter: ''
                });
            } else {
                showToast('Failed to assign privilege', 'error');
            }
        } catch (error) {
            console.error('Error assigning privilege:', error);
            showToast('Failed to assign privilege', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    // Privilege options - Only these 4 options
    const privilegeOptions = [
        { value: '0', label: 'No Privilege' },
        { value: '1', label: 'Super Admin' },
        { value: '2', label: 'Branch Admin' },
        { value: '3', label: 'Department Admin' }
    ];

    return (
        <PortalDrawer
            open={openAssignPrivilegeDrawer}
            closeDrawer={() => setOpenAssignPrivilegeDrawer(false)}
            title={editingRecord ? "Edit Privilege" : "Assign Employee Privilege"}
            widthSize={500}
            compo={
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Privilege Level */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Privilege Level <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={privilegeForm.privilege}
                                onChange={(e) => handlePrivilegeChange('privilege', e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                                {privilegeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* IP Filter */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                IP Filter <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={privilegeForm.ipFilter}
                                onChange={(e) => handlePrivilegeChange('ipFilter', e.target.value)}
                                placeholder="Enter IP address (e.g., 172.18.0.24)"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-start gap-3 pt-4">
                        <Button
                            color="blue"
                            onClick={handlePrivilegeSubmit}
                            disabled={isUpdating}
                            className="px-6 py-2"
                        >
                            {isUpdating ? (editingRecord ? 'Updating...' : 'Assigning...') : (editingRecord ? 'Update Privilege' : 'Assign Privilege')}
                        </Button>
                        <Button
                            color="gray"
                            variant="outlined"
                            onClick={() => setOpenAssignPrivilegeDrawer(false)}
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

export default AssignPrivilege;
