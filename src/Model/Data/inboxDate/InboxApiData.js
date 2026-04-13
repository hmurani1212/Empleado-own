import { Inboxinstancemodeule, traininginstancemodeule, axiosFormDataTransformRequest } from "../../base.js";

const InboxApiData = {
    get_inbox_data: function (page_no = 1, limit = 20) {
        const params = new URLSearchParams();
        if (page_no > 1) params.append('page_no', page_no);
        if (limit) params.append('limit', limit);
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/inbox/main_list_stories${params.toString() ? `?${params.toString()}` : ''}`,
            timeout: 10000 // 10 second timeout
        })
    },
    get_filtered_inbox_data: function (name = '', status = null, read_status = null, page_no = 1, appType = null, limit = 20) {
        const params = new URLSearchParams();
        params.append('page_no', page_no);
        if (limit) params.append('limit', limit);
        if (name) {
            params.append('name', name);
        }
        if (status !== null) {
            params.append('status', status);
        }
        if (read_status !== null) {
            params.append('read_status', read_status);
        }
        if (appType !== null) {
            params.append('app_type', appType);
        }
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/inbox/main_list_stories?${params.toString()}`,
            timeout: 10000 // 10 second timeout
        })
    },
    get_employee_stories: function (org_id, one_id, page_no = 1) {
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/inbox/main_list_stories?org_id=${org_id}&one_id=${one_id}${page_no > 1 ? `&page_no=${page_no}` : ''}`
        })
    },
    get_employee_inbox_data: function (page_no = 1, limit = 20) {
        const params = new URLSearchParams();
        params.append('page_no', page_no);
        if (limit) params.append('limit', limit);
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/inbox/employee_inbox_data?${params.toString()}`,
            timeout: 10000 // 10 second timeout
        })
    },
    get_filtered_employee_inbox_data: function (name = '', status = null, read_status = null, page_no = 1, appType = null, limit = 20) {
        const params = new URLSearchParams();
        params.append('page_no', page_no);
        if (limit) params.append('limit', limit);
        if (name) {
            params.append('name', name);
        }
        if (status !== null) {
            params.append('status', status);
        }
        if (read_status !== null) {
            params.append('read_status', read_status);
        }
        if (appType !== null) {
            params.append('app_type', appType);
        }
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/inbox/employee_inbox_data?${params.toString()}`,
            timeout: 10000 // 10 second timeout
        })
    },
    loadMoreStories: function (nextPageUrl) {
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: nextPageUrl
        })
    },
    getStoryMessages: function (storyId) {
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/inbox/get_story_message/${storyId}`
        })
    },
    sendMessage: function (messageData) {
        return Inboxinstancemodeule.request({
            method: 'POST',
            url: '/api/v1/inbox/send_message',
            data: messageData
        })
    },

    // Upload file to elephant server (using training instance)
    uploadFileToElephant: function (formData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/make_url',
            data: formData,
            transformRequest: [axiosFormDataTransformRequest],
        })
    },
    
    // API endpoint for form details using type_ref ID from inbox
    getFormDetails: function (typeRefId) {
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/forms/${typeRefId}`,
            headers: { 'Content-Type': 'application/json' }
        })
    },

    // Update time adjustment for a submission
    updateAdjustmentTime: function (submissionId, payload) {
        return Inboxinstancemodeule.request({
            method: 'PUT',
            url: `/api/v1/forms/adjustment/${submissionId}/time`,
            data: payload,
            headers: { 'Content-Type': 'application/json' }
        })
    },

    approval_panel: function (data) {
        return Inboxinstancemodeule.request({
            method: 'POST',
            url: '/api/v1/forms/approval_panel/status',
            data: data,
            headers: { 'Content-Type': 'application/json' }
        })
    },

};

export default InboxApiData;
