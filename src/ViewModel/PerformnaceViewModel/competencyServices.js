import { useState } from "react"
import performanceApi from "../../Model/Data/Performance/Performance"
import useStore from "../../Store/store"
import { gettingBranchesFrequentHit, gettingDepartmentsServices, gettingEmployesServices, gettingEmployesAllServices, gettingEmployeeFrequentHit } from "../../services/__frequentApiServices"
import useDepartments from "../DepartmentsViewModel/DepartmentsServices"
import employeesApi from "../../Model/Data/Employees/Employees"
import { showToast } from "../../Components/Toaster/Toaster"
import { useNavigate } from "react-router"

const useCometencyServices = ()=>{

    const gettingCompetency = useStore((state)=> state.gettingCompetency)
    const comptencyData = useStore((state)=> state.comptencyData)
    const addNewComptency = useStore((state)=> state.addNewComptency)
    const updateCompetencySummaryByEmployee = useStore((state)=> state.updateCompetencySummaryByEmployee)
    const gettingSubCompetency = useStore((state)=> state.gettingSubCompetency)
    const subComptencyData = useStore((state)=> state.subComptencyData)
    const deleteSingleCompetency = useStore((state)=> state.deleteSingleCompetency)
    const competencyLoading = useStore((state) => state.competencyLoading)
    const subCompetencyLoading = useStore((state) => state.subCompetencyLoading)

    const { getEmployeesByDeptId } = useDepartments();
    const navigate = useNavigate()

    const [competencyValue, setCompetencyValue] = useState({
        performance:[],
        performance_id:null,
        searchText: ''
    })


    const[competencyDeleteValue, setCompetencyDeleteValue] = useState({
        id:'',
        show:false, 
        loading:false
    })


    const [addCompetencyValue, setAddCompetencyValue] = useState({
        show:false,
        reviewCycle:null,
        branchesList:[],
        branchId:null,
        departmentsList:[],
        departmentId:null,
        empList:[],
        empId:null,
        pID:null,
        comptency:'',
        competencyList:[],
        selectedEmp:[],
        loading:false

    })


    const gettingPRCSelect = async()=>{
        try {
            const response = await performanceApi.getPRCForSelect()
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                setCompetencyValue((prevState)=>({
                    ...prevState,
                    performance:responseData.DB_DATA,
                    performance_id:{value: null, label: 'All'} // Set to "All" initially
                }))
                // Load all competencies initially (pass null)
                gettingCompetency(null)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSelectCompetency = (select, field) => {
        if(field === 'performance_id'){
            setCompetencyValue((prevState)=>({
                ...prevState,
                [field]:select
            }))
            // If "All" is selected (value is null), pass null to get all competencies
            // Otherwise, pass the selected performance review ID
            gettingCompetency(select.value, competencyValue.searchText)
        }
    }

    const handleSearchCompetency = (searchText) => {
        setCompetencyValue((prevState)=>({
            ...prevState,
            searchText: searchText
        }))
        // Search with current performance_id and new search text
        gettingCompetency(competencyValue.performance_id?.value, searchText)
    }


    const handleAddCompetency = async()=>{
        setAddCompetencyValue((prevState)=>({
            ...prevState,
            show:true
        }))
    }
    const handleToggleAddCompetency = ()=>{
        setAddCompetencyValue((prevState)=>({
            ...prevState,
            show:false,
            empId:null,
            branchIdL:null,
            departmentId:null,
            pID:null,
            comptency:'',
            competencyList:[],
            selectedEmp:[]
        }))
    }



    const handleSelectAddCompetency = async(select, field)=>{
        if(field === 'pID'){
            setAddCompetencyValue((prevState)=>({
                ...prevState,
                [field]: select,
                selectedEmp:[],
                // Reset all dependent fields when performance changes
                branchId: null,
                departmentId: null,
                empId: null,
                departmentsList: [],
                empList: []
            }))
        }
        if(field === 'branchId'){
            // Handle "All Branches" (value 0) - don't fetch departments, just set the value
            if (select.value === 0 || select.value === '0') {
                setAddCompetencyValue((prevState)=>({
                    ...prevState,
                    [field]: select,
                    departmentsList: [{ value: 0, label: 'All Departments' }], // Add "All Departments" option
                    empList: [], // Reset employee list
                    empId: null, // Reset employee selection
                    selectedEmp: [], // Reset selected employees
                    departmentId: null // Reset department selection
                }))
            } else {
                // Fetch departments for the selected branch (same as Create Performance Review Cycle)
                const data = await gettingDepartmentsServices(select.value)
                setAddCompetencyValue((prevState)=>({
                    ...prevState,
                    [field]: select,
                    departmentsList: [{ value: 0, label: 'All Departments' }, ...(data || [])], // Add "All Departments" option
                    empList: [], // Reset employee list
                    empId: null, // Reset employee selection
                    selectedEmp: [], // Reset selected employees
                    departmentId: null // Reset department selection
                }))
            }
        }
        if(field === 'departmentId'){
            // Handle "All Departments" (value 0) - don't fetch employees, just set the value
            if (select.value === 0 || select.value === '0') {
                setAddCompetencyValue((prevState)=>({
                    ...prevState,
                    [field]: select,
                    empList: [] // Reset employee list when "All Departments" is selected
                }))
            } else {
                // When department is selected, fetch employees for that department (same as Create Performance Review Cycle)
                const data = await getEmployeesByDeptId(select.value);
                setAddCompetencyValue((prevState)=>({
                    ...prevState,
                    [field]: select,
                    empList: data || []
                }))
            }
        }
        if(field === 'empId'){
            const filterData = addCompetencyValue.selectedEmp?.find((ele) => ele.value == select.value);

            // Check if value is 0 and if there are other selected employees
            const isZeroSelected = addCompetencyValue.selectedEmp?.some((ele) => ele.value === 0);
            
            if (select.value === 0 && addCompetencyValue.selectedEmp.length > 0) {
                // If 0 is selected and there are other items in the array
                showToast('Please remove other employees before adding "All Employees"', 'error');
            } else if (isZeroSelected && select.value !== 0) {
                // If 0 is already in the array, prevent adding other employees
                showToast('Please remove "All Employees" before selecting other employees', 'error');
            } else if (filterData) {
                // If the selected employee is already in the list
                showToast('Employee Already in Selected Employee List', 'error');
            } else {
                // Add the selected employee to the array
                setAddCompetencyValue((prevState) => ({
                    ...prevState,
                    selectedEmp: [...prevState.selectedEmp, select]
                }));
                showToast('Employee Added', 'success');
            }
        }
    } 



    async function getBranches(branchData){
        // branchData is now an array of branch objects from the API response
        if (branchData && branchData.length > 0) {
            // Store raw branch data, component will handle transformation
            setAddCompetencyValue((prevState)=>({
                ...prevState,
                branchesList: Array.isArray(branchData) ? branchData : [],
                branchId: null // Reset branch selection
            }))
        } else {
            // Fallback to the same API method as Create Performance Review Cycle
            try {
                const branchData = await gettingEmployeeFrequentHit()
                setAddCompetencyValue((prevState)=>({
                    ...prevState,
                    branchesList: branchData.DB_DATA || [],
                    branchId: null
                }))
            } catch (error) {
                console.error('Error loading branches fallback:', error)
            }
        }
    }

    async function getDepartments(departmentData, branchID){
        // departmentData is now an array of department objects from the API response
        if (departmentData && departmentData.length > 0) {
            // Store raw department data, component will handle transformation
            setAddCompetencyValue((prevState)=>({
                ...prevState,
                departmentsList: Array.isArray(departmentData) ? departmentData : [],
                departmentId: null // Reset department selection
            }))
        } else {
            // Fallback to the old method if no department data
            try{
                const data = await gettingDepartmentsServices(branchID)
                setAddCompetencyValue((prevState)=>({
                    ...prevState,
                    departmentsList: Array.isArray(data) ? data : [],
                    departmentId: null
                }))
            }catch(err){
                console.log(err)
            }
        }
    }


    const gettingEmp = async(name)=>{
        try{
            const response = await performanceApi.getEmpGoal(name)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const dbData = responseData.DB_DATA
                // Store raw employee data, component will handle transformation
                setAddCompetencyValue((prevState)=>({
                    ...prevState,
                    empList: Array.isArray(dbData) ? [{employee_id:0, employee_name:'All Employee'}, ...dbData] : [{employee_id:0, employee_name:'All Employee'}]

                }))   
            }
        }catch(err){
            console.log(err)
        }
    }
    const gettingBranchDepartment = async(performanceName)=>{
        try{
            const response = await performanceApi.getBranchDepartment(performanceName)
            const responseData = await response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const dbData = responseData.DB_DATA
                
                // Handle the response structure based on what's available
                if (dbData.reviews && dbData.reviews.length > 0) {
                    // New response structure
                    const branchData = dbData.reviews[0].branch || []
                    getBranches(branchData)
                } else if (dbData.branch) {
                    // Old response structure
                    getBranches(dbData.branch)
                }
                
                if (dbData.dep && dbData.dep.length > 0) {
                    // New response structure
                    getDepartments(dbData.dep, dbData.dep)
                } else if (dbData.department) {
                    // Old response structure
                    getDepartments(dbData.department, dbData.department)
                }
            }
        }catch(err){
            console.log(err)
        }
    }



    const handleChangeAddCompetency = (e)=>{
        const { name, value } = e.target

        setAddCompetencyValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
    }


    const validateAddCompetency = ()=>{
        const {comptency} = addCompetencyValue
        // const nameValidation = validateInput('Competency Name', comptency)
        // if(!nameValidation.isValid){
        //     return { isValid: false, message: nameValidation.message}
        // }        
        if(comptency === ''){
            return { isValid:false, message:"Competency Name is Required"}
        }
        

       

        return {isValid: true, message:''}
    }



    const addComptency = ()=>{
        const validation =  validateAddCompetency()
        if(!validation.isValid){
            showToast(validation.message, 'error');
            return
        }
        const addData = {name:addCompetencyValue.comptency}

        setAddCompetencyValue((prevState)=>({
            ...prevState,
            competencyList:[...prevState.competencyList, addData],
            comptency:''
        }))
    }


    const deleteCompteny = (index)=>{
        setAddCompetencyValue((prevState) => {
            const updatedList = prevState.competencyList.filter((__, i) => i !== index);
            
            if (updatedList.length === prevState.competencyList.length) {
                // If the length is the same, item was not removed
                showToast('Error: Could not delete the item', 'error');
            } else {
                // Success: item removed
                showToast('Deleted successfully','success');
            }

            return {
                ...prevState,
                competencyList: updatedList
            };
        });
        
    }







    const validateHandleSubmit = ()=>{
        const {departmentId, branchId, competencyList, pID, selectedEmp } = addCompetencyValue      
        if(pID === null){
            return { isValid:false, message:"Select Performance"}
        }
        if(competencyList.length === 0){
            return { isValid:false, message:"At least one competency is required"}
             
        }
        if(branchId === null){
            return { isValid:false, message:"Select branch"}
        }
        if(departmentId === null){
            return { isValid:false, message:"Select Department"}
        }
        if(selectedEmp.length === 0){
            return { isValid:false, message:"At least one Employee is required"}
        }
       

        return {isValid: true, message:''}
    }



    const handleSubmitAddCompetency = async(e)=>{
        e.preventDefault()
        const validation =  validateHandleSubmit()
        console.log(addCompetencyValue)
        if(!validation.isValid){
            showToast(validation.message, 'error');
            return
        }
        const {departmentId, branchId, competencyList, pID, selectedEmp } = addCompetencyValue
        const apiData = {
            department_id: departmentId?.value,
            branch: branchId?.value,
            question_title: competencyList.map((ele)=> ele.name),
            assigned_to: selectedEmp.map((ele)=> ele.label),
            employee: selectedEmp.map((ele)=> ele.value.toString()),
            review_cycle: pID.value
        }


        setAddCompetencyValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response = await performanceApi.addCompetency(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                // Handle the new response format that includes competency summary by employee
                // The backend now returns an array of employee competency summaries instead of a single competency object
                // This allows us to update the competencies list with the latest counts for each employee
                if (responseData.DB_DATA && Array.isArray(responseData.DB_DATA)) {
                    console.log('Using new competency summary format:', responseData.DB_DATA);
                    updateCompetencySummaryByEmployee(responseData.DB_DATA)
                    showToast('Competency Added Successfully', 'success')
                } else {
                    // Fallback to old format if needed
                    console.log('Using fallback format:', responseData.DB_DATA);
                    addNewComptency(responseData.DB_DATA)
                    showToast('Competency Added Successfully', 'success')
                }
                handleToggleAddCompetency()
            }
        }catch(err){
            const error = err.response.data.ERROR_DESCRIPTION
            showToast(error, 'error')

        }
        finally{

            
            setAddCompetencyValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
        

    }


    const handleRemoveEmp = (data)=>{
        setAddCompetencyValue((prevState)=>({
            ...prevState,
            selectedEmp: prevState.selectedEmp.filter((ele)=> ele.value !== data.value)
        }))
    }



    const handleSubComptency = (data) => {
        console.log('Viewing competencies for employee:', data)
        gettingSubCompetency(data.employee_id)
        navigate(`/performance/competency/sub-competency`)
    }


    const handleDeleteSubCompetency = (data)=>{
        setCompetencyDeleteValue((prevState)=>({
            ...prevState,
            show:true,
            id:data._id
        }))

    }
    const handleDeleteSubCompetencyToggle = ()=>{
        setCompetencyDeleteValue((prevState)=>({
            ...prevState,
            show:false,
            id:''
        }))

    }




    const confirmDeleteCompetency = async()=>{
        setCompetencyDeleteValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response  = await performanceApi.deleteSubCompetency(competencyDeleteValue.id)
            console.log('response', response)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                handleDeleteSubCompetencyToggle()
                showToast('Competency Delete Successfully', 'success')
                deleteSingleCompetency(competencyDeleteValue.id)
            }
        }catch(err){
            const error = err.response.data.ERROR_DESCRIPTION
            showToast(error, 'error')
        }
        finally{
            setCompetencyDeleteValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }

    



    return{
        competencyValue,gettingPRCSelect,comptencyData,
        handleAddCompetency,handleToggleAddCompetency,
        addCompetencyValue,
        handleSelectAddCompetency,
        handleSelectCompetency,
        handleSearchCompetency,
        handleChangeAddCompetency,
        addComptency,deleteCompteny,
        handleSubmitAddCompetency,
        handleRemoveEmp,
        handleSubComptency,
        subComptencyData,
        handleDeleteSubCompetency,
        handleDeleteSubCompetencyToggle,
        competencyDeleteValue,
        confirmDeleteCompetency,
        updateCompetencySummaryByEmployee,
        competencyLoading,
        subCompetencyLoading
        
    }
}


export default useCometencyServices