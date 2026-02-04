import axiosInstance, { Noticesinstancemodule } from "../../base"

const noticesApi = {
    // addNoticeEmpSearch: function (data){
    //     return axiosInstance.request({
    //         method: 'POST',
    //         url: `/processors/get_data.php`,
    //         data: {
    //             operation:`emp_suggestion_list`,
    //             ...data
    //         }
    //     })
    // },

    addNotice : function (data) {
        ///console.log("data", data)
        return Noticesinstancemodule.request({
            method:'POST',
            url:`/api/v1/notices/action?action=create`,
            data: {
                // operation:`add_notice`,
                ...data
            }
        })
    },

    listNotice: function (data) {
        // console.log("📋 listNotice API called with data:", data)
        // console.log("📋 Final API params:", data)
        
        return Noticesinstancemodule.request({
            method:'GET',
            url:`/api/v1/notices?action=list`,
            params: data
        })
    },

    deleteNotice: function (data) {
        return Noticesinstancemodule.request({
            method:'DELETE',
            url:`/api/v1/notices/${data.id}`,
            data : {
                operation : `delete_notice`,
                ...data
            } 
        })
    },

    viewNotice: function (noticeID) {
        // console.log("noticeId", noticeID)
        return Noticesinstancemodule.request({
            method:'GET',
            url:`/api/v1/notices?action=view&id=${noticeID.id}`,
            data : {
                operation : `view_notice`,
                ...noticeID
            }

        })
    },

    editNotice: function (data) {
        // console.log("data", data)
        const { id, ...requestData } = data;
        return Noticesinstancemodule.request({
            method:'POST',
            url:`/api/v1/notices/action?action=update&id=${id}`,
            data : requestData
        })
    },
    singleNotice:function(data){
        // console.log("singe notice", data)
        return Noticesinstancemodule.request({
            method:'GET',
            url:`/api/v1/notices?action=view&id=${data.id}`,
            data : {
                operation : `get_single_notice`,
                ...data
            }

        })
    },

    getBranches: function () {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: `get_branches`
            }
        })
    },

    getDepartments: function (branchId) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: `get_departments`,
                branch_id: branchId
            }
        })
    }
}

export default noticesApi