import React, { useState, useEffect } from 'react'
import { Card, CardBody, Typography, Button } from '@material-tailwind/react'
import { BiSearch } from 'react-icons/bi'
import { FaCheckCircle, FaClock, FaTimesCircle, FaUser, FaBook, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../../Store/store'
import AssessmentReview from './AssessmentReview'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import { showToast } from '../../Components/Toaster/Toaster'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { motion } from 'framer-motion'
import CourseCompletionSkeleton from './CourseCompletionSkeleton'

const CourseCompletion = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { training_data, getCourseAssignedEmployees, isLoadingCourseAssignedEmployees } = TrainingService()
  
  const openDrawer = useStore((state) => state.openDrawer)
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
  const settingComponent = useStore((state) => state.settingComponent)
  const settingDrawerSize = useStore((state) => state.settingDrawerSize)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedCourseName, setSelectedCourseName] = useState('')
  const [completionData, setCompletionData] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 })

  const courses = training_data?.courses || []

  // Transform courses to select options
  const courseOptions = courses.map(c => ({
    value: c._id,
    label: c.course_name
  }))

  useEffect(() => {
    if (location.state?.courseId) {
      setSelectedCourse({ value: location.state.courseId, label: location.state.courseName })
      setSelectedCourseName(location.state.courseName || '')
      fetchCompletionData(location.state.courseId, 1)
    }
  }, [location.state])

  useEffect(() => {
    if (selectedCourse && !location.state?.courseId) {
      fetchCompletionData(selectedCourse.value, 1)
    }
  }, [selectedCourse])

  const fetchCompletionData = async (courseId, page = 1) => {
    try {
      const result = await getCourseAssignedEmployees(courseId, page, 10)
      
      if (result.success) {
        const employees = result.data.employees || []
        const paginationData = result.data.pagination || { total: 0, page: 1, limit: 10, pages: 1 }
        
        const formattedData = employees.map((emp, index) => ({
          id: emp.employee_id || index,
          employeeName: emp.employee_name || 'N/A',
          employeeId: emp.employee_id?.toString() || 'N/A',
          courseName: emp.course_name || 'N/A',
          courseStatus: emp.course_status || 'pending',
          assessmentStatus: emp.assessment_status || 'not_assigned',
          completionDate: emp.completion_date ? new Date(emp.completion_date * 1000).toLocaleDateString() : null,
          score: emp.percentage || 0,
          totalScore: emp.total_score || 0,
          actualScore: emp.score || 0
        }))
        
        setCompletionData(formattedData)
        setPagination(paginationData)
      } else {
        showToast(result.error || 'Failed to fetch completion data', 'error')
        setCompletionData([])
      }
    } catch (error) {
      console.error('Error fetching completion data:', error)
      showToast('Failed to fetch completion data', 'error')
      setCompletionData([])
    }
  }

  const handlePageChange = (newPage) => {
    if (selectedCourse && newPage >= 1 && newPage <= pagination.pages) {
      fetchCompletionData(selectedCourse.value, newPage)
    }
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'not_started', label: 'Pending' }
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className='px-3 py-1 text-xs rounded-full font-medium bg-green-50 text-green-600 border border-green-100 flex items-center gap-1 justify-center w-fit mx-auto'>
            <FaCheckCircle className="text-[10px]" /> Completed
          </span>
        )
      case 'in_progress':
        return (
          <span className='px-3 py-1 text-xs rounded-full font-medium bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1 justify-center w-fit mx-auto'>
            <FaClock className="text-[10px]" /> In Progress
          </span>
        )
      case 'not_started':
      case 'assigned':
        return (
          <span className='px-3 py-1 text-xs rounded-full font-medium bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1 justify-center w-fit mx-auto'>
            <FaClock className="text-[10px]" /> Pending
          </span>
        )
      default:
        return (
          <span className='px-3 py-1 text-xs rounded-full font-medium bg-gray-50 text-gray-600 border border-gray-100 flex items-center gap-1 justify-center w-fit mx-auto'>
            Unknown
          </span>
        )
    }
  }

  const getAssessmentBadge = (status) => {
    switch (status) {
      case 'graded':
      case 'completed':
        return (
          <span className='text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md'>
            Graded
          </span>
        )
      case 'pending':
        return (
          <span className='text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md'>
            Pending
          </span>
        )
      case 'not_assigned':
        return (
          <span className='text-xs font-medium text-gray-400'>
            Not Assigned
          </span>
        )
      default:
        return (
          <span className='text-xs font-medium text-gray-400'>
            -
          </span>
        )
    }
  }

  const filteredData = completionData.filter(item => {
    const matchesSearch = item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    // Handle both "assigned" and "not_started" as the same status
    const matchesStatus = !filterStatus || !filterStatus.value || 
                         item.courseStatus === filterStatus.value || 
                         (filterStatus.value === 'not_started' && item.courseStatus === 'assigned')
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalAssigned: pagination.total || 0,
    completed: completionData.filter(item => item.courseStatus === 'completed').length,
    inProgress: completionData.filter(item => item.courseStatus === 'in_progress').length,
    notStarted: completionData.filter(item => item.courseStatus === 'pending' || item.courseStatus === 'assigned').length
  }

  const StatCard = ({ title, value, icon, color, bgClass, textClass }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-5 ${bgClass} border border-gray-100 shadow-sm`}
    >
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <Typography className={`text-sm font-medium ${textClass} opacity-80 mb-1`}>
            {title}
          </Typography>
          <Typography className={`text-2xl font-bold ${textClass}`}>
            {value}
          </Typography>
        </div>
        <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm ${textClass}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className='min-h-screen bg-gray-50/50 p-6 font-poppins'>
      <div className='max-w-7xl mx-auto space-y-6'>
        
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Course Completion</h1>
            <p className='text-sm text-gray-500 mt-1'>Track employee progress and assessment results</p>
          </div>
          <Button
            variant="outlined"
            className='flex items-center gap-2 border-gray-200 cursor-pointer text-gray-600 hover:bg-white hover:border-gray-300 normal-case'
            onClick={() => navigate('/trainingDash')}
          >
            Back to Training
          </Button>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatCard 
            title="Total Assigned" 
            value={stats.totalAssigned} 
            icon={<FaUser className="text-xl" />}
            bgClass="bg-blue-500"
            textClass="text-white"
          />
          <StatCard 
            title="Completed" 
            value={stats.completed} 
            icon={<FaCheckCircle className="text-xl" />}
            bgClass="bg-green-500"
            textClass="text-white"
          />
          <StatCard 
            title="In Progress" 
            value={stats.inProgress} 
            icon={<FaClock className="text-xl" />}
            bgClass="bg-orange-400"
            textClass="text-white"
          />
          <StatCard 
            title="Pending" 
            value={stats.notStarted} 
            icon={<FaTimesCircle className="text-xl" />}
            bgClass="bg-gray-500"
            textClass="text-white"
          />
        </div>

        {/* Filters and Controls */}
        <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4'>
          <div className='flex-1 w-full'>
            <div className='relative'>
              <BiSearch className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg z-10' />
              <input
                type='text'
                placeholder='Search employee...'
                className='w-full rounded-xl pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className='w-full md:w-64'>
            {/* Course Selector - Display Only if needed or allow switching */}
             {/* Note: Ideally this should be a dropdown to switch courses */}
             <div className="px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-sm font-medium text-blue-700 truncate">
                {selectedCourse ? selectedCourse.label : 'Select a course from Dashboard'}
             </div>
          </div>

          <div className='w-full md:w-48'>
            <CustomSelect
              placeHolderTitle="Filter Status"
              value={filterStatus}
              options={statusOptions}
              onChangeHandler={setFilterStatus}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
          <div className='overflow-x-auto customScroll min-h-[400px]'>
            <table className='w-full text-center'>
              <thead className='bg-gray-50/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10'>
                <tr>
                  {['Employee', 'ID', 'Course', 'Status', 'Assessment', 'Completion Date', 'Score', 'Actions'].map((head, i) => (
                    <th key={i} className='p-4 whitespace-nowrap'>
                      <Typography className='font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins'>
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!selectedCourse ? (
                  <tr>
                    <td colSpan='8' className='p-12 text-center'>
                      <div className='flex flex-col items-center justify-center gap-3'>
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                          <FaBook className="text-3xl text-gray-300" />
                        </div>
                        <Typography className="font-medium text-gray-600">No Course Selected</Typography>
                        <Typography className="text-xs text-gray-400">Please navigate from Training Dashboard</Typography>
                      </div>
                    </td>
                  </tr>
                ) : isLoadingCourseAssignedEmployees ? (
                  <CourseCompletionSkeleton />
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id} className='hover:bg-blue-50/30 transition-colors'>
                      <td className='p-4 text-sm font-medium text-gray-900'>{item.employeeName}</td>
                      <td className='p-4 text-sm text-gray-500'>{item.employeeId}</td>
                      <td className='p-4 text-sm text-gray-700'>{item.courseName}</td>
                      <td className='p-4'>{getStatusBadge(item.courseStatus)}</td>
                      <td className='p-4'>{getAssessmentBadge(item.assessmentStatus)}</td>
                      <td className='p-4 text-sm text-gray-600'>{item.completionDate || '-'}</td>
                      <td className='p-4'>
                        {item.score !== null ? (
                          <span className={`font-bold text-sm ${
                            item.score >= 70 ? 'text-green-600' : 
                            item.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {item.score}%
                          </span>
                        ) : <span className='text-gray-300'>-</span>}
                      </td>
                      <td className='p-4'>
                        {(item.assessmentStatus === 'completed' || item.assessmentStatus === 'graded') ? (
                          <Button
                            size='sm'
                            variant="text"
                            className='flex items-center gap-2 text-blue-600 hover:bg-blue-50 normal-case px-3 py-1.5'
                            onClick={() => {
                              openDrawer()
                              settingDrawerSize(620)
                              settingDrawerTitle(`Assessment Review - ${item.employeeName}`)
                              settingComponent(<AssessmentReview employeeData={item} courseId={selectedCourse.value} />)
                            }}
                          >
                            <FaEye /> View
                          </Button>
                        ) : (
                          <span className='text-gray-300 text-xs'>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='8' className='p-12 text-center text-gray-400'>
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                          <FaUser className="text-3xl text-gray-300" />
                        </div>
                        <Typography className="font-medium">No records found</Typography>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className='p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between'>
              <Typography variant='small' className='text-gray-500'>
                Page {pagination.page} of {pagination.pages} ({pagination.total} records)
              </Typography>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outlined'
                  className='flex items-center gap-2 border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoadingCourseAssignedEmployees}
                >
                  <FaChevronLeft className='text-[10px]' /> Previous
                </Button>
                <Button
                  size='sm'
                  variant='outlined'
                  className='flex items-center gap-2 border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || isLoadingCourseAssignedEmployees}
                >
                  Next <FaChevronRight className='text-[10px]' />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseCompletion
