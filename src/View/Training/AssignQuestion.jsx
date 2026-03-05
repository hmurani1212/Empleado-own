import React, { useState, useEffect } from 'react'
import { Typography, Button } from '@material-tailwind/react'
import { showToast } from '../../Components/Toaster/Toaster'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import SearchReactSelect from '../../Components/CustomSelect/SearchReactSelect'
import useStore from '../../Store/store'

const AssignQuestion = ({ questionIds, questionNames, closeDrawer }) => {
  // Get functions directly from store
  const assignQuestionsByBranchDept = useStore((state) => state.assignQuestionsByBranchDept)
  const isLoadingQuestionAssignment = useStore((state) => state.isLoadingQuestionAssignment)
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

  // Build base employee list: when All Branch + All Department, use full employee list; otherwise from departments API
  const baseEmployeeList = (() => {
    if (!selectedDepartment || selectedDepartment.value === undefined || selectedDepartment.value === null) {
      return []
    }
    const branchValue = selectedBranch?.value === 0 || selectedBranch?.value === '0' ? 0 : selectedBranch?.value
    const deptValue = selectedDepartment.value === 0 || selectedDepartment.value === '0' ? 0 : Number(selectedDepartment.value) || selectedDepartment.value

    let baseEmployees = []

    // All Branches + All Departments: show all employees from Get_All_Employee
    if (branchValue === 0 && deptValue === 0) {
      baseEmployees = Array.isArray(Get_All_Employee)
        ? Get_All_Employee.map((emp) => ({
            value: emp.id || emp.oneid || emp.emp_id,
            label: `${emp.name || 'N/A'} (${emp.id || emp.oneid || emp.emp_id})`,
            id: emp.id || emp.oneid || emp.emp_id
          }))
        : []
    } else if (deptValue === 0) {
      // All Departments (but specific branch): flatten employees from departmentsList and dedupe
      const seen = new Set()
      baseEmployees = departmentsList
        .flatMap((dept) => (dept.employees || []))
        .filter((emp) => {
          const id = emp.id
          if (seen.has(id)) return false
          seen.add(id)
          return true
        })
        .map((emp) => ({
          value: emp.id,
          label: `${emp.name || 'N/A'} (${emp.id})`,
          id: emp.id
        }))
    } else {
      // Specific department: use that department's employees array
      const department = departmentsList.find(
        (d) => (d.id || d.dept_id) === deptValue || Number(d.id || d.dept_id) === deptValue
      )
      const employees = department?.employees || []
      baseEmployees = employees.map((emp) => ({
        value: emp.id,
        label: `${emp.name || 'N/A'} (${emp.id})`,
        id: emp.id
      }))
    }

    return baseEmployees
  })()

  // Build employee options with "All Employees" option at the beginning
  const employeeOptions = [
    { value: 0, label: 'All Employees' },
    ...baseEmployeeList
  ]

  // Handle employee selection (multi-select)
  const handleEmployeeChange = (selectedOptions) => {
    let selected = []
    if (selectedOptions === null || selectedOptions === undefined) {
      selected = []
    } else if (Array.isArray(selectedOptions)) {
      selected = selectedOptions
    } else {
      selected = [selectedOptions]
    }
    
    // Check if "All Employees" (value 0) is selected
    const hasAllEmployees = selected.some(emp => emp && (emp.value === 0 || emp.value === '0'))
    
    if (hasAllEmployees) {
      // If "All Employees" is selected, select all available employees (excluding "All Employees" option)
      setSelectedEmployees(baseEmployeeList)
    } else {
      // Otherwise, filter out any "All Employees" option and keep only specific employees
      const filtered = selected.filter(emp => emp && emp.value !== 0 && emp.value !== '0')
      setSelectedEmployees(filtered)
    }
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


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
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

    if (!questionIds || questionIds.length === 0) {
      showToast('No questions selected', 'error')
      return
    }

    setLoading(true)
    try {
      // Prepare payload for bulk assignment API
      const branchId = selectedBranch.value === 0 || selectedBranch.value === '0' ? 0 : Number(selectedBranch.value)
      const departmentId = selectedDepartment.value === 0 || selectedDepartment.value === '0' ? 0 : Number(selectedDepartment.value)
      
      // Handle employee_ids
      let employeeIds = []
      let employeeNames = []
      
      const hasAllEmployees = selectedEmployees.some(emp => emp.value === 0 || emp.value === '0')
      
      if (hasAllEmployees) {
        employeeIds = [0]
        employeeNames = ['All Employees']
      } else {
        employeeIds = selectedEmployees.map(emp => emp.value)
        employeeNames = selectedEmployees.map(emp => {
          const match = emp.label.match(/^(.+?)\s*\(/)
          return match ? match[1] : emp.label
        })
      }

      const payload = {
        branch_id: branchId,
        department_id: departmentId,
        employee_ids: employeeIds,
        employee_names: employeeNames,
        question_ids: questionIds
      }

      // Call the bulk assignment API
      const result = await assignQuestionsByBranchDept(payload)
      
      if (result.success) {
        // Reset form
        setSelectedBranch(null)
        setSelectedDepartment(null)
        setSelectedEmployees([])
        
        // Close drawer
        if (closeDrawer) {
          closeDrawer()
        }
      }
    } catch (error) {
      console.error('Error assigning questions:', error)
      showToast(error?.response?.data?.ERROR_DESCRIPTION || error?.message || 'Failed to assign questions', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Header */}
      <div className='flex flex-col gap-2'>
        {/* <Typography className='text-[18px] font-semibold text-[#474747]'>
          Assign Questions
        </Typography> */}
        {questionIds && questionIds.length > 0 && (
          <Typography className='text-[14px] text-gray-600'>
            Selected Questions: {questionIds.length}
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
                display: 'none',
              }),
              multiValueContainer: (base) => ({
                ...base,
                display: 'none',
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
                {/* Check if all available employees are selected (equivalent to "All Employees") */}
                {selectedEmployees.length === baseEmployeeList.length && baseEmployeeList.length > 0 ? (
                  <div className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium'>
                    <span>All Employees</span>
                    <button
                      type='button'
                      onClick={() => {
                        setSelectedEmployees([])
                      }}
                      className='ml-1 text-blue-600 hover:text-blue-800 font-bold'
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  selectedEmployees.map((employee, index) => (
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className='mt-4'>
          {(loading || isLoadingQuestionAssignment) ? (
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
              Assign Questions
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default AssignQuestion

