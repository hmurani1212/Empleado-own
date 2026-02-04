import React, { useEffect, useState, useRef } from 'react'
import { Typography, Button, Option, Select, MenuItem } from '@material-tailwind/react'
import { BiSearch } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import TrainingService from "../../ViewModel/TraingingViewModel/TrainingService"
import { formatTimestamp } from "../Branches/utils"
import { FaCheckCircle, FaClock, FaTimesCircle, FaPlus, FaEdit, FaUserPlus, FaTrash, FaBook, FaChartLine } from 'react-icons/fa'
import { FaChevronDown, FaRobot } from 'react-icons/fa6'
import CustomButton from '../../Components/CustomButton/CustomButton'
import AddCourse from './AddCourse'
import CreateQuestion from './CreateQuestion'
import EditCourse from './EditCourse'
import AssignCourse from './AssignCourse'
import CourseEmployeesList from './CourseEmployeesList'
import useStore from '../../Store/store'
import { motion } from 'framer-motion'
import { showToast } from '../../Components/Toaster/Toaster'
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
// const trainingService = TrainingService();
// import CustomButton from '../../Components/CustomButton/CustomButton';

const TrainingDash = () => {
  const { training_data, Training_datefn, delete_course_fn, getCourseCompleteDetails, } = TrainingService()
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
    // console.log('Delete course id:', id);
    // console.log('Open delete dialog', deleteCourseId);
    setOpenDeleteConfirmDialog(true);
    // showToast('Delete course functionality to be implemented', 'info')
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
    { id: 4, title: 'Questions_bank', icon: <FaBook />, color: '#52b69a' },
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
      // Always update originalCourses when we have data and we're not searching
      // This ensures we have the latest data for client-side filtering
      if (!searchCourse.trim() && !debouncedTerm) {
        setOriginalCourses(training_data.courses)
      } else if (originalCourses.length === 0) {
        // If we don't have original courses yet, store them even if searching
        setOriginalCourses(training_data.courses)
      }
    }
  }, [training_data?.courses, searchCourse, debouncedTerm])

  // Initial data load - load all courses without filters
  useEffect(() => {
    Training_datefn({
      status: '',
      text: '',
      page: 1,
      limit: 20 // Load more to have enough data for client-side filtering
    })
    setCurrentPage(1)
    setIsInitialLoad(false)
  }, [])

  // Only call API for status changes, not for search (we use client-side filtering for search)
  useEffect(() => {
    if (isInitialLoad) {
      return
    }

    // Don't call API when searching - use client-side filtering instead
    // Only call API for status filter changes
    Training_datefn({
      status: courseStatus,
      text: '', // Always load all data, then filter client-side
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

  // Course status options
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
          color: 'bg-blue-100 text-blue-800',
          icon: <FaClock className="text-[12px]" />
        }
      case 1:
        return {
          text: 'Published',
          color: 'bg-green-100 text-green-800',
          icon: <FaCheckCircle className="text-[12px]" />
        }
      case 2:
        return {
          text: 'Not Approved',
          color: 'bg-red-100 text-red-800',
          icon: <FaTimesCircle className="text-[12px]" />
        }
      default:
        return {
          text: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          icon: null
        }
    }
  }

  // Check if load more button should be shown
  const shouldShowLoadMore = training_data?.pagination &&
    training_data.pagination.page < training_data.pagination.pages

  // Get courses - prefer originalCourses if available, otherwise use current training_data
  const allCourses = originalCourses.length > 0 ? originalCourses : (training_data?.courses || [])

  // Apply client-side filtering based on search term for immediate feedback
  const coursesData = searchCourse.trim()
    ? allCourses.filter(course => {
      const searchLower = searchCourse.toLowerCase().trim()
      const courseName = course.course_name?.toLowerCase() || ''
      const createdBy = course.created_by?.toLowerCase() || ''
      return courseName.includes(searchLower) || createdBy.includes(searchLower)
    })
    : allCourses

  // Handle Add Course button click
  const handleAddCourse = () => {
    openDrawer()
    settingDrawerSize(930) // Increased by 50% from 620 to 930
    settingDrawerTitle('Add New Course')
    settingComponent(<AddCourse closeDrawer={closeDrawer} />)
  }

  // Close all menus when clicking outside
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

  // Menu toggle functions
  const toggleMenu = (index, isOpen) => {
    setOpenMenu((prevOpenMenus) => ({
      ...prevOpenMenus,
      [index]: isOpen,
    }));
  };

  const getDropdownPosition = (index) => {
    const triggerElement = triggerRefs.current[index];
    if (triggerElement) {
      const triggerRect = triggerElement.getBoundingClientRect();
      const dropdownHeight = 200;
      return window.innerHeight - triggerRect.bottom < dropdownHeight ? 'top' : 'bottom';
    }
    return 'bottom';
  };

  return (
    <div className='pl-2 flex flex-col gap-3'>
      {/* Module Title */}
      <div className="mb-6">
        <span className='text-[20px]  font-semibold text-[#474747]'>Training and Courses</span>
      </div>
      <label className="text-[#474747] text-[12px] font-medium px-2"> Search course </label>
      {/* Header with Search and Add Course Button */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {/* Search Input */}

          <div>
            <div className="relative w-full min-w-[200px] h-9">
              <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
                <span>
                  <BiSearch />
                </span>
              </div>
              <input
                className="w-full rounded-[10px] px-3 pr-10 text-sm h-[37px] outline-none border-none text-[12px] text-[#474747] bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                placeholder="Search Course "
                value={searchCourse}
                onChange={handleSearchChange}
              />
              {/* <label className="flex w-full h-full select-none pointer-events-none absolute left-0 !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                Search by name
              </label> */}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <span>
            <CustomButton
              className="bg-[#8bc9f8]"
              title='Add Course'
              // icon={<FaPlus className="text-[14px]" />}
              onClick={handleAddCourse}
            />
          </span>
        </div>
      </div>

      {/* Courses Table */}
      <div className="overflow-x-scroll sideMenu customScroll bg-white rounded-[10px] drop-shadow-md p-2">
        <table className="w-full min-w-max text-center h-full">
          <thead className="sticky top-[-9px] z-20 bg-[#F8F9FA] rounded-[8px]">
            <tr>
              {tableHeaders.map((head, i) => (
                <th key={i} className="bg-[#F8F9FA] p-4">
                  <Typography
                    className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coursesData.length > 0 ? (
              coursesData.map((course, index) => {
                const isLast = index === coursesData.length - 1
                const classes = isLast ? "p-4" : "p-4 border-b border-[#F2F2F9]"
                const statusInfo = getStatusInfo(course.status)

                return (
                  <tr key={course._id || index} style={{ position: 'relative', zIndex: openMenu[index] ? 1000 : 1 }}>
                    {/* Course Name */}
                    <td className={classes}>
                      <Typography
                        className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {course.course_name || 'N/A'}
                      </Typography>
                    </td>

                    {/* Status */}
                    {/* <td className={`${classes} text-center`}>
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${statusInfo.color}`}>
                              {statusInfo.icon}
                              {statusInfo.text}
                            </span>
                          </div>
                        </td> */}

                    {/* Created By */}
                    <td className={classes}>
                      <Typography
                        className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {course.created_by || 'N/A'}
                      </Typography>
                    </td>

                    {/* Assign course - View Button */}
                    <td className={classes}>
                      <div className="flex items-center justify-center">
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
                          className="text-[#3DA5F4] font-medium text-[clamp(12px,0.9vw,14px)] hover:underline transition-all"
                          title="View Employees"
                        >
                          View
                        </button>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className={classes}>
                      <Typography
                        className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {course.createdAt ? formatTimestamp(course.createdAt) : 'N/A'}
                      </Typography>
                    </td>

                    {/* Learners Enrolled */}
                    {/* <td className={`${classes} text-center`}>
                          <div className="flex justify-center">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {course.employeeCount || 0}
                            </Typography>
                          </div>
                        </td> */}

                    {/* Actions */}
                    <td className={classes}>
                      <div
                        ref={(el) => (triggerRefs.current[index] = el)}
                        onMouseEnter={() => toggleMenu(index, true)}
                        onMouseLeave={() => toggleMenu(index, false)}
                        className="relative flex justify-center"
                      >
                        <Button
                          className="flex items-center gap-2 capitalize font-medium bg-[#EFF8FF] rounded-[8px] text-[clamp(10px,0.8vw,13px)] border border-[#3DA5F4] text-[#3DA5F4] px-[10px] py-[5px]"
                        >
                          Action
                          <FaChevronDown
                            strokeWidth={2.5}
                            className={`transition-transform transform ${openMenu[index] ? "rotate-180" : ""
                              }`}
                          />
                        </Button>
                        {openMenu[index] && (
                          <div
                            className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white w-[200px] left-[-100px] shadow-lg mt-0 ${index <= 5 ? "top-full" : "bottom-full"
                              }`}
                          >
                            <motion.div
                              initial={{
                                opacity: 0,
                                y: index <= 5 ? 50 : -50,
                              }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{
                                opacity: 0,
                                y: index <= 5 ? 50 : -50,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <ul className="flex w-full flex-col">
                                {courseActionList.map((menuItem) => (
                                  <MenuItem
                                    className="flex items-center justify-between"
                                    key={menuItem.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCourseAction(course, menuItem)
                                      toggleMenu(index, false)
                                    }}
                                  >
                                    <Typography
                                      variant="small"
                                      style={{ fontSize: "10px" }}
                                    >
                                      {menuItem.title}
                                    </Typography>
                                    <span style={{ color: menuItem.color }}>
                                      {menuItem.icon}
                                    </span>
                                  </MenuItem>
                                ))}
                              </ul>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    </td>

                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="p-4">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <span className="text-[#292929] font-medium text-[16px]">
                      No record found
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {/* Load More Button */}
            {shouldShowLoadMore && (
              <tr>
                <td colSpan={tableHeaders.length} className="p-4">
                  <div className="w-full flex justify-center">
                    <CustomButton
                      title="Load More"
                      onClick={handleLoadMore}
                    // loading={isLoadingMore}
                    />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationDialog
        openDialog={openDeleteConfirmDialog}
        handleOpen={() => {
          setOpenDeleteConfirmDialog(false);
          // setAssetToDelete(null);
        }}
        title="Delete Asset"
        message="Are you sure you want to delete this course?"
        handleConfirm={handleConfirmDelete}
      // loading={isUpdating}
      />
    </div>
  )
}

export default TrainingDash
