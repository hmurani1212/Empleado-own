import React, { useEffect, useState } from 'react'
import { Card, CardBody, Typography, Button, Tabs, TabsHeader, TabsBody, Tab, TabPanel } from '@material-tailwind/react'
import { FaBook, FaFileAlt, FaDownload, FaExternalLinkAlt, FaFilePdf, FaFileVideo, FaFileImage, FaFile, FaArrowLeft, FaPlayCircle, FaCheckCircle } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import useEmpTrainingService from '../../../ViewModel/EmpViewModel/EmpTrainingViewModel/EmpTrainingServices'
import { showToast } from '../../../Components/Toaster/Toaster'
import CustomDialog from '../../../Components/CustomDialog/CustomDialog'
import EditorData from '../../../View/NotesPool/EditorData'
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
        setEditorData({ content: resource.attachment })
        setOpenEditor(true)
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
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <Typography variant='small' color='gray'>
            Loading course details...
          </Typography>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className='p-6'>
        <Card>
          <CardBody className='text-center py-20'>
            <FaBook className='text-6xl text-gray-300 mx-auto mb-4' />
            <Typography variant='h5' color='blue-gray' className='mb-2'>
              Course not found
            </Typography>
            <Typography variant='small' color='gray' className='mb-4'>
              The course you're looking for doesn't exist or has been removed
            </Typography>
            <Button color='blue' onClick={handleGoBack}>
              Go Back to Courses
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-6'>
      {/* Back Button */}
      <div className='mb-6'>
        <Button
          variant='text'
          color='blue'
          className='flex items-center gap-2'
          onClick={handleGoBack}
        >
          <FaArrowLeft />
          Back to Courses
        </Button>
      </div>

      {/* Course Header */}
      <div className='mb-6'>
        <Card>
          <CardBody>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-blue-50 rounded-lg'>
                <FaBook className='text-3xl text-blue-500' />
              </div>
              <div className='flex-1'>
                <Typography variant='h4' color='blue-gray' className='mb-2'>
                  {course.course_name}
                </Typography>
                <div className='flex items-center gap-4 text-sm text-gray-600'>
                  <span className='flex items-center gap-1'>
                    <FaFileAlt />
                    {course.resources?.length || 0} Resources
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Course Content */}
      <Card>
        <CardBody>
          <Tabs value={activeTab}>
            <TabsHeader
              className='bg-blue-gray-50'
              indicatorProps={{
                className: 'bg-blue-500 shadow-none'
              }}
            >
              <Tab value='resources' onClick={() => setActiveTab('resources')}>
                <div className='flex items-center gap-2'>
                  <FaFileAlt />
                  Resources
                </div>
              </Tab>
            </TabsHeader>

            <TabsBody>
              <TabPanel value='resources' className='p-0 mt-4'>
                {!course.resources || course.resources.length === 0 ? (
                  <Card>
                    <CardBody className='text-center py-10'>
                      <FaFileAlt className='text-5xl text-gray-300 mx-auto mb-3' />
                      <Typography variant='h6' color='gray'>
                        No resources available
                      </Typography>
                      <Typography variant='small' color='gray' className='mt-2'>
                        This course doesn't have any resources yet
                      </Typography>
                    </CardBody>
                  </Card>
                ) : (
                  <div className='space-y-4'>
                    {course.resources
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((resource, index) => (
                        <Card key={resource.resource_id || index} className='hover:shadow-lg transition-shadow'>
                          <CardBody>
                            <div className='flex items-start gap-4'>
                              <div className='text-3xl mt-1'>
                                {getFileIcon(resource.resource_type, resource.attachment)}
                              </div>
                              <div className='flex-1'>
                                <Typography variant='h6' color='blue-gray' className='mb-2'>
                                  {resource.resource_name}
                                </Typography>
                                <div className='flex items-center gap-2 mb-3'>
                                  <span className='text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded'>
                                    {resource.resource_type}
                                  </span>
                                  <span className='text-xs text-gray-500'>
                                    Order: {resource.order}
                                  </span>
                                </div>

                                {/* Video files - show thumbnail or placeholder */}
                                {isVideoFile(resource.attachment) && (
                                  <div className='mb-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                                    <div className='flex items-center gap-3'>
                                      <FaFileVideo className='text-4xl text-purple-500' />
                                      <div>
                                        <Typography variant='small' color='gray' className='font-semibold'>
                                          Video File
                                        </Typography>
                                        <Typography variant='small' color='gray'>
                                          Click the Play button below to watch
                                        </Typography>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Preview for images */}
                                {isImageFile(resource.attachment) && (
                                  <div className='mb-3'>
                                    <img
                                      src={resource.attachment}
                                      alt={resource.resource_name}
                                      className='w-full rounded-lg max-h-96 object-contain'
                                    />
                                  </div>
                                )}

                                {/* PDF files - show placeholder */}
                                {isPdfFile(resource.attachment) && (
                                  <div className='mb-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                                    <div className='flex items-center gap-3'>
                                      <FaFilePdf className='text-4xl text-red-500' />
                                      <div>
                                        <Typography variant='small' color='gray' className='font-semibold'>
                                          PDF Document
                                        </Typography>
                                        <Typography variant='small' color='gray'>
                                          Click the Open button below to view
                                        </Typography>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Text content for Notes_pool */}
                                {resource.resource_type === 'Notes_pool' && resource.attachment && (
                                  <div className='mb-3 p-4 bg-gray-50 rounded-lg'>
                                    <Typography variant='small' className='whitespace-pre-wrap text-gray-700'>
                                      {resource.attachment}
                                    </Typography>
                                  </div>
                                )}

                                <div className='flex gap-2'>
                                  <Button
                                    size='sm'
                                    color='blue'
                                    variant='gradient'
                                    className='flex items-center gap-2'
                                    onClick={() => handleResourceClick(resource)}
                                  >
                                    {resource.resource_type === 'Link' ? (
                                      <>
                                        <FaExternalLinkAlt />
                                        Open Link
                                      </>
                                    ) : isVideoFile(resource.attachment) ? (
                                      <>
                                        <FaPlayCircle />
                                        Play Video
                                      </>
                                    ) : resource.resource_type === 'Notes' ? (
                                      <>
                                        <FaPlayCircle />
                                        open document
                                      </>
                                    ) : isPdfFile(resource.attachment) ? (
                                      <>
                                        <FaExternalLinkAlt />
                                        Open Document
                                      </>
                                    ) : (
                                      <>
                                        <FaDownload />
                                        Open Resource
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                  </div>
                )}
              </TabPanel>
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>

      {/* Complete Course Button - Only show if not completed */}
      {(!course.completed_date || course.completed_date === 0) && (
        <Card className='mt-6'>
          <CardBody>
            <div className='flex items-center justify-between'>
              <div>
                <Typography variant='h6' color='blue-gray' className='mb-1'>
                  Finish Course
                </Typography>
                <Typography variant='small' color='gray'>
                  Mark this course as completed after reviewing all resources
                </Typography>
              </div>
              <Button
                color='green'
                size='lg'
                className='flex items-center gap-2'
                onClick={handleCompleteCourse}
              >
                <FaCheckCircle />
                Complete Course
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

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

    </div>
  )
}

export default CourseDetailPage
