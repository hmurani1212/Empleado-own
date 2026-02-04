import { axiosInstancecoremodule } from "../../base"

const notificationsApi = {
    getNotifications: function(params = {}) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/notifications/pigeon',
            params: {
                limit: 20,
                notif_type: 'web',
                ...params
            }
        })
    },

    markNotificationAsRead: function(notificationId) {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/notifications/${notificationId}/read`,
            data: {
                notification_id: notificationId
            }
        })
    },

    markAllNotificationsAsRead: function() {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: '/api/v1/notifications/mark-all-read',
            data: {}
        })
    },

    // getUnreadCount: function() {
    //     return axiosInstancecoremodule.request({
    //         method: 'GET',
    //         url: '/api/v1/notifications/unread-count',
    //         params: {
    //             notif_type: 'web'
    //         }
    //     })
    // }
}

export default notificationsApi
