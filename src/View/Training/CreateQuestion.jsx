import React, { useEffect, useState } from 'react'
import { Typography, Card, CardBody, Input, Button, Select, Option } from '@material-tailwind/react'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import { showToast } from '../../Components/Toaster/Toaster'
import { TrainingDrawerSpinner, TrainingDrawerOverlay } from './TrainingDrawerLoader'

const CreateQuestion = ({ courseId, courseName, closeDrawer }) => {
  const { getCourseResources, generateQuestionsFromResources, saveQuestions } = TrainingService()
  
  const [resources, setResources] = useState([])
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResources, setTotalResources] = useState(0)
  const [questionCounts, setQuestionCounts] = useState({})
  const [questionType, setQuestionType] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedResourceId, setSelectedResourceId] = useState(null)
  const [totalQuestions, setTotalQuestions] = useState('')

  const questionTypeOptions = [
    { value: 'input', label: 'Input' },
    { value: 'radio', label: 'Radio' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' }
  ]

  useEffect(() => {
    if (courseId) {
      fetchResources()
    }
  }, [courseId, currentPage])

  const fetchResources = async () => {
    if (!courseId) return
    
    setResourcesLoading(true)
    try {
      const response = await getCourseResources(courseId, currentPage, 10)
      if (response) {
        setResources(response.resources || [])
        setTotalResources(response.total || 0)
        // Initialize question counts for each resource
        const initialCounts = {}
        response.resources?.forEach((resource) => {
          initialCounts[resource._id] = ''
        })
        setQuestionCounts(prev => ({ ...prev, ...initialCounts }))
      }
    } catch (error) {
      console.error('Error fetching course resources:', error)
      setResources([])
      setTotalResources(0)
    } finally {
      setResourcesLoading(false)
    }
  }

  const handleQuestionCountChange = (resourceId, value) => {
    setQuestionCounts(prev => ({
      ...prev,
      [resourceId]: value
    }))
  }

  // Check if file type is supported for AI question generation
  const isSupportedFileType = (attachmentUrl) => {
    if (!attachmentUrl || typeof attachmentUrl !== 'string') {
      return false
    }

    // Extract file extension from URL
    const urlLower = attachmentUrl.toLowerCase()
    
    // Remove query parameters and fragments
    const urlWithoutParams = urlLower.split('?')[0].split('#')[0]
    
    // Supported extensions
    const supportedExtensions = ['.txt', '.pdf', '.doc', '.docx', '.md']
    
    // Check if URL ends with any supported extension
    return supportedExtensions.some(ext => {
      // Check exact match at the end
      if (urlWithoutParams.endsWith(ext)) {
        return true
      }
      // Also check if extension appears before query params (e.g., file.pdf?param=value)
      const urlPath = urlLower.split('?')[0].split('#')[0]
      return urlPath.endsWith(ext)
    })
  }

  const handleCreateQuestion = async () => {
    // Validate question type
    if (!questionType) {
      showToast('Please select a question type', 'error')
      return
    }

    // Validate total questions
    const totalQuestionsCount = parseInt(totalQuestions) || 0
    if (totalQuestionsCount <= 0) {
      showToast('Please enter total number of questions', 'error')
      return
    }

    // Validate selected resource
    if (!selectedResourceId) {
      showToast('Please select a resource', 'error')
      return
    }

    const selectedResource = resources.find(r => r._id === selectedResourceId)
    if (!selectedResource) {
      showToast('Selected resource not found', 'error')
      return
    }

    // Get resource type - check resource_type field (from API response)
    const resourceType = selectedResource.resource_type || selectedResource.resource?.resource_type

    // Validate file type - only text, PDF, and Word docs are supported for AI question generation
    // Skip validation for Notes_pool resources as they are handled differently
    // if (resourceType !== 'Notes_pool'  || resourceType !== 'Notes') {
    //   const attachmentUrl = selectedResource.attachment || selectedResource.resource?.attachment
    //   if (attachmentUrl && !isSupportedFileType(attachmentUrl)) {
    //     showToast('Only text files (.txt, .md), PDF (.pdf), and Word documents (.doc, .docx) are supported for creating questions using AI. Please add questions manually in the question bank for other file types.', 'error')
    //     return
    //   }
    // }

    const questionCount = parseInt(questionCounts[selectedResourceId]) || 0
    if (questionCount <= 0) {
      showToast('Please enter number of questions for the selected resource', 'error')
      return
    }

    // Prepare JSON data for API - Only include selected resource
    const questionData = {
      course_id: courseId,
      question_type: questionType,
      total_questions: totalQuestionsCount,
      resources: [
        {
          resource_id: selectedResource._id,
          resource_name: selectedResource.resource_name,
          number_of_questions: questionCount
        }
      ]
    }

    setCreating(true)
    try {
      const response = await generateQuestionsFromResources(questionData)
      
      if (response && response.STATUS === 'SUCCESSFUL') {
        console.log('Questions generated successfully:', response.DB_DATA)
        
        const dbData = response.DB_DATA
        const firstGenerationError = Array.isArray(dbData?.errors) && dbData.errors.length > 0
          ? dbData.errors[0]
          : null
        if (firstGenerationError?.error) {
          showToast(firstGenerationError.error, 'error')
          if ((dbData?.total_questions_generated || 0) === 0) {
            return
          }
        }

        // Get total questions generated from response (more accurate)
        const totalQuestionsGenerated = dbData?.total_questions_generated || 0
        let questionsAlreadySaved = false
        const questionsToSave = []
        
        // Check if we have results with questions array
        if (dbData?.results && Array.isArray(dbData.results)) {
          dbData.results.forEach((result) => {
            if (result.questions && Array.isArray(result.questions)) {
              result.questions.forEach((question) => {
                // Check if question already has an _id (meaning it's already saved by the backend)
                if (question._id) {
                  questionsAlreadySaved = true
                } else {
                  // Only add to save list if question doesn't have an ID
                  questionsToSave.push({
                    course_id: courseId,
                    question: question.question || question.question_text || '',
                    question_type: questionType === 'input' ? 'short_answer' : questionType,
                    options: question.options || [],
                    correct_answer: question.correct_answer || '',
                    points: question.points || 1,
                    resource_id: result.resource_id || question.resource_id
                  })
                }
              })
            }
          })
        }
        
        // Also check if content field has questions (newline-separated string)
        if (dbData?.content && typeof dbData.content === 'string') {
          const contentQuestions = dbData.content.split('\n').filter(q => q.trim() !== '')
          contentQuestions.forEach((questionText, index) => {
            // Find corresponding resource_id if available
            let resourceId = null
            if (dbData.results && dbData.results.length > 0) {
              // Try to match question index to resource
              const resourceIndex = Math.floor(index / (questionData.resources[0]?.number_of_questions || 1))
              if (dbData.results[resourceIndex]) {
                resourceId = dbData.results[resourceIndex].resource_id
              }
            }
            
            // Only add to save list if questions weren't already saved
            if (!questionsAlreadySaved) {
              questionsToSave.push({
                course_id: courseId,
                question: questionText.trim(),
                question_type: questionType === 'input' ? 'short_answer' : questionType,
                options: [],
                correct_answer: '',
                points: 1,
                resource_id: resourceId
              })
            }
          })
        }
        
        // If questions are already saved by the backend (have _id), show success message
        if (questionsAlreadySaved) {
          showToast(`Successfully generated and saved ${totalQuestionsGenerated} questions!`, 'success')
        } else if (questionsToSave.length > 0) {
          // Only try to save if questions don't have IDs (backward compatibility)
          try {
            const saveResponse = await saveQuestions({ questions: questionsToSave })
            if (saveResponse && saveResponse.STATUS === 'SUCCESSFUL') {
              showToast(`Successfully generated and saved ${questionsToSave.length} questions!`, 'success')
            } else {
              showToast(`Questions generated but failed to save some questions`, 'warning')
            }
          } catch (saveError) {
            console.error('Error saving questions:', saveError)
            // If save fails but questions were generated, still show success for generation
            if (totalQuestionsGenerated > 0) {
              showToast(`Successfully generated ${totalQuestionsGenerated} questions!`, 'success')
            } else {
              showToast('Questions generated but failed to save', 'warning')
            }
          }
        } else {
          // Fallback: show success if questions were generated
          if (totalQuestionsGenerated > 0) {
            showToast(`Successfully generated ${totalQuestionsGenerated} questions!`, 'success')
          } else {
            showToast('Questions generated successfully!', 'success')
          }
        }
        
        // Close drawer on success
        if (closeDrawer) {
          closeDrawer()
        }
      } else {
        showToast(response?.ERROR_DESCRIPTION || 'Failed to generate questions', 'error')
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      showToast(error?.response?.data?.ERROR_DESCRIPTION || 'Failed to generate questions', 'error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Header */}
      <div className='flex flex-col gap-2'>
        {/* <Typography className='text-[18px] font-semibold text-[#474747]'>
          Create Question
        </Typography> */}
        {courseName && (
          <Typography className='text-[14px] text-gray-600'>
            Course: {courseName}
          </Typography>
        )}
      </div>

      {/* Top Input Fields - Question Type and Total Questions */}
      <div className='grid grid-cols-2 gap-4'>
        {/* Question Type Dropdown */}
        <div className='w-full'>
          <Select
            label='Select Question Type'
            color='blue'
            value={questionType}
            onChange={(val) => setQuestionType(val)}
            required
          >
            {questionTypeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>

        {/* Total Number of Questions Input */}
        <div className='w-full'>
          <Input
            label='Total Number of Questions'
            type='number'
            color='blue'
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(e.target.value)}
            min='1'
            required
          />
        </div>
      </div>

      {/* Resources List */}
      <Card className='w-full drop-shadow'>
        <CardBody className='py-6 px-4'>
          {resourcesLoading ? (
            <TrainingDrawerSpinner label="Loading resources…" className="py-12" size="lg" />
          ) : resources.length > 0 ? (
            <div className='flex flex-col gap-3'>
              {resources.map((resource, index) => (
                <div key={resource._id || index} className='flex items-center gap-3 py-2'>
                  {/* Radio Button */}
                  <input
                    type='radio'
                    id={`resource-${resource._id}`}
                    name='selectedResource'
                    checked={selectedResourceId === resource._id}
                    onChange={() => {
                      setSelectedResourceId(resource._id)
                      // Clear question count when switching resources
                      if (selectedResourceId !== resource._id) {
                        setQuestionCounts(prev => ({
                          ...prev,
                          [resource._id]: ''
                        }))
                      }
                    }}
                    className='w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer'
                  />
                  
                  {/* Resource Name */}
                  <label 
                    htmlFor={`resource-${resource._id}`}
                    className='flex-1 cursor-pointer'
                  >
                    <Typography className='text-[14px] font-medium text-[#474747]'>
                      {resource.resource_name || 'N/A'}
                    </Typography>
                  </label>
                  
                  {/* Number of Questions Input - Only show when resource is selected */}
                  {selectedResourceId === resource._id && (
                    <div className='w-[200px]'>
                      <Input
                        label='Enter number of questions'
                        type='number'
                        color='blue'
                        value={questionCounts[resource._id] || ''}
                        onChange={(e) => handleQuestionCountChange(resource._id, e.target.value)}
                        min='0'
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Create Question Button */}
              <div className='flex justify-end mt-4 pt-4 border-t border-gray-200'>
                <Button
                  className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors'
                  onClick={handleCreateQuestion}
                  disabled={creating || !questionType}
                  loading={creating}
                >
                  {creating ? 'Creating...' : 'Create question'}
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-center py-16'>
              <Typography className="text-[16px] text-gray-500 font-medium">
                No resources found
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>
      <TrainingDrawerOverlay show={creating} label="Generating questions…" />
    </div>
  )
}

export default CreateQuestion

