import React, { useState, useEffect } from 'react'
import { Card, CardBody, Typography, Chip, Button } from '@material-tailwind/react'
import { FaCheckCircle, FaTimesCircle, FaRobot } from 'react-icons/fa'
import { showToast } from '../../Components/Toaster/Toaster'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import { TrainingDrawerSpinner, TrainingDrawerOverlay } from './TrainingDrawerLoader'

const AssessmentReview = ({ employeeData, courseId }) => {
  const { getEmployeeResolvedQuestions, isLoadingResolvedQuestions, updateQuestionCorrectness, isUpdatingQuestionCorrectness, aiGradeAssessment, isAiGrading } = TrainingService()
  const [manualOverrides, setManualOverrides] = useState({})
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingQuestions, setUpdatingQuestions] = useState({})

  useEffect(() => {
    fetchResolvedQuestions()
  }, [])

  const fetchResolvedQuestions = async () => {
    setLoading(true)
    try {
      const result = await getEmployeeResolvedQuestions(employeeData.employeeId, courseId)
      
      if (result.success) {
        const data = result.data
        
        const formattedQuestions = data.resolved_questions?.map(q => ({
          id: q.question_id,
          question: q.question,
          questionType: q.question_type,
          options: q.options || [],
          correctAnswer: q.correct_answer,
          employeeAnswer: q.employee_answer,
          isCorrect: q.is_correct,
          points: q.points_earned || 0,
          maxPoints: q.points || 1
        })) || []
        
        setQuestions(formattedQuestions)
      } else {
        showToast(result.error || 'Failed to fetch assessment data', 'error')
      }
    } catch (error) {
      console.error('Error fetching resolved questions:', error)
      showToast('Failed to fetch assessment data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCorrectness = async (questionId, isCorrect) => {
    setUpdatingQuestions(prev => ({ ...prev, [questionId]: true }))
    
    try {
      const questionUpdates = [{
        question_id: questionId,
        is_correct: isCorrect ? 1 : 0
      }]
      
      const result = await updateQuestionCorrectness(employeeData.employeeId, courseId, questionUpdates)
      
      if (result.success) {
        setManualOverrides(prev => ({ ...prev, [questionId]: isCorrect }))
        setQuestions(prevQuestions => 
          prevQuestions.map(q => 
            q.id === questionId ? { ...q, isCorrect } : q
          )
        )
      }
    } catch (error) {
      console.error('Error updating question correctness:', error)
    } finally {
      setUpdatingQuestions(prev => ({ ...prev, [questionId]: false }))
    }
  }

  if (loading || isLoadingResolvedQuestions) {
    return (
      <TrainingDrawerSpinner label="Loading assessment…" className="p-12 min-h-[200px]" size="lg" />
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-12'>
        <Typography variant='h6' className='text-gray-600 mb-2'>
          No Questions Found
        </Typography>
        <Typography variant='small' className='text-gray-500'>
          No assessment questions available
        </Typography>
      </div>
    )
  }

  const handleMarkQuestionsUsingAI = async () => {
    try {
      const result = await aiGradeAssessment(employeeData.employeeId, courseId)
      
      if (result.success) {
        await fetchResolvedQuestions()
      }
    } catch (error) {
      console.error('Error during AI grading:', error)
    }
  }

  return (
    <div className='relative flex flex-col gap-4 p-4 min-h-[280px]'>
      <div className='flex justify-end mb-2'>
        <Button
          className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 normal-case text-sm px-4 py-2'
          onClick={handleMarkQuestionsUsingAI}
          disabled={isAiGrading}
        >
          {isAiGrading ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              AI Grading in progress...
            </>
          ) : (
            <>
              <FaRobot className='text-sm' />
              Mark questions using AI
            </>
          )}
        </Button>
      </div>

      {questions.map((q, index) => {
        const hasOverride = manualOverrides[q.id] !== undefined
        const currentIsCorrect = hasOverride ? manualOverrides[q.id] : q.isCorrect
        const isNullStatus = q.isCorrect === null && !hasOverride
        
        return (
          <Card key={q.id} className={`${
            isNullStatus ? 'border-l-4 border-yellow-500' : 
            currentIsCorrect ? 'border-l-4 border-green-500' : 
            'border-l-4 border-red-500'
          }`}>
            <CardBody className='p-4'>
              <div className='flex justify-between items-start mb-3'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    {isNullStatus ? (
                      <FaTimesCircle className='text-yellow-600 text-base' />
                    ) : currentIsCorrect ? (
                      <FaCheckCircle className='text-green-600 text-base' />
                    ) : (
                      <FaTimesCircle className='text-red-600 text-base' />
                    )}
                    <Typography variant='small' className='font-semibold text-gray-700'>
                      Question {index + 1} - {
                        isNullStatus ? <span className='text-yellow-600'>Not Graded</span> :
                        currentIsCorrect ? <span className='text-green-600'>Correct</span> : 
                        <span className='text-red-600'>Incorrect</span>
                      }
                    </Typography>
                    {hasOverride && <Chip value="Manually Reviewed" className="bg-blue-100 text-blue-800 text-xs px-2 py-1" />}
                  </div>
                  <Typography variant='paragraph' className='text-gray-800 font-medium'>{q.question}</Typography>
                </div>
              </div>

              {q.questionType === 'multiple_choice' && q.options.length > 0 ? (
                <div className='grid grid-cols-1 gap-2 mt-4'>
                  {q.options.map((option, optIndex) => {
                    const isEmployeeAnswer = option === q.employeeAnswer
                    const isCorrectAnswer = option === q.correctAnswer
                    
                    return (
                      <div key={optIndex} className={`p-3 rounded-lg border-2 ${
                        isCorrectAnswer && isEmployeeAnswer ? 'bg-green-50 border-green-500' :
                        isCorrectAnswer ? 'bg-green-50 border-green-400' :
                        isEmployeeAnswer ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              isCorrectAnswer && isEmployeeAnswer ? 'bg-green-500 text-white' :
                              isCorrectAnswer ? 'bg-green-400 text-white' :
                              isEmployeeAnswer ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <Typography variant='small' className={`${isCorrectAnswer || isEmployeeAnswer ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                              {option}
                            </Typography>
                          </div>
                          <div className='flex gap-2'>
                            {isEmployeeAnswer && (
                              <Chip value="Employee's Answer" className={`${currentIsCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'} text-xs px-2 py-1`} />
                            )}
                            {isCorrectAnswer && !isEmployeeAnswer && (
                              <Chip value="Correct Answer" className="bg-green-600 text-white text-xs px-2 py-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='mt-4'>
                  <div className='bg-blue-50 p-4 rounded-lg border-2 border-blue-200'>
                    <Typography variant='small' className='text-blue-800 font-semibold mb-2'>Employee's Answer:</Typography>
                    <Typography variant='small' className='text-gray-800'>{q.employeeAnswer || 'No answer provided'}</Typography>
                  </div>
                </div>
              )}

              {isNullStatus && (
                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <div className='flex items-center justify-end gap-2'>
                    <Button
                      size='sm'
                      className='flex items-center gap-2 bg-green-600 hover:bg-green-700 normal-case text-xs px-4 py-2'
                      onClick={() => handleUpdateCorrectness(q.id, true)}
                      disabled={updatingQuestions[q.id]}
                    >
                      {updatingQuestions[q.id] ? (
                        <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white'></div>
                      ) : (
                        <FaCheckCircle className='text-xs' />
                      )}
                      Mark as Correct
                    </Button>
                    <Button
                      size='sm'
                      className='flex items-center gap-2 bg-red-600 hover:bg-red-700 normal-case text-xs px-4 py-2'
                      onClick={() => handleUpdateCorrectness(q.id, false)}
                      disabled={updatingQuestions[q.id]}
                    >
                      {updatingQuestions[q.id] ? (
                        <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white'></div>
                      ) : (
                        <FaTimesCircle className='text-xs' />
                      )}
                      Mark as Incorrect
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )
      })}
      <TrainingDrawerOverlay show={isAiGrading} label="AI grading in progress…" />
    </div>
  )
}

export default AssessmentReview
