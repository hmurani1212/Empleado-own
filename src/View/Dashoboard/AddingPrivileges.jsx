import { Button, Radio, Typography } from '@material-tailwind/react';
import React, { useState } from 'react';
import { customPrivilegesData, customPrivilegesDataSub } from '../../services/EmpServices';
import employeesApi from '../../Model/Data/Employees/Employees';
import { showToast } from '../../Components/Toaster/Toaster';
import { PERMISSION_ID_BY_TAG } from '../../constants/permissionIds';

const AddingPrivileges = (props) => {
    const {
        privilegesData,
        handleAddPrivilegesClose,
        empId,
        currentPrivileges,
        onUpdateSuccess,
        privilegeLevel,
        role_name: roleNameProp = '',
        readOnly = false,
    } = props;

    const [loading, setLoading] = useState(false)

    // Initialize visibility for children based on current privileges or default selections
    const initialVisibleChildren = Object.values(privilegesData).reduce((acc, curr) => {
        if (curr.parent_id === '0') {
            // Show children if parent has Allow (1) or if no current privileges (default to true)
            const parentValue = currentPrivileges?.[curr.id];
            acc[curr.id] = parentValue !== undefined ? parentValue !== 0 : true;
        }
        return acc;
    }, {});

    // Initialize selected values from current privileges or default to "1"
    const initialSelectedValues = Object.values(privilegesData).reduce((acc, curr) => {
        const currentValue = currentPrivileges?.[curr.id];
        if (currentValue !== undefined) {
            // Convert integer to string for radio buttons
            acc[curr.id] = String(currentValue);
        } else {
            // Default values if no current privileges
            if (curr.parent_id === '0') {
                acc[curr.id] = "1"; // Default to "Allow" for parents
            } else {
                acc[curr.id] = "1"; // Default to "Full Access" for children
            }
        }
        return acc;
    }, {});

    // Store original values of children to restore them when parent is changed back to "Allow"
    const initialOriginalChildValues = Object.values(privilegesData).reduce((acc, curr) => {
        if (curr.parent_id !== '0') {
            const currentValue = currentPrivileges?.[curr.id];
            acc[curr.id] = currentValue !== undefined ? String(currentValue) : "1";
        }
        return acc;
    }, {});

    const [visibleChildren, setVisibleChildren] = useState(initialVisibleChildren);
    const [selectedValues, setSelectedValues] = useState(initialSelectedValues);
    const [originalChildValues, setOriginalChildValues] = useState(initialOriginalChildValues);

    const handleRadioChange = (id, value, isParentWithChildren) => {
        setSelectedValues(prevState => ({
            ...prevState,
            [id]: value
        }));

        if (isParentWithChildren) {
            if (value === "0") { // If "Deny" is selected for parent
                setSelectedValues(prevState => {
                    const updatedState = { ...prevState };
                    if (organizedData.children[id]) {
                        organizedData.children[id].forEach(child => {
                            updatedState[child.id] = "0"; // Set all children to "Deny"
                        });
                    }
                    return updatedState;
                });
                setVisibleChildren(prevState => ({
                    ...prevState,
                    [id]: false // Hide children when parent is "Deny"
                }));
            } else { // If "Allow" is selected for parent
                setSelectedValues(prevState => {
                    const updatedState = { ...prevState };
                    if (organizedData.children[id]) {
                        organizedData.children[id].forEach(child => {
                            updatedState[child.id] = originalChildValues[child.id]; // Restore original child values
                        });
                    }
                    return updatedState;
                });
                setVisibleChildren(prevState => ({
                    ...prevState,
                    [id]: true // Show children when parent is "Allow"
                }));
            }
        }
    };

    const organizedData = Object.values(privilegesData).reduce((acc, curr) => {
        if (curr.parent_id === '0') {
            acc.parents.push(curr);
        } else {
            acc.children[curr.parent_id] = acc.children[curr.parent_id] || [];
            acc.children[curr.parent_id].push(curr);
        }
        return acc;
    }, { parents: [], children: {} });

    const handleUpdatePrivileges = async () => {
        if (readOnly) return;
        if (!empId) {
            showToast('Employee ID is missing', 'error');
            return;
        }

        // Custom / non–built-in roles use full module payload; one_id_roll is the role id from OneID roles API.
        const oneIdRoll = parseInt(privilegeLevel, 10);
        if (!Number.isFinite(oneIdRoll) || oneIdRoll <= 0) {
            showToast('Invalid role selected.', 'error');
            return;
        }

        // Map UI module selections to backend permission IDs (from ids_permission.txt)
        // Value mapping: "1"=Full, "2"=Read Only, "0"=No Access
        const MODULE_PERMISSION_TAGS = {
            1: { full: 'EMPLOYEE_FULL_ACCESS', read: 'EMPLOYEE_READ_ONLY', none: 'EMPLOYEE_NO_ACCESS' },
            2: { full: 'DEPARTMENT_FULL_ACCESS', read: 'DEPARTMENT_READ_ONLY', none: 'DEPARTMENT_NO_ACCESS' },
            3: { full: 'HR_POLICIES_FULL_ACCESS', read: 'HR_POLICIES_READ_ONLY', none: 'HR_POLICIES_NO_ACCESS' },

            // Payroll children (Payroll parent is 4 = Allow/Deny only)
            5: { full: 'PAYROLL_SALARY_TEMPLATES_FULL_ACCESS', read: 'PAYROLL_SALARY_TEMPLATES_READ_ONLY', none: 'PAYROLL_SALARY_TEMPLATES_NO_ACCESS' },
            6: { full: 'PAYROLL_EMPLOYEES_SALARY_FULL_ACCESS', read: 'PAYROLL_EMPLOYEES_SALARY_READ_ONLY', none: 'PAYROLL_EMPLOYEES_SALARY_NO_ACCESS' },
            7: { full: 'PAYROLL_PAYSLIPS_MANAGEMENT_FULL_ACCESS', read: 'PAYROLL_PAYSLIPS_MANAGEMENT_READ_ONLY', none: 'PAYROLL_PAYSLIPS_MANAGEMENT_NO_ACCESS' },
            8: { full: 'PAYROLL_REPORTS_EXPORT_FULL_ACCESS', read: 'PAYROLL_REPORTS_EXPORT_READ_ONLY', none: 'PAYROLL_REPORTS_EXPORT_NO_ACCESS' },

            9: { full: 'NOTICES_FULL_ACCESS', read: 'NOTICES_READ_ONLY', none: 'NOTICES_NO_ACCESS' },
            10: { full: 'TASKS_FULL_ACCESS', read: 'TASKS_READ_ONLY', none: 'TASKS_NO_ACCESS' },

            // Attendance children (Attendance parent is 11 = Allow/Deny only)
            12: { full: 'ATTENDANCE_DATA_FULL_ACCESS', read: 'ATTENDANCE_DATA_READ_ONLY', none: 'ATTENDANCE_DATA_NO_ACCESS' },
            13: { full: 'ATTENDANCE_EXPORT_FULL_ACCESS', read: 'ATTENDANCE_EXPORT_READ_ONLY', none: 'ATTENDANCE_EXPORT_NO_ACCESS' },
            14: { full: 'BRANCH_WISE_ATTENDANCE_FULL_ACCESS', read: 'BRANCH_WISE_ATTENDANCE_READ_ONLY', none: 'BRANCH_WISE_ATTENDANCE_NO_ACCESS' },
            15: { full: 'ATTENDANCE_RAW_LOGS_FULL_ACCESS', read: 'ATTENDANCE_RAW_LOGS_READ_ONLY', none: 'ATTENDANCE_RAW_LOGS_NO_ACCESS' },

            16: { full: 'SHIFT_PLANNER_FULL_ACCESS', read: 'SHIFT_PLANNER_READ_ONLY', none: 'SHIFT_PLANNER_NO_ACCESS' },
            17: { full: 'APPLICATIONS_FULL_ACCESS', read: 'APPLICATIONS_READ_ONLY', none: 'APPLICATIONS_NO_ACCESS' },
            18: { full: 'LEAVE_PLANNER_FULL_ACCESS', read: 'LEAVE_PLANNER_READ_ONLY', none: 'LEAVE_PLANNER_NO_ACCESS' },
            19: { full: 'HIRE2_0_FULL_ACCESS', read: 'HIRE2_0_READ_ONLY', none: 'HIRE2_0_NO_ACCESS' },
            20: { full: 'FORMSANDAPPROVE_FULL_ACCESS', read: 'FORMSANDAPPROVE_READ_ONLY', none: 'FORMSANDAPPROVE_NO_ACCESS' },
        };

        const permissionIds = [];
        const missingMappings = [];

        Object.entries(MODULE_PERMISSION_TAGS).forEach(([moduleIdStr, tags]) => {
            const moduleId = Number(moduleIdStr);
            const val = selectedValues?.[moduleId] ?? selectedValues?.[String(moduleId)];
            const v = String(val ?? '1');
            const tag =
                v === '1' ? tags.full :
                    v === '2' ? tags.read :
                        tags.none;
            const id = PERMISSION_ID_BY_TAG[tag];
            if (!id) {
                missingMappings.push(`${moduleId}:${tag}`);
                return;
            }
            permissionIds.push(id);
        });

        if (missingMappings.length) {
            showToast(`Missing permission-id mapping for: ${missingMappings.join(', ')}`, 'error');
            return;
        }

        // assign_previlage: empId, one_id_roll, role_name, module (permission ids only)
        const apiData = {
            empId: parseInt(empId, 10),
            one_id_roll: oneIdRoll,
            role_name: String(roleNameProp || '').trim(),
            module: permissionIds,
        };

        try{
            setLoading(true);
            const response = await employeesApi.assignEmployeePrivilege(apiData);
            const responseData = response.data;
            
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                showToast('Privileges Updated Successfully', 'success');
                
                // Call onUpdateSuccess callback to refresh employee data
                if (onUpdateSuccess) {
                    onUpdateSuccess();
                }
                
                handleAddPrivilegesClose();
            } else {
                const error = responseData.ERROR_DESCRIPTION || 'Failed to update privileges';
                showToast(error, 'error');
            }
        } catch(err) {
            console.error('Error updating privileges:', err);
            showToast('Failed to update privileges', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='space-y-3' style={{ height: 'calc(100vh - 120px)' }}>
            {readOnly && (
                <Typography variant="small" className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    View only — permissions for role <span className="font-semibold">{roleNameProp || '—'}</span>. Close when done.
                </Typography>
            )}
            <div className='space-y-4'>
                {organizedData.parents.map(parent => (
                    <div key={parent.id} className='border-b-2 border-gray-200 pb-4'>
                        <div className='space-y-2'>
                            <div>
                                <span>{parent.nice_name}</span>
                                <div>
                                    {organizedData.children[parent.id] ? (
                                        customPrivilegesDataSub.map(pData => (
                                            <Radio
                                                label={
                                                    <Typography
                                                        color="blue-gray"
                                                        className="text-[12px]"
                                                    >{pData.title}</Typography>
                                                }
                                                key={pData.id}
                                                color='blue'
                                                size="sm"
                                                name={`access-${parent.id}`}
                                                value={pData.value}
                                                checked={selectedValues[parent.id] === pData.value} // Controlled component
                                                onChange={() => handleRadioChange(parent.id, pData.value, true)}
                                                disabled={readOnly}
                                            />
                                        ))
                                    ) : (
                                        customPrivilegesData.map(pData => (
                                            <Radio
                                                label={
                                                    <Typography
                                                        color="blue-gray"
                                                        className="text-[12px]"
                                                    >{pData.title}</Typography>
                                                }
                                                key={pData.id}
                                                color='blue'
                                                size="sm"
                                                name={`access-${parent.id}`}
                                                value={pData.value}
                                                checked={selectedValues[parent.id] === pData.value} // Controlled component
                                                onChange={() => handleRadioChange(parent.id, pData.value, false)}
                                                disabled={readOnly}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                            {visibleChildren[parent.id] && organizedData.children[parent.id]?.map(child => (
                                <div key={child.id} className='pl-6'>
                                    <span>{child.nice_name}</span>
                                    <div>
                                        {customPrivilegesData.map(pData => (
                                            <Radio
                                                label={
                                                    <Typography
                                                        color="blue-gray"
                                                        className="text-[12px]"
                                                    >{pData.title}</Typography>
                                                }
                                                key={pData.id}
                                                color='blue'
                                                size="sm"
                                                name={`access-${child.id}`}
                                                value={pData.value}
                                                checked={selectedValues[child.id] === pData.value} // Controlled component
                                                onChange={() => handleRadioChange(child.id, pData.value, false)}
                                                disabled={readOnly}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className='flex justify-end gap-3 py-2'>
                <Button 
                    onClick={handleAddPrivilegesClose}
                    variant="outlined"
                    color="gray"
                    className='capitalize text-[12px] px-4 py-2 font-medium'
                >
                    <span>Close</span>
                </Button>
                {!readOnly && (
                <Button 
                    onClick={handleUpdatePrivileges} 
                    loading={loading}
                    variant="gradient" 
                    color="blue" 
                    className='capitalize text-[12px] px-4 py-2 font-medium'
                >
                    <span>{loading ? 'Updating...' : 'Update Privileges'}</span>
                </Button>
                )}
            </div>
        </div>
    );
};

export default AddingPrivileges;
