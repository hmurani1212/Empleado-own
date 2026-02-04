import { axiosInstancecoremodule } from "../../base"

const checklistApi = {
    // Get all departments
    getAllDepartments: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/departments`
        })
    },

    // Get all employees
    getAllEmployees: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employees?pages=all`
        })
    },

    // Create checklist
    createChecklist: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/Check_list/set-checklist`,
            data: data
        })
    },

    // Update checklist
    updateChecklist: function (data) {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/Check_list/update_check_list`,
            data: data
        })
    }
}

export default checklistApi
