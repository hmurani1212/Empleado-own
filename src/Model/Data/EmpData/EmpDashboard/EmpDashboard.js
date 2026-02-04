import axiosInstance, {axiosInstancecoremodule, MobileAttendanceinstancemodule} from "../../../base"

const empDashboardApi = {
    getEmpDashboardData: function (month, year){
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/dashboard/dashboard_emp_data`,
            params: {
                month: month,
                year: year
            }
        })
    },
    getInidividualAttendanceData: function (data){
        return axiosInstance.request({
            method: 'GET',
            url: `/api/get_data.php`,
            params:{
                'operation': 'individual_emp_att_v2',
                ...data
            }
        })
    },
    getAnnualRemLeaves: function (data){
        console.log("+++++++++++++++", data)
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `http://172.18.0.34:8007/api/v1/holidays/employee-leave-balance?emp_id=${data}`,
        })
    },

    mobileBaseAttendance: function (data){
        console.log("+++++++++++++++", data)
        return MobileAttendanceinstancemodule.request({
            method: 'POST',
            url: `http://172.18.0.34:8005/api/attendance/web-attendance`,
            data: data
        })
    },
    
    
}


export default empDashboardApi