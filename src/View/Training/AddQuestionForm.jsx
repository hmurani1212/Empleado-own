import React, { useEffect, useState } from 'react'
import { Typography, Card, CardBody, Input, Button, Select, Option } from '@material-tailwind/react'
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import { showToast } from '../../Components/Toaster/Toaster'

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
    <div className='flex flex-col gap-4 p-6'>
      {/* Header with Back Button */}
      <div className='flex items-center gap-4 mb-2'>
        <button
          onClick={() => navigate('/trainingDash')}
          className='flex items-center gap-2 text-[#3da5f4] hover:text-[#2d8dd4] transition-colors'
        >
          <FaArrowLeft className='text-[16px]' />
          <span className='text-[16px] font-medium'>Back to Training Dashboard</span>
        </button>
      </div>

      <div className='flex justify-between items-center mb-2'>
        <span className='text-[20px] font-semibold text-[#474747]'>Add Question</span>
      </div>

      {/* Course and Assessment Selection */}
      <Card className='w-full drop-shadow'>
        <CardBody className='py-4 px-4'>
          <div className='flex flex-col gap-4'>
            {/* Course Dropdown */}
            <div className='w-full'>
              <Select
                label='Select Course'
                color='blue'
                value={selectedCourseId}
                onChange={(val) => setSelectedCourseId(val)}
                disabled={loadingCourses}
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
        </CardBody>
      </Card>

      {/* Questions Section */}
      <div className='flex-1 overflow-y-auto customScroll'>
        <div className='flex flex-col gap-4'>
          {questions.map((question, qIndex) => (
            <Card key={qIndex} className='w-full drop-shadow'>
              <CardBody className='py-4 px-4'>
                <div className='flex flex-col gap-4'>
                  {/* Question Header */}
                  <div className='flex justify-between items-center'>
                    <Typography className='text-[16px] font-semibold text-[#474747]'>
                      Question {qIndex + 1}
                    </Typography>
                    {questions.length > 1 && (
                      <button
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className='text-red-500 hover:text-red-700 p-2'
                        title='Remove Question'
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <Input
                    label='Question'
                    color='blue'
                    value={question.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                  />

                  {/* Question Type */}
                  <Select
                    label='Question Type'
                    color='blue'
                    value={question.question_type}
                    onChange={(val) => handleQuestionChange(qIndex, 'question_type', val)}
                  >
                    {questionTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>

                  {/* Options for Multiple Choice and Checkbox */}
                  {(question.question_type === 'multiple_choice' || question.question_type === 'checkbox') && (
                    <div className='flex flex-col gap-2'>
                      <Typography className='text-[14px] font-medium text-[#474747]'>
                        Options
                      </Typography>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className='flex gap-2 items-center'>
                          <Input
                            label={`Option ${oIndex + 1}`}
                            color='blue'
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          />
                          {question.options.length > 1 && (
                            <button
                              onClick={() => handleRemoveOption(qIndex, oIndex)}
                              className='text-red-500 hover:text-red-700 p-2'
                              title='Remove Option'
                            >
                              <FaTrash className='text-sm' />
                            </button>
                          )}
                        </div>
                      ))}
                      <Button
                        size='sm'
                        variant='outlined'
                        className='flex items-center gap-2 capitalize font-normal text-[13px] border border-[#3da5f4] text-[#3da5f4]'
                        onClick={() => handleAddOption(qIndex)}
                      >
                        <FaPlus className='text-[12px]' />
                        Add Option
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
                    >
                      <Option value='True'>True</Option>
                      <Option value='False'>False</Option>
                    </Select>
                  ) : question.question_type !== 'short_answer' && (
                    <Input
                      label='Correct Answer'
                      color='blue'
                      value={question.correct_answer}
                      onChange={(e) => handleQuestionChange(qIndex, 'correct_answer', e.target.value)}
                    />
                  )}

                  {/* Points */}
                  <Input
                    type='number'
                    label='Points'
                    color='blue'
                    value={question.points}
                    onChange={(e) => handleQuestionChange(qIndex, 'points', e.target.value)}
                    min='1'
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3 justify-between pt-4 border-t border-gray-200'>
        <Button
          variant='outlined'
          className='flex items-center gap-2 capitalize font-normal text-[13px] border border-[#3da5f4] text-[#3da5f4]'
          onClick={handleAddQuestion}
        >
          <FaPlus className='text-[12px]' />
          Add Another Question
        </Button>
        
        <Button
          className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors capitalize font-normal text-[13px]'
          onClick={handleSubmit}
          disabled={isLoadingAddQuestions}
          loading={isLoadingAddQuestions}
        >
          {isLoadingAddQuestions ? 'Submitting...' : 'Submit Questions'}
        </Button>
      </div>
    </div>
  )
}

export default AddQuestionForm
