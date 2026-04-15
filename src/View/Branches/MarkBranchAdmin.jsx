import React, { useMemo, useState } from 'react'
import useBranches2 from '../../ViewModel/Brach2ViewModel/BranchesServices2'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { buildBranchAdminEmployeeOptions } from '../../utils/branchEmployeeSelect'
import { Button, IconButton, Typography } from '@material-tailwind/react'
import { IoClose } from "react-icons/io5";
import { CiEdit } from 'react-icons/ci';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import { BsTrash2Fill } from 'react-icons/bs';
import { FaTrash } from 'react-icons/fa6';

const MarkBranchAdmin = (props) => {
    const { empIdBranchAdmin, onChangeEmpBranc, grantRole,handleGrantRoleClose,
        handleAssingRole,
        brnachAdminData,
        handleDeleteBranchAdmin,
        deleteAdminConfirm,
        confirmAdminDeleteHandler,
        showToast,
        getAdministrativePermissions,
        assignAdministrativePermission,
        removeAdministrativePermission,
        setEmpIdBranchAdmin,
        setRoleGrant,
        settingBranchAdminData,
        closeDrawer
    } = useBranches2()
    // const {branchData} = props



    const [deleteOption, setDeleteOption] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState({})

    const showDeleteOption = ()=>{
        setDeleteOption(!deleteOption)
    }

    const employeeSelectOptions = useMemo(
        () => buildBranchAdminEmployeeOptions(brnachAdminData),
        [brnachAdminData]
    );

    const showNoEmployeesLine = employeeSelectOptions.length === 0;

  return (
    <>
    <div className='flex flex-col space-y-6 p-6'>
        <div>
            {showNoEmployeesLine && (
                <Typography
                    variant="small"
                    className="mb-2 font-semibold text-amber-900 font-poppins"
                >
                    No employees found on this branch
                </Typography>
            )}
            <Typography variant="small" className="mb-2 font-medium font-poppins text-gray-700">
                Select Employee to mark as Branch Admin
            </Typography>
            {brnachAdminData?.employeesFetchError && (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 font-poppins">
                    {brnachAdminData.employeesFetchError}
                </div>
            )}
            <div className="w-full">
                <CustomSelect
                placeHolderTitle='Select Employee'
                value={empIdBranchAdmin?.emp_Id}
                options={employeeSelectOptions}
                onChangeHandler={(selectedOption, e) => onChangeEmpBranc(selectedOption, 'emp_Id', e)}
                customStyles={false}
                noOptionsMessage={() => 'No employees found on this branch'}
                /> 
            </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-start gap-2">
                <div className="text-blue-500 mt-0.5">ℹ️</div>
                <div>
                    <Typography variant="small" className='font-semibold text-blue-900 font-poppins'>Note:</Typography>
                    <Typography variant="small" className="text-blue-800 font-poppins mt-1">
                        If you want to make branch admin with some restrictions, kindly go to: <br/>
                        <span className="font-medium">Employee &gt; View &gt; Profile &gt; Account Privileges</span>
                    </Typography>
                </div>
            </div>
        </div>

        <div>
            {brnachAdminData?.BRANCH_ADMIN_DATA?.length > 0 && (
                <div className="mb-3 text-sm text-gray-600 font-poppins">
                    <Typography variant="small" color="blue-gray" className="font-medium font-poppins">
                        Total Existing Branch Admins: <span className="font-bold">{brnachAdminData.BRANCH_ADMIN_DATA.length}</span>
                    </Typography>
                </div>
            )}
            
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full min-w-max text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="border-b border-gray-100 p-4">
                                <Typography variant='small' color='blue-gray' className="font-semibold leading-none opacity-70 capitalize font-poppins">
                                    Already Assigned Branch Admin
                                </Typography>
                            </th>
                            <th className="border-b border-gray-100 p-4 w-20 text-right">
                                <Button 
                                    variant="text" 
                                    size="sm" 
                                    className="p-1 min-w-0 hover:bg-blue-50 cursor-pointer text-blue-500 font-medium normal-case flex items-center gap-1 ml-auto"
                                    onClick={showDeleteOption}
                                >
                                    {deleteOption ? 'Done' : 'Edit'}
                                </Button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {brnachAdminData?.BRANCH_ADMIN_DATA?.length > 0 ? (
                            brnachAdminData?.BRANCH_ADMIN_DATA?.map((ele, index) => (
                                <tr key={ele.employee_id || ele.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                {(ele.employee_name || ele.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <Typography variant="small" color="blue-gray" className="font-medium font-poppins">
                                                {ele.employee_name || ele.name}
                                            </Typography>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {deleteOption && (
                                            <IconButton 
                                                variant="text"
                                                color="red" 
                                                className='w-8 h-8 rounded-full hover:bg-red-50' 
                                                disabled={loadingDelete[ele.employee_id || ele.id]}
                                                onClick={async () => {
                                                    const empId = ele.employee_id || ele.id;
                                                    setLoadingDelete(prev => ({ ...prev, [empId]: true }));
                                                    
                                                    try {
                                                        const success = await removeAdministrativePermission(empId);
                                                        if (success) {
                                                            // Remove employee from local state immediately
                                                            const updatedAdminData = {
                                                                ...brnachAdminData,
                                                                BRANCH_ADMIN_DATA: brnachAdminData.BRANCH_ADMIN_DATA.filter(
                                                                    admin => (admin.employee_id || admin.id) !== empId
                                                                )
                                                            };
                                                            // Update the local state to remove the deleted employee
                                                            settingBranchAdminData(updatedAdminData);
                                                            // Show success message
                                                            showToast('Branch admin removed successfully', 'success');
                                                        }
                                                    } catch (error) {
                                                        console.log('Error removing branch admin:', error);
                                                    } finally {
                                                        setLoadingDelete(prev => ({ ...prev, [empId]: false }));
                                                    }
                                                }}
                                            >
                                                {loadingDelete[ele.employee_id || ele.id] ? (
                                                    <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <FaTrash size={14} /> 
                                                )}
                                            </IconButton>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className='p-8 text-center text-gray-400'>
                                    <Typography variant="small" className="font-normal font-poppins">
                                        No Branch Admin assigned yet
                                    </Typography>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100 mt-auto">
            <Button
                variant="text"
                color="gray"
                onClick={closeDrawer}
                className="mr-2 font-poppins normal-case cursor-pointer"
            >
                Cancel
            </Button>
            <Button
                className="capitalize font-medium bg-bgBlue cursor-pointer shadow-blue-500/20 px-6 py-2 rounded-lg font-poppins"
                disabled={empIdBranchAdmin?.loading}
                onClick={async () => {
                    if (empIdBranchAdmin?.emp_Id) {
                        // Set grantRole to true to show confirmation dialog
                        setRoleGrant(true);
                    } else {
                        showToast('Please select an employee first', 'error');
                    }
                }}
            >
                {empIdBranchAdmin?.loading ? 'Submitting...' : 'Submit'}
            </Button>
        </div>
    </div>


    {grantRole && 
        <ConfirmationDialog 
            openDialog ={ grantRole }
            handleOpen = {handleGrantRoleClose}
            title = {deleteAdminConfirm ? 'Remove Employee as Branch Admin' :'Mark Employee as Branch Admin'}
            message={deleteAdminConfirm ? 'Confirm Button To Delete Role From Employee' : 'Confirm Button To Assign Role'}
            handleConfirm = {deleteAdminConfirm ? confirmAdminDeleteHandler : async () => {
                try {
                    // Set loading state
                    setEmpIdBranchAdmin(prev => ({ ...prev, loading: true }));
                    
                    const success = await assignAdministrativePermission(
                        empIdBranchAdmin.emp_Id.value,
                        "2" // privileges: "2" for Branch Admin
                    );
                    if (success) {
                        // Reset form on success
                        setEmpIdBranchAdmin({
                            emp_Id: '',
                            loading: false,
                            id: ''
                        });
                        // Close the confirmation dialog
                        handleGrantRoleClose();
                        // Close the drawer after successful assignment
                        closeDrawer();
                    }
                } catch (error) {
                    console.log('Error submitting:', error);
                } finally {
                    // Reset loading state
                    setEmpIdBranchAdmin(prev => ({ ...prev, loading: false }));
                }
            }}
            loading = {empIdBranchAdmin.loading}
            size = {deleteAdminConfirm ? false : true}
        />
    }
    

    
    </>
  )
}

export default MarkBranchAdmin