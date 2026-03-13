import React, { useState } from 'react'
import useStore from "../../Store/store"
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { FaPencilAlt, FaDollarSign } from "react-icons/fa";
import SalaryIncrement from '../../View/Payroll/SalaryIncrement';
import payrollApi from '../../Model/Data/Payroll/Payroll';
import { showToast } from '../../Components/Toaster/Toaster';
import { validateIncrementForm } from '../../Validation/Validation';
import EditSalaryTemplate from '../../View/Payroll/EditSalaryTemplate';
import CreateSalaryTemplate from '../../View/Payroll/CreateSalaryTemplate';
import { formatDateString } from '../../services/__payrollServices';
import { useDebounce } from '../../services/__debounceServices';

const usePayroll = () => {
  const gettingSalaryTemp = useStore((state) => state.gettingSalaryTemp)
  const allSalaryTemp = useStore((state) => state.allSalaryTemp)
  const gettingManageEmpSalary = useStore((state) => state.gettingManageEmpSalary)
  const allEmpSalary = useStore((state) => state.allEmpSalary)
  const empSalaryTemplate = useStore((state) => state.empSalaryTemplate)
  const empSalaryLoaded = useStore((state) => state.empSalaryLoaded)
  const mountEmpSalary = useStore((state) => state.mountEmpSalary)
  const handleMountEmp = useStore((state) => state.handleMountEmp)
  const manageEmpSalarySearch = useStore((state) => state.manageEmpSalarySearch)
  const salaryTempSearch = useStore((state) => state.salaryTempSearch)
  const openDrawer = useStore((state) => state.openDrawer)
  const closeDrawer = useStore((state) => state.closeDrawer)
  const settingDrawerTitle = useStore ((state) => state.settingDrawerTitle)
  const settingComponent = useStore ((state) => state.settingComponent)
  const settingDrawerSize = useStore ((state) => state.settingDrawerSize)
  const settingSalaryTemp = useStore ((state) => state.settingSalaryTemp)
  const salary_id = useStore ((state) => state.salary_id)
  const deleteSalaryTemp = useStore ((state) => state.deleteSalaryTemp)
  const settingSingleData = useStore ((state) => state.settingSingleData)
  const dataEditSingle = useStore ((state) => state.dataEditSingle)
  const settingSingleTemp = useStore ((state) => state.settingSingleTemp)
  const singleTemp = useStore ((state) => state.singleTemp)
  const dataEditBranch = useStore ((state) => state.dataEditBranch)
  const handleUpdateTemplate = useStore ((state) => state.handleUpdateTemplate)
  const getDataGrossNet = useStore ((state) => state.getDataGrossNet)
  const getDashboardData = useStore ((state) => state.getDashboardData)
  const payrollOverviewLoading = useStore((state) => state.payrollOverviewLoading)
  const salaryTemplatesLoaded = useStore((state) => state.salaryTemplatesLoaded)
  const grossNetValues = useStore ((state) => state.grossNetValues)
  const mountPayrollOverview = useStore ((state) => state.mountPayrollOverview)
  const annualGrossSalary = useStore ((state) => state.annualGrossSalary)
  const getGrossSalary = useStore ((state) => state.getGrossSalary)
  const getAnnualGrossSalary  = useStore ((state) => state.getAnnualGrossSalary )
  const grossSalary  = useStore ((state) => state.grossSalary )
  const getNetSalary  = useStore ((state) => state.getNetSalary )
  const netSalary  = useStore ((state) => state.netSalary )
  const branches_payroll  = useStore ((state) => state.branches_payroll )
  const copyBranchesData  = useStore ((state) => state.copyBranchesData )
  const getAllBranchesPayroll  = useStore ((state) => state.getAllBranchesPayroll )
  const lastBranchId  = useStore ((state) => state.lastBranchId )
  const branchesLoaded = useStore((state) => state.branchesLoaded)
  
  const branchFilterRef = React.useRef({ branch_id: { value: 0, label: 'All Branches' } })
  const [loading, setLoading] = useState(false)
  
  // No automatic initial load here - ManageSalaryTemplate runs initial load once on mount.
  // This avoids multiple usePayroll() instances (Payroll.jsx, etc.) re-running with branch_id 0
  // when copyBranchesData changes and overwriting the user's branch filter.
  
  const payrollNavTitles = [
    {id:1, title: 'Payroll Overview', link:'/payroll/payroll_overview'},
    {id:2, title:'Manage Salary Template', link:'/payroll/manage_salary_template'},
    {id:3, title:'Manage Employees Salary', link:'/payroll/manage_employees_salary'},
    {id:4, title:'Manage Payslips', link:'/payroll/manage_payslip'},
    {id:5, title:'Export Reports', link:'/payroll/export_Reports'},
    {id:6, title:'Settings', link:'/payroll/settings'},
  ]

  const payrollActionMenu = [
    
    {id:1, title:'Increment', icon:<FaPlus className='text-yellow-500'/>},
    {id:2, title:'Edit', icon:<FaPencilAlt className='text-green-500'/>},
    {id:3, title:'Delete', icon:<FaTrashAlt className='text-red-500'/>}
    
  ]

  const empSalaryActionMenu = [
    {id:1, title:'Increment', icon:<FaPlus className='text-yellow-500'/>},
    {id:2, title:'Incentive/Deduction', icon:<FaDollarSign className='text-green-500'/>},
  ]


  const [listViewPayroll, setListViewPayroll] = useState(true)

  const handleListTogglePayroll = () => {
    setListViewPayroll(true)
  }

  const handleGridTogglePayroll = () => {
    setListViewPayroll(false)
  }

  const [openMenuPayroll, setOpenMenuPayroll] = useState([])
  const toggleMenuPayroll = (index, isOpen) => {
    setOpenMenuPayroll((prevOpenMenu) => ({
      ...prevOpenMenu,
      [index] : isOpen
    }))
  }


  const [openMenuEmpSalary, setOpenMenuEmpSalary] = useState([])
  const toggleMenuEmpSalary = (index, isOpen) => {
    setOpenMenuEmpSalary((prevOpenMenu) => ({
      ...prevOpenMenu,
      [index] : isOpen
    }))
  }

  const [empSalarySearch, setEmpSalarySearch] = useState([])
  const handleEmpSalaryChange = (e) => {
    const {name, value} = e.target

    setEmpSalarySearch((prevState) => ({
      ...prevState,
      [name]  : value
    }))
    manageEmpSalarySearch(value)
  }

  const [salaryTemplateSearch, setSalaryTemplateSearch] = useState([])
  
  // Debounced search uses ref so it always has latest branch (avoids second call with branch_id 0)
  const debouncedSearch = useDebounce(async (searchValue) => {
    const currentBranch = branchFilterRef.current?.branch_id?.value
    if (currentBranch !== undefined && currentBranch !== null) {
      gettingSalaryTemp(currentBranch, searchValue, 0, 10, true, false)
    }
  }, 500)
  
  const handleSalaryTempSearch = (e) => {
    const {name, value}  = e.target
    setSalaryTemplateSearch((prevState) => ({
      ...prevState,
      [name] : value
    }))

    // Trigger debounced search
    debouncedSearch(value)
  }


  

  const [incNewValues, setIncNewValues] = useState({
    salary_template_id :'',
    increment_detail:'',
    effective_from:'',
    salary_inc_type:'percent',
    inc_amount:''
  })

  const handleChangeIncValues = (e) => {
    const {name, value} = e.target
    setIncNewValues((prevState) => ({
      ...prevState,
      [name] : value

    })) 
  }

  const handleIncrementTypeChange = (e) => {
    const { value } = e.target;
    setIncNewValues((prevState) => ({
      ...prevState,
      salary_inc_type: value,
    }));
  };

    const handleIncrementDrawer = (ele) => {
      openDrawer()
      settingDrawerTitle('Salary Increment')
      settingDrawerSize('45vw')
      settingComponent(<SalaryIncrement 
    />)
  }

  const validateHandleIncrement = async(formData) => {
    const fields = Object.keys(formData);

        for (const field of fields) {
            try {
                await validateIncrementForm.validateAt(field, formData);
            } catch (error) {
                throw error;
            }
        }
  }

  const handleIncrement = async(e) => {
    setLoading(true)
    console.log(salary_id)
    e.preventDefault()
    const incData = {
      salary_template_id : salary_id,
      increment_detail : incNewValues.increment_detail,
      effective_from : incNewValues.effective_from,
      salary_inc_type : incNewValues.salary_inc_type,
      inc_amount : incNewValues.inc_amount,
    }
    console.log(incData)

    try{
      await validateHandleIncrement(incData);
      const response = await payrollApi.setSalaryIncrement(incData)
      const data = response.data
      console.log('IncrementData',data)

      if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
        showToast(data.MESSAGE, 'success')
        setIncNewValues({
          salary_template_id :'',
          increment_detail:'',
          effective_from:'',
          salary_inc_type:'percent',
          inc_amount:''
        })
        closeDrawer()
      }

    }catch(error){
      if (error.name === 'ValidationError') {
        showToast(error.message, 'error');
      } else if (error.response && error.response.data) {
        // Handle API errors (400, 500, etc.)
        const errorMessage = error.response.data.ERROR_DESCRIPTION || error.response.data.message || 'An error occurred while processing your request';
        showToast(errorMessage, 'error');
      } else if (error.message) {
        // Handle network errors or other errors
        showToast(error.message, 'error');
      } else {
        // Fallback for unknown errors
        showToast('An unexpected error occurred. Please try again.', 'error');
      }
      console.log('Error details:', error);
    }finally {
      setLoading(false)
    }
  }

  const [openDialogDelTemp, setOpenDialogDelTemp] = useState(false)
  const salaryTempDialog = () => {
    setOpenDialogDelTemp(!openDialogDelTemp)
  }

  
  const handleEditTemp = async(temp) => {
    console.log('Edit template data:', temp)
    
    // Use the existing template data instead of making API call
    // The temp object already contains all the data we need
    const editData = {
      name: temp.name,
      amount: temp.salary_amount,
      branch: {
        value: temp.branch_id,
        label: temp.branch_name
      },
      department: (temp.deptt_id != null && temp.deptt_id !== '') ? {
        value: temp.deptt_id,
        label: temp.dept_name || `Department ${temp.deptt_id}`
      } : null,
      deptt_id: temp.deptt_id || 0,
      policy_branch_add: temp.branch_id,
      tmp_id: temp.id
    }
    
    console.log('Setting edit data:', editData)
    
    // Set the edit values directly from the template data
    setEditValues(editData)
    settingSingleTemp(temp)
    
    // Open the edit drawer
    openDrawer()
    settingDrawerTitle('Edit')
    settingDrawerSize('45vw')
    settingComponent(<EditSalaryTemplate />)
  }

  const validateEditTemp = () => {
    // Use the actual values being displayed in the form
    const currentName = editValues.name || singleTemp?.name || '';
    const currentAmount = editValues.amount || singleTemp?.salary_amount || '';
    const currentBranch = editValues.branch || (singleTemp?.branch_id ? {
      value: singleTemp.branch_id,
      label: singleTemp.branch_name
    } : null);

    if(/^\s*$/.test(currentName)){
      showToast("Template name can't be empty", 'error');
      return;
    } else if(/^[\s]+/.test(currentName)){
      showToast('Remove spaces from the start of Template name', 'error');
      return
    } else if(/^[!@#$%^&*(),.?":{}|<>]/.test(currentName)){
      showToast("Template name can't start with special characters", 'error');
      return 
    } else if(currentAmount === ''){
      showToast('Salary Amount is Required', 'error');
      return 
    } else if(currentBranch === null || currentBranch === ''){
      showToast('Branch is Required', 'error');
      return 
    } 
    return true;
  };
  



  const [editValues, setEditValues] = useState({
    name : '',
    amount: '',
    branch : null,
    department: null,
    deptt_id: 0,
    policy_branch_add : '',
    tmp_id : '',
  })

  const handleEdit = async(e) => {
    setLoading(true)
    e.preventDefault()
    const validate = validateEditTemp()
    
    if(validate){
      try {
        // Get the current values (either from editValues or singleTemp)
        const currentName = editValues.name || singleTemp?.name || '';
        const currentAmount = editValues.amount || singleTemp?.salary_amount || '';
        const currentBranch = editValues.branch || (singleTemp?.branch_id ? {
          value: singleTemp.branch_id,
          label: singleTemp.branch_name
        } : null);

        // Use the new REST API structure (branch_id 0 = All Branches)
        const editData = {
          template_name: currentName,
          salary: parseFloat(currentAmount.replace(/,/g, '')), // Remove commas before parsing
          branch_id: currentBranch.value === 0 || currentBranch.value === '0' ? 0 : currentBranch.value,
          deptt_id: editValues.department?.value ?? editValues.deptt_id ?? 0
        }
        
        console.log('Updating template with data:', editData)
        console.log('Template ID:', singleTemp.id)
        
        const response = await payrollApi.updateSalaryTemp(singleTemp.id, editData)
        const data = response.data
        
        console.log('Update response:', data)
        
        if(response.status === 200){
          showToast('Template Updated Successfully', 'success')
          closeDrawer()
          // Refresh the salary templates list with current filters
          const currentBranchId = currentBranch.value
          const currentSearchValue = salaryTemplateSearch.searchPayroll || ''
          gettingSalaryTemp(currentBranchId, currentSearchValue, 0, 10, true, false) // Force reload
        } else {
          showToast('Error updating template', 'error')
        }
      } catch (error) {
        console.log('Error updating template:', error)
        showToast('Error updating template', 'error')
      }finally {
        setLoading(false)
      }
    }
  }

  const handleChangeBranchEdit = (selectedOption, field) => {
    console.log('selectedoptions', selectedOption)
    console.log('field', field)

    setEditValues((prevState) => ({
      ...prevState,
      [field]: selectedOption,
      ...(field === 'branch' ? { department: null, deptt_id: 0 } : {})
    }))
  }

  const handleChangeEditValues = (e) => {
    const {name, value} = e.target
    setEditValues((prevState) => ({
      ...prevState,
      [name] : value

    })) 
  }
 

  const handleMenuPayroll = (id, ele) => {
    switch(id) {
      case 1:
        handleIncrementDrawer(ele)
        settingSalaryTemp(ele.id)
      break;

      case 2:
        
        console.log('Edit')
        handleEditTemp(ele)
      break;

      case 3:
        salaryTempDialog(ele)
        settingSalaryTemp(ele.id)
        // Store the branch ID of the template being deleted
        setDeletingTemplateBranchId(ele.branch_id)
        console.log('Delete')
      break;

      default:
        console.log('Default Case')
    }
  }

  const handleDelete = async() => {
    setLoading(true)
    const delData = {
      id : salary_id
    }
    console.log(delData)
    try{
      const response = await payrollApi.delSalaryTemp(delData)
      const data = response.data
      console.log(data)

      // Check for the new API response structure: {"success":true,"data":{"success":1}}
      if(response.status === 200 && data.success && data.data && data.data.success){
        showToast('Salary Template Deleted Successfully', 'success')
        deleteSalaryTemp(delData)
        setOpenDialogDelTemp(false)
        
        // Refresh the salary templates list for the branch where template was deleted
        const currentSearchValue = salaryTemplateSearch.searchPayroll || ''
        if (deletingTemplateBranchId) {
          gettingSalaryTemp(deletingTemplateBranchId, currentSearchValue, 0, 10, true, false) // Force reload with the deleted template's branch
          setDeletingTemplateBranchId(null) // Reset after use
        } else if (branchFilter?.branch_id?.value !== undefined && branchFilter?.branch_id?.value !== null) {
          gettingSalaryTemp(branchFilter.branch_id.value, currentSearchValue, 0, 10, true, false) // Force reload with current filter
        } else {
          // If no branch filter is set, refresh with "All Branches" (0)
          gettingSalaryTemp(0, currentSearchValue, 0, 10, true, false) // Force reload with All Branches
        }

      } else {
        // Fallback to old response structure for backward compatibility
        if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
          showToast('Salary Template Deleted Successfully', 'success')
          deleteSalaryTemp(delData)
          setOpenDialogDelTemp(false)
          
          // Refresh the salary templates list for the branch where template was deleted
          const currentSearchValue = salaryTemplateSearch.searchPayroll || ''
          if (deletingTemplateBranchId) {
            gettingSalaryTemp(deletingTemplateBranchId, currentSearchValue, 0, 10, true) // Force reload with the deleted template's branch
            setDeletingTemplateBranchId(null) // Reset after use
          } else if (branchFilter?.branch_id?.value !== undefined && branchFilter?.branch_id?.value !== null) {
            gettingSalaryTemp(branchFilter.branch_id.value, currentSearchValue, 0, 10, true) // Force reload with current filter
          } else {
            // If no branch filter is set, refresh with "All Branches" (0)
            gettingSalaryTemp(0, currentSearchValue, 0, 10, true) // Force reload with All Branches
          }
        } else {
          showToast(data.ERROR_DESCRIPTION || 'Failed to delete salary template', 'error')
          setOpenDialogDelTemp(false)
        }
      }
    }catch(error){
      console.log(error)
      showToast('An error occurred while deleting salary template', 'error')
      setOpenDialogDelTemp(false)
    }finally {
      setLoading(false)
    }
    
  }

  const handleCreateSalaryTemplate = async(formData) => {
    setLoading(true)
    console.log('Creating salary template:', formData)
    
    // Validate form data
    if (!formData.name || !formData.amount || !formData.branch) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    const createData = {
      template_name: formData.name,
      salary: parseFloat(formData.amount.replace(/,/g, '')), // Remove commas before parsing
      branch_id: formData.branch.value,
      deptt_id: formData.department?.value ?? 0
    }

    try {
      const response = await payrollApi.createSalaryTemp(createData)
      const data = response.data
      console.log('Create response:', data)

      if (response.status === 200 && data.success) {
        showToast('Salary Template Created Successfully', 'success')
        closeDrawer()
        
        // Refresh the salary templates list for the branch where template was created
        const currentSearchValue = salaryTemplateSearch.searchPayroll || ''
        gettingSalaryTemp(formData.branch.value, currentSearchValue, 0, 10, true, false) // Force reload with the created branch ID
        
        // Also update the branch filter to show the correct branch data
        const createdBranch = branches_payroll.find(branch => branch.id === formData.branch.value)
        if (createdBranch) {
          setBranchFilter({
            branch_id: {
              value: formData.branch.value,
              label: createdBranch.branch_name
            }
          })
        }
      } else {
        showToast(data.message || 'Failed to create salary template', 'error')
      }
    } catch (error) {
      console.log('Error creating salary template:', error)
      showToast('Error creating salary template', 'error')
    }finally {
      setLoading(false)
    }
  }

  const handleCreateTemplateDrawer = () => {
    openDrawer()
    settingDrawerTitle('Create New Template')
    settingDrawerSize('45vw')
    settingComponent(<CreateSalaryTemplate />)
  }

  const annual_gross_salary_labels = annualGrossSalary?.map(item => item.month || item.month_name || item.label || item.name || '');
  const annual_gross_salary_data = annualGrossSalary?.map(item => item.value ?? item.amount ?? item.total ?? 0);

  const formattedData = grossSalary?.map(item => ({
    date: formatDateString(item.date),
    value: item.value
  }));

  const gross_label = formattedData?.map(item => item.date)
  const gross_value = grossSalary?.map(item => item.value)

  const formattedDataNet = netSalary?.map(item => ({
    date: formatDateString(item.date),
    value: item.value
  }));

  const net_salary_label = formattedDataNet?.map(item => item.date)
  const net_salary_value = netSalary?.map(item => item.value)

  const [payrollChartValues, setPayrollChartValues] = useState({
    annual_year : '',
    gross_salary:'',
    netSalary:''
  })

  const handleChangeYear = (selectedOption, field) => {
    setPayrollChartValues((prevState) => {
      const next = { ...prevState, [field]: selectedOption }
      if (field === 'annual_year') {
        next.gross_salary = selectedOption
      } else if (field === 'gross_salary') {
        next.annual_year = selectedOption
      }
      return next
    })

    if (field === 'annual_year' || field === 'gross_salary') {
      getGrossSalary(selectedOption.value)
    } else if (field === 'netSalary') {
      getNetSalary(selectedOption.value)
    }
  }

  const [branchFilter, setBranchFilter] = useState({
    branch_id: { value: 0, label: 'All Branches' },
  })

  React.useEffect(() => {
    branchFilterRef.current = branchFilter
  }, [branchFilter])
  
  // Store the branch ID of the template being deleted
  const [deletingTemplateBranchId, setDeletingTemplateBranchId] = useState(null)

  const handleBranchFilterPayroll = (selectedOption, field) => {
    setBranchFilter((prevState) => ({
      ...prevState,
      [field] : selectedOption
    }))

    // Always call with the selected branch_id and current search value
    // Reset to page 0 when filter changes
    const currentSearchValue = salaryTemplateSearch.searchPayroll || ''
    gettingSalaryTemp(selectedOption.value, currentSearchValue, 0, 10, true, false)
  }
 

  return {payrollNavTitles, openMenuEmpSalary, payrollActionMenu, gettingSalaryTemp, allSalaryTemp, listViewPayroll, handleListTogglePayroll, handleGridTogglePayroll, openMenuPayroll, toggleMenuPayroll, gettingManageEmpSalary, allEmpSalary, toggleMenuEmpSalary, empSalaryActionMenu, empSalaryTemplate, empSalaryLoaded, mountEmpSalary, handleMountEmp, manageEmpSalarySearch, handleEmpSalaryChange, empSalarySearch, handleSalaryTempSearch, salaryTemplateSearch, handleMenuPayroll,handleIncrementTypeChange,
    handleIncrement, incNewValues,handleChangeIncValues, openDialogDelTemp, salaryTempDialog, handleDelete, editValues, dataEditSingle, dataEditBranch, handleChangeBranchEdit, handleChangeEditValues, handleEdit, singleTemp, getDataGrossNet, getDashboardData, grossNetValues, mountPayrollOverview, annualGrossSalary, annual_gross_salary_labels, annual_gross_salary_data, getGrossSalary, getAnnualGrossSalary, gross_label, gross_value, getNetSalary, net_salary_label, net_salary_value,
    payrollChartValues, handleChangeYear, branches_payroll, copyBranchesData, getAllBranchesPayroll, handleBranchFilterPayroll, branchFilter, handleCreateSalaryTemplate, handleCreateTemplateDrawer, handleIncrementDrawer, loading, payrollOverviewLoading, salaryTemplatesLoaded, branchesLoaded
  }
}

export default usePayroll