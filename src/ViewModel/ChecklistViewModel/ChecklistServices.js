import { useState } from 'react'
import checklistApi from '../../Model/Data/Checklist/Checklist'
import { showToast } from '../../Components/Toaster/Toaster'

const useChecklist = () => {
    const [departments, setDepartments] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
    const [checklistForm, setChecklistForm] = useState({
        title: '',
        deptId: 0,
        personResponsible: 'admin',
        avgCompletionTime: 30,
        user_id: 0,
        requirement_title: '',
        response_type: '1'
    })

    // Get all departments
    const getAllDepartments = async () => {
        try {
            setLoading(true)
            const response = await checklistApi.getAllDepartments()
            const responseData = response.data

            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                setDepartments(responseData.DB_DATA || [])
                return responseData.DB_DATA || []
            } else {
                const error = responseData.ERROR_DESCRIPTION || 'Failed to fetch departments'
                showToast(error, 'error')
                return []
            }
        } catch (err) {
            console.log('Error fetching departments:', err)
            showToast('Error fetching departments', 'error')
            return []
        } finally {
            setLoading(false)
        }
    }

    // Get all employees
    const getAllEmployees = async () => {
        try {
            setLoading(true)
            const response = await checklistApi.getAllEmployees()
            const responseData = response.data

            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                setEmployees(responseData.DB_DATA || [])
                return responseData.DB_DATA || []
            } else {
                const error = responseData.ERROR_DESCRIPTION || 'Failed to fetch employees'
                showToast(error, 'error')
                return []
            }
        } catch (err) {
            console.log('Error fetching employees:', err)
            showToast('Error fetching employees', 'error')
            return []
        } finally {
            setLoading(false)
        }
    }

    // Create checklist
    const createChecklist = async (formData) => {
        try {
            setLoading(true)
            
            // Prepare payload based on user selections
            const payload = {
                title: formData.title,
                deptId: formData.deptId === 'global' ? 0 : formData.deptId,
                personResponsible: formData.personResponsible === 'admin' ? 'admin' : '0',
                avgCompletionTime: formData.avgCompletionTime,
                user_id: formData.user_id || 0,
                requirement_title: formData.requirement_title || '',
                response_type: formData.response_type || '1'
            }

            const response = await checklistApi.createChecklist(payload)
            const responseData = response.data

            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                showToast('Checklist created successfully', 'success')
                return true
            } else {
                const error = responseData.ERROR_DESCRIPTION || 'Failed to create checklist'
                showToast(error, 'error')
                return false
            }
        } catch (err) {
            console.log('Error creating checklist:', err)
            showToast('Error creating checklist', 'error')
            return false
        } finally {
            setLoading(false)
        }
    }

    // Update form field
    const updateFormField = (field, value) => {
        setChecklistForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Reset form
    const resetForm = () => {
        setChecklistForm({
            title: '',
            deptId: 0,
            personResponsible: 'admin',
            avgCompletionTime: 30,
            user_id: 0,
            requirement_title: '',
            response_type: '1'
        })
    }

    return {
        departments,
        employees,
        loading,
        checklistForm,
        getAllDepartments,
        getAllEmployees,
        createChecklist,
        updateFormField,
        resetForm
    }
}

export default useChecklist
