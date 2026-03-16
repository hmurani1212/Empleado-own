import {axiosInstance, Inboxinstancemodeule} from "../../../base"

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const empTimeAdjustmentApi = {

    /**
     * Fetch time adjustment requests with pagination.
     * @param {Object} params - { page, limit }
     * @returns {Promise} API response with DB_DATA (array) and pagination: { total, page, limit, pages }
     */
    getAllRequest: function (params = {}) {
        const page = params.page ?? DEFAULT_PAGE;
        const limit = params.limit ?? DEFAULT_LIMIT;
        return Inboxinstancemodeule.request({
            method: "GET",
            url: `/api/v1/forms/adjustment/get_time_adjustment_req`,
            params: { page, limit },
        });
    },
    
    addNewTimeRequest:function(data){
        return Inboxinstancemodeule.request({
            method: "POST",
            url:`/api/v1/forms/adjustment/add_time_adjustment`,
            data:data
        })
    },

}


export default empTimeAdjustmentApi