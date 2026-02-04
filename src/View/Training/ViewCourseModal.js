import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardBody, 
  Typography, 
  Button
} from '@material-tailwind/react'
import { 
  FaTimes
} from 'react-icons/fa'
import CourseAssignment from './CourseAssignment'
import Assessment from './Assessment'
import ResourceViewer from './ResourceViewer'
import AssessmentResultsDashboard from './AssessmentResultsDashboard'
import TimeTracking from './TimeTracking'
import useStore from "../../Store/store"

const ViewCourseModal = ({ isOpen, onClose, courseData }) => {
  const { getCourseDetails, getCourseResources } = useStore();
  
  const [activeTab, setActiveTab] = useState('courseDetails')
  const [courseDetails, setCourseDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [showResourceViewer, setShowResourceViewer] = useState(false)

  const tabs = [
    { id: 'courseDetails', label: 'Course Details' },
    { id: 'resources', label: 'Resources' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'courseAssignment', label: 'Course Assignment' },
    { id: 'results', label: 'Results' },
    { id: 'timeTracking', label: 'Time Tracking' }
  ]

  useEffect(() => {
    if (isOpen && courseData?._id) {
      fetchCourseDetails(courseData._id)
    }
  }, [isOpen, courseData])

  const fetchCourseDetails = async (courseId) => {
    setLoading(true)
    try {
      const details = await getCourseDetails(courseId)
      const courseData = details?.DB_DATA?.DB_DATA || details?.DB_DATA || details;
      setCourseDetails(courseData)
    } catch (error) {
      console.error('Error fetching course details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTimeTrack = (resourceId, timeSpent) => {
    // TODO: Implement API call to save time spent
    console.log('Time tracked:', { resourceId, timeSpent })
  }

  if (!isOpen) return null

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardBody className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Typography className="text-[18px] font-semibold text-[#474747]">
              View Course
            </Typography>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="text-[18px]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-[14px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#3DA5F4] border-b-2 border-[#3DA5F4]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'courseDetails' && (
              <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Typography className="text-[16px] text-gray-600">
                    Loading course details...
                  </Typography>
                </div>
              ) : courseDetails ? (
                <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Typography className="text-[14px] font-medium text-[#474747] mb-1">
                            Course Name
                          </Typography>
                        <Typography className="text-[14px] text-[#474747]">
                          {courseDetails.course_name || 'N/A'}
                        </Typography>
                      </div>
                      <div>
                        <Typography className="text-[14px] font-medium text-[#474747] mb-1">
                          Status
                          </Typography>
                        <Typography className="text-[14px] text-[#474747]">
                          {courseDetails.status === 1 ? 'Published' : courseDetails.status === 0 ? 'Pending' : 'Not Approved'}
                        </Typography>
                      </div>
                      <div className="col-span-2">
                        <Typography className="text-[14px] font-medium text-[#474747] mb-1">
                          Description
                          </Typography>
                        <Typography className="text-[14px] text-[#474747]">
                          {courseDetails.description || 'N/A'}
                        </Typography>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Typography className="text-[16px] text-gray-600">
                    No course details available
                  </Typography>
                </div>
              )}
            </div>
          )}

            {activeTab === 'resources' && courseData?._id && (
            <div>
                {/* Resources will be displayed here - can integrate with existing resource management */}
                          <Typography className="text-[14px] text-gray-600">
                  Resources management - Click on resources to view them
                    </Typography>
                        </div>
                      )}

            {activeTab === 'assessments' && courseData?._id && (
            <Assessment 
                view="table"
                onViewChange={() => {}}
              onClose={onClose}
                courseId={courseData._id}
              />
            )}

            {activeTab === 'courseAssignment' && courseData?._id && (
              <CourseAssignment 
                view="table"
                onViewChange={() => {}}
                onClose={onClose}
                courseId={courseData._id}
              />
            )}

            {activeTab === 'results' && courseData?._id && (
              <AssessmentResultsDashboard 
                courseId={courseData._id}
                isManagerView={true}
              />
            )}

            {activeTab === 'timeTracking' && courseData?._id && (
              <TimeTracking 
                courseId={courseData._id}
                isManagerView={true}
              />
            )}
        </CardBody>
      </Card>
              </div>

      {showResourceViewer && selectedResource && (
        <ResourceViewer
          resource={selectedResource}
        onClose={() => {
            setShowResourceViewer(false)
            setSelectedResource(null)
        }}
          onTimeTrack={handleTimeTrack}
      />
      )}
    </>
  )
}

export default ViewCourseModal 

