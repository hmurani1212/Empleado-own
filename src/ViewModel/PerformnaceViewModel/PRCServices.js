import { useState } from "react"
import performanceApi from "../../Model/Data/Performance/Performance"
import employeesApi from "../../Model/Data/Employees/Employees"
import { showToast } from "../../Components/Toaster/Toaster"
import useStore from "../../Store/store"
import { includeModuleData } from "../../services/__performanceServices"
import { gettingDepartmentsServices, gettingEmployeeFrequentHit } from "../../services/__frequentApiServices"
import { validateInput } from "../../Validation/CustomValidation"
import { validateMultipleEmployeePRC, validateSingleEmployeePRCUpdate } from "../../Validation/Validation"
import { formatDateYMD } from "../../services/__dateTimeServices"
import { useDebounce } from "../../services/__debounceServices"

// Maps "Who Can Assign" selection to API competency_Manage_by / Goal_Manage_by value
const mapAllowTypeToManageBy = (allowType) => {
    if (allowType === 'Admin') return 'Admin'
    if (allowType === 'reporting manager') return 'reporting manager'
    if (allowType === 'Self') return 'self'
    if (allowType === 'custom') return 'Custom employee'
    return 'Admin'
}

const usePRCServices = () => {
    const deleteSinglePRC = useStore((state) => state.deleteSinglePRC)
    const addNewRPC = useStore((state) => state.addNewRPC)
    const updatePRC = useStore((state) => state.updatePRC)
    const searchingPRC = useStore((state) => state.searchingPRC)
    const gettingPRCData = useStore((state) => state.gettingPRCData)






    const [PRCAddValue, setPRCAddValue] = useState({
        show: false,
        id: '',
        name: '',
        start_date: '',
        end_date: '',
        goal_rate: '',
        competancy_rate: '',
        branch: null,
        department: null,
        assigned_to: null,
        review_day: '',
        modulesType: includeModuleData.map(ele => ele.id),
        branches: [],
        branch_id: null,
        departments: [],
        department_id: null,
        employees: [],
        emp_id: null,
        loading: false,
        update: false,
        selectedEmp: [], // Now supports multiple employees for creation
        isMultipleEmployeeMode: false, // Flag to distinguish between create and update modes
        // Permissions: Who Can Assign Goals / Competencies
        permissionsSectionOpen: false,
        allow_goal_type: 'Admin',
        allow_goal_custom_employees: [],
        allow_competency_type: 'Admin',
        allow_competency_custom_employees: [],
        permissionEmployeesOptions: [],
        permissionEmployeesLoading: false,
        // Who manages competency / goal for this cycle (API: competency_Manage_by, Goal_Manage_by)
        competency_manage_by: 'Admin',
        goal_manage_by: 'Admin',
    })


    const [viewPRC, setViewPRC] = useState({
        show: false,
        singleData: {}
    })


    // console.log("type", typeof handleEmpDetails)

    const fetchPermissionEmployees = async (departmentId) => {
        setPRCAddValue((prev) => ({ ...prev, permissionEmployeesLoading: true }))
        try {
            const deptId = departmentId === 0 || departmentId === '0' ? null : departmentId
            const response = await employeesApi.get_all_employeee(deptId)
            const responseData = response?.data
            if (response?.status === 200 && responseData?.STATUS === 'SUCCESSFUL' && Array.isArray(responseData?.DB_DATA)) {
                const options = responseData.DB_DATA.map((emp) => ({
                    value: emp.id ?? emp.emp_id ?? emp.employee_id,
                    label: `${emp.name ?? ''} (ID: ${emp.id ?? emp.emp_id ?? emp.employee_id ?? ''})`,
                }))
                setPRCAddValue((prev) => ({ ...prev, permissionEmployeesOptions: options }))
            } else {
                setPRCAddValue((prev) => ({ ...prev, permissionEmployeesOptions: [] }))
            }
        } catch (err) {
            console.error('Error fetching employees for permissions:', err)
            showToast(err?.response?.data?.ERROR_DESCRIPTION ?? 'Failed to load employees', 'error')
            setPRCAddValue((prev) => ({ ...prev, permissionEmployeesOptions: [] }))
        } finally {
            setPRCAddValue((prev) => ({ ...prev, permissionEmployeesLoading: false }))
        }
    }

    const toggleAddPRC = async () => {
        setPRCAddValue((prevState) => ({
            ...prevState,
            show: !prevState.show,
            update: false,
            id: '',
            name: '',
            start_date: '',
            end_date: '',
            goal_rate: prevState.show ? '' : '50', // Set default 50 when opening modal
            competancy_rate: prevState.show ? '' : '50', // Set default 50 when opening modal
            branch: null,
            department: null,
            assigned_to: null,
            review_day: '',
            modulesType: includeModuleData.map(ele => ele.id),
            branch_id: null,
            departments: [],
            department_id: null,
            employees: [],
            emp_id: null,
            selectedEmp: [],
            isMultipleEmployeeMode: true, // Enable multiple employee selection for creation
            // Don't load branches initially - load on demand
            branches: [],
            permissionsSectionOpen: false,
            allow_goal_type: 'Admin',
            allow_goal_custom_employees: [],
            allow_competency_type: 'Admin',
            allow_competency_custom_employees: [],
            permissionEmployeesOptions: [],
            permissionEmployeesLoading: false,
            competency_manage_by: 'Admin',
            goal_manage_by: 'Admin',
        }))
    }

    const [deleteValue, setDeleteValue] = useState({
        show: false,
        id: null,
        loading: false
    })



    const handlePRCMenuList = (ele, menuItem) => {

        // console.log(ele, menuItem)

        switch (menuItem.id) {
            case 1:

                getSinglePRC(ele._id)

                break
            case 2:
                setViewPRC((prevState) => ({
                    ...prevState,
                    singleData: ele,
                    show: true
                }))
                break
            case 3:

                handleDelete(ele)

                break

            default:
                break
        }

    }



    function handleDelete(ele) {
        setDeleteValue((prevState) => ({
            ...prevState,
            id: ele._id,
            show: true,
        }))
    }


    const toggleDeleteConfirmatio = () => {
        setDeleteValue((prevState) => ({
            ...prevState,
            show: false,
        }))
    }


    const confirmDelete = async () => {
        setDeleteValue((prevState) => ({
            ...prevState,
            loading: true,
        }))
        try {

            const response = await performanceApi.deletePRC(deleteValue.id)
            console.log(response)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                deleteSinglePRC(deleteValue.id)
                showToast('Review Cycle deleted successfully', 'success')
                toggleDeleteConfirmatio()
            }

        } catch (err) {
            console.log(err)
        } finally {
            setDeleteValue((prevState) => ({
                ...prevState,
                loading: false,
            }))
        }
    }


    const formatTimestampToDate = (timestamp) => {
        if (!timestamp) return '';
        
        let date;
        // If timestamp is a number
        if (typeof timestamp === 'number') {
            // If timestamp is in seconds (10 digits), convert to milliseconds
            if (timestamp.toString().length === 10) {
                date = new Date(timestamp * 1000);
            } else {
                // If timestamp is already in milliseconds (13 digits)
                date = new Date(timestamp);
            }
        } else {
            // If timestamp is a string, try to parse it
            date = new Date(timestamp);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid timestamp:', timestamp);
            return '';
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const toggleViewPRC = () => {
        setViewPRC((prevState) => ({
            ...prevState,
            show: !prevState.show
        }))
    }

    const handleChangeRPC = (e) => {
        const { name, value, checked, type } = e.target;

        if (type === "checkbox") {
            const moduleId = parseInt(value, 10); // Assuming value is module ID
            setPRCAddValue((prevState) => {
                const newModulesType = checked
                    ? [...prevState.modulesType, moduleId] // Add if checked
                    : prevState.modulesType.filter((id) => id !== moduleId); // Remove if unchecked
                
                // Auto-set percentages based on module selection
                let newGoalRate = prevState.goal_rate;
                let newCompetencyRate = prevState.competancy_rate;
                
                const isGoalSelected = newModulesType.includes(1);
                const isCompetencySelected = newModulesType.includes(2);
                
                // If only one module is selected, set it to 100%
                if (isGoalSelected && !isCompetencySelected) {
                    newGoalRate = '100';
                    newCompetencyRate = '';
                } else if (!isGoalSelected && isCompetencySelected) {
                    newGoalRate = '';
                    newCompetencyRate = '100';
                } else if (isGoalSelected && isCompetencySelected) {
                    // If both are selected, set default 50-50
                    newGoalRate = '50';
                    newCompetencyRate = '50';
                } else {
                    // If none are selected, clear both
                    newGoalRate = '';
                    newCompetencyRate = '';
                }
                
                return {
                    ...prevState,
                    modulesType: newModulesType,
                    goal_rate: newGoalRate,
                    competancy_rate: newCompetencyRate
                };
            });
        } else {
            // For Goal and Competency rate validation
            if (name === "goal_rate" || name === "competancy_rate") {
                const numValue = parseFloat(value) || 0;
                
                // Validate individual percentage (not greater than 100)
                if (numValue > 100) {
                    showToast(`${name === "goal_rate" ? "Goal" : "Competency"} percentage cannot exceed 100%`, 'error');
                    return;
                }
                
                // Get current values and module selection
                const currentGoalRate = name === "goal_rate" ? numValue : parseFloat(PRCAddValue.goal_rate) || 0;
                const currentCompetencyRate = name === "competancy_rate" ? numValue : parseFloat(PRCAddValue.competancy_rate) || 0;
                const isGoalSelected = PRCAddValue.modulesType.includes(1);
                const isCompetencySelected = PRCAddValue.modulesType.includes(2);
                
                // If both modules are selected, validate total percentage
                if (isGoalSelected && isCompetencySelected) {
                    const totalPercentage = currentGoalRate + currentCompetencyRate;
                    if (totalPercentage > 100) {
                        showToast("Total percentage (Goal + Competency) cannot exceed 100%", 'error');
                        return;
                    }
                }
            }
            
            // Validate closing date (review_day) must be on or after end date
            if (name === "review_day" && PRCAddValue.end_date) {
                if (value && value < PRCAddValue.end_date) {
                    showToast("Closing date cannot be before the end date. Please select a date on or after the end date.", 'error');
                    return; // Don't update the value if it's invalid
                }
            }
            
            // If end date is changed and closing date exists, validate closing date
            if (name === "end_date" && PRCAddValue.review_day) {
                if (value && PRCAddValue.review_day < value) {
                    // If closing date is now before the new end date, clear it
                    setPRCAddValue((prevState) => ({
                        ...prevState,
                        [name]: value,
                        review_day: '', // Clear closing date if it's now invalid
                    }));
                    showToast("End date has been updated. Please select a new closing date on or after the end date.", 'warning');
                    return;
                }
            }
            
            // For other input types, update the corresponding field
            setPRCAddValue((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    }

    const handleSelectAddPRC = async (select, field) => {
        // console.log("This is slecet", select);
        // console.log("This is field", field)
        if (field === 'branch_id') {
            // Do NOT call get_branch_employee or departments here.
            // Branches are loaded when modal opens (AddEditPRC useEffect).
            // Departments are loaded when user selects branch via gettingSubBranches in AddEditPRC Branch onChange.
            // Employees are loaded only when user selects department (see department_id block below).
            const branchValue = select.value === 0 || select.value === '0' ? 0 : select.value;
            setPRCAddValue((prevState) => ({
                ...prevState,
                [field]: select,
                departments: [],
                employees: [],
                department_id: branchValue === 0 ? { value: 0, label: 'All Departments' } : null,
                emp_id: null,
                selectedEmp: prevState.selectedEmp ?? [] // Keep selected employees when branch changes
            }))

        } else if (field === 'department_id') {
            // Fetch employees only after department is selected (not on modal open).
            // Pass dept_id to get_all_employee: null for "All Departments", else department id.
            const deptValue = select.value === 0 || select.value === '0' ? 0 : select.value;
            const deptIdForApi = deptValue === 0 ? null : deptValue;

            let employeeOptions = [];
            try {
                const response = await employeesApi.get_all_employeee(deptIdForApi);
                const responseData = response?.data;
                if (response?.status === 200 && responseData?.STATUS === 'SUCCESSFUL' && Array.isArray(responseData?.DB_DATA)) {
                    employeeOptions = responseData.DB_DATA.map((emp) => ({
                        value: emp.id ?? emp.emp_id ?? emp.employee_id,
                        label: `${emp.name ?? ''} (ID: ${emp.id ?? emp.emp_id ?? emp.employee_id ?? ''})`,
                        id: emp.id,
                        name: emp.name
                    }));
                }
            } catch (err) {
                console.error('Error fetching employees for PRC:', err);
                showToast(err?.response?.data?.ERROR_DESCRIPTION ?? 'Failed to load employees', 'error');
            }

            setPRCAddValue((prevState) => ({
                ...prevState,
                [field]: select,
                employees: employeeOptions,
                emp_id: deptValue === 0 ? { value: 0, label: 'All Employees' } : null,
                selectedEmp: prevState.selectedEmp ?? [] // Keep selected employees when department changes
            }))
        } else if (field === 'emp_id') {
            // Handle "All Employees" option
            if (select && (select.value === 0 || select.value === '0')) {
                // If "All Employees" is selected, we need to handle it differently
                // For now, we'll just set it and let the submit handler process it
                setPRCAddValue((prevState) => ({
                    ...prevState,
                    [field]: select,
                    selectedEmp: [] // Clear selected employees when "All Employees" is selected
                }))
                showToast('All Employees selected', 'success');
                return;
            }
            
            // Check if employee is already selected
            const isAlreadySelected = PRCAddValue.selectedEmp.some(emp => emp.value === select.value);
            
            if (isAlreadySelected) {
                showToast('Employee already selected', 'warning');
                return;
            }

            setPRCAddValue((prevState) => ({
                ...prevState,
                selectedEmp: [...prevState.selectedEmp, select], // Add to array for multiple selection
                emp_id: null // Clear the employee selection after adding
            }))
            showToast('Employee Added', 'success')
        } else if (field === 'allow_goal_custom_employees' || field === 'allow_competency_custom_employees') {
            const arr = Array.isArray(select) ? select : (select ? [select] : [])
            setPRCAddValue((prevState) => ({ ...prevState, [field]: arr }))
        } else if (field === 'allow_goal_type' || field === 'allow_competency_type' || field === 'permissionsSectionOpen') {
            setPRCAddValue((prevState) => ({ ...prevState, [field]: select }))
        } else {
            setPRCAddValue((prevState) => ({
                ...prevState,
                [field]: select
            }));
        }
    }


    const getSinglePRC = async (id) => {
        try {
            const response = await performanceApi.getSinglePRC(id)
            const responseData = response.data
            if (responseData.STATUS !== "SUCCESSFUL") return
            const dbData = responseData.DB_DATA

            const selectedEmpArray = dbData.employee_name ? [{
                value: dbData.employee_id || dbData.one_id,
                label: dbData.employee_name
            }] : []

            // Resolve branch label: show branch name only (no ID)
            let branchLabel = 'All Branch'
            if (dbData.branch !== 0 && dbData.branch !== '0') {
                try {
                    const branchRes = await gettingEmployeeFrequentHit()
                    const branches = branchRes?.DB_DATA || []
                    const branch = Array.isArray(branches) && branches.find(
                        (b) => String(b?.id) === String(dbData.branch)
                    )
                    branchLabel = branch?.branch_name ?? branch?.name ?? 'Branch'
                } catch (_) {
                    branchLabel = 'Branch'
                }
            }

            // Resolve department label: show department name only (no ID)
            let departmentLabel = 'All Department'
            if (dbData.department !== 0 && dbData.department !== '0') {
                try {
                    const branchId = dbData.branch === 0 || dbData.branch === '0' ? 0 : dbData.branch
                    const deptOptions = await gettingDepartmentsServices(branchId) || []
                    const dept = Array.isArray(deptOptions) && deptOptions.find(
                        (d) => String(d?.value ?? d?.id) === String(dbData.department)
                    )
                    departmentLabel = dept?.label ?? dept?.name ?? 'Department'
                } catch (_) {
                    departmentLabel = 'Department'
                }
            }

            setPRCAddValue((prevState) => ({
                ...prevState,
                id: id,
                update: true,
                name: dbData.name,
                start_date: formatTimestampToDate(dbData.startDate),
                end_date: formatTimestampToDate(dbData.endDate),
                competancy_rate: dbData.competency_rate || 0,
                goal_rate: dbData.goal_rate || 0,
                branch_id: { value: dbData.branch, label: branchLabel },
                department_id: { value: dbData.department, label: departmentLabel },
                selectedEmp: selectedEmpArray,
                review_day: formatTimestampToDate(dbData.closing_date),
                show: true,
                isMultipleEmployeeMode: false,
                branches: [],
                departments: [],
                employees: [],
                competency_manage_by: dbData.competency_Manage_by || 'Admin',
                goal_manage_by: dbData.Goal_Manage_by || 'Admin',
            }))
        } catch (err) {
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Error fetching performance review'
            showToast(error, 'error')
            console.log(err)
        }
    }





    const validatePRCForm = () => {
        const { name, start_date, end_date, branch_id, department_id, selectedEmp, emp_id, review_day, isMultipleEmployeeMode, goal_rate, competancy_rate, modulesType } = PRCAddValue
        const nameValidation = validateInput('Name', name)
        if (!nameValidation.isValid) {
            return { isValid: false, message: nameValidation.message }
        }
        if (start_date === '') {
            return { isValid: false, message: "Select Start Date" }

        }
        if (end_date === '') {
            return { isValid: false, message: "Select End Date" }
        }

        if (!branch_id) {
            return { isValid: false, message: "Select Branch" }
        }
        if (!department_id) {
            return { isValid: false, message: "Select Department" }
        }
        
        // Check if "All Employees" is selected (value 0) or if specific employees are selected
        const isAllEmployeesSelected = emp_id && (emp_id.value === 0 || emp_id.value === '0');
        const hasSelectedEmployees = selectedEmp && selectedEmp.length > 0;
        
        // Unified validation - require either "All Employees" or at least one specific employee
        if (!isAllEmployeesSelected && !hasSelectedEmployees) {
            return { isValid: false, message: "Select at least one Employee or select All Employees" }
        }

        if (review_day === '') {
            return { isValid: false, message: "Select Closing Date" }
        }

        // Validate closing date must be on or after end date
        if (end_date && review_day && review_day < end_date) {
            return { isValid: false, message: "Closing date cannot be before the end date. Please select a date on or after the end date." }
        }

        // Validate Goal and Competency percentages if modules are selected
        if (modulesType && modulesType.length > 0) {
            const goalPercentage = parseFloat(goal_rate) || 0;
            const competencyPercentage = parseFloat(competancy_rate) || 0;
            const totalPercentage = goalPercentage + competencyPercentage;
            
            const isGoalSelected = modulesType.includes(1);
            const isCompetencySelected = modulesType.includes(2);

            // If both modules are selected, they must sum to 100%
            if (isGoalSelected && isCompetencySelected) {
                if (goalPercentage === 0 && competencyPercentage === 0) {
                    return { isValid: false, message: "Please enter Goal and Competency percentages" }
                }

                if (totalPercentage !== 100) {
                    return { isValid: false, message: `Goal and Competency percentages must sum to 100%. Current total: ${totalPercentage}%` }
                }
            }
            
            // If only one module is selected, it should be 100%
            if (isGoalSelected && !isCompetencySelected) {
                if (goalPercentage !== 100) {
                    return { isValid: false, message: `Goal percentage must be 100% when only Goal module is selected. Current: ${goalPercentage}%` }
                }
            }
            
            if (!isGoalSelected && isCompetencySelected) {
                if (competencyPercentage !== 100) {
                    return { isValid: false, message: `Competency percentage must be 100% when only Competency module is selected. Current: ${competencyPercentage}%` }
                }
            }

            // Individual percentage validation
            if (goalPercentage > 100 || competencyPercentage > 100) {
                return { isValid: false, message: "Individual percentages cannot exceed 100%" }
            }
        }

        return { isValid: true, message: '' }
    }



    const handleSubmitPRC = async () => {
        const validation = validatePRCForm()
        if (!validation.isValid) {
            showToast(validation.message, 'error');
            return
        }

        const { name, start_date, end_date, goal_rate, competancy_rate, branch_id, department_id, selectedEmp, emp_id, review_day, isMultipleEmployeeMode } = PRCAddValue;
        // console.log("PRCAddValue", PRCAddValue)

        // Handle "All" options - convert 0 to appropriate values for API
        const branchValue = branch_id.value === 0 || branch_id.value === '0' ? 0 : parseInt(branch_id.value);
        const deptValue = department_id.value === 0 || department_id.value === '0' ? 0 : parseInt(department_id.value);
        
        // Check if "All Employees" is selected
        const isAllEmployeesSelected = emp_id && (emp_id.value === 0 || emp_id.value === '0');

        // Build allow_goal: ['Admin'] | ['reporting manager'] | ['Self'] | [empId, ...]
        const allow_goal = PRCAddValue.allow_goal_type === 'custom'
            ? (PRCAddValue.allow_goal_custom_employees ?? []).map((opt) => (typeof opt === 'object' && opt?.value != null ? opt.value : opt))
            : [PRCAddValue.allow_goal_type];

        // Build allow_compenetency: ['Admin'] | ['reporting manager'] | [empId, ...]
        const allow_compenetency = PRCAddValue.allow_competency_type === 'custom'
            ? (PRCAddValue.allow_competency_custom_employees ?? []).map((opt) => (typeof opt === 'object' && opt?.value != null ? opt.value : opt))
            : [PRCAddValue.allow_competency_type];

        // competency_Manage_by / Goal_Manage_by derived from "Who Can Assign" selection
        const competency_Manage_by = mapAllowTypeToManageBy(PRCAddValue.allow_competency_type)
        const Goal_Manage_by = mapAllowTypeToManageBy(PRCAddValue.allow_goal_type)

        const apiData = {
            name: name,
            start_date: start_date,
            end_date: end_date,
            goal_rate: parseInt(goal_rate) || 0,
            competency_rate: parseInt(competancy_rate) || 0,
            branch: branchValue,
            department: deptValue,
            employee: isAllEmployeesSelected ? [0] : selectedEmp.map(emp => emp.value.toString()), // Convert to string or [0] for all
            assigned_to: isAllEmployeesSelected ? ['All Employees'] : selectedEmp.map(emp => emp.label), // Always array
            review_day: review_day,
            allow_goal,
            allow_compenetency,
            competency_Manage_by,
            Goal_Manage_by,
        };

        // Validate with schema
        try {
            await validateMultipleEmployeePRC.validate(apiData);
        } catch (validationError) {
            showToast(validationError.message, 'error');
            return;
        }

        setPRCAddValue((prevState) => ({
            ...prevState,
            loading: true
        }))

        try {
            const response = await performanceApi.createMultipleEmployeePRC(apiData);
            
            const responseData = response.data;
            // console.log('responseData.STATUS === "SUCCESSFUL"', responseData.STATUS === "SUCCESSFUL")
            if (responseData.STATUS === "SUCCESSFUL") {
                const newData = responseData.DB_DATA;
                // console.log("newDatanewData", newData);
                const new_added_RPC = {};
                newData.map((PRC_DATA) => {
                    new_added_RPC._id = PRC_DATA._id;
                    new_added_RPC.goal_rate = PRC_DATA.goal_rate;
                    new_added_RPC.competancy_rate = PRC_DATA.competancy_rate;
                    new_added_RPC.branch = PRC_DATA.branch;
                    new_added_RPC.employee_name = PRC_DATA.employee_name;
                    new_added_RPC.endDate = PRC_DATA.endDate;
                    new_added_RPC.review_day = PRC_DATA.review_day;
                    new_added_RPC.name = PRC_DATA.name;
                    new_added_RPC.department = PRC_DATA.department;
                    new_added_RPC.startDate = PRC_DATA.startDate;
                });
                // console.log("new_added_RPCnew_added_RPC", new_added_RPC)
                addNewRPC(new_added_RPC)
                showToast('Review Cycle Added successfully', 'success')
                toggleAddPRC();
            }
        } catch (err) {
            const error = err.response.data.ERROR_DESCRIPTION
            showToast(error, 'error')
        } finally {
            setPRCAddValue((prevState) => ({
                ...prevState,
                loading: false
            }))
        }
    }


    const getValue = (val) => (typeof val === 'object' && val !== null ? val.value : val);
    const getlabel = (val) => (typeof val === 'object' && val !== null ? val.label : val);


    const handleUpdatePRC = async () => {
        const validation = validatePRCForm()
        if (!validation.isValid) {
            showToast(validation.message, 'error');
            return
        }

        const { id, name, start_date, end_date, goal_rate, competancy_rate, branch_id, department_id, selectedEmp, review_day } = PRCAddValue

        // console.log("PRCAddValue", PRCAddValue);
        // return
        // For single employee update (always single for updates)
        const apiData = {
            name: name,
            start_date: start_date,
            end_date: end_date,
            goal_rate: parseInt(goal_rate) || 0,
            competency_rate: parseInt(competancy_rate) || 0,
            branch: parseInt(branch_id.value),
            department: parseInt(department_id.value),
            employee: selectedEmp.length > 0 ? selectedEmp[0].value.toString() : "",
            assigned_to: selectedEmp.length > 0 ? selectedEmp[0].label : "",
            review_day: review_day,
            competency_Manage_by: PRCAddValue.competency_manage_by,
            Goal_Manage_by: PRCAddValue.goal_manage_by,
        };

        // Validate with update schema
        try {
            await validateSingleEmployeePRCUpdate.validate(apiData);
        } catch (validationError) {
            showToast(validationError.message, 'error');
            return;
        }

        console.log("apiDataapiData", apiData)
        // console.log(apiData)
        setPRCAddValue((prevState) => ({
            ...prevState,
            loading: true
        }))




        try {
            const response = await performanceApi.updatePRC(apiData, id)
            console.log('response', response)
            const responseData = response.data
            if (responseData.STATUS === "SUCCESSFUL") {
                const storeData = {
                    _id: id,
                    goal_rate: goal_rate,
                    competancy_rate: competancy_rate,
                    branch: getlabel(branch_id),
                    endDate: Math.floor(new Date(end_date).getTime() / 1000),
                    review_day: review_day,
                    name: name,
                    department: getlabel(department_id),
                    employee_name: selectedEmp.length > 0 ? selectedEmp[0].label : "",
                    employee_id: selectedEmp.length > 0 ? selectedEmp[0].value : "",
                    startDate: Math.floor(new Date(start_date).getTime() / 1000),
                }
                updatePRC(storeData)
                showToast('Review Cycle Updated successfully', 'success')
                toggleAddPRC()
                // Refresh data with current pagination after successful update
                const currentPagination = useStore.getState().PRCPaginationData
                gettingPRCData(currentPagination?.currentPage || 1, currentPagination?.limit || 10)
            }

        } catch (err) {
            const error = err.response.data.ERROR_DESCRIPTION
            showToast(error, 'error')
        } finally {
            setPRCAddValue((prevState) => ({
                ...prevState,
                loading: false
            }))
        }
    }


    const handleRemoveEmp = (data) => {
        setPRCAddValue((prevState) => ({
            ...prevState,
            selectedEmp: prevState.selectedEmp.filter(emp => emp.value !== data.value)
        }))
    }



    const [searchValue, setSearchValue] = useState({
        name: ''
    })
    
    const [searchLoading, setSearchLoading] = useState(false)


    const debounceNoteSearch = useDebounce(async (value) => {
        console.log('Searching for:', value)
        setSearchLoading(true)
        try {
            await searchingPRC(value)
        } finally {
            setSearchLoading(false)
        }
    }, 800); // 800ms debounce time for better UX


    const handlePRCSearch = (e) => {
        const { name, value } = e.target
        setSearchValue((prevState) => ({
            ...prevState,
            [name]: value
        }))

        debounceNoteSearch(value);
    }





    return {
        PRCAddValue, toggleAddPRC, viewPRC, toggleViewPRC, handlePRCMenuList, deleteValue,
        toggleDeleteConfirmatio, confirmDelete,
        handleChangeRPC, handleSelectAddPRC,
        handleSubmitPRC, handleRemoveEmp, handleUpdatePRC,
        searchValue, handlePRCSearch, searchLoading,
        fetchPermissionEmployees,
    }

}


export default usePRCServices