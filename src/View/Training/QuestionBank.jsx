import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Typography, Button, Card, CardBody } from '@material-tailwind/react'
import { FaArrowLeft, FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import useStore from '../../Store/store'
import AssignQuestion from './AssignQuestion'
import { showToast } from '../../Components/Toaster/Toaster'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { motion, AnimatePresence } from 'framer-motion'
import QuestionBankSkeleton from './QuestionBankSkeleton'

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
    <div className='min-h-screen  p-6 font-poppins'>
      <div className=' mx-auto space-y-6'>
        
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant="text"
              className="p-2 rounded-full hover:bg-white hover:shadow-sm"
              onClick={handleBack}
            >
              <FaArrowLeft className="text-gray-600 text-lg" />
            </Button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Question Bank</h1>
              <p className='text-sm text-gray-500 mt-1'>Course: <span className="font-semibold text-gray-700">{displayCourseName}</span></p>
            </div>
          </div>
          
          <div className='flex items-center gap-3'>
            {selectedQuestions.length > 0 && (
              <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                {selectedQuestions.length} selected
              </div>
            )}
            
            <CustomButton
              title="Add Question"
              onClick={handleAddQuestion}
              icon={<FaPlus className="text-sm" />}
              className="bg-green-500 hover:bg-green-600"
            />
            
            <CustomButton
              title="Assign Questions"
              onClick={handleAssignQuestions}
              disabled={selectedQuestions.length === 0}
              className={`${selectedQuestions.length === 0 ? 'bg-gray-300' : 'bg-bgBlue'}`}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
          <div className='p-6'>
            {loading ? (
              <QuestionBankSkeleton />
            ) : resourcesWithQuestions.length > 0 ? (
              <div className='flex flex-col gap-4'>
                {/* Global Select All (Optional) */}
                {/* <div className="flex items-center gap-2 p-2 mb-2">
                  <input
                    type='checkbox'
                    checked={areAllQuestionsSelected()}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                  />
                  <span className="text-sm font-medium text-gray-700">Select All Questions</span>
                </div> */}

                {resourcesWithQuestions.map((item, resourceIndex) => {
                  const resource = item.resource || item
                  const questions = item.questions || []
                  const resourceId = resource._id || resourceIndex
                  const isExpanded = expandedResources[resourceId] !== undefined ? expandedResources[resourceId] : true

                  return (
                    <motion.div 
                      key={resourceId} 
                      className='border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-200'
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: resourceIndex * 0.05 }}
                    >
                      {/* Resource Header */}
                      <div
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                        onClick={() => toggleResource(resourceId)}
                      >
                        <div className='flex items-center gap-4 flex-1'>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isExpanded ? 'bg-white shadow-sm text-blue-600' : 'bg-gray-100 text-gray-500'} transition-all`}>
                            {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                          </div>

                          <div className="flex-1">
                            <Typography className='text-sm font-semibold text-gray-800'>
                              {resource.resource_name || 'Unnamed Resource'}
                            </Typography>
                            {questions.length > 0 && (
                              <Typography className='text-xs text-gray-500 mt-0.5'>
                                {questions.length} question{questions.length !== 1 ? 's' : ''} available
                              </Typography>
                            )}
                          </div>
                        </div>

                        {questions.length > 0 && (
                          <div
                            className='flex items-center gap-2 pl-4 border-l border-gray-200'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type='checkbox'
                              id={`select-all-resource-${resourceId}`}
                              checked={areAllResourceQuestionsSelected(questions)}
                              onChange={(e) => handleResourceSelectAll(questions, e.target.checked)}
                              className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer'
                            />
                            <label htmlFor={`select-all-resource-${resourceId}`} className='text-xs font-medium text-gray-600 cursor-pointer select-none'>
                              Select All
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Questions List */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className='p-4 border-t border-gray-100 bg-white space-y-2'>
                              {questions.length > 0 ? (
                                questions.map((question, questionIndex) => {
                                  const questionId = question._id || question.id
                                  const questionName = question.question || 'N/A'
                                  const isSelected = selectedQuestions.some(q => q.id === questionId)

                                  return (
                                    <div 
                                      key={questionId || questionIndex} 
                                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${isSelected ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                    >
                                      <div className="pt-0.5">
                                        <input
                                          type='checkbox'
                                          id={`question-${questionId || questionIndex}`}
                                          checked={isSelected}
                                          onChange={(e) => handleQuestionSelect(questionId, questionName, e.target.checked)}
                                          className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer'
                                        />
                                      </div>
                                      <label htmlFor={`question-${questionId || questionIndex}`} className="flex-1 cursor-pointer select-none">
                                        <Typography className='text-sm text-gray-700 font-medium leading-snug'>
                                          {questionName}
                                        </Typography>
                                        <div className="flex gap-2 mt-1">
                                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                                            {question.question_type?.replace(/_/g, ' ') || 'Type N/A'}
                                          </span>
                                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                            {question.points || 1} Pts
                                          </span>
                                        </div>
                                      </label>
                                    </div>
                                  )
                                })
                              ) : (
                                <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                  <Typography className='text-xs text-gray-400 italic'>
                                    No questions available for this resource
                                  </Typography>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-20 text-center'>
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FaBook className="text-3xl text-gray-300" />
                </div>
                <Typography className="text-lg font-medium text-gray-700">No Resources Found</Typography>
                <Typography className="text-sm text-gray-500 mt-1">
                  This course doesn't have any resources with questions yet.
                </Typography>
                <Button 
                  variant="outlined" 
                  className="mt-4 border-gray-300 text-gray-600"
                  onClick={handleBack}
                >
                  Go Back
                </Button>
              </div>
            )}

            {/* Summary Footer */}
            {(totalResources > 0 || totalQuestions > 0) && (
              <div className='mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500'>
                <div>
                  Total Resources: <span className="font-semibold text-gray-700">{totalResources}</span>
                </div>
                <div>
                  Total Questions: <span className="font-semibold text-gray-700">{totalQuestions}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionBank

