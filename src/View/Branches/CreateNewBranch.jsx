import { Input, Button, Typography } from '@material-tailwind/react'
import React, { useCallback, useMemo, useState } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import useBranches2 from '../../ViewModel/Brach2ViewModel/BranchesServices2'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'
import { getContentByLabel } from '../../services/getContentService'
import { showToast } from '../../Components/Toaster/Toaster'

function CreateNewBranch(props) {
  const { closeBranchDrawer } = props
  const { allCountries, newBranchValues, onChangeCountry, handleNewBranch, addNewBranch, isLoading } = useBranches2()

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false)
  const [contentData, setContentData] = useState(null)
  const [contentLang, setContentLang] = useState('ENGLISH')
  const [contentLoading, setContentLoading] = useState(false)

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

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    return (
      newBranchValues.branch_name?.trim() !== '' &&
      newBranchValues.branch_address?.trim() !== '' &&
      newBranchValues.phone_no?.trim() !== '' &&
      newBranchValues.email_address?.trim() !== '' &&
      newBranchValues.country_code?.value &&
      newBranchValues.currency?.trim() !== ''
    );
  }, [newBranchValues]);

  return (
    <div className='p-6'>
      <form className='flex flex-col gap-6' onSubmit={(e) => addNewBranch(e, closeBranchDrawer)}>
        <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Typography variant="small" color="blue-gray" className="font-medium font-poppins">
                  Branch Name <span className="text-red-500">*</span>
                </Typography>
                <FaInfoCircle
                  className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0"
                  onClick={() => openContentDrawer('BRANCHNAME_BRANCHES_EMP')}
                />
              </div>
              <Input
                size="lg"
                placeholder="e.g. Head Office"
                className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={newBranchValues.branch_name}
                name='branch_name'
                onChange={handleNewBranch}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Typography variant="small" color="blue-gray" className="font-medium font-poppins">
                  Branch Address <span className="text-red-500">*</span>
                </Typography>
                <FaInfoCircle
                  className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0"
                  onClick={() => openContentDrawer('BRANCHADDRESS_BRANCHES_EMP')}
                />
              </div>
              <Input
                size="lg"
                placeholder="e.g. 123 Main St, City, Country"
                className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={newBranchValues.branch_address}
                name='branch_address'
                onChange={handleNewBranch}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Typography variant="small" color="blue-gray" className="font-medium font-poppins">
                      Phone Number <span className="text-red-500">*</span>
                    </Typography>
                    <FaInfoCircle
                      className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0"
                      onClick={() => openContentDrawer('PHONENO_BRANCHES_EMP')}
                    />
                  </div>
                  <Input
                    size="lg"
                    placeholder="e.g. +1 234 567 8900"
                    className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    value={newBranchValues.phone_no}
                    name='phone_no'
                    onChange={handleNewBranch}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Typography variant="small" color="blue-gray" className="font-medium font-poppins">
                      Email Address <span className="text-red-500">*</span>
                    </Typography>
                    <FaInfoCircle
                      className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0"
                      onClick={() => openContentDrawer('EMAILADDRESS_BRANCHES_EMP')}
                    />
                  </div>
                  <Input
                    size="lg"
                    type="email"
                    placeholder="e.g. branch@company.com"
                    className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    value={newBranchValues.email_address}
                    name='email_address'
                    onChange={handleNewBranch}
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                    Country <span className="text-red-500">*</span>
                  </Typography>
                  <CustomSelect 
                    placeHolderTitle= 'Select Country'
                    value={newBranchValues?.country_code}
                    options={allCountries?.map((country_code) => ({ value: country_code.id, label: country_code.country_name }))} 
                    onChangeHandler={(selectedOption, e) => onChangeCountry(selectedOption, 'country_code', e)}
                    customStyles={false}
                  />
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                    Currency <span className="text-red-500">*</span>
                  </Typography>
                  <Input
                    size="lg"
                    placeholder="e.g. USD"
                    className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    value={newBranchValues.currency}
                    name='currency'
                    onChange={handleNewBranch}
                    // disabled // Typically currency is auto-selected based on country, but leaving editable if needed
                    readOnly
                  />
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
           <Button
              variant="text"
              color="gray"
              onClick={closeBranchDrawer}
              className="font-poppins normal-case cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className={`font-poppins normal-case px-6 cursor-pointer ${isFormValid ? 'bg-bgBlue shadow-blue-500/20' : 'bg-blue-200 shadow-none'}`}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Branch'}
            </Button>
        </div>
      </form>

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
    </div>
  )
}

export default CreateNewBranch
