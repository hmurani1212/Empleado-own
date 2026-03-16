import React, { useState, useEffect } from 'react'
import CustomButton from '../../../Components/CustomButton/CustomButton'
import { Typography, Card, CardBody, Button } from '@material-tailwind/react'
import useStore from '../../../Store/store'
import AddDocument from '../../Dashoboard/AddDocument'
import { getUserData } from '../../../Authentication/jwt_decode'
import { toast } from 'react-toastify'
import employeesApi from '../../../Model/Data/Employees/Employees'
import trainingApi from '../../../Model/Data/TrainigPages/Training'
import ConfirmationDialog from '../../../Components/ConfirmationDialog/ConfirmationDialog'
import useProfileCompletion from '../../../hooks/useProfileCompletion'

const tableHeader = [
  "S.No", "Document Title", "View Document", "Actions"
]

const EmpProfileDocuments = () => {
    const [documentData, setDocumentData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false) // Show delete confirmation dialog
    const [deleteItem, setDeleteItem] = useState(null) // Item to be deleted
    const [deleteLoading, setDeleteLoading] = useState(false) // Loading state for delete
    const { getEmployeeProfileV2, employeeProfileV2Data, openDrawer, settingComponent, closeDrawer, settingDrawerTitle, settingDrawerSize } = useStore()
    const { fetchProfileCompletion } = useProfileCompletion()

    // Sync from store (single fetch by useProfileCompletion on Profile mount)
    useEffect(() => {
        if (employeeProfileV2Data?.DB_DATA?.employee_document) {
            setDocumentData(employeeProfileV2Data.DB_DATA.employee_document)
            setLoading(false)
        } else if (employeeProfileV2Data != null) {
            setDocumentData([])
            setLoading(false)
        }
    }, [employeeProfileV2Data])

    useEffect(() => {
        if (employeeProfileV2Data === null) setLoading(true)
    }, [])

    // Refresh after add/edit
    const fetchEmployeeProfile = async () => {
        setLoading(true)
        try {
            const userId = localStorage.getItem('user_id') || '9119548'
            const response = await getEmployeeProfileV2(userId)
            if (response?.DB_DATA) {
                setDocumentData(response.DB_DATA.employee_document || [])
            }
        } catch (error) {
            console.error('Error fetching document data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle Delete action
    const handleDelete = (documentId) => {
        // Find the document record to get its details
        const documentRecord = documentData.find(item => item.id === documentId)
        setDeleteItem(documentRecord)
        setShowDeleteConfirm(true) // Show custom confirmation dialog
    }

    // Handle confirmed delete
    const handleConfirmDelete = async () => {
        if (!deleteItem) return
        
        setDeleteLoading(true)
        try {
            const orgId = localStorage.getItem('org_id') || '10381947' // Use org_id for employee side
            const response = await employeesApi.deleteEmployeeDocument(orgId, deleteItem.id)
            
            if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                toast.success('Document deleted successfully!')
                fetchEmployeeProfile() // Refresh the data
                setShowDeleteConfirm(false) // Close dialog
                setDeleteItem(null) // Clear delete item
            } else {
                toast.error(response.data?.ERROR_DESCRIPTION || 'Failed to delete document')
            }
        } catch (error) {
            console.error('Error deleting document:', error)
            toast.error('Failed to delete document. Please try again.')
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
    const DocumentFormWrapper = () => {
        const [formData, setFormData] = useState({
            title: '',
            file: null
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

        const handleFileChange = (e) => {
            const file = e.target.files[0]
            setFormData(prev => ({
                ...prev,
                file: file
            }))
            // Clear validation error when user selects file
            if (validationErrors.file) {
                setValidationErrors(prev => ({
                    ...prev,
                    file: ''
                }))
            }
        }

        // Validation function
        const validateForm = () => {
            const errors = {}
            
            // Check Document Title
            if (!formData.title || formData.title.trim() === '') {
                errors.title = 'Document Title is required'
                return { isValid: false, errors, firstError: 'Document Title is required' }
            }
            
            // Check if title is not too long
            if (formData.title.length > 50) {
                errors.title = 'Document Title cannot exceed 50 characters'
                return { isValid: false, errors, firstError: 'Document Title cannot exceed 50 characters' }
            }
            
            // Check File
            if (!formData.file) {
                errors.file = 'Please select a file to upload'
                return { isValid: false, errors, firstError: 'Please select a file to upload' }
            }
            
            // Check file size (max 10MB)
            const maxSize = 10 * 1024 * 1024 // 10MB
            if (formData.file.size > maxSize) {
                errors.file = 'File size cannot exceed 10MB'
                return { isValid: false, errors, firstError: 'File size cannot exceed 10MB' }
            }
            
            // Check file type (allow common document types)
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png',
                'image/jpg'
            ]
            if (!allowedTypes.includes(formData.file.type)) {
                errors.file = 'Please select a valid file type (PDF, DOC, DOCX, JPG, PNG)'
                return { isValid: false, errors, firstError: 'Please select a valid file type (PDF, DOC, DOCX, JPG, PNG)' }
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
                
                // Step 1: Upload file to elephant server to get URL
                console.log('Step 1: Uploading file to elephant server...')
                const fileFormData = new FormData()
                fileFormData.append('file', formData.file)
                
                const uploadResponse = await trainingApi.uploadFileToElephant(fileFormData)
                console.log('File upload response:', uploadResponse.data)
                
                if (!uploadResponse.data || uploadResponse.data.STATUS !== 'SUCCESSFUL' || !uploadResponse.data.FILE_URL) {
                    toast.error('Failed to upload file. Please try again.')
                    return
                }
                
                const fileUrl = uploadResponse.data.FILE_URL
                const fileDetails = uploadResponse.data.ELEPHANT_RESP
                console.log('File URL received:', fileUrl)
                console.log('File details:', {
                    fileName: fileDetails?.FILE_NAME,
                    fileExt: fileDetails?.FILE_EXT,
                    fileMime: fileDetails?.FILE_MIME,
                    fileSize: fileDetails?.FILE_SIZE,
                    recordId: fileDetails?.RECORD_ID
                })
                
                // Step 2: Send document data with file URL to backend
                console.log('Step 2: Sending document data to backend...')
                const payload = {
                    doc_title: formData.title,
                    doc_file: fileUrl
                }
                
                console.log('Submitting document data:', {
                    doc_title: formData.title,
                    file_url: fileUrl,
                    file_name: formData.file.name,
                    file_size: formData.file.size,
                    file_type: formData.file.type
                })
                console.log('Employee ID:', employeeId)
                console.log('User Role:', userData.roleDbId)
                
                // Call the employee document API with the file URL
                const response = await employeesApi.addEmployeeDocument(employeeId, payload)
                
                if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                    toast.success('Document uploaded successfully!')
                    closeDrawer()
                    fetchEmployeeProfile()
                } else {
                    toast.error(response.data?.MESSAGE || 'Failed to save document')
                }
                
            } catch (error) {
                console.error('Error uploading document:', error)
                if (error.response?.data?.MESSAGE) {
                    toast.error(error.response.data.MESSAGE)
                } else if (error.message) {
                    toast.error(error.message)
                } else {
                    toast.error('Failed to upload document. Please try again.')
                }
            } finally {
                setIsSubmitting(false)
            }
        }

        return (
            <AddDocument 
                documentValue={{
                    show: true,
                    loading: isSubmitting,
                    title: formData.title,
                    file: formData.file,
                    validationErrors
                }}
                handleDocumentInputChange={handleInputChange}
                handleDocumentFileChange={handleFileChange}
                handleSubmitDocument={handleSubmit}
            />
        )
    }

    const handleAddDocument = () => {
        settingDrawerTitle("Add Document")
        settingDrawerSize(600)
        settingComponent(<DocumentFormWrapper />)
        openDrawer()
    }

    // Handle view document
    const handleViewDocument = (docUrl) => {
        if (docUrl) {
            window.open(docUrl, '_blank')
        }
    }

  return (
    <div className='flex flex-col gap-4 p-2'>
        
      <div className='flex items-center justify-between'>
        <span className='text-[20px]'>Documents</span>
        <button className='bg-bgBlue  capitalize py-2 px-4 font-medium text-[12px] rounded-[10px] text-white hover:bg-blue-600 cursor-pointer' onClick={handleAddDocument}>
            Add Document
        </button>
        {/* <CustomButton 
            title="Add Document"
            onClick={handleAddDocument}
            className='bg-bgBlue text-white'
        /> */}
      </div>

        {loading ? (
            <Card className="w-full">
                <CardBody className="text-center py-12">
                    <Typography color="gray" className="mb-4">
                        Loading document details...
                    </Typography>
                </CardBody>
            </Card>
        ) : documentData.length > 0 ? (
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
                        {documentData.map((document, index) => (
                            <tr key={index} className="even:bg-blue-gray-50/50">
                                <td className="p-4">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                        {index + 1}
                                    </Typography>
                                </td>
                                <td className="p-4">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                        {document.doc_title}
                                    </Typography>
                                </td>
                                <td className="p-4">
                                    <Button
                                        size="sm"
                                        variant="outlined"
                                        color="blue"
                                        onClick={() => handleViewDocument(document.doc_name)}
                                        disabled={!document.doc_name}
                                    >
                                        View
                                    </Button>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outlined"
                                            color="red"
                                            onClick={() => handleDelete(document.id)}
                                        >
                                            Delete
                                        </Button>
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
                        No Documents Found
                    </Typography>
                    <Typography color="gray" className="mb-4">
                        Add your documents to get started
                    </Typography>
                </CardBody>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                openDialog={showDeleteConfirm}
                handleOpen={handleCancelDelete}
                handleConfirm={handleConfirmDelete}
                title="Delete Document"
                message={`Are you sure you want to delete the document "${deleteItem?.doc_title}"? This action cannot be undone.`}
                loading={deleteLoading}
            />
        </div>
    )
}

export default EmpProfileDocuments