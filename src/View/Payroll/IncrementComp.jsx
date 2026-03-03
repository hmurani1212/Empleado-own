import { Input, Radio, Textarea, Button } from '@material-tailwind/react'
import React, { useState } from 'react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import useManageEmpSalary from '../../ViewModel/PayrollViewModel/ManageEmpSalaryServices'
import { getContentByLabel } from '../../services/getContentService'
import { showToast } from '../../Components/Toaster/Toaster'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'
import { FaInfoCircle } from 'react-icons/fa'

const CONTENT_LABELS = {
  incrementType: 'PAYROLL_INCREMENT_MODEL',
  expectedSalary: 'PAYROLL_INCREMENT_MODEL_EFFECTIVE_FROM',
  emailBody: 'SALARY_INCREMENT_EMAIL_BODY',
}

const IncrementComp = (props) => {
  const {data} = props
  const {expectedSalary, handleInputChange, updateEmpSalary,  handleUpdateEmpSalary, handleUpdateTypeChange, handleChangeUpdate, loading} = useManageEmpSalary()

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false)
  const [contentData, setContentData] = useState(null)
  const [contentLang, setContentLang] = useState('ENGLISH')
  const [contentLoading, setContentLoading] = useState(false)

  const openContentDrawer = async (contentLabel) => {
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
  }

  return (
    <>
    <div>
        <form onSubmit = {(e) => {e.preventDefault(); handleUpdateEmpSalary(e)}}>
            <div className='text-[12px] flex flex-col space-y-4 px-[1vw]'>
                <hr />
                <div>
                    <div className='flex items-center gap-1.5'>
                        <label className='text-[14px]'>Increment Type</label>
                        <FaInfoCircle className='text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0' onClick={() => openContentDrawer(CONTENT_LABELS.incrementType)} />
                    </div>
                    
                    <div className='flex gap-4'>
                        <div>
                            <Radio
                            name='type'
                            label='Increment Percentage'
                            color='blue'
                            value='percent'
                            checked={updateEmpSalary.inc_type === 'percent'}
                            onChange={handleUpdateTypeChange}
                            />
                        </div>
                        
                        <div>
                            <Radio
                            name='type'
                            label='Increment Amount'
                            color='blue'
                            value='amount'
                            checked={updateEmpSalary.inc_type === 'amount'}
                            onChange={handleUpdateTypeChange}
                            />
                        </div>
                    </div>
                    
                    {updateEmpSalary.inc_type === 'percent' && (
                        <div>
                            <Input 
                            color='blue'
                            label = 'Percent'
                            name = 'amount'
                            value={updateEmpSalary.amount}
                            onChange={handleInputChange}
                            type='number' />
                        </div>
                    )}
                    
                    {updateEmpSalary.inc_type === 'amount' && (
                        <div>
                            <Input 
                            color='blue' 
                            label='Amount'
                            name = 'amount'
                            value={updateEmpSalary.amount}
                            onChange={handleInputChange}
                            type='number'/>
                        </div>
                    )}
                </div>


                <div className='flex gap-3'>
                    <div>
                        <label className='font-semibold'>Current Salary</label>
                    </div>
                    <div>
                        <span>{data.temp_salary.toLocaleString()}</span>
                    </div>
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center gap-1.5'>
                        <label className='font-semibold'>Expected Salary</label>
                        <FaInfoCircle className='text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0' onClick={() => openContentDrawer(CONTENT_LABELS.expectedSalary)} />
                    </div>
                    <div className='flex gap-3'>
                        <div>
                            <span>{isNaN(expectedSalary) ? '0' : expectedSalary.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <Input color='blue' label='Effective from' type='date' name='effectiveFrom' value={updateEmpSalary.effectiveFrom} onChange={handleChangeUpdate}/>
                </div>

                <div>
                    <Textarea color='blue' label='Increment Detail' name='increment_detail' value={updateEmpSalary.increment_detail} onChange={handleChangeUpdate}/>
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center gap-1.5'>
                        <label className='text-[#698592] text-[12px]'>Email Body</label>
                        <FaInfoCircle className='text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0' onClick={() => openContentDrawer(CONTENT_LABELS.emailBody)} />
                    </div>
                    <Textarea color='blue' name='hr_comments' value={updateEmpSalary.hr_comments} onChange={handleChangeUpdate} placeholder='Enter email body' />
                </div>

                <div>
                    <SubmitButton loading={loading} title='Increment'/>
                </div>
                
            </div>
        </form>
    </div>

    <PortalDrawer
      open={contentDrawerOpen}
      closeDrawer={() => setContentDrawerOpen(false)}
      direction='right'
      widthSize='45vw'
      title={contentData?.contents?.find((c) => c.lang === contentLang)?.main_heading ?? ''}
      compo={
        <div className='flex flex-col gap-4'>
          {contentLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='w-8 h-8 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin' />
            </div>
          ) : contentData?.contents?.length ? (
            <>
              <div
                className='text-gray-800 text-sm font-Urbanist leading-relaxed prose prose-sm max-w-none'
                dangerouslySetInnerHTML={{
                  __html:
                    contentData.contents.find((c) => c.lang === contentLang)?.content ??
                    contentData.contents.find((c) => c.lang === 'ENGLISH')?.content ??
                    '',
                }}
              />
              <div className='flex gap-2 mt-4 border-t border-gray-200 pt-4'>
                <Button
                  size='sm'
                  className={`flex-1 font-Urbanist text-[12px] ${contentLang === 'ENGLISH' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setContentLang('ENGLISH')}
                >
                  ENGLISH
                </Button>
                <Button
                  size='sm'
                  className={`flex-1 font-Urbanist text-[12px] ${contentLang === 'URDU' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'}`}
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

export default IncrementComp