import { Radio, Typography, Button } from '@material-tailwind/react'
import React, { useState } from 'react'
import useSwapPolciyServices from '../../ViewModel/HRPoliciesViewModel/swapPolicyServices'
import OneToOne from './OneToOne'
import ManyToOne from './ManyToOne'
import { getContentByLabel } from '../../services/getContentService'
import { showToast } from '../../Components/Toaster/Toaster'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'

const SwapPolicies = () => {
  const { handleSwapPolicyState, swapPolicyState,
    handleSelectChange, swapPolicyValue, handleChange,handleCheckbox,
    handleOneToOnePolicy,handleManyToOnePolicy,handleSelectMutiplePolicy
   } = useSwapPolciyServices()

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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
        <div className="flex items-center gap-6 mb-8 border-b border-gray-50 pb-6">
            <h3 className="text-base font-semibold text-gray-900 font-poppins">Swap Type:</h3>
            <div className="flex items-center gap-6">
                <label className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg transition-all ${swapPolicyState === 1 ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                    <Radio 
                        name="swapType"
                        color="blue" 
                        checked={swapPolicyState === 1} 
                        onChange={() => handleSwapPolicyState({ target: { value: '1' } })}
                        className="p-0 transition-all hover:before:opacity-0"
                        label={
                            <Typography className="font-poppins font-medium text-sm text-gray-700 ml-2">
                                One to One
                            </Typography>
                        }
                    />
                </label>
                
                <label className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg transition-all ${swapPolicyState === 2 ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                    <Radio 
                        name="swapType"
                        color="blue" 
                        checked={swapPolicyState === 2} 
                        onChange={() => handleSwapPolicyState({ target: { value: '2' } })}
                        className="p-0 transition-all hover:before:opacity-0"
                        label={
                            <Typography className="font-poppins font-medium text-sm text-gray-700 ml-2">
                                Many to Many
                            </Typography>
                        }
                    />
                </label>
            </div>
        </div>

      <div className='flex flex-col gap-6'>
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <div className="text-blue-500 mt-0.5">ℹ️</div>
            <p className='text-xs font-medium text-blue-800 font-poppins leading-relaxed'>
                Please do swap a policy at the end of shift OR schedule them to be swapped at the end of shift timings to avoid attendance discrepancies.
            </p>
        </div>
        
        {swapPolicyState === 1 ?
          <div className="animate-fade-in-up">
            <OneToOne 
              handleSelectChange ={handleSelectChange}
              swapPolicyValue ={swapPolicyValue}
              handleChange ={handleChange}
              handleCheckbox ={handleCheckbox}
              handleOneToOnePolicy ={handleOneToOnePolicy}
              openContentDrawer={openContentDrawer}
            />
          </div>  
          :
          <div className="animate-fade-in-up">
            <ManyToOne 
                handleSelectChange ={handleSelectChange}
                swapPolicyValue ={swapPolicyValue}
                handleChange ={handleChange}
                handleCheckbox ={handleCheckbox}
                handleManyToOnePolicy ={handleManyToOnePolicy}
                handleSelectMutiplePolicy ={handleSelectMutiplePolicy}
                openContentDrawer={openContentDrawer}
              />
          </div>
        }
      </div>
    </div>

    <PortalDrawer
      open={contentDrawerOpen}
      closeDrawer={() => setContentDrawerOpen(false)}
      direction="right"
      widthSize="45vw"
      title={
        contentData?.contents?.find((c) => c.lang === contentLang)?.main_heading ?? ''
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
                    '',
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
    </div>
  )
}

export default SwapPolicies