import employeePerformanceApi from "../../../Model/Data/Employees/EmployeePerformance"
import { showToast } from "../../../Components/Toaster/Toaster"

// const empPerformanceViewModel = (set, get) => ({
//     // State
//     employeePerformance: {
//         employee: null,
//         reviewCycle: null,
//         stats: {
//             stars: 0,
//             likes: 0,
//             dislikes: 0,
//             awards: 0
//         }
//     },
//     performanceGoals: [],
//     performanceCompetency: [],
//     performanceFeedback: [],
//     performanceHistory: [],
//     loading: false,
//     activeTab: "goals",

//     // Actions
//     gettingEmployeePerformance: async () => {
//         try {
//             set({ loading: true })

//             const response = await employeePerformanceApi.getEmployeePerformance()
//             const responseData = response.data

//             if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
//                 set({
//                     employeePerformance: responseData.DB_DATA || { employee: null, reviewCycle: null, stats: { stars: 0, likes: 0, dislikes: 0, awards: 0 } },
//                     loading: false
//                 })
//             } else {
//                 showToast('Failed to fetch employee performance', 'error')
//                 set({ loading: false })
//             }
//         } catch (error) {
//             console.error('Error fetching employee performance:', error)
//             showToast('Error fetching employee performance', 'error')
//             set({ loading: false })
//         }
//     },

//     gettingPerformanceGoals: async () => {
//         try {
//             const response = await employeePerformanceApi.getPerformanceGoals()
//             const responseData = response.data

//             if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
//                 set({
//                     performanceGoals: responseData.DB_DATA || []
//                 })
//             } else {
//                 showToast('Failed to fetch performance goals', 'error')
//             }
//         } catch (error) {
//             console.error('Error fetching performance goals:', error)
//             showToast('Error fetching performance goals', 'error')
//         }
//     },

//     gettingPerformanceCompetency: async () => {
//         try {
//             const response = await employeePerformanceApi.getPerformanceCompetency()
//             const responseData = response.data

//             if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
//                 set({
//                     performanceCompetency: responseData.DB_DATA || []
//                 })
//             } else {
//                 showToast('Failed to fetch performance competency', 'error')
//             }
//         } catch (error) {
//             console.error('Error fetching performance competency:', error)
//             showToast('Error fetching performance competency', 'error')
//         }
//     },

//     gettingPerformanceFeedback: async () => {
//         try {
//             const response = await employeePerformanceApi.getPerformanceFeedback()
//             const responseData = response.data

//             if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
//                 set({
//                     performanceFeedback: responseData.DB_DATA || []
//                 })
//             } else {
//                 showToast('Failed to fetch performance feedback', 'error')
//             }
//         } catch (error) {
//             console.error('Error fetching performance feedback:', error)
//             showToast('Error fetching performance feedback', 'error')
//         }
//     },

//     gettingPerformanceHistory: async () => {
//         try {
//             const response = await employeePerformanceApi.getPerformanceHistory()
//             const responseData = response.data

//             if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
//                 set({
//                     performanceHistory: responseData.DB_DATA || []
//                 })
//             } else {
//                 showToast('Failed to fetch performance history', 'error')
//             }
//         } catch (error) {
//             console.error('Error fetching performance history:', error)
//             showToast('Error fetching performance history', 'error')
//         }
//     },

//     // Tab management
//     setActiveTab: (tab) => {
//         set({ activeTab: tab })
//     },

//     // Refresh data
//     refreshEmployeePerformance: () => {
//         const { gettingEmployeePerformance } = get()
//         gettingEmployeePerformance()
//     }
// })

// export default empPerformanceViewModel



const gettingEmployeePerformance = async (params = {}) => {
    try {
        const response = await employeePerformanceApi.getEmployeePerformance(params)
        const responseData = response.data

        if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
            return responseData
        } else {
            console.error('Failed to fetch employee performance:', responseData)
            showToast('Failed to fetch employee performance', 'error')
            return null
        }
    } catch (error) {
        console.error('Error fetching employee performance:', error)
        showToast('Error fetching employee performance', 'error')
        return null
    }
};

const deleteEmployeeGoal = async (goalId) => {
    try {
        const response = await employeePerformanceApi.deleteGoal(goalId)
        const responseData = response.data

        if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
            showToast('Goal deleted successfully', 'success')
            return responseData
        } else {
            console.error('Failed to delete goal:', responseData)
            showToast('Failed to delete goal', 'error')
            return null
        }
    } catch (error) {
        console.error('Error deleting goal:', error)
        showToast('Error deleting goal', 'error')
        return null
    }
};

const updateEmployeeGoal = async (data) => {
    try {
        const response = await employeePerformanceApi.updateGoal(data)
        const responseData = response.data

        if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
            showToast('Goal updated successfully', 'success')
            return responseData
        } else {
            console.error('Failed to update goal:', responseData)
            showToast('Failed to update goal', 'error')
            return null
        }
    } catch (error) {
        console.error('Error updating goal:', error)
        showToast('Error updating goal', 'error')
        return null
    }
};

const toggleEmployeeGoalStatus = async (goalId) => {
    try {
        const response = await employeePerformanceApi.toggleGoalStatus(goalId)
        const responseData = response.data

        if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
            showToast(responseData.MESSAGE || 'Goal status updated', 'success')
            return responseData
        } else {
            console.error('Failed to toggle goal status:', responseData)
            showToast(responseData?.ERROR_DESCRIPTION || 'Failed to toggle goal status', 'error')
            return null
        }
    } catch (error) {
        console.error('Error toggling goal status:', error)
        const errMsg = error?.response?.data?.ERROR_DESCRIPTION || 'Error toggling goal status'
        showToast(errMsg, 'error')
        return null
    }
};




export { gettingEmployeePerformance, deleteEmployeeGoal, updateEmployeeGoal, toggleEmployeeGoalStatus }


