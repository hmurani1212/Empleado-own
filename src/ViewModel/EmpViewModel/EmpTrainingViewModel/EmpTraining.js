import { showToast } from "../../../Components/Toaster/Toaster";
import empTrainingApi from "../../../Model/Data/EmpData/EmpTraining/EmpTraining";

const empTrainingViewModel = (set, get) => ({
    // Training data state
    trainingData: {
        enrolledCourses: [],
        availableCourses: [],
        completedCourses: [],
        certificates: [],
        stats: {
            enrolledCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            certificatesEarned: 0
        }
    },
    employeeTrainingCourses: [],
    selectedCourse: null,
    assignedQuestions: null,
    loading: false,
    error: null,
    
    // Get employee training data
    getEmployeeTraining: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await empTrainingApi.getEmployeeTraining(params);
            const respData = response.data;
            console.log('respData', respData)

            if (respData.STATUS === 'SUCESSFUL') {
                const dbData = respData.DB_DATA || {};
                const courses = dbData.courses || [];
                const cardData = dbData.CARD_DATA || {};
                
                // Transform API data to match our UI structure
                const transformedCourses = courses.map(course => {
                    const employeeInfo = course.employee_info || {};
                    
                    // Determine status based on is_completed and is_started
                    let status = 'Not Started';
                    if (employeeInfo.is_completed === 1) {
                        status = 'Completed';
                    } else if (employeeInfo.is_started === 1) {
                        status = 'In Progress';
                    }
                    
                    return {
                        id: course.course_id,
                        courseName: course.course_name,
                        description: course.description,
                        assignedDate: course.assigned_date,
                        isCompleted: employeeInfo.is_completed === 1,
                        isStarted: employeeInfo.is_started === 1,
                        completionDate: employeeInfo.completion_date,
                        startedDate: employeeInfo.started_date,
                        createdAt: course.createdAt,
                        isAssessmentRequired: course.is_assessment_required,
                        isApprovalRequired: course.is_approval_required,
                        resources: course.resources || [],
                        status: status,
                        progress: employeeInfo.is_completed === 1 ? 100 : (employeeInfo.is_started === 1 ? 50 : 0),
                        category: 'Training', // Default category
                        instructor: 'System Admin', // Default instructor
                        dueDate: new Date(course.assigned_date * 1000 + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] // 30 days from assignment
                    };
                });

                // Use card data from API or calculate stats
                const stats = {
                    enrolledCourses: cardData.total_courses || transformedCourses.length,
                    completedCourses: cardData.completed || 0,
                    inProgressCourses: cardData.in_progress || 0,
                    notStartedCourses: cardData.not_started || 0,
                    certificatesEarned: cardData.completed || 0
                };

                set({
                    trainingData: {
                        ...get().trainingData,
                        enrolledCourses: transformedCourses,
                        stats: stats
                    },
                    loading: false
                });

                return { success: true, data: transformedCourses };
            } else {
                set({
                    error: respData.ERROR_DESCRIPTION || 'Failed to fetch training data',
                    loading: false
                });
                // showToast(respData.ERROR_DESCRIPTION || 'Failed to fetch training data', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error fetching training data:', error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'An error occurred while fetching training data';
            set({
                error: errorMessage,
                loading: false
            });
            // showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    },




    // Clear training data
    clearTrainingData: () => {
        set({
            trainingData: {
                enrolledCourses: [],
                availableCourses: [],
                completedCourses: [],
                certificates: [],
                stats: {
                    enrolledCourses: 0,
                    completedCourses: 0,
                    inProgressCourses: 0,
                    certificatesEarned: 0
                }
            },
            loading: false,
            error: null
        });
    },

    // Set loading state
    setLoading: (loading) => {
        set({ loading });
    },

    // Set error state
    setError: (error) => {
        set({ error });
    },

    // Mark employee as started
    markEmployeeAsStarted: async (courseId, empId) => {
        set({ loading: true, error: null });
        try {
            const response = await empTrainingApi.updateEmployeeStatus({
                course_id: courseId,
                emp_id: empId,
                is_completed: 0,
                is_started: 1
            });
            
            const respData = response.data;
            console.log('Start response:', respData);
            
            if (respData.STATUS === 'SUCESSFUL') {
                // Refresh training data to get updated status
                await get().getEmployeeTraining();
                return { success: true, data: respData.DB_DATA };
            } else {
                set({ error: respData.ERROR_DESCRIPTION || 'Failed to start training' });
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to start training';
            set({ error: errorMessage });
            return { success: false, error: errorMessage };
        } finally {
            set({ loading: false });
        }
    },

            // Mark employee as completed
            markEmployeeAsCompleted: async (courseId, empId) => {
                set({ loading: true, error: null });
                try {
                    const response = await empTrainingApi.updateEmployeeStatus({
                        course_id: courseId,
                        emp_id: empId,
                        is_completed: 1,
                        is_started: 1
                    });
                    
                    const respData = response.data;
                    console.log('Complete response:', respData);
                    
                    if (respData.STATUS === 'SUCESSFUL') {
                        // Refresh training data to get updated status
                        await get().getEmployeeTraining();
                        return { success: true, data: respData.DB_DATA };
                    } else {
                        set({ error: respData.ERROR_DESCRIPTION || 'Failed to complete training' });
                        return { success: false, error: respData.ERROR_DESCRIPTION };
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to complete training';
                    set({ error: errorMessage });
                    return { success: false, error: errorMessage };
                } finally {
                    set({ loading: false });
                }
            },

            // Get assessment for a course
            getAssessment: async (courseId) => {
                set({ loading: true, error: null });
                try {
                    const response = await empTrainingApi.getAssessment(courseId);
                    const respData = response.data;
                    console.log('Assessment response:', respData);
                    
                    if (respData.STATUS === 'SUCCESSFUL') {
                        const assessments = respData.DB_DATA?.assessments || [];
                        return { success: true, data: assessments };
                    } else {
                        set({ error: respData.ERROR_DESCRIPTION || 'Failed to fetch assessment' });
                        return { success: false, error: respData.ERROR_DESCRIPTION };
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to fetch assessment';
                    set({ error: errorMessage });
                    return { success: false, error: errorMessage };
                } finally {
                    set({ loading: false });
                }
            },

    // Get employee training courses (new API)
    getEmployeeTrainingCourses: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await empTrainingApi.getEmployeeTrainingCourses(params);
            const respData = response.data;
            console.log('Employee Training Courses Response:', respData);

            if (respData.STATUS === 'SUCCESSFUL') {
                const courses = respData.DB_DATA || [];
                set({
                    employeeTrainingCourses: courses,
                    loading: false
                });
                return { success: true, data: courses };
            } else {
                set({
                    error: respData.ERROR_DESCRIPTION || 'Failed to fetch training courses',
                    loading: false
                });
                showToast(respData.ERROR_DESCRIPTION || 'Failed to fetch training courses', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error fetching training courses:', error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'An error occurred while fetching training courses';
            set({
                error: errorMessage,
                loading: false
            });
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    },

    // Set selected course
    setSelectedCourse: (course) => {
        set({ selectedCourse: course });
    },

    // Clear selected course
    clearSelectedCourse: () => {
        set({ selectedCourse: null });
    },

    // Submit assessment
    submitAssessment: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await empTrainingApi.submitAssessment(data);
            const respData = response.data;
            console.log('Submit Assessment Response:', respData);

            if (respData.STATUS === 'SUCCESSFUL') {
                showToast('Assessment submitted successfully', 'success');
                return { success: true, data: respData.DB_DATA };
            } else {
                set({ error: respData.ERROR_DESCRIPTION || 'Failed to submit assessment' });
                showToast(respData.ERROR_DESCRIPTION || 'Failed to submit assessment', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error submitting assessment:', error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'An error occurred while submitting assessment';
            set({ error: errorMessage });
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        } finally {
            set({ loading: false });
        }
    },

    // Get assigned questions for assessment
    getAssignedQuestions: async () => {
        set({ loading: true, error: null });
        try {
            const response = await empTrainingApi.getAssignedQuestions();
            const respData = response.data;
            console.log('Assigned Questions Response:', respData);

            if (respData.STATUS === 'SUCCESSFUL' || respData.STATUS === 'SUCESSFUL') {
                set({ assignedQuestions: respData.DB_DATA, loading: false });
                return { success: true, data: respData.DB_DATA };
            } else {
                set({ error: respData.ERROR_DESCRIPTION || 'Failed to fetch questions', loading: false });
                showToast(respData.ERROR_DESCRIPTION || 'Failed to fetch questions', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error fetching assigned questions:', error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'An error occurred while fetching questions';
            set({ error: errorMessage, loading: false });
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    },

    // Submit employee assessment answers
    submitEmployeeAnswers: async (payload) => {
        set({ loading: true, error: null });
        try {
            const response = await empTrainingApi.submitEmployeeAnswers(payload);
            const respData = response.data;
            console.log('Submit Answers Response:', respData);

            if (respData.STATUS === 'SUCCESSFUL' || respData.STATUS === 'SUCESSFUL') {
                showToast('Assessment submitted successfully!', 'success');
                set({ loading: false });
                return { success: true, data: respData.DB_DATA };
            } else {
                set({ error: respData.ERROR_DESCRIPTION || 'Failed to submit assessment', loading: false });
                showToast(respData.ERROR_DESCRIPTION || 'Failed to submit assessment', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error submitting assessment:', error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'An error occurred while submitting assessment';
            set({ error: errorMessage, loading: false });
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    },

    // Complete a course
    completeCourse: async (courseId) => {
        try {
            const response = await empTrainingApi.completeCourse(courseId);
            const respData = response.data;
            console.log('Complete Course Response:', respData);

            if (respData.STATUS === 'SUCCESSFUL' || respData.STATUS === 'SUCESSFUL') {
                showToast('Course completed successfully!', 'success');
                return { success: true, data: respData.DB_DATA };
            } else {
                showToast(respData.ERROR_DESCRIPTION || 'Failed to complete course', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error completing course:', error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'An error occurred while completing course';
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    }
});

export default empTrainingViewModel;
