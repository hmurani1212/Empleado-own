import { useState } from "react"
import employeesApi from "../../../Model/Data/Employees/Employees"
import applicationApi from "../../../Model/Data/Applications/Applications"
import { getUserData } from "../../../Authentication/jwt_decode"
import { toast } from 'react-toastify'

const useEmpProfileServices = ()=>{

    const [active, setActive] = useState(1)
    const [isSubmittingAcademic, setIsSubmittingAcademic] = useState(false)
    const [isSubmittingExperience, setIsSubmittingExperience] = useState(false)
    const [isSubmittingDocument, setIsSubmittingDocument] = useState(false)
    const [isSubmittingLicense, setIsSubmittingLicense] = useState(false)

    const toggleEmpProfile = (id)=>{
        setActive(id)
    }

    // Add Academic Information
    const addAcademicInfo = async (formData) => {
        setIsSubmittingAcademic(true)
        
        try {
            // For employee side, send null as employee ID - backend will determine from JWT token
            const employeeId = null
            
            // Map form data to API payload format
            const payload = {
                degree_id: formData.degree,
                degree_title: formData.degreeTitle,
                passing_year: formData.passingYear,
                study_type: formData.studyType,
                obtained_marks: parseFloat(formData.obtainedMarks),
                total_marks: parseFloat(formData.totalMarks),
                grade: formData.grade,
                division: formData.division,
                board_university: formData.boardUniversity,
                remarks: formData.remarks || ''
            }
            
            // Call the existing Model endpoint with null employee ID
            // Backend will determine employee ID from JWT token
            const response = await employeesApi.addEmployeeEducation(employeeId, payload)
            
            if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                toast.success('Academic information added successfully!')
                return { success: true, data: response.data }
            } else {
                toast.error(response.data?.MESSAGE || 'Failed to add academic information')
                return { success: false, message: response.data?.MESSAGE || 'Failed to add academic information' }
            }
            
        } catch (error) {
            console.error('Error adding academic info:', error)
            toast.error(error.response?.data?.MESSAGE || 'Failed to add academic information. Please try again.')
            return { success: false, message: error.response?.data?.MESSAGE || 'Failed to add academic information' }
        } finally {
            setIsSubmittingAcademic(false)
        }
    }

    // Add Experience Information
    const addExperienceInfo = async (formData) => {
        setIsSubmittingExperience(true)
        
        try {
            // For employee side, send null as employee ID - backend will determine from JWT token
            const employeeId = null
            
            // Map form data to API payload format
            const payload = {
                organization_name: formData.organizationName,
                designation: formData.designation,
                from_date: formData.fromDate,
                to_date: formData.toDate,
                salary: parseFloat(formData.salary),
                reason_for_leaving: formData.reasonForLeaving
            }
            
            // Call the existing Model endpoint with null employee ID
            // Backend will determine employee ID from JWT token
            const response = await employeesApi.addEmployeeExperience(employeeId, payload)
            
            if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                toast.success('Experience information added successfully!')
                return { success: true, data: response.data }
            } else {
                toast.error(response.data?.MESSAGE || 'Failed to add experience information')
                return { success: false, message: response.data?.MESSAGE || 'Failed to add experience information' }
            }
            
        } catch (error) {
            console.error('Error adding experience info:', error)
            toast.error(error.response?.data?.MESSAGE || 'Failed to add experience information. Please try again.')
            return { success: false, message: error.response?.data?.MESSAGE || 'Failed to add experience information' }
        } finally {
            setIsSubmittingExperience(false)
        }
    }

    // Add Document Information
    const addDocumentInfo = async (formData) => {
        setIsSubmittingDocument(true)
        
        try {
            // For employee side, send null as employee ID - backend will determine from JWT token
            const employeeId = null
            
            // Step 1: Upload file to elephant server to get URL
            const fileFormData = new FormData()
            fileFormData.append('fileInput', formData.file)
            
            const uploadResponse = await applicationApi.uploadFileToElephant(fileFormData)
            
            if (!uploadResponse.data || uploadResponse.data.STATUS !== 'SUCCESSFUL') {
                toast.error('Failed to upload file. Please try again.')
                return { success: false, message: 'Failed to upload file' }
            }
            
            // Get the file URL from upload response
            const fileUrl = uploadResponse.data.url || uploadResponse.data.FILE_URL
            
            if (!fileUrl) {
                toast.error('Failed to get file URL. Please try again.')
                return { success: false, message: 'Failed to get file URL' }
            }
            
            // Step 2: Send document info with URL to employee document endpoint
            const payload = {
                document_title: formData.documentTitle,
                doc_name: fileUrl  // Send the URL instead of file
            }
            
            // Call the existing Model endpoint with null employee ID
            // Backend will determine employee ID from JWT token
            const response = await employeesApi.addEmployeeDocument(employeeId, payload)
            
            if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                toast.success('Document uploaded successfully!')
                return { success: true, data: response.data }
            } else {
                toast.error(response.data?.MESSAGE || 'Failed to save document')
                return { success: false, message: response.data?.MESSAGE || 'Failed to save document' }
            }
            
        } catch (error) {
            console.error('Error uploading document:', error)
            toast.error(error.response?.data?.MESSAGE || 'Failed to upload document. Please try again.')
            return { success: false, message: error.response?.data?.MESSAGE || 'Failed to upload document' }
        } finally {
            setIsSubmittingDocument(false)
        }
    }

    // Add License Information
    const addLicenseInfo = async (formData) => {
        setIsSubmittingLicense(true)
        
        try {
            // For employee side, send null as employee ID - backend will determine from JWT token
            const employeeId = null
            
            // Map form data to API payload format
            const payload = {
                license_title: formData.licenseTitle,
                license_type: formData.licenseType,
                license_number: formData.licenseNumber,
                issuing_authority_detail: formData.issuingAuthorityDetail,
                issue_date: formData.issueDate,
                expiry_date: formData.expiryDate
            }
            
            // Call the existing Model endpoint with null employee ID
            // Backend will determine employee ID from JWT token
            const response = await employeesApi.addEmployeeLicense(employeeId, payload)
            
            if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                toast.success('License information added successfully!')
                return { success: true, data: response.data }
            } else {
                toast.error(response.data?.MESSAGE || 'Failed to add license information')
                return { success: false, message: response.data?.MESSAGE || 'Failed to add license information' }
            }
            
        } catch (error) {
            console.error('Error adding license info:', error)
            toast.error(error.response?.data?.MESSAGE || 'Failed to add license information. Please try again.')
            return { success: false, message: error.response?.data?.MESSAGE || 'Failed to add license information' }
        } finally {
            setIsSubmittingLicense(false)
        }
    }

    return {
        active,
        toggleEmpProfile,
        isSubmittingAcademic,
        addAcademicInfo,
        isSubmittingExperience,
        addExperienceInfo,
        isSubmittingDocument,
        addDocumentInfo,
        isSubmittingLicense,
        addLicenseInfo
    }
}


export default useEmpProfileServices