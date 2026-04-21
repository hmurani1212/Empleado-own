import { traininginstancemodeule, axiosFormDataTransformRequest, NotesPoolinstancemodeule } from "../../base";

const tarining_data = {
    getTrainigDate: function (data = {}) {
        const { status = '', text = '', page = 1, limit = 10 } = data;

        // Build query parameters
        const params = new URLSearchParams();
        if (status !== '') params.append('status', status);
        if (text !== '') params.append('text', text);
        params.append('page', page);
        params.append('limit', limit);

        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/courses?${params.toString()}`,
        })
    },


    Add_training_course: function (data) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/courses',
            data: data
        })
    },

    getCourseDetails: function (courseId) {
        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/course/details/${courseId}`,
        })
    },

    getCourseResources: function (courseId, page = 1, limit = 10) {
        // console.log("API getCourseResources called with:", { courseId, page, limit });
        // console.log("Full URL will be:", `/api/resources/${courseId}`);
        
        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/resources/${courseId}`,
            params: {
                page: page,
                limit: limit
            }
        })
    },

    addCourseResources: function (courseId, resourcesData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: `/api/resources/${courseId}`,
            data: resourcesData
        })
    },

    updateCourseResource: function (courseId, resourceId, resourceData) {
        return traininginstancemodeule.request({
            method: 'PUT',
            url: `/api/resources/${resourceId}`,
            data: {
                ...resourceData,
                _id: resourceId
            }
        })
    },

    getCourseAssessments: function (courseId, page = 1, limit = 10) {
        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/assessments/${courseId}`,
            params: {
                page: page,
                limit: limit
            }
        })
    },

    addCourseAssessment: function (courseId, assessmentData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: `/api/assessments/${courseId}`,
            data: assessmentData
        })
    },

    getCourseReviewer: function (courseId) {
        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/get_reviewer/${courseId}`,
        })
    },

    addCourseReviewer: function (courseId, reviewerData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: `/api/add_reviewer/${courseId}`,
            data: reviewerData
        })
    },

    // Get employee assignments for a course
    getCourseEmployeeAssignments: function (courseId, page = 1, limit = 10) {
        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/assignments/${courseId}`,
            params: {
                page,
                limit
            }
        })
    },

    // Add employee assignment to a course
    addCourseEmployeeAssignment: function (courseId, assignmentData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: `/api/assignments/${courseId}`,
            data: assignmentData
        })
    },

    // Get comments for a course
    getCourseComments: function (courseId) {
        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/get_comment/${courseId}`
        })
    },

    // Add comment to a course
    addCourseComment: function (courseId, commentData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: `/api/add_comment/${courseId}`,
            data: commentData
        })
    },

    // Upload file to elephant server
    uploadFileToElephant: function (formData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/make_url',
            data: formData,
            transformRequest: [axiosFormDataTransformRequest],
        })
    },

    // Upload training file to get training URL
    uploadTrainingFile: function (formData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/training_url',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // Get notebooks list from Notes Pool for Notes_pool resources
    getNotesPoolNotebooks: function () {
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: '/api/v1/notebooks/get/notebook',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            params: {
                _t: Date.now()
            }
        })
    },

    deteleCourse: function (ids) { 
          return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/courses/delete',
            data: ids,
            //headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // Delete single course
    deleteCourse: function (courseId) {
        return traininginstancemodeule.request({
            method: 'DELETE',
            url: `/api/course/${courseId}`
        })
    },

    updateCourse: function (courseId, data) {
        return traininginstancemodeule.request({
            method: 'PUT',
            url: `/api/course/${courseId}`,
            data: data
        })
    },

    deleteCombine: function (type, ids, empIds = null) {
        const payload = {
            type: type,
            ids: ids
        }
        
        // Only add emp_id for employees type - other types don't need it
        if (type === "employees") {
            payload.emp_id = empIds && empIds.length > 0 ? empIds : [0] // Use dummy value [0] if no emp_ids
        }
        // For assessments, comments, resources - don't add emp_id field at all
        
        // console.log('Delete combine payload:', payload)
        
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/delete_combine',
            data: payload
        })
    },

    get_assessmen_q : function(payload){
         return traininginstancemodeule.request({
            method: 'GET',
            url: '/api/questions/69520f2a13e41e11e690adad',
            data: payload
        })
    },

    processPdfWithAI: function (courseId, data) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: `/api/process_pdf_with_ai/${courseId}`,
            data: data
        })
    },

    // Submit AI Assessment Configuration
    submitAIAssessmentConfig: function (configData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/ai_assessment_config',
            data: configData
        })
    },

    // Generate questions from resources
    generateQuestionsFromResources: function (data) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/generate-questions-from-resources',
            data: data
        })
    },

    // Save question to question bank
    saveQuestion: function (questionData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/questions',
            data: questionData
        })
    },

    // Save multiple questions to question bank
    saveQuestions: function (questionsData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/questions/bulk',
            data: questionsData
        })
    },

    // Get complete course details with resources and questions
    getCourseCompleteDetails: function (courseId) {
        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/course/${courseId}/complete`,
        })
    },

    // Update course and resource together
    updateCourseAndResource: function (data) {
        return traininginstancemodeule.request({
            method: 'PUT',
            url: '/api/course-resource',
            data: data
        })
    },

    // Assign course to employee
    assignCourseToEmployee: function (data) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/course/assign',
            data: data
        })
    },

    // Assign course by branch and department to multiple employees
    assignCourseByBranchDept: function (data) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/course/assign-by-branch-dept',
            data: data
        })
    },

    // Get employees assigned to a course
    getCourseEmployees: function (courseId) {
        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/course/${courseId}/employees`
        })
    },

    // Assign questions by branch and department to multiple employees
    assignQuestionsByBranchDept: function (data) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/assessment/assign',
            data: data
        })
    },

    // Add questions to question bank (manual entry)
    addQuestionsToBank: function (data) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/question/add-manually',
            data: data
        })
    },

    // Get assigned employees for a course with completion tracking
    getCourseAssignedEmployees: function (courseId, page = 1, limit = 10) {
        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/courses/${courseId}/assigned_employees`,
            params: {
                page: page,
                limit: limit
            }
        })
    },

    // Get employee's resolved questions for a course
    getEmployeeResolvedQuestions: function (employeeId, courseId) {
        return traininginstancemodeule.request({
            method: 'GET',
            url: `/api/employees/${employeeId}/courses/${courseId}/resolved_questions`
        })
    },

    // Update question correctness for employee assessment
    updateQuestionCorrectness: function (employeeId, courseId, questionUpdates) {
        return traininginstancemodeule.request({
            method: 'PUT',
            url: `/api/employees/${employeeId}/courses/${courseId}/update_question_correctness`,
            data: {
                question_updates: questionUpdates
            }
        })
    },

    // AI grade employee assessment questions
    aiGradeAssessment: function (employeeId, courseId) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: `/api/employees/${employeeId}/courses/${courseId}/ai_grade`
        })
    }
};

export default tarining_data