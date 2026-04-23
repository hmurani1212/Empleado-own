import React, { useState, useRef } from 'react'
import { X } from 'lucide-react'
import useStore from '../../Store/store'
import { toast } from 'react-toastify'

const AddTaskModal = ({ isOpen, onClose, onReminderAdded }) => {
  const addReminder = useStore((state) => state.addReminder)
  const isSubmittingRef = useRef(false)
  const [isAdding, setIsAdding] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder: '',
    notificationMethods: [] // multiple options: 'App push notification' | 'Email' | 'App/Web Notifications'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleReminderSelect = (reminder) => {
    setFormData(prev => ({
      ...prev,
      reminder: reminder
    }))
  }

  const handleNotificationSelect = (method) => {
    setFormData(prev => {
      const current = prev.notificationMethods || []
      const isSelected = current.includes(method)
      const next = isSelected ? current.filter((m) => m !== method) : [...current, method]
      return { ...prev, notificationMethods: next }
    })
  }

  // Convert reminder option to timestamp
  const getReminderTimestamp = (reminderOption) => {
    const now = new Date()
    const timestamp = Math.floor(now.getTime() / 1000)
    
    switch (reminderOption) {
      case 'Tomorrow':
        return timestamp + (24 * 60 * 60) // 24 hours from now
      case 'After 3 Days':
        return timestamp + (3 * 24 * 60 * 60) // 3 days from now
      case 'By Weekend':
        const daysUntilSaturday = (6 - now.getDay()) % 7
        return timestamp + (daysUntilSaturday * 24 * 60 * 60)
      case 'By end of this month':
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return Math.floor(endOfMonth.getTime() / 1000)
      default:
        return timestamp
    }
  }

  // Get notification method values for API (supports multiple selected methods)
  const getNotificationValues = (methods) => {
    const list = Array.isArray(methods) ? methods : []
    return {
      via_push_app: list.includes('App push notification') ? 1 : 0,
      via_email: list.includes('Email') ? 1 : 0,
      via_web: list.includes('App/Web Notifications') ? 1 : 0
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Prevent duplicate submissions (e.g. double/triple click or strict mode)
    if (isSubmittingRef.current || isAdding) return
    isSubmittingRef.current = true
    setIsAdding(true)

    try {
    // Basic validation with toaster
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a reminder description')
      return
    }

    if (!formData.reminder) {
      toast.error('Please select a reminder time')
      return
    }

    if (!formData.notificationMethods?.length) {
      toast.error('Please select at least one notification method')
      return
    }

    // Prepare API data
    const reminderTimestamp = getReminderTimestamp(formData.reminder)
    const notificationValues = getNotificationValues(formData.notificationMethods)

    const apiData = {
      title: formData.title,
      text: formData.description,
      time: reminderTimestamp,
      reminder_mannual_time: reminderTimestamp,
      ...notificationValues
    }

    // Make API call (single call only; guard above prevents duplicates)
    const result = await addReminder(apiData)

    if (result.success) {
      toast.success('Reminder added successfully!')

      // Call the callback to add reminder to local state
      if (onReminderAdded) {
        // Provide a normalized reminder shape so UI can render immediately
        // even before dashboard refresh API finishes.
        onReminderAdded({
          ...(result.data || {}),
          id: result?.data?.id ?? Date.now(),
          title: result?.data?.title ?? formData.title,
          text: result?.data?.text ?? formData.description,
          reminder_time: result?.data?.reminder_time ?? reminderTimestamp,
          notification_methods: result?.data?.notification_methods ?? {
            via_push_app: notificationValues.via_push_app,
            via_email: notificationValues.via_email,
            via_web: notificationValues.via_web
          }
        })
      }

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        reminder: '',
        notificationMethods: []
      })
      onClose()
    } else {
      toast.error(result.error || 'Failed to add reminder')
    }
    } finally {
      isSubmittingRef.current = false
      setIsAdding(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-transparent flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-bgBlue text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Task</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-gray-800 font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Title"
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-gray-800 font-medium mb-2">
              Reminder Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Reminder Description"
              rows={3}
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Reminder Options */}
          <div>
            <label className="block text-gray-800 font-medium mb-3">
              Reminder
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Tomorrow', 'After 3 Days', 'By Weekend', 'By end of this month'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleReminderSelect(option)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.reminder === option
                      ? 'bg-bgBlue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Method Options (multi-select) */}
          <div>
            <label className="block text-gray-800 font-medium mb-3">
              Send Reminder via
            </label>
            <div className="flex flex-wrap justify-between gap-2">
              {['App push notification', 'Email', 'App/Web Notifications'].map((method) => {
                const isSelected = (formData.notificationMethods || []).includes(method)
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handleNotificationSelect(method)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-bgBlue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {method}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={isAdding}
            className="w-full bg-bgBlue text-white py-3 rounded-md font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddTaskModal
