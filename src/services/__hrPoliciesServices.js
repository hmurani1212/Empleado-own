export default function formatTime(timeStr) {
    // Handle undefined, null, or empty string
    if (!timeStr || typeof timeStr !== 'string') {
        return '--:-- --';
    }
    
    const [hours, minutes] = timeStr.split(":");
    let formattedTime = "";
    
    // Handle invalid time format
    if (!hours || !minutes) {
        return '--:-- --';
    }
    
    let hoursInt = parseInt(hours);
    const amPm = hoursInt < 12 ? "AM" : "PM";

    if (hoursInt === 0) {
        formattedTime = `12:${minutes}`;
    } else if (hoursInt > 12) {
        hoursInt -= 12;
        formattedTime = `${hoursInt}:${minutes}`;
    } else {
        formattedTime = `${hoursInt}:${minutes}`;
    }

    return `${formattedTime} ${amPm}`;
}




export const generationTypeData  = [
    {id:1, title: 'Time Base'},
    {id:2, title: 'Attendance Base'},
    {id:3, title:'Hourly Base' }
]

export const MonthSelection = [
    {id:1, title: 'Current', value:'current'},
    {id:2, title: 'Previous', value:'prev'},
]

export const days = Array.from({ length: 28 }, (_, i) => i + 1);

export const shortDays = [1, 2, 3, 4];


export const forceTimeOutHrs = [
    {id: 0, title: '1 Hour'},
    {id: 1, title: '2 Hours'},
    {id: 2, title: '3 Hours'},
    {id: 3, title: '4 Hours'},
    {id: 4, title: '5 Hours'},
    {id: 5, title: '6 Hours'},
    {id: 6, title: '7 Hours'},
    {id: 7, title: '8 Hours'},
    {id: 8, title: '9 Hours'},
    {id: 9, title: '10 Hours'},
    {id: 10, title: '11 Hours'},
    {id: 11, title: '12 Hours'}
]


export const timeOutPlicy = [
    {id:1, title: 'Absent', value:0},
    {id:2, title: 'Present', value:1},
    {id:3, title: 'Half Day', value:2},
    {id:4, title: 'One Hour', value:3}
]

export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


export const overTimeCounter = [
    {id:1, title:'Paid', value:1},
    {id:2, title:'Unpaid', value:0},
]


export const overTimeRate = [
    {id:1, title:'Fixed Rate/Hour', value:0},
    {id:2, title:'Equal Salary/Hour', value:1},
    {id:3, title:'Salary/Hour Multiply X', value:2},
    {id:4, title:'Equal Salary/Day', value:4},
]


// 0 for unpaid , 1 for Actual Salary/hour , 2 for Fixed rate/hour , 3 for Fixed rate/day , 4 for Salary/hour * X , 5 for Salary/day (full salary)
export const weekendoverTimeRate = [
    {id:1, title:'Unpaid', value:0},
    {id:2, title:'Equal Salary/Hour', value:1},
    {id:3, title:'Fixed Rate/Hour', value:2},
    {id:4, title:'Fixed Rate/Day', value:3},
    {id:5, title:'Salary/Hour Multiply X', value:4},
    {id:6, title:'Equal Salary/Day', value:5},
]



export const earlyArivalData = [
    {id:1, title:'Actual Time'},
    {id:2, title:'Shift Time'},
]

/**
 * Inactive / expired policy detection — aligned with list view and API variants:
 * status may be number 0, string "0", or "EXPIRED" (see PoliciesList).
 */
export function isHrPolicyInactive(status) {
    if (status === null || status === undefined) return false
    if (status === 0 || status === '0') return true
    if (typeof status === 'string') {
        const u = status.trim().toUpperCase()
        return u === 'EXPIRED' || u === 'INACTIVE'
    }
    return false
}