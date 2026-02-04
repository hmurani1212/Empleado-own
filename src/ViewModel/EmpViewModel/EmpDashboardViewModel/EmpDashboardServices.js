import { useEffect, useState, useCallback } from "react"
import useStore from "../../../Store/store"
import { getAllMonths } from "../../../services/__appServicesData"
import { attendanceColorData } from "../../../services/__attendanceServices"
import empDashboardApi from "../../../Model/Data/EmpData/EmpDashboard/EmpDashboard"
import LeavesBalance from "../../../Components/EmployeeSide/LeavesBalance"
import LateMinutes from "../../../Components/EmployeeSide/LateMinutes"
import ViewEmployeePolicy from "../../../Components/EmployeeSide/ViewEmployeePolicy"

const useEmpDashboard = ()=>{

    const gettingEmpDashboardData = useStore((state)=> state.gettingEmpDashboardData)
    const empDashboardData = useStore((state)=> state.empDashboardData)
    const openDrawer = useStore((state) => state.openDrawer)
    const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
    const settingComponent = useStore((state) => state.settingComponent)
    const settingDrawerSize = useStore((state) => state.settingDrawerSize)


    let date  = new Date()
    const months = getAllMonths()

    // Use current month and year
    const currentMonthIndex = date.getMonth(); // Current month (0-based)
    const currentYearIndex = date.getFullYear(); // Current year
    const updateMonth = months[currentMonthIndex]
    
    // const attendanceDetails =  
    const [calendarData, setCalendarData] = useState({
        attendanceAttr:[],
        daysArray:generateDays(currentYearIndex, currentMonthIndex),
        month:{value:updateMonth.id, label:updateMonth.title}, // Use updateMonth.id (1-based)
        year:{value:currentYearIndex, label:currentYearIndex},
        currentDate:getCurrentMonthObject(new Date(currentYearIndex, currentMonthIndex)),
    })


    useEffect(()=>{
        // Initial API call with current month and year
        gettingEmpDashboardData(updateMonth.id, currentYearIndex);
    },[gettingEmpDashboardData, updateMonth.id, currentYearIndex])

    // Filter attendance data for specific month from the main API response
    const filterAttendanceForMonth = useCallback((month, year) => {
        if (!empDashboardData?.attendance_detail?.attendance) {
            setCalendarData((prevState) => ({
                ...prevState,
                attendanceAttr: []
            }));
            return;
        }

        const allAttendance = empDashboardData.attendance_detail.attendance;
        
        const filteredAttendance = allAttendance.filter(att => {
            const date = new Date(att.date * 1000); // Convert timestamp to date
            const attMonth = date.getMonth() + 1;
            const attYear = date.getFullYear();
            return attMonth === month && attYear === year;
        });
        setCalendarData((prevState) => ({
            ...prevState,
            attendanceAttr: filteredAttendance
        }));
    }, [empDashboardData?.attendance_detail?.attendance]);

    useEffect(()=>{
        if(empDashboardData?.attendance_detail?.attendance && empDashboardData.attendance_detail.attendance.length > 0) {
            const targetMonth = calendarData.month.value; // Current selected month
            const targetYear = calendarData.year.value; // Current selected year
            filterAttendanceForMonth(targetMonth, targetYear);
        }
    },[empDashboardData, calendarData.month.value, calendarData.year.value, filterAttendanceForMonth])



    const handleNextMonth = () => {
        const currentMonth = calendarData.month.value - 1; // Month index (0-11)
        const currentYear = calendarData.year.value;
        
        // Create a new Date object to handle month/year calculation
        const nextMonthDate = new Date(currentYear, currentMonth + 1); // Move to next month
        
        const newMonth = nextMonthDate.getMonth(); // Get the next month index (0-11)
        const newYear = nextMonthDate.getFullYear(); // Get the updated year if necessary

        // Get the updated month object (assuming `getAllMonths()` is the function that returns month info)
        const updatedMonth = months.find((m) => m.id === newMonth + 1); // +1 to make it 1-based (1 for January)

        setCalendarData((prevState) => ({
            ...prevState,
            month: { value: newMonth + 1, label: updatedMonth.title }, // Update month (1-based index)
            year: { value: newYear, label: newYear }, // Update year if necessary
            daysArray:generateDays(newYear, newMonth)
        }));
        
        // Call API with new month and year
        gettingEmpDashboardData(newMonth + 1, newYear);
    };
    const handlePreviousMonth = () => {
        const currentMonth = calendarData.month.value - 1; // Month index (0-11)
        const currentYear = calendarData.year.value;

        // Create a new Date object to handle month/year calculation
        const prevMonthDate = new Date(currentYear, currentMonth - 1); // Move to previous month
        
        const newMonth = prevMonthDate.getMonth(); // Get the previous month index (0-11)
        const newYear = prevMonthDate.getFullYear(); // Get the updated year if necessary

        // Get the updated month object (assuming `getAllMonths()` is the function that returns month info)
        const updatedMonth = months.find((m) => m.id === newMonth + 1); // +1 to make it 1-based (1 for January)
        setCalendarData((prevState) => ({
            ...prevState,
            month: { value: newMonth + 1, label: updatedMonth.title }, // Update month (1-based index)
            year: { value: newYear, label: newYear }, // Update year if necessary
            daysArray:generateDays(newYear, newMonth)
        }));
        
        // Call API with new month and year
        gettingEmpDashboardData(newMonth + 1, newYear);
    };

    // Removed unused gettingAttendanceData function

    const getAttendanceLabel = (day, month, year) => {
        const dateString = `${String(day).padStart(2, "0")}-${String(
            month + 1
        ).padStart(2, "0")}-${year}`;
        
        const attendance = calendarData?.attendanceAttr?.find(
            (att) => att.date_string === dateString
        );
    
        return attendance ? attendance.att_label : null;
    };

    const getBackgroundColor = (attLabel) => {
        const colorData = attendanceColorData.find(
            (data) => data.att === attLabel
        );

        return colorData ? colorData.color : null;
    };


    let daysArray
    







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


    const getExtraAttribute =(day, month, year, extAttribute)=>{
        const dateString = `${String(day).padStart(2, "0")}-${String(
            month + 1
        ).padStart(2, "0")}-${year}`; // Use passed month and year
        const attendance = calendarData?.attendanceAttr?.find(
            (att) => att.date_string === dateString
        );
        return attendance ? attendance[extAttribute] : null;
    }


    const handleSingleDayDate =(day, month, year)=>{
        const dateString = `${String(day).padStart(2, "0")}-${String(
            month + 1
        ).padStart(2, "0")}-${year}`; // Use passed month and year
        const attendance = calendarData?.attendanceAttr?.find(
            (att) => att.date_string === dateString
        );

        // Create a proper date object even when there's no attendance data
        const dateObj = new Date(year, month, day);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // If attendance exists, use it; otherwise create a basic date object
        const dataToPass = attendance || {
            calendar_date: formattedDate,
            date_string: dateString,
            att_label: null,
            extra: "No attendance data available"
        };

        gettingSingleData(dataToPass)
        
    }



    const [annualRemLeaves, setAnnulaRemLeaves] = useState({
        show:false, 
        data:[]
    })


    const handleAnnualRemLeave = async()=>{
        try {
            const response = await empDashboardApi.getAnnualRemLeaves()
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                setAnnulaRemLeaves((prevState)=>({
                    ...prevState, 
                    data:responseData.DB_DATA,
                    show:true
                }))
            }
        } catch (error) {
            
        }
    }

    const toggelAnnualLeaves = ()=>{
        setAnnulaRemLeaves((prevState)=>({
            ...prevState, 
            data:[],
            show:false
        }))
    }

    const [singleAttendance, setSingleAttendance] = useState({
        show:false, 
        data:{}
    })


    const gettingSingleData = (data)=>{
        setSingleAttendance((prevState)=>({
            ...prevState,
            show:true,
            data:data
        }))
    }



    const toggleSingleAttendance = ()=>{
        setSingleAttendance((prevState)=>({
            ...prevState,
            show:false, 
            data:{}
        }))
    }

    const handlePolicyView = async () => {
        openDrawer()
        settingDrawerSize(800)
        settingDrawerTitle('HR Policy')
        settingComponent(<ViewEmployeePolicy
        />)
    }

    const handleLeaveBalance = async () => {
        openDrawer()
        settingDrawerSize(800)
        settingDrawerTitle('Leaves Record')
        settingComponent(<LeavesBalance
        />)
    }

    const handleLateMinutes = async () => {
        openDrawer()
        settingDrawerSize(800)
        settingDrawerTitle('Late Minutes History')
        settingComponent(<LateMinutes
        />)
    }


    return {
        empDashboardData,gettingEmpDashboardData,
        handleNextMonth,handlePreviousMonth,
        getBackgroundColor,getAttendanceLabel,
        daysArray,
        calendarData,
        getExtraAttribute,
        handleSingleDayDate,
        handleAnnualRemLeave,
        annualRemLeaves,
        toggelAnnualLeaves,
        singleAttendance,
        toggleSingleAttendance,
        filterAttendanceForMonth,
        handlePolicyView,
        handleLeaveBalance,
        handleLateMinutes
    }
}


// Hook for functions only (without API calls)
const useEmpDashboardFunctions = () => {
    const empDashboardData = useStore((state)=> state.empDashboardData)

    let date  = new Date()
    const months = getAllMonths()

    // Use current month and year
    const currentMonthIndex = date.getMonth(); // Current month (0-based)
    const currentYearIndex = date.getFullYear(); // Current year
    const updateMonth = months[currentMonthIndex]
    
    const [calendarData, setCalendarData] = useState({
        attendanceAttr:[],
        daysArray:generateDays(currentYearIndex, currentMonthIndex),
        month:{value:updateMonth.id, label:updateMonth.title}, // Use updateMonth.id (1-based)
        year:{value:currentYearIndex, label:currentYearIndex},
        currentDate:getCurrentMonthObject(new Date(currentYearIndex, currentMonthIndex)),
    })

    // Filter attendance data for specific month from the main API response
    const filterAttendanceForMonth = useCallback((month, year) => {
        if (!empDashboardData?.attendance_detail?.attendance) {
            setCalendarData((prevState) => ({
                ...prevState,
                attendanceAttr: []
            }));
            return;
        }

        const allAttendance = empDashboardData.attendance_detail.attendance;
        
        const filteredAttendance = allAttendance.filter(att => {
            const date = new Date(att.date * 1000); // Convert timestamp to date
            const attMonth = date.getMonth() + 1;
            const attYear = date.getFullYear();
            return attMonth === month && attYear === year;
        });
        setCalendarData((prevState) => ({
            ...prevState,
            attendanceAttr: filteredAttendance
        }));
    }, [empDashboardData?.attendance_detail?.attendance]);

    useEffect(()=>{
        if(empDashboardData?.attendance_detail?.attendance && empDashboardData.attendance_detail.attendance.length > 0) {
            const targetMonth = calendarData.month.value; // Current selected month
            const targetYear = calendarData.year.value; // Current selected year
            filterAttendanceForMonth(targetMonth, targetYear);
        }
    },[empDashboardData, calendarData.month.value, calendarData.year.value, filterAttendanceForMonth])

    const handleNextMonth = () => {
        const currentMonth = calendarData.month.value - 1; // Month index (0-11)
        const currentYear = calendarData.year.value;
        
        // Create a new Date object to handle month/year calculation
        const nextMonthDate = new Date(currentYear, currentMonth + 1); // Move to next month
        
        const newMonth = nextMonthDate.getMonth(); // Get the next month index (0-11)
        const newYear = nextMonthDate.getFullYear(); // Get the updated year if necessary

        // Get the updated month object (assuming `getAllMonths()` is the function that returns month info)
        const updatedMonth = months.find((m) => m.id === newMonth + 1); // +1 to make it 1-based (1 for January)

        setCalendarData((prevState) => ({
            ...prevState,
            month: { value: newMonth + 1, label: updatedMonth.title }, // Update month (1-based index)
            year: { value: newYear, label: newYear }, // Update year if necessary
            daysArray:generateDays(newYear, newMonth)
        }));
    };

    const handlePreviousMonth = () => {
        const currentMonth = calendarData.month.value - 1; // Month index (0-11)
        const currentYear = calendarData.year.value;

        // Create a new Date object to handle month/year calculation
        const prevMonthDate = new Date(currentYear, currentMonth - 1); // Move to previous month
        
        const newMonth = prevMonthDate.getMonth(); // Get the previous month index (0-11)
        const newYear = prevMonthDate.getFullYear(); // Get the updated year if necessary

        // Get the updated month object (assuming `getAllMonths()` is the function that returns month info)
        const updatedMonth = months.find((m) => m.id === newMonth + 1); // +1 to make it 1-based (1 for January)
        setCalendarData((prevState) => ({
            ...prevState,
            month: { value: newMonth + 1, label: updatedMonth.title }, // Update month (1-based index)
            year: { value: newYear, label: newYear }, // Update year if necessary
            daysArray:generateDays(newYear, newMonth)
        }));
    };

    const getAttendanceLabel = (day, month, year) => {
        const dateString = `${String(day).padStart(2, "0")}-${String(
            month + 1
        ).padStart(2, "0")}-${year}`;
        
        const attendance = calendarData?.attendanceAttr?.find(
            (att) => att.date_string === dateString
        );
    
        return attendance ? attendance.att_label : null;
    };

    const getBackgroundColor = (attLabel) => {
        const colorData = attendanceColorData.find(
            (data) => data.att === attLabel
        );

        return colorData ? colorData.color : null;
    };

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

    const getExtraAttribute =(day, month, year, extAttribute)=>{
        const dateString = `${String(day).padStart(2, "0")}-${String(
            month + 1
        ).padStart(2, "0")}-${year}`; // Use passed month and year
        const attendance = calendarData?.attendanceAttr?.find(
            (att) => att.date_string === dateString
        );
        return attendance ? attendance[extAttribute] : null;
    }

    const handleSingleDayDate =(day, month, year)=>{
        const dateString = `${String(day).padStart(2, "0")}-${String(
            month + 1
        ).padStart(2, "0")}-${year}`; // Use passed month and year
        const attendance = calendarData?.attendanceAttr?.find(
            (att) => att.date_string === dateString
        );

        // Create a proper date object even when there's no attendance data
        const dateObj = new Date(year, month, day);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // If attendance exists, use it; otherwise create a basic date object
        const dataToPass = attendance || {
            calendar_date: formattedDate,
            date_string: dateString,
            att_label: null,
            extra: "No attendance data available"
        };

        gettingSingleData(dataToPass)
    }

    const [annualRemLeaves, setAnnulaRemLeaves] = useState({
        show:false, 
        data:[]
    })

    const handleAnnualRemLeave = async(attendanceData)=>{
        setAnnulaRemLeaves({
            show: true,
            data: attendanceData
        });
    }

    const toggelAnnualLeaves = ()=>{
        setAnnulaRemLeaves((prevState)=>({
            ...prevState, 
            data:[],
            show:false
        }))
    }

    const [singleAttendance, setSingleAttendance] = useState({
        show:false, 
        data:{}
    })

    const gettingSingleData = (data)=>{
        setSingleAttendance((prevState)=>({
            ...prevState,
            show:true,
            data:data
        }))
    }

    const toggleSingleAttendance = ()=>{
        setSingleAttendance((prevState)=>({
            ...prevState,
            show:false, 
            data:{}
        }))
    }

    return {
        handleNextMonth,handlePreviousMonth,
        getBackgroundColor,getAttendanceLabel,
        calendarData,
        getExtraAttribute,
        handleSingleDayDate,
        handleAnnualRemLeave,
        annualRemLeaves,
        toggelAnnualLeaves,
        singleAttendance,
        toggleSingleAttendance,
        filterAttendanceForMonth,
        generateDays
    }
}

export default useEmpDashboard
export { useEmpDashboardFunctions }