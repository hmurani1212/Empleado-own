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
        // Log the payload to verify review_cycle is a name, not ID
        console.log('🚀 Emp_Performence.createGoal - Payload being sent:', JSON.stringify(goalData, null, 2));
        console.log('🚀 review_cycle value type check:', {
            value: goalData.review_cycle,
            isLongString: goalData.review_cycle?.length > 24,
            looksLikeId: /^[a-f0-9]{24}$/i.test(goalData.review_cycle),
            hasSpaces: goalData.review_cycle?.includes(' ')
        });
        
        return performanceAxiosInstance.request({
            method: 'POST',
            url: `/performance_management/create_goal_emp`,
            data: goalData
        })
    },

};


export default Emp_Performence;