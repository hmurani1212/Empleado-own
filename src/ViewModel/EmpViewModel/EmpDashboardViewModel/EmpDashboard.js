import empDashboardApi from "../../../Model/Data/EmpData/EmpDashboard/EmpDashboard"

const empDashboardViewModel = (set, get) => ({

    empDashboardData: [],

    gettingEmpDashboardData: async (month, year) => {
        try {
            const response = await empDashboardApi.getEmpDashboardData(month, year)
            const responseData = response.data
            // console.log('responseData', response);
            if (responseData.STATUS === "SUCCESS") {
                const dbData = responseData.DB_DATA;
                // console.log('dbData', dbData);
                const attendanceData = dbData.attendance_data.DB_DATA.attendance || [];
                const lastAttendance = attendanceData[attendanceData.length - 2] || null;
                // console.log('lastAttendance', lastAttendance)
                let workingStatus = null;
                const todayDate = new Date();
                const dateString = todayDate.toLocaleDateString('en-GB').replace(/\//g, '-');
                workingStatus = attendanceData.find(attendance => attendance.date_string === dateString) || null;
                // if (lastAttendance && lastAttendance.att_label === "N") {
                //     workingStatus = attendanceData[attendanceData.length - 2] || null;
                // } else {
                //     workingStatus = lastAttendance || null;
                // }

                let workingStatusLabel = "Unknown";
                const loginTime = workingStatus?.timings || [];
                let count = 0;
                let isEvenOrOdd = '';
                for (let i = 0; i < loginTime.length; i++) {
                    count++;
                }
                if (count % 2 === 0) {
                    isEvenOrOdd = 'Even';
                } else {
                    isEvenOrOdd = 'Odd';
                }
                const login_time = loginTime[loginTime.length - 1] || 0;
                let formattedTime = '--';
                if (login_time && login_time > 0) {
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
                // const workingPolicy = dbData.attendance_data.DB_DATA.last_policy?.perDayTimings || {};

                // const todayDay = new Date().getDay();
                // let day = '';
                // console.log('todayDay', todayDay);
                // let dutyTimings = null;
                // if(todayDay === 1){
                //     day = 'Mon';
                // }else if(todayDay === 2){
                //     day = 'Tue';
                // }else if(todayDay === 3){
                //     day = 'Wed';
                // }else if(todayDay === 4){
                //     day = 'Thu';
                // }else if(todayDay === 5){
                //     day = 'Fri';
                // }else if(todayDay === 6){
                //     day = 'Sat';
                // }

                // if(day && day in workingPolicy){
                //     dutyTimings = workingPolicy[day];
                // }

                function convertToAmPm(time) {
                    // time = "08:00"
                    if (!time || time === null || time === undefined) {
                        return '';
                    }
                    let [hour, minute] = time.split(":");
                    hour = Number(hour);

                    const ampm = hour >= 12 ? "PM" : "AM";
                    hour = hour % 12 || 12; // convert 0 → 12

                    return `${hour}:${minute} ${ampm}`;
                }

                const start = dbData.attendance_data.DB_DATA.last_policy?.starting_time;
                const end = dbData.attendance_data.DB_DATA.last_policy?.closing_time;

                const usedLateMin = dbData.attendance_data.DB_DATA.late_coming_days || [];
                let totalUsedLateMin = 0;
                let totalLateMinutes = 0;
                for (let i = 0; i < usedLateMin.length; i++) {
                    totalUsedLateMin += usedLateMin[i].adjusted_late_min || 0;
                    totalLateMinutes += usedLateMin[i].late_minutes || 0;
                };

                // const allowedLateMin = dbData.attendance_data.DB_DATA.last_policy?.late_time_in_minutes || 0;
                // let adjusted_late_min = 0;
                // let late_minutes = 0;
                // late_minutes += dbData?.attendance_data?.DB_DATA?.late_coming_days?.late_minutes || 0;
                // adjusted_late_min += dbData?.attendance_data?.DB_DATA?.late_coming_days?.adjusted_late_min || 0;
                // console.log('what is the adjusted_late_min ?????????????', adjusted_late_min, late_minutes)
               //// console.log("calculatedUsedMin", calculatedUsedMin);

                const leaveBalance = dbData.attendance_data.DB_DATA.leave_balance || [];
                let availed = 0;
                let leaves = 0;
                for (let i = 0; i < leaveBalance.length; i++) {
                    availed += leaveBalance[i].Availed || 0;
                    leaves += leaveBalance[i].Total || 0;
                };

                // logic that compare attendance date with late coming days date and get the data acoording to it
                const formatTimestampToDMY = (timestamp) => {
                    const date = new Date(timestamp * 1000); // seconds → ms
                    const day = String(date.getUTCDate()).padStart(2, '0');
                    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                    const year = date.getUTCFullYear();
                    return `${day}-${month}-${year}`;
                };

                const lateComingDays = dbData.attendance_data.DB_DATA.late_coming_days || [];
                const lateComingDaysData = lateComingDays.filter(
                    day => day.late_minutes > 0
                );

                // console.log('attedance history data', attendanceData)

                const matchedAttendance = attendanceData.reduce((acc, attendance) => {
                    const attendanceDate = attendance.date_string;
                    const lateInfo = lateComingDaysData.find(
                      late => late.date === attendanceDate
                    );
                  
                    if (lateInfo) {
                      acc.push({
                        ...attendance, // from attendanceData
                        ...lateInfo,   // from lateComingDaysData
                        isLate: true
                      });
                    }
                  
                    return acc;
                  }, []);

                const transformedData = {
                    section1: {
                        name: dbData?.employee_data?.name || '',
                        emp_id: dbData?.employee_data?.id || '',
                        dp: dbData?.employee_data?.dp || '',
                        permanent_address: dbData?.employee_data?.permanent_address || '',
                        branch: dbData?.employee_data?.branch?.branch_name || '',
                        email: dbData?.employee_data?.work_email || dbData?.employee_data?.email || '',
                        department: dbData?.employee_data?.department?.name || '',
                        designation: dbData?.employee_data?.designationObj?.title || '',
                        phone: dbData?.employee_data?.contacts?.[1]?.contact || '',
                        working_from: new Date(dbData?.employee_data?.join_date * 1000).toLocaleDateString() || '',
                        join_date: dbData?.employee_data?.join_date || 0,
                        mobile_attendance: dbData?.employee_data?.mobile_attendance,
                        web_attendance_status: dbData?.employee_data?.web_attendance_status,
                        designation_name: dbData?.employee_data?.designation_name|| '',
                        dob: dbData?.employee_data?.dob || '',
                    },
                    section2: {
                        working_status: workingStatusLabel || '',
                        login_time: formattedTime || '--',
                        duty_timings: (start && end) ? `${start} - ${end}` : '--',
                        is_even_or_odd: isEvenOrOdd || ''
                    },
                    attendance_detail: {
                        total: dbData?.attendance_data?.DB_DATA?.total || 0,
                        earned: dbData?.attendance_data?.DB_DATA?.earned_secs || 0,
                        attendance: dbData?.attendance_data?.DB_DATA?.attendance || [],
                        overtime_seconds: dbData?.attendance_data?.DB_DATA?.overtime_seconds || 0
                    },
                    attendance: {
                        absentees: dbData?.attendance_data?.DB_DATA?.absent_days || 0,
                        allowed_leaves: dbData?.attendance_data?.DB_DATA?.last_policy?.allowed_offs || 0,
                        availed: availed || 0,
                        leaves: leaves || 0,
                        total_used_late_min: totalUsedLateMin || 0,
                        total_late_minutes: totalLateMinutes || 0,
                        allowed_late_min: dbData?.attendance_data?.DB_DATA?.last_policy?.late_time_in_minutes || 0,
                        leave_balance: leaveBalance || 0,
                        monthly_allowed_leaves: dbData?.attendance_data?.DB_DATA?.monthly_allowed_leaves || 0,
                        holidays: dbData?.attendance_data?.DB_DATA?.holidays || 0,
                        presents: dbData?.attendance_data?.DB_DATA?.present_days || 0,
                    },
                    view_policy: dbData?.attendance_data?.DB_DATA?.last_policy || null,
                    leave_balance: leaveBalance || [],
                    attendance_history: matchedAttendance || [],
                    // leave_balance: {
                    //     availed: dbData.attendance_data.data.leave_availed,
                    //     total_leaves: dbData.attendance_data.data.allowed_leaves
                    // },
                    reminders: dbData.reminders ?? responseData.reminders ?? []
                }
                // console.log('transformedData', transformedData.section2)

                set({ empDashboardData: transformedData })
            }
        } catch (err) {
            console.log(err)
        }
    },
    adjustNewData: (data) => {
        set((state) => ({
            empDashboardData: {
                ...state.empDashboardData,
                leave_balance: data.leave_balance,
                attendance: {
                    ...state.empDashboardData.attendance,
                    used_late_min: data.used_late_min,
                    allowed_late_min: data.allowed_late_min,
                    absentees: data.absentees,
                    allowed_leaves: data.allowed_leaves
                },
                attendance_detail: {
                    ...state.empDashboardData.attendance_detail,
                    attendance: data.attendance
                }
            }
        }));
    }

})



export default empDashboardViewModel