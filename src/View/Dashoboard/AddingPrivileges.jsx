import { Button, Radio, Typography } from '@material-tailwind/react';
import React, { useState } from 'react';
import { customPrivilegesData, customPrivilegesDataSub } from '../../services/EmpServices';
import employeesApi from '../../Model/Data/Employees/Employees';
import { showToast } from '../../Components/Toaster/Toaster';

const AddingPrivileges = (props) => {
    const { privilegesData, handleAddPrivilegesClose, empId, currentPrivileges, onUpdateSuccess, privilegeLevel, ipFilter } = props;

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

    const testingHandle = async() => {
        if (!empId) {
            showToast('Employee ID is missing', 'error');
            return;
        }

        // one_id_roll must be backend role ids: 14 = Employee, 13 = Admin, 24 = Branch_Admin, 25 = Department_Admin
        const ALLOWED_ONE_ID_ROLL = [13, 14, 24, 25];
        const oneIdRoll = parseInt(privilegeLevel, 10);
        if (!Number.isFinite(oneIdRoll) || !ALLOWED_ONE_ID_ROLL.includes(oneIdRoll)) {
            showToast('Invalid role selected. Use Employee, Admin, Branch_Admin, or Department_Admin.', 'error');
            return;
        }

        // Convert module IDs to integers
        const module = Object.keys(selectedValues).map(key => parseInt(key, 10));
        
        // Build privileges object with integer values
        const privilegesKeys = {};
        Object.keys(selectedValues).forEach(key => {
            const variableName = `privileges_${key}`;
            privilegesKeys[variableName] = parseInt(selectedValues[key], 10);
        });

        // Prepare API payload (aligns with assign_previlage: empId, one_id_roll, module, privileges_1..20, ip_filter)
        const apiData = {
            empId: parseInt(empId, 10),
            one_id_roll: oneIdRoll,
            module: module,
            ...privilegesKeys,
            ip_filter: ipFilter || ''
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
                <Button 
                    onClick={testingHandle} 
                    loading={loading}
                    variant="gradient" 
                    color="blue" 
                    className='capitalize text-[12px] px-4 py-2 font-medium'
                >
                    <span>{loading ? 'Updating...' : 'Update Privileges'}</span>
                </Button>
            </div>
        </div>
    );
};

export default AddingPrivileges;
