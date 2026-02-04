import React, { useState, useEffect, useRef } from 'react'
import { 
  Card, 
  CardBody, 
  Typography, 
  Input, 
  Button, 
  Textarea,
  Checkbox
} from '@material-tailwind/react'
import { 
  FaTimes, 
  FaPlus, 
  FaUpload, 
  FaLink,
  FaChevronLeft,
  FaChevronRight,
  FaCheck
} from 'react-icons/fa'
import TrainingService from "../../ViewModel/TraingingViewModel/TrainingService"
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices"
import { showToast } from "../../Components/Toaster/Toaster"
import CustomSelect from "../../Components/CustomSelect/CustomSelect"
import ResourceEditor from './ResourceEditor'
import AIAssessmentSection from './AIAssessmentSection'

// Link validation function
const validateLink = (url) => {
  if (!url || url.trim() === '') {
    return { valid: false, message: 'Link cannot be empty' }
  }
  
  try {
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, message: 'Link must start with http:// or https://' }
    }
    const hostname = urlObj.hostname || urlObj.host
    if (!hostname || hostname.trim() === '') {
      return { valid: false, message: 'Please enter a valid link' }
    }
    return { valid: true, message: '' }
  } catch (error) {
    const trimmedUrl = url.trim()
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return { valid: true, message: '' }
    }
    return { valid: false, message: 'Please enter a valid link (e.g., http://172.18.0.44:6050/trainingDash)' }
  }
}

const AddCourseModal = ({ isOpen, onClose }) => {
  const { Add_training_course_fn, uploadFileToElephant } = TrainingService();
  const { 
    empBranches, 
    dept_subDept, 
    fetchingAllBranches, 
    gettingSubBranches
  } = useEmployees();

  const fileInputRef = useRef(null);

  // Multi-step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3; // Step 1: Course Details, Step 2: Resources, Step 3: AI Assessment

  const [formData, setFormData] = useState({
    course_name: '',
    description: '',
    is_assessment_required: true,
    is_approval_required: false,
    branch_id: '',
    dept_id: ''
  })

  const [resources, setResources] = useState([
    {
      id: 1,
      attachment: '',
      resource_type: '',
      resource_name: '',
      resource_description: '',
      notes: '',
      notebook_link: '',
      order: 1,
      file: null,
      attachment_type: ''
    }
  ])

  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [employeesList, setEmployeesList] = useState([])
  const [loading, setLoading] = useState(false)
  const [branchSearchTerm, setBranchSearchTerm] = useState('')
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('')
  const [hasDepartments, setHasDepartments] = useState(true)
  const [hasEmployees, setHasEmployees] = useState(true)

  // Attachment modal states
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [attachmentType, setAttachmentType] = useState('')
  const [attachmentData, setAttachmentData] = useState({
    name: '',
    url: '',
    file: null
  })
  const [currentResourceId, setCurrentResourceId] = useState(null)

  // Fetch branches on component mount
  useEffect(() => {
    if (isOpen) {
      fetchingAllBranches()
    }
  }, [isOpen])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setCurrentStep(1)
    setFormData({
      course_name: '',
      description: '',
      is_assessment_required: true,
      is_approval_required: false,
      branch_id: '',
      dept_id: ''
    })
    setResources([{
      id: 1,
      attachment: '',
      resource_type: '',
      resource_name: '',
      resource_description: '',
      notes: '',
      notebook_link: '',
      order: 1,
      file: null,
      attachment_type: ''
    }])
    setSelectedEmployees([])
    setEmployeesList([])
    setShowAttachmentModal(false)
    setAttachmentData({ name: '', url: '', file: null })
    setBranchSearchTerm('')
    setDepartmentSearchTerm('')
    setHasDepartments(true)
    setHasEmployees(true)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
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
      attachment: '',
      resource_type: '',
      resource_name: '',
      resource_description: '',
      notes: '',
      notebook_link: '',
      order: resources.length + 1,
      file: null,
      attachment_type: ''
    }
    setResources(prev => [...prev, newResource])
  }

  const removeResource = (resourceId) => {
    if (resources.length > 1) {
      setResources(prev => {
        const filtered = prev.filter(resource => resource.id !== resourceId)
        return filtered.map((resource, index) => ({
          ...resource,
          order: index + 1
        }))
      })
    }
  }

  const handleBranchSelect = async (selectedOption) => {
    if (selectedOption) {
      const branchId = selectedOption.value
      setFormData(prev => ({
        ...prev,
        branch_id: branchId,
        dept_id: '',
      }))
      setOpenDropdowns(prev => ({ ...prev, branch: false }))
      
      const deptResult = await gettingSubBranches(branchId)
      if (deptResult && deptResult.length === 0) {
        setHasDepartments(false)
      } else {
        setHasDepartments(true)
      }
    }
  }

  const handleDepartmentSelect = async (selectedOption) => {
    if (selectedOption) {
      const deptId = selectedOption.value
      setFormData(prev => ({
        ...prev,
        dept_id: deptId,
      }))
      setOpenDropdowns(prev => ({ ...prev, department: false }))
    }
  }

  const [openDropdowns, setOpenDropdowns] = useState({
    branch: false,
    department: false
  })

  const getSelectedLabel = (field) => {
    if (field === 'branch') {
      if (formData.branch_id === 0) {
        return { value: 0, label: 'All Branch' }
      }
      const selected = empBranches?.find(branch => branch.id === formData.branch_id)
      return selected ? { value: selected.id, label: selected.branch_name } : null
    } else if (field === 'department') {
      if (formData.dept_id === 0) {
        return { value: 0, label: 'All Department' }
      }
      const selected = dept_subDept?.departments?.find(dept => dept.id === formData.dept_id)
      return selected ? { value: selected.id, label: selected.name } : null
    }
    return ''
  }

  const handleAttachmentClick = (type, resourceId) => {
    setAttachmentType(type)
    setCurrentResourceId(resourceId)
    setShowAttachmentModal(true)
    setAttachmentData({ name: '', url: '', file: null })
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setAttachmentData(prev => ({
        ...prev,
        file: file,
        name: file.name
      }))
    }
  }

  const handleAttachmentSubmit = () => {
    if (attachmentType === 'upload') {
      if (!attachmentData.file) {
        showToast('Please select a file to upload', 'error')
        return
      }
      attachmentData.name = attachmentData.file.name
    } else if (attachmentType === 'link') {
      if (!attachmentData.name || attachmentData.name.trim() === '') {
        try {
          const urlObj = new URL(attachmentData.url)
          attachmentData.name = urlObj.hostname || 'Link Attachment'
        } catch {
          attachmentData.name = 'Link Attachment'
        }
      }
    }

    let attachmentValue = ''
    let attachmentTypeValue = ''

    switch (attachmentType) {
      case 'upload':
        attachmentValue = attachmentData.file.name
        attachmentTypeValue = 'file'
        break
      case 'link':
        if (!attachmentData.url) {
          showToast('Please provide the document link', 'error')
          return
        }
        const linkValidation = validateLink(attachmentData.url)
        if (!linkValidation.valid) {
          showToast(linkValidation.message, 'error')
          return
        }
        attachmentValue = attachmentData.url
        attachmentTypeValue = 'link'
        break
      default:
        break
    }

    setResources(prev => 
      prev.map(resource => 
        resource.id === currentResourceId 
          ? { 
              ...resource, 
              attachment: attachmentValue,
              resource_name: attachmentData.name,
              file: attachmentData.file,
              attachment_type: attachmentTypeValue
            }
          : resource
      )
    )

    setShowAttachmentModal(false)
    setAttachmentData({ name: '', url: '', file: null })
    setCurrentResourceId(null)
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.course_name || !formData.description || 
            formData.branch_id === '' || formData.branch_id === null || 
            formData.dept_id === '' || formData.dept_id === null) {
          showToast('Please fill in all required fields in Course Details', 'error')
          return false
        }
        return true
      case 2:
        // Resources are optional, so step 2 is always valid
        return true
      case 3:
        // AI Assessment is optional, so step 3 is always valid
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1)
      return
    }

    // Validate resources
    for (const resource of resources) {
      if (resource.resource_name || resource.resource_description || resource.attachment) {
        if (!resource.resource_type) {
          showToast('Please select a resource type for all resources', 'error')
          setCurrentStep(2)
          return
        }
        if (!resource.attachment) {
          showToast('Please add an attachment for all resources', 'error')
          setCurrentStep(2)
          return
        }
      }
    }

    setLoading(true)

    try {
      const processedResources = []
      
      for (const resource of resources) {
        if (resource.attachment_type === 'file' && resource.file) {
          try {
            const uploadResult = await uploadFileToElephant(resource.file)
            if (uploadResult.success) {
              processedResources.push({
                attachment: uploadResult.fileUrl,
                resource_type: resource.resource_type || 'file',
                resource_name: resource.resource_name || resource.file.name,
                resource_description: resource.resource_description || '',
                notes: resource.notes || '',
                notebook_link: resource.notebook_link || '',
                order: resource.order
              })
            } else {
              throw new Error('File upload failed')
            }
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError)
            showToast(`Failed to upload file: ${resource.file.name}`, 'error')
            setLoading(false)
            return
          }
        } else if (resource.attachment) {
          processedResources.push({
            attachment: resource.attachment || '',
            resource_type: resource.resource_type || '',
            resource_name: resource.resource_name || '',
            resource_description: resource.resource_description || '',
            notes: resource.notes || '',
            notebook_link: resource.notebook_link || '',
            order: resource.order
          })
        }
      }

      const submitData = {
        course_name: formData.course_name,
        description: formData.description,
        is_assessment_required: formData.is_assessment_required.toString(),
        is_approval_required: formData.is_approval_required.toString(),
        branch_id: parseInt(formData.branch_id),
        dept_id: parseInt(formData.dept_id),
        resources: processedResources
      }

      const response = await Add_training_course_fn(submitData);
      
      if (response && response.data && response.data.STATUS === 'SUCCESSFUL') {
        showToast('Course added successfully!', 'success')
        onClose()
        resetForm()
      }
      
    } catch (error) {
      showToast(error?.response?.data?.ERROR_DESCRIPTION || 'Failed to add training data', 'error');
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardBody className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <Typography className="text-[18px] font-semibold text-[#474747]">
                Add new course
              </Typography>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes className="text-[18px]" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentStep >= step 
                          ? 'bg-[#3DA5F4] text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep > step ? (
                          <FaCheck className="text-[14px]" />
                        ) : (
                          <span className="text-[14px] font-semibold">{step}</span>
                        )}
                      </div>
                      <div className="ml-2">
                        <Typography className={`text-[12px] font-medium ${
                          currentStep >= step ? 'text-[#3DA5F4]' : 'text-gray-500'
                        }`}>
                          {step === 1 && 'Course Details'}
                          {step === 2 && 'Resources'}
                          {step === 3 && 'AI Assessment'}
                        </Typography>
                      </div>
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-[#3DA5F4]' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <div className="space-y-4 mb-6">
                <Typography className="text-[16px] font-semibold text-[#474747] mb-4">
                  Course Details
                </Typography>

                {/* Course Name */}
                <div>
                  <Typography className="text-[14px] font-medium text-[#474747] mb-2">
                    Course Name *
                  </Typography>
                  <Input
                    placeholder="Enter course name"
                    value={formData.course_name}
                    onChange={(e) => handleInputChange('course_name', e.target.value)}
                    className="!border !border-gray-300 bg-white text-blue-gray-700 shadow-lg shadow-blue-gray-900/5 ring-4 ring-transparent placeholder:text-blue-gray-500 focus:!border-[#3DA5F4] focus:!border-t-[#3DA5F4] focus:ring-[#3DA5F4]/20"
                  />
                </div>

                {/* Branch Dropdown */}
                <div>
                  <Typography className="text-[14px] font-medium text-[#474747] mb-2">
                    Branch *
                  </Typography>
                  <CustomSelect
                    placeHolderTitle="Branch"
                    value={getSelectedLabel('branch')}
                    options={[
                      { value: 0, label: 'All Branch' },
                      ...(empBranches?.map((branch) => ({
                        value: branch.id,
                        label: branch.branch_name
                      })) || [])
                    ]}
                    onChangeHandler={handleBranchSelect}
                    onHandleSelectSearch={setBranchSearchTerm}
                    customStyles={false}
                    isSearchable={true}
                    isClearable={true}
                  />
                </div>

                {/* Department Dropdown */}
                <div>
                  <Typography className="text-[14px] font-medium text-[#474747] mb-2">
                    Department *
                  </Typography>
                  <CustomSelect
                    placeHolderTitle="Department"
                    value={getSelectedLabel('department')}
                    options={[
                      ...(hasDepartments ? [{ value: 0, label: 'All Department' }] : []),
                      ...(dept_subDept?.departments?.map((dept) => ({
                        value: dept.id,
                        label: dept.name
                      })) || [])
                    ]}
                    onChangeHandler={handleDepartmentSelect}
                    onHandleSelectSearch={setDepartmentSearchTerm}
                    customStyles={false}
                    isSearchable={true}
                    isClearable={true}
                    disabled={formData.branch_id === '' || formData.branch_id === null}
                  />
                </div>

                {/* Course Description */}
                <div>
                  <Typography className="text-[14px] font-medium text-[#474747] mb-2">
                    Course Description *
                  </Typography>
                  <Textarea
                    placeholder="Enter course description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="!border !border-gray-300 bg-white text-blue-gray-700 shadow-lg shadow-blue-gray-900/5 ring-4 ring-transparent placeholder:text-blue-gray-500 focus:!border-[#3DA5F4] focus:!border-t-[#3DA5F4] focus:ring-[#3DA5F4]/20"
                    rows={4}
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.is_assessment_required}
                      onChange={(e) => handleInputChange('is_assessment_required', e.target.checked)}
                      className="text-[#3DA5F4]"
                    />
                    <Typography className="text-[14px] text-[#474747]">
                      Assessment required
                    </Typography>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.is_approval_required}
                      onChange={(e) => handleInputChange('is_approval_required', e.target.checked)}
                      className="text-[#3DA5F4]"
                    />
                    <Typography className="text-[14px] text-[#474747]">
                      Approval required
                    </Typography>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 mb-6">
                <Typography className="text-[16px] font-semibold text-[#474747] mb-4">
                  Resources
                </Typography>

                {resources.map((resource, index) => (
                  <ResourceEditor
                    key={resource.id}
                    resource={resource}
                    onResourceChange={handleResourceChange}
                    onRemove={removeResource}
                    index={index + 1}
                    canRemove={resources.length > 1}
                    onAttachmentClick={handleAttachmentClick}
                  />
                ))}

                <div className="flex justify-between items-center pt-4">
                  <Button
                    onClick={addNewResource}
                    className="flex items-center gap-2 px-4 py-2 border border-[#3DA5F4] text-[#3DA5F4] rounded-lg bg-white hover:bg-[#3DA5F4] hover:text-white transition-colors"
                    variant="outlined"
                  >
                    <FaPlus className="text-[14px]" />
                    Add Resource
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 mb-6">
                <AIAssessmentSection 
                  courseId={null} 
                  formData={formData}
                />
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                variant="outlined"
              >
                <FaChevronLeft className="text-[14px]" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-[#3DA5F4] text-white rounded-lg hover:bg-[#2B8FD4] transition-colors"
                >
                  Next
                  <FaChevronRight className="text-[14px]" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-[#3DA5F4] text-white rounded-lg hover:bg-[#2B8FD4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Course'}
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Attachment Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <Card className="w-full max-w-md">
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Typography className="text-[16px] font-semibold text-[#474747]">
                  Add {attachmentType.charAt(0).toUpperCase() + attachmentType.slice(1)} Attachment
                </Typography>
                <button
                  onClick={() => setShowAttachmentModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimes className="text-[16px]" />
                </button>
              </div>

              <div className="space-y-4">
                {attachmentType === 'upload' && (
                  <div>
                    <Typography className="text-[14px] font-medium text-[#474747] mb-2">
                      Select File *
                    </Typography>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="*/*"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 bg-[#3DA5F4] text-white rounded-lg hover:bg-[#2B8FD4] transition-colors text-[12px]"
                    >
                      <FaUpload className="text-[12px]" />
                      Choose File
                    </Button>
                    {attachmentData.file && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <Typography className="text-[12px] text-green-800">
                          Selected: {attachmentData.file.name}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}

                {attachmentType === 'link' && (
                  <div>
                    <Typography className="text-[14px] font-medium text-[#474747] mb-2">
                      Document Link *
                    </Typography>
                    <Input
                      placeholder="Enter valid link (e.g., https://example.com)"
                      value={attachmentData.url}
                      onChange={(e) => setAttachmentData(prev => ({ ...prev, url: e.target.value }))}
                      className="!border !border-gray-300 bg-white text-blue-gray-700 shadow-lg shadow-blue-gray-900/5 ring-4 ring-transparent placeholder:text-blue-gray-500 focus:!border-[#3DA5F4] focus:!border-t-[#3DA5F4] focus:ring-[#3DA5F4]/20"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    onClick={() => setShowAttachmentModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAttachmentSubmit}
                    disabled={
                      (attachmentType === 'upload' && !attachmentData.file) ||
                      (attachmentType === 'link' && (!attachmentData.url || attachmentData.url.trim() === ''))
                    }
                    className="px-4 py-2 bg-[#3DA5F4] text-white rounded-lg hover:bg-[#2B8FD4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Attachment
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  )
}

export default AddCourseModal

