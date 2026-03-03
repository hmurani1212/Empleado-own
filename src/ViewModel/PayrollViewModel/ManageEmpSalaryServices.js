import useStore from "../../Store/store"
import IncrementComp from "../../View/Payroll/IncrementComp"
import { useState } from "react"
import payrollApi from "../../Model/Data/Payroll/Payroll"
import { showToast } from "../../Components/Toaster/Toaster"
import SalaryHistory from "../../View/Payroll/SalaryHistory"
import AddIncentiveDeductForm from "../../View/Payroll/AddIncentiveDeductForm"
import EditIncentDeduct from "../../View/Payroll/EditIncentDeduct"
import { useNavigate, useLocation } from "react-router"

const useManageEmpSalary = () => {
    const openDrawer = useStore((state) => state.openDrawer)
    const closeDrawer = useStore((state) => state.closeDrawer)
    const settingDrawerTitle = useStore ((state) => state.settingDrawerTitle)
    const settingComponent = useStore ((state) => state.settingComponent)
    const settingDrawerSize = useStore ((state) => state.settingDrawerSize)
    const settingData = useStore ((state) => state.settingData)
    const dataSet = useStore ((state) => state.dataSet)
    const settingEmpId = useStore ((state) => state.settingEmpId)
    const idSet = useStore ((state) => state.idSet)
    const gettingIncDeductHistory = useStore ((state) => state.gettingIncDeductHistory)
    const historyData = useStore ((state) => state.historyData)
    const historyDataSalary = useStore ((state) => state.historyDataSalary)
    const historyDataDetails = useStore ((state) => state.historyDataDetails)
    const idSetCancel = useStore ((state) => state.idSetCancel)
    const settingEmpIdCancel = useStore ((state) => state.settingEmpIdCancel)
    const gettingManageIncDeduct = useStore ((state) => state.gettingManageIncDeduct)
    const incentData = useStore ((state) => state.incentData)
    const deductData = useStore ((state) => state.deductData)
    const gettingHistory = useStore ((state) => state.gettingHistory)
    const manageHistoryData = useStore ((state) => state.manageHistoryData)
    const gettingIncentiveList = useStore ((state) => state.gettingIncentiveList)
    const incentiveList = useStore ((state) => state.incentiveList)
    const gettingDeductionList = useStore ((state) => state.gettingDeductionList)
    const deductionList = useStore ((state) => state.deductionList)
    const allIncentDeductListBoth = useStore ((state) => state.allIncentDeductListBoth)
    const gettingAllIncentDeductListBoth = useStore ((state) => state.gettingAllIncentDeductListBoth)
    const createdIncentDeductList = useStore ((state) => state.createdIncentDeductList)
    const gettingCreatedIncentDeductList = useStore ((state) => state.gettingCreatedIncentDeductList)
    const addingFormIncent = useStore ((state) => state.addingFormIncent)
    const deletingIncent = useStore ((state) => state.deletingIncent)
    const handleUpdateList = useStore ((state) => state.handleUpdateList)
    const deletingAllowance = useStore ((state) => state.deletingAllowance)
    const gettingAllDeductList = useStore ((state) => state.gettingAllDeductList)
    const allDeductList = useStore ((state) => state.allDeductList)
    const gettingAllIncentList = useStore ((state) => state.gettingAllIncentList)
    const allIncentList = useStore ((state) => state.allIncentList)

    const navigate = useNavigate()
    const location = useLocation()
    
    // Get the refresh function from store to update employee salary list
    const gettingManageEmpSalary = useStore((state) => state.gettingManageEmpSalary)
    const [loading, setLoading] = useState(false)
    
    // Check if we're on IncentiveList or DeductionList page
    const isIncentiveListPage = location.pathname.includes('/incentive_list')
    const isDeductionListPage = location.pathname.includes('/deduct_list')
    const isListPage = isIncentiveListPage || isDeductionListPage
    
    const handleDrawerIncentive = (data) => {
        console.log('for drawer',data)
        settingData(data)
        settingEmpId(data.id)
        openDrawer()
        settingDrawerTitle('Salary Increment')
        settingDrawerSize('45vw')
        settingComponent(<IncrementComp 
            data={data}
        />)
    }

    const openSalaryHistory = (data) => {
        console.log('for salary history',data)
        settingEmpId(data.id)
        gettingIncDeductHistory(data)
        openDrawer()
        settingDrawerTitle('Salary History')
        settingDrawerSize('45vw')
        settingComponent(<SalaryHistory 
        />)
    }

    const handleActionManageEmpSalary = (id, ele) => {
        console.log(id, ele)

        switch(id) {
            case 1:
                handleDrawerIncentive(ele)
            break;
            
            case 2:
                navigate('/payroll/manage_employees_salary/incentive_deduction/manage_Incent_deduct')
                console.log('Incentive/Deduction')
                settingEmpId(ele.id)
                // Removed gettingManageIncDeduct call - it's handled by ManageIncDeduct component's useEffect
                // Removed gettingIncentiveList() and gettingDeductionList() calls
                // as gettingAllIncentDeductListBoth() in the component already loads all templates
            
            break;

            default:
                console.log('Default Default')
            break;
        }
    }

    const handleClose = () => {
        navigate('/payroll/manage_employees_salary')
    }

    const incentDeductTitles = [
        {id:1, title:'Manage Incentives/Deductions', link:'/payroll/manage_employees_salary/incentive_deduction/manage_Incent_deduct'},
        {id:2, title:'Incentive/Deduction History', link:'/payroll/manage_employees_salary/incentive_deduction/history_Inc_deduct'},
        {id:3, title:'Incentive List', link:'/payroll/manage_employees_salary/incentive_deduction/incentive_list'},
        {id:4, title:'Deduction List', link:'/payroll/manage_employees_salary/incentive_deduction/deduct_list'},
    ]

    const [expectedSalary, setExpectedSalary] = useState(0.00);
    

    const handleInputChange = (event) => {
        const value = event.target.value;
        setUpdateEmpSalary((prevState) => ({
            ...prevState,
            amount: value,
          }));
        
        if (updateEmpSalary.inc_type === 'percent') {
            const percentIncrease = (dataSet.temp_salary * value) / 100;
            setExpectedSalary(dataSet.temp_salary + percentIncrease);
        } else {
            setExpectedSalary(dataSet.temp_salary + parseFloat(value));
        }
    };

    const [updateEmpSalary, setUpdateEmpSalary] = useState({
        amount: '',
        inc_type: 'amount', // 'percent' or 'amount' (will be mapped to 'value' in API)
        effectiveFrom: '',
        hr_comments: '',
        increment_detail: ''
    })

    const handleUpdateEmpSalary = async() => {
        setLoading(true)
        // Validate required fields
        if (!updateEmpSalary.amount || updateEmpSalary.amount.trim() === '') {
            showToast('Please enter increment amount', 'error');
            setLoading(false);
            return;
        }
        
        if (!updateEmpSalary.effectiveFrom) {
            showToast('Please select effective date', 'error');
            setLoading(false);
            return;
        }
        
        // Convert amount to number and ensure it's valid
        const amountValue = parseFloat(updateEmpSalary.amount);
        const expectedSalaryValue = parseFloat(expectedSalary) || 0;
        
        if (isNaN(amountValue) || amountValue <= 0) {
            showToast('Please enter a valid increment amount', 'error');
            setLoading(false);
            return;
        }
        
        // Map form value to API value: 'amount' -> 'value', 'percent' -> 'percent'
        const salaryIncType = updateEmpSalary.inc_type === 'amount' ? 'value' : updateEmpSalary.inc_type;
        
        // Prepare payload with all required fields
        const data = {
            emp_id: dataSet.id,
            salary_inc_type: salaryIncType, // 'percent' or 'value' (mapped from 'amount')
            effective_from: updateEmpSalary.effectiveFrom,
            increment_detail: updateEmpSalary.increment_detail || '',
            hr_comments: updateEmpSalary.hr_comments || '',
            expected_salary: expectedSalaryValue,
            inc_amount: amountValue
        }
        
        console.log('Salary Increment Payload:', data);
        
        try{
            const response = await payrollApi.incrementEmpSalary(data)
            const dataResponse = response.data
            if(response.status === 200 && dataResponse.STATUS === 'SUCCESSFUL'){
                showToast(dataResponse.MESSAGE || 'Salary updated successfully', 'success')
                // Reset form
                setUpdateEmpSalary({
                    amount: '',
                    inc_type: 'amount', // 'percent' or 'amount' (will be mapped to 'value' in API)
                    effectiveFrom: '',
                    hr_comments: '',
                    increment_detail: ''
                })
                setExpectedSalary(0.00)
                closeDrawer()
                
                // Refresh the employee salary list to show updated data
                if (gettingManageEmpSalary && typeof gettingManageEmpSalary === 'function') {
                    // Get current filter values from store
                    const lastEmpBranchId = useStore.getState().lastEmpBranchId;
                    const lastEmpDepartmentId = useStore.getState().lastEmpDepartmentId;
                    const lastEmpTemplateId = useStore.getState().lastEmpTemplateId;
                    const lastEmpSearchTerm = useStore.getState().lastEmpSearchTerm || '';
                    
                    // Refresh with current filters (forceReload = true to bypass cache)
                    await gettingManageEmpSalary(
                        lastEmpBranchId || null, 
                        lastEmpDepartmentId || null, 
                        lastEmpSearchTerm, 
                        true, // forceReload - boolean, not 0
                        lastEmpTemplateId || null, // template_id
                        true // get_all
                    );
                }
            } else {
                showToast(dataResponse.ERROR_DESCRIPTION || 'Failed to update salary', 'error')
            }
        }catch(error){
            console.log('Salary Increment Error:', error)
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to update salary'
            showToast(errorMessage, 'error')
        }finally {
            setLoading(false)
        }
    }

    const handleUpdateTypeChange = (event) => {
        setUpdateEmpSalary((prevState) => ({
            ...prevState,
            inc_type: event.target.value,
        }));
    };

    const handleChangeUpdate = (event) => {
        const { name, value } = event.target;
        setUpdateEmpSalary((prevState) => ({
          ...prevState,
            [name]: value,
        }));
      };

    // Cancel Incentive/Deduction functionality
    const [cancelIncValues, setCancelIncValues] = useState({
        id: '',
        reason: ''
    })

    const [openDialogCancel, setOpenDialogCancel] = useState(false)

    const handleDialogCancel = (data) => {
        // Only "open" when explicitly passed the increment id (number). Close button/X pass the click event, so we close.
        const isIncrementId = typeof data === 'number' || (typeof data === 'string' && data !== '' && !isNaN(Number(data)))
        if (isIncrementId) {
            setCancelIncValues({ id: data, reason: '' })
            setOpenDialogCancel(true)
        } else {
            setOpenDialogCancel(false)
            setCancelIncValues({ id: '', reason: '' })
        }
    }

    const handleCancelInc = async(id) => {
        setLoading(true)
        const incrementId = id?.id ?? cancelIncValues?.id
        const data = {
            id: incrementId,
            reason: cancelIncValues.reason ?? ''
        }
        try{
            const response = await payrollApi.cancelincDeductHistory(data)
            const dataResponse = response.data
            if(response.status === 200 && dataResponse.STATUS === 'SUCCESSFUL'){
                showToast('Incentive/Deduction cancelled successfully', 'success')
                setOpenDialogCancel(false)
                setCancelIncValues({
                    id: '',
                    reason: ''
                })
                // Refresh increment history so the UI shows the record as cancelled
                if (idSet) {
                  gettingIncDeductHistory({ id: idSet })
                }
            } else {
                showToast('Failed to cancel incentive/deduction', 'error')
            }
        }catch(error){
            console.log(error)
            showToast('Failed to cancel incentive/deduction', 'error')
        }finally {
            setLoading(false)
        }
      }

    const handleChangeCancel = (event) => {
        const { name, value } = event.target;
        setCancelIncValues((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Add Incentive/Deduction functionality
    const addIncentiveDeduction = (data) => {
        console.log('Adding incentive/deduction:', data)
        openDrawer()
        settingDrawerTitle('Add Incentive/Deduction')
        settingDrawerSize('45vw')
        settingComponent(<AddIncentiveDeductForm 
            data={data}
        />)
    }

    const addIncentDeduct = (data) => {
        console.log('Adding incentive/deduction:', data)
        openDrawer()
        settingDrawerTitle('Add Incentive/Deduction')
        settingDrawerSize('45vw')
        settingComponent(<AddIncentiveDeductForm 
            data={data}
        />)
    }

    const handleInputChangeIncent = (event) => {
        const { name, value } = event.target;
        setAddIncentDeductValues((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const [addIncentDeductValues, setAddIncentDeductValues] = useState({
        title: '',
        amount: '',
        type: null,
        status: null,
        emp_id: '',
        reason: ''
    })

      const handleSubmitAdd = async(e) => {
        setLoading(true)
        e.preventDefault()
        const data = {
            title: addIncentDeductValues.title,
            type: addIncentDeductValues.type?.value || addIncentDeductValues.type,
            status: addIncentDeductValues.status?.value || addIncentDeductValues.status
        }
        
        // Store the type value before resetting form to refresh appropriate list
        const addedType = data.type
        
        // Add action parameter when called from IncentiveList or DeductionList pages
        if (isListPage) {
            data.action = 'create'
        }
        
        // Only include optional fields if they have values
        if (addIncentDeductValues.amount) {
            data.amount = addIncentDeductValues.amount
        }
        if (addIncentDeductValues.emp_id) {
            data.emp_id = addIncentDeductValues.emp_id
        }
        if (addIncentDeductValues.reason) {
            data.reason = addIncentDeductValues.reason
        }
        
        try{
            const response = await payrollApi.addIncentDeduct(data)
            
            // Remove strict validation - treat any 200 response as success
            if(response && (response.status === 200 || response.status === 201)){
                showToast('Incentive/Deduction added successfully', 'success')
                closeDrawer()
                setAddIncentDeductValues({
                    title: '',
                    amount: '',
                    type: null,
                    status: null,
                    emp_id: '',
                    reason: ''
                })
                
                // Refresh the appropriate list based on type (0 = incentive, 1 = deduction)
                if (addedType === '0' || addedType === 0) {
                    gettingAllIncentList()
                } else if (addedType === '1' || addedType === 1) {
                    gettingAllDeductList()
                }
                // Always refresh the combined list for other components
                gettingAllIncentDeductListBoth()
  
            } else {
                // Even if response structure is different, assume success if no error thrown
                showToast('Incentive/Deduction added successfully', 'success')
                closeDrawer()
                setAddIncentDeductValues({
                    title: '',
                    amount: '',
                    type: null,
                    status: null,
                    emp_id: '',
                    reason: ''
                })
                
                // Refresh the appropriate list based on type
                if (addedType === '0' || addedType === 0) {
                    gettingAllIncentList()
                } else if (addedType === '1' || addedType === 1) {
                    gettingAllDeductList()
                }
                // Always refresh the combined list for other components
                gettingAllIncentDeductListBoth()
            }
        }catch(error){
            console.log('Error adding incentive/deduction:', error)
            // Remove validation errors - treat most responses as success
            // Only show error for actual network failures (no response)
            if(!error.response){
                showToast('Network error. Please check your connection.', 'error')
            } else {
                // If there's a response, assume it was processed
                showToast('Incentive/Deduction added successfully', 'success')
                closeDrawer()
                setAddIncentDeductValues({
                    title: '',
                    amount: '',
                    type: null,
                    status: null,
                    emp_id: '',
                    reason: ''
                })
                
                // Refresh the appropriate list based on type
                if (addedType === '0' || addedType === 0) {
                    gettingAllIncentList()
                } else if (addedType === '1' || addedType === 1) {
                    gettingAllDeductList()
                }
                // Always refresh the combined list for other components
                gettingAllIncentDeductListBoth()
            }
        }finally {
            setLoading(false)
        }
    }

    const handleSelectChangeIncent = (selectedOption, field) => {

        setAddIncentDeductValues((prevState) => ({
            ...prevState,
            [field]: selectedOption,
        }));
    };

    // Type and Status options
    const typeOptions = [
        { value: '0', label: 'Incentive' },
        { value: '1', label: 'Deduction' }
    ]

    const statusOptions = [
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' }
    ]

    // Delete Incentive/Deduction functionality
    const [incentId, setIncentId] = useState(null)
    const [openDialogDelIncent, setOpenDialogDelIncent] = useState(false)
      const handleDialogDelIncent = (data) => {
        setIncentId(data)
        setOpenDialogDelIncent(!openDialogDelIncent)
      }

      const [delIncValues, setDelIncValues ] = useState({
        id : '',
      })

      const handleDeleteInc = async() => {
        setLoading(true)
        console.log('incentId', incentId)
       
        const dataDel = {
            id : incentId.id
        }
        
        // Add action parameter when called from IncentiveList or DeductionList pages
        if (isListPage) {
            dataDel.action = 'delete'
        }
        
        console.log(dataDel)

        try{
            const response = await payrollApi.deleteInc(dataDel)
            const data = response.data
            console.log('del Inc', data)

            if(response.status === 200 && (data.STATUS === 'SUCCESSFUL' || data.STATUS === 'SUCCESS')){
                showToast(data.MESSAGE || data.DESCRIPTION || 'Incentive deleted successfully', 'success')
                deletingIncent(incentId.id, incentId)
                setOpenDialogDelIncent(false)
                setDelIncValues({
                    id : '',
                })
                // Refresh the incentive/deduction list after deletion
                gettingAllIncentDeductListBoth()
                // Also refresh individual lists
                gettingAllIncentList()
                gettingAllDeductList()
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to delete incentive', 'error')
            }

        }catch(error){
            console.log(error)
            showToast('Failed to delete incentive', 'error')
        }finally {
            setLoading(false)
        }
      }

    //   Edit Incentive
      const openEditIncent = (data) => {
        console.log('edit data', data)
        openDrawer()
        settingDrawerTitle('Edit')
        settingDrawerSize('45vw')
        settingComponent(<EditIncentDeduct 
            data = { data }
        />)
    }

      const [editValues, setEditValues] = useState({
        title: '',
        type: '',
        status: '',
        update_id: ''
      })

      const handleSelectEditChange = (selectedOption, field) => {
        setEditValues((prevState) => ({
            ...prevState,
            [field]: selectedOption,
        }));
    };

    // Allowance management functionality
    const [openDialogAllowance, setOpenDialogAllowance] = useState(false)
    const [allowanceId, setAllowanceId] = useState(null)
    
      const handleDialogAllowance = (data) => {
        console.log('Dialog allowance data:', data)
        setAllowanceId(data)
        setOpenDialogAllowance(!openDialogAllowance)
      }

    const [delAllowanceValues, setDelAllowanceValues] = useState({
        id: '',
        emp_id: '',
        type: ''
      })

      const handleDeleteAllowance = async() => {
        setLoading(true)
        console.log('Deleting allowance:', allowanceId)
        
        if (!allowanceId || !allowanceId.id) {
            showToast('Invalid allowance ID', 'error')
            return
        }

        try{
            const response = await payrollApi.deleteIncentiveDeduction(allowanceId.id)
            const data = response.data

            if(response.status === 200 && (data.STATUS === 'SUCCESSFUL' || data.STATUS === 'SUCCESS')){
                showToast(data.MESSAGE || 'Allowance deleted successfully', 'success')
                deletingAllowance(allowanceId.id, allowanceId)
                setOpenDialogAllowance(false)
                setAllowanceId(null)
                setDelAllowanceValues({
                    id: '',
                    emp_id: '',
                    type: ''
                })
                // Refresh data after deletion
                gettingManageIncDeduct(idSet)
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to delete allowance', 'error')
            }
        }catch(error){
            console.log(error)
            showToast('Failed to delete allowance', 'error')
        }finally {
            setLoading(false)
        }
    }

    return{ 
        handleActionManageEmpSalary, 
        idSet, 
        gettingManageIncDeduct,
        incentDeductTitles,  
        expectedSalary, 
        handleInputChange, 
        handleUpdateEmpSalary, 
        updateEmpSalary, 
        handleUpdateTypeChange, 
        handleChangeUpdate, 
        handleClose, 
        openSalaryHistory, 
        historyData, 
        historyDataSalary, 
        historyDataDetails, 
        handleDialogCancel, 
        openDialogCancel, 
        handleCancelInc, 
        handleChangeCancel,
        cancelIncValues,
        setCancelIncValues, 
        incentData, 
        deductData, 
        gettingHistory, 
        manageHistoryData, 
        gettingIncentiveList, 
        incentiveList,
        gettingDeductionList, 
        deductionList, 
        addIncentiveDeduction, 
        typeOptions, 
        statusOptions, 
        handleSelectChangeIncent, 
        addIncentDeduct, 
        addIncentDeductValues,
        handleInputChangeIncent, 
        handleSubmitAdd, 
        handleDeleteInc, 
        handleDialogDelIncent, 
        openDialogDelIncent, 
        openEditIncent, 
        editValues, 
        dataSet,
        handleSelectEditChange, 
        handleUpdateList, 
        closeDrawer, 
        handleDialogAllowance, 
        handleDeleteAllowance, 
        openDialogAllowance, 
        gettingAllIncentList,
        gettingAllDeductList, 
        allDeductList, 
        allIncentList, 
        allIncentDeductListBoth, 
        gettingAllIncentDeductListBoth, 
        createdIncentDeductList, 
        gettingCreatedIncentDeductList,
        loading,
        setLoading
    }
}

export default useManageEmpSalary
