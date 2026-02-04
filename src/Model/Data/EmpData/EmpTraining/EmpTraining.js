import { traininginstancemodeule } from "../../../base"

const empTrainingApi = {
    // Get employee training courses
    getEmployeeTrainingCourses: function(params = {}) {
        return traininginstancemodeule.request({
            method: "GET",
            url: `/api/employee_training_courses`,
            params: params
        })
    },

    // Get employee training data (old endpoint - keeping for backward compatibility)
    getEmployeeTraining: function(params = {}) {
        return traininginstancemodeule.request({
            method: "GET",
            url: `/api/employee_trainig`,
            params: params
        })
    },

    // Update employee training status (start/complete)
    updateEmployeeStatus: function(data) {
        return traininginstancemodeule.request({
            method: "PUT",
            url: `/api/employee_status`,
            data: data
        })
    },

    // Get assessment for a course
    getAssessment: function(courseId) {
        return traininginstancemodeule.request({
            method: "GET",
            url: `/api/assessments/${courseId}`
        })
    },

    // Submit assessment answers
    submitAssessment: function(data) {
        return traininginstancemodeule.request({
            method: "POST",
            url: `/api/submit_assessment`,
            data: data
        })
    },

    // Complete a course
    completeCourse: function(courseId) {
        return traininginstancemodeule.request({
            method: "PUT",
            url: `/api/employee_training_courses/${courseId}/complete`
        })
    },

    // Get assigned questions for assessment
    getAssignedQuestions: function() {
        return traininginstancemodeule.request({
            method: "GET",
            url: `/api/employee_assigned_questions`
        })
    },

    // Submit employee assessment answers
    submitEmployeeAnswers: function(data) {
        return traininginstancemodeule.request({
            method: "POST",
            url: `/api/submit_employee_answers`,
            data: data
        })
    }
}

export default empTrainingApi
