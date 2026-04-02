import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Input, Select, Option, Textarea, Typography } from '@material-tailwind/react';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import employeesApi from '../../Model/Data/Employees/Employees';
import { showToast } from '../../Components/Toaster/Toaster';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices';
import { officialInfoTage } from '../../services/EmpServices';
import { getUserData } from '../../Authentication/jwt_decode';

const EmployeeOfficialInfo = ({
    employeeData,
    employeeId,
    openOfficialInfoDrawer,
    setOpenOfficialInfoDrawer,
    isUpdating,
    setIsUpdating,
    setEmployeeData,
    onRefreshProfile
}) => {
    // Use the same hook as AddEditPRC
    const {
        empBranches,
        fetchingAllBranches,
        gettingSubBranches,
        dept_subDept,
        designations,
        gettingDesignation,
        clearDesignations
    } = useEmployees();

    const [officialInfoForm, setOfficialInfoForm] = useState({
        emp_id: '',
        employment_status: '',
        branch: null,
        department: null,
        designation: null,
        tag: null,
        tag_other: '',
        join_date: '',
        eobi: '0',
        eobi_number: '',
        provident_fund: '0',
        provident_fund_initial_amount: '',
        social_security: '0',
        social_sec_number: '',
        insurance: '0',
        health_benefits: '0',
        job_description: ''
    });

    useEffect(() => {
        console.log("officialInfoForm",officialInfoForm);
    })

    const [tagsList] = useState([...officialInfoTage]);

    // Use ref to track if data has been fetched to prevent duplicate calls
    const hasFetchedDataRef = useRef(false);
    const previousShowStateRef = useRef(false);
    const lastFetchedBranchIdRef = useRef(null);
    const lastFetchedDeptIdRef = useRef(null);
    const hasPopulatedFormRef = useRef(false);
    const lastEmployeeIdRef = useRef(null);

    // Flatten departments function (same as in OfficialEmpProfile.js)
    const flattenOptions = (data) => {
        let flattenedOptions = [];
        if (Array.isArray(data?.departments)) {
            data.departments.forEach((dept) => {
                flattenedOptions.push({ label: dept.name, value: dept.id, isParent: true });
                if (dept.children?.length > 0) {
                    dept.children.forEach((subDept) => {
                        flattenedOptions.push({ label: subDept.name, value: subDept.id, isChild: true });
                    });
                }
            });
        } else if (Array.isArray(data)) {
            data.forEach((dept) => {
                flattenedOptions.push({ label: dept.name, value: dept.id, isParent: true });
                if (dept.children?.length > 0) {
                    dept.children.forEach((subDept) => {
                        flattenedOptions.push({ label: subDept.name, value: subDept.id, isChild: true });
                    });
                }
            });
        }
        return flattenedOptions;
    };

    // Fetch branches when drawer opens (same pattern as AddEditPRC)
    useEffect(() => {
        const modalJustOpened = openOfficialInfoDrawer && !previousShowStateRef.current;

        if (modalJustOpened && !hasFetchedDataRef.current) {
            // Fetch branches only when modal opens for the first time
            fetchingAllBranches();
            hasFetchedDataRef.current = true;
        }

        // Update previous show state
        previousShowStateRef.current = openOfficialInfoDrawer;

        // Reset fetch flag when modal closes
        if (!openOfficialInfoDrawer) {
            hasFetchedDataRef.current = false;
            lastFetchedBranchIdRef.current = null;
            lastFetchedDeptIdRef.current = null;
            hasPopulatedFormRef.current = false;
            lastEmployeeIdRef.current = null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openOfficialInfoDrawer]);

    // Populate form when employee data changes (only when drawer opens or employeeId changes)
    useEffect(() => {
        if (!openOfficialInfoDrawer || !employeeData || !employeeId) return;

        // Only populate if this is a different employee or form hasn't been populated yet
        const shouldPopulate = lastEmployeeIdRef.current !== employeeId || !hasPopulatedFormRef.current;

        if (shouldPopulate) {
            const officialInfo = employeeData?.Official_Info || {};
            const branchId = officialInfo.branch?.id || employeeData?.employee?.branch?.id || null;
            const deptId = officialInfo.department?.id || employeeData?.employee?.department?.id || null;

            const tagId = officialInfo.tage?.[0]?.id || null;
            setOfficialInfoForm({
                emp_id: officialInfo.emp_id || employeeData?.emp_id?.id || '',
                employment_status: officialInfo.employment_status || 'Permanent',
                branch: branchId,
                department: deptId,
                designation: officialInfo.designation || employeeData?.designationObj?.id || null,
                tag: tagId,
                tag_other: tagId === 'other' ? (officialInfo.tage?.[0]?.tag_name || '') : '',
                join_date: officialInfo.join_date ? formatTimestampToDate(officialInfo.join_date) : '',
                eobi: officialInfo.eobi || '0',
                eobi_number: officialInfo.eobi_number || '',
                provident_fund: officialInfo.provident_fund || '0',
                provident_fund_initial_amount:
                    officialInfo.provident_fund_initial_amount.emp_contribution ||
                    officialInfo.prident_fund_amount ||
                    officialInfo.provident_fund_amount ||
                    employeeData?.prident_fund_amount ||
                    '',
                social_security: officialInfo.social_security || '0',
                social_sec_number: officialInfo.social_sec_number || '',
                insurance: officialInfo.insurance || '0',
                health_benefits: officialInfo.health_benefits || '0',
                job_description: officialInfo.job_description || ''
            });

            // Load departments when branch is set
            if (branchId && branchId !== lastFetchedBranchIdRef.current) {
                lastFetchedBranchIdRef.current = branchId;
                gettingSubBranches(branchId);
            }

            // Load designations only when department is set (not by branch alone)
            if (deptId && deptId !== lastFetchedDeptIdRef.current) {
                lastFetchedDeptIdRef.current = deptId;
                gettingDesignation(deptId, false); // false = dept_id for designation API
            }

            hasPopulatedFormRef.current = true;
            lastEmployeeIdRef.current = employeeId;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openOfficialInfoDrawer, employeeId]);

    const formatTimestampToDate = (timestamp) => {
        if (!timestamp || timestamp === 0) return '';
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Memoize branch options to prevent recreation on every render
    const branchOptions = useMemo(() => {
        return empBranches?.map(branch => ({
            value: branch.id,
            label: branch.branch_name
        })) || [];
    }, [empBranches]);

    // Memoize department options to prevent recreation on every render
    const departmentOptions = useMemo(() => {
        return flattenOptions(dept_subDept);
    }, [dept_subDept]);

    // Memoize designation options to prevent recreation on every render
    const designationOptions = useMemo(() => {
        return designations?.map(desig => ({
            value: desig.id,
            label: desig.title
        })) || [];
    }, [designations]);

    // Memoize tag options to prevent recreation on every render
    const tagOptions = useMemo(() => {
        return tagsList.map(tag => ({
            value: tag.id,
            label: tag.tag_name
        }));
    }, [tagsList]);

    // Helper function to get selected branch value object (must return exact object from options)
    const getSelectedBranchValue = () => {
        if (!officialInfoForm.branch || branchOptions.length === 0) return null;
        return branchOptions.find(opt => opt.value === officialInfoForm.branch) || null;
    };

    // Helper function to get selected department value object (must return exact object from options)
    const getSelectedDepartmentValue = () => {
        if (!officialInfoForm.department || departmentOptions.length === 0) return null;
        return departmentOptions.find(d => d.value === officialInfoForm.department) || null;
    };

    // Helper function to get selected designation value object (must return exact object from options)
    const getSelectedDesignationValue = () => {
        if (!officialInfoForm.designation || designationOptions.length === 0) return null;
        return designationOptions.find(d => d.value === officialInfoForm.designation) || null;
    };

    // Helper function to get selected tag value object (must return exact object from options)
    const getSelectedTagValue = () => {
        if (!officialInfoForm.tag || tagOptions.length === 0) return null;
        return tagOptions.find(t => t.value === officialInfoForm.tag) || null;
    };

    const handleFormChange = async (field, value) => {
        setOfficialInfoForm(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'tag' && value !== 'other') {
                next.tag_other = '';
            }
            if (field === 'provident_fund' && value !== '1') {
                next.provident_fund_initial_amount = '';
            }
            return next;
        });

        // When branch changes, fetch departments and reset department/designation (designations load after department is selected)
        if (field === 'branch') {
            const branchValue = value === 0 || value === '0' ? 0 : value;
            if (branchValue !== undefined && branchValue !== null && lastFetchedBranchIdRef.current !== branchValue) {
                lastFetchedBranchIdRef.current = branchValue;
                lastFetchedDeptIdRef.current = null;
                await gettingSubBranches(branchValue);
                clearDesignations();
                // Reset department and designation when branch changes
                setOfficialInfoForm(prev => ({
                    ...prev,
                    department: null,
                    designation: null
                }));
            }
        }

        // When department changes, fetch designations and reset designation
        if (field === 'department') {
            const deptValue = value === 0 || value === '0' ? 0 : value;
            if (deptValue !== undefined && deptValue !== null && deptValue !== 0 && lastFetchedDeptIdRef.current !== deptValue) {
                lastFetchedDeptIdRef.current = deptValue;
                gettingDesignation(deptValue, false); // false = dept_id
            }
            // Reset designation when department changes
            setOfficialInfoForm(prev => ({
                ...prev,
                designation: null
            }));
        }
    };

    const getValue = (value) => {
        if (value === null || value === undefined || value === '') return '';
        if (typeof value === 'object' && value.value !== undefined) return value.value;
        return value;
    };

    /** Return designation id for API (backend expects id, not name). */
    const getDesignationIdForApi = () => {
        const d = officialInfoForm.designation;
        if (d === null || d === undefined || d === '') return '';
        const idFromForm = getValue(d);
        const foundById = designationOptions.find(opt => opt.value === idFromForm || String(opt.value) === String(idFromForm));
        if (foundById) return foundById.value;
        const foundByLabel = designationOptions.find(opt => (opt.label && String(opt.label) === String(idFromForm)));
        if (foundByLabel) return foundByLabel.value;
        return idFromForm;
    };

    const handleSubmit = async (id) => {
        try {
            setIsUpdating(true);
            console.log('what is the id here', employeeData?.Official_Info?.id);
            // Get employee record ID
            // const employeeRecordId = employeeData?.Official_Info?.id || employeeData?.employee?.id || employeeId;

            const apiData = {
                id: employeeData?.Official_Info?.id,
                org_id: getUserData()?.org_id || 0,
                emp_id: officialInfoForm.emp_id,
                employment_status: getValue(officialInfoForm.employment_status),
                emp_branch: getValue(officialInfoForm.branch),
                emp_deptt: getValue(officialInfoForm.department),
                designation: getDesignationIdForApi(),
                emp_tag: officialInfoForm.tag === 'other' ? (officialInfoForm.tag_other || '').trim() : getValue(officialInfoForm.tag),
                new_emp_tag: officialInfoForm.tag === 'other' ? (officialInfoForm.tag_other || '').trim() : '',
                join_date: officialInfoForm.join_date || '',
                eobi: officialInfoForm.eobi,
                eobi_number: officialInfoForm.eobi === '1' ? officialInfoForm.eobi_number : '',
                provident_fund: officialInfoForm.provident_fund,
                provident_fund_initial_amount: officialInfoForm.provident_fund === '1'
                    ? officialInfoForm.provident_fund_initial_amount
                    : '',
                provident_fund_amount: officialInfoForm.provident_fund === '1'
                    ? officialInfoForm.provident_fund_initial_amount
                    : '',
                prident_fund_amount: officialInfoForm.provident_fund === '1'
                    ? officialInfoForm.provident_fund_initial_amount
                    : '',
                social_security: officialInfoForm.social_security,
                social_sec_number: officialInfoForm.social_security === '1' ? officialInfoForm.social_sec_number : '',
                insurance: officialInfoForm.insurance,
                health_benefits: officialInfoForm.health_benefits,
                job_description: officialInfoForm.job_description || ''
            };

            const response = await employeesApi.updateEmployeeProfile(apiData);
            const responseData = response.data;

            if (response.status === 200 && (responseData.STATUS === 'SUCCESSFUL' || responseData.status === 'success')) {
                showToast('Official information updated successfully', 'success');

                // Fetch updated profile from API so tag (e.g. "Other" custom name) and all fields are in sync
                if (onRefreshProfile && typeof onRefreshProfile === 'function') {
                    try {
                        const refreshedData = await onRefreshProfile();
                        if (refreshedData?.DB_DATA && setEmployeeData) {
                            setEmployeeData(refreshedData.DB_DATA);
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing employee profile after update:', refreshError);
                        if (setEmployeeData) {
                            setEmployeeData(prevData => ({
                                ...prevData,
                                Official_Info: { ...prevData.Official_Info, ...apiData }
                            }));
                        }
                    }
                } else if (setEmployeeData) {
                    setEmployeeData(prevData => ({
                        ...prevData,
                        Official_Info: { ...prevData.Official_Info, ...apiData }
                    }));
                }

                setOpenOfficialInfoDrawer(false);
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to update official information', 'error');
            }
        } catch (error) {
            console.error('Error updating official info:', error);
            showToast('Failed to update official information', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <PortalDrawer
            open={openOfficialInfoDrawer}
            closeDrawer={() => setOpenOfficialInfoDrawer(false)}
            title="Update Official Information"
            widthSize={800}
            compo={
                <div className="py-6 space-y-6">
                    <>
                        {/* Employee ID */}
                        <div>
                            <Input
                                className="!h-11 !rounded-6"
                                color="blue"
                                label="Employee ID"
                                value={officialInfoForm.emp_id}
                                onChange={(e) => handleFormChange('emp_id', e.target.value)}
                                required
                            />
                        </div>

                        {/* Employment Status and Join Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Select
                                    color="blue"
                                    label="Employment Status"
                                    value={officialInfoForm.employment_status}
                                    onChange={(val) => handleFormChange('employment_status', val)}
                                >
                                    <Option value="Permanent">Permanent</Option>
                                    <Option value="Contract">Contract</Option>
                                    <Option value="Trainee">Trainee</Option>
                                    <Option value="Probation">Probation</Option>
                                </Select>
                            </div>
                            <div>
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="Join Date"
                                    type="date"
                                    value={officialInfoForm.join_date}
                                    onChange={(e) => handleFormChange('join_date', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Branch, Department, Designation */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <CustomSelect
                                    placeHolderTitle="Branch"
                                    value={getSelectedBranchValue()}
                                    options={branchOptions}
                                    onChangeHandler={(selected) => {
                                        handleFormChange('branch', selected?.value || null);
                                    }}
                                    customStyles={false}
                                    isSearchable={true}
                                    isClearable={false}
                                />
                            </div>
                            <div>
                                <CustomSelect
                                    placeHolderTitle="Department"
                                    value={getSelectedDepartmentValue()}
                                    options={departmentOptions}
                                    onChangeHandler={(selected) => {
                                        handleFormChange('department', selected?.value || null);
                                    }}
                                    customStyles={true}
                                    isSearchable={true}
                                    isClearable={false}
                                />
                            </div>
                            <div>
                                <CustomSelect
                                    placeHolderTitle="Designation"
                                    value={getSelectedDesignationValue()}
                                    options={designationOptions}
                                    onChangeHandler={(selected) => {
                                        handleFormChange('designation', selected?.value || null);
                                    }}
                                    customStyles={false}
                                    isSearchable={true}
                                    isClearable={false}
                                />
                            </div>
                        </div>

                        {/* EOBI */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <Typography variant="small" className="font-medium text-gray-700">
                                    EOBI
                                </Typography>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={officialInfoForm.eobi === '1' ? 'filled' : 'outlined'}
                                        color={officialInfoForm.eobi === '1' ? 'green' : 'gray'}
                                        onClick={() => handleFormChange('eobi', '1')}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={officialInfoForm.eobi === '0' ? 'filled' : 'outlined'}
                                        color={officialInfoForm.eobi === '0' ? 'red' : 'gray'}
                                        onClick={() => handleFormChange('eobi', '0')}
                                    >
                                        No
                                    </Button>
                                </div>
                            </div>
                            {officialInfoForm.eobi === '1' && (
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="EOBI Number"
                                    value={officialInfoForm.eobi_number}
                                    onChange={(e) => handleFormChange('eobi_number', e.target.value)}
                                />
                            )}
                        </div>

                        {/* Provident Fund */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <Typography variant="small" className="font-medium text-gray-700">
                                    Provident Fund
                                </Typography>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={officialInfoForm.provident_fund === '1' ? 'filled' : 'outlined'}
                                        color={officialInfoForm.provident_fund === '1' ? 'green' : 'gray'}
                                        onClick={() => handleFormChange('provident_fund', '1')}
                                    >
                                        Available
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={officialInfoForm.provident_fund === '0' ? 'filled' : 'outlined'}
                                        color={officialInfoForm.provident_fund === '0' ? 'red' : 'gray'}
                                        onClick={() => handleFormChange('provident_fund', '0')}
                                    >
                                        Not Available
                                    </Button>
                                </div>
                            </div>
                            {officialInfoForm.provident_fund === '1' && (
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="Provident Fund Initial Amount"
                                    type="number"
                                    min="0"
                                    value={officialInfoForm.provident_fund_initial_amount}
                                    onChange={(e) => handleFormChange('provident_fund_initial_amount', e.target.value)}
                                />
                            )}
                        </div>

                        {/* Social Security */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <Typography variant="small" className="font-medium text-gray-700">
                                    Social Security
                                </Typography>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={officialInfoForm.social_security === '1' ? 'filled' : 'outlined'}
                                        color={officialInfoForm.social_security === '1' ? 'green' : 'gray'}
                                        onClick={() => handleFormChange('social_security', '1')}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={officialInfoForm.social_security === '0' ? 'filled' : 'outlined'}
                                        color={officialInfoForm.social_security === '0' ? 'red' : 'gray'}
                                        onClick={() => handleFormChange('social_security', '0')}
                                    >
                                        No
                                    </Button>
                                </div>
                            </div>
                            {officialInfoForm.social_security === '1' && (
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="Social Security Number"
                                    value={officialInfoForm.social_sec_number}
                                    onChange={(e) => handleFormChange('social_sec_number', e.target.value)}
                                />
                            )}
                        </div>

                        {/* Insurance and Health Benefits */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-4">
                                <Typography variant="small" className="font-medium text-gray-700">
                                    Insurance
                                </Typography>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={officialInfoForm.insurance === '1' ? 'filled' : 'outlined'}
                                        color={officialInfoForm.insurance === '1' ? 'green' : 'gray'}
                                        onClick={() => handleFormChange('insurance', '1')}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={officialInfoForm.insurance === '0' ? 'filled' : 'outlined'}
                                        color={officialInfoForm.insurance === '0' ? 'red' : 'gray'}
                                        onClick={() => handleFormChange('insurance', '0')}
                                    >
                                        No
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Typography variant="small" className="font-medium text-gray-700">
                                    Health Benefits
                                </Typography>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={officialInfoForm.health_benefits === '1' ? 'filled' : 'outlined'}
                                        color={officialInfoForm.health_benefits === '1' ? 'green' : 'gray'}
                                        onClick={() => handleFormChange('health_benefits', '1')}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={officialInfoForm.health_benefits === '0' ? 'filled' : 'outlined'}
                                        color={officialInfoForm.health_benefits === '0' ? 'red' : 'gray'}
                                        onClick={() => handleFormChange('health_benefits', '0')}
                                    >
                                        No
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div>
                            <Textarea
                                color="blue"
                                label="Job Description"
                                value={officialInfoForm.job_description}
                                onChange={(e) => handleFormChange('job_description', e.target.value)}
                                rows={4}
                            />
                        </div>

                        {/* Tag */}
                        <div className="space-y-2">
                            <CustomSelect
                                placeHolderTitle="Tag"
                                value={getSelectedTagValue()}
                                options={tagOptions}
                                onChangeHandler={(selected) => {
                                    handleFormChange('tag', selected?.value ?? null);
                                }}
                                customStyles={false}
                                isSearchable={true}
                                isClearable={false}
                            />
                            {officialInfoForm.tag === 'other' && (
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="Specify other (enter your tag)"
                                    placeholder="Enter your tag"
                                    value={officialInfoForm.tag_other}
                                    onChange={(e) => handleFormChange('tag_other', e.target.value)}
                                />
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-start pt-4">
                            <Button
                                color="blue"
                                onClick={() => handleSubmit(officialInfoForm)}
                                disabled={isUpdating}
                                className="px-6 py-2"
                            >
                                {isUpdating ? 'Updating...' : 'Update'}
                            </Button>
                        </div>
                    </>
                </div>
            }
        />
    );
};

export default EmployeeOfficialInfo;
