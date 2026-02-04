import React, { useState, useEffect } from 'react'
import useShiftManagement from '../../ViewModel/ShiftManagementViewModel/ShiftManagementServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { Checkbox, Button } from '@material-tailwind/react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'

const AddMemberForm = (props) => {
    const {teamId, teamBranches} = props
    const {newMemberValues, dept_subDeptP, handleCheckEmp, handleCheckboxChange, handleSelectChangePlanner, flattenOptions, allEmployeesDept, employeesPagination, deptEmployeesPlanner, handleAddMemberPlanner, isAddingMember}  = useShiftManagement()
    
    const [currentPage, setCurrentPage] = useState(1)
    const [limit] = useState(10)
    
    // Reset to page 1 when department changes
    useEffect(() => {
        setCurrentPage(1)
    }, [newMemberValues?.department])
  return (
    <>
    <form onSubmit = {(e) => handleAddMemberPlanner(e)}>
    <div className='flex flex-col space-y-4'>
      <div className=''>
        <label className='text-[#698592]'>Select Branch</label>
        <CustomSelect 
        placeHolderTitle= 'Select Branch'
        value={newMemberValues?.branch}
        options={[{ value: 0, label: 'All Branches' }, ...(teamBranches?.map((branch) => ({ value: branch.id, label: branch.branch_name })) || [])]} 
        onChangeHandler={(selectedOption, e) => handleSelectChangePlanner(selectedOption, 'branch', e)}
        customStyles={false}
        />
      </div>

      <div className=''>
        <label className='text-[#698592]'>Select Department</label>
        <CustomSelect
        placeHolderTitle='Select Department'
        value={newMemberValues?.department}
        options={[{ value: 0, label: 'All Departments' }, ...(flattenOptions(dept_subDeptP) || [])]}
        onChangeHandler={(selectedOption, e) => handleSelectChangePlanner(selectedOption, 'department', e)}
        cStyle={true}
        /> 
      </div>

      <div>
        <div className='text-[12px]'>List of Employees</div>
      </div>
      <div>
        
      {newMemberValues ? 
      (
        <div>
          {allEmployeesDept?.length > 0 ? (
            <>
              {allEmployeesDept.map((ele, i) => (
                <div key={ele.id || i}>
                  <Checkbox color='blue' label={ele.name} name='ids' value={ele.id} onChange={handleCheckEmp}/>
                </div>
              ))}
              
              {/* Pagination Controls */}
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
            </>
          ) : (
            <div>No Employees Found</div>
          )}
        </div>
      ) : (
        <div>No Employees Found</div>
      ) 
    }   
      </div>
      <div>
        <SubmitButton loading={isAddingMember} />
      </div>
      
    </div>
      
    </form>
    </>
  )
}

export default AddMemberForm