import { showToast } from '../../Components/Toaster/Toaster'
import trainingApi from '../../Model/Data/TrainigPages/Training';

const TrainingiewModel = (set, get) => ({

    allTraingig_data: {
        Card: {
            total_doc: 0,
            active_course: 0,
            total_learn: 0,
            pending_course: 0
        },
        courses: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 1
        }
    },
    copyTrainingData: {
        Card: {
            total_doc: 0,
            active_course: 0,
            total_learn: 0,
            pending_course: 0
        },
        courses: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 1
        }
    },

    gettingAllTraingiList: async (data = {}) => {
        // console.log("Training API call with data:", data)
        try {
            const response = await trainingApi.getTrainigDate(data)
            const respData = response.data

            if (response.status === 200 && respData.STATUS === 'SUCCESSFUL') {
                const currentPage = data.page || 1;

                if (currentPage === 1) {
                    // First page - replace all data
                    set({
                        allTraingig_data: respData?.DB_DATA || {
                            Card: { total_doc: 0, active_course: 0, total_learn: 0, pending_course: 0 },
                            courses: [],
                            pagination: { total: 0, page: 1, limit: 10, pages: 1 }
                        },
                        copyTrainingData: respData?.DB_DATA || {
                            Card: { total_doc: 0, active_course: 0, total_learn: 0, pending_course: 0 },
                            courses: [],
                            pagination: { total: 0, page: 1, limit: 10, pages: 1 }
                        }
                    })
                } else {
                    // Subsequent pages - append data
                    set((state) => {
                        const existingCourses = state.allTraingig_data.courses || [];
                        const newCourses = respData?.DB_DATA?.courses || [];

                        return {
                            allTraingig_data: {
                                ...respData?.DB_DATA,
                                courses: [...existingCourses, ...newCourses]
                            },
                            copyTrainingData: {
                                ...respData?.DB_DATA,
                                courses: [...existingCourses, ...newCourses]
                            }
                        }
                    });
                }
            } else if (response.status === 200 && respData.STATUS === 'ERROR') {
                // Handle "No Date Found" or other errors
                if (data.page === 1) {
                    set({
                        allTraingig_data: {
                            Card: { total_doc: 0, active_course: 0, total_learn: 0, pending_course: 0 },
                            courses: [],
                            pagination: { total: 0, page: 1, limit: 10, pages: 1 }
                        },
                        copyTrainingData: {
                            Card: { total_doc: 0, active_course: 0, total_learn: 0, pending_course: 0 },
                            courses: [],
                            pagination: { total: 0, page: 1, limit: 10, pages: 1 }
                        }
                    })
                }
            }
        } catch (error) {
            console.log("Training API error:", error)
            if (data.page === 1) {
                set({
                    allTraingig_data: {
                        Card: { total_doc: 0, active_course: 0, total_learn: 0, pending_course: 0 },
                        courses: [],
                        pagination: { total: 0, page: 1, limit: 10, pages: 1 }
                    },
                    copyTrainingData: {
                        Card: { total_doc: 0, active_course: 0, total_learn: 0, pending_course: 0 },
                        courses: [],
                        pagination: { total: 0, page: 1, limit: 10, pages: 1 }
                    }
                })
            }
        }
    },

    // Reset training data to initial state
    resetTrainingData: () => {
        set({
            allTraingig_data: {
                Card: { total_doc: 0, active_course: 0, total_learn: 0, pending_course: 0 },
                courses: [],
                pagination: { total: 0, page: 1, limit: 10, pages: 1 }
            },
            copyTrainingData: {
                Card: { total_doc: 0, active_course: 0, total_learn: 0, pending_course: 0 },
                courses: [],
                pagination: { total: 0, page: 1, limit: 10, pages: 1 }
            }
        })
    },

    // Get course details by ID
    getCourseDetails: async (courseId) => {
        try {
            const response = await trainingApi.getCourseDetails(courseId);
            const result = response.data;

            if (response.status === 200 && result.STATUS === 'SUCCESSFUL') {
                // Handle nested DB_DATA structure - return the full response
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to fetch course details');
            }
        } catch (err) {
            console.log('Error fetching course details:', err);
            throw err;
        }
    },

    // Get course resources by course ID with pagination
    getCourseResources: async (courseId, page = 1, limit = 10) => {
        console.log('Training.js getCourseResources called:', { courseId, page, limit });
        try {
            const response = await trainingApi.getCourseResources(courseId, page, limit);
            const result = response.data;

            if (response.status === 200 && result.STATUS === 'SUCCESSFUL') {
                return result.DB_DATA;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to fetch course resources');
            }
        } catch (err) {
            console.log('Error fetching course resources:', err);
            throw err;
        }
    },

    // Add resources to a course
    addCourseResources: async (courseId, resourcesData) => {
        try {
            const response = await trainingApi.addCourseResources(courseId, resourcesData);
            const result = response?.data;
            console.log("result result", result);
            if (result.STATUS === 'SUCCESSFUL') {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to add course resources');
            }
        } catch (err) {
            console.log('Error adding course resources:', err);
            throw err;
        }
    },

    // Update a specific resource in a course
    updateCourseResource: async (courseId, resourceId, resourceData) => {
        try {
            const response = await trainingApi.updateCourseResource(courseId, resourceId, resourceData);
            const result = response?.data;
            console.log("Update resource result:", result);
            if (result.STATUS === 'SUCCESSFUL') {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to update course resource');
            }
        } catch (err) {
            console.log('Error updating course resource:', err);
            throw err;
        }
    },

    // Get course assessments by course ID with pagination
    getCourseAssessments: async (courseId, page = 1, limit = 10) => {
        try {
            const response = await trainingApi.getCourseAssessments(courseId, page, limit);
            const result = response.data;

            if (result.STATUS === 'SUCCESSFUL') {
                return result.DB_DATA;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to fetch course assessments');
            }
        } catch (err) {
            console.log('Error fetching course assessments:', err);
            throw err;
        }
    },

    // Add assessment to a course
    addCourseAssessment: async (courseId, assessmentData) => {
        try {
            const response = await trainingApi.addCourseAssessment(courseId, assessmentData);
            const result = response.data;

            if (result.STATUS === 'SUCCESSFUL') {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to add course assessment');
            }
        } catch (err) {
            console.log('Error adding course assessment:', err);
            throw err;
        }
    },

    // Get course reviewer/approver by course ID
    getCourseReviewer: async (courseId) => {
        try {
            const response = await trainingApi.getCourseReviewer(courseId);
            const result = response.data;

            if (response.status === 200 && result.STATUS === 'SUCCESSFUL') {
                return result.DB_DATA;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to fetch course reviewer');
            }
        } catch (err) {
            console.log('Error fetching course reviewer:', err);
            throw err;
        }
    },

    // Add reviewer to a course
    addCourseReviewer: async (courseId, reviewerData) => {
        try {
            const response = await trainingApi.addCourseReviewer(courseId, reviewerData);
            const result = response.data;

            if (response.status === 200 && result.STATUS === 'SUCCESSFUL') {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to add course reviewer');
            }
        } catch (err) {
            console.log('Error adding course reviewer:', err);
            showToast(err?.response?.data?.ERROR_DESCRIPTION, 'error')
            throw err;
        }
    },

    Add_training_course_fn: async (data) => {
        try {
            const response = await trainingApi.Add_training_course(data);
            const result = response.data;
            return response;
        } catch (err) {
            console.log('final error', err)
            throw err;
        }
    },

    // Get employee assignments for a course
    getCourseEmployeeAssignments: async (courseId, page = 1, limit = 10) => {
        try {
            const response = await trainingApi.getCourseEmployeeAssignments(courseId, page, limit);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                return {
                    assignments: data.DB_DATA.employee_assignments,
                    pagination: data.DB_DATA.pagination
                };
            } else {
                throw new Error(data.ERROR_DESCRIPTION || 'Failed to fetch employee assignments');
            }
        } catch (error) {
            console.error('Error fetching employee assignments:', error);
            throw error;
        }
    },

    // Add employee assignment to a course
    addCourseEmployeeAssignment: async (courseId, assignmentData) => {
        try {
            const response = await trainingApi.addCourseEmployeeAssignment(courseId, assignmentData);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                return data;
            } else {
                throw new Error(data.ERROR_DESCRIPTION || 'Failed to add employee assignment');
            }
        } catch (error) {
            console.error('Error adding employee assignment:', error);
            throw error;
        }
    },

    // Get comments for a course
    getCourseComments: async (courseId) => {
        try {
            const response = await trainingApi.getCourseComments(courseId);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                return data.DB_DATA;
            } else {
                throw new Error(data.ERROR_DESCRIPTION || 'Failed to fetch comments');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    },

    // Add comment to a course
    addCourseComment: async (courseId, commentData) => {
        try {
            const response = await trainingApi.addCourseComment(courseId, commentData);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                return data;
            } else {
                throw new Error(data.ERROR_DESCRIPTION || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    // Upload file to elephant server
    uploadFileToElephant: async (file, deviceId = 'abc123', latitude = '34.123', longitude = '71.123') => {
        try {
            const formData = new FormData();
            formData.append('operation', 'store_file');
            formData.append('file', file);
            formData.append('device_id', deviceId);
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);

            const response = await trainingApi.uploadFileToElephant(formData);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                return {
                    success: true,
                    fileUrl: data.FILE_URL,
                    fileName: data.ELEPHANT_RESP?.FILE_NAME || file.name
                };
            } else {
                throw new Error(data.ERROR_DESCRIPTION || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Upload training file to get training URL (for training docs only)
    uploadTrainingFile: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await trainingApi.uploadTrainingFile(formData);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                return {
                    success: true,
                    fileUrl: data.FILE_URL,
                    fileId: data.FILE_ID
                };
            } else {
                throw new Error(data.ERROR_DESCRIPTION || 'Failed to upload training file');
            }
        } catch (error) {
            console.error('Error uploading training file:', error);
            throw error;
        }
    },


    deteleCoursefn: async (ids) => {
        try {
            const response = await trainingApi.deteleCourse(ids);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                return data;
            } else {
                throw new Error(data.ERROR_DESCRIPTION || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    updateCoursefn: async (courseId, data) => {
        try {
            const response = await trainingApi.updateCourse(courseId, data);
            const result = response.data;

            if (result.STATUS === "SUCCESSFUL") {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to update course');
            }
        } catch (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    },

    deleteCombinefn: async (type, ids, empIds = null) => {
        try {
            // console.log('ViewModel deleteCombinefn called with:', { type, ids, empIds });
            const response = await trainingApi.deleteCombine(type, ids, empIds);
            const result = response.data;

            if (result.STATUS === "SUCCESSFUL") {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to delete items');
            }
        } catch (error) {
            console.error('Error deleting items:', error);
            throw error;
        }
    },

    get_assessmen_q_fn: async (id) => {
        try {
            // console.log('ViewModel deleteCombinefn called with:', { type, ids, empIds });
            const response = await trainingApi.get_assessmen_q(id);
            const result = response.data;
            if (result.STATUS === "SUCCESSFUL") {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to delete items');
            }
        } catch (error) {
            console.error('Error deleting items:', error);
            throw error;
        }
    },

    processPdfWithAI: async (courseId, data) => {
        try {
            const response = await trainingApi.processPdfWithAI(courseId, data);
            const result = response.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to process PDF with AI');
            }
        } catch (error) {
            console.error('Error processing PDF with AI:', error);
            throw error;
        }
    },

    // Submit AI Assessment Configuration
    submitAIAssessmentConfig: async (configData) => {
        try {
            const response = await trainingApi.submitAIAssessmentConfig(configData);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to submit AI assessment configuration');
            }
        } catch (error) {
            console.error('Error submitting AI assessment config:', error);
            throw error;
        }
    },

    // Generate questions from resources
    generateQuestionsFromResources: async (data) => {
        try {
            const response = await trainingApi.generateQuestionsFromResources(data);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to generate questions from resources');
            }
        } catch (error) {
            console.error('Error generating questions from resources:', error);
            throw error;
        }
    },

    // Save question to question bank
    saveQuestion: async (questionData) => {
        try {
            const response = await trainingApi.saveQuestion(questionData);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to save question');
            }
        } catch (error) {
            console.error('Error saving question:', error);
            throw error;
        }
    },

    // Save multiple questions to question bank
    saveQuestions: async (questionsData) => {
        try {
            const response = await trainingApi.saveQuestions(questionsData);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to save questions');
            }
        } catch (error) {
            console.error('Error saving questions:', error);
            throw error;
        }
    },

    // Get complete course details with resources and questions
    getCourseCompleteDetails: async (courseId) => {
        try {
            const response = await trainingApi.getCourseCompleteDetails(courseId);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return result.DB_DATA;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to fetch complete course details');
            }
        } catch (error) {
            console.error('Error fetching complete course details:', error);
            throw error;
        }
    },

    // Update course and resource together
    updateCourseAndResource: async (data) => {
        try {
            const response = await trainingApi.updateCourseAndResource(data);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to update course and resource');
            }
        } catch (error) {
            console.error('Error updating course and resource:', error);
            throw error;
        }
    },

    // Assign course to employee
    assignCourseToEmployee: async (data) => {
        try {
            const response = await trainingApi.assignCourseToEmployee(data);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return result;
            } else {
                throw new Error(result.ERROR_DESCRIPTION || 'Failed to assign course to employee');
            }
        } catch (error) {
            console.error('Error assigning course to employee:', error);
            throw error;
        }
    },

    // Assign course by branch and department to multiple employees
    assignCourseByBranchDept: async (data) => {
        try {
            set({ isLoadingCourseAssignment: true });

            const response = await trainingApi.assignCourseByBranchDept(data);
            const result = response?.data;

            if (result.STATUS === "SUCCESSFUL") {
                showToast(result.MESSAGE || "Course assigned successfully", "success");
                return { success: true, data: result.DB_DATA };
            } else {
                const errorMsg = result.ERROR_DESCRIPTION || 'Failed to assign course';
                showToast(errorMsg, "error");
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Error assigning course by branch/dept:', error);
            const errorMsg = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to assign course';
            showToast(errorMsg, "error");
            return { success: false, error: errorMsg };
        } finally {
            set({ isLoadingCourseAssignment: false });
        }
    },

    // Loading state for course assignment
    isLoadingCourseAssignment: false,

    // Get employees assigned to a course
    getCourseEmployees: async (courseId) => {
        try {
            set({ isLoadingCourseEmployees: true });

            const response = await trainingApi.getCourseEmployees(courseId);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return { success: true, data: result.DB_DATA };
            } else {
                const errorMsg = result.ERROR_DESCRIPTION || 'Failed to fetch course employees';
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Error fetching course employees:', error);
            const errorMsg = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to fetch course employees';
            return { success: false, error: errorMsg };
        } finally {
            set({ isLoadingCourseEmployees: false });
        }
    },

    // Loading state for course employees
    isLoadingCourseEmployees: false,

    // Assign questions by branch and department to multiple employees
    assignQuestionsByBranchDept: async (data) => {
        try {
            set({ isLoadingQuestionAssignment: true });

            const response = await trainingApi.assignQuestionsByBranchDept(data);
            const result = response?.data;

            if (result.STATUS === "SUCCESSFUL") {
                showToast(result.MESSAGE || "Questions assigned successfully", "success");
                return { success: true, data: result.DB_DATA };
            } else {
                const errorMsg = result.ERROR_DESCRIPTION || 'Failed to assign questions';
                showToast(errorMsg, "error");
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Error assigning questions by branch/dept:', error);
            const errorMsg = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to assign questions';
            showToast(errorMsg, "error");
            return { success: false, error: errorMsg };
        } finally {
            set({ isLoadingQuestionAssignment: false });
        }
    },

    delete_course_fn: async (data) => {
        try {
            set({ isLoadingQuestionAssignment: true });

            // console.log("delete_course_fn data", data);

            const response = await trainingApi.deleteCourse(data);
            const result = response?.data;

            if (result.STATUS === "SUCCESSFUL") {
                showToast(result.MESSAGE || "Course deleted successfully", "success");
                // Training_datefn();
                return { success: true, data: result.DB_DATA };
            } else {
                const errorMsg = result.ERROR_DESCRIPTION || 'Failed to assign questions';
                showToast(errorMsg, "error");
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Error assigning questions by branch/dept:', error);
            const errorMsg = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to assign questions';
            showToast(errorMsg, "error");
            return { success: false, error: errorMsg };
        } finally {
            set({ isLoadingQuestionAssignment: false });
        }
    },



    // Loading state for question assignment
    isLoadingQuestionAssignment: false,

    // Add questions to question bank (manual entry)
    addQuestionsToBank: async (data) => {
        try {
            set({ isLoadingAddQuestionsBank: true });

            const response = await trainingApi.addQuestionsToBank(data);
            const result = response?.data;

            if (result.STATUS === "SUCCESSFUL") {
                showToast(result.MESSAGE || "Questions added to bank successfully", "success");
                return { success: true, data: result.DB_DATA };
            } else {
                const errorMsg = result.ERROR_DESCRIPTION || 'Failed to add questions to bank';
                showToast(errorMsg, "error");
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Error adding questions to bank:', error);
            const errorMsg = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to add questions to bank';
            showToast(errorMsg, "error");
            return { success: false, error: errorMsg };
        } finally {
            set({ isLoadingAddQuestionsBank: false });
        }
    },

    // Loading state for adding questions to bank
    isLoadingAddQuestionsBank: false,

    // Get assigned employees for a course with completion tracking
    getCourseAssignedEmployees: async (courseId, page = 1, limit = 10) => {
        try {
            set({ isLoadingCourseAssignedEmployees: true });

            const response = await trainingApi.getCourseAssignedEmployees(courseId, page, limit);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return { success: true, data: result.DB_DATA };
            } else {
                const errorMsg = result.ERROR_DESCRIPTION || 'Failed to fetch assigned employees';
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Error fetching assigned employees:', error);
            const errorMsg = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to fetch assigned employees';
            return { success: false, error: errorMsg };
        } finally {
            set({ isLoadingCourseAssignedEmployees: false });
        }
    },

    // Loading state for course assigned employees
    isLoadingCourseAssignedEmployees: false,

    // Get employee's resolved questions for a course
    getEmployeeResolvedQuestions: async (employeeId, courseId) => {
        try {
            set({ isLoadingResolvedQuestions: true });

            const response = await trainingApi.getEmployeeResolvedQuestions(employeeId, courseId);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                return { success: true, data: result.DB_DATA };
            } else {
                const errorMsg = result.ERROR_DESCRIPTION || 'Failed to fetch resolved questions';
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Error fetching resolved questions:', error);
            const errorMsg = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to fetch resolved questions';
            return { success: false, error: errorMsg };
        } finally {
            set({ isLoadingResolvedQuestions: false });
        }
    },

    // Loading state for resolved questions
    isLoadingResolvedQuestions: false,

    // Update question correctness for employee assessment
    updateQuestionCorrectness: async (employeeId, courseId, questionUpdates) => {
        try {
            set({ isUpdatingQuestionCorrectness: true });

            const response = await trainingApi.updateQuestionCorrectness(employeeId, courseId, questionUpdates);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                showToast('Question correctness updated successfully', 'success');
                return { success: true, data: result.DB_DATA };
            } else {
                const errorMsg = result.ERROR_DESCRIPTION || 'Failed to update question correctness';
                showToast(errorMsg, 'error');
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Error updating question correctness:', error);
            const errorMsg = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to update question correctness';
            showToast(errorMsg, 'error');
            return { success: false, error: errorMsg };
        } finally {
            set({ isUpdatingQuestionCorrectness: false });
        }
    },

    // Loading state for updating question correctness
    isUpdatingQuestionCorrectness: false,

    // AI grade employee assessment
    aiGradeAssessment: async (employeeId, courseId) => {
        try {
            set({ isAiGrading: true });

            const response = await trainingApi.aiGradeAssessment(employeeId, courseId);
            const result = response?.data;

            if (response.status === 200 && result.STATUS === "SUCCESSFUL") {
                showToast('AI grading completed successfully', 'success');
                return { success: true, data: result.DB_DATA };
            } else {
                const errorMsg = result.ERROR_DESCRIPTION || 'Failed to complete AI grading';
                showToast(errorMsg, 'error');
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Error during AI grading:', error);
            const errorMsg = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to complete AI grading';
            showToast(errorMsg, 'error');
            return { success: false, error: errorMsg };
        } finally {
            set({ isAiGrading: false });
        }
    },

    // Loading state for AI grading
    isAiGrading: false,

});

export default TrainingiewModel;