import { showToast } from "../../Components/Toaster/Toaster"
import performanceApi from "../../Model/Data/Performance/Performance"

const performanceViewModel = (set, get) => ({

    PRCData: [],
    PRCDataCopy: [],
    goalsData: [],
    next: '',
    // goalsData:[],
    goalsDataCopy: [],
    comptencyData: [],
    comptencyDataCopy: [],
    subGoalsData: [],
    subComptencyData: [],

    // New state for employee-specific goals
    employeeGoalsData: [],
    setProfileData: [],
    employeeGoalsNext: '',
    currentEmployeeId: null,
    lastWeekComments: [],
    
    // New state for employee-specific competencies
    employeeCompetencyData: [],
    employeeCompetencyNext: '',

    // New state for feedback
    feedbackData: [],
    feedbackDataCopy: [],

    // Loading states
    PRCLoading: false,
    goalsLoading: false,
    competencyLoading: false,
    feedbackLoading: false,
    subGoalsLoading: false,
    subCompetencyLoading: false,
    historyLoading: false,

    gettingPRCData: async () => {
        set({ PRCLoading: true })
        try {
            const response = await performanceApi.getPRC()
            // console.log('response', response)
            const responseData = response.data
            if (response.status === 200) {
                set({ PRCData: responseData.DB_DATA })
                set({ next: responseData.Next ?? '' });
                set({ PRCDataCopy: responseData.DB_DATA })
            }
        }
        catch (err) {
            console.log(err)
        } finally {
            set({ PRCLoading: false })
        }
    },

    gettingNextPRCData: async () => {
        const next = get().next
        if (next) {

            const parsedUrl = new URL(`${next}`);
            const pathAndQuery = parsedUrl.pathname + parsedUrl.search;


            try {
                const response = await performanceApi.getNextPRC(pathAndQuery)
                const responseData = response.data
                if (response.status === 200) {
                    const data = responseData.DB_DATA
                    set({ PRCData: [...get().PRCData, ...data], PRCDataCopy: [...get().PRCDataCopy, ...data] })
                    set({ next: responseData.Next ?? '' });
                }
            } catch (err) {
                console.log(err)
            }
        }

    },
    deleteSinglePRC: (id) => {
        set({ PRCData: get().PRCData?.filter((ele) => ele._id !== id) })
        set({ PRCDataCopy: get().PRCDataCopy?.filter((ele) => ele._id !== id) })
    },
    addNewRPC: (data) => {
        // console.log("datadatadata", data)
        set({ PRCData: [...new Set([...get().PRCData, data])] })
        set({ PRCDataCopy: [...new Set([...get().PRCDataCopy, data])] })
    },
    updatePRC: (data) => {

        set({
            PRCData: get().PRCData?.map((ele) => ele._id == data._id ? data : ele)

        })
        set({
            PRCDataCopy: get().PRCDataCopy?.map((ele) => ele._id == data._id ? data : ele)

        })
    },

    searchingPRC: async (searchText) => {
        if (searchText.trim() === "") {
            set({ PRCData: get().PRCDataCopy })
        } else {
            try {
                const response = await performanceApi.searchingPRC(searchText)

                const responseData = response.data
                if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                    const dbData = responseData.DB_DATA
                    set({ PRCData: dbData })
                } else {
                    set({ PRCData: [] })
                }
            } catch (err) {
                console.error('Search error:', err)
                set({ PRCData: [] })
                // Don't show error toast for search, just log it
            }
        }
    },

    gettingGoals: async (id, searchText = null) => {
        set({ goalsLoading: true })
        try {
            let response;
            if (searchText) {
                // Use search API if search text is provided
                response = await performanceApi.searchGoals(searchText)
            } else {
                // Use regular get goals API
                response = await performanceApi.getGoals(id)
            }
            // console.log('response gettingGoals', response)
            const responseData = response.data
            // if(response.status === 200){
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                set({ goalsData: responseData.DB_DATA })
            }


        }
        catch (err) {
            set({ goalsData: [] })
            const error = err.response.data.ERROR_DESCRIPTION
            showToast(error, 'error')
        } finally {
            set({ goalsLoading: false })
        }
    },


    addNewGoal: (data) => {
        set({ goalsData: [...new Set([...get().goalsData, data])] })
        set({ goalsDataCopy: [...new Set([...get().goalsDataCopy, data])] })
    },

    // New function to handle goal summary updates from goal creation response
    updateGoalSummaryByEmployee: (goalSummaryData) => {
        if (!goalSummaryData) {
            console.error('Goal summary data is required');
            return;
        }

        if (!Array.isArray(goalSummaryData)) {
            console.error('Goal summary data should be an array');
            return;
        }

        if (goalSummaryData.length === 0) {
            console.warn('Goal summary data is empty');
            return;
        }

        console.log('Updating goal summary for employees:', goalSummaryData);

        set((state) => {
            const currentGoalsData = [...state.goalsData];

            goalSummaryData.forEach((summaryItem) => {
                // Validate required fields
                if (!summaryItem.employee_id || !summaryItem.employee_name) {
                    console.error('Invalid summary item:', summaryItem);
                    return;
                }

                const existingEmployeeIndex = currentGoalsData.findIndex(
                    (item) => item.employee_id === summaryItem.employee_id
                );

                if (existingEmployeeIndex !== -1) {
                    // Update existing employee's goal count and score
                    console.log(`Updating existing employee ${summaryItem.employee_name} goals from ${currentGoalsData[existingEmployeeIndex].total_goals} to ${summaryItem.total_goals}`);
                    currentGoalsData[existingEmployeeIndex] = {
                        ...currentGoalsData[existingEmployeeIndex],
                        total_goals: summaryItem.total_goals || 0,
                        total_score: summaryItem.total_score || 0
                    };
                } else {
                    // Add new employee to the list
                    console.log(`Adding new employee ${summaryItem.employee_name} with ${summaryItem.total_goals} goals`);
                    currentGoalsData.push({
                        employee_id: summaryItem.employee_id,
                        employee_name: summaryItem.employee_name,
                        total_goals: summaryItem.total_goals || 0,
                        total_score: summaryItem.total_score || 0
                    });
                }
            });

            console.log('Updated goals data:', currentGoalsData);

            return {
                goalsData: currentGoalsData,
                goalsDataCopy: currentGoalsData
            };
        });
    },

    updateGoal: (data) => {

        set({
            goalsData: get().goalsData?.map((ele) => ele._id == data._id ? data : ele)

        })
        set({
            goalsDataCopy: get().goalsDataCopy?.map((ele) => ele._id == data._id ? data : ele)

        })
    },


    // gettingGoalsData:async()=>{
    //     try{
    //         // const response = 


    //     }
    //     catch(err){
    //         console.log(err)
    //     }
    // },

    gettingCompetency: async (reviewCycleId = null, searchText = null) => {
        set({ competencyLoading: true })
        try {
            const response = await performanceApi.getCompetency(reviewCycleId, searchText)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                set({ comptencyData: responseData.DB_DATA })
                set({ comptencyDataCopy: responseData.DB_DATA })
            }
        }
        catch (err) {
            set({ comptencyData: [] })
            set({ comptencyDataCopy: [] })
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch competencies'
            showToast(error, 'error')
        } finally {
            set({ competencyLoading: false })
        }
    },

    gettingFeedback: async (searchText = '') => {
        set({ feedbackLoading: true })
        try {
            const params = {};
            if (searchText && searchText.trim()) {
                params.text = searchText.trim();
            }
            const response = await performanceApi.getOngoingFeedback(params)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                set({ feedbackData: responseData.DB_DATA })
                set({ feedbackDataCopy: responseData.DB_DATA })
            }
        }
        catch (err) {
            set({ feedbackData: [] })
            set({ feedbackDataCopy: [] })
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch feedback'
            showToast(error, 'error')
        } finally {
            set({ feedbackLoading: false })
        }
    },

    addNewComptency: (data) => {
        set({ comptencyData: [...new Set([...get().comptencyData, data])] })
        set({ comptencyDataCopy: [...new Set([...get().comptencyDataCopy, data])] })
    },

    updateCompetencySummaryByEmployee: (competencySummaryData) => {
        if (!competencySummaryData) {
            console.error('Competency summary data is required');
            return;
        }
        if (!Array.isArray(competencySummaryData)) {
            console.error('Competency summary data should be an array');
            return;
        }
        if (competencySummaryData.length === 0) {
            console.warn('Competency summary data is empty');
            return;
        }
        // console.log('Updating competency summary for employees:', competencySummaryData);
        set((state) => {
            const currentCompetencyData = [...state.comptencyData];
            competencySummaryData.forEach((summaryItem) => {
                if (!summaryItem.employee_id || !summaryItem.employee_name) {
                    console.error('Invalid summary item:', summaryItem);
                    return;
                }
                const existingEmployeeIndex = currentCompetencyData.findIndex(
                    (item) => item.employee_id === summaryItem.employee_id
                );
                if (existingEmployeeIndex !== -1) {
                    console.log(`Updating existing employee ${summaryItem.employee_name} competencies from ${currentCompetencyData[existingEmployeeIndex].total_competency} to ${summaryItem.total_competency}`);
                    currentCompetencyData[existingEmployeeIndex] = {
                        ...currentCompetencyData[existingEmployeeIndex],
                        total_competency: summaryItem.total_competency || 0,
                        total_score: summaryItem.total_score || 0
                    };
                } else {
                    console.log(`Adding new employee ${summaryItem.employee_name} with ${summaryItem.total_competency} competencies`);
                    currentCompetencyData.push({
                        employee_id: summaryItem.employee_id,
                        employee_name: summaryItem.employee_name,
                        total_competency: summaryItem.total_competency || 0,
                        total_score: summaryItem.total_score || 0
                    });
                }
            });
            console.log('Updated competency data:', currentCompetencyData);
            return {
                comptencyData: currentCompetencyData,
                comptencyDataCopy: currentCompetencyData
            };
        });
    },

    gettingSubCompetency: async (employeeId) => {
        try {
            const response = await performanceApi.getSubCompetency(employeeId)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                const dbData = responseData.DB_DATA
                set({ subComptencyData: dbData })
            }
        } catch (error) {
            console.log(error)
            set({ subComptencyData: [] })
        }
    },
    deleteSingleCompetency: (id) => {
        set({ subComptencyData: get().subComptencyData?.filter((ele) => ele._id !== id) })
    },
    gettingSubGoals: async (data) => {
        try {
            // Use the existing getGoalsByEmployeeId function instead of non-existent getSubGoals
            const response = await performanceApi.getGoalsByEmployeeId(data.employee_id)
            const responseData = response.data;
            // console.log('this is new next', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                const dbData = responseData.DB_DATA;
                console.log('this is new next11111111111', dbData)
                set({ subGoalsData: dbData });
            }

        } catch (error) {
            console.error('Error fetching sub goals:', error)
            const err = error.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch sub goals'
            showToast(err, 'error')
            set({ subGoalsData: [] })
        }
    },

    deleteSingleGoal: (id) => {
        set({ subGoalsData: get().subGoalsData?.filter((ele) => ele._id !== id) })
    },

    // New functions for employee-specific goals
    gettingGoalsByEmployeeId: async (employeeId) => {
        set({ subGoalsLoading: true })
        console.log('Fetching goals for employee ID:', employeeId)
        try {
            const response = await performanceApi.getGoalsByEmployeeId(employeeId)
            const responseData = response.data
            console.log('Employee goals response:111111111111111111', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                set({
                    employeeGoalsData: responseData.DB_DATA,
                    setProfileData: responseData.emp_DATA,
                    employeeGoalsNext: responseData.Next || '',
                    currentEmployeeId: employeeId,
                    lastWeekComments: responseData.last_week_comments || []
                })
                console.log('Employee goals data set successfully:', responseData.DB_DATA)
            }
        } catch (err) {
            console.error('Error fetching employee goals:', err)
            set({ employeeGoalsData: [] })
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch employee goals'
            showToast(error, 'error')
        } finally {
            set({ subGoalsLoading: false })
        }
    },

    gettingNextEmployeeGoals: async () => {
        const next = get().employeeGoalsNext
        if (!next) {
            console.log('No more pages available')
            return
        }

        try {
            const response = await performanceApi.getGoalsByEmployeeId(null, next)
            const responseData = response.data;
            console.log("this is next Gaol of employee", responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                set((state) => ({
                    employeeGoalsData: [...state.employeeGoalsData, ...responseData.DB_DATA],
                    employeeGoalsNext: responseData.Next || ''
                }))
            }
        } catch (err) {
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch next page'
            showToast(error, 'error')
        }
    },

    clearEmployeeGoals: () => {
        set({
            employeeGoalsData: [],
            employeeGoalsNext: '',
            currentEmployeeId: null
        })
    },

    // Function to refresh employee goals data
    refreshEmployeeGoals: async (employeeId) => {
        if (employeeId) {
            await get().gettingGoalsByEmployeeId(employeeId)
        }
    },

    // New function for employee-specific competencies
    gettingCompetencyByEmployeeId: async (employeeId) => {
        set({ subCompetencyLoading: true })
        console.log('Fetching competencies for employee ID:', employeeId)
        try {
            const response = await performanceApi.getSubCompetency(employeeId)
            const responseData = response.data
            // console.log('Employee competency response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                set({
                    employeeCompetencyData: responseData.DB_DATA,
                    setProfileData: responseData.emp_DATA, // Set profile data from competency API
                    employeeCompetencyNext: responseData.Next || '',
                    currentEmployeeId: employeeId
                })
                console.log('Employee competency data set successfully:', responseData.DB_DATA)
                console.log('Profile data set from competency API:', responseData.emp_DATA)
            }
        } catch (err) {
            console.error('Error fetching employee competencies:', err)
            set({ employeeCompetencyData: [] })
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch employee competencies'
            showToast(error, 'error')
        } finally {
            set({ subCompetencyLoading: false })
        }
    },

    // Function to refresh employee competency data
    refreshEmployeeCompetency: async (employeeId) => {
        if (employeeId) {
            await get().gettingCompetencyByEmployeeId(employeeId)
        }
    },

    // New state for employee-specific feedback
    employeeFeedbackData: [],
    employeeFeedbackDataCopy: [],

    // Function to get employee feedback by ID
    gettingFeedbackByEmployeeId: async (employeeId) => {
        console.log('Fetching feedback for employee ID:', employeeId)
        try {
            const response = await performanceApi.getEmployeeFeedback(employeeId)
            const responseData = response.data
            console.log('Employee feedback response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                set({
                    employeeFeedbackData: responseData.DB_DATA,
                    employeeFeedbackDataCopy: responseData.DB_DATA,
                    currentEmployeeId: employeeId
                })
                console.log('Employee feedback data set successfully:', responseData.DB_DATA)
            }
        } catch (err) {
            console.error('Error fetching employee feedback:', err)
            set({ employeeFeedbackData: [] })
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch employee feedback'
            showToast(error, 'error')
        }
    },

    // Function to clear employee feedback data
    clearEmployeeFeedback: () => {
        set({
            employeeFeedbackData: [],
            employeeFeedbackDataCopy: [],
        })
    },

    // New state for main history data
    mainHistoryData: [],
    mainHistoryDataCopy: [],

    // Function to get main history data
    gettingMainHistory: async () => {
        set({ historyLoading: true })
        console.log('Fetching main history data')
        try {
            const response = await performanceApi.getMainHistory()
            const responseData = response.data
            console.log('Main history response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                set({
                    mainHistoryData: responseData.DB_DATA,
                    mainHistoryDataCopy: responseData.DB_DATA
                })
                console.log('Main history data set successfully:', responseData.DB_DATA)
            }
        } catch (err) {
            console.error('Error fetching main history:', err)
            set({ mainHistoryData: [] })
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch history data'
            showToast(error, 'error')
        } finally {
            set({ historyLoading: false })
        }
    },

    // Function to clear main history data
    clearMainHistory: () => {
        set({
            mainHistoryData: [],
            mainHistoryDataCopy: [],
        })
    },

    // New state for employee-specific history data
    employeeHistoryData: [],
    employeeHistoryDataCopy: [],

    // Function to get employee-specific history data
    gettingEmployeeHistory: async (employeeId) => {
        set({ historyLoading: true })
        console.log('Fetching employee history data for:', employeeId)
        try {
            const response = await performanceApi.getHistory(employeeId)
            const responseData = response.data
            console.log('Employee history response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                set({
                    employeeHistoryData: responseData.DB_DATA,
                    employeeHistoryDataCopy: responseData.DB_DATA
                })
                console.log('Employee history data set successfully:', responseData.DB_DATA)
            }
        } catch (err) {
            console.error('Error fetching employee history:', err)
            set({ employeeHistoryData: [] })
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch employee history'
            showToast(error, 'error')
        } finally {
            set({ historyLoading: false })
        }
    },

    // Function to clear employee history data
    clearEmployeeHistory: () => {
        set({
            employeeHistoryData: [],
            employeeHistoryDataCopy: [],
        })
    },
})

export default performanceViewModel