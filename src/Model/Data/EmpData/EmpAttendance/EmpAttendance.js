import {axiosInstancecoremodule} from "../../../base"

const empAttendanceApi = {
    getEmpAttendanceData:function(data){
        return axiosInstancecoremodule.request({
            method:'GET',
            url:`/api/v1/dashboard/dashboard_emp_data`,
            params:{
                month: data?.month || '',
                year: data?.year || ''
            }
        })
    }
}


export default empAttendanceApi