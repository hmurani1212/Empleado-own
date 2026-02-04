import {axiosInstancecoremodule} from "../../base";


const branch2Api = {
    getBranches: function (params) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/branches/get_branches',
            params: {
                ...params,
                page: params.page || 1,
                limit: params.limit || 10
            }
        })
    },


    deleteBranch: function (branchId) {
        return axiosInstancecoremodule.request({
            method: 'DELETE',
            url: `api/v1/branches/delete_branch/${branchId}`,
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
    }

}
export default branch2Api