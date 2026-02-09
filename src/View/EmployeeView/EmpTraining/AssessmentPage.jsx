import React, { useEffect, useState } from 'react'
import { Card, CardBody, Typography, Button, Input, Textarea } from '@material-tailwind/react'
import { FaArrowLeft, FaCheckCircle, FaBook, FaClock, FaTrophy } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import useEmpTrainingService from '../../../ViewModel/EmpViewModel/EmpTrainingViewModel/EmpTrainingServices'
import { showToast } from '../../../Components/Toaster/Toaster'
import { motion } from 'framer-motion'

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
      <div className='flex justify-center items-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4'></div>
          <Typography variant='small' color='gray' className="font-medium">
            Loading assessment...
          </Typography>
        </div>
      </div>
    )
  }

  if (!assignedQuestions || !currentAssignment) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-6'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-md w-full'>
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaBook className='text-4xl text-gray-300' />
          </div>
          <Typography variant='h5' className='text-gray-800 font-bold mb-2'>
            No assessment available
          </Typography>
          <Typography className='text-gray-500 mb-8'>
            There are no assessments assigned to you at this time
          </Typography>
          <Button 
            className='bg-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40 rounded-xl'
            onClick={handleGoBack}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50/50 p-6 font-poppins'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Back Button */}
        <div>
          <button
            onClick={handleGoBack}
            className='flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group'
          >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
              <FaArrowLeft className="text-xs" />
            </div>
            <span className="text-sm font-medium">Back to Courses</span>
          </button>
        </div>

        {/* Assessment Header */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden'>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className='flex items-start gap-6 relative z-10'>
            <div className='w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0'>
              <FaBook className='text-3xl text-blue-500' />
            </div>
            <div className='flex-1'>
              <Typography className='text-2xl font-bold text-gray-900 mb-2 leading-tight'>
                {currentAssignment.course_name}
              </Typography>
              <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 font-medium">
                  <FaUser className="text-gray-400 text-xs" />
                  Assigned by: {currentAssignment.assigned_by_name}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 font-medium">
                  <FaTrophy className="text-yellow-500 text-xs" />
                  Total Score: {currentAssignment.total_score} pts
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                  <FaBook className="text-blue-500 text-xs" />
                  Questions: {currentAssignment.questions.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className='bg-blue-50 rounded-xl p-6 border border-blue-100 flex items-start gap-4'>
          <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-0.5">
            <FaClock className="text-sm" />
          </div>
          <div>
            <Typography className='font-bold text-blue-900 mb-1'>
              Instructions
            </Typography>
            <Typography className='text-sm text-blue-800/80 leading-relaxed'>
              Please answer all questions below carefully. Once you submit, you may not be able to change your answers. All questions are required.
            </Typography>
          </div>
        </div>

        {/* Questions */}
        <div className='space-y-6'>
          {currentAssignment.questions.map((question, index) => (
            <motion.div
              key={question.question_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <Typography className='font-bold text-gray-800'>
                    Question {index + 1}
                  </Typography>
                  <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    {question.points} {question.points === 1 ? 'point' : 'points'}
                  </span>
                </div>
                
                <div className='p-6'>
                  <Typography className='text-lg text-gray-800 mb-6 font-medium leading-relaxed'>
                    {question.question}
                  </Typography>
                  
                  {question.question_type === 'short_answer' && (
                    <Textarea
                      label='Your Answer'
                      value={answers[question.question_id] || ''}
                      onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
                      rows={4}
                      className='w-full !border-gray-200 focus:!border-blue-500 bg-gray-50/30'
                      labelProps={{
                        className: "text-gray-500",
                      }}
                    />
                  )}

                  {question.question_type === 'multiple_choice' && question.options && question.options.length > 0 && (
                    <div className='space-y-3'>
                      {question.options.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                            answers[question.question_id] === option 
                              ? 'bg-blue-50 border-blue-200 shadow-sm' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleAnswerChange(question.question_id, option)}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            answers[question.question_id] === option
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {answers[question.question_id] === option && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <Typography className={`font-medium ${
                            answers[question.question_id] === option ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {option}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit Section */}
        <div className='sticky bottom-6 z-20'>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
            <div>
              <Typography className='font-bold text-gray-800'>
                Ready to Submit?
              </Typography>
              <Typography className='text-xs text-gray-500'>
                {Object.keys(answers).length} of {currentAssignment.questions.length} questions answered
              </Typography>
            </div>
            <Button
              className='flex items-center gap-2 bg-green-500 hover:bg-green-600 shadow-green-500/20 hover:shadow-green-500/40 rounded-xl px-8 py-3 normal-case text-base font-medium'
              onClick={handleSubmitAssessment}
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
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
        </div>
      </div>
    </div>
  )
}

export default AssessmentPage
