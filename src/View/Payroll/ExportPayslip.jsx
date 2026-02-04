import React, { useState, useEffect, useCallback } from 'react'
import { Button, Input, Popover, PopoverContent, PopoverHandler } from '@material-tailwind/react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useStore from '../../Store/store'
import { gettingDepartmentsServices } from '../../services/__frequentApiServices'
import { showToast } from '../../Components/Toaster/Toaster'
import Calendar from 'react-calendar'
import { FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa'
import { useDebounce } from '../../services/__debounceServices'

const ExportPayslip = () => {
  const [loading, setLoading] = useState(false)
  // Export states
  const [exportBranch, setExportBranch] = useState(null)
  const [exportDepartments, setExportDepartments] = useState([])
  const [exportDepartment, setExportDepartment] = useState(null)
  const [exportFilter, setExportFilter] = useState(null)
  const [exportStatus, setExportStatus] = useState(null)
  const [employeeIdSearch, setEmployeeIdSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(null)

  // Export functionality states
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [exportData, setExportData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [allPayslipsData, setAllPayslipsData] = useState([])
  const [employeeSearchResults, setEmployeeSearchResults] = useState([])

  // Get branches and payslips from store
  const getAllBranchesPayroll = useStore((state) => state.getAllBranchesPayroll)
  const copyBranchesData = useStore((state) => state.copyBranchesData)
  const gettingPayslips = useStore((state) => state.gettingPayslips)
  const payslips = useStore((state) => state.payslips)

  // Global drawer functions
  const openDrawer = useStore((state) => state.openDrawer)
  const closeDrawer = useStore((state) => state.closeDrawer)
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
  const settingDrawerSize = useStore((state) => state.settingDrawerSize)
  const settingComponent = useStore((state) => state.settingComponent)

  // Export drawer options
  const exportFilterOptions = [
    { value: 'status', label: 'Filter by status' },
    { value: 'employee_id', label: 'Filter employee id' },
    { value: 'specific_month', label: 'Specific month' }
  ]

  const exportStatusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'due', label: 'Due' }
  ]

  // Month options for selection
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

  // Prepare branch options
  const branchOptions = (copyBranchesData && Array.isArray(copyBranchesData))
    ? copyBranchesData.map((branch) => ({
      value: branch.id,
      label: branch.branch_name
    }))
    : []

  // Debug branch data (commented out to prevent infinite logs)
  // console.log('🔍 ExportPayslip - copyBranchesData:', copyBranchesData)
  // console.log('🔍 ExportPayslip - branchOptions:', branchOptions)
  // console.log('🔍 ExportPayslip - exportBranch:', exportBranch)

  // Export drawer handlers
  const handleExportBranchChange = async (selectedOption) => {
    console.log('Export Branch Changed:', selectedOption)
    setExportBranch(selectedOption)
    setExportDepartment(null) // Reset department when branch changes

    if (selectedOption && selectedOption.value) {
      try {
        const departmentsData = await gettingDepartmentsServices(selectedOption.value)
        // Ensure departmentsData is properly formatted
        const formattedDepartments = Array.isArray(departmentsData) ? departmentsData : []
        setExportDepartments(formattedDepartments)
        console.log('Export Departments loaded:', formattedDepartments)
      } catch (error) {
        console.error('Error loading departments:', error)
        setExportDepartments([])
      }
    } else {
      setExportDepartments([])
    }
  }

  const handleExportDepartmentChange = (selectedOption) => {
    console.log('Export Department Changed:', selectedOption)
    setExportDepartment(selectedOption)
  }

  const handleExportFilterChange = (selectedOption) => {
    console.log('Export Filter Changed:', selectedOption)
    setExportFilter(selectedOption)
    // Reset dependent fields when filter changes
    setExportStatus(null)
    setEmployeeIdSearch('')
    setSelectedMonth(null)
  }

  const handleExportStatusChange = (selectedOption) => {
    console.log('Export Status Changed:', selectedOption)
    setExportStatus(selectedOption)
  }

  const handleMonthChange = (selectedOption) => {
    console.log('Export Month Changed:', selectedOption)
    setSelectedMonth(selectedOption)
  }

  // Debounced search term
  const debouncedSearchTerm = useDebounce(employeeIdSearch, 300)

  // Employee search function
  const performEmployeeSearch = useCallback((searchTerm, payslipsData) => {
    // console.log('🔍 Employee search triggered with:', searchTerm)
    // console.log('🔍 Available payslips data:', payslipsData?.length)
    
    if (!searchTerm || searchTerm.length < 1) {
      setEmployeeSearchResults([])
      return
    }
    
    if (!payslipsData || payslipsData.length === 0) {
      // console.log('🔍 No payslips data available for search')
      return
    }
    
    const searchTermLower = searchTerm.toLowerCase()
    const filteredEmployees = payslipsData.filter(payslip => {
      const empId = String(payslip.emp_id || '').toLowerCase()
      const empName = (payslip.wf_employee?.name || '').toLowerCase()
      const empDesignation = (payslip.wf_employee?.designation?.title || '').toLowerCase()
      
      // Also check alternative field names
      const altEmpName = (payslip.name || '').toLowerCase()
      const altEmpId = (payslip.employee_id || '').toLowerCase()
      
      const matches = empId.includes(searchTermLower) || 
                     empName.includes(searchTermLower) || 
                     empDesignation.includes(searchTermLower) ||
                     altEmpName.includes(searchTermLower) ||
                     altEmpId.includes(searchTermLower)
      
      return matches
    })
    
    setEmployeeSearchResults(filteredEmployees)
    // console.log('🔍 Employee search results:', filteredEmployees.length, 'for term:', searchTerm)
  }, [])

  // Effect to trigger search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performEmployeeSearch(debouncedSearchTerm, allPayslipsData)
    } else {
      setEmployeeSearchResults([])
    }
  }, [debouncedSearchTerm, allPayslipsData, performEmployeeSearch])

  const handleEmployeeSearchChange = (e) => {
    const value = e.target.value
    setEmployeeIdSearch(value)
    // console.log('🔍 Employee search input changed:', value)
  }

  const handleExportSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Build params for API call (only branch and department)
      const params = {}
      
      if (exportBranch && exportBranch.value) {
        params.branch_id = exportBranch.value
      }
      
      if (exportDepartment && exportDepartment.value) {
        params.department_id = exportDepartment.value
      }
      
      console.log('🔍 Fetching export data with params:', params)
      
      // Fetch all payslips data first
      await gettingPayslips(params, true)
      
      // Store all data for filtering
      if (payslips && Array.isArray(payslips)) {
        setAllPayslipsData(payslips)
        
        // Apply filters based on selected filter type
        let filteredData = payslips
        
        if (exportFilter?.value === 'status' && exportStatus?.value) {
          // Filter by status (paid/due)
          filteredData = payslips.filter(payslip => {
            const isPaid = payslip.payment_status === 'paid' || payslip.status === 'paid'
            return exportStatus.value === 'paid' ? isPaid : !isPaid
          })
          console.log('🔍 Filtered by status:', exportStatus.value, 'Results:', filteredData.length)
        } else if (exportFilter?.value === 'employee_id' && employeeIdSearch.trim()) {
          // Filter by employee ID/name (frontend search)
          const searchTerm = employeeIdSearch.trim().toLowerCase()
          filteredData = payslips.filter(payslip => {
            const empId = String(payslip.emp_id || '').toLowerCase()
            const empName = (payslip.wf_employee?.name || '').toLowerCase()
            return empId.includes(searchTerm) || empName.includes(searchTerm)
          })
        } else if (exportFilter?.value === 'specific_month' && selectedMonth) {
          // Filter by specific month (any year)
          const targetMonth = parseInt(selectedMonth.value) - 1 // Convert to 0-based month
          filteredData = payslips.filter(payslip => {
            if (payslip.salary_month) {
              const payslipDate = new Date(payslip.salary_month)
              return payslipDate.getMonth() === targetMonth
            }
            return false
          })
        }
        
        // Transform filtered data for export
        const transformedData = filteredData.map((payslip, index) => ({
          sNo: index + 1,
          employmentNumber: payslip.emp_id || 'N/A',
          name: payslip.wf_employee?.name || 'N/A',
          department: payslip.wf_employee?.department?.name || payslip.wf_depts?.name || 'N/A',
          designation: payslip.wf_employee?.designation?.title || 'N/A',
          empSalary: parseFloat(payslip.salary_amount || 0),
          expected: '8', // Default value, can be calculated from working days
          earned: '8', // Default value, can be calculated from present days
          totalDays: '30', // Default value, can be calculated from month
          presentDays: '25', // Default value, can be calculated from attendance
          leaveDays: '2', // Default value, can be calculated from leave records
          absentDays: '3', // Default value, can be calculated from attendance
          overTime: parseFloat(payslip.overtime_amount || 0),
          fuel: parseFloat(payslip.fuel_allowance || 0),
          lateMins: parseFloat(payslip.late_minutes || 0),
          absenties: parseFloat(payslip.absent_days || 0),
          incomeTax: parseFloat(payslip.income_tax || 0),
          eobi: parseFloat(payslip.eobi || 0),
          provident: parseFloat(payslip.provident_fund || 0),
          testing: parseFloat(payslip.testing_allowance || 0),
          bikeLoan: parseFloat(payslip.bike_loan || 0),
          loan: parseFloat(payslip.loan_deduction || 0),
          deduction: parseFloat(payslip.total_deductions || 0),
          totalPayableSalary: parseFloat(payslip.paid_amount || 0)
        }))
        
        setExportData(transformedData)
        setShowExportOptions(true)
        
        if (transformedData.length > 0) {
          showToast(`Data loaded successfully (${transformedData.length} records). Choose export format.`, 'success')
        } else {
          showToast('No data found for the selected filters', 'warning')
        }
      } else {
        showToast('No data found for the selected branch and department', 'error')
      }
    } catch (error) {
      console.error('Error fetching export data:', error)
      showToast('Error loading data for export', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Excel export function
  const handleExcelExport = () => {
    try {
      // Create CSV content
      const headers = [
        'S.No',
        'Employment#',
        'Name',
        'Department',
        'Designation',
        'Emp Salary',
        'Expected',
        'Earned',
        'Total Days',
        'Present D.',
        'Leave Day',
        'Absent Da',
        'OverTime',
        'Fuel',
        'lateMins',
        'absenties',
        'incomeTa',
        'eobi',
        'provident',
        'Testing',
        'Bike Loan',
        'Loan',
        'deduction',
        'Total Payable Salary'
      ]
      
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => [
          row.sNo,
          `"${row.employmentNumber}"`,
          `"${row.name}"`,
          `"${row.department}"`,
          `"${row.designation}"`,
          row.empSalary,
          row.expected,
          row.earned,
          row.totalDays,
          row.presentDays,
          row.leaveDays,
          row.absentDays,
          row.overTime,
          row.fuel,
          row.lateMins,
          row.absenties,
          row.incomeTax,
          row.eobi,
          row.provident,
          row.testing,
          row.bikeLoan,
          row.loan,
          row.deduction,
          row.totalPayableSalary
        ].join(','))
      ].join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `payslips_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showToast('Excel file downloaded successfully', 'success')
    closeDrawer()
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      showToast('Error exporting to Excel', 'error')
    }
  }
  
  // PDF export function - Direct print in same tab
  const handlePdfExport = () => {
    try {
      // Create a new window for clean printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      
      if (!printWindow) {
        showToast('Please allow popups to print PDF', 'warning')
        return
      }

      // Generate clean HTML content for printing
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title></title>
          <style>
            @page {
              margin: 0;
              size: A4;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px 6px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Employment#</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Emp Salary</th>
                <th>Net Salary</th>
                <th>Expect hours</th>
                <th>Earned hours</th>
                <th>Over Time</th>
                <th>Total Days</th>
                <th>Present Days</th>
                <th>Leave Days</th>
                <th>Absent Days</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.length > 0 ? 
                exportData.map((row, index) => `
                  <tr>
                    <td>${row.sNo}</td>
                    <td>${row.employmentNumber}</td>
                    <td>${row.name}</td>
                    <td>${row.designation}</td>
                    <td>${row.empSalary.toLocaleString()}</td>
                    <td>${row.totalPayableSalary.toLocaleString()}</td>
                    <td>${row.expected}</td>
                    <td>${row.earned}</td>
                    <td>${row.overTime.toLocaleString()}</td>
                    <td>${row.totalDays}</td>
                    <td>${row.presentDays}</td>
                    <td>${row.leaveDays}</td>
                    <td>${row.absentDays}</td>
                  </tr>
                `).join('') : 
                '<tr><td colspan="13" style="text-align: center; padding: 20px;">No data available</td></tr>'
              }
            </tbody>
          </table>
        </body>
        </html>
      `

      // Write content to the new window
      printWindow.document.write(printContent)
      printWindow.document.close()
      
      // Auto-print after content loads
      printWindow.onload = () => {
        printWindow.print()
        // Close the window after printing
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }
      
      showToast('PDF print dialog opened', 'success')
      closeDrawer()
      
    } catch (error) {
      console.error('Error printing PDF:', error)
      showToast('Error printing PDF', 'error')
    }
  }

  const handleCancel = () => {
    // Reset all states
    setExportBranch(null)
    setExportDepartment(null)
    setExportDepartments([])
    setExportFilter(null)
    setExportStatus(null)
    setEmployeeIdSearch('')
    setSelectedMonth(null)
    setShowExportOptions(false)
    setExportData([])
    setAllPayslipsData([])
    setEmployeeSearchResults([])
    closeDrawer()
  }

  // Load branches on component mount
  useEffect(() => {
    if (!copyBranchesData || !Array.isArray(copyBranchesData) || copyBranchesData.length === 0) {
      getAllBranchesPayroll()
    }
  }, [copyBranchesData])

  // Click outside handler to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (employeeSearchResults.length > 0) {
        const searchContainer = event.target.closest('.employee-search-container')
        if (!searchContainer) {
          setEmployeeSearchResults([])
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [employeeSearchResults])

  // Load payslips data when branch and department are selected (for employee search)
  useEffect(() => {
    const loadPayslipsForSearch = async () => {
      if (exportBranch && exportBranch.value && exportDepartment && exportDepartment.value) {
        try {
          // console.log('🔍 Loading payslips for search with:', {
          //   branch: exportBranch.value,
          //   department: exportDepartment.value
          // })
          
          const params = {
            branch_id: exportBranch.value,
            department_id: exportDepartment.value
          }
          
          await gettingPayslips(params, true)
          
          // Wait a bit for the store to update
          setTimeout(() => {
            const currentPayslips = useStore.getState().payslips
            if (currentPayslips && Array.isArray(currentPayslips)) {
              setAllPayslipsData(currentPayslips)
              // console.log('🔍 Loaded payslips for employee search:', currentPayslips.length)
            } else {
              // console.log('🔍 No payslips data found in store')
            }
          }, 500)
        } catch (error) {
          console.error('Error loading payslips for search:', error)
        }
      } else {
        // Clear data when branch or department is not selected
        setAllPayslipsData([])
        setEmployeeSearchResults([])
      }
    }

    loadPayslipsForSearch()
  }, [exportBranch, exportDepartment])


  return (
    <div className='p-6 space-y-6'>
      <div className='flex gap-4'>
        {/* Select Branch */}
        <div className='flex-1'>
          <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Branch</label>
          <div className='w-full'>
            <CustomSelect
              key={`export-branch-select-${exportBranch?.value || 'empty'}`}
              placeHolderTitle='Select Branch'
              value={exportBranch}
              options={branchOptions}
              onChangeHandler={handleExportBranchChange}
              customStyles={false}
            />
          </div>
        </div>

        {/* Select Department */}
        <div className='flex-1'>
          <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Department</label>
          <div className='w-full'>
            <CustomSelect
              key={`export-department-select-${exportDepartment?.value || 'empty'}`}
              placeHolderTitle='Select Department'
              value={exportDepartment}
              options={exportDepartments}
              onChangeHandler={handleExportDepartmentChange}
              customStyles={false}
              disabled={!exportBranch}
            />
          </div>
        </div>
      </div>

      {/* Select Filter and Conditional Fields - Properly Aligned */}
      <div className='flex items-start gap-6'>
        {/* Select Filter */}
        <div className='w-[250px]'>
          <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Filter</label>
          <CustomSelect
            key={`export-filter-select-${exportFilter?.value || 'empty'}`}
            placeHolderTitle='Select Filter'
            value={exportFilter}
            options={exportFilterOptions}
            onChangeHandler={handleExportFilterChange}
            customStyles={false}
            isClearable={false}
            isSearchable={false}
          />
        </div>

        {/* Conditional Fields - Aligned to the right with proper margin */}
        <div className='flex-1'>
          {/* Status Dropdown */}
          {exportFilter?.value === 'status' && (
            <div>
              <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Status</label>
              <div className='w-[250px]'>
                <CustomSelect
                  key={`export-status-select-${exportStatus?.value || 'empty'}`}
                  placeHolderTitle='Select Status'
                  value={exportStatus}
                  options={exportStatusOptions}
                  onChangeHandler={handleExportStatusChange}
                  customStyles={false}
                  isClearable={false}
                  isSearchable={false}
                />
              </div>
            </div>
          )}

          {/* Employee Search Input */}
          {exportFilter?.value === 'employee_id' && (
            <div>
              <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Search Employee</label>
              <div className='w-[300px] relative employee-search-container'>
                <Input
                  label='Search by ID, Name or Designation'
                  color='blue'
                  value={employeeIdSearch}
                  onChange={handleEmployeeSearchChange}
                  placeholder='Type to search employees...'
                />
                
                {/* Search Results Dropdown */}
                {employeeSearchResults.length > 0 && (
                  <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto'>
                    <div className='px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b'>
                      Found {employeeSearchResults.length} employee(s)
                    </div>
                    {employeeSearchResults.map((employee, index) => (
                      <div
                        key={index}
                        className='px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                        onClick={() => {
                          setEmployeeIdSearch(employee.wf_employee?.name || employee.emp_id || '')
                          setEmployeeSearchResults([])
                        }}
                      >
                        <div className='text-sm font-medium text-gray-900'>
                          {employee.wf_employee?.name || 'N/A'}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          <span className='font-medium'>ID:</span> {employee.emp_id || 'N/A'} | 
                          <span className='font-medium ml-1'>Dept:</span> {employee.wf_employee?.department?.name || 'N/A'} |
                          <span className='font-medium ml-1'>Designation:</span> {employee.wf_employee?.designation?.title || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show loading or no data message */}
                {employeeIdSearch.length > 0 && employeeSearchResults.length === 0 && allPayslipsData.length > 0 && (
                  <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3'>
                    <div className='text-sm text-gray-500 text-center'>
                      No employees found matching "{employeeIdSearch}"
                    </div>
                  </div>
                )}
                
                {/* Show message when no data is loaded */}
                {employeeIdSearch.length > 0 && allPayslipsData.length === 0 && (
                  <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3'>
                    <div className='text-sm text-gray-500 text-center'>
                      Please select branch and department first
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Month Selection */}
          {exportFilter?.value === 'specific_month' && (
            <div>
              <label className='text-[#698592] text-[12px] font-semibold mb-2 block'>Select Month</label>
              <div className='w-[250px]'>
                <CustomSelect
                  key={`export-month-select-${selectedMonth?.value || 'empty'}`}
                  placeHolderTitle='Select Month'
                  value={selectedMonth}
                  options={monthOptions}
                  onChangeHandler={handleMonthChange}
                  customStyles={false}
                  isClearable={false}
                  isSearchable={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-end gap-3 pt-6'>
        <Button
          variant='outlined'
          color='blue-gray'
          onClick={handleCancel}
          className='px-6'
        >
          Cancel
        </Button>
        
        {!showExportOptions ? (
        <Button
          color='blue'
          onClick={handleExportSubmit}
          className='px-6'
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Export'}
          </Button>
        ) : (
          <div className='flex gap-3'>
            <Button
              color='green'
              onClick={handleExcelExport}
              className='px-6 py-2 flex items-center gap-2'
            >
              <FaFileExcel className='text-lg' />
              Excel
            </Button>
            
            <Button
              color='red'
              onClick={handlePdfExport}
              className='px-6 py-2 flex items-center gap-2'
            >
              <FaFilePdf className='text-lg' />
              PDF
        </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExportPayslip
