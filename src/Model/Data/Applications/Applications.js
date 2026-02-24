import axiosInstance, {LeavePlannerinstancemodule, Inboxinstancemodeule, traininginstancemodeule } from "../../base"

const applicationApi = {
    getLeavesGroup: function (data = {}) {
        // Only include parameters that have actual values (not defaults)
        const params = {};
        
        // Handle branch_id - same payload shape as specific branch: branch_id=0 for All Branches, branch_id=<id> otherwise
        if (data.branch !== undefined && data.branch !== null) {
            params.branch_id = data.branch === "0" || data.branch === 0 ? 0 : Number(data.branch);
        }
        // Handle dep_id - only include when a specific department is selected (omit for All Departments)
        if (data.deptt !== undefined && data.deptt !== null && data.deptt !== "0" && data.deptt !== 0) {
            params.dep_id = data.deptt;
        }
        if (data.status && data.status !== "") {
            params.status = data.status;
        }
        if (data.user_id && data.user_id !== "") {
            params.emp_id = data.user_id;
        }
        if (data.search_term && data.search_term !== "") {
            params.search_term = data.search_term;
        }
        if (data.form_label && data.form_label !== "ALL") {
            params.form_label = data.form_label;
        }
        if (data.getall) {
            params.getall = data.getall;
        }
        if (data.last_id && data.last_id !== "") {
            params.last_id = data.last_id;
        }
        if (data.page !== undefined) {
            params.page = data.page;
        }
        if (data.from_date && String(data.from_date).trim() !== '') {
            params.from_date = String(data.from_date).trim();
        }
        if (data.to_date && String(data.to_date).trim() !== '') {
            params.to_date = String(data.to_date).trim();
        }
        
        return Inboxinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/forms/data/org`,
            params: params
        })
    },

    GetSubmitted_App: function () {
        return Inboxinstancemodeule.request({
            method: "GET",
            url: `/api/v1/forms/Forms/get_dynamic_Form`
        })
    },
    SubmitApplications: function (data) {
        return Inboxinstancemodeule.request({
            method: 'POST',
            'url': '/api/v1/forms',
            data: data
        })
    },

    // Upload file to elephant server for applications
    uploadFileToElephant: function (formData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/make_url',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // Get employee defined leaves for leave application
    // For admin side: pass empId
    // For employee side: don't pass empId (will use logged-in employee)
    getEmployeeDefinedLeaves: function (empId = null) {
        const params = {};
        if (empId) {
            params.emp_id = empId;
        }
        return LeavePlannerinstancemodule.request({
            method: 'GET',
            url: `/api/v1/leave-groups/employee-defined-leaves-v2`,
            params: params
        })
    }
}


export default applicationApi