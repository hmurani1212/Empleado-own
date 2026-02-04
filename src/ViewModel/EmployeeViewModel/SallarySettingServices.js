import { useState } from "react"
import employeesApi from "../../Model/Data/Employees/Employees"
import { showToast } from "../../Components/Toaster/Toaster"
import useStore from "../../Store/store"

const useSettingServices = ()=>{

    const updateEmpSalarySetting = useStore((state)=> state.updateEmpSalarySetting)
    const updateEmpBankAccountInfo = useStore((state)=> state.updateEmpBankAccountInfo)
    const updateAccountDetail = useStore((state)=> state.updateAccountDetail)

    const [salarySettingValues, setSalarySettingValue] = useState({
        show:false,
        loading:false, 
        salaryTemplate:[],
        template:null,
        gratuity:'',
        ex_gratia:'',
        ex_gratia_amount:'',
        payment:null
    })

    const handleShowEditSalarySetting = async(id)=>{
        const apiData = {
            emp_id: id
        }

        setSalarySettingValue((prevState)=>({
            ...prevState,
            loading:true,
        }))

        try{
            const response = await employeesApi.gettingOfficialInfoSalary(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                const DB_DATA = responseData.DB_DATA
                setSalarySettingValue((prevState)=>({
                    ...prevState,
                    template:DB_DATA.salary_template_id,
                    salaryTemplate:responseData.template,
                    gratuity:DB_DATA.gratuity,
                    ex_gratia:DB_DATA.ex_gratia,
                    ex_gratia_amount:DB_DATA.ex_gratia_amount,                
                    show:true,
                    payment:DB_DATA.payment_mode
                }))
            }
            console.log('response', response)
        }catch(err){
            console.log(err)
        }finally{
            setSalarySettingValue((prevState)=>({
                ...prevState,
                loading:false,
            }))
        }
    }
    const handleCloseEditSalarySetting = ()=>{
        setSalarySettingValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }



    const salarySettingChangeHandler = (e)=>{
        const {name, value} = e.target 
        setSalarySettingValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
        
    }
    const handleSelectOfficialInfoSalary = (selected, field)=>{

        // console.log('selected', selected)
        
        setSalarySettingValue((prevState)=>({
            ...prevState,
            [field]:selected 
        }))
        
    }

    const getValue = (val) => (typeof val === 'object' && val !== null ? val.value.toString() : val);


    const handleUpdateEmpOfficialInfoSalary = async(id)=>{

        setSalarySettingValue((prevState)=>({
            ...prevState,
            loading:true
        }))

        const apiData = {
            emp_id:id,
            salary_template:getValue(salarySettingValues.template),
            payment_mode:getValue(salarySettingValues.payment),
            ex_gratia:salarySettingValues.ex_gratia,
            ex_gratia_amount:salarySettingValues.ex_gratia_amount,
            gratuity:salarySettingValues.gratuity
        }

        // Extract id

        const findTemplate = salarySettingValues.salaryTemplate?.find(
            (ele) => ele.id === getValue(salarySettingValues.template)
        );
        const stateData = {
            name : findTemplate.name,
            id:findTemplate.id,
            salary_amount:findTemplate.salary_amount,
            payment_mode:getValue(salarySettingValues.payment),
            ex_gratia:salarySettingValues.ex_gratia,
            ex_gratia_amount:salarySettingValues.ex_gratia === '0' ? '' : salarySettingValues.ex_gratia_amount ,
            gratuity:salarySettingValues.gratuity
        }

        

        try{
            const response = await employeesApi.updatingOfficialInfoSalary(apiData)
            console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                showToast('Salary Setting Updated Successfully', 'success')
                updateEmpSalarySetting(stateData)
                setSalarySettingValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
            }else{
                const error = responseData.ERROR_DESCRIPTION 
                showToast(error, 'error')
            }
        }catch(err){

        }finally{
            setSalarySettingValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }

    }

    /* Start of Bank account info */

    const [bankAccountInfoValue, setBankAccountInfoValue] = useState({
        show:false,
        loading:false,
        bankName:'',
        branchCode:'',
        accountType:null,
        accountTypeList:[],
        bankAccountTitle:'',
        bankAccountNo:'',
        branchName:'',
        newAccountType:''
    })


    const handleShowEditBankAccInfo = async(id)=>{
        const apiData = {
            emp_id: id
        }

        setBankAccountInfoValue((prevState)=>({
            ...prevState,
            loading:true,
        }))

        try{
            const response = await employeesApi.gettingBankAccountInfo(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                const DB_DATA = responseData.DB_DATA
                setBankAccountInfoValue((prevState)=>({
                    ...prevState,
                    bankName:DB_DATA.bank_name,
                    branchCode:DB_DATA.bank_branch_code,
                    accountType:DB_DATA.bank_account_type,
                    accountTypeList:[...responseData.account_types, {id:'other', account_type:'Other'}],
                    bankAccountTitle:DB_DATA.bank_account_title,
                    bankAccountNo:DB_DATA.bank_account_no,
                    branchName:DB_DATA.branch_name,
                    show:true
                }))
            }
            console.log('response', response)
        }catch(err){
            console.log(err)
        }finally{
            setBankAccountInfoValue((prevState)=>({
                ...prevState,
                loading:false,
            }))
        }
    }
    const handleCloseEditBankAccInfo = ()=>{
        setBankAccountInfoValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const handleEmpOBankAccInfoInputChange = (e)=>{
        const {name, value} = e.target

        setBankAccountInfoValue((prevState)=>({
            ...prevState,
            [name]:value
        }))
    }
    const handleSelectBankAccInfo = (selected, field)=>{

        setBankAccountInfoValue((prevState)=>({
            ...prevState,
            [field]:selected
        }))
    }



    const handleUpdateBankAccountInfo = async(id)=>{
        const apiData = {
            emp_id:id,
            account_no:bankAccountInfoValue.bankAccountNo,
            account_title:bankAccountInfoValue.bankAccountTitle,
            account_type_new:getValue(bankAccountInfoValue.accountType) === 'other' ?bankAccountInfoValue.newAccountType : '',
            account_type:getValue(bankAccountInfoValue.accountType),
            branch_code:bankAccountInfoValue.branchCode,
            branch_name:bankAccountInfoValue.branchName,
            bank_name:bankAccountInfoValue.bankName
        }

        setBankAccountInfoValue((prevState)=>({
            ...prevState,
            loading:true
        }))

        const satateData = {
            emp_id:id,
            account_no:bankAccountInfoValue.bankAccountNo,
            account_title:bankAccountInfoValue.bankAccountTitle,
            account_type:getValue(bankAccountInfoValue.accountType) === 'other' ?  bankAccountInfoValue.newAccountType:  bankAccountInfoValue.accountType.label,
            branch_code:bankAccountInfoValue.branchCode,
            branch_name:bankAccountInfoValue.branchName,
            bank_name:bankAccountInfoValue.bankName
        }
        try{

            const response = await employeesApi.updatingBankAccountInfo(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){     
                const newData = responseData.INSERTED_DATA  
                updateEmpBankAccountInfo(satateData)
                showToast('Bank Account Info Updated Successfully', 'success')
                setBankAccountInfoValue((prevState)=>({
                    ...prevState,
                    show:false,
                    accountTypeList:[...prevState.accountTypeList, {id:newData.bank_account_type, account_type:prevState.newAccountType}]
                }))

            }else{
                const error = responseData.ERROR_DESCRIPTION 
                showToast(error, 'error')
            }

        }catch(err){

        }finally{
            setBankAccountInfoValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
        
    }

    /* End of Bank account info */

    // Unified handler to update both salary settings and bank account info using update_account_detail endpoint
    const handleUpdateSalarySettingsAndBankAccount = async(id)=>{
        // Set loading state for both sections
        setSalarySettingValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        setBankAccountInfoValue((prevState)=>({
            ...prevState,
            loading:true
        }))

        // Prepare salary settings payload
        const salaryPayload = {
            salary_template:getValue(salarySettingValues.template),
            payment_mode:getValue(salarySettingValues.payment),
            ex_gratia:salarySettingValues.ex_gratia,
            ex_gratia_amount:salarySettingValues.ex_gratia_amount || '',
            gratuity:salarySettingValues.gratuity
        }

        // Prepare bank account payload
        const bankPayload = {
            emp_id:id,
            account_no:bankAccountInfoValue.bankAccountNo,
            account_title:bankAccountInfoValue.bankAccountTitle,
            account_type_new:getValue(bankAccountInfoValue.accountType) === 'other' ? bankAccountInfoValue.newAccountType : '',
            account_type:getValue(bankAccountInfoValue.accountType),
            branch_code:bankAccountInfoValue.branchCode,
            branch_name:bankAccountInfoValue.branchName,
            bank_name:bankAccountInfoValue.bankName
        }

        // Combine both payloads
        const combinedPayload = {
            emp_id:id,
            ...salaryPayload,
            ...bankPayload
        }

        try{
            const response = await updateAccountDetail(combinedPayload)
            
            if(response && response.STATUS === 'SUCCESSFUL'){
                // Update salary settings state
                const findTemplate = salarySettingValues.salaryTemplate?.find(
                    (ele) => ele.id === getValue(salarySettingValues.template)
                )
                if(findTemplate){
                    const stateData = {
                        name : findTemplate.name,
                        id:findTemplate.id,
                        salary_amount:findTemplate.salary_amount,
                        payment_mode:getValue(salarySettingValues.payment),
                        ex_gratia:salarySettingValues.ex_gratia,
                        ex_gratia_amount:salarySettingValues.ex_gratia === '0' ? '' : salarySettingValues.ex_gratia_amount ,
                        gratuity:salarySettingValues.gratuity
                    }
                    updateEmpSalarySetting(stateData)
                }

                // Update bank account state
                const bankStateData = {
                    emp_id:id,
                    account_no:bankAccountInfoValue.bankAccountNo,
                    account_title:bankAccountInfoValue.bankAccountTitle,
                    account_type:getValue(bankAccountInfoValue.accountType) === 'other' ?  bankAccountInfoValue.newAccountType:  bankAccountInfoValue.accountType?.label || getValue(bankAccountInfoValue.accountType),
                    branch_code:bankAccountInfoValue.branchCode,
                    branch_name:bankAccountInfoValue.branchName,
                    bank_name:bankAccountInfoValue.bankName
                }
                updateEmpBankAccountInfo(bankStateData)

                // Handle new account type if added
                if(response.INSERTED_DATA && getValue(bankAccountInfoValue.accountType) === 'other'){
                    setBankAccountInfoValue((prevState)=>({
                        ...prevState,
                        accountTypeList:[...prevState.accountTypeList, {id:response.INSERTED_DATA.bank_account_type, account_type:prevState.newAccountType}]
                    }))
                }

                showToast('Salary Settings and Bank Account Info Updated Successfully', 'success')
                
                // Close both edit modes
                setSalarySettingValue((prevState)=>({
                    ...prevState,
                    show:false,
                    loading:false
                }))
                setBankAccountInfoValue((prevState)=>({
                    ...prevState,
                    show:false,
                    loading:false
                }))
            }else{
                const error = response?.ERROR_DESCRIPTION || 'Failed to update account details'
                showToast(error, 'error')
                setSalarySettingValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
                setBankAccountInfoValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
            }
        }catch(err){
            console.error('Error updating salary settings and bank account:', err)
            showToast('An error occurred while updating account details', 'error')
            setSalarySettingValue((prevState)=>({
                ...prevState,
                loading:false
            }))
            setBankAccountInfoValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }

    return { salarySettingValues, handleShowEditSalarySetting, handleCloseEditSalarySetting, salarySettingChangeHandler,
        handleSelectOfficialInfoSalary,handleUpdateEmpOfficialInfoSalary,
        bankAccountInfoValue, handleCloseEditBankAccInfo,handleShowEditBankAccInfo, handleEmpOBankAccInfoInputChange,handleSelectBankAccInfo,
        handleUpdateBankAccountInfo, handleUpdateSalarySettingsAndBankAccount
    }
}


export default useSettingServices