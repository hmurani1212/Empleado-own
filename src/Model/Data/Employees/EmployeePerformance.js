import { axiosInstancecoremodule, performanceAxiosInstance } from "../../base"

const employeePerformanceApi = {
    getEmployeePerformance: function(params = {}) {
        const queryParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.goal_page) queryParams.append('goal_page', params.goal_page);
        if (params.feedback_page) queryParams.append('feedback_page', params.feedback_page);
        if (params.history_page) queryParams.append('history_page', params.history_page);
        if (params.performance_id) queryParams.append('performance_id', params.performance_id);
        
        const queryString = queryParams.toString();
        const url = `/performance_management/get_emp_performence${queryString ? `?${queryString}` : ''}`;
        
        return performanceAxiosInstance.request({
            method: "GET",
            url: url
        })
    },
    
    getPerformanceGoals: function() {
        return axiosInstancecoremodule.request({
            method: "GET",
            url: `/api/v1/employee_v3/get_performance_goals`
        })
    },
    
    getPerformanceCompetency: function() {
        return axiosInstancecoremodule.request({
            method: "GET",
            url: `/api/v1/employee_v3/get_performance_competency`
        })
    },
    
    getPerformanceFeedback: function() {
        return axiosInstancecoremodule.request({
            method: "GET",
            url: `/api/v1/employee_v3/get_performance_feedback`
        })
    },
    
    getPerformanceHistory: function() {
        return axiosInstancecoremodule.request({
            method: "GET",
            url: `/api/v1/employee_v3/get_performance_history`
        })
    },
    
    deleteGoal: function(goalId) {
        return performanceAxiosInstance.request({
            method: 'DELETE',
            url: `/performance_management/delete_goal/${goalId}`
        })
    },
    
    updateGoal: function(data) {
        return performanceAxiosInstance.request({
            method: 'PUT',
            url: '/performance_management/update_employee_goal',
            data: data
        })
    },

    toggleGoalStatus: function(goalId) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: '/performance_management/toggle_goal_status',
            data: {
                goal_id: goalId
            }
        })
    }
}

export default employeePerformanceApi
