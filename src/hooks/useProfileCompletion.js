import { useState, useEffect } from 'react'
import useStore from '../Store/store'

const useProfileCompletion = () => {
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [profileData, setProfileData] = useState({
    academic: { completed: false, count: 0 },
    experience: { completed: false, count: 0 },
    documents: { completed: false, count: 0 },
    licenses: { completed: false, count: 0 },
    bankAccount: { completed: false, count: 0 }
  })
  const { getEmployeeProfileV2 } = useStore()

  // Calculate completion for each section
  const calculateSectionCompletion = (data, sectionType) => {
    switch (sectionType) {
      case 'academic':
        return {
          completed: data && data.length > 0,
          count: data ? data.length : 0
        }
      
      case 'experience':
        return {
          completed: data && data.length > 0,
          count: data ? data.length : 0
        }
      
      case 'documents':
        return {
          completed: data && data.length > 0,
          count: data ? data.length : 0
        }
      
      case 'licenses':
        return {
          completed: data && data.length > 0,
          count: data ? data.length : 0
        }
      
      case 'bankAccount':
        // Bank account is considered complete if it has valid data
        if (!data || data.length === 0) {
          return { completed: false, count: 0 }
        }
        
        const bankData = data[0]
        const hasRequiredFields = bankData.bank_name && 
                                 bankData.bank_account_title && 
                                 bankData.bank_account_no &&
                                 bankData.bank_name.trim() !== '' &&
                                 bankData.bank_account_title.trim() !== '' &&
                                 bankData.bank_account_no.trim() !== ''
        
        return {
          completed: hasRequiredFields,
          count: hasRequiredFields ? 1 : 0
        }
      
      default:
        return { completed: false, count: 0 }
    }
  }

  // Calculate overall completion percentage
  const calculateCompletionPercentage = (data) => {
    const sections = [
      'academic',
      'experience', 
      'documents',
      'licenses',
      'bankAccount'
    ]
    
    const completedSections = sections.filter(section => {
      const sectionData = data[section]
      const completion = calculateSectionCompletion(sectionData, section)
      return completion.completed
    })
    
    // Each section is worth 20% (100% / 5 sections)
    const percentage = (completedSections.length / sections.length) * 100
    return Math.round(percentage)
  }

  // Fetch profile data and calculate completion
  const fetchProfileCompletion = async () => {
    try {
      const userId = localStorage.getItem('user_id') || '9119548'
      const response = await getEmployeeProfileV2(userId)
      
      if (response && response.DB_DATA) {
        const data = response.DB_DATA
        
        // Calculate completion for each section
        const newProfileData = {
          academic: calculateSectionCompletion(data.employee_documents, 'academic'),
          experience: calculateSectionCompletion(data.employee_experience, 'experience'),
          documents: calculateSectionCompletion(data.employee_document, 'documents'),
          licenses: calculateSectionCompletion(data.employee_License, 'licenses'),
          bankAccount: calculateSectionCompletion(data.bank_account_detail, 'bankAccount')
        }
        
        setProfileData(newProfileData)
        
        // Calculate overall percentage
        const percentage = calculateCompletionPercentage({
          academic: data.employee_documents,
          experience: data.employee_experience,
          documents: data.employee_document,
          licenses: data.employee_License,
          bankAccount: data.bank_account_detail
        })
        
        setCompletionPercentage(percentage)
        
        console.log('Profile completion calculated:', {
          percentage,
          sections: newProfileData
        })
      }
    } catch (error) {
      console.error('Error calculating profile completion:', error)
    }
  }

  // Fetch completion data on mount
  useEffect(() => {
    fetchProfileCompletion()
  }, [])

  return {
    completionPercentage,
    profileData,
    fetchProfileCompletion
  }
}

export default useProfileCompletion
