import React, { useEffect, useRef } from 'react'
import {
  BsBell,
  BsCheckAll,
  BsX,
  BsExclamationCircle
} from 'react-icons/bs'
import {
  HiOutlineSpeakerphone,
  HiUser
} from 'react-icons/hi'
import {
  FaMoneyBillWave,
  FaFileAlt,
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa'
import {
  MdNotifications,
  MdDescription,
  MdEvent
} from 'react-icons/md'
import useStore from '../../Store/store'
import defaultUserAvatar from '../../constants/avatar'

// Helper function to get notification icon based on type
const getNotificationIcon = (actionTypeId) => {
  const iconMap = {
    5: <HiOutlineSpeakerphone className="text-blue-600" size={18} />, // Notice
    10: <FaMoneyBillWave className="text-green-600" size={18} />, // Salary Update
    15: <FaFileAlt className="text-purple-600" size={18} />, // Document
    20: <FaCalendarAlt className="text-orange-600" size={18} />, // Leave/Calendar
    25: <FaClock className="text-indigo-600" size={18} />, // Time/Attendance
    30: <FaCheckCircle className="text-green-600" size={18} />, // Approval
    35: <FaExclamationTriangle className="text-yellow-600" size={18} />, // Warning
    40: <MdEvent className="text-pink-600" size={18} />, // Event
    45: <MdDescription className="text-teal-600" size={18} />, // Application
    // Add more types as needed
  }

  return iconMap[actionTypeId] || <MdNotifications className="text-gray-600" size={18} />
}

// Notification Item Component
const NotificationItem = ({ notification, formatNotificationTime, handleNotificationClick, index, totalNotifications }) => {
  const [imageError, setImageError] = React.useState(false)
  const notificationIcon = getNotificationIcon(notification.action_type_id || notification.action_type || notification.notification_type)
  const isUnread = !notification.is_read

  return (
    <div>
      <div
        className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${isUnread ? 'bg-blue-50/50' : ''}`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          {/* User/Employee Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 bg-blue-100 flex items-center justify-center">
              {!imageError ? (
                <img
                  src={defaultUserAvatar}
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <HiUser className="text-blue-600" size={20} />
              )}
            </div>
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              {/* Notification Type Icon */}
              {/* <div className="flex-shrink-0 mt-0.5">
                {notificationIcon}
              </div> */}

              {/* Notification Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-800'}`}>
                  {notification.notification}
                </p>
                {/* <span className="text-xs text-gray-500 mt-1 block">
                  {formatNotificationTime(notification.entry_time)}
                </span> */}
              </div>

              {/* Unread Indicator */}
              {isUnread && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {index < totalNotifications - 1 && (
        <hr className="border-gray-200" />
      )}
    </div>
  )
}

const NotificationsPanel = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    isNotificationPanelOpen,
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    closeNotificationPanel,
    formatNotificationTime
  } = useStore()

  const panelRef = useRef(null)

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isNotificationPanelOpen) {
      getNotifications()
      getUnreadCount()
    }
  }, [isNotificationPanelOpen, getNotifications, getUnreadCount])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        closeNotificationPanel()
      }
    }

    if (isNotificationPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotificationPanelOpen, closeNotificationPanel])

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification._id)
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
  }

  return (
    <>
      {isNotificationPanelOpen && (
        <div
          className="fixed top-11 right-8 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden transform translate-x-[-50%]"
          ref={panelRef}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <BsBell className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Mark all as read"
                >
                  {/* <BsCheckAll size={16} /> */}
                </button>
              )}
              <button
                onClick={closeNotificationPanel}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <BsX size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-8 text-red-600">
                <BsExclamationCircle className="mr-2" />
                <span>{error}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <BsBell size={48} className="mb-2 opacity-50" />
                <span>No notifications yet</span>
                <span className="text-sm">We'll notify you when something important happens</span>
              </div>
            ) : (
              <div>
                {notifications.map((notification, index) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    formatNotificationTime={formatNotificationTime}
                    handleNotificationClick={handleNotificationClick}
                    index={index}
                    totalNotifications={notifications.length}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </>
  )
}

export default NotificationsPanel
