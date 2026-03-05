import { showToast } from "../../Components/Toaster/Toaster"
import performanceApi from "../../Model/Data/Performance/Performance"

const performanceViewModel = (set, get) => ({

    PRCData: [],
    PRCDataCopy: [],
    PRCPaginationData: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
    },
    goalsData: [],
    next: '',
    // goalsData:[],
    goalsDataCopy: [],
    goalsPaginationData: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
    },
    comptencyData: [],
    comptencyDataCopy: [],
    competencyPaginationData: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
    },
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

    gettingPRCData: async (page = 1, limit = 10) => {
        set({ PRCLoading: true })
        try {
            const response = await performanceApi.getPRC(page, limit)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // Replace data (not append) - proper pagination behavior
                set({ PRCData: responseData.DB_DATA })
                set({ next: responseData.Next ?? '' });
                set({ PRCDataCopy: responseData.DB_DATA })
                
                // Update pagination data - ensure it's always set, even if API doesn't return it
                if (responseData.pagination) {
                    set({
                        PRCPaginationData: {
                            currentPage: responseData.pagination.page || page,
                            totalPages: responseData.pagination.pages || 1,
                            total: responseData.pagination.total || 0,
                            limit: responseData.pagination.limit || limit
                        }
                    })
                } else {
                    // Fallback: set pagination based on data length and current page
                    // This ensures pagination state is always available
                    set({
                        PRCPaginationData: {
                            currentPage: page,
                            totalPages: responseData.DB_DATA && responseData.DB_DATA.length > 0 ? (responseData.Next ? page + 1 : page) : 1,
                            total: responseData.DB_DATA?.length || 0,
                            limit: limit
                        }
                    })
                }
            } else {
                // Handle error case - set empty data and reset pagination
                set({ PRCData: [] })
                set({ PRCDataCopy: [] })
                set({
                    PRCPaginationData: {
                        currentPage: 1,
                        totalPages: 1,
                        total: 0,
                        limit: limit
                    }
                })
            }
        }
        catch (err) {
            console.error('Error fetching PRC data:', err)
            // Handle error case - set empty data and reset pagination
            set({ PRCData: [] })
            set({ PRCDataCopy: [] })
            set({
                PRCPaginationData: {
                    currentPage: 1,
                    totalPages: 1,
                    total: 0,
                    limit: limit
                }
            })
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

    // PRC Pagination functions - matching employee list pattern
    goToNextPRCPage: () => {
        const paginationData = get().PRCPaginationData;
        if (paginationData && paginationData.currentPage < paginationData.totalPages) {
            // Use the same pattern as employee list - call gettingPRCData with next page
            get().gettingPRCData(paginationData.currentPage + 1, paginationData.limit || 10);
        }
    },

    goToPreviousPRCPage: () => {
        const paginationData = get().PRCPaginationData;
        if (paginationData && paginationData.currentPage > 1) {
            // Use the same pattern as employee list - call gettingPRCData with previous page
            get().gettingPRCData(paginationData.currentPage - 1, paginationData.limit || 10);
        }
    },

    goToPRCPage: (pageNumber) => {
        const paginationData = get().PRCPaginationData;
        const targetPage = parseInt(pageNumber);
        // Use the same pattern as employee list - validate and call gettingPRCData
        if (paginationData && targetPage >= 1 && targetPage <= paginationData.totalPages) {
            get().gettingPRCData(targetPage, paginationData.limit || 10);
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
            // Reset to first page when search is cleared - use the same pattern as employee list
            const currentLimit = get().PRCPaginationData?.limit || 10;
            get().gettingPRCData(1, currentLimit);
        } else {
            try {
                const response = await performanceApi.searchingPRC(searchText)

                const responseData = response.data
                if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                    const dbData = responseData.DB_DATA
                    set({ PRCData: dbData })
                    set({ PRCDataCopy: dbData })
                    
                    // Check if search response includes pagination data
                    if (responseData.pagination) {
                        set({
                            PRCPaginationData: {
                                currentPage: responseData.pagination.page || 1,
                                totalPages: responseData.pagination.pages || 1,
                                total: responseData.pagination.total || 0,
                                limit: responseData.pagination.limit || get().PRCPaginationData?.limit || 10
                            }
                        })
                    } else {
                        // Reset pagination during search (search typically returns all results)
                        set({
                            PRCPaginationData: {
                                currentPage: 1,
                                totalPages: 1,
                                total: Array.isArray(dbData) ? dbData.length : 0,
                                limit: get().PRCPaginationData?.limit || 10
                            }
                        })
                    }
                } else {
                    set({ PRCData: [] })
                    set({ PRCDataCopy: [] })
                    set({
                        PRCPaginationData: {
                            currentPage: 1,
                            totalPages: 1,
                            total: 0,
                            limit: get().PRCPaginationData?.limit || 10
                        }
                    })
                }
            } catch (err) {
                console.error('Search error:', err)
                set({ PRCData: [] })
                set({ PRCDataCopy: [] })
                set({
                    PRCPaginationData: {
                        currentPage: 1,
                        totalPages: 1,
                        total: 0,
                        limit: get().PRCPaginationData?.limit || 10
                    }
                })
                // Don't show error toast for search, just log it
            }
        }
    },

    gettingGoals: async (name, searchText = null, page = 1, limit = 10) => {
        set({ goalsLoading: true })
        // Store current filter and search text for pagination
        set({ goalsCurrentFilter: name, goalsCurrentSearchText: searchText })
        try {
            let response;
            if (searchText) {
                // Use search API if search text is provided
                response = await performanceApi.searchGoals(searchText, page, limit)
            } else {
                // Use regular get goals API - pass name instead of id
                response = await performanceApi.getGoals(name, page, limit)
            }
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // Replace data (not append) - proper pagination behavior
                set({ goalsData: responseData.DB_DATA })
                set({ goalsDataCopy: responseData.DB_DATA })
                
                // Update pagination data - ensure it's always set, even if API doesn't return it
                if (responseData.pagination) {
                    set({
                        goalsPaginationData: {
                            currentPage: responseData.pagination.page || page,
                            totalPages: responseData.pagination.pages || 1,
                            total: responseData.pagination.total || 0,
                            limit: responseData.pagination.limit || limit
                        }
                    })
                } else {
                    // Fallback: set pagination based on data length and current page
                    set({
                        goalsPaginationData: {
                            currentPage: page,
                            totalPages: responseData.DB_DATA && responseData.DB_DATA.length > 0 ? (responseData.Next ? page + 1 : page) : 1,
                            total: responseData.DB_DATA?.length || 0,
                            limit: limit
                        }
                    })
                }
            } else {
                // Handle error case - set empty data and reset pagination
                set({ goalsData: [] })
                set({ goalsDataCopy: [] })
                set({
                    goalsPaginationData: {
                        currentPage: 1,
                        totalPages: 1,
                        total: 0,
                        limit: limit
                    }
                })
            }
        }
        catch (err) {
            console.error('Error fetching goals data:', err)
            // Handle error case - set empty data and reset pagination
            set({ goalsData: [] })
            set({ goalsDataCopy: [] })
            set({
                goalsPaginationData: {
                    currentPage: 1,
                    totalPages: 1,
                    total: 0,
                    limit: limit
                }
            })
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch goals'
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

    // Store current filter/search state for pagination
    goalsCurrentFilter: null,
    goalsCurrentSearchText: null,

    // Goals Pagination functions - matching employee list pattern
    goToNextGoalsPage: () => {
        const paginationData = get().goalsPaginationData;
        if (paginationData && paginationData.currentPage < paginationData.totalPages) {
            // Use stored filter and search text
            get().gettingGoals(get().goalsCurrentFilter, get().goalsCurrentSearchText, paginationData.currentPage + 1, paginationData.limit || 10);
        }
    },

    goToPreviousGoalsPage: () => {
        const paginationData = get().goalsPaginationData;
        if (paginationData && paginationData.currentPage > 1) {
            // Use stored filter and search text
            get().gettingGoals(get().goalsCurrentFilter, get().goalsCurrentSearchText, paginationData.currentPage - 1, paginationData.limit || 10);
        }
    },

    goToGoalsPage: (pageNumber) => {
        const paginationData = get().goalsPaginationData;
        const targetPage = parseInt(pageNumber);
        // Use the same pattern as employee list - validate and call gettingGoals
        if (paginationData && targetPage >= 1 && targetPage <= paginationData.totalPages) {
            // Use stored filter and search text
            get().gettingGoals(get().goalsCurrentFilter, get().goalsCurrentSearchText, targetPage, paginationData.limit || 10);
        }
    },


    // gettingGoalsData:async()=>{
    //     try{
    //         // const response = 


    //     }
    //     catch(err){
    //         console.log(err)
    //     }
    // },

    gettingCompetency: async (reviewCycleId = null, searchText = null, page = 1, limit = 10) => {
        set({ competencyLoading: true })
        // Store current filter and search text for pagination
        set({ competencyCurrentFilter: reviewCycleId, competencyCurrentSearchText: searchText })
        try {
            const response = await performanceApi.getCompetency(reviewCycleId, searchText, page, limit)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // Replace data (not append) - proper pagination behavior
                set({ comptencyData: responseData.DB_DATA })
                set({ comptencyDataCopy: responseData.DB_DATA })
                
                // Update pagination data - ensure it's always set, even if API doesn't return it
                if (responseData.pagination) {
                    set({
                        competencyPaginationData: {
                            currentPage: responseData.pagination.page || page,
                            totalPages: responseData.pagination.pages || 1,
                            total: responseData.pagination.total || 0,
                            limit: responseData.pagination.limit || limit
                        }
                    })
                } else {
                    // Fallback: set pagination based on data length and current page
                    set({
                        competencyPaginationData: {
                            currentPage: page,
                            totalPages: responseData.DB_DATA && responseData.DB_DATA.length > 0 ? (responseData.Next ? page + 1 : page) : 1,
                            total: responseData.DB_DATA?.length || 0,
                            limit: limit
                        }
                    })
                }
            } else {
                // Handle error case - set empty data and reset pagination
                set({ comptencyData: [] })
                set({ comptencyDataCopy: [] })
                set({
                    competencyPaginationData: {
                        currentPage: 1,
                        totalPages: 1,
                        total: 0,
                        limit: limit
                    }
                })
            }
        }
        catch (err) {
            console.error('Error fetching competency data:', err)
            // Handle error case - set empty data and reset pagination
            set({ comptencyData: [] })
            set({ comptencyDataCopy: [] })
            set({
                competencyPaginationData: {
                    currentPage: 1,
                    totalPages: 1,
                    total: 0,
                    limit: limit
                }
            })
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

    // Store current filter/search state for pagination
    competencyCurrentFilter: null,
    competencyCurrentSearchText: null,

    // Competency Pagination functions - matching employee list pattern
    goToNextCompetencyPage: () => {
        const paginationData = get().competencyPaginationData;
        if (paginationData && paginationData.currentPage < paginationData.totalPages) {
            // Use stored filter and search text
            get().gettingCompetency(get().competencyCurrentFilter, get().competencyCurrentSearchText, paginationData.currentPage + 1, paginationData.limit || 10);
        }
    },

    goToPreviousCompetencyPage: () => {
        const paginationData = get().competencyPaginationData;
        if (paginationData && paginationData.currentPage > 1) {
            // Use stored filter and search text
            get().gettingCompetency(get().competencyCurrentFilter, get().competencyCurrentSearchText, paginationData.currentPage - 1, paginationData.limit || 10);
        }
    },

    goToCompetencyPage: (pageNumber) => {
        const paginationData = get().competencyPaginationData;
        const targetPage = parseInt(pageNumber);
        // Use the same pattern as employee list - validate and call gettingCompetency
        if (paginationData && targetPage >= 1 && targetPage <= paginationData.totalPages) {
            // Use stored filter and search text
            get().gettingCompetency(get().competencyCurrentFilter, get().competencyCurrentSearchText, targetPage, paginationData.limit || 10);
        }
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
    historyPaginationData: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
    },

    // Function to get main history data
    gettingMainHistory: async (page = 1, limit = 10) => {
        set({ historyLoading: true })
        console.log('Fetching main history data')
        try {
            const response = await performanceApi.getMainHistory(page, limit)
            const responseData = response.data
            console.log('Main history response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                // Replace data (not append) - proper pagination behavior
                set({
                    mainHistoryData: responseData.DB_DATA,
                    mainHistoryDataCopy: responseData.DB_DATA
                })
                console.log('Main history data set successfully:', responseData.DB_DATA)
                
                // Update pagination data - ensure it's always set, even if API doesn't return it
                if (responseData.pagination) {
                    set({
                        historyPaginationData: {
                            currentPage: responseData.pagination.page || page,
                            totalPages: responseData.pagination.pages || 1,
                            total: responseData.pagination.total || 0,
                            limit: responseData.pagination.limit || limit
                        }
                    })
                } else {
                    // Fallback: set pagination based on data length and current page
                    set({
                        historyPaginationData: {
                            currentPage: page,
                            totalPages: responseData.DB_DATA && responseData.DB_DATA.length > 0 ? (responseData.Next ? page + 1 : page) : 1,
                            total: responseData.DB_DATA?.length || 0,
                            limit: limit
                        }
                    })
                }
            } else {
                // Handle error case - set empty data and reset pagination
                set({ mainHistoryData: [] })
                set({ mainHistoryDataCopy: [] })
                set({
                    historyPaginationData: {
                        currentPage: 1,
                        totalPages: 1,
                        total: 0,
                        limit: limit
                    }
                })
            }
        } catch (err) {
            console.error('Error fetching main history:', err)
            // Handle error case - set empty data and reset pagination
            set({ mainHistoryData: [] })
            set({ mainHistoryDataCopy: [] })
            set({
                historyPaginationData: {
                    currentPage: 1,
                    totalPages: 1,
                    total: 0,
                    limit: limit
                }
            })
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch history data'
            showToast(error, 'error')
        } finally {
            set({ historyLoading: false })
        }
    },

    // History Pagination functions - matching employee list pattern
    goToNextHistoryPage: () => {
        const paginationData = get().historyPaginationData;
        if (paginationData && paginationData.currentPage < paginationData.totalPages) {
            // Use the same pattern as employee list - call gettingMainHistory with next page
            get().gettingMainHistory(paginationData.currentPage + 1, paginationData.limit || 10);
        }
    },

    goToPreviousHistoryPage: () => {
        const paginationData = get().historyPaginationData;
        if (paginationData && paginationData.currentPage > 1) {
            // Use the same pattern as employee list - call gettingMainHistory with previous page
            get().gettingMainHistory(paginationData.currentPage - 1, paginationData.limit || 10);
        }
    },

    goToHistoryPage: (pageNumber) => {
        const paginationData = get().historyPaginationData;
        const targetPage = parseInt(pageNumber);
        // Use the same pattern as employee list - validate and call gettingMainHistory
        if (paginationData && targetPage >= 1 && targetPage <= paginationData.totalPages) {
            get().gettingMainHistory(targetPage, paginationData.limit || 10);
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