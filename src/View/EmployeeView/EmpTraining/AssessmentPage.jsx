import React, { useEffect, useState } from 'react'
import { Card, CardBody, Typography, Button, Input, Textarea } from '@material-tailwind/react'
import { FaArrowLeft, FaCheckCircle, FaBook } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import useEmpTrainingService from '../../../ViewModel/EmpViewModel/EmpTrainingViewModel/EmpTrainingServices'
import { showToast } from '../../../Components/Toaster/Toaster'

const AssessmentPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { assignedQuestions, getAssignedQuestions, loading, submitEmployeeAnswers } = useEmpTrainingService()
  
  const [answers, setAnswers] = useState({})
  const [currentAssignment, setCurrentAssignment] = useState(null)
  const [courseId, setCourseId] = useState(location.state?.course_id || null)
  const [courseName, setCourseName] = useState(location.state?.course_name || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAssessment()
  }, [])

  const fetchAssessment = async () => {
    if (!courseId) {
      showToast('Course information is missing', 'error')
      navigate('/EmployeeTraining')
      return
    }

    const result = await getAssignedQuestions()
    if (result.success && result.data) {
      if (result.data.assignments && result.data.assignments.length > 0) {
        const assignment = result.data.assignments[0]
        setCurrentAssignment(assignment)
      }
    }
  }

  const handleGoBack = () => {
    navigate('/EmployeeTraining')
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmitAssessment = async () => {
    if (!currentAssignment) return

    const unansweredQuestions = currentAssignment.questions.filter(
      q => !answers[q.question_id] || answers[q.question_id].trim() === ''
    )

    if (unansweredQuestions.length > 0) {
      showToast(`Please answer all questions (${unansweredQuestions.length} remaining)`, 'warning')
      return
    }

    // Prepare payload
    const payload = {
      course_id: courseId,
      answers: currentAssignment.questions.map(q => ({
        question_id: q.question_id,
        answer: answers[q.question_id]
      }))
    }

    setIsSubmitting(true)
    try {
      const result = await submitEmployeeAnswers(payload)
      if (result.success) {
        setTimeout(() => {
          navigate('/EmployeeTraining')
        }, 1500)
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <Typography variant='small' color='gray'>
            Loading assessment...
          </Typography>
        </div>
      </div>
    )
  }

  if (!assignedQuestions || !currentAssignment) {
    return (
      <div className='p-6'>
        <Card>
          <CardBody className='text-center py-20'>
            <FaBook className='text-6xl text-gray-300 mx-auto mb-4' />
            <Typography variant='h5' color='blue-gray' className='mb-2'>
              No assessment available
            </Typography>
            <Typography variant='small' color='gray' className='mb-4'>
              There are no assessments assigned to you at this time
            </Typography>
            <Button color='blue' onClick={handleGoBack}>
              Go Back to Courses
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-6'>
      {/* Back Button */}
      <div className='mb-6'>
        <Button
          variant='text'
          color='blue'
          className='flex items-center gap-2'
          onClick={handleGoBack}
        >
          <FaArrowLeft />
          Back to Courses
        </Button>
      </div>

      {/* Assessment Header */}
      <div className='mb-6'>
        <Card>
          <CardBody>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-blue-50 rounded-lg'>
                <FaBook className='text-3xl text-blue-500' />
              </div>
              <div className='flex-1'>
                <Typography variant='h4' color='blue-gray' className='mb-2'>
                  {currentAssignment.course_name}
                </Typography>
                <div className='flex items-center gap-4 text-sm text-gray-600'>
                  <span>
                    Assigned by: <strong>{currentAssignment.assigned_by_name}</strong>
                  </span>
                  <span>
                    Total Score: <strong>{currentAssignment.total_score} points</strong>
                  </span>
                  <span>
                    Questions: <strong>{currentAssignment.questions.length}</strong>
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Assessment Instructions */}
      <Card className='mb-6'>
        <CardBody>
          <Typography variant='h6' color='blue-gray' className='mb-2'>
            Instructions
          </Typography>
          <Typography variant='small' color='gray'>
            Please answer all questions below. All questions are required. Click "Submit Assessment" when you're done.
          </Typography>
        </CardBody>
      </Card>

      {/* Questions */}
      <div className='space-y-4 mb-6'>
        {currentAssignment.questions.map((question, index) => (
          <Card key={question.question_id}>
            <CardBody>
              <div className='mb-4'>
                <Typography variant='h6' color='blue-gray' className='mb-2'>
                  Question {index + 1} ({question.points} {question.points === 1 ? 'point' : 'points'})
                </Typography>
                <Typography variant='paragraph' color='gray' className='mb-4'>
                  {question.question}
                </Typography>
                
                {question.question_type === 'short_answer' && (
                  <Textarea
                    label='Your Answer'
                    value={answers[question.question_id] || ''}
                    onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
                    rows={4}
                    className='w-full'
                  />
                )}

                {question.question_type === 'multiple_choice' && question.options && question.options.length > 0 && (
                  <div className='space-y-2'>
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className='flex items-center gap-2'>
                        <input
                          type='radio'
                          id={`${question.question_id}-${optIndex}`}
                          name={question.question_id}
                          value={option}
                          checked={answers[question.question_id] === option}
                          onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
                          className='w-4 h-4'
                        />
                        <label htmlFor={`${question.question_id}-${optIndex}`} className='cursor-pointer'>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <Card>
        <CardBody>
          <div className='flex items-center justify-between'>
            <div>
              <Typography variant='h6' color='blue-gray' className='mb-1'>
                Ready to Submit?
              </Typography>
              <Typography variant='small' color='gray'>
                Make sure you've answered all questions before submitting
              </Typography>
            </div>
            <Button
              color='green'
              size='lg'
              className='flex items-center gap-2'
              onClick={handleSubmitAssessment}
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Submit Assessment
                </>
              )}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default AssessmentPage
