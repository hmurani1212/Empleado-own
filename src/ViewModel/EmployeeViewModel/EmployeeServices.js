import { useEffect, useState, useCallback } from "react"
import useStore from "../../Store/store"
import employeesApi from "../../Model/Data/Employees/Employees"
import { showToast } from "../../Components/Toaster/Toaster"
import { format } from "date-fns"
import { convertToYMD } from "../../services/EmpServices"
import { useNavigate } from "react-router"
import { useDebounce } from "../../services/__debounceServices"
import InactiveEmployeesDetails from "../../View/Employees/InactiveEmployeesDetails"
import { executeApiCall, createApiKey } from "../../services/__apiManager"
import departmentsApi from "../../Model/Data/Departments/Departments"
import payrollApi from "../../Model/Data/Payroll/Payroll"
// import useDepartments from '../../ViewModel/DepartmentsViewModel/DepartmentsServices';

const useEmployees = () => {

    const getEmployeesList = useStore((state) => state.getEmployeesList)
    const allEmployees = useStore((state) => state.allEmployees)
    const empMount = useStore((state) => state.empMount)
    const handleEmpMount = useStore((state) => state.handleEmpMount)
    const allBranches = useStore((state) => state.allBranches)
    const getAllDepartments = useStore((state) => state.getAllDepartments)
    // const filterBranches = useStore((state) => state.filterBranches)
    const filterDepartments = useStore((state) => state.filterDepartments)
    const filterEmployeesList = useStore((state) => state.filterEmployeesList)
    const filterEmployeesListDept = useStore((state) => state.filterEmployeesListDept)
    const searchEmployees = useStore((state) => state.searchEmployees)
    const filterStatusEmployess = useStore((state) => state.filterStatusEmployess)
    const filterEmpAlphabet = useStore((state) => state.filterEmpAlphabet)
    const gettingCountries = useStore((state) => state.gettingCountries)
    const allCountries = useStore((state) => state.allCountries)
    const newEmployee = useStore((state) => state.newEmployee)
    const gettingEmployeeCheckList = useStore((state) => state.gettingEmployeeCheckList)
    const employeeCheckListData = useStore((state) => state.employeeCheckListData)
    const get_inactive_empfn = useStore((state) => state.get_inactive_empfn);
    const get_inactive_emp_data = useStore((state) => state.get_inactive_emp_data);
    const deactive_employeefn = useStore((state) => state.deactive_employeefn);
    const Active_employeefn = useStore((state) => state.Active_employeefn);
    const deactive_employee = useStore((state) => state.deactive_employee);
    const Get_All_Employeefn = useStore((state) => state.Get_All_Employeefn);
    const Get_All_Employee = useStore((state) => state.Get_All_Employee);
    const getHeaderDatafn = useStore((state) => state.getHeaderDatafn);
    const getHeaderData = useStore((state) => state.getHeaderData);
    const fetchHrPolicyDropdown = useStore((state) => state.fetchHrPolicyDropdown);
    const hrPolicyDropdown = useStore((state) => state.hrPolicyDropdown);
    const get_all_department = useStore((state) => state.get_all_department);
    const get_all_department_fn = useStore((state) => state.get_all_department_fn);

    // Signature functions
    const signatures = useStore((state) => state.signatures);
    const isLoadingSignatures = useStore((state) => state.isLoadingSignatures);
    const getSignatures = useStore((state) => state.getSignatures);
    const addSignature = useStore((state) => state.addSignature);
    const deleteSignature = useStore((state) => state.deleteSignature);

    // Digital Signature functions
    const digitalSignature = useStore((state) => state.digitalSignature);
    const isLoadingDigitalSignature = useStore((state) => state.isLoadingDigitalSignature);
    const getDigitalSignature = useStore((state) => state.getDigitalSignature);
    const addDigitalSignature = useStore((state) => state.addDigitalSignature);

    // Birthday Template functions
    const birthdayTemplate = useStore((state) => state.birthdayTemplate);
    const isLoadingBirthdayTemplate = useStore((state) => state.isLoadingBirthdayTemplate);
    const isSavingBirthdayTemplate = useStore((state) => state.isSavingBirthdayTemplate);
    const getBirthdayTemplate = useStore((state) => state.getBirthdayTemplate);
    const updateBirthdayTemplate = useStore((state) => state.updateBirthdayTemplate);

    // Mobile Attendance functions
    const mobileAttendanceConfig = useStore((state) => state.mobileAttendanceConfig);
    const isLoadingMobileAttendance = useStore((state) => state.isLoadingMobileAttendance);
    const isTogglingMobileAttendance = useStore((state) => state.isTogglingMobileAttendance);
    const isTogglingLocationLog = useStore((state) => state.isTogglingLocationLog);
    const getMobileAttendanceConfig = useStore((state) => state.getMobileAttendanceConfig);
    const toggleMobileAttendance = useStore((state) => state.toggleMobileAttendance);
    const toggleMobileAttendanceLocationLog = useStore((state) => state.toggleMobileAttendanceLocationLog);

    // Retirement and Probation functions
    const retirementData = useStore((state) => state.retirementData);
    const isLoadingRetirementData = useStore((state) => state.isLoadingRetirementData);
    const isSavingRetirementData = useStore((state) => state.isSavingRetirementData);
    const getRetirementData = useStore((state) => state.getRetirementData);
    const setRetirementData = useStore((state) => state.setRetirementData);

    // Reporting Email functions
    const reportingEmails = useStore((state) => state.reportingEmails);
    const isLoadingReportingEmails = useStore((state) => state.isLoadingReportingEmails);
    const isSavingReportingEmail = useStore((state) => state.isSavingReportingEmail);
    const getReportingEmails = useStore((state) => state.getReportingEmails);
    const sendReportingEmail = useStore((state) => state.sendReportingEmail);

    // Profile Update Invite function
    const sendProfileUpdateInvite = useStore((state) => state.sendProfileUpdateInvite);

    // Logo functions
    const orgLogo = useStore((state) => state.orgLogo);
    const isLoadingLogo = useStore((state) => state.isLoadingLogo);
    const getOrgLogo = useStore((state) => state.getOrgLogo);
    const updateOrgLogo = useStore((state) => state.updateOrgLogo);
    const get_bank_type = useStore((state) => state.get_bank_type);
    const get_bank_type_fn = useStore((state) => state.get_bank_type_fn);

    // Logout function
    const logout = useStore((state) => state.logout);
    const [listView, setListView] = useState(true)
    const [verfiyUser, setVerifyUser] = useState(false)
    const [findingEmp, setFindingEmp] = useState({
        email: {},
        phone: {},
        userFind: false
    })
    const empTitles = [
        { id: 1, title: 'All Employees', link: '/employees/all_employess' },
        { id: 2, title: 'Add New Employee', link: '/employees/add_emp' },
        { id: 3, title: 'Add Bulk Employee', link: '/employees/add_bulk_emp' },
        { id: 4, title: 'Employee Checklist', link: '/employees/emp_checkList' },
    ]
    const empStatus = [
        { id: 1, title: 'All Employees', status: '' },
        { id: 2, title: 'Active Employees', status: '1' },
        { id: 3, title: 'Inactive Employees', status: '0' },
        { id: 4, title: 'Inactive Employees Details', status: '' },
    ]

    const [empBranches, setEmpBranches] = useState([])
    const [empManager, setEmpmanager] = useState([])

    // console.log("empBranchesempBranches", empBranches)

    const [filterValues, setFilterValues] = useState({
        branchId: '',
        branchName: '',
        dept_id: '',
        dept_name: '',
        searchEmployee: '',
    })

    const [paginationData, setPaginationData] = useState({
        currentPage: 1,
        totalPages: 1,
        hasMore: false
    });

    const [currentEmployeeStatus, setCurrentEmployeeStatus] = useState('1'); // Track current status filter

    // Function to set initial status
    const setInitialStatus = (status) => {
        setCurrentEmployeeStatus(status);
    };

    // Centralized API call for employees - ensures only one call is made
    const centralizedGetEmployees = async (filters = {}) => {
        const apiKey = createApiKey('/api/v1/employees', filters);
        try {
            const response = await executeApiCall(apiKey, () => employeesApi.getEmployeesWithFilters(filters));
            const data = response.data;
            if (data.STATUS === "SUCCESSFUL") {
                useStore.setState({ allEmployees: data.DB_DATA });
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    // Centralized API call for branches - ensures only one call is made
    const centralizedGetBranches = async () => {
        const apiKey = createApiKey('/api/v1/branches/get_branch_employee', {});
        try {
            const response = await executeApiCall(apiKey, () => employeesApi.gettingAllBranches());
            const data = response.data;
            if (data.STATUS === "SUCCESSFUL") {
                // console.log('Setting empBranches with:', data.DB_DATA.branches);
                setEmpBranches(data.DB_DATA.branches);
            }
        } catch (err) {
            console.error('Error fetching branches:', err);
        }
    };

    const handleFilterChange = (title, selectedValue) => {
        //// console.log('handleFilterChange called with:', { title, selectedValue });

        // Handle "All Branches" case (empty value or empty string)
        if (!selectedValue || selectedValue === "" || (typeof selectedValue === 'string' && selectedValue === "")) {
            /// console.log('Clearing branch filter');
            setFilterValues((prevState) => ({
                ...prevState,
                branchName: "",
                branchId: "",
            }));
            resetPagination();
            // Get employees with current status filter but no branch filter
            const currentStatus = currentEmployeeStatus || "1";
            ///console.log('Calling getEmployeesWithFilters with status only:', { status: currentStatus });
            getEmployeesWithFilters({ status: currentStatus, page: 1 });
        } else {
            //// console.log('Setting branch filter for:', selectedValue);
            setFilterValues((prevState) => ({
                ...prevState,
                branchName: selectedValue.branch_name,
                branchId: selectedValue.id,
            }));
            resetPagination();
            // Get employees with both status and branch filters
            const currentStatus = currentEmployeeStatus || "1";
            /// console.log('Calling getEmployeesWithFilters with both filters:', { status: currentStatus, branch_id: selectedValue.id });
            getEmployeesWithFilters({ status: currentStatus, branch_id: selectedValue.id, page: 1 });
        }
    };


    const handleFilterDeptChange = (data) => {
        setFilterValues((prevState) => ({
            ...prevState,
            dept_name: data.name,
            dept_id: data.id,
        }));
        resetPagination();
        filterEmployeesListDept(data.name);
    }

    // Create a memoized debounced version of getEmployeesWithFilters
    const debouncedSearch = useDebounce(
        useCallback((searchText) => {
            // Use the current status state and reset to page 1
            getEmployeesWithFilters({ text: searchText, status: currentEmployeeStatus, page: 1 });
        }, [currentEmployeeStatus]),
        500
    );

    const handleChangeEmployees = (e) => {
        const { name, value } = e.target;
        setFilterValues((prevState) => ({
            ...prevState,
            [name]: value
        }));
        resetPagination();
        debouncedSearch(value);
    };

    // Load countries when component mounts
    useEffect(() => {
        gettingCountries();
    }, []);
    // const { handleUpdatingHod } = useDepartments()
    // Get drawer functions from store
    const openDrawer = useStore((state) => state.openDrawer);
    const settingDrawerTitle = useStore((state) => state.settingDrawerTitle);
    const settingDrawerSize = useStore((state) => state.settingDrawerSize);
    const settingComponent = useStore((state) => state.settingComponent);

    const handleStatusFilter = (data) => {
        // console.log('Night data data', data)
        if (data.id == 4) {
            // Open drawer for Inactive Employees Details
            openDrawer();
            settingDrawerTitle('Inactive Employees List');
            settingDrawerSize(600);
            settingComponent(<InactiveEmployeesDetails />);
        } else {
            resetPagination();
            // Send status: '3' for All Employees (id: 1), otherwise use the original status
            const statusValue = data.id === 1 ? '3' : data.status;
            setCurrentEmployeeStatus(statusValue); // Update current status state
            getEmployeesWithFilters({ status: statusValue, page: 1 });
        }
    }

    // useEffect(() => {

    //     searchEmployees(filterValues.searchEmployee);
    // }, [filterValues.searchEmployee]);




    const handleListToggle = () => {
        setListView(true)
    }
    const handleGridToggle = () => {
        setListView(false)
    }

    const [alphaIndex, setAlhpaIndex] = useState(0)

    // const handleEmployessToggle = (empData)=>{
    //     const link = empData.link
    //     navigate(link)
    // }

    const handelAlphabetSearch = (alpha, index) => {
        setAlhpaIndex(index)
        // Removed API calls - handled by handleAlphabetFilter in component
    }



    //for adding employess single


    let employee_exicute = 0;


    const [newEmpValues, setNewEmpValues] = useState({
        mobile: '',
        email: '',
        full_name: '',
        father_name: '',
        country_code: null,
        network: null,
        dob: '',
        showPassword: false,
        password: '',
        passport: '',
        joing_date: '',
        salary_template: null,
        empStatus: null,
        work_policy: null,
        reporting_manager: null,
        designation: null,
        department: null,
        branch: null,
        empID: '',
        gender: '',
        one_id: '',
        org_id: '',
        mobile_no: '',


    })
    const [loading, setLoading] = useState(false)
    const [isAddingEmployee, setIsAddingEmployee] = useState(false)
    const [isCreatingSalaryTemplate, setIsCreatingSalaryTemplate] = useState(false)

    // Initialize password with random 6-digit number on component mount
    useEffect(() => {
        const initialPassword = Math.floor(100000 + Math.random() * 900000).toString();
        setNewEmpValues((prevState) => ({
            ...prevState,
            password: initialPassword
        }));
    }, []);

    // Helper function to validate age (must be at least 15 years old)
    const validateAge = (dobString) => {
        if (!dobString) return { isValid: false, age: 0, message: 'Date of birth is required' };

        // console.log('validateAge input:', dobString, 'type:', typeof dobString);

        // Test case: December 31, 2010
        if (dobString && dobString.includes('December') && dobString.includes('2010')) {
            // console.log('Testing December 31, 2010 case...');
        }

        let dob;

        // Handle different date formats
        if (typeof dobString === 'string') {
            // Try parsing as formatted date first (e.g., "February 5th, 2005")
            dob = new Date(dobString);

            // If that fails, try parsing as ISO date or other formats
            if (isNaN(dob.getTime())) {
                // Try different parsing approaches
                const datePatterns = [
                    /(\w+)\s+(\d+)(?:st|nd|rd|th)?,\s+(\d{4})/, // "February 5th, 2005"
                    /(\d{4})-(\d{2})-(\d{2})/, // "2005-02-05"
                    /(\d{2})\/(\d{2})\/(\d{4})/, // "02/05/2005"
                ];

                let match = null;
                for (const pattern of datePatterns) {
                    match = dobString.match(pattern);
                    if (match) break;
                }

                if (match) {
                    if (match[1] && isNaN(match[1])) {
                        // Month name format: "February 5th, 2005"
                        const monthNames = {
                            'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
                            'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
                        };
                        const month = monthNames[match[1].toLowerCase()];
                        const day = parseInt(match[2]);
                        const year = parseInt(match[3]);
                        dob = new Date(year, month, day);
                    } else {
                        // Numeric format
                        const year = parseInt(match[3] || match[1]);
                        const month = parseInt(match[2] || match[1]) - 1; // Month is 0-indexed
                        const day = parseInt(match[1] || match[2]);
                        dob = new Date(year, month, day);
                    }
                }
            }
        } else {
            dob = new Date(dobString);
        }

        const today = new Date();

        // console.log('Parsed DOB:', dob);
        // console.log('Today:', today);

        // Check if date is valid
        if (isNaN(dob.getTime())) {
            // console.log('Invalid date format');
            return { isValid: false, age: 0, message: 'Invalid date format' };
        }

        // Calculate age more accurately
        let ageInYears = today.getFullYear() - dob.getFullYear();

        // Check if birthday has occurred this year
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            ageInYears--;
        }

        // Ensure age is not negative
        if (ageInYears < 0) {
            ageInYears = 0;
        }

        // console.log('Calculated age:', ageInYears);
        // console.log('Is valid (>=15):', ageInYears >= 15);

        // // Detailed logging for December 31, 2010 case
        // if (dobString && dobString.includes('December') && dobString.includes('2010')) {
        //     console.log('=== DECEMBER 31, 2010 ANALYSIS ===');
        //     console.log('DOB Year:', dob.getFullYear());
        //     console.log('DOB Month:', dob.getMonth() + 1); // +1 because months are 0-indexed
        //     console.log('DOB Day:', dob.getDate());
        //     console.log('Today Year:', today.getFullYear());
        //     console.log('Today Month:', today.getMonth() + 1);
        //     console.log('Today Day:', today.getDate());
        //     console.log('Year difference:', today.getFullYear() - dob.getFullYear());
        //     console.log('Month difference:', today.getMonth() - dob.getMonth());
        //     console.log('Day difference:', today.getDate() - dob.getDate());
        //     console.log('Birthday this year?', today.getMonth() > dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate()));
        //     console.log('Final age:', ageInYears);
        //     console.log('=== END ANALYSIS ===');
        // }

        const isValid = ageInYears >= 15;
        const message = isValid ? '' : `Employee age must be at least 15 years. Current age: ${ageInYears} years.`;

        return { isValid, age: ageInYears, message };
    };

    const passwordToggle = () => {
        setNewEmpValues((prevState) => ({
            ...prevState,
            showPassword: !prevState.showPassword

        }))
    }
    // Normalize mobile to +92xxxxxxxxxx for API (accepts with or without country code)
    const normalizeMobileForApi = (raw) => {
        if (!raw || typeof raw !== 'string') return raw
        const digits = raw.replace(/\D/g, '')
        if (digits.length === 11 && digits.startsWith('0')) {
            return '+92' + digits.slice(1)
        }
        if (digits.length === 10 && digits.startsWith('3')) {
            return '+92' + digits
        }
        if (digits.length === 12 && digits.startsWith('92')) {
            return '+' + digits
        }
        if (raw.trim().startsWith('+') && digits.length >= 10) {
            return raw.trim().startsWith('+92') ? '+92' + digits.slice(2).slice(0, 10) : raw
        }
        return raw
    }

    const validateFindUser = () => {
        if (!newEmpValues.mobile || String(newEmpValues.mobile).trim() === '') {
            showToast('Enter Contact Number', 'error')
            return
        }

        const raw = String(newEmpValues.mobile).trim()
        const digitsOnly = raw.replace(/\D/g, '')

        // Accept: 03xxxxxxxxx (11), 3xxxxxxxxx (10), 92xxxxxxxxxx (12), or with + prefix
        const isLocalPak = digitsOnly.length === 11 && digitsOnly.startsWith('03') && /^\d{11}$/.test(digitsOnly)
        const isTenDigitPak = digitsOnly.length === 10 && digitsOnly.startsWith('3') && /^\d{10}$/.test(digitsOnly)
        const is92Pak = digitsOnly.length === 12 && digitsOnly.startsWith('92')

        if (!(isLocalPak || isTenDigitPak || is92Pak)) {
            showToast('Enter a valid mobile number (with or without country code)', 'error')
            return
        }

        return true
    }

    const [activeStep, setActiveStep] = useState(0);
    const [isFirstStep, setIsFirstStep] = useState(true);
    const [isLastStep, setIsLastStep] = useState(false);
    const [completedSteps, setCompletedSteps] = useState(new Set([0])); // Track completed steps, start with step 0
    const [findEmployeeCompleted, setFindEmployeeCompleted] = useState(false); // Track if Find Employee step is actually completed
    // const [userFind, setUserFind] = useState(false);

    const handleStepActive = (step) => {
        // Allow navigation to completed steps or the next available step
        if (!completedSteps || completedSteps.size === 0) {
            setActiveStep(step)
            return
        }



        // For step 1 (Personal Information), require Find Employee to be completed
        if (step === 1 && !findEmployeeCompleted) {
            return // Don't allow navigation to step 1 if Find Employee is not completed
        }

        // For step 2 (Official Information), require step 1 to be completed
        if (step === 2 && !completedSteps.has(1)) {
            return // Don't allow navigation to step 2 if step 1 is not completed
        }

        const maxCompletedStep = Math.max(...completedSteps);
        if (completedSteps.has(step) || step === maxCompletedStep + 1) {
            setActiveStep(step)
        }
    }
    const handlePrev = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    const handleNext = () => {
        // Assume you have a total number of steps stored in a variable named totalSteps
        const validate = validateFindUser()
        // Change this value based on the total number of steps
        if (validate) {
            if (isFirstStep) {
                getFindEmp()
            } else if (!isFirstStep && !isLastStep) {
                // Validate age before proceeding to next step
                if (newEmpValues.dob) {
                    const ageValidation = validateAge(newEmpValues.dob);
                    if (!ageValidation.isValid) {
                        showToast('Age must be greater than 15 years for enrollment', 'error');
                        return; // Don't proceed to next step
                    }
                }

                setActiveStep(activeStep + 1);
                // Mark current step as completed
                setCompletedSteps(prev => new Set([...prev, activeStep]));
                fetchingAllBranches();
            }
        }
    };

    const handleLastStep = (value) => {
        setIsLastStep(value)
    }
    const handleFirstStep = (value) => {
        setIsFirstStep(value)
    }


    const fetchingAllBranches = async () => {
        await centralizedGetBranches();
    }
    const fetchingAllEmployess = async (branch_id) => {
        try {
            const response = await employeesApi.getEmpReportManager(branch_id)
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // Updated to handle new API response format - data is in DB_DATA.employees
                setEmpmanager(data.DB_DATA?.employees || [])
            } else {
                setEmpmanager([])
            }

        } catch (err) {
            console.log('Error fetching reporting managers:', err)
            setEmpmanager([])
        }
    }




    const handleNewEmpChange = (e) => {
        const { name, value } = e.target

        // if(name === 'dob'){
        //     console.log('value',value)
        // }else{


        setNewEmpValues((prevState) => ({
            ...prevState,
            [name]: value
        }))
        // }
    }

    const handleDOB = (timeStamp, field) => {
        ////console.log(timeStamp, field)
        const date = format(timeStamp, "PPP")

        setNewEmpValues((prevState) => ({
            ...prevState,
            [field]: date
        }))
    }


    function generateRandomCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters.charAt(randomIndex);
        }
        return code;
    }



    const handleVerifyUserModalClose = () => {
        setVerifyUser(!verfiyUser)
    }

    const formatingData = (timeStamp) => {
        console.log('timeStamp', timeStamp)
        const formattedDateOfBirth = format(new Date(timeStamp), "PPP")

        console.log('formattedDateOfBirth', formattedDateOfBirth)

        return formattedDateOfBirth
    }

    const getFindEmp = async () => {
        setLoading(true)
        const mobileForApi = normalizeMobileForApi(newEmpValues.mobile) || newEmpValues.mobile
        const data = { mobile: mobileForApi, email: newEmpValues.email }
        try {
            const response = await employeesApi.findEmployee(data);
            const resData = response.data;

            console.log('check_employee API response:', resData);

            gettingCountries();

            // Check if this is an error response
            if (resData.STATUS === "ERROR") {
                // Check if error is "User is already enrolled in your Organization"
                if (resData.ERROR_DESCRIPTION === "User is already enrolled in your Organization" ||
                    resData.ERROR_CODE === "VTWE-143782159" ||
                    resData.ERROR_FILTER === "INVALID_ONE_ID") {
                    showToast('User is already enrolled in your Organization', 'error');
                    return; // Don't proceed to next step
                }
                // Check if error is "No employee found for the provided credentials"
                else if (resData.ERROR_DESCRIPTION === "No employee found for the provided credentials" ||
                    resData.ERROR_CODE === "VTWE-143782160" ||
                    resData.ERROR_FILTER === "ONE_ID_NOT_FOUND") {
                    // Allow user to proceed to add employee form
                    setActiveStep(activeStep + 1);
                    setCompletedSteps(prev => new Set([...prev, 0]));
                    setFindEmployeeCompleted(true);
                    showToast('No employee found.', 'info');
                    // Set empty values for one_id, org_id, and mobile_no when no employee found
                    setNewEmpValues((prevState) => ({
                        ...prevState,
                        one_id: '',
                        org_id: '',
                        mobile_no: ''
                    }));
                    return;
                }
                else {
                    // Other errors - show error message and don't proceed
                    showToast(resData.ERROR_DESCRIPTION || 'Failed to find employee', 'error');
                    return;
                }
            }

            // Handle successful response
            if (resData.STATUS === "SUCCESSFUL" && resData.DB_DATA) {
                const oneId = resData.DB_DATA.oneid;
                const userProfile = resData.DB_DATA.user_profile || {};

                // Extract user profile data
                const fullName = userProfile.full_name || '';
                const dob = userProfile.dob || '';
                const gender = userProfile.gender || '';
                const countryName = userProfile.country_name || '';

                // Format date of birth for date input (YYYY-MM-DD format)
                let formattedDobForInput = '';
                if (dob) {
                    try {
                        // Handle ISO date string (e.g., "2001-01-09T19:00:00.000Z")
                        const dobDate = new Date(dob);
                        if (!isNaN(dobDate.getTime())) {
                            const year = dobDate.getFullYear();
                            const month = String(dobDate.getMonth() + 1).padStart(2, '0');
                            const day = String(dobDate.getDate()).padStart(2, '0');
                            formattedDobForInput = `${year}-${month}-${day}`;
                        }
                    } catch (e) {
                        console.error('Error formatting DOB:', e);
                    }
                }

                // Convert gender to numeric format (Male -> "1", Female -> "0")
                let genderValue = '';
                if (gender) {
                    genderValue = gender.toLowerCase() === 'male' ? '1' :
                        gender.toLowerCase() === 'female' ? '0' : '';
                }

                // Find country by country_name and create country_code object
                let countryCodeOption = null;
                if (countryName && allCountries && allCountries.length > 0) {
                    const matchedCountry = allCountries.find(
                        country => country.country_name &&
                            country.country_name.toLowerCase() === countryName.toLowerCase()
                    );
                    if (matchedCountry) {
                        countryCodeOption = {
                            value: matchedCountry.id,
                            label: matchedCountry.country_name
                        };
                    }
                }

                // Format date of birth for display (formatted version)
                let formattedDobForDisplay = '';
                if (dob) {
                    try {
                        const dobDate = dob.includes('T') ? new Date(dob) : new Date(dob);
                        formattedDobForDisplay = format(dobDate, "PPP");
                    } catch (e) {
                        formattedDobForDisplay = userProfile.dob_formatted || dob;
                    }
                }

                // Move to next step
                setVerifyUser(true);
                setActiveStep(activeStep + 1);
                setCompletedSteps(prev => new Set([...prev, 0]));
                setFindEmployeeCompleted(true);

                // Store user profile data in findingEmp state for display
                setFindingEmp((prevState) => ({
                    ...prevState,
                    userFind: true,
                    userProfile: userProfile, // Store complete user profile
                    oneid: oneId,
                }));

                // Update form values with user profile data
                setNewEmpValues((prevState) => ({
                    ...prevState,
                    full_name: fullName,
                    dob: formattedDobForInput, // Use YYYY-MM-DD format for date input
                    gender: genderValue, // Set gender value
                    country_code: countryCodeOption, // Set country code object
                    one_id: oneId ? String(oneId) : '',
                    // Keep email if user provided one, otherwise keep empty
                    email: prevState.email || '',
                    password: generateRandomCode(),
                }));

            } else {
                // If response is not SUCCESSFUL and not ERROR (unexpected format)
                setActiveStep(activeStep + 1);
                setCompletedSteps(prev => new Set([...prev, 0]));
                setFindEmployeeCompleted(true);
                showToast('No Employee Found', 'error');
                setNewEmpValues((prevState) => ({
                    ...prevState,
                    one_id: '',
                    org_id: '',
                    mobile_no: ''
                }));
            }
        } catch (err) {
            console.error('Error in getFindEmp:', err);

            // Check if it's the specific "User is already enrolled" error
            if (err?.response?.data?.ERROR_DESCRIPTION === "User is already enrolled in your Organization" ||
                err?.response?.data?.ERROR_CODE === "VTWE-143782159" ||
                err?.response?.data?.ERROR_FILTER === "INVALID_ONE_ID") {
                showToast('User is already enrolled in your Organization', 'error');
                return; // Don't proceed to next step
            }

            // Check if it's the "No employee found" error - allow user to proceed
            const errorDesc = err?.response?.data?.ERROR_DESCRIPTION;
            const errorCode = err?.response?.data?.ERROR_CODE;
            const errorFilter = err?.response?.data?.ERROR_FILTER;

            if (errorDesc === "No employee found for the provided credentials" ||
                errorDesc === "No employee record found" ||
                errorCode === "VTWE-143782160" ||
                errorFilter === "ONE_ID_NOT_FOUND") {
                // Allow user to proceed to add employee form
                setActiveStep(activeStep + 1);
                setCompletedSteps(prev => new Set([...prev, 0]));
                setFindEmployeeCompleted(true);
                showToast('No employee found.', 'info');
                // Set empty values for one_id, org_id, and mobile_no when no employee found
                setNewEmpValues((prevState) => ({
                    ...prevState,
                    one_id: '',
                    org_id: '',
                    mobile_no: ''
                }));
                return;
            } else {
                // For any other error, show the error message and stop the user
                const errorMessage = err?.response?.data?.ERROR_DESCRIPTION || err?.message || 'Failed to find employee';
                showToast(errorMessage, 'error');
                console.log('Error details:', err);
            }
        }finally{
            setLoading(false)
        }
    }

    const handleSelectChange = (selectedOption, field) => {
        if (field === 'country_code') {
            // If country is selected and it's not Pakistan (ID: 162), reset network to null
            if (selectedOption && selectedOption.value !== "162") {
                setNewEmpValues((prevState) => ({
                    ...prevState,
                    [field]: selectedOption,
                    network: null // Reset network when country is not Pakistan
                }));
            } else {
                setNewEmpValues((prevState) => ({
                    ...prevState,
                    [field]: selectedOption
                }));
            }
        } else if (field === 'network') {
            setNewEmpValues((prevState) => ({
                ...prevState,
                [field]: selectedOption
            }));
        } else if (field === 'branch') {
            // Reset department and designation when branch changes
            setNewEmpValues((prevState) => ({
                ...prevState,
                [field]: selectedOption,
                department: null,
                designation: null,
                reporting_manager: null
            }));
            gettingSubBranches(selectedOption.value);
            // gettingPolicies(selectedOption.value);
            fetchHrPolicyDropdown(selectedOption.value);
            get_all_department_fn(selectedOption.value);
            gettingSalayTemplate(selectedOption.value);
            gettingDesignation(selectedOption.value, true) // true = branch_id for designation API
            fetchingAllEmployess(selectedOption.value);
        } else if (field === 'department') {
            setNewEmpValues((prevState) => ({
                ...prevState,
                [field]: selectedOption,
                designation: null // Reset designation when department changes
            }));
            gettingDesignation(selectedOption.value, false); // false = dept_id for designation API
        } else {
            setNewEmpValues((prevState) => ({
                ...prevState,
                [field]: selectedOption
            }));
        }
    };

    const [dept_subDept, setDept_subDept] = useState([])
    const [designations, setDesignations] = useState([])
    const [salaryTemplate, setSalaryTemplate] = useState([])
    const [policies, setPolicies] = useState([])


    const gettingSubBranches = async (id) => {
        //// console.log('gettingSubBranches called with id:', id);
        const data = { parent_id: 0, branch_id: id, getAll: true }
        try {
            const response = await employeesApi.gettingSubDepts(data)
            const resData = response.data
            console.log('Departments API response:', resData);
            if (resData.STATUS === "SUCCESSFUL") {
                setDept_subDept(resData.DB_DATA)
                // Clear designations when departments change
                setDesignations([])
                // console.log('Departments set:', resData.DB_DATA);
            } else {
                setDept_subDept([])
                setDesignations([])
            }
        } catch (err) {
            console.error("Error fetching departments:", err)
            setDept_subDept([])
            setDesignations([])
        }
    }
    const gettingPolicies = async (id) => {
        const data = { branch_id: id }
        try {

            const response = await employeesApi.getPolicies(data)
            const resData = response.data
            // console.log('response policies',response)
            if (response.status === 200 && resData.STATUS === "SUCCESSFUL") {
                // Updated to handle new API response format
                setPolicies(resData.DB_DATA.policies || [])
            } else {
                setPolicies([])
            }
        } catch (err) {
            console.log('Error getting policies:', err)
            setPolicies([])
        }
    }
    const gettingDesignation = async (id, isBranch = false) => {
        ////console.log('gettingDesignation called with id:', id, 'isBranch:', isBranch);
        const data = isBranch ? { branch_id: id } : { d_id: id };
        // console.log('***********', isBranch)

        try {
            const response = await employeesApi.getDesignations(data)
            const resData = response.data
            ///console.log('Designations API response:', resData);
            if (response.status === 200 && resData.STATUS === "SUCCESSFUL") {
                // Handle different response structures
                let designationsData = [];

                if (resData?.DB_DATA?.designations) {
                    // Direct designations array
                    designationsData = resData.DB_DATA.designations;
                } else if (resData?.DB_DATA?.departments) {
                    // Designations nested in departments
                    designationsData = resData.DB_DATA.departments.flatMap(dept => dept.designations || []);
                }

                setDesignations(designationsData);
                ///console.log('Designations set:', designationsData);
            } else {
                setDesignations([])
            }
        } catch (err) {
            console.error("Error fetching designations:", err)
            setDesignations([])
        }
    }
    const gettingSalayTemplate = async (id) => {
        const data = { bid: id }
        try {

            const response = await employeesApi.getSalaryTemplate(data)
            const resData = response.data
            // console.log('response designations',response)
            if (response.status === 200 && resData.STATUS === "SUCCESSFUL") {
                // console.log('resData.DB_DATA',resData.DB_DATA)
                setSalaryTemplate(resData.DB_DATA)
            } else {
            }
        } catch (err) {
        }
    }

    const createSalaryTemplateFromEmployee = async (formData) => {
        setIsCreatingSalaryTemplate(true);
        try {
            // Validate form data
            if (!formData.template_name || !formData.salary_amount) {
                showToast('Please fill in all required fields', 'error');
                setIsCreatingSalaryTemplate(false);
                return;
            }

            // Determine branch_id based on selection
            let branch_id = 0;
            if (formData.branch_option === 'selected') {
                if (!formData.selected_branch_id) {
                    showToast('Please select a branch first', 'error');
                    return;
                }
                branch_id = formData.selected_branch_id;
            } else {
                // 'all' branch option - send 0
                branch_id = 0;
            }

            // Prepare payload according to API requirements
            const payload = {
                template_name: formData.template_name,
                salary: parseFloat(String(formData.salary_amount).replace(/,/g, '') || 0),
                branch_id: branch_id,
                deptt_id: 0
            };

            const response = await payrollApi.createSalaryTemp(payload);
            const data = response.data;

            if (response.status === 200 && data.success) {
                showToast('Salary Template Created Successfully', 'success');

                // Extract template ID from response
                const createdTemplateId = data.data?.id || data.id || data.data?.template_id || null;

                // Refresh salary templates list if branch was selected
                if (formData.branch_option === 'selected' && formData.selected_branch_id) {
                    await gettingSalayTemplate(formData.selected_branch_id);
                } else if (formData.branch_option === 'all' && formData.selected_branch_id) {
                    // If all branches selected but we have a branch context, refresh for that branch
                    await gettingSalayTemplate(formData.selected_branch_id);
                }

                // Return the created template data for auto-selection
                return {
                    success: true,
                    data: data.data || data,
                    template_id: createdTemplateId
                };
            } else {
                showToast(data.message || 'Failed to create salary template', 'error');
                return { success: false, error: data.message || 'Failed to create salary template' };
            }
        } catch (error) {
            console.error('Error creating salary template:', error);
            showToast('Error creating salary template', 'error');
            return { success: false, error: error.message || 'Error creating salary template' };
        } finally {
            setIsCreatingSalaryTemplate(false);
        }
    }

    const flattenOptions = (data) => {
        // console.log('flattenOptions called with data:', data?.departments);

        let flattenedOptions = [];

        const send_data = data?.departments

        // Handle the actual API response structure
        if (send_data && Array.isArray(send_data)) {
            send_data?.forEach((dept) => {
                flattenedOptions.push({
                    label: dept.name,
                    value: dept.id,
                    isParent: true
                });
            });
        }

        // console.log('flattenedOptions result:', flattenedOptions);
        return flattenedOptions;
    };


    const navigate = useNavigate();



    // const navigate = useNavigate()

    const addEmpHandler = async () => {

        // Validation: Country must be selected
        if (!newEmpValues.country_code) {
            showToast('Please select a country', 'error');
            return;
        }

        // // Validation: Mobile number format for Pakistan
        // if (newEmpValues.country_code?.value === "162" && newEmpValues.network) {
        //     const mobileNumber = newEmpValues.mobile;
        //     const selectedNetwork = newEmpValues.network.value;

        //     // Pakistan mobile number validation patterns
        //     const networkPatterns = {
        //         'Mobilink-PK': /^(\+92|92|0)?3(0[0-4]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])[0-9]{7}$/,
        //         'Jazz': /^(\+92|92|0)?3(0[0-4]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])[0-9]{7}$/,
        //         'Telenor': /^(\+92|92|0)?3(0[0-4]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])[0-9]{7}$/,
        //         'Zong': /^(\+92|92|0)?3(0[0-4]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])[0-9]{7}$/
        //     };

        //     if (!networkPatterns[selectedNetwork]?.test(mobileNumber)) {
        //         showToast(`Mobile number does not match the selected network (${selectedNetwork}). Please enter a valid Pakistan mobile number.`, 'error');
        //         return;
        //     }
        // }

        // Validation: Date of birth must be at least 15 years old
        if (newEmpValues.dob) {
            const ageValidation = validateAge(newEmpValues.dob);

            // console.log('DOB Validation:', {
            //     dob: newEmpValues.dob,
            //     ageValidation: ageValidation
            // });

            if (!ageValidation.isValid) {
                showToast(ageValidation.message, 'error');
                return;
            }
        }

        const formData = {
            joining_date: convertToYMD(newEmpValues.joing_date),
            emp_id: String(newEmpValues.empID),
            salary_template: String(newEmpValues.salary_template.value),
            contract: newEmpValues.empStatus.label,
            wf_policy: String(newEmpValues.work_policy.value),
            reporting_manager: newEmpValues.reporting_manager ? String(newEmpValues.reporting_manager.value) : '0',
            designation: String(newEmpValues.designation.value),
            emp_deptt_radio_btn: String(newEmpValues.department.value),
            emp_branch: String(newEmpValues.branch.value),
            gender: newEmpValues.gender,
            password: newEmpValues.password,
            passport: newEmpValues.passport,
            dob: convertToYMD(newEmpValues.dob),
            network: newEmpValues.network ? String(newEmpValues.network.value) : '', // Pass empty string if network is null
            country: String(newEmpValues.country_code.value),
            father_name: newEmpValues.father_name,
            full_name: newEmpValues.full_name,
            email: newEmpValues.email,
            mobile: newEmpValues.mobile,
            one_id: newEmpValues.one_id || '',
            org_id: newEmpValues.org_id || '',
            mobile_no: newEmpValues.mobile || ''
        };

        // if(employee_exicute > 1){

        ///console.log('Error adding employee333:', employee_exicute)
        if (employee_exicute === 1) {
            ////showToast('Employee addition is already in progress. Please wait.', 'info');
            return;
        }
        employee_exicute = employee_exicute + 1;
        setIsAddingEmployee(true);
        // console.log('Error adding employee111:', employee_exicute)

        try {
            const response = await employeesApi.RegisterEmp(formData)
            const data = response.data;


            /////console.log("datatata   getttt", data.STATUS)
            if (data.STATUS === "SUCCESSFUL") {
                showToast('Employee added successfully', 'success');
                employee_exicute = 0;
                navigate('/employees/all_employess')
            } else {
                showToast('Sorry we are unable to process your request', 'error')


            }
        } catch (err) {
            showToast(err?.response?.data?.ERROR_DESCRIPTION);
            employee_exicute = 0;
            console.log('Error adding employee222:', employee_exicute)
        } finally {
            setIsAddingEmployee(false);
        }
        // console.log('register', response)

    }


    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            paddingLeft: state.data.isChild ? '20px' : '10px',
            fontSize: state.data.isChild ? '12px' : '14px',
            color: state.data.isChild ? '#495057' : '14px',
            // color: '#495057',
        }),
    };




    const [openMenuValue, setOpenMenuValue] = useState({});
    const toggleMenuValue = (index, isOpen) => {
        setOpenMenuValue((prevOpenMenu) => ({
            ...prevOpenMenu,
            [index]: isOpen
        }))
    }

    // Helper function to get employees with filters
    const getEmployeesWithFilters = async (newFilters, pageNumber = null) => {
        try {
            // Use newFilters as the primary source, fallback to current state
            // If pageNumber is provided, use it; otherwise use page from newFilters or default to 1
            const targetPage = pageNumber !== null ? pageNumber : (newFilters.page || 1);
            
            const currentFilters = {
                text: filterValues.searchEmployee,
                page: targetPage,
                ...newFilters // This will override any existing filters
            };

            // Remove empty filters
            Object.keys(currentFilters).forEach(key =>
                !currentFilters[key] && delete currentFilters[key]
            );

            /////console.log('API call with filters:', currentFilters);

            // Use centralized API call for initial load, direct API call for filters/pagination
            if (Object.keys(currentFilters).length === 0) {
                await centralizedGetEmployees(currentFilters);
            } else {
                const response = await employeesApi.getEmployeesWithFilters(currentFilters);
                const data = response.data;

                if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                    const newEmployees = data.DB_DATA.employees;
                    const pagination = data.DB_DATA.pagination;

                    // Update pagination state
                    setPaginationData({
                        currentPage: pagination.page,
                        totalPages: pagination.pages,
                        hasMore: pagination.page < pagination.pages
                    });

                    // Always replace employees (no more "load more" - use Next/Previous instead)
                    useStore.setState({ allEmployees: data.DB_DATA });
                } else {
                    // If error or no data, set employees to empty array
                    useStore.setState({
                        allEmployees: {
                            STATUS: data.STATUS,
                            ERROR_CODE: data.ERROR_CODE,
                            ERROR_FILTER: data.ERROR_FILTER,
                            ERROR_DESCRIPTION: data.ERROR_DESCRIPTION,
                            employees: []
                        }
                    });
                    setPaginationData({
                        currentPage: 1,
                        totalPages: 1,
                        hasMore: false
                    });
                }
            }
        } catch (err) {
            console.error(err);
            // Handle network/other errors by setting empty state
            useStore.setState({
                allEmployees: {
                    STATUS: "ERROR",
                    ERROR_DESCRIPTION: "Failed to fetch employees",
                    employees: []
                }
            });
            setPaginationData({
                currentPage: 1,
                totalPages: 1,
                hasMore: false
            });
        }
    };

    // Function to go to next page
    const goToNextPage = () => {
        if (paginationData.currentPage < paginationData.totalPages) {
            getEmployeesWithFilters({}, paginationData.currentPage + 1);
        }
    };

    // Function to go to previous page
    const goToPreviousPage = () => {
        if (paginationData.currentPage > 1) {
            getEmployeesWithFilters({}, paginationData.currentPage - 1);
        }
    };

    // Function to go to a specific page
    const goToPage = (pageNumber) => {
        const targetPage = parseInt(pageNumber);
        if (targetPage >= 1 && targetPage <= paginationData.totalPages) {
            getEmployeesWithFilters({}, targetPage);
        }
    };

    // Reset pagination when filters change
    const resetPagination = () => {
        setPaginationData({
            currentPage: 1,
            totalPages: 1,
            hasMore: false
        });
    };

    const handleBulkEmployeeSubmit = async (employees) => {
        try {
            // Validate all required fields
            for (let emp of employees) {
                const isPakistan = emp.country_code && emp.country_code.value === "162";
                const baseValidation = emp.mobile && emp.email && emp.full_name && emp.father_name &&
                    emp.country_code && emp.dob && emp.password &&
                    emp.passport && emp.gender && emp.branch && emp.department &&
                    emp.designation && emp.work_policy && emp.salary_template &&
                    emp.empStatus && emp.empID && emp.joining_date;

                // Only require network if Pakistan is selected
                const networkValidation = isPakistan ? emp.network : true;

                if (!baseValidation || !networkValidation) {
                    showToast('Please fill all required fields', 'error');
                    return;
                }

                // Age validation: Employee must be at least 15 years old
                if (emp.dob) {
                    const ageValidation = validateAge(emp.dob);

                    if (!ageValidation.isValid) {
                        showToast(`Employee ${emp.full_name}: ${ageValidation.message}`, 'error');
                        return;
                    }
                }
            }

            // Format data for API
            const formattedEmployees = employees.map(emp => {
                const isPakistan = emp.country_code && emp.country_code.value === "162";
                return {
                    mobile: emp.mobile,
                    email: emp.email,
                    full_name: emp.full_name,
                    father_name: emp.father_name,
                    country_code: emp.country_code.value,
                    network: isPakistan ? emp.network.value : '', // Pass empty string if not Pakistan
                    dob: formatingData(emp.dob),
                    password: emp.password,
                    passport: emp.passport,
                    gender: emp.gender,
                    branch: emp.branch.value,
                    department: emp.department.value,
                    designation: emp.designation.value,
                    work_policy: emp.work_policy.value,
                    salary_template: emp.salary_template.value,
                    empStatus: emp.empStatus.value,
                    empID: emp.empID,
                    joining_date: formatingData(emp.joining_date)
                };
            });

            // Call API to add bulk employees
            const response = await employeesApi.addBulkEmployees(formattedEmployees);

            if (response.STATUS === 'SUCCESS') {
                showToast('Employees added successfully', 'success');
                // Refresh employee list
                await getEmployeesWithFilters({});
                return true;
            } else {
                showToast(response.MESSAGE || 'Failed to add employees', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error adding bulk employees:', error);
            showToast('Failed to add employees', 'error');
            return false;
        }
    };

    const updateEmployee = async (employeeId, data) => {
        try {
            const response = await employeesApi.updateEmployee(employeeId, data);
            const responseData = response.data;
            console.log('Update Employee Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                showToast('HR Policy has been updated', 'success');
                return responseData;
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to update employee', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            showToast('Failed to update employee', 'error');
            return null;
        }
    };

    const addEmployeeContact = async (employeeId, data) => {
        try {
            const response = await employeesApi.addEmployeeContact(employeeId, data);
            const responseData = response.data;
            console.log('Add Employee Contact Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                showToast('Contact added successfully', 'success');
                return responseData;
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to add contact', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error adding contact:', error);
            showToast('Failed to add contact', 'error');
            return null;
        }
    };

    const deleteEmployeeContact = async (contactId, data) => {
        try {
            const response = await employeesApi.deleteEmployeeContact(contactId, data);
            const responseData = response.data;
            console.log('Delete Employee Contact Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                showToast('Contact deleted successfully', 'success');
                return responseData;
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to delete contact', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            showToast('Failed to delete contact', 'error');
            return null;
        }
    };

    const updateEmployeeProfile = async (data) => {
        try {
            const response = await employeesApi.updateEmployeeProfile(data);
            const responseData = response.data;
            console.log('Update Employee Profile Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                showToast('Employee profile updated successfully', 'success');
                return responseData;
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to update employee profile', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error updating employee profile:', error);
            showToast('Failed to update employee profile', 'error');
            return null;
        }
    };

    const updateAttendanceSettings = async (data) => {
        try {
            const response = await employeesApi.updateAttendanceSettings(data);
            const responseData = response.data;
            console.log('Update Attendance Settings Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                showToast('Attendance settings updated successfully', 'success');
                return responseData;
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to update attendance settings', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error updating attendance settings:', error);
            showToast('Failed to update attendance settings', 'error');
            return null;
        }
    };

    const assignEmployeePrivilege = async (data) => {
        try {
            const response = await employeesApi.assignEmployeePrivilege(data);
            const responseData = response.data;
            console.log('Assign Employee Privilege Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                showToast('Privilege assigned successfully', 'success');
                return responseData;
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to assign privilege', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error assigning employee privilege:', error);
            showToast('Failed to assign privilege', 'error');
            return null;
        }
    };

    const addEmployeeDuty = async (employeeId, data) => {
        try {
            const response = await employeesApi.addEmployeeDuty(employeeId, data);
            const responseData = response.data;
            console.log('Add Employee Duty Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                ////showToast('Duty assigned successfully', 'success');
                return responseData;
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to assign duty', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error adding employee duty:', error);
            showToast('Failed to assign duty', 'error');
            return null;
        }
    };

    const updateEmployeeDuty = async (dutyId, data) => {
        try {
            const response = await employeesApi.updateEmployeeDuty(dutyId, data);
            const responseData = response.data;
            console.log('EmployeeServices - Update Employee Duty Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData;
            } else {
                console.error('EmployeeServices - Failed to update duty:', responseData.ERROR_DESCRIPTION);
                return responseData; // Return the response so component can handle the error
            }
        } catch (error) {
            console.error('EmployeeServices - Error updating employee duty:', error);
            console.error('EmployeeServices - Error details:', error.response?.data);
            return null;
        }
    };

    const deleteEmployeeDuty = async (dutyId) => {
        try {
            const response = await employeesApi.deleteEmployeeDuty(dutyId);
            const responseData = response.data;
            console.log('Delete Employee Duty Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData;
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to delete duty', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error deleting employee duty:', error);
            showToast('Failed to delete duty', 'error');
            return null;
        }
    };

    const saveEmployeeAsset = async (employeeId, data) => {
        try {
            const response = await employeesApi.saveEmployeeAsset(data);
            const responseData = response.data;
            console.log('Save Employee Asset Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                showToast('Asset added successfully', 'success');
                return { success: true, data: responseData.DB_DATA };
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to add asset', 'error');
                return { success: false, error: responseData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error adding asset:', error);
            showToast('Failed to add asset', 'error');
            return { success: false, error: error.message };
        }
    };

    const deleteEmployeeAsset = async (assetId) => {
        try {
            const response = await employeesApi.deleteEmployeeAsset(assetId);
            const responseData = response.data;
            console.log('Delete Employee Asset Response:', responseData);

            if (responseData.STATUS === "SUCCESSFUL") {
                showToast(responseData.DB_DATA?.message || 'Asset deleted successfully', 'success');
                return { success: true, data: responseData.DB_DATA };
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to delete asset', 'error');
                return { success: false, error: responseData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
            showToast('Failed to delete asset', 'error');
            return { success: false, error: error.message };
        }
    };

    return {
        empTitles, getEmployeesList, allEmployees, empMount, handleEmpMount, allBranches, handleFilterChange, handleFilterDeptChange, filterValues, getAllDepartments, filterDepartments,
        listView, handleListToggle, handleGridToggle, handleChangeEmployees, empStatus, handleStatusFilter, handelAlphabetSearch, alphaIndex, newEmpValues, handleNewEmpChange, getFindEmp,
        handleVerifyUserModalClose, verfiyUser, findingEmp, handleStepActive, activeStep, isFirstStep, isLastStep, handlePrev, handleNext, handleLastStep, handleFirstStep, allCountries,
        handleSelectChange, handleDOB, passwordToggle, validateAge, empBranches, dept_subDept, flattenOptions, customStyles,
        designations, empManager, policies, salaryTemplate, addEmpHandler,
        openMenuValue, toggleMenuValue,
        gettingEmployeeCheckList,
        employeeCheckListData,
        getEmployeesWithFilters,
        handleBulkEmployeeSubmit,
        updateEmployee,
        updateEmployeeDuty,
        addEmployeeContact,
        deleteEmployeeContact,
        updateEmployeeProfile,
        updateAttendanceSettings,
        assignEmployeePrivilege,
        addEmployeeDuty,
        deleteEmployeeDuty,
        saveEmployeeAsset,
        deleteEmployeeAsset,
        paginationData,
        goToNextPage,
        goToPreviousPage,
        goToPage,
        gettingSubBranches,
        gettingPolicies,
        gettingSalayTemplate,
        gettingDesignation,
        createSalaryTemplateFromEmployee,
        fetchingAllBranches,
        setInitialStatus,
        fetchingAllEmployess,
        completedSteps,
        findEmployeeCompleted,
        // Drawer functions
        openDrawer,
        settingDrawerTitle,
        settingDrawerSize,
        settingComponent,
        get_inactive_empfn,
        get_inactive_emp_data,
        deactive_employeefn,
        deactive_employee,
        Get_All_Employeefn,
        Get_All_Employee,
        Active_employeefn,


        getHeaderDatafn, getHeaderData,

        // Signature functions
        signatures,
        isLoadingSignatures,
        getSignatures,
        addSignature,
        deleteSignature,

        // Digital Signature functions
        digitalSignature,
        isLoadingDigitalSignature,
        getDigitalSignature,
        addDigitalSignature,

        // Birthday Template functions
        birthdayTemplate,
        isLoadingBirthdayTemplate,
        isSavingBirthdayTemplate,
        getBirthdayTemplate,
        updateBirthdayTemplate,

        // Mobile Attendance functions
        mobileAttendanceConfig,
        isLoadingMobileAttendance,
        isTogglingMobileAttendance,
        isTogglingLocationLog,
        getMobileAttendanceConfig,
        toggleMobileAttendance,
        toggleMobileAttendanceLocationLog,

        // Retirement and Probation functions
        retirementData,
        isLoadingRetirementData,
        isSavingRetirementData,
        getRetirementData,
        setRetirementData,
        // Reporting Email functions
        reportingEmails,
        isLoadingReportingEmails,
        isSavingReportingEmail,
        getReportingEmails,
        sendReportingEmail,
        // Profile Update Invite function
        sendProfileUpdateInvite,
        // Logo functions
        orgLogo,
        isLoadingLogo,
        getOrgLogo,
        updateOrgLogo,
        // Logout function
        logout,
        employee_exicute,
        get_bank_type_fn,
        get_bank_type,
        hrPolicyDropdown,
        get_all_department,
        // Loading states
        loading,
        isAddingEmployee,
        isCreatingSalaryTemplate

    }

}

export default useEmployees