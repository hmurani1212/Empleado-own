import { Checkbox, Input, Radio } from '@material-tailwind/react'
import React, { useState, useEffect } from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { showToast } from '../../Components/Toaster/Toaster'
import employeesApi from '../../Model/Data/Employees/Employees'
import useStore from '../../Store/store'
import * as XLSX from 'xlsx'

const ReportsLateComers = () => {
    const {handleCheckboxChangeAtt, isIndividualAtt, loading} = useAttendance()
    const getDetailedLateComers = useStore((state) => state.getDetailedLateComers)
    
    // State for form data
    const [formData, setFormData] = useState({
        fromDate: '',
        toDate: '',
        branch: null,
        department: null,
        employee: null,
        employeeId: '',
        exportType: 'PDF' // Default to PDF
    })
    
    // State for API data (same as BranchWiseListReporting)
    const [empBranches, setEmpBranches] = useState([])
    const [dept_subDept, setDept_subDept] = useState([])
    const [empList, setEmpList] = useState([])
    const [loadingBranches, setLoadingBranches] = useState(false)
    const [loadingDepartments, setLoadingDepartments] = useState(false)
    const [loadingEmployees, setLoadingEmployees] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    
    // Load branches on component mount (same as BranchWiseListReporting)
    useEffect(() => {
        fetchBranches()
    }, [])

    // Fetch branches from API (same as BranchWiseListReporting)
    const fetchBranches = async () => {
        setLoadingBranches(true)
        try {
            const response = await employeesApi.gettingAllBranches()
            const data = response.data
            if (data.STATUS === "SUCCESSFUL") {
                setEmpBranches(data.DB_DATA.branches || [])
            }
        } catch (err) {
            console.error('Error fetching branches:', err)
        } finally {
            setLoadingBranches(false)
        }
    }

    // Fetch departments when branch is selected (same as BranchWiseListReporting)
    const fetchDepartments = async (branchId) => {
        setLoadingDepartments(true)
        try {
            const data = { parent_id: 0, branch_id: branchId, getAll: true }
            const response = await employeesApi.gettingSubDepts(data)
            const resData = response.data
            if (resData.STATUS === "SUCCESSFUL") {
                setDept_subDept(resData.DB_DATA)
            } else {
                setDept_subDept([])
            }
        } catch (err) {
            console.error("Error fetching departments:", err)
            setDept_subDept([])
        } finally {
            setLoadingDepartments(false)
        }
    }

    // Fetch employees when department is selected (same as BranchWiseListReporting)
    const fetchEmployees = async (departmentId) => {
        setLoadingEmployees(true)
        try {
            const response = await employeesApi.get_all_employeee(departmentId)
            const data = response.data;
            // console.log('what is the data', data)
            if (data.STATUS === "SUCCESSFUL") {
                setEmpList(data.DB_DATA || [])
            } else {
                setEmpList([])
            }
        } catch (err) {
            console.error("Error fetching employees:", err)
            setEmpList([])
        } finally {
            setLoadingEmployees(false)
        }
    }

    // Flatten options for departments (same as BranchWiseListReporting)
    const flattenDeptOptions = (data) => {
        let flattenedOptions = [
            { label: 'All Departments', value: 0, isParent: false }
        ];
        const send_data = data?.departments
        if (send_data && Array.isArray(send_data)) {
            send_data?.forEach((dept) => {
                flattenedOptions.push({
                    label: dept.name,
                    value: dept.id,
                    isParent: true
                });
            });
        }
        return flattenedOptions;
    };
    
    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }
    
    // Handle branch selection (same as BranchWiseListReporting)
    const handleBranchChange = (selectedOption) => {
        handleInputChange('branch', selectedOption)
        // Reset department and employee lists when branch changes
        handleInputChange('department', null)
        handleInputChange('employee', null)
        setDept_subDept([])
        setEmpList([])
        // Fetch departments for selected branch (call with 0 for "All Branches" to get all departments)
        if (selectedOption) {
            fetchDepartments(selectedOption.value)
        }
    }
    
    // Handle department selection (same as BranchWiseListReporting)
    const handleDepartmentChange = (selectedOption) => {
        handleInputChange('department', selectedOption)
        // Reset employee list when department changes
        handleInputChange('employee', null)
        setEmpList([])
        // Fetch employees for selected department (skip if "All Departments" is selected)
        if (selectedOption && selectedOption.value !== 0) {
            fetchEmployees(selectedOption.value)
        }
    }
    
    // Handle export type change
    const handleExportTypeChange = (type) => {
        handleInputChange('exportType', type)
    }
    
    // Generate PDF from data
    const generatePDF = (data) => {
        // Simple PDF generation using browser's print functionality
        const printWindow = window.open('', '_blank');
        const htmlContent = `
            <html>
                <head>
                    <title>Late Comers Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        h1 { color: #333; }
                        .header { margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Late Comers Report</h1>
                        <p><strong>From Date:</strong> ${formData.fromDate}</p>
                        <p><strong>To Date:</strong> ${formData.toDate}</p>
                        <p><strong>Branch:</strong> ${formData.branch?.label || 'All'}</p>
                        <p><strong>Department:</strong> ${formData.department?.label || 'All'}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Name</th>
                                <th>Father Name</th>
                                <th>Employee ID</th>
                                <th>Branch</th>
                                <th>Sign In</th>
                                <th>Sign Out</th>
                                <th>Late</th>
                                <th>Adjusted</th>
                                <th>Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.name}</td>
                                    <td>${item.FatherName}</td>
                                    <td>${item.EmpleadoID}</td>
                                    <td>${item.branch_name}</td>
                                    <td>${item.SignIn}</td>
                                    <td>${item.SignOut}</td>
                                    <td>${item.late}</td>
                                    <td>${item.adjusted}</td>
                                    <td>${item.Actual}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
    }
    
    // Generate Excel from data
    const generateExcel = (data) => {
        // Prepare data for Excel
        const excelData = data.map((item, index) => ({
            'S.No': index + 1,
            'Name': item.name,
            'Father Name': item.FatherName,
            'Employee ID': item.EmpleadoID,
            'Branch': item.branch_name,
            'Sign In': item.SignIn,
            'Sign Out': item.SignOut,
            'Late': item.late,
            'Adjusted': item.adjusted,
            'Actual': item.Actual
        }));
        
        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Late Comers Report');
        
        // Generate filename
        const filename = `Late_Comers_Report_${formData.fromDate}_to_${formData.toDate}.xlsx`;
        
        // Download the file
        XLSX.writeFile(wb, filename);
    }
    
    // Handle form submission
    const handleExport = async () => {
        // Validate required fields
        if (!formData.fromDate || !formData.toDate) {
            showToast('Please select both From Date and To Date', 'error')
            return
        }
        
        if (!formData.branch) {
            showToast('Please select a branch', 'error')
            return
        }
        
        if (isIndividualAtt && !formData.employee && !formData.employeeId) {
            showToast('Please select an employee or enter Employee ID for individual export', 'error')
            return
        }
        
        setIsExporting(true)
        /////showToast('Fetching late comers data...', 'success')
        
        try {
            // Prepare API data
            const apiData = {
                branch_id: formData.branch.value,
                dept_id: formData.department?.value !== undefined ? formData.department.value : null,
                emp_id: isIndividualAtt ? (formData.employee?.value || formData.employeeId) : null,
                from_date: formData.fromDate,
                to_date: formData.toDate
            }
            
            ////console.log('Calling API with data:', apiData)
            
            // Call the API
            const result = await getDetailedLateComers(apiData)
            
            if (result.success) {
                const lateComersData = result.data
                ////console.log('Late comers data received:', lateComersData)
                
                if (lateComersData && lateComersData.length > 0) {
                    // Generate the appropriate file based on export type
                    if (formData.exportType === 'PDF') {
                        generatePDF(lateComersData)
                        showToast('PDF generated successfully!', 'success')
                    } else if (formData.exportType === 'Excel') {
                        generateExcel(lateComersData)
                        showToast('Excel file downloaded successfully!', 'success')
                    }
                } else {
                    showToast('No late comers data found for the selected criteria', 'warning')
                }
            } else {
                showToast(result.error || 'Failed to fetch late comers data', 'error')
            }
        } catch (error) {
            console.error('Error exporting late comers report:', error)
            showToast('An error occurred while exporting the report', 'error')
        } finally {
            setIsExporting(false)
        }
    }
  return (
    <>
    <div className='flex flex-col space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col space-y-4'>
                <div>
                    <label className='text-[#698592] text-[12px] mb-1 block'>From Date</label>
                    <input 
                        type='date'
                        value={formData.fromDate}
                        onChange={(e) => handleInputChange('fromDate', e.target.value)}
                        className='w-full text-[#698592] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                </div>
                
                <div className=''>
                    <label className='text-[#698592] text-[12px] mb-1 block'>Select Branch</label>
                    <CustomSelect 
                        placeHolderTitle='Branch'
                        value={formData.branch}
                        options={[
                            { value: 0, label: 'All Branches' },
                            ...(empBranches?.map((branch) => ({ value: branch.id, label: branch.branch_name })) || [])
                        ]} 
                        onChangeHandler={handleBranchChange}
                    customStyles={false}
                    />
                    {loadingBranches && <div className="text-sm text-gray-500 mt-1">Loading branches...</div>}
                </div>
            </div>

            <div className='flex flex-col space-y-4'>
                <div>
                    <label className='text-[#698592] text-[12px] mb-1 block'>To Date</label>
                    <input 
                        type='date'
                        value={formData.toDate}
                        onChange={(e) => handleInputChange('toDate', e.target.value)}
                        className='w-full text-[#698592] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                </div>
                
                <div>
                    <label className='text-[#698592] text-[12px] mb-1 block'>Select Department</label>
                    <CustomSelect
                    placeHolderTitle='Department'
                        value={formData.department}
                        options={flattenDeptOptions(dept_subDept)}
                        onChangeHandler={handleDepartmentChange}
                    cStyle={true}
                        isDisabled={!formData.branch} // Disable if no branch selected
                    /> 
                    {loadingDepartments && <div className="text-sm text-gray-500 mt-1">Loading departments...</div>}
                </div> 
            </div>
        </div>

        <div className='text-[14px] space-y-3'>
            <div>
                <Checkbox 
                    label='Export an individual attendance' 
                    color='blue' 
                    onChange={handleCheckboxChangeAtt}
                />
            </div>
            {isIndividualAtt && (
                <div className='w-96 pl-[10px] space-y-2'>
                    <div>
                        <label className='text-[#698592] text-[12px] mb-1 block'>Select Employee (Optional)</label>
                        <CustomSelect
                            placeHolderTitle='Employee'
                            value={formData.employee}
                            options={empList?.map((emp) => ({ value: emp.id, label: emp.name }))}
                            onChangeHandler={(selectedOption) => handleInputChange('employee', selectedOption)}
                            cStyle={true}
                            isDisabled={!formData.department} // Disable if no department selected
                        />
                        {loadingEmployees && <div className="text-sm text-gray-500 mt-1">Loading employees...</div>}
                    </div>
                    <div>
                        <Input 
                            label='Or Enter Employee ID' 
                            color='blue'
                            value={formData.employeeId}
                            onChange={(e) => handleInputChange('employeeId', e.target.value)}
                            placeholder="Enter Employee ID manually"
                        />
                    </div>
                </div>
            )}

            <div>
                <label className='text-[#698592] text-[12px] mb-2 block'>Export Format</label>
                <div className='space-y-2'>
                    <div className='flex items-center'>
                        <Radio 
                            label='PDF' 
                            name='exportType' 
                            color='blue'
                            checked={formData.exportType === 'PDF'}
                            onChange={() => handleExportTypeChange('PDF')}
                        />
                    </div>
                    <div className='flex items-center'>
                        <Radio 
                            label='Excel' 
                            name='exportType' 
                            color='blue'
                            checked={formData.exportType === 'Excel'}
                            onChange={() => handleExportTypeChange('Excel')}
                        />
                </div>
                </div>
            </div>
        </div>

        <div>
            <CustomButton 
                loading={loading}
                title={isExporting ? 'Exporting...' : 'Export'}
                onClick={handleExport}
                disabled={isExporting}
                className={isExporting ? 'opacity-50 cursor-not-allowed' : ''}
            />
        </div>
    </div>
    </>
  )
}

export default ReportsLateComers