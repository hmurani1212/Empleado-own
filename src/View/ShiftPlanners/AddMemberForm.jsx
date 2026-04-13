import React, { useState, useEffect } from 'react'
import useShiftManagement from '../../ViewModel/ShiftManagementViewModel/ShiftManagementServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { Checkbox, Button } from '@material-tailwind/react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'

const AddMemberForm = () => {
    const {
      newMemberValues,
      dept_subDeptP,
      handleCheckEmp,
      handleSelectChangePlanner,
      flattenOptions,
      allEmployeesDept,
      employeesPagination,
      deptEmployeesPlanner,
      handleAddMemberPlanner,
      isAddingMember,
      teamBranches,
      loadingBranchesPlanner,
      loadingDepartmentsPlanner,
      loadingDeptEmployees,
      resetAddMemberForm,
      fetchingAllBranchesPlanner,
    } = useShiftManagement()
    
    const [currentPage, setCurrentPage] = useState(1)
    const [limit] = useState(10)

    // Remount when drawer opens (key on AddMemberForm) so this runs once per open
    useEffect(() => {
      resetAddMemberForm()
      fetchingAllBranchesPlanner()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only init
    }, [])
    
    // Reset to page 1 when department changes
    useEffect(() => {
        setCurrentPage(1)
    }, [newMemberValues?.department])

    const branchOptions = [
      { value: 0, label: 'All Branches' },
      ...(teamBranches?.map((branch) => ({ value: branch.id, label: branch.branch_name })) || []),
    ]

    const departmentOptions = [
      { value: 0, label: 'All Departments' },
      ...(flattenOptions(dept_subDeptP) || []),
    ]

    const hasDepartmentSelection =
      newMemberValues?.department !== null && newMemberValues?.department !== undefined

  return (
    <div className="pt-5">
    <form onSubmit = {(e) => handleAddMemberPlanner(e)}>
    <div className='flex flex-col space-y-4'>
      <div className=''>
        <label className='text-[#698592]'>Select Branch</label>
        <CustomSelect 
        placeHolderTitle= 'Select Branch'
        value={newMemberValues?.branch}
        options={branchOptions}
        onChangeHandler={(selectedOption, e) => handleSelectChangePlanner(selectedOption, 'branch', e)}
        customStyles={false}
        isLoading={loadingBranchesPlanner}
        menuLoading={loadingBranchesPlanner}
        menuLoadingLabel="Loading branches..."
        loadingMessage={() => 'Loading branches...'}
        />
      </div>

      <div className=''>
        <label className='text-[#698592]'>Select Department</label>
        <CustomSelect
        placeHolderTitle='Select Department'
        value={newMemberValues?.department}
        options={departmentOptions}
        onChangeHandler={(selectedOption, e) => handleSelectChangePlanner(selectedOption, 'department', e)}
        cStyle={true}
        isLoading={loadingDepartmentsPlanner}
        menuLoading={loadingDepartmentsPlanner}
        menuLoadingLabel="Loading departments..."
        loadingMessage={() => 'Loading departments...'}
        isDisabled={loadingBranchesPlanner}
        /> 
      </div>

      <div>
        <div className='text-[12px]'>List of Employees</div>
      </div>
      <div>
        {loadingDeptEmployees ? (
          <div className="flex items-center gap-2 text-sm text-[#698592] py-6">
            <span
              className="inline-block h-4 w-4 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin shrink-0"
              aria-hidden
            />
            Loading...
          </div>
        ) : allEmployeesDept?.length > 0 ? (
        <div>
              {allEmployeesDept.map((ele, i) => (
                <div key={ele.id || i}>
                  <Checkbox color='blue' label={ele.name} name='ids' value={ele.id} onChange={handleCheckEmp}/>
                </div>
              ))}
              
              {employeesPagination && employeesPagination.pages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {employeesPagination.pages} • 
                    Showing {allEmployeesDept.length} of {employeesPagination.total} employees
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => {
                        const prevPage = Math.max(1, currentPage - 1)
                        setCurrentPage(prevPage)
                        const deptId = newMemberValues?.department?.value !== undefined && newMemberValues?.department?.value !== null
                          ? newMemberValues.department.value
                          : newMemberValues?.department
                        deptEmployeesPlanner(deptId, prevPage, limit)
                      }}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => {
                        const nextPage = currentPage + 1
                        setCurrentPage(nextPage)
                        const deptId = newMemberValues?.department?.value !== undefined && newMemberValues?.department?.value !== null
                          ? newMemberValues.department.value
                          : newMemberValues?.department
                        deptEmployeesPlanner(deptId, nextPage, limit)
                      }}
                      disabled={currentPage >= (employeesPagination.pages || 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
        </div>
        ) : hasDepartmentSelection ? (
            <div className="text-sm text-[#698592] py-2">No Employees Found</div>
          ) : (
            <div className="text-sm text-[#698592] py-2">
              Select branch and department to load employees.
            </div>
          )}
      </div>
      <div>
        <SubmitButton loading={isAddingMember} />
      </div>
      
    </div>
      
    </form>
    </div>
  )
}

export default AddMemberForm
