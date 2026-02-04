import { useReducer, useEffect } from "react";
import useStore from "../../Store/store";
import { gettingDepartmentsServices } from "../../services/__frequentApiServices";
import payrollApi from "../../Model/Data/Payroll/Payroll";

// localStorage key for persisting Generate Payslip filters
const GENERATE_PAYSLIP_FILTERS_KEY = 'generatePayslipFilters';

// Helper function to load filters from localStorage
const loadFiltersFromStorage = () => {
    try {
        const savedFilters = localStorage.getItem(GENERATE_PAYSLIP_FILTERS_KEY);
        if (savedFilters) {
            return JSON.parse(savedFilters);
        }
    } catch (error) {
        console.error('Error loading Generate Payslip filters from localStorage:', error);
    }
    return null;
};

// Helper function to save filters to localStorage
const saveFiltersToStorage = (filters) => {
    try {
        // Only save branch and department filters
        const filtersToSave = {
            branch_id: filters.branch_id,
            department_id: filters.department_id
        };
        localStorage.setItem(GENERATE_PAYSLIP_FILTERS_KEY, JSON.stringify(filtersToSave));
    } catch (error) {
        console.error('Error saving Generate Payslip filters to localStorage:', error);
    }
};

const useManagePaySlip = ()=>{

    const getAllBranchesPayroll = useStore((state)=> state.getAllBranchesPayroll)
    const branches_payroll = useStore((state)=> state.branches_payroll)
    const departments_payroll = useStore((state)=> state.departments_payroll)

    const getDefaultInitialState = () => ({
        view:0,
        departments:[],
        department_id:null,
        branch_id:null,
        type:null,
        empSalary:[],
        originalEmpSalary: [], // To store the unfiltered list of employees
        search_emp:'',
        showFilter:false, 
    });

    // Load saved filters from localStorage or use defaults
    const savedFilters = loadFiltersFromStorage();
    const managePaySlipInitialState = savedFilters 
        ? { ...getDefaultInitialState(), ...savedFilters }
        : getDefaultInitialState();


    const managePyaSlipReducer = (state, action)=>{
        switch (action.type) {
            case 1:
                getAllBranchesPayroll()
                return {...state, view:action.payload}
        
            case 2:
                return {...state, view:action.payload}
            case 'BRANCH':
                return{...state, branch_id:action.value, showFilter:true, departments:action.payload, department_id:null }
            case 'SELECTION':
                return{...state, [action.field]:action.value }
            case 'EMP_SALARY':
                return{...state, empSalary:action.payload, originalEmpSalary: action.payload }
            default:
                return state;
        }
    }

    const [managePaySlipState, dispatch] = useReducer(managePyaSlipReducer, managePaySlipInitialState)

    // Save filters to localStorage whenever branch_id or department_id changes
    useEffect(() => {
        saveFiltersToStorage({
            branch_id: managePaySlipState.branch_id,
            department_id: managePaySlipState.department_id,
            get_all: true
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managePaySlipState.branch_id, managePaySlipState.department_id]);

    const managePaySlip = (data)=>{
        // console.log('data', data)
        dispatch({type:data.id, payload:data.id})
    }


    const handleSelectManagePaySlip = async(selected, field)=>{
        if(field === 'branch_id'){
            // Clear employee list immediately before fetching new data
            dispatch({type:'EMP_SALARY', payload:[]})
            // If "All Branch" is selected, fetch all employees
            if(selected.value === 'all'){
                dispatch({type:'BRANCH', value:selected, payload:[]})
                // Pass current department_id if exists, otherwise null
                const currentDeptId = managePaySlipState.department_id && managePaySlipState.department_id.value !== 'all' 
                    ? managePaySlipState.department_id.value 
                    : null;
                gettingAllEmpSalary(currentDeptId)
            } else {
                const data = await gettingDepartmentsServices(selected.value)
                dispatch({type:'BRANCH', value:selected, payload:data})
                // Pass current department_id if exists
                const currentDeptId = managePaySlipState.department_id && managePaySlipState.department_id.value !== 'all' 
                    ? managePaySlipState.department_id.value 
                    : null;
                gettingEmpSalary(selected, currentDeptId)
            }
            console.log('selected',selected)
        }
        else if(field === 'department_id'){
            console.log('Department selected:', selected)
            console.log('Current branch:', managePaySlipState.branch_id)
            
            // Clear employee list immediately before fetching new data to avoid showing stale data
            dispatch({type:'EMP_SALARY', payload:[]})
            
            // Update state
            dispatch({type:'SELECTION', field:field, value:selected})
            
            // Fetch employees with department filter from API
            const deptId = selected && selected.value !== 'all' ? selected.value : null;
            
            if(managePaySlipState.branch_id){
                if(managePaySlipState.branch_id.value === 'all'){
                    // If "All Branch" is selected, fetch all employees with department filter
                    gettingAllEmpSalary(deptId)
                } else {
                    // If specific branch is selected, fetch employees for that branch with department filter
                    gettingEmpSalary(managePaySlipState.branch_id, deptId)
                }
            } else {
                // If no branch is selected, fetch all employees with department filter
                gettingAllEmpSalary(deptId)
            }
        }
        else{
            dispatch({type:'SELECTION', field:field, value:selected})
        }
    }


    const gettingEmpSalary = async(branchData, deptId = null)=>{
        console.log('gettingEmpSalary called with:', { branchData, deptId })
        const apiData = {
            bid: branchData?.value || branchData,
            did: deptId && deptId !== 'all' ? deptId : '',
            get_all: true, // Always pass get_all=true
        }
        try{
            const response = await payrollApi.empPaySlip(apiData)
            const responseData = response.data 
            console.log('Employee PaySlip Response:', responseData)
            if(response.status === 200 && (responseData.STATUS === "SUCCESSFUL" || responseData.STATUS === "SUCCESS")){
                // Handle multiple possible API response structures
                let employeeData = [];
                
                if (responseData.DATA?.data && Array.isArray(responseData.DATA.data)) {
                    employeeData = responseData.DATA.data;
                } else if (responseData.DB_DATA && Array.isArray(responseData.DB_DATA)) {
                    employeeData = responseData.DB_DATA;
                } else if (responseData.data && Array.isArray(responseData.data)) {
                    employeeData = responseData.data;
                } else if (Array.isArray(responseData)) {
                    employeeData = responseData;
                }
                
                console.log('Employee data extracted:', employeeData);
                dispatch({type:'EMP_SALARY' , payload:employeeData})
            }else{
                // Clear employee list on error
                console.log('Error or no employees found:', responseData.ERROR_DESCRIPTION || responseData)
                dispatch({type:'EMP_SALARY' , payload:[]})
            }
        }catch(err){
            console.log('Error fetching employees:', err)
            dispatch({type:'EMP_SALARY' , payload:[]})
        }
    }


    const gettingEmpSalaryByDept = async(dept, branch)=>{
        console.log('gettingEmpSalaryByDept called with:', { dept, branch })
        const apiData = {
            bid: branch?.value || '',
            did: dept?.value || '',
            get_all: true,
        }
        console.log('API Data for dept filtering:', apiData)

        try{
            const response = await payrollApi.empPaySlip(apiData)
            const responseData = response.data 
            console.log('Employee PaySlip by Dept Response:', responseData)
            if(response.status === 200 && (responseData.STATUS === "SUCCESSFUL" || responseData.STATUS === "SUCCESS")){
                // Handle multiple possible API response structures
                let employeeData = [];
                
                if (responseData.DATA?.data && Array.isArray(responseData.DATA.data)) {
                    employeeData = responseData.DATA.data;
                } else if (responseData.DB_DATA && Array.isArray(responseData.DB_DATA)) {
                    employeeData = responseData.DB_DATA;
                } else if (responseData.data && Array.isArray(responseData.data)) {
                    employeeData = responseData.data;
                } else if (Array.isArray(responseData)) {
                    employeeData = responseData;
                }
                
                console.log('Employee data extracted:', employeeData);
                dispatch({type:'EMP_SALARY' , payload:employeeData})
            }else{
                // Clear employee list on error
                console.log('Error or no employees found:', responseData.ERROR_DESCRIPTION || responseData)
                dispatch({type:'EMP_SALARY' , payload:[]})
            }
        }catch(err){
            console.log('Error fetching employees by department:', err)
            dispatch({type:'EMP_SALARY' , payload:[]})
        }
    }

    const gettingAllEmpSalary = async(deptId = null)=>{
        console.log('Fetching all employees from all branches')
        const apiData = {
            bid:0, // Send 0 when "All Branch" is selected
            did: deptId && deptId !== 'all' ? deptId : '',
            get_all: true, // Always pass get_all=true when "All Branch" is selected
        }
        try{
            const response = await payrollApi.empPaySlip(apiData)
            const responseData = response.data 
            console.log('All Employee PaySlip Response:', responseData)
            if(response.status === 200 && (responseData.STATUS === "SUCCESSFUL" || responseData.STATUS === "SUCCESS")){
                // Handle multiple possible API response structures
                let employeeData = [];
                
                if (responseData.DATA?.data && Array.isArray(responseData.DATA.data)) {
                    employeeData = responseData.DATA.data;
                } else if (responseData.DB_DATA && Array.isArray(responseData.DB_DATA)) {
                    employeeData = responseData.DB_DATA;
                } else if (responseData.data && Array.isArray(responseData.data)) {
                    employeeData = responseData.data;
                } else if (Array.isArray(responseData)) {
                    employeeData = responseData;
                }
                
                console.log('Employee data extracted:', employeeData);
                dispatch({type:'EMP_SALARY' , payload:employeeData})
            }else{
                // Clear employee list on error
                console.log('Error or no employees found:', responseData.ERROR_DESCRIPTION || responseData)
                dispatch({type:'EMP_SALARY' , payload:[]})
            }
        }catch(err){
            console.log('Error fetching all employees:', err)
            dispatch({type:'EMP_SALARY' , payload:[]})
        }
    }





  

    return {
        managePaySlip,
        managePaySlipState,
        branches_payroll,
        departments_payroll,
        handleSelectManagePaySlip,
    }

}

// Export function to clear Generate Payslip filters from localStorage
export const clearGeneratePayslipFilters = () => {
    try {
        localStorage.removeItem(GENERATE_PAYSLIP_FILTERS_KEY);
    } catch (error) {
        console.error('Error clearing Generate Payslip filters from localStorage:', error);
    }
};

export default useManagePaySlip