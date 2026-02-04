import React, { useState, useEffect } from 'react'
import { Button, Input, Option, Select, Textarea } from '@material-tailwind/react'
import useNewApplication from '../../ViewModel/ApplicationViewModel/addNewApplicationServices'
import { getAllMonths, getAllYears } from '../../services/__appServicesData'
import useStore from '../../Store/store'
import { showToast } from '../../Components/Toaster/Toaster'

function MedicalApp(props = {}) {
  const {
    handleMedicalApplication = () => { },
    handleChangeMedicalApp = () => { },
    medicalAppValue = {},
    handleSelectChangeMedicalApp = () => { },
    handleFileUpload = () => { },
    uploadedFileUrl = '',
    isUploading = false
  } = props || {}

  // Get payroll functions from store
  const gettingSalaryTemp = useStore((state) => state.gettingSalaryTemp)
  const allSalaryTemp = useStore((state) => state.allSalaryTemp)
  const branches_payroll = useStore((state) => state.branches_payroll)
  const getAllBranchesPayroll = useStore((state) => state.getAllBranchesPayroll)

  const months = getAllMonths() || []
  const years = getAllYears() || []

  // Local state for salary template filters
  const [salaryTemplateFilters, setSalaryTemplateFilters] = useState({
    branch_id: null,
    search: '',
    page: 0,
    limit: 10
  })

  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  // Load branches on component mount
  useEffect(() => {
    loadBranches()
  }, [])

  // Load salary templates when branch changes
  useEffect(() => {
    if (salaryTemplateFilters.branch_id) {
      loadSalaryTemplates()
    }
  }, [salaryTemplateFilters.branch_id, salaryTemplateFilters.search])

  const loadBranches = async () => {
    try {
      await getAllBranchesPayroll(true)
    } catch (error) {
      console.error('Error loading branches:', error)
      showToast('Failed to load branches', 'error')
    }
  }

  const loadSalaryTemplates = async () => {
    if (!salaryTemplateFilters.branch_id) return

    setIsLoadingTemplates(true)
    try {
      await gettingSalaryTemp(
        salaryTemplateFilters.branch_id,
        salaryTemplateFilters.search,
        salaryTemplateFilters.page,
        salaryTemplateFilters.limit,
        true
      )
    } catch (error) {
      console.error('Error loading salary templates:', error)
      showToast('Failed to load salary templates', 'error')
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const handleBranchChange = (selectedOption) => {
    setSalaryTemplateFilters(prev => ({
      ...prev,
      branch_id: selectedOption?.value || null,
      page: 0
    }))
  }

  const handleTemplateSearchChange = (e) => {
    const searchValue = e.target.value
    setSalaryTemplateFilters(prev => ({
      ...prev,
      search: searchValue,
      page: 0
    }))
  }

  const handleRefreshTemplates = async () => {
    if (!salaryTemplateFilters.branch_id) {
      showToast('Please select a branch first', 'warning')
      return
    }

    setIsLoadingTemplates(true)
    try {
      await gettingSalaryTemp(
        salaryTemplateFilters.branch_id,
        salaryTemplateFilters.search,
        salaryTemplateFilters.page,
        salaryTemplateFilters.limit,
        true // Force reload
      )
      showToast('Salary templates refreshed successfully!', 'success')
    } catch (error) {
      console.error('Error refreshing salary templates:', error)
      showToast('Failed to refresh salary templates', 'error')
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  return (
    <>
      {/* Salary Template Section */}

      <div className='w-full bg-white p-4 sm:p-6 rounded-xl sm:rounded-lg shadow-md'>
        <h3 className='text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6'>Medical Allowance Application</h3>

        <form onSubmit={handleMedicalApplication} className='flex flex-col gap-4 sm:gap-6'>
          <div className='w-full'>
            <Input
              color="blue"
              className='!h-11 !rounded-6'
              label="Subject"
              placeholder='Enter application subject'
              name='subject'
              value={medicalAppValue?.subject || ''}
              onChange={handleChangeMedicalApp}
              required
            />
          </div>

          <div className='w-full'>
            <Textarea
              color="blue"
              className='!h-11 !rounded-6'
              label="Application Body"
              name='app_body'
              value={medicalAppValue?.app_body || ''}
              onChange={handleChangeMedicalApp}
              required
            />
          </div>

          <div className='w-full'>
            <Input
              color="blue"
              type='number'
              step="0.01"
              className='!h-11 !rounded-6'
              label="Amount Claimed"
              placeholder='Enter amount (e.g., 250.75)'
              name='amount'
              value={medicalAppValue?.amount || ''}
              onChange={handleChangeMedicalApp}
              required
            />
          </div>

          <div className='flex flex-col sm:flex-row justify-between gap-4'>
            <div className='w-full sm:w-[47%]'>
              <Select
                color="blue"
                label='Claiming Month'
                className='h-11'
                placeholder='Select Month'
                value={medicalAppValue?.claim_month || ''}
                onChange={(value) => handleSelectChangeMedicalApp('claim_month', value)}
              >
                {(months || []).map((month) => (
                  <Option key={month.id} value={month.id}>{month.title}</Option>
                ))}
              </Select>
            </div>
            <div className='w-full sm:w-[47%]'>
              <Select
                color="blue"
                label='Claiming Year'
                className='h-11'
                placeholder='Select Year'
                value={medicalAppValue?.claim_year || ''}
                onChange={(value) => handleSelectChangeMedicalApp('claim_year', value)}
              >
                {(years || []).map((year, i) => (
                  <Option key={i} value={year}>{year}</Option>
                ))}
              </Select>
            </div>
          </div>

          <div className='w-full'>
            <Input
              type='file'
              className='!h-11 !rounded-6'
              label="Attachment (Receipts/Documents)"
              name='attachment'
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  await handleFileUpload(file);
                }
              }}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              disabled={isUploading}
            />
            <small className="text-gray-500 text-xs mt-1 block">
              Upload medical receipts or supporting documents (PDF, JPG, PNG, DOC)
            </small>
            {isUploading && (
              <div className="mt-2 text-blue-600 text-sm">
                Uploading file... Please wait.
              </div>
            )}
            {uploadedFileUrl && (
              <div className="mt-2 text-green-600 text-sm">
                File uploaded successfully!
              </div>
            )}
          </div>

          <div className='flex justify-end pt-4'>
            <Button
              type="submit"
              color="blue"
              className='px-6 py-2 rounded-lg capitalize font-medium text-sm'
              size="lg"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default MedicalApp