import { Input, Button, Option, Select, Typography } from '@material-tailwind/react'
import React, { useState, useMemo, useEffect } from 'react'
import { FaPlus, FaTrash, FaLink, FaUpload, FaFileAlt } from 'react-icons/fa'
import TrainingService from '../../ViewModel/TraingingViewModel/TrainingService'
import { showToast } from '../../Components/Toaster/Toaster'
import useStore from '../../Store/store'

function EditCourse(props) {
  const { courseId, closeDrawer } = props
  const { getCourseCompleteDetails, updateCourseAndResource, Training_datefn } = TrainingService()

  // Get uploadTrainingFile directly from store (for training docs)
  const uploadTrainingFile = useStore((state) => state.uploadTrainingFile)

  const [courseData, setCourseData] = useState({
    course_name: '',
    description: ''
  })

  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Fetch course complete details on mount
  useEffect(() => {
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    setFetching(true)
    try {
      const response = await getCourseCompleteDetails(courseId)
      if (response) {
        // Set course data
        setCourseData({
          course_name: response.course?.course_name || '',
          description: response.course?.description || ''
        })

        // Set resources data
        if (response.resources && Array.isArray(response.resources)) {
          const formattedResources = response.resources.map((item, index) => {
            const resource = item.resource || item
            let document_type = ''
            let link_url = ''
            let notes_pool_id = ''
            let notes_text = ''
            let file = null

            // Determine document type and set appropriate fields
            if (resource.resource_type === 'Link') {
              document_type = 'Link'
              link_url = resource.attachment || ''
            } else if (resource.resource_type === 'Document') {
              document_type = 'Upload docs'
              // For existing documents, we keep the attachment URL
              // User can upload a new file to replace it
            } else if (resource.resource_type === 'Notes_pool') {
              document_type = 'Notes_pool'
              notes_pool_id = resource.attachment || ''
            } else if (resource.resource_type === 'Notes') {
              document_type = 'Notes'
              notes_text = resource.attachment || ''
            }

            return {
              id: resource._id || `resource-${index}`,
              resource_id: resource._id,
              resource_name: resource.resource_name || '',
              document_type: document_type,
              link_url: link_url,
              file: file,
              notes_pool_id: notes_pool_id,
              notes_text: notes_text,
              existing_attachment: resource.attachment || '' // Keep existing attachment URL
            }
          })

          // If no resources, add one empty resource
          if (formattedResources.length === 0) {
            formattedResources.push({
              id: Date.now(),
              resource_name: '',
              document_type: '',
              link_url: '',
              file: null,
              notes_pool_id: '',
              notes_text: '',
              existing_attachment: ''
            })
          }

          setResources(formattedResources)
        } else {
          // If no resources, add one empty resource
          setResources([{
            id: Date.now(),
            resource_name: '',
            document_type: '',
            link_url: '',
            file: null,
            notes_pool_id: '',
            notes_text: '',
            existing_attachment: ''
          }])
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error)
      showToast('Failed to load course data', 'error')
    } finally {
      setFetching(false)
    }
  }

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      courseData.course_name?.trim() !== '' &&
      courseData.description?.trim() !== '' &&
      resources.length > 0 &&
      resources.every(resource => {
        if (!resource.resource_name?.trim()) return false
        if (!resource.document_type) return false

        if (resource.document_type === 'Link') {
          return resource.link_url?.trim() !== ''
        } else if (resource.document_type === 'Upload docs') {
          // For edit mode, either file is uploaded or existing_attachment exists
          return resource.file !== null || resource.existing_attachment !== ''
        } else if (resource.document_type === 'Notes_pool') {
          return resource.notes_pool_id !== ''
        } else if (resource.document_type === 'Notes') {
          return resource.notes_text?.trim() !== ''
        }
        return false
      })
    )
  }, [courseData, resources])

  const handleInputChange = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleResourceChange = (resourceId, field, value) => {
    setResources(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, [field]: value }
          : resource
      )
    )
  }

  const addNewResource = () => {
    const newResource = {
      id: Date.now(),
      resource_name: '',
      document_type: '',
      link_url: '',
      file: null,
      notes_pool_id: '',
      notes_text: '',
      existing_attachment: ''
    }
    setResources(prev => [...prev, newResource])
  }

  const removeResource = (resourceId) => {
    // if (resources.length <= 1) {
    //   showToast('At least one resource is required', 'error')
    //   return
    // }
    setResources(prev => prev.filter(resource => resource.id !== resourceId))
  }

  const handleFileUpload = (resourceId, event) => {
    const file = event.target.files[0]
    if (file) {
      handleResourceChange(resourceId, 'file', file)
      // Clear existing attachment when new file is uploaded
      handleResourceChange(resourceId, 'existing_attachment', '')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isFormValid) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    setLoading(true)

    try {
      // Process resources - send each resource update
      for (const resource of resources) {
        let attachment = ''
        let resource_type = ''

        if (resource.document_type === 'Link') {
          attachment = resource.link_url
          resource_type = 'Link'
        } else if (resource.document_type === 'Upload docs') {
          // If new file is uploaded, upload it using training_url endpoint; otherwise use existing attachment
          if (resource.file) {
            try {
              if (!uploadTrainingFile) {
                console.error('uploadTrainingFile is not available')
                showToast('Upload function not available. Please refresh the page.', 'error')
                setLoading(false)
                return
              }

              const uploadResult = await uploadTrainingFile(resource.file)
              if (uploadResult.success) {
                attachment = uploadResult.fileUrl
                resource_type = 'Document'
              } else {
                throw new Error('File upload failed')
              }
            } catch (uploadError) {
              console.error('Error uploading file:', uploadError)
              showToast(`Failed to upload file: ${resource.file.name}`, 'error')
              setLoading(false)
              return
            }
          } else {
            // Use existing attachment
            attachment = resource.existing_attachment
            resource_type = 'Document'
          }
        } else if (resource.document_type === 'Notes_pool') {
          attachment = resource.notes_pool_id
          resource_type = 'Notes_pool'
        } else if (resource.document_type === 'Notes') {
          attachment = resource.notes_text
          resource_type = 'Notes'
        }

        // Prepare update payload for each resource
        const resourcePayload = {
          resource_name: resource.resource_name,
          attachment: attachment,
          resource_type: resource_type
        }

        // If it's an existing resource, include ID for update
        // If it's a new resource, include course_id for create
        if (resource.resource_id) {
          resourcePayload.id = String(resource.resource_id)
        } else {
          resourcePayload.course_id = courseId
        }

        const updatePayload = {
          course: {
            id: courseId,
            course_name: courseData.course_name,
            description: courseData.description
          },
          resource: resourcePayload
        }

        // Send update request for each resource
        const response = await updateCourseAndResource(updatePayload)

        if (response && response.STATUS === 'SUCCESSFUL') {
          // Continue to next resource
        } else {
          throw new Error(response?.ERROR_DESCRIPTION || 'Failed to update course resource')
        }
      }

      showToast('Course updated successfully!', 'success')
      // Refresh course list
      Training_datefn({ status: '', text: '', page: 1, limit: 10 })
      // Close drawer
      if (closeDrawer) {
        closeDrawer()
      }
    } catch (error) {
      console.error('Error updating course:', error)
      showToast(error?.response?.data?.ERROR_DESCRIPTION || error?.message || 'Failed to update course', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Typography className="text-[16px] text-gray-500 font-medium">
          Loading course data...
        </Typography>
      </div>
    )
  }

  return (
    <>
      <div className=''>
        <form className='' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-4'>
            {/* Course Name */}
            <div>
              <Input
                required
                label='Course Name'
                color='blue'
                value={courseData.course_name}
                onChange={(e) => handleInputChange('course_name', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className='relative'>
              <div className="relative w-full min-w-[200px]">
                <textarea
                  required
                  value={courseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="peer w-full h-full bg-transparent text-blue-gray-700 outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-blue-500 resize-none"
                  placeholder=" "
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-blue-500 before:border-blue-gray-200 peer-focus:before:!border-blue-500 after:border-blue-gray-200 peer-focus:after:!border-blue-500">
                  Description
                </label>
              </div>
            </div>

            {/* Resources Section */}
            <div className='border-t pt-4 mt-2'>
              <div className='flex justify-between items-center mb-4'>
                <label className='text-[#7a929e] font-medium'>Resources</label>
                <Button
                  type='button'
                  size='sm'
                  variant='outlined'
                  className='flex items-center gap-2 py-1 px-3 text-[12px]'
                  onClick={addNewResource}
                >
                  <FaPlus className='text-[10px]' />
                  Add Resource
                </Button>
              </div>

              <div className='flex flex-col gap-4'>
                {resources.map((resource, index) => (
                  <div key={resource.id} className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                    <div className='flex justify-between items-center mb-3'>
                      <span className='text-[14px] font-semibold text-[#474747]'>
                        Resource {index + 1}
                      </span>
                      <button
                        type='button'
                        onClick={() => removeResource(resource.id)}
                        className='text-red-500 hover:text-red-700'
                      >
                        <FaTrash className='text-[12px]' />
                      </button>
                    </div>

                    {/* Resource Name */}
                    <div className='mb-3'>
                      <Input
                        required
                        label='Resource Name'
                        color='blue'
                        value={resource.resource_name}
                        onChange={(e) => handleResourceChange(resource.id, 'resource_name', e.target.value)}
                      />
                    </div>

                    {/* Document Type */}
                    <div className='mb-3'>
                      <Select
                        required
                        label='Document Type'
                        color='blue'
                        value={resource.document_type}
                        onChange={(val) => handleResourceChange(resource.id, 'document_type', val)}
                      >
                        <Option value='Link'>Link</Option>
                        <Option value='Upload docs'>Upload docs</Option>
                        <Option value='Notes_pool'>Notes_pool</Option>
                        <Option value='Notes'>Notes</Option>
                      </Select>
                    </div>

                    {/* Conditional Inputs based on Document Type */}
                    {resource.document_type === 'Link' && (
                      <div className='mb-3'>
                        <Input
                          required
                          label='Link URL'
                          color='blue'
                          type='url'
                          value={resource.link_url}
                          onChange={(e) => handleResourceChange(resource.id, 'link_url', e.target.value)}
                          icon={<FaLink className='text-[14px]' />}
                        />
                      </div>
                    )}

                    {resource.document_type === 'Upload docs' && (
                      <div className='mb-3'>
                        <label className='block text-[#7a929e] text-sm mb-2'>Upload Document</label>
                        {resource.existing_attachment && !resource.file && (
                          <div className='mb-2 text-xs text-gray-600 flex items-center gap-1'>
                            <FaFileAlt className='text-[10px]' />
                            <span>Current: {resource.existing_attachment}</span>
                          </div>
                        )}
                        <div className='relative'>
                          <input
                            type='file'
                            accept='*/*'
                            onChange={(e) => handleFileUpload(resource.id, e)}
                            className='hidden'
                            id={`file-upload-${resource.id}`}
                          />
                          <label
                            htmlFor={`file-upload-${resource.id}`}
                            className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50'
                          >
                            <FaUpload className='text-[14px] text-blue-500' />
                            <span className='text-sm text-gray-700'>
                              {resource.file ? resource.file.name : 'Choose File'}
                            </span>
                          </label>
                        </div>
                        {resource.file && (
                          <div className='mt-2 text-xs text-gray-600 flex items-center gap-1'>
                            <FaFileAlt className='text-[10px]' />
                            {resource.file.name}
                          </div>
                        )}
                      </div>
                    )}

                    {resource.document_type === 'Notes_pool' && (
                      <div className='mb-3'>
                        <Input
                          required
                          label='Notes Pool ID'
                          color='blue'
                          value={resource.notes_pool_id}
                          onChange={(e) => handleResourceChange(resource.id, 'notes_pool_id', e.target.value)}
                          placeholder='Enter Notes Pool ID'
                        />
                      </div>
                    )}

                    {resource.document_type === 'Notes' && (
                      <div className='mb-3'>
                        <div className='relative'>
                          <div className="relative w-full min-w-[200px]">
                            <textarea
                              required
                              value={resource.notes_text}
                              onChange={(e) => handleResourceChange(resource.id, 'notes_text', e.target.value)}
                              rows={4}
                              className="peer w-full h-full bg-transparent text-blue-gray-700 outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-blue-500 resize-none"
                              placeholder=" "
                            />
                            <label className="flex w-full h-full select-none pointer-events-none absolute left-0 !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-blue-500 before:border-blue-gray-200 peer-focus:before:!border-blue-500 after:border-blue-gray-200 peer-focus:after:!border-blue-500">
                              Notes
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              {loading ? (
                <Button
                  className='bg-blue-300 py-[10px] capitalize'
                  loading={true}
                >
                  Loading
                </Button>
              ) : (
                <Button
                  type='submit'
                  className={`py-[10px] capitalize ${isFormValid ? 'bg-blue-500' : 'bg-blue-200'}`}
                  disabled={!isFormValid}
                >
                  Update
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

export default EditCourse

