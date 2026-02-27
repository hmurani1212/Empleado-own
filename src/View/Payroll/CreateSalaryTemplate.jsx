import { Button } from '@material-tailwind/react'
import React, { useState, useEffect, useCallback } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'
import { getContentByLabel } from '../../services/getContentService'
import { gettingDepartmentsServices } from '../../services/__frequentApiServices'
import { showToast } from '../../Components/Toaster/Toaster'

const CreateSalaryTemplate = () => {
  const { copyBranchesData, handleCreateSalaryTemplate, loading } = usePayroll()

  const [createValues, setCreateValues] = useState({
    name: '',
    amount: '',
    branch: null,
    department: null
  })

  const [departmentOptions, setDepartmentOptions] = useState([])
  const [departmentLoading, setDepartmentLoading] = useState(false)

  // Content drawer (info icon) – right-side panel with ENGLISH/URDU
  const [contentDrawerOpen, setContentDrawerOpen] = useState(false)
  const [contentData, setContentData] = useState(null)
  const [contentLang, setContentLang] = useState('ENGLISH')
  const [contentLoading, setContentLoading] = useState(false)

  const handleChangeCreateValues = (e) => {
    const { name, value } = e.target
    setCreateValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleChangeBranchCreate = (selectedOption) => {
    setCreateValues((prev) => ({ ...prev, branch: selectedOption, department: null }))
  }

  const handleChangeDepartmentCreate = (selectedOption) => {
    setCreateValues((prev) => ({ ...prev, department: selectedOption }))
  }

  // When branch is selected, fetch departments (branch_id: 0 = All Branches → all org departments)
  useEffect(() => {
    if (!createValues.branch) {
      setDepartmentOptions([])
      return
    }
    const branchId = createValues.branch.value === 0 || createValues.branch.value === '0' ? 0 : createValues.branch.value
    setDepartmentLoading(true)
    setDepartmentOptions([])
    gettingDepartmentsServices(branchId)
      .then((options) => setDepartmentOptions(options || []))
      .catch(() => setDepartmentOptions([]))
      .finally(() => setDepartmentLoading(false))
  }, [createValues.branch])

  const openContentDrawer = useCallback(async (contentLabel) => {
    setContentDrawerOpen(true)
    setContentLang('ENGLISH')
    setContentLoading(true)
    setContentData(null)
    try {
      const res = await getContentByLabel(contentLabel)
      if (res?.STATUS === 'SUCCESSFUL' && res?.DATA?.[0]?.contents?.length) {
        setContentData(res.DATA[0])
      } else {
        showToast('Content not available', 'error')
        setContentDrawerOpen(false)
      }
    } catch (err) {
      showToast('Failed to load content', 'error')
      setContentDrawerOpen(false)
    } finally {
      setContentLoading(false)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    handleCreateSalaryTemplate(createValues)
  }

  const branchOptions = [
    { value: 0, label: 'All Branches' },
    ...(copyBranchesData?.map((branch) => ({ value: branch.id, label: branch.branch_name })) || [])
  ]

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-4 pt-6">
          {/* Template Name */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-[#698592] text-[12px] font-semibold">Template Name</label>
              <FaInfoCircle
                className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4]"
                onClick={() => openContentDrawer('TEMPLATENAME_PAYROLL_EMP')}
              />
            </div>
            <input
              type="text"
              name="name"
              value={createValues.name}
              onChange={handleChangeCreateValues}
              placeholder="Enter template name"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] text-[#474747] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3DA5F4] focus:border-transparent"
            />
          </div>

          {/* Salary Amount */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-[#698592] text-[12px] font-semibold">Salary Amount</label>
              <FaInfoCircle
                className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4]"
                onClick={() => openContentDrawer('SALARYAMOUNT_PAYROLL_EMP')}
              />
            </div>
            <input
              type="number"
              name="amount"
              value={createValues.amount}
              onChange={handleChangeCreateValues}
              placeholder="Enter salary amount"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] text-[#474747] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3DA5F4] focus:border-transparent"
            />
          </div>

          {/* Branch */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-[#698592] text-[12px] font-semibold">For which branch</label>
              <FaInfoCircle
                className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4]"
                onClick={() => openContentDrawer('BRANCH_PAYROLL_EMP')}
              />
            </div>
            <CustomSelect
              placeHolderTitle="Select Branch"
              value={createValues.branch}
              options={branchOptions}
              onChangeHandler={handleChangeBranchCreate}
              customStyles={false}
            />
          </div>

          {/* Department */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-[#698592] text-[12px] font-semibold">For which department</label>
              <FaInfoCircle
                className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4]"
                onClick={() => openContentDrawer('DEPARTMENT_PAYROLL_EMP')}
              />
            </div>
            <CustomSelect
              placeHolderTitle={departmentLoading ? 'Loading departments...' : 'Select Department'}
              value={createValues.department}
              options={departmentOptions}
              onChangeHandler={handleChangeDepartmentCreate}
              customStyles={false}
            />
          </div>

          <div>
            <SubmitButton loading={loading} title="Create Template" />
          </div>
        </div>
      </form>

      {/* Content info drawer (right side) – ENGLISH / URDU */}
      <PortalDrawer
        open={contentDrawerOpen}
        closeDrawer={() => setContentDrawerOpen(false)}
        direction="right"
        widthSize="45vw"
        title={
          contentData?.contents?.find((c) => c.lang === contentLang)?.main_heading ?? 'Template Name'
        }
        compo={
          <div className="flex flex-col gap-4">
            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contentData?.contents?.length ? (
              <>
                <div
                  className="text-gray-800 text-sm font-Urbanist leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      contentData.contents.find((c) => c.lang === contentLang)?.content ??
                      contentData.contents.find((c) => c.lang === 'ENGLISH')?.content ??
                      ''
                  }}
                />
                <div className="flex gap-2 mt-4 border-t border-gray-200 pt-4">
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${
                      contentLang === 'ENGLISH' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setContentLang('ENGLISH')}
                  >
                    ENGLISH
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${
                      contentLang === 'URDU' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setContentLang('URDU')}
                  >
                    URDU
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        }
      />
    </>
  )
}

export default CreateSalaryTemplate
