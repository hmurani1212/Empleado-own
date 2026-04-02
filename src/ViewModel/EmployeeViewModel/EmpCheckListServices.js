import { useState } from "react"
import { gettingBranchesFrequentHit } from "../../services/__frequentApiServices"
import departmentsApi from "../../Model/Data/Departments/Departments"
import noticesApi from "../../Model/Data/Notices/Notices"
import employeesApi from "../../Model/Data/Employees/Employees"
import checklistApi from "../../Model/Data/Checklist/Checklist"
import { useDebounce } from "../../services/__debounceServices"
import { showToast } from "../../Components/Toaster/Toaster"

const useEmployeeCheckList = ()=>{
    const [employeeCheckListValue, setEmployeeCheckListValue] = useState({
        show:false,
        isEdit: false,
        editId: null,
        checkListType:1,
        personResonsible:1,
        requestInput:[{
            infoTitle:'',
            infoText:'',
            type:1,
        }],
        checkListTitle:'',
        departmentList:[],
        departmentId:null,
        empList:[],
        empId:null,
        avgCompletionTime:'',
    }) 


    const handleEmpCheckList = async (branchId, opts = {}) => {
        const { skipInitialShowToggle = false } = opts
        if (!skipInitialShowToggle) {
            setEmployeeCheckListValue((prevState) => ({
                ...prevState,
                show: true,
                isEdit: false,
                editId: null
            }))
        }

        const bid = branchId === undefined || branchId === null || branchId === ''
            ? 0
            : Number(branchId)

        try {
            let allDepartments = []
            let page = 1
            let totalPages = 1

            while (page <= totalPages) {
                const response = await departmentsApi.manageDepartments(bid, page, 100, true)
                const responseData = response.data

                if (response.status !== 200 || responseData.STATUS !== 'SUCCESSFUL') {
                    break
                }

                const db = responseData.DB_DATA
                let deps = []
                if (Array.isArray(db)) {
                    deps = db
                } else if (db && Array.isArray(db.departments)) {
                    deps = db.departments
                }

                allDepartments = [...allDepartments, ...deps]

                const pag = db?.pagination
                totalPages = pag?.pages ?? 1
                page += 1
            }

            setEmployeeCheckListValue((prevState) => ({
                ...prevState,
                departmentList: {
                    ...(typeof prevState.departmentList === 'object' && prevState.departmentList !== null
                        ? prevState.departmentList
                        : {}),
                    departments: allDepartments
                }
            }))
        } catch (err) {
            console.log(err)
        }
    }

    const handleEditCheckList = async(checklistData)=>{
        // Map the API response data to form state

        console.log("checklistData", checklistData)
        const mappedData = {
            show: true,
            isEdit: true,
            editId: checklistData?.id,
            checkListTitle: checklistData.title,
            checkListType: checklistData.forDept === "Unknown Department" ? 1 : 2,
            departmentId: checklistData.forDept === "Unknown Department" ? null : 
                { value: checklistData.deptId || 0, label: checklistData.forDept },
            personResonsible: checklistData.person_responsible === "Unknown Employee" ? 1 : 2,
            empId: checklistData.person_responsible === "Unknown Employee" ? null : 
                { value: checklistData.user_id || 0, label: checklistData.person_responsible },
            avgCompletionTime: checklistData.avg_completion_time,
            requestInput: checklistData.response_info?.map(item => ({
                id: item.id,
                infoTitle: item.requirement_title,
                type: parseInt(item.response_type),
                infoText: ''
            })) || [{
                infoTitle:'',
                infoText:'',
                type:1,
            }]
        }

        setEmployeeCheckListValue((prevState)=>({
            ...prevState,
            ...mappedData
        }))

        // Load departments if needed
        if (mappedData.checkListType === 2) {
            await handleEmpCheckList(0, { skipInitialShowToggle: true })
        }

        // Load employees if needed
        if (mappedData.personResonsible === 2) {
            await loadAllEmployees()
        }
    }
    
    const toggleEmpCheckList = ()=>{
        
        setEmployeeCheckListValue((prevState)=>({
            ...prevState,
            show:false,
            isEdit: false,
            editId: null
        }))
    }


    const handleChangeEmpCheckList = (e)=>{
        const {name, value} = e.target
        setEmployeeCheckListValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
    }


    const handleChangeRequestInfo = (index, field, value) => {
        const updatedRequestInput = [...employeeCheckListValue.requestInput];

        updatedRequestInput[index][field] = value;

        setEmployeeCheckListValue({
            ...employeeCheckListValue,
            requestInput: updatedRequestInput,
        });
    };



    const addNewRequestInput = ()=>{
        setEmployeeCheckListValue((prevState)=>({
            ...prevState,
            requestInput:[...prevState.requestInput, {
                infoTitle:'',
                infoText:'',
                type:1,
            }]

        }))
    }

    

    const removeRequestInput = (i)=>{
        setEmployeeCheckListValue((prevState)=>({
            ...prevState,
            requestInput:prevState.requestInput.filter((__, index)=> index !== i)

        }))
    }



    const handleSelectEmpCheckList =async (select, field)=>{
        setEmployeeCheckListValue((prevState)=>({
            ...prevState,
            [field]: select
        }))

        // If user selects Employee field, load all employees
        if (field === 'personResonsible' && select === 2) {
            await loadAllEmployees()
        }
    }

    const loadAllEmployees = async () => {
        try {
            const response = await employeesApi.gettingAllEmployees({ pages: 'all' })
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // API returns employees nested under DB_DATA.employees
                const employees = responseData.DB_DATA.employees || []
                const employeeData = employees.map((employee) => ({
                    label: employee.name,
                    value: employee.id,
                }))
                
                setEmployeeCheckListValue((prevState) => ({
                    ...prevState,
                    empList: employeeData
                }))
            }
        } catch (error) {
            console.error('Error loading employees:', error)
            showToast('Error loading employees', 'error')
        }
    }

    const saveChecklist = async () => {
        try {
            // Validation: Check required fields
            if (!employeeCheckListValue.checkListTitle?.trim()) {
                showToast('Checklist Title is required', 'error')
                return
            }

            // Validation: Average Completion Time should not exceed 30 days
            const completionTime = parseInt(employeeCheckListValue.avgCompletionTime) || 0
            if (completionTime <= 0) {
                showToast('Average Completion Time must be greater than 0', 'error')
                return
            }
            if (completionTime > 30) {
                showToast('Average Completion Time should be less than or equal to 30 days', 'error')
                return
            }

            if (employeeCheckListValue.isEdit) {
                // Update existing checklist
                await updateChecklist()
            } else {
                // Create new checklist
                await createChecklist()
            }
        } catch (error) {
            console.error('Error saving checklist:', error)
            showToast('Error saving checklist', 'error')
        }
    }

    const refreshChecklistData = async () => {
        try {
            // Call the store function to refresh checklist data
            const store = await import('../../Store/store')
            const useStore = store.default
            const gettingEmployeeCheckList = useStore.getState().gettingEmployeeCheckList
            if (gettingEmployeeCheckList) {
                await gettingEmployeeCheckList()
            }
        } catch (error) {
            console.error('Error refreshing checklist data:', error)
        }
    }

    // Helper function to clean payload and extract only ID values
    const cleanPayload = (payload) => {
        return {
            ...payload,
            deptId: typeof payload.deptId === 'object' ? payload.deptId.value : payload.deptId,
            user_id: typeof payload.user_id === 'object' ? payload.user_id.value : payload.user_id
        }
    }

    const createChecklist = async () => {
        try {
            // Build the payload according to the API requirements
            const payload = {
                title: employeeCheckListValue.checkListTitle || '',
                deptId: employeeCheckListValue.checkListType === 1 ? 0 : 
                    (employeeCheckListValue.departmentId?.value || employeeCheckListValue.departmentId || 0),
                personResponsible: employeeCheckListValue.personResonsible === 1 ? "admin" : "0",
                avgCompletionTime: parseInt(employeeCheckListValue.avgCompletionTime) || 0,
                user_id: employeeCheckListValue.personResonsible === 1 ? 0 : 
                    (employeeCheckListValue.empId?.value || employeeCheckListValue.empId || 0),
                req_checklist: employeeCheckListValue.requestInput.length > 0 ? 
                    employeeCheckListValue.requestInput.map(input => ({
                        requirement_title: input.infoTitle || '',
                        response_type: input.type === 1 ? "1" : "0"
                    })) : []
            }

            // Clean the payload to ensure only ID values are sent
            const cleanPayloadData = cleanPayload({
                title: payload.title,
                deptId: payload.deptId,
                personResponsible: payload.personResponsible,
                avgCompletionTime: payload.avgCompletionTime,
                user_id: payload.user_id,
                req_checklist: payload.req_checklist
            })

            // Call the checklist API
            const response = await checklistApi.createChecklist(cleanPayloadData)
            const responseData = response.data

            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                showToast('Checklist created successfully!', 'success')
                // Refresh checklist data
                await refreshChecklistData()
                // Reset form or close drawer
                setEmployeeCheckListValue({
                    show: false,
                    isEdit: false,
                    editId: null,
                    checkListType: 1,
                    personResonsible: 1,
                    requestInput: [{
                        infoTitle: '',
                        infoText: '',
                        type: 1,
                    }],
                    checkListTitle: '',
                    departmentList: [],
                    departmentId: null,
                    empList: [],
                    empId: null,
                    avgCompletionTime: '',
                })
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to create checklist', 'error')
            }
        } catch (error) {
            console.error('Error creating checklist:', error)
            showToast('Error creating checklist', 'error')
        }
    }

    const updateChecklist = async () => {
        try {
            // Build the update payload according to the API requirements
            const payload = {
                id: employeeCheckListValue.editId,
                title: employeeCheckListValue.checkListTitle || '',
                deptId: employeeCheckListValue.checkListType === 1 ? 0 : 
                    (employeeCheckListValue.departmentId?.value || employeeCheckListValue.departmentId || 0),
                avgCompletionTime: parseInt(employeeCheckListValue.avgCompletionTime) || 0,
                user_id: employeeCheckListValue.personResonsible === 1 ? 0 : 
                    (employeeCheckListValue.empId?.value || employeeCheckListValue.empId || 0),
                response_info: employeeCheckListValue.requestInput.length > 0 ? 
                    employeeCheckListValue.requestInput.map(input => ({
                        id: input.id || null,
                        requirement_title: input.infoTitle || '',
                        response_type: input.type === 1 ? "1" : "0"
                    })) : []
            }

            // Clean the payload to ensure only ID values are sent
            const cleanPayloadData = cleanPayload({
                id: payload.id,
                title: payload.title,
                deptId: payload.deptId,
                avgCompletionTime: payload.avgCompletionTime,
                user_id: payload.user_id,
                response_info: payload.response_info
            })

            // Call the update checklist API
            const response = await checklistApi.updateChecklist(cleanPayloadData)
            const responseData = response.data

            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                showToast('Checklist updated successfully!', 'success')
                // Refresh checklist data
                await refreshChecklistData()
                // Reset form or close drawer
                setEmployeeCheckListValue({
                    show: false,
                    isEdit: false,
                    editId: null,
                    checkListType: 1,
                    personResonsible: 1,
                    requestInput: [{
                        infoTitle: '',
                        infoText: '',
                        type: 1,
                    }],
                    checkListTitle: '',
                    departmentList: [],
                    departmentId: null,
                    empList: [],
                    empId: null,
                    avgCompletionTime: '',
                })
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to update checklist', 'error')
            }
        } catch (error) {
            console.error('Error updating checklist:', error)
            showToast('Error updating checklist', 'error')
        }
    }

    const handleCheckListSearchEmp = (name, actionMeta)=>{

        if (actionMeta.action === 'input-change') {
            debounceEmpList(name)
        }

    }

    const debounceEmpList = useDebounce(async(value) => {
        
        
        await empCheckListEmpNameSearch(value)
       
    }, 500); // 500ms debounce time


    const empCheckListEmpNameSearch = async(searchTerm) => {
        const empData = { search: searchTerm };
        

        try{
            const response = await noticesApi.addNoticeEmpSearch(empData)
            const data = response.data

            if(response.status === 200  && data.STATUS === "SUCCESSFUL"){

                const employeeData = data.DB_DATA.map((employee) => ({
                    label: employee.name,
                    value: employee.id, 
                }));

                // console.log("employeeData", employeeData)

                setEmployeeCheckListValue((prevState)=>({
                    ...prevState,
                    empList:employeeData
                }))
            }else{
                showToast('Employee Not Found', 'error')
            }

        } catch(err) {

        }
        
    }

    return {
        employeeCheckListValue,
        toggleEmpCheckList,
        handleEmpCheckList,
        handleEditCheckList,
        handleChangeEmpCheckList,
        handleChangeRequestInfo,
        addNewRequestInput,
        removeRequestInput,
        handleSelectEmpCheckList,
        handleCheckListSearchEmp,
        loadAllEmployees,
        saveChecklist
    }
}


export default useEmployeeCheckList