import React, { useEffect, useState } from 'react'
import { Typography, Card, CardBody, Input, Button, Select, Option } from '@material-tailwind/react'
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import { showToast } from '../../Components/Toaster/Toaster'
import CustomButton from '../../Components/CustomButton/CustomButton'

const AddQuestionForm = () => {
  const navigate = useNavigate()
  const { getAllCourses, getAssessmentsByCourse, addQuestionsToAssessment, isLoadingAddQuestions } = TrainingService()
  
  const [courses, setCourses] = useState([])
  const [assessments, setAssessments] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingAssessments, setLoadingAssessments] = useState(false)
  
  const [questions, setQuestions] = useState([
    {
      question: '',
      question_type: 'short_answer',
      options: [],
      correct_answer: '',
      points: 1
    }
  ])

  const questionTypes = [
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false', label: 'True/False' },
    { value: 'checkbox', label: 'Checkbox' }
  ]

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourseId) {
      fetchAssessments(selectedCourseId)
    } else {
      setAssessments([])
      setSelectedResourceId('')
    }
  }, [selectedCourseId])

  const fetchCourses = async () => {
    setLoadingCourses(true)
    try {
      const response = await getAllCourses()
      if (response.success && response.data) {
        setCourses(response.data.courses || [])
      } else {
        showToast(response.error || 'Failed to fetch courses', 'error')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      showToast('Failed to fetch courses', 'error')
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchAssessments = async (courseId) => {
    setLoadingAssessments(true)
    try {
      const response = await getAssessmentsByCourse(courseId)
      if (response.success && response.data) {
        setAssessments(response.data.assessments || [])
      } else {
        showToast(response.error || 'Failed to fetch assessments', 'error')
      }
    } catch (error) {
      console.error('Error fetching assessments:', error)
      showToast('Failed to fetch assessments', 'error')
    } finally {
      setLoadingAssessments(false)
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
        points: 1
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
    
    // Reset options and correct_answer when question type changes
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
    if (!selectedCourseId) {
      showToast('Please select a course', 'error')
      return false
    }

    if (!selectedResourceId) {
      showToast('Please select an assessment', 'error')
      return false
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      
      if (!q.question.trim()) {
        showToast(`Question ${i + 1}: Please enter a question`, 'error')
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
      course_id: selectedCourseId,
      resource_id: selectedResourceId,
      questions: questions.map(q => ({
        question: q.question.trim(),
        question_type: q.question_type,
        options: q.options.filter(opt => opt.trim()),
        correct_answer: q.correct_answer.trim(),
        points: parseInt(q.points) || 1
      }))
    }

    const result = await addQuestionsToAssessment(payload)
    
    if (result.success) {
      navigate('/trainingDash')
    }
  }

  return (
    <div className='min-h-screen bg-gray-50/50 p-6 font-poppins'>
      <div className='max-w-5xl mx-auto space-y-6'>
        
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant="text"
              className="p-2 rounded-full hover:bg-white hover:shadow-sm"
              onClick={() => navigate('/trainingDash')}
            >
              <FaArrowLeft className="text-gray-600 text-lg" />
            </Button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Add Question</h1>
              <p className='text-sm text-gray-500 mt-1'>Add questions to an existing assessment</p>
            </div>
          </div>
        </div>

        {/* Course and Assessment Selection */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Course Dropdown */}
            <div className='w-full'>
              <Select
                label='Select Course'
                color='blue'
                value={selectedCourseId}
                onChange={(val) => setSelectedCourseId(val)}
                disabled={loadingCourses}
                containerProps={{ className: "min-w-[100px]" }}
                className="!border-gray-200 focus:!border-blue-500"
                labelProps={{ className: "text-gray-500" }}
              >
                {loadingCourses ? (
                  <Option disabled>Loading courses...</Option>
                ) : courses.length > 0 ? (
                  courses.map((course) => (
                    <Option key={course._id} value={course._id}>
                      {course.course_name}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No courses available</Option>
                )}
              </Select>
            </div>

            {/* Assessment Dropdown */}
            <div className='w-full'>
              <Select
                label='Select Assessment'
                color='blue'
                value={selectedResourceId}
                onChange={(val) => setSelectedResourceId(val)}
                disabled={!selectedCourseId || loadingAssessments}
                containerProps={{ className: "min-w-[100px]" }}
                className="!border-gray-200 focus:!border-blue-500"
                labelProps={{ className: "text-gray-500" }}
              >
                {loadingAssessments ? (
                  <Option disabled>Loading assessments...</Option>
                ) : assessments.length > 0 ? (
                  assessments.map((assessment) => (
                    <Option key={assessment._id} value={assessment._id}>
                      {assessment.assessment_name || assessment.name || 'Unnamed Assessment'}
                    </Option>
                  ))
                ) : (
                  <Option disabled>
                    {selectedCourseId ? 'No assessments available' : 'Select a course first'}
                  </Option>
                )}
              </Select>
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
            title={isLoadingAddQuestions ? 'Submitting...' : 'Submit Questions'}
            onClick={handleSubmit}
            disabled={isLoadingAddQuestions}
            loading={isLoadingAddQuestions}
            className="bg-bgBlue hover:bg-blue-600"
          />
        </div>
      </div>
    </div>
  )
}

export default AddQuestionForm
