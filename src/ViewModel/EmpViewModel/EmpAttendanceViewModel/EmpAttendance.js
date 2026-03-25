import empAttendanceApi from "../../../Model/Data/EmpData/EmpAttendance/EmpAttendance"

const empAttendanceViewModel = (set, get) =>({

    empAttendancData:[],


    gettingEmpAttendanceData :async(data)=>{
        try{
            const response = await empAttendanceApi.getEmpAttendanceData(data)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === "SUCCESS"){
                const dbData = responseData.DB_DATA

                const attendanceData = dbData.attendance_data?.DB_DATA?.attendance || [];
                const todayDate = new Date().getDate();
                const presentMonth = new Date().getMonth();
                const presentYear = new Date().getFullYear();
                const filteredAttendance = attendanceData?.filter((ele) => {
                    const attendanceDate = new Date(ele.date * 1000); // convert seconds → JS Date
                    const attendanceDay = attendanceDate.getDate();
                    if(attendanceDate.getMonth() === presentMonth && attendanceDate.getFullYear() === presentYear){
                        return attendanceDay <= todayDate;
                    }else {
                        return attendanceDay;
                    }
                }) || [];

                const lastAttendance = attendanceData[attendanceData.length - 1] || null;
                let workingStatus = null;
                if(lastAttendance && lastAttendance.att_label === "N"){
                    workingStatus = attendanceData[attendanceData.length - 2] || null;
                }else{
                    workingStatus = lastAttendance || null;
                }
                let workingStatusLabel = "Unknown";
                let isEvenOrOdd = '';
                const loginTime = workingStatus?.timings || [];
                for(let i= 0; i< loginTime.length; i++){
                    if(loginTime[i] % 2 === 0){
                        isEvenOrOdd = 'Even';
                    }else{
                        isEvenOrOdd = 'Odd';
                    }
                }
                const login_time = loginTime[loginTime.length - 1] || 0;
                let formattedTime = '--';
                if(login_time && login_time > 0){
                    const date = new Date(login_time * 1000);
                    // Format time: HH:MM AM/PM
                    formattedTime = date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                    });
                }

                if (workingStatus?.att_label === "P" && isEvenOrOdd === 'Odd') {
                    workingStatusLabel = "Duty Time";
                } else if (workingStatus?.att_label === "A") {
                    workingStatusLabel = "Absent";
                } else {
                    workingStatusLabel = "Off";
                };

                //working policy
                const workingPolicy = dbData.attendance_data?.DB_DATA?.last_policy?.perDayTimings || {};

                const todayDay = new Date().getDay();
                let day = '';
                let dutyTimings = null;
                if(todayDay === 1){
                    day = 'Mon';
                }else if(todayDay === 2){
                    day = 'Tue';
                }else if(todayDay === 3){
                    day = 'Wed';
                }else if(todayDay === 4){
                    day = 'Thu';
                }else if(todayDay === 5){
                    day = 'Fri';
                }else if(todayDay === 6){
                    day = 'Sat';
                }

                if(day && day in workingPolicy){
                    dutyTimings = workingPolicy[day];
                }
                function convertToAmPm(time) {
                    // time = "08:00"
                    if(!time || time === null || time === undefined){
                        return '--';
                    }
                    let [hour, minute] = time.split(":");
                    hour = Number(hour);
                  
                    const ampm = hour >= 12 ? "PM" : "AM";
                    hour = hour % 12 || 12; // convert 0 → 12
                  
                    return `${hour}:${minute} ${ampm}`;
                }

                const start = convertToAmPm(dutyTimings?.starting_time);
                const end = convertToAmPm(dutyTimings?.closing_time);
                
                // Transform the new API response to match existing structure
                const transformedData = {
                    // personal_info: {
                    //     name: dbData.employee_data.name,
                    //     emp_id: dbData.employee_data.emp_id,
                    //     dp: dbData.employee_data.dp,
                    //     branch_address: dbData.employee_data.branch?.branch_name,
                    //     email: dbData.employee_data.work_email,
                    //     department: dbData.employee_data.department?.name,
                    //     designation: dbData.employee_data.designationObj?.title,
                    //     working_from: new Date(dbData.employee_data.join_date * 1000).toLocaleDateString()
                    // },
                    personal_info: {
                        name: dbData.employee_data?.name || '',
                        emp_id: dbData.employee_data?.id || '',
                        dp: dbData.employee_data?.dp || '',
                        permanent_address: dbData.employee_data?.permanent_address || '',
                        // branch: dbData.employee_data.branch?.branch_name,
                        email: dbData.employee_data?.work_email || dbData.employee_data?.email || '',
                        department: dbData.employee_data?.department?.name || '',
                        designation: dbData.employee_data?.designationObj?.title || '',
                        // phone: dbData.employee_data?.contacts?.[0].contact,
                        working_from: dbData.employee_data?.join_date ? new Date(dbData.employee_data.join_date * 1000).toLocaleDateString() : ''
                    },
                    attendance_detail: {
                        total: dbData.attendance_data?.DB_DATA?.total || 0, // Convert to seconds
                        earned: dbData.attendance_data?.DB_DATA?.earned_secs || 0, // Convert to seconds
                        present_days: dbData.attendance_data?.DB_DATA?.present_days || 0, // Approximate present days
                        total_days: (dbData.attendance_data?.DB_DATA?.present_days || 0) + (dbData.attendance_data?.DB_DATA?.absent_days || 0), // Approximate total days
                        attendance: filteredAttendance,
                        last_policy: dbData.attendance_data?.DB_DATA?.last_policy || null,
                        duty_start_timings: start || '--',
                        duty_end_timings: end || '--',
                        durations: dbData.attendance_data?.DB_DATA?.last_policy ? 
                            `${dbData.attendance_data.DB_DATA.last_policy.working_hours || 0}.${Math.round((dbData.attendance_data.DB_DATA.last_policy.working_min || 0) / 60 * 10)}` : '--',
                        login_time: formattedTime || '--'
                    },
                    attendance: {
                        absentees: dbData.attendance_data?.DB_DATA?.absentees || 0,
                        allowed_leaves: dbData.attendance_data?.DB_DATA?.allowed_leaves || 0,
                        leave_availed: dbData.attendance_data?.DB_DATA?.leave_availed || 0,
                        used_late_min: dbData.attendance_data?.DB_DATA?.used_late_min || 0,
                        monthly_allowed_leaves: dbData.attendance_data?.DB_DATA?.monthly_allowed_leaves || 0,
                        allowed_late_min: dbData.attendance_data?.DB_DATA?.last_policy?.late_time_in_minutes || 0
                    }
                }
                
                
                set({empAttendancData: transformedData})
            }
        }catch(err){
            console.log(err)
        }
    },


    settingNewAttendanceData:(data)=>{
        set((state) => ({
            empAttendancData: {
                ...state.empAttendancData,
                attendance_detail:{
                    ...state.empAttendancData.attendance_detail, 
                    earned: data.attendance_detail?.earned,
                    total: data.attendance_detail?.total,
                    present_days: data.attendance_detail?.present_days,
                    total_days: data.attendance_detail?.total_days,
                    attendance: data.attendance_detail?.attendance,
                }
            }
        }));
    }

})

export default empAttendanceViewModel