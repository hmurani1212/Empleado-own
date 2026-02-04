import { useState } from "react";
import useStore from "../../../Store/store";

const useEmpTrainingService = () => {
    // Get state and functions from store
    const trainingData = useStore((state) => state.trainingData);
    const employeeTrainingCourses = useStore((state) => state.employeeTrainingCourses);
    const selectedCourse = useStore((state) => state.selectedCourse);
    const loading = useStore((state) => state.loading);
    const error = useStore((state) => state.error);
    const getEmployeeTraining = useStore((state) => state.getEmployeeTraining);
    const getEmployeeTrainingCourses = useStore((state) => state.getEmployeeTrainingCourses);
    const setSelectedCourse = useStore((state) => state.setSelectedCourse);
    const clearSelectedCourse = useStore((state) => state.clearSelectedCourse);
    const markEmployeeAsStarted = useStore((state) => state.markEmployeeAsStarted);
    const markEmployeeAsCompleted = useStore((state) => state.markEmployeeAsCompleted);
    const getAssessment = useStore((state) => state.getAssessment);
    const submitAssessment = useStore((state) => state.submitAssessment);
    const clearTrainingData = useStore((state) => state.clearTrainingData);
    const setLoading = useStore((state) => state.setLoading);
    const setError = useStore((state) => state.setError);

    // Local state for UI components
    const [activeTab, setActiveTab] = useState('enrolled');
    const [searchTerm, setSearchTerm] = useState('');

    // Tab change handler
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    // Search handler
    const handleSearchChange = (term) => {
        setSearchTerm(term);
    };

    // Filter courses based on search term
    const filterCourses = (courses) => {
        if (!searchTerm) return courses;
        return courses.filter(course => 
            course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // Get filtered enrolled courses
    const getFilteredEnrolledCourses = () => {
        return filterCourses(trainingData.enrolledCourses || []);
    };


    // Get certificates (completed courses from enrolled courses)
    const getCertificates = () => {
        return (trainingData.enrolledCourses || []).filter(course => course.status === 'Completed');
    };

    // Get training stats
    const getTrainingStats = () => {
        return trainingData.stats || {
            enrolledCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            certificatesEarned: 0
        };
    };


    // Load initial data based on active tab
    const loadTabData = async (tabId) => {
        try {
            // Always load the main training data for both tabs
            await getEmployeeTraining();
        } catch (error) {
            console.error('Error loading tab data:', error);
        }
    };

    return {
        // State
        trainingData,
        employeeTrainingCourses,
        selectedCourse,
        assignedQuestions: useStore((state) => state.assignedQuestions),
        loading,
        error,
        
        // UI State
        activeTab,
        searchTerm,
        
        // Functions
        getEmployeeTraining,
        getEmployeeTrainingCourses,
        setSelectedCourse,
        clearSelectedCourse,
        markEmployeeAsStarted,
        markEmployeeAsCompleted,
        getAssessment,
        submitAssessment,
        getAssignedQuestions: useStore((state) => state.getAssignedQuestions),
        submitEmployeeAnswers: useStore((state) => state.submitEmployeeAnswers),
        completeCourse: useStore((state) => state.completeCourse),
        clearTrainingData,
        setLoading,
        setError,
        
        // UI Functions
        handleTabChange,
        handleSearchChange,
        
        // Data formatting functions
        getFilteredEnrolledCourses,
        getCertificates,
        getTrainingStats,
        
        // Action handlers
        loadTabData
    };
};

export default useEmpTrainingService;
