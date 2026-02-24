import axiosInstance, { Inboxinstancemodeule, LeavePlannerinstancemodule, axiosInstancecoremodule } from "../../base"


const leavesPlannerApi = {
    getLeavesGroup: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'GET',
            url: `/api/v1/leave-groups/groups`,
            data: {
                // operation: 'leave_groups',
                ...data
            }
        })
    },

    addLeavesGroup: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'POST',
            url: `/api/v1/leave-groups`,
            data: {
                // operation: 'leave_group',
                ...data
            }
        })
    },

    getViewLeaves: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'GET',
            url: `/api/v1/leave-groups/${data.group_id}/leaves?search`,
            data: {
                // operation: 'leave_group_leaves',
                ...data
            }
        })
    },

    deleteLeaveGroup: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'DELETE',
            url: `/api/v1/leave-groups/${data.dt}`,
            data: {
                // operation: `delete_leave_mgmt`,
                ...data
            }
        })
    },

    deleteSpecificLeave: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'DELETE',
            url: `/api/v1/leave-groups/leaves/${data.dt}`,
            data: {
                // operation: `delete_leave_mgmt`,
                ...data
            }
        })
    },

    addLeaveType: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'POST',
            url: `/api/v1/leave-groups/leaves`,
            data: {
                // operation: `define_leave`,
                ...data
            }
        })
    },

    editGroupLeave: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'POST',
            url: `/api/v1/leave-groups`,
            data: {
                // operation: `update_leavegro_title`,
                ...data
            }
        })
    },

    hrPoliciesList: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/hr-api/get_hr_policy`,
            params: {
                branch_id: data.branch_id === 'all' ? 0 : (data.branch_id ?? 0),
                status: '1',
                removePagination: true
            }
        })
    },

    getLeavesGroupByBranch: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'GET',
            url: `/api/v1/leave-groups/groups`,
            params: {
                branch_id: data.branch_id,
                search: data.search || ''
            }
        })
    },

    getPaidLeavesConfig: function () {
        return LeavePlannerinstancemodule.request({
            method: 'GET',
            url: `/api/v1/leave-groups/config?config_name=PAID_LEAVES`,
            data: {}
        })
    },

    paidToggle: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'POST',
            url: '/api/v1/leave-groups/toggle-paid-leave',
            data: {
                // operation: 'paid_leave_toggle',
                ...data
            }
        })
    },

    getGoogleForm: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `http://172.18.0.34:7511/sub_modules/service_api/geolocations`,
            data: {
                // operation: 'google_holiday_form',
                ...data
            }
        })
    },

    getGoogleHolidays: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'GET',
            url: `/api/v1/holidays/google?branch_id=${data.branch_id}&policy_id=${data.policy_id}&country_id=${data.county_id}&language=${data.language}`,
            data: {
                // operation: 'get_google_holidays',
                ...data
            }
        })
    },

    addBulkHolidays: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'POST',
            url: '/api/v1/leave-groups/holidays-bulk',
            data: {
                // operation: 'set_holiday_bulk',
                ...data
            }
        })
    },
    getLeaveGroupsOptionList: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: 'processors/get_data.php',
            data: {
                operation: 'leave_groups_options_list',
                ...data
            }
        })
    },
    getPublicHoliday: function (data) {
       /// console.log("getPublicHoliday", data);
        const policyId = data.policy_id ?? data.policy ?? 0;
        const branchId = data.branch ?? 0;
        return LeavePlannerinstancemodule.request({
            method: 'GET',
            url: `/api/v1/holidays/calendar/${branchId}/${policyId}`,
            data
        });
    },

    removePublicHoliday: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'DELETE',
            url: `/api/v1/holidays/${data.id}`,
            data: {
                // operation: 'remove_holiday',
                ...data
            }
        })
    },
    addPublicHoliday: function (data) {
        return LeavePlannerinstancemodule.request({
            method: 'POST',
            url: '/api/v1/leave-groups/holidays',
            data: {
                // operation: 'mark_date_as_holiday',
                ...data
            }
        })
    },

    // Get all leave groups for HR Policy form
    getAllLeaveGroups: function () {
        return LeavePlannerinstancemodule.request({
            method: 'GET',
            url: '/api/v1/leave-groups/all'
        })
    },




}

export default leavesPlannerApi