import { useState, useCallback, useEffect, useRef } from "react"
import performanceApi from "../../Model/Data/Performance/Performance"
import useStore from "../../Store/store"
import { showToast } from "../../Components/Toaster/Toaster"
import { useDebounce } from "../../services/__debounceServices"

const useFeedbackServices = () => {
    const gettingFeedback = useStore((state) => state.gettingFeedback)
    const feedbackData = useStore((state) => state.feedbackData)
    const feedbackLoading = useStore((state) => state.feedbackLoading)

    const [feedbackValue, setFeedbackValue] = useState({
        searchText: ''
    })

    const [showQuickFeedback, setShowQuickFeedback] = useState(false)
    const [performanceList, setPerformanceList] = useState([])
    const [selectedPerformance, setSelectedPerformance] = useState(null)
    const [performanceLoading, setPerformanceLoading] = useState(false)
    const [employees, setEmployees] = useState([])
    const [employeesLoading, setEmployeesLoading] = useState(false)
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

    // Create debounced search function
    const debouncedSearch = useDebounce((searchText) => {
        gettingFeedback(searchText)
    }, 500)

    const handleSearchFeedback = (searchText) => {
        setFeedbackValue((prevState) => ({
            ...prevState,
            searchText: searchText
        }))
        // Call API with search text (debounced)
        debouncedSearch(searchText)
    }

    const toggleQuickFeedback = () => {
        setShowQuickFeedback(!showQuickFeedback)
        if (!showQuickFeedback) {
            getPerformanceList()
            setSelectedPerformance(null)
            setSelectedEmployee(null)
            setEmployees([])
        }
    }

    const getPerformanceList = async () => {
        setPerformanceLoading(true)
        try {
            const response = await performanceApi.getPerformance()
            if (response?.data?.STATUS === 'SUCCESSFUL') {
                const list = response?.data?.DB_DATA || []
                const options = list.map((item) => ({
                    value: item._id,
                    label: item.name || ''
                }))
                setPerformanceList(options)
            } else {
                showToast(response?.data?.ERROR_DESCRIPTION || 'Failed to fetch performances', 'error')
                setPerformanceList([])
            }
        } catch (error) {
            console.error('Error fetching performance list:', error)
            showToast('Failed to fetch performance list', 'error')
            setPerformanceList([])
        } finally {
            setPerformanceLoading(false)
        }
    }

    const getEmployeesByPerformance = async (performanceName) => {
        if (!performanceName) {
            setEmployees([])
            return
        }
        setEmployeesLoading(true)
        setSelectedEmployee(null)
        try {
            const response = await performanceApi.getEmpGoal(performanceName)
            if (response?.data?.STATUS === 'SUCCESSFUL') {
                const list = response?.data?.DB_DATA || []
                const options = list.map((emp) => ({
                    value: emp.employee_id || emp._id,
                    label: emp.employee_name || emp.name || 'Unknown'
                }))
                setEmployees(options)
            } else {
                showToast(response?.data?.ERROR_DESCRIPTION || 'Failed to fetch employees', 'error')
                setEmployees([])
            }
        } catch (error) {
            console.error('Error fetching employees by performance:', error)
            showToast('Failed to fetch employees for this performance', 'error')
            setEmployees([])
        } finally {
            setEmployeesLoading(false)
        }
    }

    const handlePerformanceSelect = (selectedOption) => {
        setSelectedPerformance(selectedOption)
        if (selectedOption?.label) {
            getEmployeesByPerformance(selectedOption.label)
        } else {
            setEmployees([])
            setSelectedEmployee(null)
        }
    }

    const handleEmployeeSelect = (selectedOption) => {
        setSelectedEmployee(selectedOption)
    }

    const handleThumbSelect = (thumbType) => {
        setSelectedThumb(thumbType)
    }

    const handleSubmitFeedback = async () => {
        if (!selectedPerformance) {
            showToast('Please select a performance', 'error')
            return
        }
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
                performance_id: selectedPerformance.value,
                performance_name: selectedPerformance.label,
                employee_id: selectedEmployee.value,
                employee_name: selectedEmployee.label,
                comment: feedbackText.trim(),
                thumb: selectedThumb
            }

            const response = await performanceApi.createOngoingFeedback(payload)
            if (response.data.STATUS === "SUCCESSFUL") {
                showToast('Feedback submitted successfully', 'success')
                setSelectedPerformance(null)
                setSelectedEmployee(null)
                setEmployees([])
                setFeedbackText('')
                setSelectedThumb(null)
                setShowQuickFeedback(false)
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
        setSelectedPerformance(null)
        setSelectedEmployee(null)
        setEmployees([])
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
        performanceList,
        selectedPerformance,
        handlePerformanceSelect,
        performanceLoading,
        employees,
        employeesLoading,
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
