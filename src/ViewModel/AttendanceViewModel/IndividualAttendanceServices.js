import { useEffect, useState } from "react";
import { useDebounce } from "../../services/__debounceServices";
import attendanceApi from "../../Model/Data/Attendance/Attendance";
import { showToast } from "../../Components/Toaster/Toaster";
import { getAllMonths } from "../../services/__appServicesData";
import { attendanceColorData } from "../../services/__attendanceServices";
import useSingleAttendanceService from "./singleDayAttendanceService";
import { gettingValue } from "../../services/__gettingValue";
import { useLocation, useNavigate } from "react-router"
import useStore from "../../Store/store";
import { formatAttendanceData } from "../../services/__attendanceDataFormatter";
import { getUserData } from "../../Authentication/jwt_decode";
import { isFullAdmin } from "../../Authentication/roleHelpers";

const parseDdMmYyyyToTime = (dateString) => {
    const parts = String(dateString || "").split("-").map(Number);
    if (parts.length !== 3) return 0;
    const [d, m, y] = parts;
    if (!y || !m || !d) return 0;
    const t = new Date(y, m - 1, d).getTime();
    return Number.isNaN(t) ? 0 : t;
};

/**
 * Build chart matrix for MonthlyWorkingHoursChart from
 * `/api/attendance/individual-attendance` DB_DATA (attendance[] + optional late_coming_days).
 */
const buildChartMatrixFromIndividualAttendanceDb = (db) => {
    const header = ["Date", "Working Hours", "Late Minutes", "Overtime (hrs)", "Early Leave (min)"];
    if (!db || !Array.isArray(db.attendance) || db.attendance.length === 0) {
        return [header];
    }

    const lateByDate = new Map();
    (Array.isArray(db.late_coming_days) ? db.late_coming_days : []).forEach((row) => {
        const key = String(row?.date ?? "").trim();
        if (!key) return;
        const lm = Number(row?.late_minutes);
        lateByDate.set(key, Number.isFinite(lm) ? lm : 0);
    });

    const earlyByDate = new Map();
    (Array.isArray(db.early_leave_summary?.days) ? db.early_leave_summary.days : []).forEach((row) => {
        const key = String(row?.date ?? "").trim();
        if (!key) return;
        const m = Number(row?.early_leave_minutes);
        earlyByDate.set(key, Number.isFinite(m) ? m : 0);
    });

    const records = [...db.attendance].sort((a, b) => {
        const ta = Number(a?.date);
        const tb = Number(b?.date);
        if (Number.isFinite(ta) && Number.isFinite(tb) && ta !== tb) return ta - tb;
        return parseDdMmYyyyToTime(a?.date_string) - parseDdMmYyyyToTime(b?.date_string);
    });

    const chartLateMinutes = (record) => {
        const key = String(record?.date_string ?? "").trim();
        if (lateByDate.has(key)) return lateByDate.get(key);
        const v =
            record?.late_minutes ??
            record?.late_minute ??
            record?.late_mins_adjusted ??
            record?.late_mins ??
            0;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const chartEarlyLeaveMinutes = (record) => {
        const key = String(record?.date_string ?? "").trim();
        if (earlyByDate.has(key)) return earlyByDate.get(key);
        const m = Number(record?.early_leave_minutes ?? 0);
        return Number.isFinite(m) ? m : 0;
    };

    const rows = records.map((record) => {
        const label = String(record?.date_string ?? "");
        const earnedSec = Number(record?.earned) || 0;
        const workingHrs = Math.round((earnedSec / 3600) * 100) / 100;
        const otSec = Number(record?.overtime) || 0;
        const otHrs = Math.round((otSec / 3600) * 100) / 100;
        return [label, workingHrs, chartLateMinutes(record), otHrs, chartEarlyLeaveMinutes(record)];
    });

    return [header, ...rows];
};

const useIndividualAttendanceServices = ()=>{

    const navigation = useNavigate()

    const location = useLocation()

    const calendarChartData = useStore((state)=> state.calendarChartData)
    const calendarEmp = useStore((state)=> state.calendarEmp)
    const calendarData = useStore((state)=> state.calendarData)
    const showCalendar = useStore((state)=> state.showCalendar)
    
    
    const settingcalendarData = useStore((state)=> state.settingcalendarData)
    const settingcalendarEmp = useStore((state)=> state.settingcalendarEmp)
    const settingcalendarChartData = useStore((state)=> state.settingcalendarChartData)
    const settingShowCalendar = useStore((state)=> state.settingShowCalendar)
    const setLastHRPolicy = useStore((state)=> state.setLastHRPolicy)
    const setRawAttendanceLogParams = useStore((state)=> state.setRawAttendanceLogParams)
    const transformLastPolicyToViewPolicy = useStore((state)=> state.transformLastPolicyToViewPolicy)
    const setViewPolicy = useStore((state)=> state.setViewPolicy)
    const individualAttendanceMonthYear = useStore((state)=> state.individualAttendanceMonthYear)
    const setIndividualAttendanceMonthYear = useStore((state)=> state.setIndividualAttendanceMonthYear)
    
    // Employee store functions
    const empSuggestionListAtt = useStore((state)=> state.empSuggestionListAtt)
    const empListAtt = useStore((state)=> state.empListAtt)
    const Get_All_Employee = useStore((state)=> state.Get_All_Employee)
    


    



    const {gettingSingleData, toggleSingleAttendance, singleDayService, addMoreInput, closeModal, updateSingleDayData} = useSingleAttendanceService()

    const onDataRefreshed = (refreshedData) => {
        // Accept either axios response or plain payload
        const res = refreshedData?.data ? refreshedData.data : refreshedData;
        const db = res?.DB_DATA || null;
        if (!db) return;

        // Map DB_DATA to the expected structure
        const totalSeconds = (db.total ?? db.working_secs ?? 0);
        const earnedSeconds = (db.earned_secs ?? 0);
        const overtimeSeconds = (db.overtime_seconds ?? db.overtime ?? 0);

        const percentage = typeof db.percentage !== 'undefined'
            ? Number(db.percentage).toFixed(2)
            : '0.00';

        const otPercentage = typeof db.ot_percentage !== 'undefined'
            ? Number(db.ot_percentage).toFixed(2)
            : '0.00';

        const empSrc = db.employee || db.emp_data || db.emp || {};
        const employeeSnapshot = {
            id: empSrc.id ?? db.emp_id ?? null,
            emp_id: empSrc.emp_id ?? db.emp_id ?? null,
            bio_id: empSrc.bio_id ?? db.bio_id ?? null,
            name: empSrc.name ?? db.employee_name ?? db.emp_name ?? null,
            branch:
                empSrc.branch ??
                db.branch ??
                (db.branch_name ? { branch_name: db.branch_name } : null),
            department:
                empSrc.department ??
                db.department ??
                (db.department_name ? { name: db.department_name } : null),
            designation:
                empSrc.designation ??
                db.designation ??
                (db.designation_title ? { title: db.designation_title } : null),
        };

        const transformedData = {
            total: totalSeconds,
            expected_working_days: db.expected_working_days ?? 0,
            earned_working_days: db.earned_working_days ?? 0,
            earned: earnedSeconds,
            overtime: overtimeSeconds,
            percentage: percentage,
            ot_percentage: otPercentage,
            attendance: Array.isArray(db.attendance) ? db.attendance : [],
            last_policy: db.last_policy || {},
            early_leave_summary: db.early_leave_summary ?? null,
            late_coming_seconds: db.late_coming_seconds ?? null,
            policy_closeing_time: db.policy_closeing_time || null,
            employeeSnapshot,
            summary: {
                expectedHours: Math.round((db.working_secs ?? db.total ?? 0) / 3600) || 0,
                completedHours: Math.round(earnedSeconds / 3600) || 0,
                overtimeHours: Math.round(overtimeSeconds / 3600) || 0,
                lateComings: (db.total_late_coming_days ?? (Array.isArray(db.late_coming_days) ? db.late_coming_days.length : 0)) || 0,
                absentees: db.absent_days ?? 0,
                holidays: db.holidays ?? 0,
                allowedLeaves: db.allowed_leaves ?? 0,
                leaveAvailed: db.leaves ?? db.leave_availed ?? 0
            }
        };

        const chartFromIndividual = buildChartMatrixFromIndividualAttendanceDb(db);

        setAttendanceData((prevState) => ({
            ...prevState,
            attendanceAttr: transformedData,
            chartData: chartFromIndividual,
        }));

        // Also update the calendar data in the store
        settingcalendarData(transformedData);
        settingcalendarChartData(chartFromIndividual);
        // Store last_policy in store for route access
        const lastPolicy = db.last_policy || {};
        setLastHRPolicy(lastPolicy);
        // Transform and store policy as viewPolicy for CurrentHRPolicy component
        if (lastPolicy && lastPolicy.id) {
            const transformedPolicy = transformLastPolicyToViewPolicy(lastPolicy);
            if (transformedPolicy && Object.keys(transformedPolicy).length > 0) {
                setViewPolicy(transformedPolicy);
            }
        }
    }





    let date  = new Date()

    const months = getAllMonths()
    const currentMonthIndex = new Date().getMonth();
    const currentYearIndex = new Date().getFullYear();
    const updateMonth = months[currentMonthIndex]

    const getInitialMonthYear = () => {
        const stored = useStore.getState().individualAttendanceMonthYear;
        if (stored?.month && stored?.year) {
            return { month: stored.month, year: stored.year };
        }
        return {
            month: { value: updateMonth.id, label: updateMonth.title },
            year: { value: currentYearIndex, label: currentYearIndex }
        };
    };

    const [searchingEmpValue, setSearchingEmpValue] = useState(() => ({
        empList :[],
        empId:null,
        month: getInitialMonthYear().month,
        year: getInitialMonthYear().year,
        fromEmp:false,
        org_id: null
    }))

    const getInitialDaysArray = () => {
        const stored = useStore.getState().individualAttendanceMonthYear;
        if (stored?.month?.value != null && stored?.year?.value != null) {
            return generateDays(stored.year.value, stored.month.value - 1);
        }
        return generateDays(date.getFullYear(), date.getMonth());
    };

    const [attendanceData, setAttendanceData] = useState(() => ({
        attendanceAttr:{
            total: 0,
            expected_working_days: 0,
            earned_working_days: 0,
            earned: 0,
            overtime: 0,
            percentage: '0.00',
            ot_percentage: '0.00',
            attendance: [],
            summary: {
                expectedHours: 0,
                completedHours: 0,
                overtimeHours: 0,
                lateComings: 0,
                absentees: 0,
                holidays: 0,
                availedLeaves: 0,
                early_leave_min: 0,
                bucket_minutes: 0
            }
        },
        currentDate: getInitialMonthYear().month,
        nextMonth:'',
        prevMonth:'',
        nextYear:'',
        prevYear:'',
        daysArray: getInitialDaysArray(),
        chartData:[] // Initialize as empty array for chart component
    }))
    
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false) // Keep for potential future use


    function getCurrentMonthObject(currentDate){
        // Get the month index (0-11)
        const monthIndex = currentDate.getMonth(); 

        // Array of month names
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Create the desired object
        return {
            value: monthIndex + 1, // Add 1 to make it 1-based (1 for January, 12 for December)
            label: monthNames[monthIndex] // Get the month name
        };
    };


    const handleSearchEmp = (value, actionMeta)=>{
        if (actionMeta.action === 'input-change') {
            debounceEmpList(value)
        }
    }



    const debounceEmpList = useDebounce(async(value) => {
        
        const apiData = {
            search:value ,
            emp_status :'active'
        }
        await getEmpSuggestedList(apiData)
       
    }, 500); // 500ms debounce time



    const getEmpSuggestedList  = async(data)=>{
        try{
            // Call the API with search parameters
            await empSuggestionListAtt(data);
            // The empListAtt will be updated via the useEffect above
            // which will trigger the filtering

        }catch(err){
            console.error(err)
            showToast('Error fetching employees', 'error')
        }
    }



    const handleSelectAttendance = (select, field)=>{
       /// console.log('handleSelectAttendance called with:', { select, field });
        
        // Store params in store for raw logs route access
        // Update store whenever empId, month, or year changes
        // Declare these variables first before they are used
        const currentEmpId = field === 'empId' ? select : searchingEmpValue.empId
        const currentMonth = field === 'month' ? select : searchingEmpValue.month
        const currentYear = field === 'year' ? select : searchingEmpValue.year
        
        setSearchingEmpValue((prevState)=>(
            {
            ...prevState,
            [field]: select
        }))

        // Persist selected employee to store for page re-entry
        if(field === 'empId'){
            settingcalendarEmp(select)
            // Reset fromEmp so effect can fetch fresh data on return
            setSearchingEmpValue((prevState)=>(
                {
                ...prevState,
                fromEmp: false
            }))
        }

        if(field === 'month'){
            // Use currentYear.value to get the numeric year value
            const yearValue = currentYear?.value || searchingEmpValue.year?.value || new Date().getFullYear();
            const updatedDays = generateDays(yearValue, select.value - 1);
            // console.log('updatedDays', updatedDays)
            setSearchingEmpValue((prevState)=>(
                {
                ...prevState,
                [field]: select
            }))
            setAttendanceData((prevState)=>(
                {
                ...prevState,
                currentDate: select,
                daysArray:updatedDays
            }))
        }
        if(field === 'year'){
            // Use currentMonth.value to get the numeric month value
            const monthValue = currentMonth?.value || searchingEmpValue.month?.value || (new Date().getMonth() + 1);
            const updatedDays = generateDays(select.value, monthValue - 1);
            // console.log('updatedDays', updatedDays)
            setSearchingEmpValue((prevState)=>(
                {
                ...prevState,
                [field]: select
            }))
            setAttendanceData((prevState)=>(
                {
                ...prevState,
                currentDate: select,
                daysArray:updatedDays
            }))
        }

        if (field === 'month') {
            setIndividualAttendanceMonthYear({ month: select, year: currentYear });
        }
        if (field === 'year') {
            setIndividualAttendanceMonthYear({ month: currentMonth, year: select });
        }
        
        // Only store if we have all three values
        if (currentEmpId && currentMonth && currentYear) {
            setRawAttendanceLogParams({
                empId: currentEmpId,
                month: currentMonth,
                year: currentYear
            })
        }

    }

    // Load all employees on component mount
    useEffect(() => {
        const loadEmployees = async () => {
            try {
                // Call the API function without search parameters to get all employees
                await empSuggestionListAtt();
                console.log('Employees loaded successfully');
            } catch (error) {
                console.error('Error loading employees:', error);
            }
        };
        
        loadEmployees();
    }, []);

    // Keep local empList in sync with store (GET get_all_employee + client filter in empSuggestionListAtt)
    useEffect(() => {
        if (!Array.isArray(empListAtt)) return;
        setSearchingEmpValue((prevState) => ({
            ...prevState,
            empList: empListAtt,
        }));
    }, [empListAtt]);

    useEffect(()=>{
        // console.log('useEffect triggered - searchingEmpValue:', searchingEmpValue);
        // console.log('useEffect - empId:', searchingEmpValue.empId);
        // console.log('useEffect - fromEmp:', searchingEmpValue.fromEmp);
        // console.log('useEffect - pathname:', location.pathname);
        
        // Only call API if we have a valid employee ID and we're on the correct page
        // Add additional check to prevent multiple calls for the same employee
        const onIndividualReportRoute =
            location.pathname.includes("individual-attendance") ||
            location.pathname.includes("/my-attendance/admin-individual-report");

        if (searchingEmpValue.empId &&
            !searchingEmpValue.fromEmp &&
            onIndividualReportRoute &&
            searchingEmpValue.empId !== null) {
           /// console.log('Calling gettingAttendanceData...');
            gettingAttendanceData();
        }
        // gettingAttendanceData()
        // gettingGraphData()
        
    },[searchingEmpValue.empId, searchingEmpValue.month, searchingEmpValue.year])

    const gettingAttendanceData = async(id)=>{
        // console.log('gettingAttendanceData called with id:', id);
        // console.log('searchingEmpValue.empId:', searchingEmpValue.empId);
        // console.log('isLoadingAttendance:', isLoadingAttendance);
        
        // Prevent multiple simultaneous API calls
        if(isLoadingAttendance) {
            // console.log('API call already in progress, skipping...');
            return;
        }
        
        if(searchingEmpValue.empId === null){
            // console.log('No employee selected, returning...');
            return
        }else{
            // Removed loading state - show default values instead
            // console.log('Setting loading state to true');

            const empId = gettingValue(searchingEmpValue.empId)
            
            // Get logged-in user's org_id
            const userData = getUserData();
            const org_id = userData?.org_id || null;

            const resolvedEmpId = empId || id
            const apiData = {
                // Backend commonly expects user_id / emp_id; keep empId for backward compatibility
                user_id: resolvedEmpId,
                emp_id: resolvedEmpId,
                empId: resolvedEmpId,
                month: searchingEmpValue.month.value,
                year: searchingEmpValue.year.value,
                filter: "specific_month",
                org_id: org_id
                // searchBy : "AI",
                // calendar_json : "true"
            }
            // console.log('Making API call with data:', apiData);
            
            try {
                const response = await attendanceApi.getIndividualDetail(apiData)
                const responseData = response.data;
                // console.log('API Response:', response);
                // console.log('API Response Data:', responseData);
                // console.log('DB_DATA:', responseData.DB_DATA);
                // console.log('Attendance Array:', responseData.DB_DATA?.attendance);
                
                if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                    // Map DB_DATA to expected structure here (do not modify other modules)
                    const db = responseData.DB_DATA || {};

                    const totalSeconds = (db.total ?? db.working_secs ?? 0);
                    const earnedSeconds = (db.earned_secs ?? 0);
                    const overtimeSeconds = (db.overtime_seconds ?? db.overtime ?? 0);

                    const percentage = typeof db.percentage !== 'undefined'
                        ? Number(db.percentage).toFixed(2)
                        : '0.00';

                    const otPercentage = typeof db.ot_percentage !== 'undefined'
                        ? Number(db.ot_percentage).toFixed(2)
                        : '0.00';

                    // Calculate present_days from completedHours (assuming 8 hours per day)
                    // Or use present_days from API if available, or count from attendance array
                    const completedHours = Math.round(earnedSeconds / 3600) || 0
                    const presentDaysFromHours = Math.round(completedHours / 8)
                    const presentDaysFromArray = Array.isArray(db.attendance) 
                        ? db.attendance.filter(record => record.status === 'present' || record.present === true || record.attendance_status === 'present').length 
                        : 0
                    const presentDays = db.present_days ?? (presentDaysFromArray || presentDaysFromHours || 0)

                    const empSrc = db.employee || db.emp_data || db.emp || {};
                    const employeeSnapshot = {
                        id: empSrc.id ?? db.emp_id ?? null,
                        emp_id: empSrc.emp_id ?? db.emp_id ?? null,
                        bio_id: empSrc.bio_id ?? db.bio_id ?? null,
                        name: empSrc.name ?? db.employee_name ?? db.emp_name ?? null,
                        branch:
                            empSrc.branch ??
                            db.branch ??
                            (db.branch_name ? { branch_name: db.branch_name } : null),
                        department:
                            empSrc.department ??
                            db.department ??
                            (db.department_name ? { name: db.department_name } : null),
                        designation:
                            empSrc.designation ??
                            db.designation ??
                            (db.designation_title ? { title: db.designation_title } : null),
                    };

                    const transformedData = {
                        total: totalSeconds,
                        expected_working_days: db.expected_working_days ?? 0,
                        earned_working_days: db.earned_working_days ?? 0,
                        earned: earnedSeconds,
                        overtime: overtimeSeconds,
                        percentage: percentage,
                        ot_percentage: otPercentage,
                        attendance: Array.isArray(db.attendance) ? db.attendance : [],
                        last_policy: db.last_policy || {},
                        early_leave_summary: db.early_leave_summary ?? null,
                        late_coming_seconds: db.late_coming_seconds ?? null,
                        policy_closeing_time: db.policy_closeing_time || null,
                        employeeSnapshot,
                        summary: {
                            expectedHours: Math.round((db.working_secs ?? db.total ?? 0) / 3600) || 0,
                            completedHours: completedHours,
                            overtimeHours: Math.round(overtimeSeconds / 3600) || 0,
                            lateComings: (db.total_late_coming_days ?? (Array.isArray(db.late_coming_days) ? db.late_coming_days.length : 0)) || 0,
                            present_days: presentDays,
                            absentees: db.absent_days ?? 0,
                            holidays: db.holidays ?? 0,
                            allowedLeaves: db.allowed_leaves ?? 0,
                            leaveAvailed: db.leaves ?? db.leave_availed ?? 0
                        }
                    };

                    const chartDataFromIndividual = buildChartMatrixFromIndividualAttendanceDb(db);

                    setAttendanceData((prevState)=>(
                        {
                        ...prevState,
                        attendanceAttr: transformedData,
                        chartData: chartDataFromIndividual,
                    }))
                    settingcalendarChartData(chartDataFromIndividual)
                    settingcalendarData(transformedData)
                    // Store last_policy in store for route access
                    const lastPolicy = db.last_policy || {};
                    setLastHRPolicy(lastPolicy);
                    // Transform and store policy as viewPolicy for CurrentHRPolicy component
                    if (lastPolicy && lastPolicy.id) {
                        const transformedPolicy = transformLastPolicyToViewPolicy(lastPolicy);
                        if (transformedPolicy && Object.keys(transformedPolicy).length > 0) {
                            setViewPolicy(transformedPolicy);
                        }
                    }
                }
                
                // console.log('response', response)
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            } finally {
                // Removed loading state - show default values instead
                // console.log('Setting loading state to false');
            }
        }
    }

    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();

    const handleNextMonth = () => {
        const currentMonth = searchingEmpValue.month.value - 1; // Month index (0-11)
        const currentYear = searchingEmpValue.year.value;
        
        // Create a new Date object to handle month/year calculation
        const nextMonthDate = new Date(currentYear, currentMonth + 1); // Move to next month
        
        const newMonth = nextMonthDate.getMonth(); // Get the next month index (0-11)
        const newYear = nextMonthDate.getFullYear(); // Get the updated year if necessary

        // Get the updated month object (assuming `getAllMonths()` is the function that returns month info)
        const updatedMonth = months.find((m) => m.id === newMonth + 1); // +1 to make it 1-based (1 for January)

        const newMonthYear = { month: { value: newMonth + 1, label: updatedMonth.title }, year: { value: newYear, label: newYear } };
        setSearchingEmpValue((prevState) => ({
            ...prevState,
            ...newMonthYear,
        }));
        setAttendanceData((prevState)=>({
            ...prevState,
            daysArray:generateDays(newYear, newMonth)
        }));
        setIndividualAttendanceMonthYear(newMonthYear);
    };
    const handlePreviousMonth = () => {
        const currentMonth = searchingEmpValue.month.value - 1; // Month index (0-11)
        const currentYear = searchingEmpValue.year.value;

        // Create a new Date object to handle month/year calculation
        const prevMonthDate = new Date(currentYear, currentMonth - 1); // Move to previous month
        
        const newMonth = prevMonthDate.getMonth(); // Get the previous month index (0-11)
        const newYear = prevMonthDate.getFullYear(); // Get the updated year if necessary

        // Get the updated month object (assuming `getAllMonths()` is the function that returns month info)
        const updatedMonth = months.find((m) => m.id === newMonth + 1); // +1 to make it 1-based (1 for January)
        const newMonthYear = { month: { value: newMonth + 1, label: updatedMonth.title }, year: { value: newYear, label: newYear } };
        setSearchingEmpValue((prevState) => ({
            ...prevState,
            ...newMonthYear,
        }));
        setAttendanceData((prevState)=>({
            ...prevState,
            daysArray:generateDays(newYear, newMonth)
        }));
        setIndividualAttendanceMonthYear(newMonthYear);
    };


    const getAttendanceLabel = (day, month, year) => {
        const dateString = `${String(day).padStart(2, "0")}-${String(
            month + 1
        ).padStart(2, "0")}-${year}`; // Use passed month and year
        
        const attendance = attendanceData.attendanceAttr?.attendance?.find(
            (att) => att.date_string === dateString
        );
    
        return attendance ? attendance.att_label : null;
    };

    const getBackgroundColor = (attLabel) => {
        const colorData = attendanceColorData.find(
            (data) => data.att == attLabel
        );

        return colorData ? colorData.color : null;
    };


    const getExtraAttribute =(day, month, year, extAttribute)=>{
        const dateString = `${String(day).padStart(2, "0")}-${String(
            month + 1
        ).padStart(2, "0")}-${year}`; // Use passed month and year
        const attendance = attendanceData.attendanceAttr?.attendance?.find(
            (att) => att.date_string == dateString
        );
        return attendance ? attendance[extAttribute] : null;
    }
    const handleSingleDayDate =(day, month, year)=>{
        // Check if employee is selected
        if (!searchingEmpValue?.empId || !searchingEmpValue?.empId?.value) {
            showToast('Please select an employee first', 'error')
            return
        }

        const dateString = `${String(day).padStart(2, "0")}-${String(
            month + 1
        ).padStart(2, "0")}-${year}`; // Use passed month and year
        
        // Create a proper date object for the title
        const dateObj = new Date(year, month, day)
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"]
        const formattedDate = `${day}, ${monthNames[month]} ${year}`
        
        const attendance = attendanceData.attendanceAttr?.attendance?.find(
            (att) => att.date_string == dateString
        );
        
        // If no attendance data found, create a basic data object with the date info
        const dataToPass = attendance || {
            date_string: dateString,
            calendar_date: formattedDate,
            timings: [],
            att_label: null,
            expected: 0,
            earned: 0,
            overtime: 0
        }
        
        gettingSingleData(dataToPass)
    }

    let daysArray
    





    function generateDays(year, month) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
      
        let daysArray = [];
      
        // Fill in blank spaces for days of the previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
          daysArray.push(null);
        }
      
        // Fill in the days of the current month
        for (let i = 1; i <= daysInMonth; i++) {
          daysArray.push(i);
        }



      
        return daysArray;
    }


    const gettingGraphData = async(id)=>{
        if(searchingEmpValue.empId !== null){
            const empId = gettingValue(searchingEmpValue.empId)

            const apiData = {
                empId: empId || id,
                month: searchingEmpValue.month.value,
                year: searchingEmpValue.year.value,
            }
            try{
                const response = await attendanceApi.getAttendanceGraph(apiData)
                const res = response?.data || {}

                // Helper to dedupe 2D chart matrix by label (first column), keeping last occurrence
                const dedupeMatrixByLabel = (matrix) => {
                    if (!Array.isArray(matrix) || matrix.length === 0) return matrix;
                    const header = matrix[0] || [];
                    const rows = matrix.slice(1);
                    const indexByLabel = new Map();
                    const deduped = [];
                    rows.forEach((row) => {
                        const label = String(row?.[0] ?? '');
                        if (indexByLabel.has(label)) {
                            const idx = indexByLabel.get(label);
                            deduped[idx] = row; // replace with latest
                        } else {
                            indexByLabel.set(label, deduped.length);
                            deduped.push(row);
                        }
                    });
                    return [header, ...deduped];
                };

                // Case 1: API returns chart-ready 2D array
                if (response.status === 200 && response.data.STATUS === 'SUCCESSFUL' && Array.isArray(res.data)) {
                    const deduped = dedupeMatrixByLabel(res.data);
                    setAttendanceData((prevState)=>(
                        {
                        ...prevState,
                        chartData: deduped
                    }))
                    settingcalendarChartData(deduped)
                    return
                }

                // Case 2: Flexible shape handling for records (same shape as individual-attendance DB_DATA)
                const payload = res.DB_DATA || res.data || res
                const records = payload?.attendance || payload?.records || []
                const built = buildChartMatrixFromIndividualAttendanceDb({
                    attendance: records,
                    late_coming_days: payload?.late_coming_days,
                    early_leave_summary: payload?.early_leave_summary,
                });
                const header = built[0] || [
                    "Date",
                    "Working Hours",
                    "Late Minutes",
                    "Overtime (hrs)",
                    "Early Leave (min)",
                ];
                const indexByLabel = new Map();
                const dedupedRows = [];
                built.slice(1).forEach((row) => {
                    const label = String(row?.[0] ?? "");
                    if (indexByLabel.has(label)) {
                        const idx = indexByLabel.get(label);
                        dedupedRows[idx] = row;
                    } else {
                        indexByLabel.set(label, dedupedRows.length);
                        dedupedRows.push(row);
                    }
                });
                const chartDataArray = [header, ...dedupedRows];

                setAttendanceData((prevState)=>(
                    {
                    ...prevState,
                    chartData: chartDataArray
                }))
                settingcalendarChartData(chartDataArray)
            }catch(err){
                setAttendanceData((prevState)=>(
                    {
                    ...prevState,
                    chartData:[],
                }))
                settingcalendarChartData([])
            }
        }
    }


    const gettingAtData =(data)=>{
        setSearchingEmpValue((prevState)=>({
            ...prevState,
            empId:{value:data.id, label:data.name},
            fromEmp:true
        }))
        settingShowCalendar(true)
        
        settingcalendarEmp({value:data.id, label:data.name})

        const user = getUserData();
        const roleId = user?.roleId || "Employee";
        const reportPath = isFullAdmin(roleId)
            ? "/attendance/individual-attendance/individual_attendance_report"
            : "/my-attendance/admin-individual-report";
        setTimeout(() => {
            navigation(reportPath);
        }, 200);
    }
    

    const handleCalendarNavigation = ()=>{
        settingShowCalendar(false)
        settingcalendarData({})
        settingcalendarEmp({})
        settingcalendarChartData([])
        setSearchingEmpValue((prevState)=>({
            ...prevState,
            empId:{},
        }))
        setAttendanceData((prevState)=>({
            ...prevState,
            attendanceAttr:{
                total: 0,
                earned: 0,
                overtime: 0,
                percentage: '0.00',
                ot_percentage: '0.00',
                attendance: [],
                summary: {
                    expectedHours: 0,
                    completedHours: 0,
                    overtimeHours: 0,
                    lateComings: 0,
                    absentees: 0,
                    holidays: 0
                }
            },
            chartData:[] // Reset to empty array
        }))
        if (location.pathname.includes("/my-attendance/")) {
            navigation("/my-attendance");
        } else {
            navigation("/employees/all_employess");
        }

    }



    useEffect(()=>{
        setSearchingEmpValue((prevState)=>({
            ...prevState,
            empId: calendarEmp || null,
            // Ensure fresh fetch when coming back into the page
            fromEmp: false,
        }))
        setAttendanceData((prevState)=>({
            ...prevState,
            attendanceAttr:calendarData || {
                total: 0,
                earned: 0,
                overtime: 0,
                percentage: '0.00',
                ot_percentage: '0.00',
                attendance: [],
                summary: {
                    expectedHours: 0,
                    completedHours: 0,
                    overtimeHours: 0,
                    lateComings: 0,
                    absentees: 0,
                    holidays: 0
                }
            },
            chartData:calendarChartData || [] // Ensure it's always an array
        }))
    },[calendarEmp])


    



    return { handleSearchEmp,searchingEmpValue,handleSelectAttendance,attendanceData,
        handleNextMonth,handlePreviousMonth,
        getAttendanceLabel,
        getBackgroundColor,
        daysArray,
        currentYear,
        currentMonth,
        getExtraAttribute,
        handleSingleDayDate,
        singleDayService,
        toggleSingleAttendance,
        addMoreInput,
        closeModal,
        updateSingleDayData,
        onDataRefreshed,
        gettingAtData,
        calendarEmp,
        handleCalendarNavigation,
        showCalendar
     }


}


export default useIndividualAttendanceServices