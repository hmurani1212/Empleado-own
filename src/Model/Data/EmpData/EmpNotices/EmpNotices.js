import axiosInstance, { Noticesinstancemodule } from "../../../base"

const empNoticesApi = {
    getEmpNoticesData: function (){
        return Noticesinstancemodule.request({
            method: 'GET',
            url: `/api/v1/notices?action=shared`
        })
    }
}


export default empNoticesApi