import remindersApi from "../../Model/Data/Reminders/Reminders"
import { toast } from 'react-toastify'

const remindersViewModel = (set, get) => ({
    // State
    reminders: [],
    loading: false,
    error: null,

    // Actions
    addReminder: async (reminderData) => {
        set({ loading: true, error: null })
        try {
            const response = await remindersApi.addReminder(reminderData)
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // Add the new reminder to the list
                set((state) => ({
                    reminders: [responseData.DB_DATA, ...state.reminders],
                    loading: false
                }))
                
                // Refresh dashboard data to get updated reminders list
                try {
                    const currentDate = new Date()
                    const currentMonth = currentDate.getMonth() + 1 // Month is 1-based (1-12)
                    const currentYear = currentDate.getFullYear()
                    
                    // Get the gettingEmpDashboardData function from store
                    const gettingEmpDashboardData = get().gettingEmpDashboardData
                    if (gettingEmpDashboardData) {
                        await gettingEmpDashboardData(currentMonth, currentYear)
                    }
                } catch (dashboardError) {
                    console.error('Error refreshing dashboard data after adding reminder:', dashboardError)
                    // Don't fail the add operation if dashboard refresh fails
                }
                
                return { success: true, data: responseData.DB_DATA }
            } else {
                set({ 
                    error: responseData.ERROR_DESCRIPTION || 'Failed to add reminder',
                    loading: false 
                })
                return { success: false, error: responseData.ERROR_DESCRIPTION }
            }
        } catch (err) {
            console.error('Error adding reminder:', err)
            set({ 
                error: 'Failed to add reminder',
                loading: false 
            })
            return { success: false, error: 'Failed to add reminder' }
        }
    },

    getReminders: async (params = {}) => {
        set({ loading: true, error: null })
        try {
            const response = await remindersApi.getReminders(params)
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                set({ 
                    reminders: responseData.DB_DATA || [],
                    loading: false 
                })
                return responseData.DB_DATA || []
            } else {
                set({ 
                    error: responseData.ERROR_DESCRIPTION || 'Failed to fetch reminders',
                    loading: false 
                })
                return []
            }
        } catch (err) {
            console.error('Error fetching reminders:', err)
            set({ 
                error: 'Failed to fetch reminders',
                loading: false 
            })
            return []
        }
    },

    updateReminder: async (reminderId, reminderData) => {
        set({ loading: true, error: null })
        try {
            const response = await remindersApi.updateReminder(reminderId, reminderData)
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // Update the reminder in the list
                set((state) => ({
                    reminders: state.reminders.map(reminder =>
                        reminder.id === reminderId
                            ? { ...reminder, ...responseData.DB_DATA }
                            : reminder
                    ),
                    loading: false
                }))
                return { success: true, data: responseData.DB_DATA }
            } else {
                set({ 
                    error: responseData.ERROR_DESCRIPTION || 'Failed to update reminder',
                    loading: false 
                })
                return { success: false, error: responseData.ERROR_DESCRIPTION }
            }
        } catch (err) {
            console.error('Error updating reminder:', err)
            set({ 
                error: 'Failed to update reminder',
                loading: false 
            })
            return { success: false, error: 'Failed to update reminder' }
        }
    },

    deleteReminder: async (reminderId) => {
        set({ loading: true, error: null })
        try {
            const response = await remindersApi.deleteReminder(reminderId)
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // Remove the reminder from the list
                set((state) => ({
                    reminders: state.reminders.filter(reminder => reminder.id !== reminderId),
                    loading: false
                }))
                toast.success("Reminder deleted successfully!")
                
                // Refresh dashboard data to get updated reminders list
                try {
                    const currentDate = new Date()
                    const currentMonth = currentDate.getMonth() + 1 // Month is 1-based (1-12)
                    const currentYear = currentDate.getFullYear()
                    
                    // Get the gettingEmpDashboardData function from store
                    const gettingEmpDashboardData = get().gettingEmpDashboardData
                    if (gettingEmpDashboardData) {
                        await gettingEmpDashboardData(currentMonth, currentYear)
                    }
                } catch (dashboardError) {
                    console.error('Error refreshing dashboard data after deleting reminder:', dashboardError)
                    // Don't fail the delete operation if dashboard refresh fails
                }
                
                return { success: true }
            } else {
                set({ 
                    error: responseData.ERROR_DESCRIPTION || 'Failed to delete reminder',
                    loading: false 
                })
                toast.error(responseData.ERROR_DESCRIPTION || 'Failed to delete reminder')
                return { success: false, error: responseData.ERROR_DESCRIPTION }
            }
        } catch (err) {
            console.error('Error deleting reminder:', err)
            set({ 
                error: 'Failed to delete reminder',
                loading: false 
            })
            toast.error('Failed to delete reminder')
            return { success: false, error: 'Failed to delete reminder' }
        }
    },

    updateReminderStatus: async (reminderId) => {
        set({ loading: true, error: null })
        try {
            const response = await remindersApi.updateReminderStatus(reminderId)
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                set({ loading: false })
                toast.success("Reminder sent successfully!")
                return { success: true, data: responseData.DB_DATA }
            } else {
                set({ 
                    error: responseData.ERROR_DESCRIPTION || 'Failed to update reminder status',
                    loading: false 
                })
                toast.error(responseData.ERROR_DESCRIPTION || 'Failed to update reminder status')
                return { success: false, error: responseData.ERROR_DESCRIPTION }
            }
        } catch (err) {
            console.error('Error updating reminder status:', err)
            set({ 
                error: 'Failed to update reminder status',
                loading: false 
            })
            toast.error('Failed to update reminder status')
            return { success: false, error: 'Failed to update reminder status' }
        }
    },

    // Utility functions
    formatReminderTime: (timestamp) => {
        const date = new Date(timestamp * 1000)
        return date.toLocaleString()
    },

    getReminderStatus: (status) => {
        const statusMap = {
            0: 'Not Sent',
            1: 'Pending',
            2: 'Sent',
            3: 'Failed'
        }
        return statusMap[status] || 'Unknown'
    },

    // Clear state
    clearReminders: () => {
        set({ 
            reminders: [],
            error: null 
        })
    },

    clearError: () => {
        set({ error: null })
    }
})

export default remindersViewModel
