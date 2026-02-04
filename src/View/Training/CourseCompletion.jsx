import React, { useState, useEffect } from 'react'
import { Card, CardBody, Typography, Select, Option, Chip, Button } from '@material-tailwind/react'
import { BiSearch } from 'react-icons/bi'
import { FaCheckCircle, FaClock, FaTimesCircle, FaUser, FaBook, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../../Store/store'
import AssessmentReview from './AssessmentReview'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import { showToast } from '../../Components/Toaster/Toaster'

const CourseCompletion = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { training_data, getCourseAssignedEmployees, isLoadingCourseAssignedEmployees } = TrainingService()
  
  const openDrawer = useStore((state) => state.openDrawer)
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
  const settingComponent = useStore((state) => state.settingComponent)
  const settingDrawerSize = useStore((state) => state.settingDrawerSize)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedCourseName, setSelectedCourseName] = useState('')
  const [completionData, setCompletionData] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 })
  const [loading, setLoading] = useState(false)

  const courses = training_data?.courses || []

  useEffect(() => {
    if (location.state?.courseId) {
      setSelectedCourse(location.state.courseId)
      setSelectedCourseName(location.state.courseName || '')
      fetchCompletionData(location.state.courseId, 1)
    }
  }, [location.state])

  useEffect(() => {
    if (selectedCourse && !location.state?.courseId) {
      fetchCompletionData(selectedCourse, 1)
    }
  }, [selectedCourse])

  const fetchCompletionData = async (courseId, page = 1) => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (selectedCourse && newPage >= 1 && newPage <= pagination.pages) {
      fetchCompletionData(selectedCourse, newPage)
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
          <div className='flex justify-center'>
            <span className='px-4 py-1 text-xs rounded-[7px] w-[110px] font-medium inline-flex items-center justify-center bg-[#DBFFF5] text-[#0ACF97]'>
              Completed
            </span>
          </div>
        )
      case 'in_progress':
        return (
          <div className='flex justify-center'>
            <span className='px-4 py-1 text-xs rounded-[7px] w-[110px] font-medium inline-flex items-center justify-center bg-[#E3F1FF] text-[#3DA5F4]'>
              In Progress
            </span>
          </div>
        )
      case 'not_started':
      case 'assigned':
        return (
          <div className='flex justify-center'>
            <span className='px-4 py-1 text-xs rounded-[7px] w-[110px] font-medium inline-flex items-center justify-center bg-[#FFF1D9] text-[#FDA006]'>
              Pending
            </span>
          </div>
        )
      default:
        return (
          <div className='flex justify-center'>
            <span className='px-4 py-1 text-xs rounded-[7px] w-[110px] font-medium inline-flex items-center justify-center bg-gray-100 text-gray-600'>
              Unknown
            </span>
          </div>
        )
    }
  }

  const getAssessmentBadge = (status) => {
    switch (status) {
      case 'graded':
      case 'completed':
        return (
          <div className='flex justify-center'>
            <span className='text-xs font-medium inline-flex items-center justify-center text-[#474747]'>
              Graded
            </span>
          </div>
        )
      case 'pending':
        return (
          <div className='flex justify-center'>
            <span className='text-xs font-medium inline-flex items-center justify-center text-[#474747]'>
              Pending
            </span>
          </div>
        )
      case 'not_assigned':
        return (
          <div className='flex justify-center'>
            <span className='text-xs font-medium inline-flex items-center justify-center text-[#474747]'>
              Not Assigned
            </span>
          </div>
        )
      default:
        return (
          <div className='flex justify-center'>
            <span className='text-xs font-medium inline-flex items-center justify-center text-[#474747]'>
              Unknown
            </span>
          </div>
        )
    }
  }

  const filteredData = completionData.filter(item => {
    const matchesSearch = item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    // Handle both "assigned" and "not_started" as the same status
    const matchesStatus = !filterStatus || 
                         item.courseStatus === filterStatus || 
                         (filterStatus === 'not_started' && item.courseStatus === 'assigned')
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalAssigned: pagination.total || 0,
    completed: completionData.filter(item => item.courseStatus === 'completed').length,
    inProgress: completionData.filter(item => item.courseStatus === 'in_progress').length,
    notStarted: completionData.filter(item => item.courseStatus === 'pending' || item.courseStatus === 'assigned').length
  }

  return (
    <>
      <style>
        {`
          /* Custom styling for Select components */
          .custom-select-course select {
            box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1) !important;
            border: none !important;
            border-radius: 10px !important;
          }
          .custom-select-course select:hover {
            box-shadow: 0px 0px 12px 0px rgba(61, 165, 244, 0.3) !important;
          }
        `}
      </style>
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <Typography variant='h4' className='text-gray-800 font-bold'>
              Course Completion Tracking
            </Typography>
            {/* <Typography variant='small' className='text-gray-600 mt-1'>
              {selectedCourseName ? `Tracking: ${selectedCourseName}` : 'Track employee course and assessment completion status'}
            </Typography> */}
          </div>
          <Button
            className='flex items-center gap-2 bg-blue-400 hover:bg-blue-400 normal-case'
            onClick={() => navigate('/trainingDash')}
          >
            Back to Training
          </Button>
        </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-2 lg:gap-3 mb-6'>
        {/* Total Assigned Card - Blue */}
        <Card className="bg-[#3DA5F4] text-white drop-shadow-sm p-4 h-[100px] rounded-[15px]">
          <CardBody className="flex items-center h-full p-0 space-x-4">
            <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white aspect-square">
              <FaUser className="w-[25px] h-[25px] text-[#3DA5F4]" />
            </div>
            <div className="flex flex-col text-white leading-tight">
              <span className="text-[14px] font-normal font-Poppins">
                Total Assigned
              </span>
              <span className="text-[20px] font-semibold font-Poppins">
                {stats.totalAssigned}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Completed Card - Green */}
        <Card className="bg-[#0ACF97] text-white drop-shadow-sm p-4 h-[100px] rounded-[15px]">
          <CardBody className="flex items-center h-full p-0 space-x-4">
            <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white aspect-square">
              <FaCheckCircle className="w-[25px] h-[25px] text-[#0ACF97]" />
            </div>
            <div className="flex flex-col text-white leading-tight">
              <span className="text-[14px] font-normal font-Poppins">
                Completed
              </span>
              <span className="text-[20px] font-semibold font-Poppins">
                {stats.completed}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* In Progress Card - Yellow */}
        <Card className="bg-[#FDA006] text-white drop-shadow-sm p-4 h-[100px] rounded-[15px]">
          <CardBody className="flex items-center h-full p-0 space-x-4">
            <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white aspect-square">
              <FaClock className="w-[25px] h-[25px] text-[#FDA006]" />
            </div>
            <div className="flex flex-col text-white leading-tight">
              <span className="text-[14px] font-normal font-Poppins">
                In Progress
              </span>
              <span className="text-[20px] font-semibold font-Poppins">
                {stats.inProgress}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Not Started Card - Gray */}
        <Card className="bg-[#8E8E8E] text-white drop-shadow-sm p-4 h-[100px] rounded-[15px]">
          <CardBody className="flex items-center h-full p-0 space-x-4">
            <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white aspect-square">
              <FaTimesCircle className="w-[25px] h-[25px] text-[#8E8E8E]" />
            </div>
            <div className="flex flex-col text-white leading-tight">
              <span className="text-[14px] font-normal font-Poppins">
                Pending
              </span>
              <span className="text-[20px] font-semibold font-Poppins">
                {stats.notStarted}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filter Section */}
      <div className='flex flex-wrap items-center gap-3 mb-4'>
        <div className='flex-1 min-w-[200px]'>
          <div className='relative'>
            <BiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl z-10' />
            <input
              type='text'
              placeholder='Search by employee name or ID...'
              className='w-full rounded-[10px] px-3 pl-10 pr-4 text-sm h-[37px] outline-none border-none text-[12px] text-[#474747] bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className='w-full sm:w-auto min-w-[200px]'>
          <div className='bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] border-none rounded-[10px] px-3 h-[37px] flex items-center'>
            <Typography className='text-[14px] text-[#474747] font-medium'>
              {selectedCourse ? courses.find(c => c._id === selectedCourse)?.course_name || 'No Course Selected' : 'No Course Selected'}
            </Typography>
          </div>
        </div>

        <div className='w-full sm:w-auto min-w-[180px] '>
          <Select
            // label='Filter by Status'
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            className='bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] border-none rounded-[10px]'
            containerProps={{
              className: 'min-h-[37px]'
            }}
            labelProps={{
              className: 'text-[#474747] text-[14px]'
            }}
            menuProps={{
              className: 'shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] border-none rounded-[10px]'
            }}
          >
            {statusOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table Card */}
      <Card className='bg-white rounded-[10px] drop-shadow-md'>
        <CardBody className='p-2'>

          {!selectedCourse ? (
            <div className='text-center py-12'>
              <FaBook className='text-gray-400 text-5xl mx-auto mb-4' />
              <Typography variant='h6' className='text-gray-600 mb-2'>
                No Course Selected
              </Typography>
              <Typography variant='small' className='text-gray-500'>
                Please select a course from the dropdown to view completion data
              </Typography>
            </div>
          ) : loading || isLoadingCourseAssignedEmployees ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <Typography variant='small' className='text-gray-600 mt-4'>
                Loading completion data...
              </Typography>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto customScroll'>
                <table className='w-full text-center'>
                  <thead className='sticky top-0 z-20 bg-[#F8F9FA] rounded-[8px]'>
                    <tr>
                      <th className='bg-[#F8F9FA] p-4'>
                        <Typography className='font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist'>
                          Employee
                        </Typography>
                      </th>
                      <th className='bg-[#F8F9FA] p-4'>
                        <Typography className='font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist'>
                          Employee ID
                        </Typography>
                      </th>
                      <th className='bg-[#F8F9FA] p-4'>
                        <Typography className='font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist'>
                          Course Name
                        </Typography>
                      </th>
                      <th className='bg-[#F8F9FA] p-4'>
                        <Typography className='font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist'>
                          Course Status
                        </Typography>
                      </th>
                      <th className='bg-[#F8F9FA] p-4'>
                        <Typography className='font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist'>
                          Assessment Status
                        </Typography>
                      </th>
                      <th className='bg-[#F8F9FA] p-4'>
                        <Typography className='font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist'>
                          Completion Date
                        </Typography>
                      </th>
                      <th className='bg-[#F8F9FA] p-4'>
                        <Typography className='font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist'>
                          Score
                        </Typography>
                      </th>
                      <th className='bg-[#F8F9FA] p-4'>
                        <Typography className='font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist'>
                          Actions
                        </Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => {
                        const isLast = index === filteredData.length - 1
                        const classes = isLast ? "p-4 text-center" : "p-4 border-b border-[#F2F2F9] text-center"
                        
                        return (
                          <tr key={item.id} className='hover:bg-gray-50'>
                            <td className={classes}>
                              <div className='flex items-center gap-2 justify-center'>
                                {/* <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                                  <FaUser className='text-blue-600 text-sm' />
                                </div> */}
                                <Typography className='text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal'>
                                  {item.employeeName}
                                </Typography>
                              </div>
                            </td>
                            <td className={classes}>
                              <Typography className='text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal'>
                                {item.employeeId}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <div className='flex items-center gap-2 justify-center'>
                                {/* <FaBook className='text-gray-400 text-sm' /> */}
                                <Typography className='text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal'>
                                  {item.courseName}
                                </Typography>
                              </div>
                            </td>
                            <td className={classes}>{getStatusBadge(item.courseStatus)}</td>
                            <td className={classes}>{getAssessmentBadge(item.assessmentStatus)}</td>
                            <td className={classes}>
                              <Typography className='text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal'>
                                {item.completionDate || '-'}
                              </Typography>
                            </td>
                            <td className={classes}>
                              {item.score !== null ? (
                                <span className={`font-semibold ${
                                  item.score >= 70 ? 'text-green-600' : 
                                  item.score >= 50 ? 'text-yellow-600' : 
                                  'text-red-600'
                                }`}>
                                  {item.score}%
                                </span>
                              ) : (
                                <span className='text-gray-400'>-</span>
                              )}
                            </td>
                            <td className={classes}>
                              {(item.assessmentStatus === 'completed' || item.assessmentStatus === 'graded') ? (
                                <Button
                                  size='sm'
                                  className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 normal-case text-xs px-3 py-2'
                                  onClick={() => {
                                    openDrawer()
                                    settingDrawerSize(1120)
                                    settingDrawerTitle(`Assessment Review - ${item.employeeName}`)
                                    settingComponent(<AssessmentReview employeeData={item} courseId={selectedCourse} />)
                                  }}
                                >
                                  <FaEye className='text-xs' />
                                  View Assessment
                                </Button>
                              ) : (
                                <span className='text-gray-400 text-xs'>-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan='8' className='p-4'>
                          <div className='flex flex-col items-center justify-center gap-2 text-center py-8'>
                            <span className='text-[#292929] font-medium text-[16px]'>
                              No completion records found
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className='flex items-center justify-between mt-6 pt-4 border-t border-gray-200'>
                  <Typography variant='small' className='text-gray-600'>
                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total employees)
                  </Typography>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outlined'
                      className='flex items-center gap-2'
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <FaChevronLeft className='text-xs' />
                      Previous
                    </Button>
                    <Button
                      size='sm'
                      variant='outlined'
                      className='flex items-center gap-2'
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                      <FaChevronRight className='text-xs' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
      </div>
    </>
  )
}

export default CourseCompletion
