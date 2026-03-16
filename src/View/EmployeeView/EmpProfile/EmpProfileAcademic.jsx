import React, { useState, useEffect } from 'react'
import CustomButton from '../../../Components/CustomButton/CustomButton'
import { Typography, Card, CardBody } from '@material-tailwind/react'
import useStore from '../../../Store/store'
import AddEditEducation from '../../Dashoboard/AddEditEducation'
import { getUserData } from '../../../Authentication/jwt_decode'
import { toast } from 'react-toastify'
import employeesApi from '../../../Model/Data/Employees/Employees'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import ConfirmationDialog from '../../../Components/ConfirmationDialog/ConfirmationDialog'
import useProfileCompletion from '../../../hooks/useProfileCompletion'

const tableHeader = [
    "Degree/Certificate", "Obtained Marks", "Total Marks", "Grade", "Board/Uni", "Action"
]

const EmpProfileAcademic = () => {
    const [academicData, setAcademicData] = useState([])
    const [loading, setLoading] = useState(true)
    const [openDropdown, setOpenDropdown] = useState(null) // Track which dropdown is open
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false) // Show delete confirmation dialog
    const [deleteItem, setDeleteItem] = useState(null) // Item to be deleted
    const [deleteLoading, setDeleteLoading] = useState(false) // Loading state for delete
    const { getEmployeeProfileV2, employeeProfileV2Data, openDrawer, settingComponent, closeDrawer, settingDrawerTitle, settingDrawerSize } = useStore()
    const { fetchProfileCompletion } = useProfileCompletion()

    // Sync from store (single fetch by useProfileCompletion on Profile mount; no duplicate fetch on tab mount)
    useEffect(() => {
        if (employeeProfileV2Data?.DB_DATA?.employee_documents) {
            setAcademicData(employeeProfileV2Data.DB_DATA.employee_documents)
            setLoading(false)
        } else if (employeeProfileV2Data != null) {
            setAcademicData([])
            setLoading(false)
        }
    }, [employeeProfileV2Data])

    // Initial loading: store not populated yet
    useEffect(() => {
        if (employeeProfileV2Data === null) {
            setLoading(true)
        }
    }, [])

    // Refresh after add/edit (one call; store updates so completion % recalculates)
    const fetchEmployeeProfile = async () => {
        setLoading(true)
        try {
            const userId = localStorage.getItem('user_id') || '9119548'
            const response = await getEmployeeProfileV2(userId)
            if (response?.DB_DATA) {
                setAcademicData(response.DB_DATA.employee_documents || [])
            }
        } catch (error) {
            console.error('Error fetching academic data:', error)
        } finally {
            setLoading(false)
        }
    }

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
    const handleEdit = (academic) => {
        console.log('Edit academic record:', academic)
        setOpenDropdown(null) // Close dropdown
        
        // Open drawer with edit form
        settingDrawerTitle('Edit Academic Details')
        settingDrawerSize(800) // Set specific width instead of 'lg'
        settingComponent(
            <AcademicFormWrapper 
                editData={academic} 
                isEdit={true}
                onSuccess={fetchEmployeeProfile}
            />
        )
        openDrawer()
    }

    // Handle Delete action
    const handleDelete = (academicId) => {
        console.log('Delete academic record ID:', academicId)
        setOpenDropdown(null) // Close dropdown
        
        // Find the academic record to get its details
        const academicRecord = academicData.find(item => item.id === academicId)
        setDeleteItem(academicRecord)
        setShowDeleteConfirm(true) // Show custom confirmation dialog
    }

    // Handle confirmed delete
    const handleConfirmDelete = async () => {
        if (!deleteItem) return
        
        setDeleteLoading(true)
        try {
            const orgId = localStorage.getItem('org_id') || '10381947' // Use org_id for employee side
            const response = await employeesApi.deleteEmployeeEducation(orgId, deleteItem.id)
            
            if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                toast.success('Academic record deleted successfully!')
                fetchEmployeeProfile() // Refresh the data
                setShowDeleteConfirm(false) // Close dialog
                setDeleteItem(null) // Clear delete item
            } else {
                toast.error(response.data?.ERROR_DESCRIPTION || 'Failed to delete academic record')
            }
        } catch (error) {
            console.error('Error deleting academic record:', error)
            toast.error('Failed to delete academic record. Please try again.')
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
    const AcademicFormWrapper = ({ editData = null, isEdit = false, onSuccess = null }) => {
        const [formData, setFormData] = useState({
            degree_id: null,
            passing_year: '',
            major_subject: '',
            study_type: '',
            total_marks: '',
            obtained_marks: '',
            grade: '',
            division: '',
            board_univ: '',
            remarks: ''
        })
        const [validationErrors, setValidationErrors] = useState({})
        const [isSubmitting, setIsSubmitting] = useState(false)

        // Populate form data when editing
        useEffect(() => {
            if (isEdit && editData) {
                // Find the degree ID from the degree list based on program name
                const degreeList = [
                    { id: 0, name: "Select Degree" },
                    { id: 42, name: "A Level" },
                    { id: 50, name: "ACCA" },
                    { id: 41, name: "Associate Degree (Pass)" },
                    { id: 32, name: "B.com" },
                    { id: 17, name: "B.Com (Hons)" },
                    { id: 39, name: "B.Ed" },
                    { id: 19, name: "B.Ed (Hons)" },
                    { id: 14, name: "B.Tech (Hons)" },
                    { id: 15, name: "B.Tech (Pass)" },
                    { id: 4, name: "BA/B.Sc" },
                    { id: 16, name: "Bachelor Of Engineering (BE)" },
                    { id: 20, name: "Bachelor of Fine Arts (BFA)" },
                    { id: 38, name: "BBA" },
                    { id: 34, name: "BBA (Hons)" },
                    { id: 40, name: "BBS" },
                    { id: 18, name: "BCS (Hons)" },
                    { id: 46, name: "BIT(Hons)" },
                    { id: 1, name: "BS" },
                    { id: 51, name: "CA" },
                    { id: 52, name: "CMA" },
                    { id: 37, name: "D.Com" },
                    { id: 13, name: "DAE (HSSC)" },
                    { id: 6, name: "DBA" },
                    { id: 12, name: "DBA (HSSC)" },
                    { id: 35, name: "DIT" },
                    { id: 8, name: "F.A (HSSC)" },
                    { id: 9, name: "F.Sc (HSSC)" },
                    { id: 49, name: "Hifzul Quran" },
                    { id: 11, name: "I.Com (HSSC)" },
                    { id: 55, name: "ICAEW" },
                    { id: 54, name: "ICMA" },
                    { id: 10, name: "ICS (HSSC)" },
                    { id: 3, name: "Intermediate" },
                    { id: 23, name: "LLB" },
                    { id: 22, name: "LLB (honse)" },
                    { id: 24, name: "LLM" },
                    { id: 33, name: "M.com" },
                    { id: 31, name: "M.Ed" },
                    { id: 27, name: "M.Tech" },
                    { id: 5, name: "MA/MS.c" },
                    { id: 26, name: "Master of Engineering" },
                    { id: 30, name: "Master Of Library Sciences" },
                    { id: 29, name: "Master of Public Administration (MPA)" },
                    { id: 2, name: "Matric" },
                    { id: 25, name: "MBA" },
                    { id: 28, name: "MBA (Executive)" },
                    { id: 21, name: "MBBS" },
                    { id: 36, name: "MCS" },
                    { id: 7, name: "MPhil" },
                    { id: 43, name: "O Level" },
                    { id: 48, name: "PHD" },
                    { id: 44, name: "Professional Certification" },
                    { id: 47, name: "Short Course" }
                ];
                
                // Find the degree ID based on the program name
                const foundDegree = degreeList.find(degree => 
                    degree.name === editData.program?.program_name
                );
                
                setFormData({
                    degree_id: foundDegree?.id || editData.program?.id || null,
                    passing_year: editData.passing_year || '',
                    major_subject: editData.degree_title || '',
                    study_type: editData.study_type || '',
                    total_marks: editData.total_marks_gpa || '',
                    obtained_marks: editData.obtained_marks_gpa || '',
                    grade: editData.grade || '',
                    division: editData.division || '',
                    board_univ: editData.board_univ || '',
                    remarks: editData.remarks || ''
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
            
            // Check Degree
            if (!formData.degree_id || formData.degree_id === null) {
                errors.degree_id = 'Degree is required'
                return { isValid: false, errors, firstError: 'Degree is required' }
            }
            
            // Check Passing Year
            if (!formData.passing_year || formData.passing_year.trim() === '') {
                errors.passing_year = 'Passing Year is required'
                return { isValid: false, errors, firstError: 'Passing Year is required' }
            }
            
            // Validate passing year format (should be a valid year)
            const year = parseInt(formData.passing_year)
            const currentYear = new Date().getFullYear()
            if (isNaN(year) || year < 1950 || year > currentYear + 5) {
                errors.passing_year = 'Please enter a valid year'
                return { isValid: false, errors, firstError: 'Please enter a valid year' }
            }
            
            // Check Major Subject
            if (!formData.major_subject || formData.major_subject.trim() === '') {
                errors.major_subject = 'Degree Title/Major Subject is required'
                return { isValid: false, errors, firstError: 'Degree Title/Major Subject is required' }
            }
            
            // Check Study Type
            if (!formData.study_type || formData.study_type.trim() === '') {
                errors.study_type = 'Study Type is required'
                return { isValid: false, errors, firstError: 'Study Type is required' }
            }
            
            // Check Total Marks
            if (!formData.total_marks || formData.total_marks.trim() === '') {
                errors.total_marks = 'Total Marks/GPA is required'
                return { isValid: false, errors, firstError: 'Total Marks/GPA is required' }
            }
            
            // Validate total marks (should be a positive number)
            const totalMarks = parseFloat(formData.total_marks)
            if (isNaN(totalMarks) || totalMarks <= 0) {
                errors.total_marks = 'Please enter a valid total marks/GPA'
                return { isValid: false, errors, firstError: 'Please enter a valid total marks/GPA' }
            }
            
            // Check Obtained Marks
            if (!formData.obtained_marks || formData.obtained_marks.trim() === '') {
                errors.obtained_marks = 'Obtained Marks/CGPA is required'
                return { isValid: false, errors, firstError: 'Obtained Marks/CGPA is required' }
            }
            
            // Validate obtained marks (should be a positive number)
            const obtainedMarks = parseFloat(formData.obtained_marks)
            if (isNaN(obtainedMarks) || obtainedMarks < 0) {
                errors.obtained_marks = 'Please enter a valid obtained marks/CGPA'
                return { isValid: false, errors, firstError: 'Please enter a valid obtained marks/CGPA' }
            }
            
            // Check if obtained marks is not greater than total marks
            if (obtainedMarks > totalMarks) {
                errors.obtained_marks = 'Obtained marks cannot be greater than total marks'
                return { isValid: false, errors, firstError: 'Obtained marks cannot be greater than total marks' }
            }
            
            // Check Grade
            if (!formData.grade || formData.grade.trim() === '') {
                errors.grade = 'Grade is required'
                return { isValid: false, errors, firstError: 'Grade is required' }
            }
            
            // Division is optional - no validation needed
            
            // Check Board/University
            if (!formData.board_univ || formData.board_univ.trim() === '') {
                errors.board_univ = 'Board/University is required'
                return { isValid: false, errors, firstError: 'Board/University is required' }
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


                console.log('User Data Retrieved:', userData)
                
                if (!userData) {
                    toast.error('User data not found. Please login again.')
                    return
                }
                
                // Determine employee ID based on role

                console.log('User Data:', userData.roleId === 'Employee')
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
                
                // Get degree name from degree_id
                const degreeList = [
                    { id: 0, name: "Select Degree" },
                    { id: 42, name: "A Level" },
                    { id: 50, name: "ACCA" },
                    { id: 41, name: "Associate Degree (Pass)" },
                    { id: 32, name: "B.com" },
                    { id: 17, name: "B.Com (Hons)" },
                    { id: 39, name: "B.Ed" },
                    { id: 19, name: "B.Ed (Hons)" },
                    { id: 14, name: "B.Tech (Hons)" },
                    { id: 15, name: "B.Tech (Pass)" },
                    { id: 4, name: "BA/B.Sc" },
                    { id: 16, name: "Bachelor Of Engineering (BE)" },
                    { id: 20, name: "Bachelor of Fine Arts (BFA)" },
                    { id: 38, name: "BBA" },
                    { id: 34, name: "BBA (Hons)" },
                    { id: 40, name: "BBS" },
                    { id: 18, name: "BCS (Hons)" },
                    { id: 46, name: "BIT(Hons)" },
                    { id: 1, name: "BS" },
                    { id: 51, name: "CA" },
                    { id: 52, name: "CMA" },
                    { id: 37, name: "D.Com" },
                    { id: 13, name: "DAE (HSSC)" },
                    { id: 6, name: "DBA" },
                    { id: 12, name: "DBA (HSSC)" },
                    { id: 35, name: "DIT" },
                    { id: 8, name: "F.A (HSSC)" },
                    { id: 9, name: "F.Sc (HSSC)" },
                    { id: 49, name: "Hifzul Quran" },
                    { id: 11, name: "I.Com (HSSC)" },
                    { id: 55, name: "ICAEW" },
                    { id: 54, name: "ICMA" },
                    { id: 10, name: "ICS (HSSC)" },
                    { id: 3, name: "Intermediate" },
                    { id: 23, name: "LLB" },
                    { id: 22, name: "LLB (honse)" },
                    { id: 24, name: "LLM" },
                    { id: 33, name: "M.com" },
                    { id: 31, name: "M.Ed" },
                    { id: 27, name: "M.Tech" },
                    { id: 5, name: "MA/MS.c" },
                    { id: 26, name: "Master of Engineering" },
                    { id: 30, name: "Master Of Library Sciences" },
                    { id: 29, name: "Master of Public Administration (MPA)" },
                    { id: 2, name: "Matric" },
                    { id: 25, name: "MBA" },
                    { id: 28, name: "MBA (Executive)" },
                    { id: 21, name: "MBBS" },
                    { id: 36, name: "MCS" },
                    { id: 7, name: "MPhil" },
                    { id: 43, name: "O Level" },
                    { id: 48, name: "PHD" },
                    { id: 44, name: "Professional Certification" },
                    { id: 47, name: "Short Course" }
                ];
                
                const selectedDegree = degreeList.find(degree => degree.id === formData.degree_id);
                const degreeName = selectedDegree ? selectedDegree.name : '';

                // Map form data to API payload format
                const payload = {
                    degree_id: formData.degree_id, // Send the actual degree ID
                    degree_name: degreeName, // Send degree name
                    program_id: editData?.program?.id || null, // Send program ID for backend update
                    degree_title: formData.major_subject,
                    passing_year: formData.passing_year,
                    study_type: formData.study_type,
                    obtained_marks: parseFloat(formData.obtained_marks),
                    total_marks: parseFloat(formData.total_marks),
                    grade: formData.grade,
                    division: formData.division,
                    board_university: formData.board_univ,
                    remarks: formData.remarks || ''
                }
                
                console.log('Submitting academic data:', payload)
                console.log('Degree ID:', formData.degree_id, 'Degree Name:', degreeName)
                console.log('Program ID:', editData?.program?.id, 'Program Name:', editData?.program?.program_name)
                console.log('Employee ID:', employeeId)
                console.log('User Role:', userData.roleDbId)
                
                // Call the API
                let response;
                if (isEdit && editData) {
                    // Update existing record
                    const orgId = localStorage.getItem('org_id') || '10381947'
                    response = await employeesApi.updateEmployeeEducation(orgId, {
                        id: editData.id,
                        ...payload
                    })
                } else {
                    // Create new record
                    response = await employeesApi.addEmployeeEducation(employeeId, payload)
                }
                
                if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                    toast.success(isEdit ? 'Academic information updated successfully!' : 'Academic information added successfully!')
                    closeDrawer()
                    if (onSuccess) {
                        onSuccess() // Call the success callback
                    } else {
                        fetchEmployeeProfile() // Fallback to refresh
                    }
                } else {
                    toast.error(response.data?.ERROR_DESCRIPTION || response.data?.MESSAGE || `Failed to ${isEdit ? 'update' : 'add'} academic information`)
                }
                
            } catch (error) {
                console.error('Error adding academic info:', error)
                toast.error(error.response?.data?.MESSAGE || 'Failed to add academic information. Please try again.')
            } finally {
                setIsSubmitting(false)
            }
        }

        return (
            <AddEditEducation 
                academicsValue={{
                    show: true,
                    addState: !isEdit, // Show "Submit" for add, "Update" for edit
                    loading: isSubmitting,
                    degree_list: [
                        { id: 0, name: "Select Degree" },
                        { id: 42, name: "A Level" },
                        { id: 50, name: "ACCA" },
                        { id: 41, name: "Associate Degree (Pass)" },
                        { id: 32, name: "B.com" },
                        { id: 17, name: "B.Com (Hons)" },
                        { id: 39, name: "B.Ed" },
                        { id: 19, name: "B.Ed (Hons)" },
                        { id: 14, name: "B.Tech (Hons)" },
                        { id: 15, name: "B.Tech (Pass)" },
                        { id: 4, name: "BA/B.Sc" },
                        { id: 16, name: "Bachelor Of Engineering (BE)" },
                        { id: 20, name: "Bachelor of Fine Arts (BFA)" },
                        { id: 38, name: "BBA" },
                        { id: 34, name: "BBA (Hons)" },
                        { id: 40, name: "BBS" },
                        { id: 18, name: "BCS (Hons)" },
                        { id: 46, name: "BIT(Hons)" },
                        { id: 1, name: "BS" },
                        { id: 51, name: "CA" },
                        { id: 52, name: "CMA" },
                        { id: 37, name: "D.Com" },
                        { id: 13, name: "DAE (HSSC)" },
                        { id: 6, name: "DBA" },
                        { id: 12, name: "DBA (HSSC)" },
                        { id: 35, name: "DIT" },
                        { id: 8, name: "F.A (HSSC)" },
                        { id: 9, name: "F.Sc (HSSC)" },
                        { id: 49, name: "Hifzul Quran" },
                        { id: 11, name: "I.Com (HSSC)" },
                        { id: 55, name: "ICAEW" },
                        { id: 54, name: "ICMA" },
                        { id: 10, name: "ICS (HSSC)" },
                        { id: 3, name: "Intermediate" },
                        { id: 23, name: "LLB" },
                        { id: 22, name: "LLB (honse)" },
                        { id: 24, name: "LLM" },
                        { id: 33, name: "M.com" },
                        { id: 31, name: "M.Ed" },
                        { id: 27, name: "M.Tech" },
                        { id: 5, name: "MA/MS.c" },
                        { id: 26, name: "Master of Engineering" },
                        { id: 30, name: "Master Of Library Sciences" },
                        { id: 29, name: "Master of Public Administration (MPA)" },
                        { id: 2, name: "Matric" },
                        { id: 7, name: "Matric (Sciences)" },
                        { id: 45, name: "MBA" },
                        { id: 25, name: "MBA" },
                        { id: 28, name: "MPhil" },
                        { id: 44, name: "MS" },
                        { id: 43, name: "O Level" },
                        { id: 21, name: "Pharam D/B Pharam" },
                        { id: 47, name: "PhD" },
                        { id: 53, name: "PIPFA" },
                        { id: 48, name: "PTC" }
                    ],
                    ...formData,
                    validationErrors
                }}
                handleSelectAcademic={handleSelectChange}
                handleAcademicInputChange={handleInputChange}
                handleSubmitAcademics={handleSubmit}
            />
        )
    }

    const handleAddAcademic = () => {
        settingDrawerTitle("Add Academic Detail")
        settingDrawerSize(800)
        settingComponent(<AcademicFormWrapper />)
        openDrawer()
    }

  return (
    <div className='flex flex-col gap-4 p-2'>
      <div className='flex items-center justify-between'>
        <span className='text-[20px]'>Academic Details</span>
        <button className='bg-bgBlue  capitalize py-2 px-4 font-medium text-[12px] rounded-[10px] text-white hover:bg-blue-600 cursor-pointer' onClick={handleAddAcademic}>
            Add Academic Detail
        </button>
        {/* <CustomButton 
          title="Add Academic Detail"
          onClick={handleAddAcademic}
          className='bg-bgBlue text-white'
        /> */}
      </div>

      {loading ? (
        <Card className="w-full">
          <CardBody className="text-center py-12">
            <Typography color="gray" className="mb-4">
              Loading academic details...
            </Typography>
          </CardBody>
        </Card>
      ) : academicData.length > 0 ? (
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
              {academicData.map((academic, index) => (
                <tr key={index} className="even:bg-blue-gray-50/50">
                  {/* Degree/Certificate */}
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {academic.program?.program_name || 'N/A'}
                    </Typography>
                  </td>
                  {/* Obtained Marks */}
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {academic.obtained_marks_gpa || 'N/A'}
                    </Typography>
                  </td>
                  {/* Total Marks */}
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {academic.total_marks_gpa || 'N/A'}
                    </Typography>
                  </td>
                  {/* Grade */}
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {academic.grade || 'N/A'}
                    </Typography>
                  </td>
                  {/* Board/Uni */}
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {academic.board_univ || 'N/A'}
                    </Typography>
                  </td>
                  {/* Action */}
                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === academic.id ? null : academic.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                      >
                        Actions
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === academic.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => {
                              handleEdit(academic)
                              setOpenDropdown(null)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-t-md"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(academic.id)
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
              No Academic Details Found
            </Typography>
            <Typography color="gray" className="mb-4">
              Add your academic information to get started
            </Typography>
           </CardBody>
         </Card>
       )}

       {/* Delete Confirmation Dialog */}
       <ConfirmationDialog
         openDialog={showDeleteConfirm}
         handleOpen={handleCancelDelete}
         title="Delete Academic Record"
         message={`Are you sure you want to delete this academic record for "${deleteItem?.program?.program_name || 'Unknown Degree'}"? This action cannot be undone.`}
         handleConfirm={handleConfirmDelete}
         loading={deleteLoading}
         size={false} // Use md size instead of xs
       />
     </div>
   )
 }
 
 export default EmpProfileAcademic