import React, { useState, useEffect } from 'react'
import { Typography } from '@material-tailwind/react'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import { TrainingDrawerSpinner } from './TrainingDrawerLoader'

const CourseEmployeesList = ({ courseId, courseName }) => {
  const { getCourseEmployees, isLoadingCourseEmployees } = TrainingService()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (courseId) {
      fetchEmployees()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const fetchEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getCourseEmployees(courseId)
      if (result.success && result.data) {
        setEmployees(result.data.employees || [])
      } else {
        setError(result.error || 'Failed to load employees')
      }
    } catch (err) {
      setError(err.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  if (loading || isLoadingCourseEmployees) {
    return (
      <TrainingDrawerSpinner label="Loading employees…" className="min-h-[200px]" size="lg" />
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <Typography className="text-[16px] text-red-500">
          {error}
        </Typography>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Typography className="text-[18px] font-semibold text-[#474747]">
          Course Employees
        </Typography>
        {courseName && (
          <Typography className="text-[14px] text-gray-600">
            Course: {courseName}
          </Typography>
        )}
        {employees.length > 0 && (
          <Typography className="text-[12px] text-gray-500">
            Total Employees: {employees.length}
          </Typography>
        )}
      </div>

      {/* Employee List */}
      {employees.length > 0 ? (
        <div className="flex flex-col gap-2">
          {employees.map((employee, index) => (
            <div
              key={employee.employee_id || index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Typography className="text-[14px] font-medium text-[#474747]">
                {employee.employee_name || 'N/A'}
              </Typography>
              {employee.status && (
                <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                  employee.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                  employee.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                  employee.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {employee.status}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <Typography className="text-[16px] text-gray-500">
            No employees assigned to this course
          </Typography>
        </div>
      )}
    </div>
  )
}

export default CourseEmployeesList

