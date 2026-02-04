import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Typography, Button, Card, CardBody } from '@material-tailwind/react'
import { FaArrowLeft, FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import useStore from '../../Store/store'
import AssignQuestion from './AssignQuestion'
import { showToast } from '../../Components/Toaster/Toaster'

const QuestionBank = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getCourseCompleteDetails } = TrainingService()

  // Drawer functions from store
  const openDrawer = useStore((state) => state.openDrawer)
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
  const settingComponent = useStore((state) => state.settingComponent)
  const settingDrawerSize = useStore((state) => state.settingDrawerSize)
  const closeDrawer = useStore((state) => state.closeDrawer)

  // Get course data from location state or params
  const courseId = location.state?.courseId || new URLSearchParams(location.search).get('courseId')
  const courseName = location.state?.courseName || new URLSearchParams(location.search).get('courseName')

  const [courseData, setCourseData] = useState(null)
  const [resourcesWithQuestions, setResourcesWithQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalResources, setTotalResources] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [selectedQuestions, setSelectedQuestions] = useState([]) // Array of { id, name }
  const [expandedResources, setExpandedResources] = useState({}) // Track which resources are expanded

  useEffect(() => {
    if (courseId) {
      fetchCourseCompleteDetails()
    }
  }, [courseId])

  const fetchCourseCompleteDetails = async () => {
    if (!courseId) return

    setLoading(true)
    try {
      const response = await getCourseCompleteDetails(courseId)
      if (response) {
        setCourseData(response.course)
        const resources = response.resources || []
        setResourcesWithQuestions(resources)
        setTotalResources(response.total_resources || 0)
        setTotalQuestions(response.total_questions || 0)

        // Initialize all resources as expanded
        const expanded = {}
        resources.forEach((item, index) => {
          const resource = item.resource || item
          const resourceId = resource._id || index
          expanded[resourceId] = true
        })
        setExpandedResources(expanded)
      }
    } catch (error) {
      console.error('Error fetching course complete details:', error)
      setResourcesWithQuestions([])
      setTotalResources(0)
      setTotalQuestions(0)
      setExpandedResources({})
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/trainingDash')
  }

  // Get course name from state, params, or fetched data
  const displayCourseName = courseName || courseData?.course_name || 'N/A'

  // Get all questions from all resources
  const getAllQuestions = () => {
    const allQuestions = []
    resourcesWithQuestions.forEach((item) => {
      const questions = item.questions || []
      questions.forEach((question) => {
        const questionId = question._id || question.id
        const questionName = question.question || 'N/A'
        if (questionId) {
          allQuestions.push({ id: questionId, name: questionName })
        }
      })
    })
    return allQuestions
  }

  // Check if all questions are selected
  const areAllQuestionsSelected = () => {
    const allQuestions = getAllQuestions()
    if (allQuestions.length === 0) return false
    return allQuestions.every(q => selectedQuestions.some(sq => sq.id === q.id))
  }

  // Handle select all / deselect all
  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      // Select all questions
      const allQuestions = getAllQuestions()
      setSelectedQuestions(allQuestions)
    } else {
      // Deselect all questions
      setSelectedQuestions([])
    }
  }

  // Toggle resource expansion
  const toggleResource = (resourceId) => {
    setExpandedResources(prev => ({
      ...prev,
      [resourceId]: !prev[resourceId]
    }))
  }

  // Get questions for a specific resource
  const getResourceQuestions = (questions) => {
    return questions.map((question) => {
      const questionId = question._id || question.id
      const questionName = question.question || 'N/A'
      return { id: questionId, name: questionName }
    }).filter(q => q.id)
  }

  // Check if all questions in a resource are selected
  const areAllResourceQuestionsSelected = (questions) => {
    const resourceQuestions = getResourceQuestions(questions)
    if (resourceQuestions.length === 0) return false
    return resourceQuestions.every(q => selectedQuestions.some(sq => sq.id === q.id))
  }

  // Handle resource-level select all
  const handleResourceSelectAll = (questions, isChecked) => {
    const resourceQuestions = getResourceQuestions(questions)
    if (isChecked) {
      // Add all resource questions to selection (avoid duplicates)
      setSelectedQuestions(prev => {
        const existingIds = prev.map(q => q.id)
        const newQuestions = resourceQuestions.filter(q => !existingIds.includes(q.id))
        return [...prev, ...newQuestions]
      })
    } else {
      // Remove all resource questions from selection
      const resourceQuestionIds = resourceQuestions.map(q => q.id)
      setSelectedQuestions(prev => prev.filter(q => !resourceQuestionIds.includes(q.id)))
    }
  }

  // Handle question selection (checkbox)
  const handleQuestionSelect = (questionId, questionName, isChecked) => {
    if (isChecked) {
      // Add question to selection
      setSelectedQuestions(prev => [...prev, { id: questionId, name: questionName }])
    } else {
      // Remove question from selection
      setSelectedQuestions(prev => prev.filter(q => q.id !== questionId))
    }
  }

  // Handle assign questions button click
  const handleAssignQuestions = () => {
    if (selectedQuestions.length === 0) {
      showToast('Please select at least one question', 'error')
      return
    }

    const questionIds = selectedQuestions.map(q => q.id)
    const questionNames = selectedQuestions.map(q => q.name)

    openDrawer()
    settingDrawerSize(558)
    settingDrawerTitle('Assign Questions')
    settingComponent(
      <AssignQuestion
        questionIds={questionIds}
        questionNames={questionNames}
        closeDrawer={closeDrawer}
      />
    )
  }

  // Handle add question button click
  const handleAddQuestion = () => {
    navigate('/addQuestionInBank', {
      state: {
        courseId: courseId,
        courseName: displayCourseName
      }
    })
  }

  return (
    <div className='flex flex-col gap-4 p-2'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant="text"
            className="flex items-center gap-2 p-2"
            onClick={handleBack}
          >
            <FaArrowLeft className="text-[16px]" />
          </Button>
          <div className='flex flex-col'>
            <Typography className='text-[20px] font-semibold text-[#474747]'>
              Question Bank
            </Typography>
            <Typography className='text-[14px] text-gray-600 mt-1'>
              Course: {displayCourseName}
            </Typography>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          {selectedQuestions.length > 0 && (
            <Typography className='text-[14px] text-gray-600'>
              {selectedQuestions.length} question(s) selected
            </Typography>
          )}
          <Button
            className='flex items-center gap-2 bg-green-500 py-2 px-4 capitalize hover:bg-green-600'
            onClick={handleAddQuestion}
          >
            <FaPlus className='text-[14px]' />
            Add Question
          </Button>
          <Button
            className='bg-blue-500 py-2 px-4 capitalize hover:bg-blue-600'
            onClick={handleAssignQuestions}
            disabled={selectedQuestions.length === 0}
          >
            Assign question
          </Button>
        </div>
      </div>

      {/* Resources with Questions List */}
      <Card className='w-full drop-shadow'>
        <CardBody className='py-6 px-4'>
          {loading ? (
            <div className='flex items-center justify-center py-16'>
              <Typography className="text-[16px] text-gray-500 font-medium">
                Loading...
              </Typography>
            </div>
          ) : resourcesWithQuestions.length > 0 ? (
            <div className='flex flex-col gap-4'>
              {resourcesWithQuestions.map((item, resourceIndex) => {
                const resource = item.resource || item
                const questions = item.questions || []
                const resourceId = resource._id || resourceIndex
                const isExpanded = expandedResources[resourceId] !== undefined ? expandedResources[resourceId] : true // Default to expanded

                return (
                  <div key={resourceId} className='border border-gray-200 rounded-lg overflow-hidden'>
                    {/* Resource Header with Accordion */}
                    <div
                      className='flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors'
                      onClick={() => toggleResource(resourceId)}
                    >
                      <div className='flex items-center gap-3 flex-1'>
                        {/* Chevron Icon */}
                        <div className='flex items-center justify-center w-6 h-6'>
                          {isExpanded ? (
                            <FaChevronDown className='text-gray-600 text-sm' />
                          ) : (
                            <FaChevronUp className='text-gray-600 text-sm' />
                          )}
                        </div>

                        {/* Resource Name */}
                        <Typography className='text-[16px] font-semibold text-[#474747]'>
                          {resourceIndex + 1}) {resource.resource_name || 'N/A'}
                        </Typography>

                        {/* Question Count */}
                        {questions.length > 0 && (
                          <Typography className='text-[12px] text-gray-500'>
                            ({questions.length} question{questions.length !== 1 ? 's' : ''})
                          </Typography>
                        )}
                      </div>

                      {/* Resource Select All Checkbox */}
                      {questions.length > 0 && (
                        <div
                          className='flex items-center gap-2'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type='checkbox'
                            id={`select-all-resource-${resourceId}`}
                            checked={areAllResourceQuestionsSelected(questions)}
                            onChange={(e) => handleResourceSelectAll(questions, e.target.checked)}
                            className='w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer rounded'
                          />
                          <label htmlFor={`select-all-resource-${resourceId}`} className='cursor-pointer'>
                            <Typography className='text-[12px] font-medium text-[#474747]'>
                              Select All
                            </Typography>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Questions under this resource (Collapsible) */}
                    {isExpanded && (
                      <div className='p-4 bg-white'>
                        {questions.length > 0 ? (
                          <div className='flex flex-col gap-2'>
                            {questions.map((question, questionIndex) => {
                              const questionId = question._id || question.id
                              const questionName = question.question || 'N/A'
                              const isSelected = selectedQuestions.some(q => q.id === questionId)

                              return (
                                <div key={questionId || questionIndex} className='flex items-center gap-3 py-1'>
                                  <input
                                    type='checkbox'
                                    id={`question-${questionId || questionIndex}`}
                                    checked={isSelected}
                                    onChange={(e) => handleQuestionSelect(questionId, questionName, e.target.checked)}
                                    className='w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer rounded'
                                  />
                                  <Typography className='text-[14px] font-medium text-[#474747]'>
                                    {questionName}
                                  </Typography>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div>
                            <Typography className='text-[13px] text-gray-400 italic'>
                              No questions available for this resource
                            </Typography>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='flex items-center justify-center py-16'>
              <Typography className="text-[16px] text-gray-500 font-medium">
                No resources found
              </Typography>
            </div>
          )}

          {/* Summary */}
          {(totalResources > 0 || totalQuestions > 0) && (
            <div className='mt-6 pt-4 border-t border-gray-200'>
              <Typography className='text-[14px] text-gray-600'>
                Total Resources: {totalResources} | Total Questions: {totalQuestions}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default QuestionBank

