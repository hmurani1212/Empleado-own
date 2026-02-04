import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@material-tailwind/react';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { showToast } from '../../Components/Toaster/Toaster';
import employeesApi from '../../Model/Data/Employees/Employees';
import useStore from '../../Store/store';
import TailwindSelect from '../../Components/CustomSelect/TailwindSelect';

const ChangeReportingManager = ({
    employeeData,
    employeeId,
    openChangeReportingManagerDrawer,
    setOpenChangeReportingManagerDrawer,
    isUpdating,
    setIsUpdating,
    setEmployeeData
}) => {
    const gettingEmployeeProfile = useStore((state) => state.gettingEmployeeProfile);
    
    const [reportingManagerForm, setReportingManagerForm] = useState({
        reportingManager: '',
    });

    const [availableManagers, setAvailableManagers] = useState([]);
    const [isLoadingManagers, setIsLoadingManagers] = useState(false);
    const [selectedManagerId, setSelectedManagerId] = useState(null);

    // Load managers function - memoized to prevent unnecessary re-renders
    // New API: /api/v1/employees/employee/get_all_employee (no branch_id needed)
    const loadManagers = useCallback(async () => {
        try {
            setIsLoadingManagers(true);
            
            // Safety check: ensure employeeId is available
            if (!employeeId) {
                console.warn('Employee ID is not available for filtering reporting managers');
                setAvailableManagers([]);
                return;
            }
            
            // Call new API - no branch_id parameter needed
            const response = await employeesApi.getAllEmployeesForReportingManager();
            const data = response.data;
            
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // New API returns DB_DATA as an array directly (not DB_DATA.employees)
                // Response structure: DB_DATA: [{id, name, org_id, oneid, emp_id, bio_id, reporting_manager_oneid}]
                const employeesList = data.DB_DATA || [];
                
                // Filter out the current employee from the list (cannot select themselves as reporting manager)
                // Compare by ID to handle cases where multiple employees might have the same name
                const filteredEmployees = employeesList.filter(emp => {
                    // Safety check: ensure both IDs exist before comparison
                    if (!emp || !emp.id) {
                        return false;
                    }
                    
                    // Convert both IDs to strings for comparison to handle different ID formats
                    // This handles cases where IDs might be numbers, strings, or other formats
                    const currentEmployeeId = String(employeeId).trim();
                    const employeeIdFromList = String(emp.id).trim();
                    
                    // Return true only if IDs don't match (include in list)
                    return currentEmployeeId !== employeeIdFromList;
                });
                
                const managers = filteredEmployees.map(emp => ({
                    value: emp.name,
                    label: `${emp.name}`,
                    id: emp.id
                }));
                
                // Check if employee currently has a reporting manager assigned
                const hasReportingManager = employeeData?.Official_Info?.find_reporting_manager?.name && 
                                           employeeData.Official_Info.find_reporting_manager.name.trim() !== '';
                
                // Only add "null" option if employee has a reporting manager (to allow removal)
                // If no reporting manager is assigned, don't show the remove option
                const managersWithNull = hasReportingManager
                    ? [
                        { value: 'null', label: 'No Reporting Manager (Remove Current)', id: 0 },
                        ...managers
                      ]
                    : managers;
                
                setAvailableManagers(managersWithNull);
            } else {
                setAvailableManagers([]);
                showToast('Failed to load managers', 'error');
            }
        } catch (error) {
            console.error('Error loading managers:', error);
            showToast('Failed to load managers', 'error');
            setAvailableManagers([]);
        } finally {
            setIsLoadingManagers(false);
        }
    }, [employeeId, employeeData]);

    // Load managers when drawer opens (no branch_id needed for new API)
    useEffect(() => {
        if (openChangeReportingManagerDrawer && employeeId) {
            loadManagers();
        }
    }, [openChangeReportingManagerDrawer, employeeId, loadManagers]);

    // Populate form when employee data is available
    useEffect(() => {
        if (employeeData && openChangeReportingManagerDrawer) {
            const currentManagerName = employeeData?.Official_Info?.find_reporting_manager?.name || '';
            
            setReportingManagerForm({
                reportingManager: currentManagerName
            });
        }
    }, [employeeData?.Official_Info?.find_reporting_manager?.name, openChangeReportingManagerDrawer]);

    const handleReportingManagerChange = (field, value) => {
        setReportingManagerForm(prev => ({
            ...prev,
            [field]: value
        }));

        // Handle null selection (remove reporting manager)
        if (value === 'null') {
            setSelectedManagerId(0);
        } else {
            // Find the manager ID for API calls
            const selectedManager = availableManagers?.find(manager => manager.value === value);
            const managerId = selectedManager ? selectedManager.id : null;
            setSelectedManagerId(managerId);
        }
    };

    const handleReportingManagerSubmit = async () => {
        try {
            setIsUpdating(true);

            // Form validation
            if (!reportingManagerForm.reportingManager || !String(reportingManagerForm.reportingManager).trim()) {
                showToast('Please select a reporting manager', 'error');
                return;
            }

            // Prepare payload for update reporting manager API
            const payload = {
                emp_id: employeeId,
                report_to: selectedManagerId || 0 // Use 0 for null selection
            };

            // console.log('Updating reporting manager with payload:', payload);

            // Call assingManage API
            const result = await employeesApi.assingManage(payload);

            if (result && result.data && result.data.STATUS === "SUCCESSFUL") {
                showToast('Reporting manager updated successfully', 'success');
                
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
                
                setOpenChangeReportingManagerDrawer(false);
                
                // Reset form
                setReportingManagerForm({
                    reportingManager: ''
                });
                setSelectedManagerId(null);
            } else {
                showToast('Failed to update reporting manager', 'error');
            }
        } catch (error) {
            console.error('Error updating reporting manager:', error);
            showToast('Failed to update reporting manager', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <PortalDrawer
            open={openChangeReportingManagerDrawer}
            closeDrawer={() => setOpenChangeReportingManagerDrawer(false)}
            title="Change Reporting Manager"
            widthSize={600}
            compo={
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Current Reporting Manager Display */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Current Reporting Manager
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {employeeData?.Official_Info?.find_reporting_manager?.name || 'No reporting manager assigned'}
                                </span>
                            </div>
                        </div>

                        {/* New Reporting Manager Selection */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Select New Reporting Manager <span className="text-red-500">*</span>
                            </label>
                            <TailwindSelect
                                value={reportingManagerForm.reportingManager || ""}
                                options={availableManagers}
                                onChange={(selectedValue) => {
                                    handleReportingManagerChange('reportingManager', selectedValue);
                                }}
                                disabled={isLoadingManagers}
                                placeholder={isLoadingManagers ? "Loading managers..." : "Select a reporting manager"}
                            />
                        </div>

                        {/* Manager Information Display */}
                        {reportingManagerForm.reportingManager && (
                            <div className={`p-3 border rounded-lg ${
                                reportingManagerForm.reportingManager === 'null' 
                                    ? 'bg-red-50 border-red-200' 
                                    : 'bg-blue-50 border-blue-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${
                                        reportingManagerForm.reportingManager === 'null' 
                                            ? 'text-red-700' 
                                            : 'text-blue-700'
                                    }`}>
                                        {reportingManagerForm.reportingManager === 'null' 
                                            ? 'Action:' 
                                            : 'Selected Manager:'
                                        }
                                    </span>
                                    <span className={`text-sm px-2 py-1 rounded ${
                                        reportingManagerForm.reportingManager === 'null' 
                                            ? 'text-red-800 bg-red-100' 
                                            : 'text-blue-800 bg-blue-100'
                                    }`}>
                                        {reportingManagerForm.reportingManager === 'null' 
                                            ? 'Remove Current Reporting Manager' 
                                            : reportingManagerForm.reportingManager
                                        }
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            color="gray"
                            variant="outlined"
                            onClick={() => setOpenChangeReportingManagerDrawer(false)}
                            disabled={isUpdating}
                            className="px-6 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            color="blue"
                            onClick={handleReportingManagerSubmit}
                            disabled={isUpdating || !reportingManagerForm.reportingManager}
                            className="px-6 py-2"
                        >
                            {isUpdating ? 'Updating...' : 'Update Reporting Manager'}
                        </Button>
                    </div>
                </div>
            }
        />
    );
};

export default ChangeReportingManager;
