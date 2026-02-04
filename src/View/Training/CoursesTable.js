import React, { useState } from 'react'
import { Card, CardBody, Typography, Button } from '@material-tailwind/react'
import { FaEye, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa'
import ViewCourseModal from './ViewCourseModal'

const CoursesTable = ({ training_data, currentPage, onLoadMore, shouldShowLoadMore, deteleCoursefn, onRefreshData }) => {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const handleViewCourse = (course) => {
    setSelectedCourse(course)
    setShowViewModal(true)
  }

  const courses = training_data?.courses || []

  return (
    <Card className="rounded-lg drop-shadow">
      <CardBody className="p-4">
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <Typography className="text-[16px] text-gray-600">
              No courses found
            </Typography>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-[14px] font-semibold text-[#474747]">Course Name</th>
                    <th className="text-left py-3 px-4 text-[14px] font-semibold text-[#474747]">Status</th>
                    <th className="text-left py-3 px-4 text-[14px] font-semibold text-[#474747]">Created Date</th>
                    <th className="text-left py-3 px-4 text-[14px] font-semibold text-[#474747]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id || course.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-[13px] text-[#474747]">{course.course_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                          course.status === 1 ? 'bg-green-100 text-green-800' :
                          course.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.status === 1 ? 'Published' : course.status === 0 ? 'Pending' : 'Not Approved'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[13px] text-[#474747]">
                        {course.createdAt ? new Date(course.createdAt * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCourse(course)}
                            className="p-2 text-[#3DA5F4] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Course"
                          >
                            <FaEye className="text-[14px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {shouldShowLoadMore && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={onLoadMore}
                  className="px-6 py-2 bg-[#3DA5F4] text-white rounded-lg hover:bg-[#2B8FD4] transition-colors"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </CardBody>

      {showViewModal && selectedCourse && (
        <ViewCourseModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setSelectedCourse(null)
            onRefreshData()
          }}
          courseData={selectedCourse}
        />
      )}
    </Card>
  )
}

export default CoursesTable

