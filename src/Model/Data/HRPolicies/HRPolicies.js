import { axiosInstance, axiosInstancecoremodule } from "../../base"


const hrPoliciesApi = {
    gettingAllPolicies: function (branch_id, status, page_id = 1, search = '') {
        const params = {};

        // Always include page parameter
        if (page_id && page_id > 0) {
            params.page = page_id;
        }

        // Only include branch_id if it's a valid ID (not null, undefined, or 0)
        if (branch_id && branch_id !== 0 && branch_id !== null && branch_id !== undefined) {
            params.branch_id = branch_id;
        }

        // Always include status
        if (status !== undefined && status !== '') {
            params.status = status;
        }

        // Include search if provided
        if (search && search.trim() !== '') {
            params.policy_name = search.trim();
        }

        // console.log('API params:', params);

        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/hr-api/get_hr_policy`,
            params: params
        })
    },

    // New function for load more - only sends page parameter
    getMorePolicies: function (page) {
        ////console.log('Load More API - page only:', { page });

        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/hr-api/get_hr_policy`,
            params: { page: page }
        })
    },

    getAllPoliciesDropdown: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/hr-api/get_all_policies`,
            params: {
                id: data
            }
        })
    },

    getPolicyUsers: function (id) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/hr-api/policy_used/${id}`,

        })
    },

    ///api/v1/hr-api/get_hr_policy_Single/5479

    getPolicyView: function (data) {
        // console.log("lllllllll", data.id)
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/hr-api/get_hr_policy_detail/${data.id}`,
            // params: {
            // //     // operation: 'view_policy',
            //     ...data
            // }
        })
    },

    statusChangeHrPolicy: function (statusData) {
        return axiosInstancecoremodule.request({
            method: 'DELETE',
            url: `/api/v1/hr-api/delate_hr_policy/${statusData.id}`,
            data: {
                operation: 'change_policy_status',
                ...statusData
            }

        })
    },

    updatePolicy: function (data) {
        const payload = {
            policy_name: data.name
        }

        // Add leave_group_id if provided
        if (data.leave_group_id !== undefined) {
            payload.leave_group_id = data.leave_group_id
        }

        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/hr-api/update_hrPolicy/${data.id}`,
            data: payload
        })
    },
    swapPolicy: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/hr-api/policy-swaps`,
            data: {
                // operation: 'swap_policies',
                ...data
            }

        })
    },
    getPoliciesforSwap: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/hr-api/get_policy_to_swap`,
            // params: {
            //     operation: 'get_org_policies',
            // }



        })

    },
    setHrPolicy: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/hr-api`,
            data: {
                ...data,
                // operation: 'set_hr_policy',
            }
        })
    },
    getSinglePolicyForEdit: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `api/v1/hr-api/get_hr_policy_Single/${data.id}`,
            // params: {
            //     data:data,
            //     operation: 'hrPolicyEdit',
            // }
        })
    },
    getSinglePolicyForCopy: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `processors/get_data.php`,
            data: {
                ...data,
                operation: 'get_policy_data',
            }
        })
    },
    getHeaderData: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/dashboard/get_machiene_data`,
            data: {
                ...data,
                operation: 'get_header_data',
            }
        })
    },

    getTrackPolicy: function (employee_id) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/hr-api/track_policy`,
            params: {
                employee_id: employee_id
            }
        })
    }



}

export default hrPoliciesApi