import { showToast } from "../Components/Toaster/Toaster"
import apiServices from "../Model/Data/APIServices/ApiServices"
import departmentsApi from "../Model/Data/Departments/Departments"
import employeesApi from "../Model/Data/Employees/Employees"
import leavesPlannerApi from "../Model/Data/LeavesPlanner/LeavesPlanner"
import notesPoolApi from "../Model/Data/NotesPool/NotesPool"
import payrollApi from "../Model/Data/Payroll/Payroll"

export const gettingDepartmentsServices = async(id)=>{
    const data = { parent_id: 0, branch_id: id, getAll: true }
    if (id === 0 || id === '0') {
        data.branch_id = 0
        data.get_all_departments = true
    }
    try{
        const response = await employeesApi.gettingSubDepts(data)
        const resData = await response.data;
        
        if((response.status === 200 || response.status === 304) && resData.STATUS === "SUCCESSFUL"){
            // Handle new API response structure where departments are nested under DB_DATA.departments
            const departmentsData = resData.DB_DATA?.departments || resData.DB_DATA
            // If departmentsData is an object with departments array, extract the array
            const departmentsArray = Array.isArray(departmentsData) ? departmentsData : departmentsData?.departments || []
            const result = flattenOptions(departmentsArray)
            return result
        }else{
            return []
        }
    }catch(err){
        return []
    }
}



const flattenOptions = (data) => {
    let flattenedOptions = [];
    
    // Check if data is an array
    if (!Array.isArray(data)) {
        return [];
    }

    // Check if data is empty
    if (!data || data.length === 0) {
        return [];
    }

    data.forEach((dept) => {
        flattenedOptions.push({ label: dept.name, value: dept.id, isParent: true });
        
        if (dept.children?.length > 0) {
            dept.children.forEach((subDept) => {
                flattenedOptions.push({ label: subDept.name, value: subDept.id, isChild: true });
            });
        }
    });
    
    return flattenedOptions;
}



export const gettingEmployesServices = async(id)=>{
    const apiData = {
        deptt:id
    }

    try{
        const response = await apiServices.getEmployeeServices(apiData)
        const responseData = response.data 
        
        if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
            const dbData = responseData.DB_DATA
            return dbData 

        }else{
            const error = responseData.ERROR_DESCRIPTION 
            showToast(error, 'error')
            return []
        }
    }catch(err){
        return []
    }
}
export const gettingEmployesAllServices = async(id)=>{
    const apiData = {
        deptt:id
    }

    try{
        const response = await apiServices.getEmployeeAllServices(apiData)
        const responseData = response.data 
        if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
            const dbData = responseData.DB_DATA
            return dbData 

        }else{
            const error = responseData.ERROR_DESCRIPTION 
            showToast(error, 'error')
            return []
        }
    }catch(err){

    }
}

export const gettingEmployeeNoteBookList = async()=>{
    try{
        const response = await notesPoolApi.getNotebooks();
        const responseData = response.data 
        if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
            return responseData
        }else{
            return []
        }
    }catch(err){
        return []
    }
}
export const gettingEmployeeFrequentHit = async()=>{
    try{
        const response = await employeesApi.gettingRefBranches();
        const responseData = response.data 
        if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
            return responseData
        }else{
            return []
        }
    }catch(err){
        // Error handling
    }
}
export const gettingBranchesFrequentHit = async()=>{
    try{
        const response = await employeesApi.gettingRefBranches();
        return response
    }catch(err){
        // Error handling
    }
}


export const gettingEmployeeFrequentSalaryDetails = async(data)=>{
    const apiData = {
        emp_id:data.id
    }
    try{
        const response = await payrollApi.empSalaryDetaisl(apiData);
        return response
        
    }catch(err){
        // Error handling
    }
}


export const gettingDesignationFrequentHit = async(id)=>{
    const apidata = {deptt_id: id}
    try{
        const response = await departmentsApi.getFreqDesgination(apidata)
        const responseData = response.data
        if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
            return responseData.DB_DATA
        }else{
            const error = responseData.ERROR_DESCRIPTION
            showToast(error, 'error')
            return []
        }
    }catch(err){
        // Error handling
    }
}



export const getPoliciesListFrequentByBranchId = async(id) => {
        
    const bid = {branch_id : id}
    try {
        const response = await leavesPlannerApi.hrPoliciesList(bid);
        return response
        

    } catch (error) {
        // Error handling
    }
}







export const getDepartmentFrequent = async(id)=>{
    try {
        const response = await employeesApi.getDepartments(id)
        return response
    } catch (error) {
        return null
    }
}

export const getAllEmployeesFrequent = async(branchId = null)=>{
    try {
        const response = await employeesApi.getAllEmployees(branchId)
        return response
    } catch (error) {
        return null
    }
}

export const getAllDepartmentsFrequent = async()=>{
    try {
        const response = await employeesApi.getAllDepartments()
        return response
    } catch (error) {
        return null
    }
}
