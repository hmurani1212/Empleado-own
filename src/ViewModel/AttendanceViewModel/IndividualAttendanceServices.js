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

    const onDataRefreshed = (refreshedData, graphResponse) => {
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
            policy_closeing_time: db.policy_closeing_time || null,
            summary: {
                expectedHours: Math.round((db.working_secs ?? db.total ?? 0) / 3600) || 0,
                completedHours: Math.round(earnedSeconds / 3600) || 0,
                overtimeHours: Math.round(overtimeSeconds / 3600) || 0,
                lateComings: (db.total_late_coming_days ?? (Array.isArray(db.late_coming_days) ? db.late_coming_days.length : 0)) || 0,
                absentees: db.absent_days ?? 0,
                holidays: db.holidays ?? 0,
                allowedLeaves: db.allowed_leaves ?? 0,
                leaveAvailed: db.leave_availed ?? 0
            }
        };

        // Decide chart data: if graphResponse provided and valid, use it; else keep existing and trigger fetch
        let nextChart = null;
        const graphRes = graphResponse?.data ? graphResponse.data : graphResponse;
        if (graphRes && Array.isArray(graphRes.data) && graphRes.STATUS === 'SUCCESSFUL') {
            // Dedupe chart matrix by date label
            const matrix = graphRes.data;
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
            nextChart = [header, ...deduped];
        }

        setAttendanceData((prevState) => ({
            ...prevState,
            attendanceAttr: transformedData,
            chartData: nextChart ? nextChart : prevState.chartData
        }));

        // Also update the calendar data in the store
        settingcalendarData(transformedData);
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
        if (nextChart) {
            settingcalendarChartData(nextChart);
        } else {
            // Refresh the chart from the dedicated graph API
            gettingGraphData();
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
                availedLeaves: 0
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
            // Always call the API to get fresh data
            await empSuggestionListAtt();
            // The empListAtt will be updated via the useEffect above
            
            console.log('Employee search requested for:', data.search);
            // The empListAtt will be updated via the useEffect above, which will trigger the filtering

        }catch(err){
            console.log(err)
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
                // Call the API function
                await empSuggestionListAtt();
            } catch (error) {
                console.error('Error loading employees:', error);
            }
        };
        
        loadEmployees();
    }, []);

    // Watch for changes in empListAtt and update local state
    useEffect(() => {
        if (empListAtt && empListAtt.length > 0) {
            // console.log('empListAtt updated, setting employee list:', empListAtt.length);
            
            // Apply any current search filter if there's a search term
            let filteredEmployees = empListAtt;
            
            // You can add search filtering here if needed
            // if (searchingEmpValue.searchTerm) {
            //     filteredEmployees = empListAtt.filter(emp => 
            //         emp.name && emp.name.toLowerCase().includes(searchingEmpValue.searchTerm.toLowerCase())
            //     );
            // }
            
            setSearchingEmpValue((prevState)=>({
                ...prevState,
                empList: filteredEmployees
            }))
        }
    }, [empListAtt]);

    useEffect(()=>{
        // console.log('useEffect triggered - searchingEmpValue:', searchingEmpValue);
        // console.log('useEffect - empId:', searchingEmpValue.empId);
        // console.log('useEffect - fromEmp:', searchingEmpValue.fromEmp);
        // console.log('useEffect - pathname:', location.pathname);
        
        // Only call API if we have a valid employee ID and we're on the correct page
        // Add additional check to prevent multiple calls for the same employee
        if (searchingEmpValue.empId && 
            !searchingEmpValue.fromEmp && 
            location.pathname.includes('individual-attendance') &&
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

            const apiData = {
                empId: empId || id,
                month:searchingEmpValue.month.value,
                year:searchingEmpValue.year.value,
                filter : "specific_month",
                org_id: org_id
                // searchBy : "AI",
                // calendar_json : "true"
            }
            // console.log('Making API call with data:', apiData);
            
            try {
                const response = await attendanceApi.getIndividualDetail(apiData)
                const responseData = response.data;
                console.log('what is the data', response)
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
                        policy_closeing_time: db.policy_closeing_time || null,
                        summary: {
                            expectedHours: Math.round((db.working_secs ?? db.total ?? 0) / 3600) || 0,
                            completedHours: completedHours,
                            overtimeHours: Math.round(overtimeSeconds / 3600) || 0,
                            lateComings: (db.total_late_coming_days ?? (Array.isArray(db.late_coming_days) ? db.late_coming_days.length : 0)) || 0,
                            present_days: presentDays,
                            absentees: db.absent_days ?? 0,
                            holidays: db.holidays ?? 0,
                            allowedLeaves: db.allowed_leaves ?? 0,
                            leaveAvailed: db.leaves ?? 0
                        }
                    };

                    console.log('transformedData1234567890', transformedData)
                    
                    // Create chart data format for the chart component
                    setAttendanceData((prevState)=>(
                        {
                        ...prevState,
                        attendanceAttr: transformedData,
                        chartData: prevState.chartData
                    }))
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
                    // Fetch chart data from graph API (separate endpoint)
                    gettingGraphData();
                    // console.log('Attendance data set successfully:', transformedData);
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
                console.log("graph of the day", response)

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

                // Case 2: Flexible shape handling for records
                const payload = res.DB_DATA || res.data || res
                const records = payload?.attendance || payload?.records || []

                // Build and dedupe by date_string
                const header = ['Date', 'Working Hours'];
                const indexByLabel = new Map();
                const dedupedRows = [];
                records.forEach((record) => {
                    const label = record.date_string;
                    const row = [label, Math.round((record.earned || 0) / 3600 * 100) / 100];
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

        setTimeout(()=>{
            navigation('/attendance/individual-attendance/individual_attendance_report');
        }, 200)
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
        navigation('/employees/all_employess')

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