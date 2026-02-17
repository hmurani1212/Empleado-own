import React, { useState, useEffect } from 'react'
import { Typography, Button, Select, Option } from '@material-tailwind/react'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import { showToast } from '../../Components/Toaster/Toaster'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import SearchReactSelect from '../../Components/CustomSelect/SearchReactSelect'

const AssignCourse = ({ courseId, courseName, closeDrawer }) => {
  const { Training_datefn, addCourseEmployeeAssignment, assignCourseByBranchDept, isLoadingCourseAssignment } = TrainingService()
  const { empBranches, fetchingAllBranches, gettingSubBranches, dept_subDept, Get_All_Employeefn, Get_All_Employee } = useEmployees()
  
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch branches and employees on mount
  useEffect(() => {
    fetchingAllBranches()
    Get_All_Employeefn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle branch selection
  const handleBranchChange = async (selectedOption) => {
    setSelectedBranch(selectedOption)
    setSelectedDepartment(null) // Clear department selection
    setSelectedEmployees([]) // Clear employee selection
    
    if (selectedOption && selectedOption.value !== undefined && selectedOption.value !== null) {
      const branchValue = selectedOption.value === 0 || selectedOption.value === '0' ? 0 : selectedOption.value
      if (branchValue !== 0) {
        // When a specific branch is selected, fetch departments for that branch
        await gettingSubBranches(selectedOption.value)
      } else {
        // When "All Branches" is selected (branch_id=0)
        await gettingSubBranches(0)
        // Auto-select "All Departments" (dep_id=0)
        setSelectedDepartment({ value: 0, label: 'All Departments' })
      }
    }
  }

  // Handle department selection
  const handleDepartmentChange = (selectedOption) => {
    setSelectedDepartment(selectedOption)
    setSelectedEmployees([]) // Clear employee selection
  }

  // Handle employee selection (multi-select)
  const handleEmployeeChange = (selectedOptions) => {
    // With isMulti={true}, react-select passes:
    // - An array when multiple items are selected
    // - An empty array [] when all items are cleared
    // - null when cleared (if isClearable is true)
    
    // Ensure it's always an array
    let selected = []
    if (selectedOptions === null || selectedOptions === undefined) {
      selected = []
    } else if (Array.isArray(selectedOptions)) {
      selected = selectedOptions
    } else {
      // Single object (shouldn't happen with isMulti, but handle it)
      selected = [selectedOptions]
    }
    
    setSelectedEmployees(selected)
  }

  // Create branch options with "All Branches" option
  const branchOptions = [
    { value: 0, label: 'All Branches' },
    ...(Array.isArray(empBranches)
      ? empBranches.map((branch) => ({
          value: branch.id || branch.branch_id,
          label: branch.branch_name || branch.name,
          id: branch.id || branch.branch_id
        }))
      : [])
  ]

  // Departments list: API returns DB_DATA = { departments: [...], pagination } or sometimes array
  const departmentsList = Array.isArray(dept_subDept)
    ? dept_subDept
    : (dept_subDept?.departments || [])

  const departmentOptions = [
    { value: 0, label: 'All Departments' },
    ...departmentsList.map((dept) => ({
      value: dept.id || dept.dept_id,
      label: dept.name || dept.dept_name,
      id: dept.id || dept.dept_id
    }))
  ]

  // Build employee options: when All Branch + All Department, use full employee list; otherwise from departments API
  const employeeOptions = (() => {
    if (!selectedDepartment || selectedDepartment.value === undefined || selectedDepartment.value === null) {
      return []
    }
    const branchValue = selectedBranch?.value === 0 || selectedBranch?.value === '0' ? 0 : selectedBranch?.value
    const deptValue = selectedDepartment.value === 0 || selectedDepartment.value === '0' ? 0 : Number(selectedDepartment.value) || selectedDepartment.value

    // All Branches + All Departments: show all employees from Get_All_Employee
    if (branchValue === 0 && deptValue === 0) {
      return Array.isArray(Get_All_Employee)
        ? Get_All_Employee.map((emp) => ({
            value: emp.id || emp.oneid || emp.emp_id,
            label: emp.name || 'N/A',
            id: emp.id || emp.oneid || emp.emp_id
          }))
        : []
    }

    if (deptValue === 0) {
      // All Departments (but specific branch): flatten employees from departmentsList and dedupe
      const seen = new Set()
      return departmentsList
        .flatMap((dept) => (dept.employees || []))
        .filter((emp) => {
          const id = emp.id
          if (seen.has(id)) return false
          seen.add(id)
          return true
        })
        .map((emp) => ({
          value: emp.id,
          label: emp.name || 'N/A',
          id: emp.id
        }))
    }

    // Specific department: use that department's employees array
    const department = departmentsList.find(
      (d) => (d.id || d.dept_id) === deptValue || Number(d.id || d.dept_id) === deptValue
    )
    const employees = department?.employees || []
    return employees.map((emp) => ({
      value: emp.id,
      label: emp.name || 'N/A',
      id: emp.id
    }))
  })()
  // Handle form submission - using new bulk assignment API
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation - Allow "All" options (value 0) but ensure at least one is selected
    if (!selectedBranch || selectedBranch.value === undefined || selectedBranch.value === null) {
      showToast('Please select a branch', 'error')
      return
    }

    if (!selectedDepartment || selectedDepartment.value === undefined || selectedDepartment.value === null) {
      showToast('Please select a department', 'error')
      return
    }

    if (!selectedEmployees || selectedEmployees.length === 0) {
      showToast('Please select at least one employee', 'error')
      return
    }

    setLoading(true)
    try {
      // Prepare payload for bulk assignment API
      // Convert branch_id to number, send 0 if "All Branches" is selected
      const branchId = selectedBranch.value === 0 || selectedBranch.value === '0' ? 0 : Number(selectedBranch.value)
      
      // Convert department_id to number, send 0 if "All Departments" is selected
      const departmentId = selectedDepartment.value === 0 || selectedDepartment.value === '0' ? 0 : Number(selectedDepartment.value)
      
      // Handle employee_ids - send selected employee IDs
      const employeeIds = selectedEmployees.map(emp => emp.value)
      const employeeNames = selectedEmployees.map(emp => {
        // Extract name from label (format: "Name (ID)")
        const match = emp.label.match(/^(.+?)\s*\(/)
        return match ? match[1] : emp.label
      })

      const payload = {
        course_id: courseId,
        branch_id: branchId,
        department_id: departmentId,
        employee_ids: employeeIds,
        employee_names: employeeNames // optional
      }


      // Call the new bulk assignment API
      const result = await assignCourseByBranchDept(payload)
      
      
      if (result.success) {
        // Reset form
        setSelectedBranch(null)
        setSelectedDepartment(null)
        setSelectedEmployees([])
        
        // Refresh course list
        Training_datefn({ status: '', text: '', page: 1, limit: 10 })
        
        // Close drawer
        if (closeDrawer) {
          closeDrawer()
        }
      }
    } catch (error) {
      console.error('Error assigning course:', error)
      showToast(error?.response?.data?.ERROR_DESCRIPTION || error?.message || 'Failed to assign course', 'error')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className='flex flex-col gap-4'>
      {/* Header */}
      <div className='flex flex-col gap-2'>
        <Typography className='text-[18px] font-semibold text-[#474747]'>
          Assign Course
        </Typography>
        {courseName && (
          <Typography className='text-[14px] text-gray-600'>
            Course: {courseName}
          </Typography>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {/* Branch Select */}
        <div className='w-full'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Branch <span className='text-red-500'>*</span>
          </label>
          <SearchReactSelect
            placeHolderTitle="Select Branch"
            value={selectedBranch}
            options={branchOptions}
            onChangeHandler={handleBranchChange}
            cStyle={true}
            customStyles={{
              control: (base) => ({
                ...base,
                fontSize: '14px',
                minHeight: '36px',
                border: '1px solid #B3B3B3',
                borderRadius: '6px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#3DA5F4',
                  boxShadow: '0 0 0 1px #3DA5F4',
                },
                '&:focus-within': {
                  borderColor: '#3DA5F4',
                  boxShadow: '0 0 0 2px rgba(61, 165, 244, 0.2)',
                }
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
        </div>

        {/* Department Select */}
        <div className='w-full'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Department <span className='text-red-500'>*</span>
          </label>
          <SearchReactSelect
            placeHolderTitle="Select Department"
            value={selectedDepartment}
            options={departmentOptions}
            onChangeHandler={handleDepartmentChange}
            isDisabled={!selectedBranch || selectedBranch?.value === null || selectedBranch?.value === undefined}
            cStyle={true}
            customStyles={{
              control: (base) => ({
                ...base,
                fontSize: '14px',
                minHeight: '36px',
                border: '1px solid #B3B3B3',
                borderRadius: '6px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#3DA5F4',
                  boxShadow: '0 0 0 1px #3DA5F4',
                },
                '&:focus-within': {
                  borderColor: '#3DA5F4',
                  boxShadow: '0 0 0 2px rgba(61, 165, 244, 0.2)',
                }
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
        </div>

        {/* Employee Select */}
        <div className='w-full'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Employee <span className='text-red-500'>*</span>
          </label>
          {employeeOptions.length === 0 && selectedDepartment ? (
            <div className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
              <Typography className='text-sm text-gray-500 text-center'>
                No employees available
              </Typography>
            </div>
          ) : (
            <>
              <SearchReactSelect
                placeHolderTitle="Select Employee(s)"
                value={selectedEmployees}
                options={employeeOptions}
                onChangeHandler={handleEmployeeChange}
                isMulti={true}
                isDisabled={!selectedDepartment || selectedDepartment?.value === null || selectedDepartment?.value === undefined}
                cStyle={true}
                customStyles={{
                  control: (base) => ({
                    ...base,
                    fontSize: '14px',
                    minHeight: '36px',
                    border: '1px solid #B3B3B3',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#3DA5F4',
                      boxShadow: '0 0 0 1px #3DA5F4',
                    },
                    '&:focus-within': {
                      borderColor: '#3DA5F4',
                      boxShadow: '0 0 0 2px rgba(61, 165, 244, 0.2)',
                    }
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  multiValue: (base) => ({
                    ...base,
                    display: 'none', // Hide multi-value tags in input
                  }),
                  multiValueContainer: (base) => ({
                    ...base,
                    display: 'none', // Hide multi-value container
                  }),
                }}
              />
              
              {/* Display selected employee names */}
              {selectedEmployees.length > 0 && (
                <div className='mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                  <Typography className='text-xs font-medium text-gray-600 mb-2'>
                    Selected Employees ({selectedEmployees.length}):
                  </Typography>
                  <div className='flex flex-wrap gap-2'>
                    {selectedEmployees.map((employee, index) => (
                      <div
                        key={employee.value || index}
                        className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs'
                      >
                        <span>{employee.label}</span>
                        <button
                          type='button'
                          onClick={() => {
                            const updated = selectedEmployees.filter(emp => emp.value !== employee.value)
                            setSelectedEmployees(updated)
                          }}
                          className='ml-1 text-blue-600 hover:text-blue-800 font-bold'
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Submit Button */}
        <div className='mt-4'>
          {(loading || isLoadingCourseAssignment) ? (
            <Button
              className='bg-blue-300 py-[10px] capitalize w-full'
              loading={true}
              disabled
            >
              Assigning...
            </Button>
          ) : (
            <Button
              type='submit'
              className='bg-blue-500 py-[10px] capitalize w-full hover:bg-blue-600'
              disabled={!selectedBranch || !selectedDepartment || selectedEmployees.length === 0}
            >
              Assign Course
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default AssignCourse

