import useStore from "../../Store/store";


const TrainingService = () => {
    const training_data = useStore((state) => state.allTraingig_data);
    const Training_datefn = useStore((state) => state.gettingAllTraingiList);
    const resetTrainingData = useStore((state) => state.resetTrainingData);
    const Add_training_course_fn = useStore((state) => state.Add_training_course_fn);
    const getCourseDetails = useStore((state) => state.getCourseDetails);
    const getCourseResources = useStore((state) => state.getCourseResources);
    const addCourseResources = useStore((state) => state.addCourseResources);
    const updateCourseResource = useStore((state) => state.updateCourseResource);
    const getCourseAssessments = useStore((state) => state.getCourseAssessments);
    const addCourseAssessment = useStore((state) => state.addCourseAssessment);
    const getCourseReviewer = useStore((state) => state.getCourseReviewer);
    const addCourseReviewer = useStore((state) => state.addCourseReviewer);
    const getCourseEmployeeAssignments = useStore((state) => state.getCourseEmployeeAssignments);
    const addCourseEmployeeAssignment = useStore((state) => state.addCourseEmployeeAssignment);
    const getCourseComments = useStore((state) => state.getCourseComments);
    const addCourseComment = useStore((state) => state.addCourseComment);
    const uploadFileToElephant = useStore((state) => state.uploadFileToElephant);
    const uploadTrainingFile = useStore((state) => state.uploadTrainingFile);
    const deteleCoursefn = useStore((state) => state.deteleCoursefn);
    const updateCoursefn = useStore((state) => state.updateCoursefn);
    const deleteCombinefn = useStore((state) => state.deleteCombinefn);
    const get_assessmen_q_fn = useStore((state) => state.get_assessmen_q_fn);
    const processPdfWithAI = useStore((state) => state.processPdfWithAI);
    const generateQuestionsFromResources = useStore((state) => state.generateQuestionsFromResources);
    const saveQuestion = useStore((state) => state.saveQuestion);
    const saveQuestions = useStore((state) => state.saveQuestions);
    const getCourseCompleteDetails = useStore((state) => state.getCourseCompleteDetails);
    const updateCourseAndResource = useStore((state) => state.updateCourseAndResource);
    const assignCourseToEmployee = useStore((state) => state.assignCourseToEmployee);
    const assignCourseByBranchDept = useStore((state) => state.assignCourseByBranchDept);
    const isLoadingCourseAssignment = useStore((state) => state.isLoadingCourseAssignment);
    const getCourseEmployees = useStore((state) => state.getCourseEmployees);
    const isLoadingCourseEmployees = useStore((state) => state.isLoadingCourseEmployees);
    const assignQuestionsByBranchDept = useStore((state) => state.assignQuestionsByBranchDept);
    const isLoadingQuestionAssignment = useStore((state) => state.isLoadingQuestionAssignment);
    const addQuestionsToBank = useStore((state) => state.addQuestionsToBank);
    const isLoadingAddQuestionsBank = useStore((state) => state.isLoadingAddQuestionsBank);
    const getNotesPoolNotebooks = useStore((state) => state.getNotesPoolNotebooks);
    const notesPoolNotebooks = useStore((state) => state.notesPoolNotebooks);
    const isLoadingNotesPoolNotebooks = useStore((state) => state.isLoadingNotesPoolNotebooks);
    const getCourseAssignedEmployees = useStore((state) => state.getCourseAssignedEmployees);
    const isLoadingCourseAssignedEmployees = useStore((state) => state.isLoadingCourseAssignedEmployees);
    const getEmployeeResolvedQuestions = useStore((state) => state.getEmployeeResolvedQuestions);
    const isLoadingResolvedQuestions = useStore((state) => state.isLoadingResolvedQuestions);
    const updateQuestionCorrectness = useStore((state) => state.updateQuestionCorrectness);
    const isUpdatingQuestionCorrectness = useStore((state) => state.isUpdatingQuestionCorrectness);
    const aiGradeAssessment = useStore((state) => state.aiGradeAssessment);
    const isAiGrading = useStore((state) => state.isAiGrading);
     const delete_course_fn = useStore((state) => state.delete_course_fn);
    const isLoadingTrainingData = useStore((state) => state.isLoadingTrainingData);
    const trainingListLoadMoreLoading = useStore((state) => state.trainingListLoadMoreLoading);



    return {
        training_data, Training_datefn, resetTrainingData, Add_training_course_fn, getCourseDetails, getCourseResources, addCourseResources, updateCourseResource, getCourseAssessments, addCourseAssessment, getCourseReviewer, addCourseReviewer, getCourseEmployeeAssignments, addCourseEmployeeAssignment, getCourseComments, addCourseComment, uploadFileToElephant, uploadTrainingFile, getNotesPoolNotebooks, notesPoolNotebooks, isLoadingNotesPoolNotebooks,
        deteleCoursefn, updateCoursefn, deleteCombinefn, get_assessmen_q_fn, processPdfWithAI, generateQuestionsFromResources, saveQuestion, saveQuestions, getCourseCompleteDetails, updateCourseAndResource, assignCourseToEmployee, assignCourseByBranchDept, isLoadingCourseAssignment, getCourseEmployees, isLoadingCourseEmployees, assignQuestionsByBranchDept, isLoadingQuestionAssignment, addQuestionsToBank, isLoadingAddQuestionsBank, getCourseAssignedEmployees, isLoadingCourseAssignedEmployees, getEmployeeResolvedQuestions, isLoadingResolvedQuestions, updateQuestionCorrectness, isUpdatingQuestionCorrectness, aiGradeAssessment, isAiGrading, 
        delete_course_fn, isLoadingTrainingData, trainingListLoadMoreLoading
    };
};


export default TrainingService;