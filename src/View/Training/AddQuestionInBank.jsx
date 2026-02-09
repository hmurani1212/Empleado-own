import React, { useEffect, useState } from 'react'
import { Typography, Card, CardBody, Input, Button, Select, Option } from '@material-tailwind/react'
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import { showToast } from '../../Components/Toaster/Toaster'
import CustomButton from '../../Components/CustomButton/CustomButton'

const AddQuestionInBank = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get course data from location state
  const courseId = location.state?.courseId
  const courseName = location.state?.courseName
  
  const { getCourseResources, addQuestionsToBank, isLoadingAddQuestionsBank } = TrainingService()
  
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)
  
  const [questions, setQuestions] = useState([
    {
      question: '',
      question_type: 'short_answer',
      options: [],
      correct_answer: '',
      points: 1,
      resource_id: ''
    }
  ])

  const questionTypes = [
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'checkbox', label: 'Checkbox' }
  ]

  useEffect(() => {
    if (courseId) {
      fetchResources()
    }
  }, [courseId])

  const fetchResources = async () => {
    setLoadingResources(true)
    try {
      const response = await getCourseResources(courseId, 1, 100)
      if (response) {
        setResources(response.resources || [])
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
      showToast('Failed to fetch resources', 'error')
    } finally {
      setLoadingResources(false)
    }
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        question_type: 'short_answer',
        options: [],
        correct_answer: '',
        points: 1,
        resource_id: ''
      }
    ])
  }

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index][field] = value
    
    if (field === 'question_type') {
      if (value === 'short_answer') {
        updatedQuestions[index].options = []
        updatedQuestions[index].correct_answer = ''
      } else if (value === 'true_false') {
        updatedQuestions[index].options = ['True', 'False']
        updatedQuestions[index].correct_answer = ''
      } else if (value === 'multiple_choice' || value === 'checkbox') {
        if (updatedQuestions[index].options.length === 0) {
          updatedQuestions[index].options = ['']
        }
        updatedQuestions[index].correct_answer = ''
      }
    }
    
    setQuestions(updatedQuestions)
  }

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options.push('')
    setQuestions(updatedQuestions)
  }

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions]
    if (updatedQuestions[questionIndex].options.length > 1) {
      updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex)
      setQuestions(updatedQuestions)
    }
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setQuestions(updatedQuestions)
  }

  const validateForm = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      
      if (!q.question.trim()) {
        showToast(`Question ${i + 1}: Please enter a question`, 'error')
        return false
      }

      if (!q.resource_id) {
        showToast(`Question ${i + 1}: Please select a resource`, 'error')
        return false
      }

      if (q.question_type === 'multiple_choice' || q.question_type === 'checkbox') {
        if (q.options.length < 2) {
          showToast(`Question ${i + 1}: Please add at least 2 options`, 'error')
          return false
        }
        
        const hasEmptyOption = q.options.some(opt => !opt.trim())
        if (hasEmptyOption) {
          showToast(`Question ${i + 1}: All options must be filled`, 'error')
          return false
        }

        if (!q.correct_answer.trim()) {
          showToast(`Question ${i + 1}: Please enter the correct answer`, 'error')
          return false
        }
      }

      if (q.question_type === 'true_false' && !q.correct_answer.trim()) {
        showToast(`Question ${i + 1}: Please select the correct answer`, 'error')
        return false
      }

      if (q.points < 1) {
        showToast(`Question ${i + 1}: Points must be at least 1`, 'error')
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    const payload = {
      course_id: courseId,
      questions: questions.map(q => ({
        question: q.question.trim(),
        question_type: q.question_type,
        options: q.options.filter(opt => opt.trim()),
        correct_answer: q.correct_answer.trim(),
        points: parseInt(q.points) || 1,
        resource_id: q.resource_id
      }))
    }

    const result = await addQuestionsToBank(payload)
    
    if (result.success) {
      navigate('/questionBank', { 
        state: { courseId, courseName } 
      })
    }
  }

  return (
    <div className='min-h-screen bg-gray-50/50 p-6 font-poppins'>
      <div className='max-w-5xl mx-auto space-y-6'>
        {/* Header with Back Button */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant="text"
              className="p-2 rounded-full hover:bg-white hover:shadow-sm"
              onClick={() => navigate('/questionBank', { state: { courseId, courseName } })}
            >
              <FaArrowLeft className="text-gray-600 text-lg" />
            </Button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Add Question to Bank</h1>
              <p className='text-sm text-gray-500 mt-1'>
                Course: <span className='font-semibold text-gray-700'>{courseName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className='space-y-6'>
          {questions.map((question, qIndex) => (
            <div key={qIndex} className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='p-6'>
                <div className='flex justify-between items-start mb-6'>
                  <Typography className='text-lg font-semibold text-gray-800'>
                    Question {qIndex + 1}
                  </Typography>
                  {questions.length > 1 && (
                    <button
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className='text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors'
                      title='Remove Question'
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                <div className='space-y-6'>
                  {/* Resource Selection */}
                  <div className='w-full'>
                    <Select
                      key={`resource-select-${qIndex}-${question.resource_id}`}
                      label='Select Resource'
                      color='blue'
                      value={question.resource_id}
                      onChange={(val) => handleQuestionChange(qIndex, 'resource_id', val)}
                      disabled={loadingResources}
                      className="!border-gray-200 focus:!border-blue-500"
                      labelProps={{ className: "text-gray-500" }}
                    >
                      {loadingResources ? (
                        <Option disabled>Loading resources...</Option>
                      ) : resources.length > 0 ? (
                        resources.map((resource) => (
                          <Option key={resource._id} value={resource._id}>
                            {resource.resource_name}
                          </Option>
                        ))
                      ) : (
                        <Option disabled>No resources available</Option>
                      )}
                    </Select>
                    {question.resource_id && resources.length > 0 && (
                      <Typography className='text-xs text-gray-500 mt-1 ml-1'>
                        Selected: {resources.find(r => r._id === question.resource_id)?.resource_name || 'N/A'}
                      </Typography>
                    )}
                  </div>

                  {/* Question Text */}
                  <Input
                    label='Question Text'
                    color='blue'
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    className="!border-gray-200 focus:!border-blue-500"
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Question Type */}
                    <Select
                      label='Question Type'
                      color='blue'
                      value={question.question_type}
                      onChange={(val) => handleQuestionChange(qIndex, 'question_type', val)}
                      className="!border-gray-200 focus:!border-blue-500"
                    >
                      {questionTypes.map((type) => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Select>

                    {/* Points */}
                    <Input
                      type='number'
                      label='Points'
                      color='blue'
                      value={question.points}
                      onChange={(e) => handleQuestionChange(qIndex, 'points', e.target.value)}
                      min='1'
                      className="!border-gray-200 focus:!border-blue-500"
                    />
                  </div>

                  {/* Options for Multiple Choice and Checkbox */}
                  {(question.question_type === 'multiple_choice' || question.question_type === 'checkbox') && (
                    <div className='bg-gray-50 rounded-xl p-4 space-y-4'>
                      <Typography className='text-sm font-medium text-gray-700'>
                        Answer Options
                      </Typography>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className='flex gap-2 items-center'>
                          <Input
                            label={`Option ${oIndex + 1}`}
                            color='blue'
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className="bg-white"
                          />
                          {question.options.length > 1 && (
                            <button
                              onClick={() => handleRemoveOption(qIndex, oIndex)}
                              className='text-red-500 hover:text-red-700 p-2 hover:bg-white rounded-lg transition-colors'
                              title='Remove Option'
                            >
                              <FaTrash className='text-sm' />
                            </button>
                          )}
                        </div>
                      ))}
                      <Button
                        size='sm'
                        variant='text'
                        className='flex items-center gap-2 text-blue-600 hover:bg-blue-50 normal-case'
                        onClick={() => handleAddOption(qIndex)}
                      >
                        <FaPlus className='text-xs' /> Add Option
                      </Button>
                    </div>
                  )}

                  {/* Correct Answer */}
                  {question.question_type === 'true_false' ? (
                    <Select
                      label='Correct Answer'
                      color='blue'
                      value={question.correct_answer}
                      onChange={(val) => handleQuestionChange(qIndex, 'correct_answer', val)}
                      className="!border-gray-200 focus:!border-blue-500"
                    >
                      <Option value='True'>True</Option>
                      <Option value='False'>False</Option>
                    </Select>
                  ) : question.question_type !== 'short_answer' && (
                    <Input
                      label='Correct Answer (Exact Match)'
                      color='blue'
                      value={question.correct_answer}
                      onChange={(e) => handleQuestionChange(qIndex, 'correct_answer', e.target.value)}
                      className="!border-gray-200 focus:!border-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className='sticky bottom-4 z-20 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 flex justify-between items-center'>
          <Button
            variant='outlined'
            className='flex items-center gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 normal-case'
            onClick={handleAddQuestion}
          >
            <FaPlus className='text-xs' /> Add Another Question
          </Button>
          
          <CustomButton
            title={isLoadingAddQuestionsBank ? 'Submitting...' : 'Submit Questions'}
            onClick={handleSubmit}
            disabled={isLoadingAddQuestionsBank}
            loading={isLoadingAddQuestionsBank}
            className="bg-bgBlue hover:bg-blue-600"
          />
        </div>
      </div>
    </div>
  )
}

export default AddQuestionInBank
