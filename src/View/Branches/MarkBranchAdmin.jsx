import React, { useState } from 'react'
import useBranches2 from '../../ViewModel/Brach2ViewModel/BranchesServices2'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
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
  return (
    <>
    <div className='flex flex-col space-y-4 text-[12px]'>
        <div>
            <span className=''>Select Employee to mark as Branch Admin</span>
            {/* <div className="text-xs text-gray-500 mt-1">
                This will assign administrative privileges (privileges: "2") to the selected employee
            </div> */}
        </div>
        
        <div>
            <CustomSelect
            placeHolderTitle='Employee'
            value={empIdBranchAdmin?.emp_Id}
            options={brnachAdminData?.DB_DATA?.length > 0 ? 
                brnachAdminData.DB_DATA
                    .filter(employee => {
                        // Filter out employees who are already branch admins
                        const existingAdminIds = brnachAdminData?.BRANCH_ADMIN_DATA?.map(admin => admin.employee_id) || [];
                        return !existingAdminIds.includes(employee.id);
                    })
                    .map((employee) => ({value:employee.id, label:employee.name})) : 
                []
            }
            onChangeHandler={(selectedOption, e) => onChangeEmpBranc(selectedOption, 'emp_Id', e)}
            cStyle={true}
            /> 
        </div>
        


        <div>
            <span className='font-semibold'>Note:</span>
            <span>If you want to make branch admin with some restrictions kindly, go to
            Employee &gt; View &gt; Profile &gt; Account Privileges</span>
        </div>

        <div>
            {brnachAdminData?.BRANCH_ADMIN_DATA?.length > 0 && (
                <div className="mb-3 text-sm text-gray-600">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                        Total Existing Branch Admins: {brnachAdminData.BRANCH_ADMIN_DATA.length}
                    </Typography>
                </div>
            )}
            <table className="w-[100%] min-w-max text-left">
                                        <thead>
                            <tr>
                                    <th 
                                    className="border-b border-blue-gray-100 p-2">
                                        <Typography
                                        variant='small'
                                        color='blue-gray'
                                        className="font-semibold leading-none opacity-70 capitalize"
                                        >
                                            Already Assigned Branch Admin
                                        </Typography>
                                    </th>
                                    <th 
                                    className="border-b border-blue-gray-100 p-2">
                                        <Typography
                                        variant='small'
                                        color='blue-gray'
                                        className="font-semibold leading-none opacity-70 capitalize flex items-center gap-2"
                                        >
                                            <span className='cursor-pointer' onClick={showDeleteOption}>Edit</span>
                                        </Typography>
                                    </th>
                            </tr>
                        </thead>
                <tbody>
                    {brnachAdminData?.BRANCH_ADMIN_DATA?.length > 0 ? (
                        brnachAdminData?.BRANCH_ADMIN_DATA?.map((ele, index) => {
                            const isLast = index === brnachAdminData?.BRANCH_ADMIN_DATA?.length - 1;
                            const classes = isLast ? "p-2" : "p-2 border-b border-blue-gray-50";

                            return(
                                <tr key={ele.employee_id || ele.id}>
                                    <td className={classes}>
                                        <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                        >
                                            {ele.employee_name || ele.name}
                                        </Typography>
                                    </td>
                                    {deleteOption && 
                                        <td className={classes}>
                                            <IconButton 
                                                color="red" 
                                                className='w-7 h-7' 
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
                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <FaTrash className='text-[10px] '/> 
                                                )}
                                            </IconButton>
                                        </td>
                                    }

                                </tr>
                            )
                        })
                    ) : (
                        <tr>
                            <td colSpan={2} className='p-2 text-center'>
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    No Branch Admin assigned yet
                                </Typography>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end pt-4">
            <Button
                className="capitalize font-medium bg-[#8bc9f8] px-6 py-2"
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