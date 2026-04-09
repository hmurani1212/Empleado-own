import { FaBuilding, FaCalendarAlt, FaHotel, FaUserCheck, FaUserTie, FaUsers } from 'react-icons/fa'
import { CiClock2 } from "react-icons/ci";
import { MdBlock } from "react-icons/md";
import useStore from '../../Store/store'
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import dashboardApi from '../../Model/Data/Dashboard/Dashboard';
import EmpProfile from '../../View/Dashoboard/EmpProfile';
import employeesApi from '../../Model/Data/Employees/Employees';
import { showToast } from '../../Components/Toaster/Toaster';
import { validateInput, validateInputNumber } from "../../Validation/CustomValidation";
import { getUserData } from '../../Authentication/jwt_decode';
import { IoTime } from "react-icons/io5";
import axios from 'axios';

// React Query cache for admin dashboard – 5 minutes to avoid repeated API calls
const ADMIN_DASHBOARD_QUERY_KEY = 'admin_dashboard';
const ADMIN_DASHBOARD_CACHE_MS = 5 * 60 * 1000;

const useDashboard = () => {

    const queryClient = useQueryClient();
    const dashboardDataFunc = useStore((state) => state.dashboardDataFunc)
    const dashboardData = useStore((state) => state.dashboardData)

    // Role-based dashboard data from store
    const roleBasedData = useStore((state) => state.roleBasedData)
    const userRole = useStore((state) => state.userRole)
    const loading = useStore((state) => state.loading)
    const fetchRoleBasedData = useStore((state) => state.fetchRoleBasedData)

    // Admin Dashboard API from store (state only; fetch is cached below)
    const adminDashboardData = useStore((state) => state.adminDashboardData)
    const adminDashboardLoading = useStore((state) => state.adminDashboardLoading)
    const selectedDate = useStore((state) => state.selectedDate)

    // Late Comers API from store
    const lateComersData = useStore((state) => state.lateComersData)
    const lateComersLoading = useStore((state) => state.lateComersLoading)
    const getLateComersData = useStore((state) => state.getLateComersData)

    // Today's Attendance API from store
    const todayAttendanceData = useStore((state) => state.todayAttendanceData)
    const todayAttendanceLoading = useStore((state) => state.todayAttendanceLoading)
    const getTodayAttendanceData = useStore((state) => state.getTodayAttendanceData)

    // Cached admin dashboard fetch – 5 min React Query cache so API is not called repeatedly
    const getAdminDashboardData = useCallback(async (date = null) => {
        useStore.setState({ adminDashboardLoading: true });
        const dateToUse = date || new Date().toISOString().split('T')[0];
        try {
            const data = await queryClient.fetchQuery({
                queryKey: [ADMIN_DASHBOARD_QUERY_KEY, dateToUse],
                queryFn: async () => {
                    const res = await dashboardApi.getAdminDashboardData({ date: dateToUse });
                    const d = res.data;
                    if (d.STATUS === 'SUCCESS') return d;
                    throw new Error(d.ERROR_DESCRIPTION || 'Failed to load dashboard');
                },
                staleTime: ADMIN_DASHBOARD_CACHE_MS,
                gcTime: ADMIN_DASHBOARD_CACHE_MS,
            });
            useStore.setState({
                adminDashboardData: data.DB_DATA,
                selectedDate: date ?? null,
                adminDashboardLoading: false,
            });
            return data.DB_DATA;
        } catch (err) {
            console.log('Error fetching admin dashboard data:', err);
            useStore.setState({ adminDashboardLoading: false });
            return null;
        }
    }, [queryClient]);

    const applyDateFilter = useCallback(async (date) => {
        return await getAdminDashboardData(date);
    }, [getAdminDashboardData]);

    const sideMenuToggleState = useStore((state) => state.sideMenuToggleState)
    const newStaticDataHandle = useStore((state) => state.newStaticDataHandle)
    const gettingDashboardCountData = useStore((state) => state.gettingDashboardCountData)
    const dashCountData = useStore((state) => state.dashboardCountData)
    const filterEmployees = useStore((state) => state.filterEmployees)


    const openDrawer = useStore((state) => state.openDrawer)
    const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
    const settingComponent = useStore((state) => state.settingComponent)
    const settingDrawerSize = useStore((state) => state.settingDrawerSize)
    // const closeDrawer = useStore ((state) => state.closeDrawer)
    const gettingCountries = useStore((state) => state.gettingCountries)
    const allCountries = useStore((state) => state.allCountries)



    const addNewEmpContact = useStore((state) => state.addNewEmpContact)
    const updateEmpPersonalInfo = useStore((state) => state.updateEmpPersonalInfo)
    const updateEmpCheckList = useStore((state) => state.updateEmpCheckList)



    const gettingAcademics = useStore((state) => state.gettingAcademics)
    const academics = useStore((state) => state.academics)


    const gettingExperience = useStore((state) => state.gettingExperience)
    const depandants = useStore((state) => state.depandantsData)



    const gettingDependant = useStore((state) => state.gettingDependant)
    const experiencesData = useStore((state) => state.experiencesData)



    const gettingLicenses = useStore((state) => state.gettingLicenses)
    const licensesData = useStore((state) => state.licensesData)



    const gettingRefrences = useStore((state) => state.gettingRefrences)
    const refrenceData = useStore((state) => state.refrenceData)




    const gettingDocuments = useStore((state) => state.gettingDocuments)
    const documentsData = useStore((state) => state.documentsData)


    const gettingEmpExtraDuties = useStore((state) => state.gettingEmpExtraDuties)
    const empExtraData = useStore((state) => state.empExtraData)

    const getAllAccelerate = useStore((state) => state.gettingEmpAccelerate)
    const accelerateData = useStore((state) => state.accelerateData)



    const dashboardCustomData = [
        { id: 1, title: 'Total Employees', count: adminDashboardData?.TOTAL_EMPLOYEES ?? dashboardData?.EMPLOYEE_COUNT ?? 0, bgColor: '#0ACF97', icon: <FaUserTie /> },
        { id: 2, title: 'Total Departments & Sub Departments', count: adminDashboardData?.TOTAL_DEPARTMENTS ?? dashboardData?.DEPARTMENT_COUNT ?? 0, bgColor: '#3DA5F4', icon: <FaBuilding /> },
        { id: 3, title: 'Total Designations', count: adminDashboardData?.TOTAL_DESIGNATIONS ?? dashboardData?.DESIGNATION_COUNT ?? 0, bgColor: '#FF4979', icon: <FaUsers /> },
        { id: 4, title: 'Total Branches', count: adminDashboardData?.TOTAL_BRANCHES ?? dashboardData?.BRANCHES_COUNT ?? 0, bgColor: '#FDA006', icon: <FaHotel /> }
    ]


    const dashboardCountData = [
        { id: 1, title: "Today's Attendence", percentCount: adminDashboardData?.today_attendence ?? dashboardData?.PRESENT_PERCENT ?? 0, count: adminDashboardData?.today_attendence ?? dashboardData?.PRESENT_EMPS ?? 0, bgColor: '#0ACF97', progressMainColor: '#95e4ce', icon: <FaUserCheck />, op_code: 'today_present', status: true, export: true, sendSms: false, },
        { id: 2, title: "Today's Late Comers", percentCount: adminDashboardData?.today_late_commers ?? dashboardData?.LATE_COMERS_PERCENT ?? 0, count: adminDashboardData?.today_late_commers ?? dashboardData?.LATE_EMPS ?? 0, bgColor: '#3DA5F4', progressMainColor: '#97cef8', icon: <IoTime />, op_code: 'today_late_comers', status: false, export: false, sendSms: true },
        { id: 3, title: "Late Comers Last 7 days", percentCount: adminDashboardData?.let_commers_seven_days ?? dashboardData?.LAST_7LATE_PERCENT ?? 0, count: adminDashboardData?.let_commers_seven_days ?? dashboardData?.LAST_7LATE_EMPS ?? 0, bgColor: '#FF4979', progressMainColor: '#ff97b2', icon: <FaCalendarAlt />, op_code: 'weekly_late_comers', status: false, export: true, sendSms: true },
        { id: 4, title: "Employees Limit", percentCount: 100, count: adminDashboardData?.ALLOWED_EMPLOYEES ?? dashboardData?.LISCENCES?.DB_DATA?.SUBSCRIP_QTY ?? 0, bgColor: '#FDA006', progressMainColor: '#fdcc7b', icon: <MdBlock /> }
    ]


    const totalEmployeesForChart = adminDashboardData?.TOTAL_EMPLOYEES ?? dashboardData?.EMPLOYEE_COUNT ?? 0

    const lateOffTable =
        adminDashboardData?.LAST_7_DAYS_LATE_OFF ||
        dashboardData?.LAST_7_DAYS_LATE_OFFS ||
        []

    const headerRow = Array.isArray(lateOffTable?.[0]) ? lateOffTable[0] : []
    const lateOffRows = Array.isArray(lateOffTable) ? lateOffTable.slice(1) : []

    const empLate_absent_labels = lateOffRows.map((item) => item?.[0])

    // Mapping based on header row (most reliable):
    // ["Date", "Late Comers", "Absent Employees"] => col2 is absent
    const col2Header = String(headerRow?.[2] ?? '').toLowerCase()
    const col2IsAbsent = col2Header.includes('absent')
    const col2IsPresent = col2Header.includes('present')

    const lateComersChartData = lateOffRows.map((item) => {
        const n = Number(item?.[1] ?? 0)
        return Number.isFinite(n) ? n : 0
    })
    const col2Series = lateOffRows.map((item) => {
        const n = Number(item?.[2] ?? 0)
        return Number.isFinite(n) ? n : 0
    })

    const total = Number(totalEmployeesForChart ?? 0)

    const presentEmployeesChartData = col2IsPresent
        ? col2Series.map((v) => Math.max(v, 0))
        : col2IsAbsent
            ? col2Series.map((absent) => Math.max(total - absent, 0))
            : col2Series.map((v) => Math.max(v, 0))

    const absentEmployeesData = col2IsAbsent
        ? col2Series.map((absent) => Math.max(absent, 0))
        : col2IsPresent
            ? col2Series.map((present) => Math.max(total - present, 0))
            : col2Series.map(() => 0)

    const lateComersCumulativeChartData = (() => {
        let running = 0
        return lateComersChartData.map((v) => {
            running += Number(v ?? 0)
            return running
        })
    })()

    const empCheckListData = dashboardData.EMPLOYEES_CHECKLIST
    const upcommingBirthdays = adminDashboardData?.UPCOMING_BIRTHDAYS ?? dashboardData?.UPCOMING_BIRTHDAY ?? []
    // console.log('upcommingBirthdays', upcommingBirthdays)



    const pendingCheckListHeaders = ['Employee Name', 'Emp ID', 'View Profile']
    // const pendingCheckList = [
    //     {id:1, empName: 'Ashiq Khan', empID: 113},
    //     {id:2, empName: 'Sulaiman Khan', empID: 122},
    //     {id:3, empName: 'Majid Khan', empID: 124},
    //     {id:4, empName: 'Zawar Khan', empID: 143},
    // ]
    const meet_greetHeaders = ['Employee Name', 'Employee ID', 'Action']
    const upcommingHolidaysHeaders = ['Branch', 'From', 'To', 'Description']
    const mett_greetList = [
        { id: 1, empName: 'Ashiq Khan', email: 'text@gmail.com' },
        { id: 2, empName: 'Sulaiman Khan', email: 'text@gmail.com' },
        { id: 3, empName: 'Majid Khan', email: 'text@gmail.com' },
        { id: 4, empName: 'Zawar Khan', email: 'text@gmail.com' },
    ]

    // const upcommingBirthdays = [
    //     {id: 1, name: 'Adnan Khan', birthdayData: 'Oct 25, 2020'},
    //     {id: 2, name: 'Badar Jadon', birthdayData: 'Oct 25, 2020'},
    //     {id: 3, name: 'Zawar Khan', birthdayData: 'Oct 25, 2020'},

    // ]
    const upcommingHolidays = adminDashboardData?.UPCOMING_HOLIDAYS ?? dashboardData?.HOLIDAY_CALENDER ?? []


    // Monthly turnaround data from admin dashboard - provide default empty data
    const monthlyTurnaroundData = adminDashboardData?.MONTHLY_TURNAROUND_DATA || []

    // Prepare data for Employees Turnaround chart - always provide data structure
    const turnaroundChartData = {
        labels: monthlyTurnaroundData.length > 0 ? monthlyTurnaroundData.map(item => item.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Joined',
                data: monthlyTurnaroundData.length > 0 ? monthlyTurnaroundData.map(item => item.joined) : new Array(12).fill(0),
                backgroundColor: '#0ACF97',
                borderColor: '#0ACF97',
                borderWidth: 1,
            },
            {
                label: 'Left',
                data: monthlyTurnaroundData.length > 0 ? monthlyTurnaroundData.map(item => item.left) : new Array(12).fill(0),
                backgroundColor: '#FF4979',
                borderColor: '#FF4979',
                borderWidth: 1,
            }
        ]
    }

    const turnaroundChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 5,
                    callback: function (value) {
                        return value;
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            }
        }
    }

    // Gender-wise employee data for pie chart
    const maleEmployees = adminDashboardData?.MALE_EMPLOYEES ?? 0;
    const femaleEmployees = adminDashboardData?.FEMALE_EMPLOYEES ?? 0;
    const totalGenderEmployees = maleEmployees + femaleEmployees;

    const malePercentage = totalGenderEmployees > 0 ? ((maleEmployees / totalGenderEmployees) * 100).toFixed(1) : 0;
    const femalePercentage = totalGenderEmployees > 0 ? ((femaleEmployees / totalGenderEmployees) * 100).toFixed(1) : 0;

    const genderRatioData = {
        labels: ['Male Employees', 'Female Employees'],
        datasets: [
            {
                data: [malePercentage, femalePercentage],
                backgroundColor: ['#3DA5F4', '#FF4979'], // Blue for Male, Pink for Female
                hoverBackgroundColor: ['#2a8cdb', '#e63a6a'],
                borderWidth: 0,
            },
        ],
    };

    const genderRatioOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 20,
                    generateLabels: function (chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const dataset = data.datasets[0];
                                const value = dataset.data[i];
                                return {
                                    text: `${label}: ${value}%`,
                                    fillStyle: dataset.backgroundColor[i],
                                    strokeStyle: dataset.borderColor,
                                    lineWidth: dataset.borderWidth,
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed + '%';
                        }
                        return label;
                    }
                }
            }
        },
    };

    // Old employees data for Meet and Greet
    const oldEmployeesData = adminDashboardData?.OLD_EMPLOYEES ?? []




    const [showDrawer, setShowDrawer] = useState(false)
    const [dashboardValues, setDashboardValues] = useState({
        title: '',
        data: [],
        status: true,
        date: '',
        export: true,
        sendSms: true,
        serachEmployee: ''
    })

    const getdashboardCountData = async (operationCode) => {
        setDashboardValues((prevState) => ({
            ...prevState,
            title: operationCode.title,
            status: operationCode.status,
            export: operationCode.export,
            sendSms: operationCode.sendSms,
        }))


        const data = {
            date: dashboardValues.date
        }
        gettingDashboardCountData(operationCode.op_code, data)
        setShowDrawer(true)


    }

    const closeDashBoradDrawer = () => {
        setShowDrawer(false)
    }

    const handleDashboardValueChange = (e) => {
        const { name, value } = e.target
        setDashboardValues((prevState) => ({
            ...prevState,
            [name]: value
        }))


        if (name === 'date') {


            // console.log('values', value)
            getDateAccordingDbAccountData(value)
        }
    }
    const handleChange = (e) => {
        const { name, value } = e.target
        setDashboardValues((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    useEffect(() => {

        filterEmployees(dashboardValues.serachEmployee);
    }, [dashboardValues.serachEmployee]);


    const getDateAccordingDbAccountData = async (newDate) => {


        const data = {
            date: newDate
        }
        try {
            const response = await dashboardApi.getDashboardStatisticApi(data)
            const resData = response.data
            if (response.status === 200 && resData.STATUS === 'SUCCESSFUL') {
                newStaticDataHandle(resData.DB_DATA)
            }


        } catch (err) {
            // Error handling for dashboard count data
        }

    }


    const [empView, setEmpView] = useState({
        state: 1,
        section: { id: 1, title: 'Personal Info' },

    })

    const settingEmpData = useStore((state) => state.settingEmpData)
    const empData = useStore((state) => state.empData)


    const handleViewEmp = async (data) => {
        gettingCountries()
        const apiData = { emp_id: data.emp_id }
        try {

            const response = await dashboardApi.viewEmp(apiData)
            const responseData = response.data
            // console.log('responseData', responseData)
            settingEmpData(responseData)
            openDrawer()
            settingDrawerSize(1300)
            settingDrawerTitle('Employee Profile')
            settingComponent(
                <EmpProfile
                    empId={data.id}
                />
            )



        } catch (error) {

        }
    }


    const settingEmpView = (data) => {

        const id = data.id
        switch (id) {
            case 1:
                gettingCountries()
                break;
            case 5:
                gettingAcademics(data.empId)
                gettingExperience(data.empId)
                gettingDependant(data.empId)
                gettingLicenses(data.empId)
                gettingRefrences(data.empId)
                gettingDocuments(data.empId)
                break;

            case 7:
                gettingEmpCheckList(data.empId)
                break;
            case 9:
                gettingEmpExtraDuties(data.empId)
                break;
            case 10:
                getAllAccelerate(data.empId)
                break;

            default:
                break;
        }

        setEmpView((prevState) => ({
            ...prevState,
            state: data.id,
            section: data,
        }))

    }


    const [checkListData, setCheckListData] = useState([])
    // const [empExtraData, setEmpExtraData] = useState([])

    const gettingEmpCheckList = async (id) => {
        const apiData = { empId: id }
        try {
            const response = await employeesApi.getChecklist(apiData)
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                setCheckListData(data.DB_DATA)
            } else {
                setCheckListData([])
            }
        } catch (err) {

        }
    }







    const [empDocuments, setEmpDocuments] = useState({
        academic: [],
        experience: [],
        dependants: [],
        licenses: [],
        refrences: [],
        documents: [],
    })



    // const gettingDocuments = async(id)=>{
    //     const apiData = {emp_id: id}
    //     try{
    //         const response = await employeesApi.getEmpDocuments(apiData)
    //         // console.log('response', response)
    //         const data = response.data 
    //         if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
    //             // setCheckListData(data.DB_DATA)
    //             setEmpDocuments((prevState)=>({
    //                 ...prevState,
    //                 documents:data.DB_DATA
    //             }))
    //         }else{
    //             //  setCheckListData([])
    //         }
    //     }catch(err){

    //     }

    // }



    const selectType = [
        { id: 2, name: 'Datewise' },
        { id: 3, name: 'Monthly' },
    ]


    const [accelerateValue, setAccelerateValue] = useState({
        reportType: null
    })


    const handleSelectChange = (selected, field) => {
        setAccelerateValue((prevState) => ({
            ...prevState,
            [field]: selected
        }))

    }
    const [meetAndGreetData, setMeetAndGreetData] = useState([])

    const sendMeetGreetEmail = async (employeeId, oneId) => {
        try {
            const response = await dashboardApi.getGreetingMessage(employeeId, oneId)
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                return { success: true, message: data.MESSAGE || 'Email sent successfully' }
            } else {
                return {
                    success: false,
                    message: data.ERROR_DESCRIPTION || data.MESSAGE || 'Failed to send email'
                }
            }
        } catch (error) {

            // Handle API error responses
            const errorData = error?.response?.data
            if (errorData) {
                return {
                    success: false,
                    message: errorData.ERROR_DESCRIPTION || errorData.MESSAGE || 'Failed to send email'
                }
            }
            // Handle other errors
            return {
                success: false,
                message: error.message || 'An error occurred while sending email. Please try again.'
            }
        }
    }

    const getGreetingMessage = async () => {
        try {
            const response = await dashboardApi.getGreetingMessage()
            console.log('response', response)
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                setMeetAndGreetData(data.DB_DATA)
                if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                    setMeetAndGreetData(data.DB_DATA)
                } else {
                    setMeetAndGreetData([])
                }
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    /* Start Editing emp Profile */

    const [empPersonalInfoValue, setEmpPersonalInfo] = useState({
        show: false,
        dob: '',
        f_name: '',
        gender: null,
        country: null,
        nationality: [],
        city: '',
        domicile: '',
        religion: '',
        martial_status: '',
        blood_group: null,
        blood_groups: [],
        passport_no: '',
        ntn_no: '',
        disability: '',
        name: ''
    })

    const convertDateToYYYYMMDD = (date) => {
        const [month, day, year] = date.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }


    const handleEmpProfileEdit = async (id) => {

        const apiData = { emp_id: id }

        try {

            const response = await employeesApi.getEmpPersonalInfo(apiData)
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                const dbData = data.DB_DATA
                setEmpPersonalInfo((prevState) => ({
                    ...prevState,
                    show: true,
                    name: dbData.name,
                    dob: convertDateToYYYYMMDD(dbData.dob),
                    f_name: dbData.f_name,
                    gender: dbData.gender,
                    country: dbData.country,
                    nationality: data.nationality,
                    blood_groups: data.blood_groups,
                    city: dbData.city,
                    domicile: dbData.domicile,
                    religion: dbData.religion,
                    martial_status: dbData.martial_status,
                    blood_group: dbData.blood_group,
                    passport_no: dbData.passport_no,
                    ntn_no: dbData.ntn_no,
                    disability: dbData.disability,

                }))
            }

        } catch (err) {
            // Error handling for employee personal info

        }
    }
    const handleCloseEditEmpInfo = () => {
        setEmpPersonalInfo((prevState) => ({
            ...prevState,
            show: false,

        }))
    }

    const handleSelectEditChange = (selected, field) => {
        setEmpPersonalInfo((prevState) => ({
            ...prevState,
            [field]: selected,

        }))
    }

    const handleEmpProfileChange = (e) => {
        const { name, value } = e.target
        setEmpPersonalInfo((prevState) => ({
            ...prevState,
            [name]: value
        }))

    }


    const validateEmpInfo = () => {
        const { name, dob, f_name, city, domicile, religion, passport_no } = empPersonalInfoValue;
        const nameValidation = validateInput('Employee Name', name);

        if (!nameValidation.isValid) {
            return { isValid: false, message: nameValidation.message };
        }
        if (dob === '') {
            return { isValid: false, message: "Select Date of Birth" };
        }
        const f_nameValidation = validateInput('Father Name', f_name);
        if (!f_nameValidation.isValid) {
            return { isValid: false, message: f_nameValidation.message };
        }
        const cityValidation = validateInput('City', city);
        if (!cityValidation.isValid) {
            return { isValid: false, message: cityValidation.message };
        }
        const domicileValidation = validateInput('Domicile', domicile);
        if (!domicileValidation.isValid) {
            return { isValid: false, message: domicileValidation.message };
        }
        const religionValidation = validateInput('Religion', religion);
        if (!religionValidation.isValid) {
            return { isValid: false, message: religionValidation.message };
        }
        const passport_noValidation = validateInputNumber('Passport/NIC Number', passport_no);
        if (!passport_noValidation.isValid) {
            return { isValid: false, message: passport_noValidation.message };
        }

        return { isValid: true, message: '' }
    }




    const getValue = (val) => (typeof val === 'object' && val !== null ? val.value.toString() : val);

    const handleUpdateEmpProfile = async (id) => {
        const validation = validateEmpInfo();
        if (!validation.isValid) {
            showToast(validation.message, 'error'); // Display the validation message to the user
            return;
        }
        const data = {
            emp_id: id,
            ntn: empPersonalInfoValue.ntn_no,
            city: empPersonalInfoValue.city,
            nationality: getValue(empPersonalInfoValue.country),
            domicile: empPersonalInfoValue.domicile,
            nic: empPersonalInfoValue.passport_no,
            marital_status: getValue(empPersonalInfoValue.martial_status),
            disability: empPersonalInfoValue.disability,
            religion: empPersonalInfoValue.religion,
            blood_group: getValue(empPersonalInfoValue.blood_group),
            dob: empPersonalInfoValue.dob,
            gender: getValue(empPersonalInfoValue.gender),
            fname: empPersonalInfoValue.f_name,
            name: empPersonalInfoValue.name,

        }


        try {
            const response = await employeesApi.updateEmployeePersonalInfo(data)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                updateEmpPersonalInfo(data)
                updateEmpCheckList(data)
                setEmpPersonalInfo((prevState) => ({
                    ...prevState,
                    show: false
                }))
                showToast('Personal Info Updated Successfully', 'success')
            } else {
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }
        } catch (err) {
            // Error handling for update employee personal info
        }

    }

    /* End Editing emp Profile */


    /* Start of editing contact numbers*/

    const [contactEditValue, setContactEditValue] = useState({
        showEdit: [],
        contact_type: {},
        contact_title: {},
        contact: {},
        country_id: {},
        mobile_network: {},

    })


    const handleContactEdit = (data) => {
        // console.log('data', data)

        // setContactEditValue((prevState)=>({
        //     showEdit: prevState.showEdit.includes(index)
        //         ? prevState.showEdit.filter(i => i !== index)
        //         : [...prevState.showEdit, index],
        //     contact_type: {
        //         ...prevState.contact_type,
        //         [index]: data.contact_type
        //     },
        //     country_id: {
        //         ...prevState.country_id,
        //         [index]: data.country_id
        //     },
        //     contact_title: {
        //         ...prevState.contact_title,
        //         [index]: data.contact_title
        //     },
        //     contact: {
        //         ...prevState.contact,
        //         [index]: data.contact
        //     },
        //     mobile_network: {
        //         ...prevState.mobile_network,
        //         [index]: data.mobile_network
        //     }
        // }))
    }
    const handleCloseEditPhone = (index) => {

        setContactEditValue((prevState) => ({
            ...prevState,
            showEdit: prevState.showEdit.filter(i => i !== index)
        }));
    };

    const handleSelectContactChange = (selectedOption, field, index) => {
        setContactEditValue((prevState) => ({
            ...prevState,
            [field]: {
                ...prevState[field],
                [index]: selectedOption
            }
        }));
    }


    const handleContactInputChange = (e, index) => {
        const { name, value } = e.target;
        let updatedValue = value;
        let networkName = '';
        if (name === 'contact') {
            if (value.startsWith('+923')) {
                updatedValue = value.replace('+923', '03');
                if (updatedValue.startsWith('031')) {
                    networkName = { value: 'Zong', label: 'Zong' }
                } else if (updatedValue.startsWith('030')) {
                    networkName = { value: 'Mobilink', label: 'Mobilink' }
                } else if (updatedValue.startsWith('032')) {
                    networkName = { value: 'Warid', label: 'Warid' }
                } else if (updatedValue.startsWith('033')) {
                    networkName = { value: 'Ufone', label: 'Ufone' }
                } else if (updatedValue.startsWith('034')) {
                    networkName = { value: 'Telenor', label: 'Telenor' }
                } else {
                    networkName = { value: 'Network', label: 'Network' }
                }

            }
            setContactEditValue(prevState => ({
                ...prevState,
                [name]: {
                    ...prevState[name],
                    [index]: value
                },
                mobile_network: {
                    ...prevState.mobile_network,
                    [index]: networkName
                }
            }));
        } else {

            setContactEditValue(prevState => ({
                ...prevState,
                [name]: {
                    ...prevState[name],
                    [index]: value
                }
            }));
        }

    }

    const [newContactValue, setNewContactValue] = useState({
        show: false,
        contact_type: { value: 'mobile', label: 'Mobile Number' },
        contact_title: '',
        mobile_no: '',
        country_code: null,
        network: null,
        email: '',
        address: ''
    })

    const handleAddNewContact = () => {
        setNewContactValue((prevState) => ({
            ...prevState,
            show: !prevState.show
        }))
    }


    const handleSelectAddContactChange = (selected, field) => {
        setNewContactValue((prevState) => ({
            ...prevState,
            [field]: selected
        }))
    }


    const handleNewContactChange = (e) => {
        const { name, value } = e.target
        setNewContactValue((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSubmitNewContact = async () => {

        const id = empData?.employees?.DB_DATA?.DATA[0].data.id

        const mobileData = {
            emp_id: id,
            network: newContactValue.network.value,
            county_code: `+${newContactValue.country_code.value}`,
            contact: newContactValue.mobile_no,
            contact_title: newContactValue.contact_title,
            contact_type: newContactValue.contact_type.value,


        }

        const phoneData = {
            emp_id: id,
            county_code: `+${newContactValue.country_code.value}`,
            contact: newContactValue.mobile_no,
            contact_title: newContactValue.contact_title,
            contact_type: newContactValue.contact_type.value,
        }

        const emailData = {
            emp_id: id,
            contact: newContactValue.email,
            contact_title: newContactValue.contact_title,
            contact_type: newContactValue.contact_type.value,
        }

        const addressData = {
            emp_id: id,
            contact: newContactValue.address,
            contact_title: newContactValue.contact_title,
            contact_type: newContactValue.contact_type.value,
        }

        const data = newContactValue.contact_type.value === 'mobile' ? mobileData :
            newContactValue.contact_type.value === 'phone' ? phoneData :
                newContactValue.contact_type.value === 'email' ? emailData : addressData



        try {
            const response = await employeesApi.addContact(data)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                showToast('Contact Addedd Successfully', 'success')
                addNewEmpContact(responseData.INSERTED_DATA)
                setNewContactValue((prevState) => ({
                    ...prevState,
                    show: false
                }))
            } else {
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }
        } catch (err) {

        }

    }



    /* End of editing contact numbers*/


    return {
        dashboardDataFunc,
        dashboardData,
        dashboardCustomData,
        sideMenuToggleState,
        dashboardCountData,
        empLate_absent_labels,
        lateComersChartData,
        lateComersCumulativeChartData,
        absentEmployeesData,
        presentEmployeesChartData,
        pendingCheckListHeaders,
        mett_greetList,
        meet_greetHeaders,
        upcommingBirthdays,
        upcommingHolidays,
        getdashboardCountData, showDrawer, closeDashBoradDrawer, meetAndGreetData, dashboardValues, handleDashboardValueChange, handleChange, dashCountData, empCheckListData,
        handleViewEmp, settingEmpView, empView, checkListData, empDocuments, empExtraData, selectType, accelerateValue, handleSelectChange,
        handleEmpProfileEdit, empPersonalInfoValue, handleCloseEditEmpInfo, handleSelectEditChange,
        allCountries,
        handleContactEdit,
        contactEditValue,
        handleCloseEditPhone,
        handleSelectContactChange,
        handleContactInputChange,
        handleAddNewContact,
        newContactValue,
        handleSelectAddContactChange,
        handleSubmitNewContact,
        handleNewContactChange,
        empData,
        handleEmpProfileChange,
        handleUpdateEmpProfile,
        academics,
        experiencesData,
        depandants,
        licensesData,
        refrenceData,
        documentsData,
        accelerateData,
        getAllAccelerate,
        sendMeetGreetEmail,
        // Role-based dashboard data
        roleBasedData,
        userRole,
        loading,
        fetchRoleBasedData,
        // Admin Dashboard API
        adminDashboardData,
        adminDashboardLoading,
        getAdminDashboardData,
        selectedDate,
        applyDateFilter,
        monthlyTurnaroundData,
        turnaroundChartData,
        turnaroundChartOptions,
        genderRatioData,
        genderRatioOptions,
        oldEmployeesData,
        // Late Comers API
        lateComersData,
        lateComersLoading,
        getLateComersData,
        // Today's Attendance API
        todayAttendanceData,
        todayAttendanceLoading,
        getTodayAttendanceData,
        upcommingHolidaysHeaders
    }
}

export default useDashboard