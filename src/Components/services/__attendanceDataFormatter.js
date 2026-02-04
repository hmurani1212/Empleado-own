/**
 * Utility functions for formatting attendance data
 */

/**
 * Convert seconds to hours and minutes format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "8h 30m")
 */
export const secondsToHoursMinutes = (seconds) => {
    if (!seconds || seconds === 0) return '0h 0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
};

/**
 * Convert seconds to decimal hours
 * @param {number} seconds - Time in seconds
 * @returns {number} Hours as decimal (e.g., 8.5 for 8h 30m)
 */
export const secondsToDecimalHours = (seconds) => {
    if (!seconds || seconds === 0) return 0;
    return (seconds / 3600).toFixed(2);
};

/**
 * Format attendance data from API response
 * @param {Object} apiResponse - Raw API response
 * @returns {Object} Formatted attendance data
 */
export const formatAttendanceData = (apiResponse) => {
    if (!apiResponse || !apiResponse.data) {
        return {
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
        };
    }

    // Handle nested data structure - the actual data is in apiResponse.data.data
    const data = apiResponse.data.data || apiResponse.data;
    
    // Convert hours to seconds for consistency
    const expectedSeconds = data.expected_hours * 3600;
    const earnedSeconds = data.completed_hours * 3600;
    const overtimeSeconds = data.over_time_in_second || 0;

    // Calculate percentages
    const percentage = data.expected_hours > 0 ? 
        ((data.completed_hours / data.expected_hours) * 100).toFixed(2) : '0.00';
    
    const otPercentage = data.expected_hours > 0 ? 
        ((data.over_time / data.expected_hours) * 100).toFixed(2) : '0.00';

    return {
        total: expectedSeconds,
        earned: earnedSeconds,
        overtime: overtimeSeconds,
        percentage,
        ot_percentage: otPercentage,
        attendance: data.attendance || [],
        summary: {
            expectedHours: data.expected_hours || 0,
            completedHours: data.completed_hours || 0,
            overtimeHours: data.over_time || 0,
            lateComings: data.late_comings || 0,
            absentees: data.absentees || 0,
            holidays: data.holidays || 0,
            allowedLeaves: data.allowed_leaves || 0,
            leaveAvailed: data.leave_availed || 0
        }
    };
};

/**
 * Format individual attendance record
 * @param {Object} record - Individual attendance record
 * @returns {Object} Formatted record
 */
export const formatAttendanceRecord = (record) => {
    if (!record) return null;

    return {
        ...record,
        earnedFormatted: secondsToHoursMinutes(record.earned),
        expectedFormatted: secondsToHoursMinutes(record.expected),
        overtimeFormatted: secondsToHoursMinutes(record.overtime),
        inTime: record.timings && record.timings[0] ? 
            new Date(record.timings[0] * 1000).toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : '',
        outTime: record.timings && record.timings[1] ? 
            new Date(record.timings[1] * 1000).toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : ''
    };
};

/**
 * Get attendance status color
 * @param {string} status - Attendance status (P, A, H, etc.)
 * @returns {string} CSS color class
 */
export const getAttendanceStatusColor = (status) => {
    const statusColors = {
        'P': 'bg-green-100 text-green-800', // Present
        'A': 'bg-red-100 text-red-800',     // Absent
        'H': 'bg-blue-100 text-blue-800',   // Holiday
        'L': 'bg-yellow-100 text-yellow-800', // Leave
        'WO': 'bg-gray-100 text-gray-800',  // Week Off
        'HD': 'bg-purple-100 text-purple-800' // Half Day
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get attendance status text
 * @param {string} status - Attendance status code
 * @returns {string} Human readable status
 */
export const getAttendanceStatusText = (status) => {
    const statusTexts = {
        'P': 'Present',
        'A': 'Absent',
        'H': 'Holiday',
        'L': 'Leave',
        'WO': 'Week Off',
        'HD': 'Half Day'
    };
    
    return statusTexts[status] || 'Unknown';
};
