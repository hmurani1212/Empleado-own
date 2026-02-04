import axiosInstance, { axiosInstanceFile } from "../../base"

const apiServices = {
    elephantApi : function(data,onUploadProgress){
        return axiosInstanceFile.request({
            method: 'POST',            
            url:`/processors/set_data.php`,
            data:data,
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress) {
                    const total = progressEvent.total;
                    const loaded = progressEvent.loaded;
                    const percentage = Math.floor((loaded / total) * 100);
                    onUploadProgress(percentage); // Update progress
                }
            },
        })
    },
    getEmployeeServices : function(data){
        return axiosInstance.request({
            method: 'GET',
            url:`/processors/get_data.php`,
            params:{
                'operation':'get_deptt_emps',
                ...data
            }
        })
    },
    getEmployeeAllServices : function(data){
        return axiosInstance.request({
            method: 'GET',
            url:`/processors/get_data.php`,
            params:{
                'operation':'deptt_emp_list',
                ...data
            }
        })
    },
    

    
    
}

export default apiServices