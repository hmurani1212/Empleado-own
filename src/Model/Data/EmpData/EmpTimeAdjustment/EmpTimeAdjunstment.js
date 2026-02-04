import {axiosInstance, Inboxinstancemodeule} from "../../../base"

const empTimeAdjustmentApi = {

    getAllRequest:function(){
        return Inboxinstancemodeule.request({
            method: "GET",
            url:`/api/v1/forms/adjustment/get_time_adjustment_req`,
            // params:{
            //     'form_label':'ATT_TIME_ADJUSTMENT'
            // }
        })
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