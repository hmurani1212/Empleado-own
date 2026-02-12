import React, { useEffect, useState, useRef } from 'react'
import { Typography, Button, MenuItem } from '@material-tailwind/react'
import { BiSearch } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import TrainingService from "../../ViewModel/TraingingViewModel/TrainingService"
import { formatTimestamp } from "../Branches/utils"
import { FaCheckCircle, FaClock, FaTimesCircle, FaPlus, FaEdit, FaUserPlus, FaTrash, FaBook, FaChartLine } from 'react-icons/fa'
import { FaChevronDown, FaRobot, FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import CustomButton from '../../Components/CustomButton/CustomButton'
import AddCourse from './AddCourse'
import CreateQuestion from './CreateQuestion'
import EditCourse from './EditCourse'
import AssignCourse from './AssignCourse'
import CourseEmployeesList from './CourseEmployeesList'
import useStore from '../../Store/store'
import { motion, AnimatePresence } from 'framer-motion'
import { showToast } from '../../Components/Toaster/Toaster'
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import TrainingSkeleton from './TrainingSkeleton'

const TrainingDash = () => {
  const { training_data, Training_datefn, delete_course_fn, getCourseCompleteDetails, isLoadingTrainingData } = TrainingService()
  const navigate = useNavigate()

  // Store original unfiltered courses for client-side filtering
  const [originalCourses, setOriginalCourses] = useState([])

  // Drawer functions from store
  const openDrawer = useStore((state) => state.openDrawer)
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
  const settingComponent = useStore((state) => state.settingComponent)
  const settingDrawerSize = useStore((state) => state.settingDrawerSize)
  const closeDrawer = useStore((state) => state.closeDrawer)
  // const delete_course_fn = useStore((state) => state.delete_course_fn)
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  // const [assetToDelete, setAssetToDelete] = useState(null);

  const [searchCourse, setSearchCourse] = useState('')
  const [courseStatus, setCourseStatus] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [openMenu, setOpenMenu] = useState({})
  const triggerRefs = useRef([])

  const [deleteCourseId, setDeleteCourseId] = useState(null);

  // console.log('Training data:', delete_course_fn)

  const delete_course = (id) => {
    setDeleteCourseId(id);
    setOpenDeleteConfirmDialog(true);
  }


  const handleConfirmDelete = async () => {
    await delete_course_fn(deleteCourseId);
    Training_datefn()
    setOpenDeleteConfirmDialog(false);
  }
  // Table headers
  const tableHeaders = ['Course Name', 'Created By', 'Assign course', 'Created Date', 'Actions']

  // Course action list with icons
  const courseActionList = [
    { id: 1, title: 'Edit', icon: <FaEdit />, color: '#0ACF97' },
    { id: 2, title: 'Assign course', icon: <FaUserPlus />, color: '#3DA5F4' },
    { id: 3, title: 'Create question using AI', icon: <FaRobot />, color: '#8bc9f8' },
    { id: 4, title: 'Questions Bank', icon: <FaBook />, color: '#52b69a' },
    { id: 5, title: 'Track Completion', icon: <FaChartLine />, color: '#414833' },
    { id: 6, title: 'Delete', icon: <FaTrash />, color: '#f44336' }
  ]

  // Handle course action menu items
  const handleCourseAction = async (course, actionItem) => {
    const actionId = actionItem.id

    switch (actionId) {
      case 1: // Edit
        try {
          const courseDetails = await getCourseCompleteDetails(course._id)
          if (courseDetails && courseDetails.total_questions > 0) {
            showToast('Cannot edit course that have questions', 'error')
            return
          }
          openDrawer()
          settingDrawerSize(930)
          settingDrawerTitle('Edit Course')
          settingComponent(<EditCourse courseId={course._id} closeDrawer={closeDrawer} />)
        } catch (error) {
          console.error('Error checking course details:', error)
          showToast('Failed to check course details', 'error')
        }
        break
      case 2: // Assign course
        openDrawer()
        settingDrawerSize(558)
        settingDrawerTitle('Assign Course')
        settingComponent(<AssignCourse courseId={course._id} courseName={course.course_name} closeDrawer={closeDrawer} />)
        break
      case 3: // Create question using AI
        try {
          const courseDetails = await getCourseCompleteDetails(course._id)
          if (courseDetails && courseDetails.total_questions > 0) {
            showToast('Cannot create questions. Course already has questions.', 'error')
            return
          }
          openDrawer()
          settingDrawerSize(900)
          settingDrawerTitle('Create Question using AI')
          settingComponent(<CreateQuestion courseId={course._id} courseName={course.course_name} closeDrawer={closeDrawer} />)
        } catch (error) {
          console.error('Error checking course details:', error)
          showToast('Failed to check course details', 'error')
        }
        break
      case 4: // Questions_bank
        navigate('/questionBank', {
          state: {
            courseId: course._id,
            courseName: course.course_name
          }
        })
        break
      case 5: // Track Completion
        navigate('/courseCompletion', {
          state: {
            courseId: course._id,
            courseName: course.course_name
          }
        })
        break
      case 6: // Delete
        delete_course(course._id)
        break
      default:
        break
    }
  }

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchCourse)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchCourse])

  // Store original courses when data is first loaded or when data is refreshed without search
  useEffect(() => {
    if (training_data?.courses && training_data.courses.length >= 0) {
      if (!searchCourse.trim() && !debouncedTerm) {
        setOriginalCourses(training_data.courses)
      } else if (originalCourses.length === 0) {
        setOriginalCourses(training_data.courses)
      }
    }
  }, [training_data?.courses, searchCourse, debouncedTerm])

  // Initial data load
  useEffect(() => {
    Training_datefn({
      status: '',
      text: '',
      page: 1,
      limit: 20
    })
    setCurrentPage(1)
    setIsInitialLoad(false)
  }, [])

  // Status change effect
  useEffect(() => {
    if (isInitialLoad) return

    Training_datefn({
      status: courseStatus,
      text: '',
      page: 1,
      limit: 20
    })
    setCurrentPage(1)
  }, [courseStatus])

  // Handle load more functionality
  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    Training_datefn({
      status: courseStatus,
      text: debouncedTerm,
      page: nextPage,
      limit: 20
    })
    setCurrentPage(nextPage)
  }

  const courseStatusOptions = [
    { value: '', label: 'All Status' },
    { value: '0', label: 'Pending Approval' },
    { value: '1', label: 'Published' },
    { value: '2', label: 'Not Approved' }
  ]

  const handleStatusChange = (val) => {
    setCourseStatus(val)
  }

  const handleSearchChange = (e) => {
    setSearchCourse(e.target.value)
  }

  // Map status values to display text and colors
  const getStatusInfo = (status) => {
    switch (status) {
      case 0:
        return {
          text: 'Pending Approval',
          color: 'bg-blue-50 text-blue-600 border border-blue-100',
          icon: <FaClock className="text-[10px]" />
        }
      case 1:
        return {
          text: 'Published',
          color: 'bg-green-50 text-green-600 border border-green-100',
          icon: <FaCheckCircle className="text-[10px]" />
        }
      case 2:
        return {
          text: 'Not Approved',
          color: 'bg-red-50 text-red-600 border border-red-100',
          icon: <FaTimesCircle className="text-[10px]" />
        }
      default:
        return {
          text: 'Unknown',
          color: 'bg-gray-50 text-gray-600 border border-gray-100',
          icon: null
        }
    }
  }

  const shouldShowLoadMore = training_data?.pagination &&
    training_data.pagination.page < training_data.pagination.pages

  const allCourses = originalCourses.length > 0 ? originalCourses : (training_data?.courses || [])

  const coursesData = searchCourse.trim()
    ? allCourses.filter(course => {
      const searchLower = searchCourse.toLowerCase().trim()
      const courseName = course.course_name?.toLowerCase() || ''
      const createdBy = course.created_by?.toLowerCase() || ''
      return courseName.includes(searchLower) || createdBy.includes(searchLower)
    })
    : allCourses

  const handleAddCourse = () => {
    openDrawer()
    settingDrawerSize(930)
    settingDrawerTitle('Add New Course')
    settingComponent(<AddCourse closeDrawer={closeDrawer} />)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (Object.values(openMenu).some(Boolean)) {
        const clickedInside = triggerRefs.current.some(ref =>
          ref && ref.contains(event.target)
        )
        if (!clickedInside) {
          setOpenMenu({})
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenu])

  const toggleMenu = (index, isOpen) => {
    setOpenMenu((prevOpenMenus) => ({
      ...prevOpenMenus,
      [index]: isOpen,
    }));
  };

  return (
    <div className='min-h-screen  p-6 font-poppins'>
        <div className=' mx-auto space-y-6'>
            
            {/* Header Section */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Training & Courses</h1>
                    <p className='text-sm text-gray-500 mt-1'>Manage your training programs and employee development</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                            placeholder="Search courses..."
                            value={searchCourse}
                            onChange={handleSearchChange}
                        />
                        <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    </div>
                    <CustomButton
                        title='Add Course'
                        icon={<FaPlus className="text-sm" />}
                        onClick={handleAddCourse}
                    />
                </div>
            </div>

            {/* Content Card */}
            {isLoadingTrainingData ? (
                <TrainingSkeleton />
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto customScroll min-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                                <tr>
                                    {tableHeaders.map((head, i) => (
                                        <th key={i} className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                                            <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                                                {head}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {coursesData.length > 0 ? (
                                    coursesData.map((course, index) => {
                                        const statusInfo = getStatusInfo(course.status)
                                        
                                        return (
                                            <tr 
                                                key={course._id || index} 
                                                className="hover:bg-blue-50/30 transition-colors group"
                                            >
                                                <td className="p-4 first:pl-6">
                                                    <Typography className="text-sm font-semibold text-gray-900 font-poppins">
                                                        {course.course_name || 'N/A'}
                                                    </Typography>
                                                </td>

                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                                                            {course.created_by ? course.created_by.charAt(0).toUpperCase() : 'N'}
                                                        </div>
                                                        <Typography className="text-sm text-gray-700 font-medium font-poppins">
                                                            {course.created_by || 'N/A'}
                                                        </Typography>
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            openDrawer()
                                                            settingDrawerSize(500)
                                                            settingDrawerTitle('Course Employees')
                                                            settingComponent(
                                                                <CourseEmployeesList
                                                                    courseId={course._id}
                                                                    courseName={course.course_name}
                                                                />
                                                            )
                                                        }}
                                                        className="text-bgBlue hover:text-blue-700 text-sm font-medium transition-colors hover:underline"
                                                    >
                                                        View Assigned
                                                    </button>
                                                </td>

                                                <td className="p-4">
                                                    <Typography className="text-sm text-gray-600 font-poppins">
                                                        {course.createdAt ? formatTimestamp(course.createdAt) : 'N/A'}
                                                    </Typography>
                                                </td>

                                                <td className="p-4 last:pr-6 relative">
                                                    <div
                                                        ref={(el) => (triggerRefs.current[index] = el)}
                                                        className="relative"
                                                    >
                                                        <Button
                                                            variant="text"
                                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all shadow-sm normal-case text-gray-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                toggleMenu(index, !openMenu[index])
                                                            }}
                                                        >
                                                            Action <FaChevronDown className={`text-[10px] transition-transform duration-200 ${openMenu[index] ? 'rotate-180' : ''}`} />
                                                        </Button>
                                                        
                                                        <AnimatePresence>
                                                            {openMenu[index] && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className={`absolute right-0 z-50 w-48 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden ${index > coursesData.length - 3 ? 'bottom-full mb-2' : 'top-full'}`}
                                                                >
                                                                    <div className="p-1">
                                                                        {courseActionList.map((menuItem) => (
                                                                            <MenuItem
                                                                                key={menuItem.id}
                                                                                className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleCourseAction(course, menuItem)
                                                                                    toggleMenu(index, false)
                                                                                }}
                                                                            >
                                                                                <span className="p-1.5 rounded-md bg-gray-50 text-gray-500 group-hover:text-gray-700 transition-colors" style={{ color: menuItem.color, backgroundColor: `${menuItem.color}15` }}>
                                                                                    {menuItem.icon}
                                                                                </span>
                                                                                {menuItem.title}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={tableHeaders.length} className="p-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <FaBook className="text-3xl text-gray-300" />
                                                </div>
                                                <Typography className="font-medium font-poppins">No courses found</Typography>
                                                <Typography className="text-xs text-gray-400 max-w-[200px]">
                                                    Try adjusting your search or add a new course to get started
                                                </Typography>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination / Load More */}
                    {shouldShowLoadMore && (
                        <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
                            <Button
                                variant="outlined"
                                className="flex items-center gap-2 border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 normal-case"
                                onClick={handleLoadMore}
                            >
                                Load More Courses
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <ConfirmationDialog
                openDialog={openDeleteConfirmDialog}
                handleOpen={() => {
                    setOpenDeleteConfirmDialog(false);
                }}
                title="Delete Course"
                message="Are you sure you want to delete this course? This action cannot be undone."
                handleConfirm={handleConfirmDelete}
            />
        </div>
    </div>
  )
}

export default TrainingDash
