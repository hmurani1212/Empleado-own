import { performanceAxiosInstance } from "../../base"
const performanceApi = {
    getPRC: function (page = 1, limit = 10) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_performance_review`,
            params: {
                page: page,
                limit: limit
            }
        })
    },
    getNextPRC: function (url) {
        return performanceAxiosInstance.request({
            method: "GET",
            url: url
        })
    },
    getSinglePRC: function (id) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_performance_review_by_id/${id}`
        })
    },
    deletePRC: function (id) {
        return performanceAxiosInstance.request({
            method: 'DELETE',
            url: `/performance_management/delete_performence_review_cycle/${id}`
        })
    },
    addPRC: function (data) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: `/performance_management/create_performance_review`,
            data: data
        })
    },
    // Updated method to use existing endpoint for multiple employee creation
    createMultipleEmployeePRC: function (data) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: `/performance_management/create_performance_review`,
            data: data
        })
    },
    updatePRC: function (data, review_id) {
        const { review_id: _, ...payloadData } = data; // Remove review_id from payload
        return performanceAxiosInstance.request({
            method: 'PUT',
            url: `/performance_management/update_performance_review/${review_id}`,
            data: payloadData
        })
    },
    searchingPRC: function (searchText) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_performance_review?text=${encodeURIComponent(searchText)}`
        })
    },
    getPRCForSelect: function () {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_performance`,
        })
    },
    getGoals: function (name, page = 1, limit = 10) {
        const params = {};
        if (name) params.name = name;
        params.page = page;
        params.limit = limit;
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_goals`,
            params: params
        })
    },
    searchGoals: function (text, page = 1, limit = 10) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_goals`,
            params: { 
                text: text,
                page: page,
                limit: limit
            }
        })
    },


    getEmpGoal: function (name) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_employee_by_name/${encodeURIComponent(name)}`,
        })
    },

    getPerformance: function () {
        return performanceAxiosInstance.request({
            method: "GET",
            url: '/performance_management/get_performance'
        })
    },

    createGoal: function (data) {
        return performanceAxiosInstance.request({
            method: "POST",
            url: '/performance_management/create_goal',
            data: data
        })
    },
    getSingleGoal: function (id) {
        return performanceAxiosInstance.request({
            method: "GET",
            url: `/performance_management/get_one_goal/${id}`,
        })
    },

    getCompetency: function (reviewCycleId = null, searchText = null, page = 1, limit = 10) {
        let url = '/performance_management/get_competencies'
        const params = {
            page: page,
            limit: limit
        }
        
        if (reviewCycleId) {
            params.review_cycle = reviewCycleId
        }
        
        if (searchText) {
            params.text = searchText
        }
        
        return performanceAxiosInstance.request({
            method: 'GET',
            url: url,
            params: params
        })
    },
    getBranchDepartment: function (performanceName) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_dep_branch/${encodeURIComponent(performanceName)}`,
        })
    },
    addCompetency: function (data) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: `performance_management/create_competency`,
            data: data
        })
    },
    getSubCompetency: function (employeeId) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_rate_competency/${employeeId}`,
        })
    },
    deleteSubCompetency: function (id) {
        return performanceAxiosInstance.request({
            method: 'DELETE',
            url: `/performance_management/delete_competency/${id}`,
        })
    },
    // getSubGoals: function (data) {
    //     return performanceAxiosInstance.request({
    //         method: 'GET',
    //         url: '/performance_management/get_goal_by_employee_id/9119544',
    //         //data: data
    //     })
    // },
    
    // New function to get goals by employee ID with dynamic employee ID
    getGoalsByEmployeeId: function (employeeId, nextUrl = null) {
        if (nextUrl) {
            // If nextUrl is provided, use it directly for pagination
            return performanceAxiosInstance.request({
                method: 'GET',
                url: nextUrl
            })
        } else {
            // Otherwise, construct the URL with the employee ID
            return performanceAxiosInstance.request({
                method: 'GET',
                url: `/performance_management/get_goal_by_employee_id/${employeeId}`
            })
        }
    },

    getGoalById: function (goalId) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_goal_by_id/${goalId}`
        })
    },

    getOngoingFeedback: function (params = {}) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: '/performance_management/get_ongoing_feedback',
            params: params
        })
    },

    createOngoingFeedback: function (data) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: '/performance_management/create_ongoing_feedback',
            data: data
        })
    },
    deleteSubGoal: function (id) {
        return performanceAxiosInstance.request({
            method: 'DELETE',
            url: `performance_management/delete_goal/${id}`,
        })
    },

    updateSubGoal: function (data) {
        return performanceAxiosInstance.request({
            method: 'PUT',
            url: `/performance_management/update_goal`,
            data: data
        })
    },

    updateGoalProgress: function (data) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: '/performance_management/update_goal_progress',
            data: data
        })
    },
    
    rateGoal: function (data) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: '/performance_management/rating_goal',
            data: data
        })
    },

    getGoalProgressHistory: function (goalId) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_goal_progress_history/${goalId}`
        })
    },

    getGoalComments: function (goalId) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_comment_by_goal_id/${goalId}`
        })
    },

    updateGoalRating: function (data) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: '/performance_management/update_goal_rating',
            data: data
        })
    },

    getGoalRatingHistory: function (goalId) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_goal_rating_history/${goalId}`
        })
    },

    createProgress: function (data) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: '/performance_management/create_progress',
            data: data
        })
    },

    getEmployeeFeedback: function (employeeId) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_feedback/${employeeId}`
        })
    },

    getMainHistory: function (page = 1, limit = 10) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: '/performance_management/get_main_history',
            params: {
                page: page,
                limit: limit
            }
        })
    },

    getHistory: function (employeeId) {
        return performanceAxiosInstance.request({
            method: 'GET',
            url: `/performance_management/get_history`
        })
    },

    addRatingCompetency: function (data) {
        return performanceAxiosInstance.request({
            method: 'POST',
            url: '/performance_management/add_rating_competency',
            data: data
        })
    },
}

export default performanceApi