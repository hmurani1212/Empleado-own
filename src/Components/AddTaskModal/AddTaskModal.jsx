import React, { useState } from 'react'
import { X } from 'lucide-react'
import useStore from '../../Store/store'
import { toast } from 'react-toastify'

const AddTaskModal = ({ isOpen, onClose, onReminderAdded }) => {
  const { addReminder, loading } = useStore()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder: '',
    notificationMethod: ''
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
    setFormData(prev => ({
      ...prev,
      notificationMethod: method
    }))
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
      case 'Set Manually':
        return timestamp // Default to current time for manual
      default:
        return timestamp
    }
  }

  // Get notification method values
  const getNotificationValues = (method) => {
    switch (method) {
      case 'App push notification':
        return { via_push_app: 1, via_email: 0, via_web: 0 }
      case 'Email':
        return { via_push_app: 0, via_email: 1, via_web: 0 }
      case 'App/Web Notifications':
        return { via_push_app: 0, via_email: 0, via_web: 1 }
      default:
        return { via_push_app: 0, via_email: 0, via_web: 0 }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
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
    
    if (!formData.notificationMethod) {
      toast.error('Please select a notification method')
      return
    }

    // Prepare API data
    const reminderTimestamp = getReminderTimestamp(formData.reminder)
    const notificationValues = getNotificationValues(formData.notificationMethod)
    
    const apiData = {
      title: formData.title,
      text: formData.description,
      time: reminderTimestamp,
      reminder_mannual_time: reminderTimestamp,
      ...notificationValues
    }

    // Make API call
    const result = await addReminder(apiData)
    
    if (result.success) {
      toast.success('Reminder added successfully!')
      
      // Call the callback to add reminder to local state
      if (onReminderAdded && result.data) {
        onReminderAdded(result.data)
      }
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        reminder: '',
        notificationMethod: ''
      })
      onClose()
    } else {
      toast.error(result.error || 'Failed to add reminder')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              {['Tomorrow', 'After 3 Days', 'By Weekend', 'By end of this month', 'Set Manually'].map((option) => (
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

          {/* Notification Method Options */}
          <div>
            <label className="block text-gray-800 font-medium mb-3">
              Send Reminder via
            </label>
            <div className="flex gap-2">
              {['App push notification', 'Email', 'App/Web Notifications'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => handleNotificationSelect(method)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.notificationMethod === method
                      ? 'bg-bgBlue text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-bgBlue text-white py-3 rounded-md font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddTaskModal
