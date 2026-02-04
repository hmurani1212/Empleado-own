import notificationsApi from "../../Model/Data/Notifications/Notifications"

const notificationsViewModel = (set, get) => ({
    // State
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    isNotificationPanelOpen: false,

    // Actions
    getNotifications: async (params = {}) => {
        set({ loading: true, error: null })
        try {
            const response = await notificationsApi.getNotifications(params)
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                const notifications = responseData.DB_DATA?.DB_DATA || []
                set({ 
                    notifications: notifications,
                    loading: false 
                })
                return notifications
            } else {
                set({ 
                    error: responseData.ERROR_DESCRIPTION || 'Failed to fetch notifications',
                    loading: false 
                })
                return []
            }
        } catch (err) {
            console.error('Error fetching notifications:', err)
            set({ 
                error: 'Failed to fetch notifications',
                loading: false 
            })
            return []
        }
    },

    getUnreadCount: async () => {
        try {
            const response = await notificationsApi.getUnreadCount()
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                set({ unreadCount: responseData.DB_DATA?.unread_count || 0 })
                return responseData.DB_DATA?.unread_count || 0
            }
        } catch (err) {
            console.error('Error fetching unread count:', err)
        }
    },

    markNotificationAsRead: async (notificationId) => {
        try {
            const response = await notificationsApi.markNotificationAsRead(notificationId)
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // Update the notification in the list
                set((state) => ({
                    notifications: state.notifications.map(notification =>
                        notification._id === notificationId
                            ? { ...notification, is_read: true }
                            : notification
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }))
                return true
            }
        } catch (err) {
            console.error('Error marking notification as read:', err)
        }
        return false
    },

    markAllNotificationsAsRead: async () => {
        try {
            const response = await notificationsApi.markAllNotificationsAsRead()
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // Update all notifications as read
                set((state) => ({
                    notifications: state.notifications.map(notification => ({
                        ...notification,
                        is_read: true
                    })),
                    unreadCount: 0
                }))
                return true
            }
        } catch (err) {
            console.error('Error marking all notifications as read:', err)
        }
        return false
    },

    // UI Actions
    toggleNotificationPanel: () => {
        set((state) => ({ 
            isNotificationPanelOpen: !state.isNotificationPanelOpen 
        }))
    },

    openNotificationPanel: () => {
        set({ isNotificationPanelOpen: true })
    },

    closeNotificationPanel: () => {
        set({ isNotificationPanelOpen: false })
    },

    // Utility functions
    formatNotificationTime: (timestamp) => {
        const date = new Date(timestamp * 1000)
        const now = new Date()
        const diffInSeconds = Math.floor((now - date) / 1000)
        
        if (diffInSeconds < 60) {
            return 'Just now'
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60)
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600)
            return `${hours} hour${hours > 1 ? 's' : ''} ago`
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400)
            return `${days} day${days > 1 ? 's' : ''} ago`
        } else {
            return date.toLocaleDateString()
        }
    },

    getNotificationType: (actionTypeId) => {
        const typeMap = {
            5: 'Notice',
            10: 'Salary Update',
            // Add more types as needed
        }
        return typeMap[actionTypeId] || 'Notification'
    },

    getNotificationIcon: (actionTypeId) => {
        const iconMap = {
            5: '📢', // Notice
            10: '💰', // Salary Update
            // Add more icons as needed
        }
        return iconMap[actionTypeId] || '🔔'
    },

    // Clear state
    clearNotifications: () => {
        set({ 
            notifications: [],
            unreadCount: 0,
            error: null 
        })
    }
})

export default notificationsViewModel
