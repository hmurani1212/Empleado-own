import React, { useEffect, useState } from 'react'
import { Card, CardBody, Typography, Button, Tabs, TabsHeader, TabsBody, Tab, TabPanel } from '@material-tailwind/react'
import { FaBook, FaFileAlt, FaDownload, FaExternalLinkAlt, FaFilePdf, FaFileVideo, FaFileImage, FaFile, FaArrowLeft, FaPlayCircle, FaCheckCircle } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import useEmpTrainingService from '../../../ViewModel/EmpViewModel/EmpTrainingViewModel/EmpTrainingServices'
import { showToast } from '../../../Components/Toaster/Toaster'
import CustomDialog from '../../../Components/CustomDialog/CustomDialog'
import EditorData from '../../../View/NotesPool/EditorData'
import { motion } from 'framer-motion'

const CourseDetailPage = () => {
  const navigate = useNavigate()
  const { courseIndex } = useParams()
  const { employeeTrainingCourses, getEmployeeTrainingCourses, loading, completeCourse, getAssignedQuestions } = useEmpTrainingService()

  const [activeTab, setActiveTab] = useState('resources')
  const [course, setCourse] = useState(null)

  useEffect(() => {
    if (!employeeTrainingCourses || employeeTrainingCourses.length === 0) {
      getEmployeeTrainingCourses()
    }
  }, [])

  useEffect(() => {
    if (employeeTrainingCourses && employeeTrainingCourses.length > 0 && courseIndex) {
      const index = parseInt(courseIndex)
      if (index >= 0 && index < employeeTrainingCourses.length) {
        setCourse(employeeTrainingCourses[index])
      } else {
        showToast('Course not found', 'error')
        navigate('/EmployeeTraining')
      }
    }
  }, [employeeTrainingCourses, courseIndex])

  const handleGoBack = () => {
    navigate('/EmployeeTraining')
  }


  const [openEditor, setOpenEditor] = useState(false)
  const [editorData, setEditorData] = useState({})
  const [openNotesViewer, setOpenNotesViewer] = useState(false)
  const [notesData, setNotesData] = useState({ course_name: '', content: '' })

  const handleCompleteCourse = async () => {
    if (!course || !course.course_id) {
      showToast('Course information not available', 'error')
      return
    }

    try {
      const result = await completeCourse(course.course_id)
      if (result.success) {
        setTimeout(() => {
          navigate('/EmployeeTraining')
        }, 1500)
      }
    } catch (error) {
      console.error('Error completing course:', error)
    }
  }

  const handleTakeAssessment = async () => {
    navigate('/EmployeeTraining/assessment')
  }

  const getFileIcon = (resourceType, attachment) => {
    if (resourceType === 'Link') {
      return <FaExternalLinkAlt className='text-blue-500' />
    }

    if (attachment) {
      const ext = attachment.split('.').pop().toLowerCase()
      if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) {
        return <FaFileVideo className='text-purple-500' />
      }
      if (['pdf'].includes(ext)) {
        return <FaFilePdf className='text-red-500' />
      }
      if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
        return <FaFileImage className='text-green-500' />
      }
    }

    return <FaFile className='text-gray-500' />
  }

  const handleResourceClick = (resource) => {
    // console.log('Resource clicked:', resource?.resource_type)
    if (resource.attachment) {
      if (resource.resource_type === 'Link' || resource.attachment.startsWith('http')) {
        window.open(resource.attachment, '_blank')
      }

      if (resource.resource_type === 'Notes') {
        setNotesData({ 
          course_name: course.course_name || 'Notes',
          content: resource.attachment || ''
        })
        setOpenNotesViewer(true)
        return
      }

       if (resource.resource_type === 'Notes_pool') {
        setEditorData({ content: resource.attachment })
        setOpenEditor(true)
        return
      }

      else {
        showToast('Opening resource...', 'info')
        window.open(resource.attachment, '_blank')
      }
    } else {
      showToast('Resource not available', 'warning')
    }
  }

  const isVideoFile = (attachment) => {
    if (!attachment) return false
    const ext = attachment.split('.').pop().toLowerCase()
    return ['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(ext)
  }

  const isPdfFile = (attachment) => {
    if (!attachment) return false
    return attachment.toLowerCase().endsWith('.pdf')
  }

  const isImageFile = (attachment) => {
    if (!attachment) return false
    const ext = attachment.split('.').pop().toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4'></div>
          <Typography variant='small' className='font-medium text-gray-600'>
            Loading course details...
          </Typography>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-6'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-md w-full'>
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaBook className='text-4xl text-gray-300' />
          </div>
          <Typography variant='h5' className='text-gray-800 font-bold mb-2'>
            Course not found
          </Typography>
          <Typography className='text-gray-500 mb-8'>
            The course you're looking for doesn't exist or has been removed.
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
      <div className='max-w-5xl mx-auto space-y-6'>
        
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

        {/* Course Header */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden'>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className='flex items-start gap-6'>
            <div className='w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0'>
              <FaBook className='text-3xl text-blue-500' />
            </div>
            <div className='flex-1'>
              <Typography className='text-2xl font-bold text-gray-900 mb-2 leading-tight'>
                {course.course_name}
              </Typography>
              <div className='flex items-center gap-4'>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  <FaFileAlt className='text-gray-400' />
                  {course.resources?.length || 0} Resources
                </div>
                {/* Status Badge can be added here if available */}
              </div>
            </div>
            
            {/* Complete Course Button */}
            {(!course.completed_date || course.completed_date === 0) && (
              <Button
                className='flex items-center gap-2 bg-green-500 hover:bg-green-600 shadow-green-500/20 hover:shadow-green-500/40 rounded-xl normal-case font-medium px-6'
                onClick={handleCompleteCourse}
              >
                <FaCheckCircle />
                Mark as Complete
              </Button>
            )}
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
          <Tabs value={activeTab}>
            <div className="border-b border-gray-100 px-6 pt-4">
              <TabsHeader
                className="w-full md:w-auto bg-transparent p-0"
                indicatorProps={{
                  className: "bg-transparent border-b-2 border-blue-500 shadow-none rounded-none",
                }}
              >
                <Tab 
                  value="resources" 
                  onClick={() => setActiveTab('resources')}
                  className={`${activeTab === 'resources' ? 'text-blue-600' : 'text-gray-500'} pb-4 px-6 font-medium text-sm transition-colors`}
                >
                  <div className="flex items-center gap-2">
                    <FaFileAlt />
                    Course Resources
                  </div>
                </Tab>
                {/* Add more tabs here if needed (e.g. Overview, Discussion) */}
              </TabsHeader>
            </div>

            <TabsBody animate={{ initial: { y: 250 }, mount: { y: 0 }, unmount: { y: 250 } }}>
              <TabPanel value='resources' className='p-6'>
                {!course.resources || course.resources.length === 0 ? (
                  <div className='text-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200'>
                    <FaFileAlt className='text-4xl text-gray-300 mx-auto mb-3' />
                    <Typography className='text-gray-900 font-medium'>No resources available</Typography>
                    <Typography className='text-sm text-gray-500 mt-1'>This course doesn't have any content yet.</Typography>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {course.resources
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((resource, index) => (
                        <motion.div 
                          key={resource.resource_id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className='group bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 p-5'
                        >
                          <div className='flex items-start gap-5'>
                            <div className='mt-1 p-3 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors text-2xl'>
                              {getFileIcon(resource.resource_type, resource.attachment)}
                            </div>
                            
                            <div className='flex-1 min-w-0'>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <Typography className='text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors'>
                                    {resource.resource_name}
                                  </Typography>
                                  <div className='flex items-center gap-3'>
                                    <span className='text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded'>
                                      {resource.resource_type}
                                    </span>
                                    {/* <span className='text-xs text-gray-400'>Order: {resource.order}</span> */}
                                  </div>
                                </div>
                                <Button
                                  size='sm'
                                  className='flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm normal-case font-medium rounded-lg'
                                  onClick={() => handleResourceClick(resource)}
                                >
                                  {resource.resource_type === 'Link' ? (
                                    <>Open Link <FaExternalLinkAlt className="text-xs" /></>
                                  ) : isVideoFile(resource.attachment) ? (
                                    <>Watch Video <FaPlayCircle className="text-xs text-blue-500" /></>
                                  ) : resource.resource_type === 'Notes' ? (
                                    <>Read Notes <FaBook className="text-xs text-blue-500" /></>
                                  ) : (
                                    <>View File <FaArrowLeft className="text-xs rotate-180" /></>
                                  )}
                                </Button>
                              </div>

                              {/* Content Previews */}
                              {isVideoFile(resource.attachment) && (
                                <div className='mt-4 p-6 bg-gray-900 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer group/video' onClick={() => handleResourceClick(resource)}>
                                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover/video:scale-110 transition-transform">
                                    <FaPlayCircle className='text-3xl text-white' />
                                  </div>
                                  <span className="text-gray-300 text-sm font-medium">Click to play video</span>
                                </div>
                              )}

                              {isImageFile(resource.attachment) && (
                                <div className='mt-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50'>
                                  <img
                                    src={resource.attachment}
                                    alt={resource.resource_name}
                                    className='w-full max-h-80 object-contain mx-auto'
                                  />
                                </div>
                              )}

                              {resource.resource_type === 'Notes_pool' && resource.attachment && (
                                <div className='mt-4 p-5 bg-yellow-50/50 rounded-xl border border-yellow-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium'>
                                  {resource.attachment}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </TabPanel>
            </TabsBody>
          </Tabs>
        </div>
      </div>

      {openEditor && (
        <CustomDialog
          openDialog={openEditor}
          size="xxl"
          handleOpen={() => setOpenEditor(false)}
          title="Notes"
          footer={false}
          compo={<EditorData editorData={editorData} />}
        />
      )}

      {openNotesViewer && (
        <CustomDialog
          openDialog={openNotesViewer}
          size="xxl"
          handleOpen={() => setOpenNotesViewer(false)}
          title={notesData.course_name}
          footer={false}
          compo={
            <div className='p-8'>
              <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
                <Typography className='text-gray-800 whitespace-pre-wrap leading-relaxed font-poppins'>
                  {notesData.content}
                </Typography>
              </div>
            </div>
          }
        />
      )}

    </div>
  )
}

export default CourseDetailPage