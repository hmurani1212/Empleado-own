import { axiosInstance, axiosInstancecoremodule } from "../../base"



const branchesApi = {
    getBranches: function (status) {
        return axiosInstance.request({
            method: 'GET',
            url: '/api/v1/branches/get_branches',
            params: status
        })
    },

    createNewBranch: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/branches/create_branch',
            data: {
                // operation:'add_branch',
                ...data
            }
        })
    },

    statusBranch: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: 'processors/set_data.php',
            data: {
                operation: 'change_branch_status',
                ...data
            }
        })
    },

    editBranch: function (editData) {
        // console.log(editData)
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/branches/update_branch`,
            data: {
                // operation:'upd_branch',
                ...editData
            }
        })
    },

    getEditBranch: function (branchID) {
        return axiosInstance.request({
            method: 'GET',
            url: `/api/v1/branches/get_branch/${branchID}`,

        })
    },

    getBranchTimeZone: function (timeZoneData) {
        return axiosInstance.request({
            method: 'POST',
            url: `processors/get_data.php`,
            data: {
                operation: 'get_country_timezone',
                ...timeZoneData
            }

        })
    },
    getPremisis: function (bracnhData) {
        //console.log(bracnhData)
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/promises/${bracnhData.branch_id}/premises`,
            // params : {
            //     operation: '/api/promises/${bracnhData.branch_id}/premises',
            //     ...bracnhData   
            // }

        })
    },
    deletePremisis: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/promises/remove-premises/123`,
            data: {
                operation: 'delete_branch_permises',
                ...data
            }
        })
    },
    addPremisis: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/promises/set-premises`,
            data: {
                // operation: 'setPremises',
                ...data
            }
        })
    },

    getBranchEmployees: function (branchId) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employees/branch/${branchId}`,
        })
    },

    getAdministrativePermissions: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employees/administrative-permission`,
        })
    },

    assignAdministrativePermission: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employees/administrative-permission`,
            data: data
        })
    },

    removeAdministrativePermission: function (data) {
        return axiosInstancecoremodule.request({
            method: 'DELETE',
            url: `/api/v1/employees/administrative-permission`,
            data: data
        })
    },

    resetPremis: function (data) {
        return axiosInstance.request({
            method: 'DELETE',
            url: `processors/set_data.php`,
            data: {
                operation: 'removeBranchPremises',
                ...data
            }
        })
    },

    empSuggestionsBranches: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `processors/get_data.php`,
            data: {
                operation: 'get_branch_admin_list',
                ...data
            }
        })
    },
    assignRole: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `processors/set_data.php`,
            data: {
                operation: 'emp_password',
                ...data
            }
        })
    },
    getBranchEmpAdmin: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `processors/get_data.php`,
            data: {
                operation: 'get_branch_admin_list',
                ...data
            }
        })
    },
    deletBranchEmpAdmin: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `processors/set_data.php`,
            data: {
                operation: 'remove_emp_role',
                ...data
            }
        })
    },
    deletePremisisById: function (premisesId) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/promises/remove-premises/${premisesId}`
        });
    }



}

export default branchesApi