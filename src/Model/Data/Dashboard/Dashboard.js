import { axiosInstancecoremodule, attencedenceInstence } from "../../base"



const dashboardApi = {
    getMachineData: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/dashboard/get_machiene_data',
            data: {
                ...data
            }
        })
    },

    getEmployeeDashboardData: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/dashboard/dashboard_emp_data',
            // data: {
            //     ...data
            // }
        })
    },
    getGreetingMessage: function (employeeId, oneId) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employee_v3/email/meet_great',
            params: {
                id: employeeId,
                one_id: oneId
            },
            timeout: 30000 // 30 seconds timeout
        })
    },
    getAdminDashboardData: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/dashboard/admin_dashboard',
            params: {
                ...data
            }
        })
    },

    getLateComersData: function (from, upto) {
        return attencedenceInstence.request({
            method: 'GET',
            url: '/api/attendance/today-late-comers',
            params: {
                from: from,
                upto: upto
            }
        })
    },

    // Today's Attendance API
    getTodayAttendanceData: function (date) {
        return attencedenceInstence.request({
            method: 'GET',
            url: '/api/attendance/today-present',
            params: {
                date: date
            }
        })
    }
}

export default dashboardApi