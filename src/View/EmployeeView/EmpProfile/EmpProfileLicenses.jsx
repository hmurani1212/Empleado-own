import React, { useState, useEffect } from 'react'
import CustomButton from '../../../Components/CustomButton/CustomButton'
import { Typography, Card, CardBody } from '@material-tailwind/react'
import useStore from '../../../Store/store'
import LicenseTypeEditAdd from '../../Dashoboard/LicenseTypeEditAdd'
import { getUserData } from '../../../Authentication/jwt_decode'
import { toast } from 'react-toastify'
import employeesApi from '../../../Model/Data/Employees/Employees'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import ConfirmationDialog from '../../../Components/ConfirmationDialog/ConfirmationDialog'
import useProfileCompletion from '../../../hooks/useProfileCompletion'

const tableHeader = [
    "License Type", "Title", "License#", "Issuing Authority", "Issue Date", "Expiry Date", "Action"
]

const EmpProfileLicenses = () => {
    const [licenseData, setLicenseData] = useState([])
    const [loading, setLoading] = useState(true)
    const [licenseTypes, setLicenseTypes] = useState([])
    const [loadingLicenseTypes, setLoadingLicenseTypes] = useState(true)
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
                setLicenseData(response.DB_DATA.employee_License || [])
            }
            
            // Refresh profile completion percentage
            fetchProfileCompletion()
        } catch (error) {
            console.error('Error fetching license data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch license types
    const fetchLicenseTypes = async () => {
        try {
            setLoadingLicenseTypes(true)
            console.log('Fetching license types...')
            const response = await employeesApi.getLicenseTypes()
            console.log('License types response:', response)
            console.log('License types data:', response?.data?.DB_DATA)

            if (response && response?.data?.STATUS === 'SUCCESSFUL') {
                const licenseTypesData = response?.data?.DB_DATA || []
                console.log('Setting license types:', licenseTypesData)
                setLicenseTypes(licenseTypesData)
                console.log('License types set successfully, count:', licenseTypesData.length)
            } else {
                console.log('No license types found or error:', response)
                setLicenseTypes([])
            }
        } catch (error) {
            console.error('Error fetching license types:', error)
            setLicenseTypes([])
        } finally {
            console.log('Setting loadingLicenseTypes to false')
            setLoadingLicenseTypes(false)
        }
    }

    useEffect(() => {
        fetchEmployeeProfile()
        // Don't fetch license types on page load, fetch them when user clicks "Add License"
    }, [])

    // Debug loading state changes
    useEffect(() => {
        console.log('loadingLicenseTypes state changed:', loadingLicenseTypes)
    }, [loadingLicenseTypes])

    useEffect(() => {
        console.log('licenseTypes state changed:', licenseTypes)
    }, [licenseTypes])

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
    const handleEdit = async (license) => {
        setOpenDropdown(null) // Close dropdown
        
        // Fetch license types for the dropdown
        await fetchLicenseTypes()
        
        // Open drawer with edit form
        settingDrawerTitle('Edit License Details')
        settingDrawerSize(800) // Set specific width instead of 'lg'
        settingComponent(
            <LicenseFormWrapper 
                editData={license} 
                isEdit={true}
                onSuccess={fetchEmployeeProfile}
            />
        )
        openDrawer()
    }

    // Handle Delete action
    const handleDelete = (licenseId) => {
        setOpenDropdown(null) // Close dropdown
        
        // Find the license record to get its details
        const licenseRecord = licenseData.find(item => item.id === licenseId)
        setDeleteItem(licenseRecord)
        setShowDeleteConfirm(true) // Show custom confirmation dialog
    }

    // Handle confirmed delete
    const handleConfirmDelete = async () => {
        if (!deleteItem) return
        
        setDeleteLoading(true)
        try {
            const orgId = localStorage.getItem('org_id') || '10381947' // Use org_id for employee side
            const response = await employeesApi.deleteEmployeeLicense(orgId, deleteItem.id)
            
            if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                toast.success('License record deleted successfully!')
                fetchEmployeeProfile() // Refresh the data
                setShowDeleteConfirm(false) // Close dialog
                setDeleteItem(null) // Clear delete item
            } else {
                toast.error(response.data?.ERROR_DESCRIPTION || 'Failed to delete license record')
            }
        } catch (error) {
            console.error('Error deleting license record:', error)
            toast.error('Failed to delete license record. Please try again.')
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
    const LicenseFormWrapper = ({ editData = null, isEdit = false, onSuccess = null }) => {
        const [formData, setFormData] = useState({
            license_type: '',
            license_title: '',
            license_number: '',
            issuing_authority: '',
            issue_date: '',
            expiry_date: ''
        })
        const [validationErrors, setValidationErrors] = useState({})
        const [isSubmitting, setIsSubmitting] = useState(false)

        // Populate form data when editing
        useEffect(() => {
            if (isEdit && editData) {
                setFormData({
                    license_type: editData.license_type || '',
                    license_title: editData.license_title || '',
                    license_number: editData.license_number || '',
                    issuing_authority: editData.issuing_authority || '',
                    issue_date: editData.issue_date ? new Date(editData.issue_date).toISOString().split('T')[0] : '',
                    expiry_date: editData.expiry_date ? new Date(editData.expiry_date).toISOString().split('T')[0] : ''
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

        const handleSelectChange = (selectedOption, fieldName) => {
            setFormData(prev => ({
                ...prev,
                [fieldName]: selectedOption?.value || selectedOption
            }))
            // Clear validation error when user makes selection
            if (validationErrors[fieldName]) {
                setValidationErrors(prev => ({
                    ...prev,
                    [fieldName]: ''
                }))
            }
        }

        // Validation function
        const validateForm = () => {
            const errors = {}

            // Check License Title
            if (!formData.license_title || formData.license_title.trim() === '') {
                errors.license_title = 'License Title is required'
                return { isValid: false, errors, firstError: 'License Title is required' }
            }

            // Check License Type
            if (!formData.license_type || (typeof formData.license_type === 'string' && formData.license_type.trim() === '')) {
                errors.license_type = 'License Type is required'
                return { isValid: false, errors, firstError: 'License Type is required' }
            }

            // Check License Number
            if (!formData.license_number || formData.license_number.trim() === '') {
                errors.license_number = 'License Number is required'
                return { isValid: false, errors, firstError: 'License Number is required' }
            }

            // Check Issuing Authority
            if (!formData.issuing_authority || formData.issuing_authority.trim() === '') {
                errors.issuing_authority = 'Issuing Authority is required'
                return { isValid: false, errors, firstError: 'Issuing Authority is required' }
            }

            // Check Issue Date
            if (!formData.issue_date || formData.issue_date.trim() === '') {
                errors.issue_date = 'Issue Date is required'
                return { isValid: false, errors, firstError: 'Issue Date is required' }
            }

            // Check Expiry Date
            if (!formData.expiry_date || formData.expiry_date.trim() === '') {
                errors.expiry_date = 'Expiry Date is required'
                return { isValid: false, errors, firstError: 'Expiry Date is required' }
            }

            // Validate date range
            const issueDate = new Date(formData.issue_date)
            const expiryDate = new Date(formData.expiry_date)
            if (expiryDate <= issueDate) {
                errors.expiry_date = 'Expiry Date must be after Issue Date'
                return { isValid: false, errors, firstError: 'Expiry Date must be after Issue Date' }
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
                    license_type: formData.license_type,
                    license_title: formData.license_title,
                    license_number: formData.license_number,
                    issuing_authority: formData.issuing_authority,
                    issue_date: formData.issue_date,
                    expiry_date: formData.expiry_date
                }

                console.log('Submitting license data:', payload)
                console.log('Employee ID:', employeeId)
                console.log('User Role:', userData.roleDbId)

                // Call the API
                let response;
                if (isEdit && editData) {
                    // Update existing record
                    const orgId = localStorage.getItem('org_id') || '10381947'
                    response = await employeesApi.updateEmployeeLicense(orgId, {
                        id: editData.id,
                        ...payload
                    })
                } else {
                    // Create new record
                    response = await employeesApi.addEmployeeLicense(employeeId, payload)
                }

                if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                    toast.success(isEdit ? 'License information updated successfully!' : 'License information added successfully!')
                    closeDrawer()
                    if (onSuccess) {
                        onSuccess() // Call the success callback
                    } else {
                        fetchEmployeeProfile() // Fallback to refresh
                    }
                } else {
                    toast.error(response.data?.ERROR_DESCRIPTION || response.data?.MESSAGE || `Failed to ${isEdit ? 'update' : 'add'} license information`)
                }

            } catch (error) {
                console.error('Error adding license info:', error)
                toast.error(error.response?.data?.MESSAGE || 'Failed to add license information. Please try again.')
            } finally {
                setIsSubmitting(false)
            }
        }

        // Debug logging
        console.log('LicenseFormWrapper props:', {
            licenseTypes: licenseTypes,
            loadingLicenseTypes: loadingLicenseTypes,
            licenseTypesLength: licenseTypes.length
        })

        return (
            <LicenseTypeEditAdd
                licenseValue={{
                    show: true,
                    addState: !isEdit, // Show "Submit" for add, "Update" for edit
                    addType: false,
                    loading: isSubmitting,
                    license_type: formData.license_type,
                    license_title: formData.license_title,
                    license_number: formData.license_number,
                    issuing_authority: formData.issuing_authority,
                    issue_date: formData.issue_date,
                    expiry_date: formData.expiry_date,
                    license_type_list: licenseTypes,
                    loadingLicenseTypes,
                    validationErrors
                }}
                handleSubmitLicense={handleSubmit}
                handleLicenseInputChange={handleInputChange}
                handleSelectLicense={handleSelectChange}
                handleSubmitLicenseType={() => { }}
            />
        )
    }


    const handleAddLicense = async () => {
        // Always fetch license types when opening the form
        await fetchLicenseTypes()

        settingDrawerTitle("Add License")
        settingDrawerSize(800)
        settingComponent(<LicenseFormWrapper />)
        openDrawer()
    }

    // Create a wrapper component for License Type form
    const LicenseTypeFormWrapper = () => {
        const [formData, setFormData] = useState({
            license_type: ''
        })
        const [validationErrors, setValidationErrors] = useState({})
        const [isSubmitting, setIsSubmitting] = useState(false)

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

            // Check License Type
            if (!formData.license_type || formData.license_type.trim() === '') {
                errors.license_type = 'License Type is required'
                return { isValid: false, errors, firstError: 'License Type is required' }
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
                // Map form data to API payload format
                const payload = {
                    license_type: formData.license_type
                }

                /// console.log('Submitting license type data:', payload)

                // Call the API
                const response = await employeesApi.addLicenseType(payload);

                console.log('responseresponse', response?.data?.STATUS === 'SUCCESSFUL')

                if (response && response?.data?.STATUS === 'SUCCESSFUL') {
                    toast.success('License type added successfully!')
                    // Refresh license types
                    await fetchLicenseTypes()
                    closeDrawer()
                    fetchEmployeeProfile() // Refresh data
                } else {
                    toast.error(response?.ERROR_DESCRIPTION || 'Failed to add license type')
                }

            } catch (error) {
                console.error('Error adding license type:', error)
                toast.error(error.response?.data?.ERROR_DESCRIPTION || 'Failed to add license type. Please try again.')
            } finally {
                setIsSubmitting(false)
            }
        }

        return (
            <LicenseTypeEditAdd
                licenseValue={{
                    show: true,
                    addState: false,
                    addType: true,
                    loading: isSubmitting,
                    license_type: formData.license_type,
                    validationErrors
                }}
                handleSubmitLicense={() => { }}
                handleLicenseInputChange={handleInputChange}
                handleSelectLicense={() => { }}
                handleSubmitLicenseType={handleSubmit}
            />
        )
    }

    const handleAddLicenseType = () => {
        settingDrawerTitle("Add License Type")
        settingDrawerSize(600)
        settingComponent(<LicenseTypeFormWrapper />)
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
                <span className='text-[20px]'>Licenses</span>
                <div className='flex items-center gap-3'>
                    <button className='bg-bgBlue  capitalize py-2 px-4 font-medium text-[12px] rounded-[10px] text-white hover:bg-blue-600 cursor-pointer' onClick={handleAddLicense}>
                        Add License
                    </button>
                    <button className='bg-bgBlue  capitalize py-2 px-4 font-medium text-[12px] rounded-[10px] text-white hover:bg-blue-600 cursor-pointer' onClick={handleAddLicenseType}>
                        Add License Type
                    </button>
                    {/* <CustomButton
                        title="Add License"
                        onClick={handleAddLicense}
                        className='bg-bgBlue text-white'
                    />
                    <CustomButton
                        title="Add License Type"
                        onClick={handleAddLicenseType}
                        className='bg-bgBlue text-white'
                    /> */}
                </div>
            </div>

            {loading ? (
                <Card className="w-full">
                    <CardBody className="text-center py-12">
                        <Typography color="gray" className="mb-4">
                            Loading license details...
                        </Typography>
                    </CardBody>
                </Card>
            ) : licenseData.length > 0 ? (
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
                            {licenseData.map((license, index) => (
                                <tr key={index} className="even:bg-blue-gray-50/50">
                                    {/* License Type */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {license.licenseType?.license_type || 'N/A'}
                                        </Typography>
                                    </td>
                                    {/* Title */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {license.license_title || 'N/A'}
                                        </Typography>
                                    </td>
                                    {/* License# */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {license.license_number || 'N/A'}
                                        </Typography>
                                    </td>
                                    {/* Issuing Authority */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {license.issuing_authority || 'N/A'}
                                        </Typography>
                                    </td>
                                    {/* Issue Date */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {formatDate(license.issue_date)}
                                        </Typography>
                                    </td>
                                    {/* Expiry Date */}
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {formatDate(license.expiry_date)}
                                        </Typography>
                                    </td>
                                    {/* Action */}
                                    <td className="p-4">
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === license.id ? null : license.id)}
                                                className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                                            >
                                                Actions
                                                <ChevronDownIcon className="w-4 h-4" />
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            {openDropdown === license.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                                                    <button
                                                        onClick={() => {
                                                            handleEdit(license)
                                                            setOpenDropdown(null)
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-t-md"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleDelete(license.id)
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
                            No License Details Found
                        </Typography>
                        <Typography color="gray" className="mb-4">
                            Add your licenses to get started
                        </Typography>
                    </CardBody>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                openDialog={showDeleteConfirm}
                handleOpen={handleCancelDelete}
                handleConfirm={handleConfirmDelete}
                title="Delete License Record"
                message={`Are you sure you want to delete the license record for "${deleteItem?.license_title}"? This action cannot be undone.`}
                loading={deleteLoading}
            />
        </div>
    )
}

export default EmpProfileLicenses