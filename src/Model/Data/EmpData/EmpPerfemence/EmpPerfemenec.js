import { performanceAxiosInstance } from "../../../base"
const Emp_Performence = {
    EmpgetPRC: function () {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_emp_performence`
        })
    },
    getNextPRC: function (url) {
        return performanceAxiosInstance.request({
            method: "GET",
            url: url
        })
    },
    createGoal: function (goalData) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: `/performance_management/create_goal_emp`,
            data: goalData
        })
    },

};


export default Emp_Performence;