import React, { useState, useEffect } from 'react'
import CustomButton from '../../../Components/CustomButton/CustomButton'
import { Typography, Card, CardBody } from '@material-tailwind/react'
import useStore from '../../../Store/store'
import { AddEditExperience } from '../../Dashoboard/AddEditExperience'
import { getUserData } from '../../../Authentication/jwt_decode'
import { toast } from 'react-toastify'
import employeesApi from '../../../Model/Data/Employees/Employees'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import ConfirmationDialog from '../../../Components/ConfirmationDialog/ConfirmationDialog'
import useProfileCompletion from '../../../hooks/useProfileCompletion'

const tableHeader = [
    "Org/Institute", "Designation", "Duration", "Salary", "Leaving Reason", "Action"
]

const EmpProfileExperience = () => {
    const [experienceData, setExperienceData] = useState([])
    const [loading, setLoading] = useState(true)
    const [openDropdown, setOpenDropdown] = useState(null) // Track which dropdown is open
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false) // Show delete confirmation dialog
    const [deleteItem, setDeleteItem] = useState(null) // Item to be deleted
    const [deleteLoading, setDeleteLoading] = useState(false) // Loading state for delete
    const { getEmployeeProfileV2, openDrawer, settingComponent, closeDrawer, settingDrawerTitle, settingDrawerSize } = useStore()
    const { fetchProfileCompletion } = useProfileCompletion()

    // Fetch employee profile data
    const fetchEmployeeProfile = async () => {
        setLoading(true)
        try {
            const userId = localStorage.getItem('user_id') || '9119548'
            const response = await getEmployeeProfileV2(userId)
            
            if (response && response.DB_DATA) {
                setExperienceData(response.DB_DATA.employee_experience || [])
            }
            
            // Refresh profile completion percentage
            fetchProfileCompletion()
        } catch (error) {
            console.error('Error fetching experience data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployeeProfile()
    }, [])


    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && !event.target.closest('.relative')) {
                setOpenDropdown(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [openDropdown])

    // Handle Edit action
    const handleEdit = (experience) => {
        setOpenDropdown(null) // Close dropdown
        
        // Open drawer with edit form
        settingDrawerTitle('Edit Experience Details')
        settingDrawerSize(800) // Set specific width instead of 'lg'
        settingComponent(
            <ExperienceFormWrapper 
                editData={experience} 
                isEdit={true}
                onSuccess={fetchEmployeeProfile}
            />
        )
        openDrawer()
    }

    // Handle Delete action
    const handleDelete = (experienceId) => {
        setOpenDropdown(null) // Close dropdown
        
        // Find the experience record to get its details
        const experienceRecord = experienceData.find(item => item.id === experienceId)
        setDeleteItem(experienceRecord)
        setShowDeleteConfirm(true) // Show custom confirmation dialog
    }

    // Handle confirmed delete
    const handleConfirmDelete = async () => {
        if (!deleteItem) return
        
        setDeleteLoading(true)
        try {
            const orgId = localStorage.getItem('org_id') || '10381947' // Use org_id for employee side
            const response = await employeesApi.deleteEmployeeExperience(orgId, deleteItem.id)
            
            if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                toast.success('Experience record deleted successfully!')
                fetchEmployeeProfile() // Refresh the data
                setShowDeleteConfirm(false) // Close dialog
                setDeleteItem(null) // Clear delete item
            } else {
                toast.error(response.data?.ERROR_DESCRIPTION || 'Failed to delete experience record')
            }
        } catch (error) {
            console.error('Error deleting experience record:', error)
            toast.error('Failed to delete experience record. Please try again.')
        } finally {
            setDeleteLoading(false)
        }
    }

    // Handle cancel delete
    const handleCancelDelete = () => {
        setShowDeleteConfirm(false)
        setDeleteItem(null)
    }

    // Create a wrapper component that manages its own state
    const ExperienceFormWrapper = ({ editData = null, isEdit = false, onSuccess = null }) => {
        const [formData, setFormData] = useState({
            org_name: '',
            designation: '',
            from_date: '',
            to_date: '',
            salary: '',
            leave_reason: ''
        })
        const [validationErrors, setValidationErrors] = useState({})
        const [isSubmitting, setIsSubmitting] = useState(false)

        // Populate form data when editing
        useEffect(() => {
            if (isEdit && editData) {
                setFormData({
                    org_name: editData.org_name || '',
                    designation: editData.designation || '',
                    from_date: editData.from_date ? new Date(editData.from_date).toISOString().split('T')[0] : '',
                    to_date: editData.to_date ? new Date(editData.to_date).toISOString().split('T')[0] : '',
                    salary: editData.salary || '',
                    leave_reason: editData.leave_reason || ''
                })
            }
        }, [isEdit, editData])

        const handleInputChange = (e) => {
            const { name, value } = e.target
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
            // Clear validation error when user starts typing
            if (validationErrors[name]) {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: ''
                }))
            }
        }

        // Validation function
        const validateForm = () => {
            const errors = {}
            
            // Check Organization Name
            if (!formData.org_name || formData.org_name.trim() === '') {
                errors.org_name = 'Organization Name is required'
                return { isValid: false, errors, firstError: 'Organization Name is required' }
            }
            
            // Check Designation
            if (!formData.designation || formData.designation.trim() === '') {
                errors.designation = 'Designation is required'
                return { isValid: false, errors, firstError: 'Designation is required' }
            }
            
            // Check From Date
            if (!formData.from_date || formData.from_date.trim() === '') {
                errors.from_date = 'From Date is required'
                return { isValid: false, errors, firstError: 'From Date is required' }
            }
            
            // Check To Date
            if (!formData.to_date || formData.to_date.trim() === '') {
                errors.to_date = 'To Date is required'
                return { isValid: false, errors, firstError: 'To Date is required' }
            }
            
            // Validate date range
            const fromDate = new Date(formData.from_date)
            const toDate = new Date(formData.to_date)
            if (toDate < fromDate) {
                errors.to_date = 'To Date cannot be earlier than From Date'
                return { isValid: false, errors, firstError: 'To Date cannot be earlier than From Date' }
            }
            
            // Check Salary
            if (!formData.salary || formData.salary.trim() === '') {
                errors.salary = 'Salary is required'
                return { isValid: false, errors, firstError: 'Salary is required' }
            }
            
            // Validate salary (should be a positive number)
            const salary = parseFloat(formData.salary)
            if (isNaN(salary) || salary < 0) {
                errors.salary = 'Please enter a valid salary amount'
                return { isValid: false, errors, firstError: 'Please enter a valid salary amount' }
            }
            
            // Check Leaving Reason
            if (!formData.leave_reason || formData.leave_reason.trim() === '') {
                errors.leave_reason = 'Reason of Leaving is required'
                return { isValid: false, errors, firstError: 'Reason of Leaving is required' }
            }
            
            return { isValid: true, errors: {}, firstError: null }
        }

        const handleSubmit = async (e) => {
            e.preventDefault()
            
            // Prevent multiple submissions
            if (isSubmitting) return
            
            // Validate form
            const validation = validateForm()
            if (!validation.isValid) {
                setValidationErrors(validation.errors)
                toast.error(validation.firstError)
                return
            }
            
            setIsSubmitting(true)
            
            try {
                // Get user data from JWT token
                const userData = getUserData()
                
                if (!userData) {
                    toast.error('User data not found. Please login again.')
                    return
                }
                
                // Determine employee ID based on role
                let employeeId
                if (userData.roleId === 'Employee') {
                    // For Employee role, use org_id (org_data._id)
                    employeeId = userData.org_id
                } else {
                    // For Admin role, use org_oneid (existing implementation)
                    employeeId = userData.org_oneid
                }
                
                if (!employeeId) {
                    toast.error('Employee ID not found. Please login again.')
                    return
                }
                
                // Map form data to API payload format
                const payload = {
                    org_name: formData.org_name,
                    designation: formData.designation,
                    from_date: formData.from_date,
                    to_date: formData.to_date,
                    salary: parseFloat(formData.salary),
                    leaving_reason: formData.leave_reason
                }
                
                
                // Call the API
                let response;
                if (isEdit && editData) {
                    // Update existing record
                    const orgId = localStorage.getItem('org_id') || '10381947'
                    response = await employeesApi.updateEmployeeExperience(orgId, {
                        id: editData.id,
                        ...payload
                    })
                } else {
                    // Create new record
                    response = await employeesApi.addEmployeeExperience(employeeId, payload)
                }
                
                if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                    toast.success(isEdit ? 'Experience information updated successfully!' : 'Experience information added successfully!')
                    closeDrawer()
                    if (onSuccess) {
                        onSuccess() // Call the success callback
                    } else {
                        fetchEmployeeProfile() // Fallback to refresh
                    }
                } else {
                    toast.error(response.data?.ERROR_DESCRIPTION || response.data?.MESSAGE || `Failed to ${isEdit ? 'update' : 'add'} experience information`)
                }
                
            } catch (error) {
                console.error('Error adding experience info:', error)
                toast.error(error.response?.data?.MESSAGE || 'Failed to add experience information. Please try again.')
            } finally {
                setIsSubmitting(false)
            }
        }

        return (
            <AddEditExperience 
                experienceValue={{
                    show: true,
                    addState: !isEdit, // Show "Submit" for add, "Update" for edit
                    loading: isSubmitting,
                    org_name: formData.org_name,
                    designation: formData.designation,
                    date_from: formData.from_date,
                    date_upto: formData.to_date,
                    salary: formData.salary,
                    leaving_reason: formData.leave_reason,
                    validationErrors
                }}
                handleExpeirenceInputChange={handleInputChange}
                handleSubmitExperience={handleSubmit}
            />
        )
    }

    const handleAddExperience = () => {
        settingDrawerTitle("Add Experience")
        settingDrawerSize(800)
        settingComponent(<ExperienceFormWrapper />)
        openDrawer()
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString()
    }

    return (
        <div className='flex flex-col gap-4 p-2'>
        
            <div className='flex items-center justify-between'>
                <span className='text-[20px]'>Experience Info</span>
                <button className='bg-bgBlue  capitalize py-2 px-4 font-medium text-[12px] rounded-[10px] text-white hover:bg-blue-600 cursor-pointer' onClick={handleAddExperience}>
                    Add Experience
                </button>
                {/* <CustomButton 
                    title="Add Experience"
                    onClick={handleAddExperience}
                    className='bg-bgBlue text-white'
                /> */}
            </div>

            {loading ? (
                <Card className="w-full">
                    <CardBody className="text-center py-12">
                        <Typography color="gray" className="mb-4">
                            Loading experience details...
                        </Typography>
                    </CardBody>
                </Card>
            ) : experienceData.length > 0 ? (
                <div>
                    <table className="w-[100%] min-w-max text-left">
                        <thead className='sticky top-[-9px]'>
                            <tr>
                                {tableHeader?.map((head, i) => (
                                    <th
                                        key={i}
                                        className="border-b border-t border-gray-300 bg-blue-gray-50 p-4"
                                    >
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal leading-none opacity-70 capitalize"
                                        >
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {experienceData.map((experience, index) => (
                                <tr key={index} className="even:bg-blue-gray-50/50">
                                    {/* Org/Institute */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {experience.org_name || 'N/A'}
                                        </Typography>
                                    </td>
                                    {/* Designation */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {experience.designation || 'N/A'}
                                        </Typography>
                                    </td>
                                    {/* Duration */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {formatDate(experience.from_date)} - {formatDate(experience.to_date)}
                                        </Typography>
                                    </td>
                                    {/* Salary */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {experience.salary || 'N/A'}
                                        </Typography>
                                    </td>
                                    {/* Leaving Reason */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {experience.leave_reason || 'N/A'}
                                        </Typography>
                                    </td>
                                    {/* Action */}
                                    <td className="p-4">
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === experience.id ? null : experience.id)}
                                                className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                                            >
                                                Actions
                                                <ChevronDownIcon className="w-4 h-4" />
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            {openDropdown === experience.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                                                    <button
                                                        onClick={() => {
                                                            handleEdit(experience)
                                                            setOpenDropdown(null)
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-t-md"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleDelete(experience.id)
                                                            setOpenDropdown(null)
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-md"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <Card className="w-full">
                    <CardBody className="text-center py-12">
                        <Typography variant="h6" color="blue-gray" className="mb-2">
                            No Experience Details Found
                        </Typography>
                        <Typography color="gray" className="mb-4">
                            Add your work experience to get started
                        </Typography>
                    </CardBody>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                openDialog={showDeleteConfirm}
                handleOpen={handleCancelDelete}
                handleConfirm={handleConfirmDelete}
                title="Delete Experience Record"
                message={`Are you sure you want to delete the experience record for "${deleteItem?.org_name}"? This action cannot be undone.`}
                loading={deleteLoading}
            />
        </div>
    )
}

export default EmpProfileExperience