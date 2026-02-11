import { useState, useCallback } from "react"
import performanceApi from "../../Model/Data/Performance/Performance"
import employeesApi from "../../Model/Data/Employees/Employees"
import useStore from "../../Store/store"
import { showToast } from "../../Components/Toaster/Toaster"

const useFeedbackServices = () => {
    const gettingFeedback = useStore((state) => state.gettingFeedback)
    const feedbackData = useStore((state) => state.feedbackData)
    const feedbackLoading = useStore((state) => state.feedbackLoading)

    const [feedbackValue, setFeedbackValue] = useState({
        searchText: ''
    })

    const [showQuickFeedback, setShowQuickFeedback] = useState(false)
    const [employees, setEmployees] = useState([])
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [feedbackText, setFeedbackText] = useState('')
    const [selectedThumb, setSelectedThumb] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [openMenuValue, setOpenMenuValue] = useState({});
    const toggleMenuValue = (index, isOpen) => {
        setOpenMenuValue((prevOpenMenu) => ({
            ...prevOpenMenu,
            [index]: isOpen
        }))
    }

    const handleSearchFeedback = (searchText) => {
        setFeedbackValue((prevState) => ({
            ...prevState,
            searchText: searchText
        }))
        // Filter feedback data based on search text
        // This could be implemented with local filtering or API call
    }

    const toggleQuickFeedback = () => {
        setShowQuickFeedback(!showQuickFeedback)
        if (!showQuickFeedback) {
            getEmployees()
        }
    }

    const getEmployees = async () => {
        try {
            const response = await employeesApi.gettingAllEmployees();

            if (response?.data?.STATUS === 'SUCCESSFUL') {
                const result = response?.data?.DB_DATA;
                console.log('Employee API response:', result)
                
                // Handle different response structures
                let employeesList = [];
                if (Array.isArray(result)) {
                    employeesList = result;
                } else if (result?.employees && Array.isArray(result.employees)) {
                    employeesList = result.employees;
                } else if (result?.data && Array.isArray(result.data)) {
                    employeesList = result.data;
                }
                
                const employeeOptions = employeesList.map(emp => ({
                    value: emp.id || emp.employee_id || emp._id,
                    label: emp.name || emp.employee_name || emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown Employee'
                }))
                
                setEmployees(employeeOptions)
                console.log('Mapped employee options:', employeeOptions)
            } else {
                console.error('API returned error:', response?.data)
                showToast(response?.data?.ERROR_DESCRIPTION || 'Failed to fetch employees', 'error')
                setEmployees([])
            }
        } catch (error) {
            console.error('Error fetching employees:', error)
            showToast('Failed to fetch employees', 'error')
            setEmployees([])
        }
    }

    const handleEmployeeSelect = (selectedOption) => {
        setSelectedEmployee(selectedOption)
    }

    const handleThumbSelect = (thumbType) => {
        setSelectedThumb(thumbType)
    }

    const handleSubmitFeedback = async () => {
        if (!selectedEmployee) {
            showToast('Please select an employee', 'error')
            return
        }
        if (!selectedThumb) {
            showToast('Please select a feedback type', 'error')
            return
        }
        if (!feedbackText.trim()) {
            showToast('Please enter feedback text', 'error')
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                employee_id: selectedEmployee.value,
                employee_name: selectedEmployee.label,
                comment: feedbackText.trim(),
                thumb: selectedThumb
            }

            const response = await performanceApi.createOngoingFeedback(payload)
            if (response.data.STATUS === "SUCCESSFUL") {
                showToast('Feedback submitted successfully', 'success')
                // Reset form
                setSelectedEmployee(null)
                setFeedbackText('')
                setSelectedThumb(null)
                setShowQuickFeedback(false)
                // Refresh feedback data
                gettingFeedback()
            } else {
                showToast(response.data?.MESSAGE || 'Failed to submit feedback', 'error')
            }
        } catch (error) {
            console.error('Error submitting feedback:', error)
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'Failed to submit feedback'
            showToast(errorMessage, 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancelFeedback = () => {
        setSelectedEmployee(null)
        setFeedbackText('')
        setSelectedThumb(null)
        setShowQuickFeedback(false)
    }

    const getFeedbackIcon = (type, count) => {
        if (count === 0) return null;

        switch (type) {
            case 'thumbs_up':
                return '👍';
            case 'thumbs_down':
                return '👎';
            case 'award':
                return '🏆';
            default:
                return null;
        }
    }

    const getFeedbackColor = (type, count) => {
        if (count === 0) return 'gray';

        switch (type) {
            case 'thumbs_up':
                return 'green';
            case 'thumbs_down':
                return 'red';
            case 'award':
                return 'yellow';
            default:
                return 'gray';
        }
    }

    return {
        feedbackValue,
        feedbackData,
        gettingFeedback,
        handleSearchFeedback,
        openMenuValue,
        toggleMenuValue,
        getFeedbackIcon,
        getFeedbackColor,
        showQuickFeedback,
        toggleQuickFeedback,
        employees,
        selectedEmployee,
        handleEmployeeSelect,
        feedbackText,
        setFeedbackText,
        selectedThumb,
        handleThumbSelect,
        handleSubmitFeedback,
        handleCancelFeedback,
        isSubmitting,
        feedbackLoading
    }
}

export default useFeedbackServices
