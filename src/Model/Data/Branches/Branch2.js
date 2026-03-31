import {axiosInstancecoremodule} from "../../base";


const branch2Api = {
    getBranches: function (params = {}) {
        const { text, ...rest } = params
        const merged = {
            ...rest,
            page: params.page || 1,
            limit: params.limit || 10
        }
        const q = text != null ? String(text).trim() : ''
        if (q !== '') {
            merged.text = q
        }
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/branches/get_branches',
            params: merged,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
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