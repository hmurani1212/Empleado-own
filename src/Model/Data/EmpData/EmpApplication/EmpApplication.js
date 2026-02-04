import axiosInstance, { axiosInstanceFile, Inboxinstancemodeule } from "../../../base"

const empApplicationApi = {
    getAllEmpApplication: function(data){
        // console.log('data',data)
        return Inboxinstancemodeule.request({
            method:"GET",
            url:`/api/v1/forms/data/emp`,
            // params:{
            //     'form_label': 'LEAVE_REQUEST',
            //     ...data
            // }
        })
    },
    addMedicalAllowance: function(data){
        return Inboxinstancemodeule.request({
            method:"POST",
            url:`/api/v1/forms`,
            data:data
        })
    }
}

export default empApplicationApi