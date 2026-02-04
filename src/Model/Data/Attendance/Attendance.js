import { axiosInstance, attencedenceInstence } from "../../base"

const attendanceApi = {
    getMonthLateComers: function (data) {
        return attencedenceInstence.request({
            method: 'GET',
            url: '/api/attendance/late-comers',
            data: {
                operation: 'late_comer_employees',
                ...data
            }
        })
    },

    getAttArchive: function (data) {
        return attencedenceInstence.request({
            method: 'GET',
            url: '/api/attendance/excel-pdf-reports',
            // data: {
            //     operation: '/api/attendance/excel-pdf-reports',
            //     ...data
            // }
        })
    },

    allBranchesAttendance: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: 'processors/get_data.php',
            data: {
                operation: 'branch_list',
                ...data
            }

        })
    },


    dailyAttAdjust: function (data) {
        return attencedenceInstence.request({
            method: 'POST',
            url: '/api/attendance/daily-att-adjust',
            data: data,
            // data: {
            //     operation: 'branch_list',
            //     ...data
            // }

        })
    },

    getSubDeptAtt: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: 'processors/get_data.php',
            data: {
                operation: 'getSubDept',
                ...data
            }

        })
    },

    getBranchWiseAtt: function (data) {
        return attencedenceInstence.request({
            method: 'GET',
            url: `/api/attendance/department-wise?branch=${data.branch}&month=${data.month}&year=${data.year}&deptt_id=${data.deptt_id}`,
            data: {
                operation: 'get_depttwise_att',
                ...data
            }

        })
    },

    getEmpSuggestionsAtt: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: 'processors/get_data.php',
            data: {
                operation: 'emp_suggestion_list',
                ...data
            }

        })
    },

    getRawAttLogs: function (data) {
        return attencedenceInstence.request({
            method: 'GET',
            url: `/api/attendance/employee/${data.empId}/raw-log?month=${data.month}&year=${data.year}`,
            data: {
                operation: 'raw_att_logs',
                ...data
            }

        })
    },

    getAdjustRequest: function (data) {
        return attencedenceInstence.request({
            method: 'GET',
            url: '/api/attendance/adjustment-requests',
            params: data
        })
    },

    getIndividualDetail: function (data) {
        return attencedenceInstence.request({
            method: 'POST',
            url: `/api/attendance/individual-attendance`,
            data: data
        })
    },

    settingEditAdj: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: 'custom_forms/api/edit_submitted_form_data.php',
            data: {
                operation: 'Edit_time_adjustment_request',
                ...data
            }
        })
    },

    creatingNewRequest: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: 'custom_forms/api/fetch_custom_form.php',
            data: {
                ...data
            }
        })
    },
    getAttendanceGraph: function (data) {
        return attencedenceInstence.request({
            method: 'GET',
            url: '/api/attendance/attendance-graph-data',
            params: {
                user_id: data?.empId || data?.user_id || data?.emp_id,
                month: data?.month,
                year: data?.year
            }
        })
    },

    setManualAttendance: function (data) {
        return attencedenceInstence.request({
            method: 'POST',
            url: '/api/attendance/set-manual-attendance',
            data: data
        })
    },


      MArkAbsent: function (data) {
        return attencedenceInstence.request({
            method: 'POST',
            url: '/api/attendance/mark-absent',
            data: data
        })
    },

    scheduleReport: function (data) {
        return attencedenceInstence.request({
            method: 'POST',
            url: '/api/attendance/schedule-report',
            data: data
        })
    },
    rawAttendance: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: 'processors/get_data.php',
            data: {
                operation: 'raw_att_logs',
                ...data,
            }
        })
    },

    // Detailed late comers API
    getDetailedLateComers: function (data) {
        return attencedenceInstence.request({
            method: 'GET',
            url: '/api/attendance/detailed-late-comers',
            params: {
                branch_id: data.branch_id,
                dept_id: data.dept_id,
                emp_id: data.emp_id,
                from_date: data.from_date,
                to_date: data.to_date
            }
        })
    },

    MarkAbsent: function (data) {
        return attencedenceInstence.request({
            method: 'POST',
            url: '/api/attendance/mark-absent',
            data: data
        })
    },

    getEmployeeRecentRecords: function (empId) {
        return attencedenceInstence.request({
            method: 'GET',
            url: `/api/attendance/employee/${empId}/recent-records`
        })
    },

    getLiveBiometricDevices: function () {
        return attencedenceInstence.request({
            method: 'GET',
            url: `/api/attendance/live-biometric-devices`
        })
    },

    updateLiveBiometricDevice: function (data) {
        console.log('data of the live biometric device', data)
        return attencedenceInstence.request({
            method: 'PATCH',
            url: `/api/attendance/update-device-name`,
            data: data
        })
    },

}

export default attendanceApi