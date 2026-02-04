import { axiosInstancecoremodule } from "../../base"

const remindersApi = {
    addReminder: function(data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employee_v3/add_reminder',
            data: data
        })
    },

    getReminders: function(params = {}) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employee_v3/get_reminders',
            params: params
        })
    },

    updateReminder: function(reminderId, data) {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/employee_v3/update_reminder/${reminderId}`,
            data: data
        })
    },

    deleteReminder: function(reminderId) {
        return axiosInstancecoremodule.request({
            method: 'DELETE',
            url: `/api/v1/employee_v3/delete_reminder/${reminderId}`,
            data: {} // Only sending ID in URL, no body data needed
        })
    },

    updateReminderStatus: function(reminderId) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v3/update_reminder_status/${reminderId}`,
            data: {} // Only sending ID in URL, no body data needed
        })
    }
}

export default remindersApi
