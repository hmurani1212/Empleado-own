import React, { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  Typography,
  Button
} from '@material-tailwind/react'
import {
  FaPlus,
  FaTimes
} from 'react-icons/fa'
import useStore from "../../Store/store"
import { showToast } from "../../Components/Toaster/Toaster"
import QuestionBank from './QuestionBank'

const Assessment = ({ view, onViewChange, onClose, courseId }) => {
  const store = useStore();
  const fetchAssessmentsFunction = store.getCourseAssessments;
  const [assessments, setAssessments] = useState([])
  const [assessmentsLoading, setAssessmentsLoading] = useState(false)
  const [showQuestionBank, setShowQuestionBank] = useState(false)

  useEffect(() => {
    if (courseId) {
      fetchAssessments(courseId, 1);
    }
  }, [courseId]);

  const fetchAssessments = async (courseId, page = 1) => {
    setAssessmentsLoading(true);
    try {
      if (fetchAssessmentsFunction) {
        const response = await fetchAssessmentsFunction(courseId, page, 10);
        if (response && response.assessments) {
          setAssessments(response.assessments);
          onViewChange('table');
        } else {
          onViewChange('empty');
        }
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setAssessmentsLoading(false);
    }
  };

  if (view === 'empty') {
    return (
      <div className="text-center py-12">
        <Typography className="text-[16px] text-gray-600 mb-4">
          You haven't added any Assessment yet!
        </Typography>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => onViewChange('form')}
            className="bg-[#3DA5F4] text-white px-6 py-2 rounded-lg hover:bg-[#2B8FD4] transition-colors flex items-center gap-2"
          >
            <FaPlus className="text-[12px]" />
            Add Assessment
          </Button>
          <Button
            onClick={() => setShowQuestionBank(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center gap-2"
          >
            Use Question Bank
          </Button>
        </div>
      </div>
    )
  }

  if (view === 'table') {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Typography className="text-[16px] font-semibold text-[#474747]">
            Assessments
          </Typography>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowQuestionBank(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center gap-2"
            >
              Question Bank
            </Button>
            <Button
              onClick={() => onViewChange('form')}
              className="bg-[#3DA5F4] text-white px-4 py-2 rounded-lg hover:bg-[#2B8FD4] transition-colors flex items-center gap-2"
            >
              <FaPlus className="text-[12px]" />
              Add Assessment
            </Button>
          </div>
        </div>

        <Card className="rounded-lg drop-shadow">
          <CardBody className="p-4">
            {assessmentsLoading ? (
              <div className="text-center py-8">
                <Typography className="text-[14px] text-gray-600">
                  Loading assessments...
                </Typography>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-8">
                <Typography className="text-[14px] text-gray-600">
                  No assessments found
                </Typography>
              </div>
            ) : (
              <div className="space-y-2">
                {assessments.map((assessment) => (
                  <div key={assessment._id} className="p-3 border border-gray-200 rounded-lg">
                    <Typography className="text-[14px] font-medium text-[#474747]">
                      {assessment.assessment_name || 'Assessment'}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <>
      {showQuestionBank && (
        <QuestionBank
          isOpen={showQuestionBank}
          onClose={() => setShowQuestionBank(false)}
          courseId={courseId}
        />
      )}
    </>
  )
}

export default Assessment

