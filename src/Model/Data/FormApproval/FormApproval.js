import axiosInstance, { Inboxinstancemodeule, approvel_flow } from "../../base"

const formApprovalApi = {
    // Custom Forms APIs (Node.js)
    getCustomFormList: function () {
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: '/api/v1/forms/Forms/get_dynamic_Form',
        })
    },

    // Approval Flow APIs (Node.js)
    getApprovalFlowList: function () {
        return Inboxinstancemodeule.request({
            method: 'POST',
            url: '/api/v1/custom-forms/get-data',
            data: {
                operation: 'get_approval_flows'
            }
        })
    },

    getViewApprovalFlow: function (template_id) {
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/approval-flow/view-approval-flow/${template_id}`
        })
    },

    // Create Approval Flow (Node.js)
    createApprovalFlow: function (data) {
        return Inboxinstancemodeule.request({
            method: 'POST',
            url: '/api/v1/custom-forms/set-data',
            data: {
                operation: 'set_approval_flow',
                ...data
            }
        })
    },

    deleteApprovalFlow: function (data) {
        return Inboxinstancemodeule.request({
            method: 'POST',
            url: '/api/v1/custom-forms/set-data',
            data: {
                operation: 'delete_approval_template',
                ...data
            }
        })
    },

    approvalFlowList: function (data) {
        return Inboxinstancemodeule.request({
            method: 'POST',
            url: '/api/v1/custom-forms/get-data',
            data: {
                operation: 'get_approval_for_this_form',
                ...data
            }
        })
    },

    assignApprovalFlowTemplate: function (data) {
        return approvel_flow.request({
            method: 'POST',
            url: '/api/v1/approval-flow/assign-approval-flow',
            data: {
                dynamic_form_id: data.dynamic_form_id,
                approval_flow_id: data.approval_flow_id
            }
        })
    },






}

export default formApprovalApi
