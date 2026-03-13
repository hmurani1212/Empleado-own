import React, { useState } from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { priorityData } from '../../services/__performanceServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { FaXmark } from 'react-icons/fa6'
import { getContentByLabel } from '../../services/getContentService'
import { showToast } from '../../Components/Toaster/Toaster'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'
import { FaInfoCircle } from 'react-icons/fa'
import { Button } from '@material-tailwind/react'

const CONTENT_LABELS = {
  goalName: 'GOALNAME_PERFORMANCE_EMP',
  reviewCycle: 'CYCLESELECT_PERFORMANCE_EMP',
  description: 'DESCRIPTION_PERFORMANCE_EMP',
}

const AddEditGoal = (props) => {
    const { performance, handleSelectGoals , addGoalValue, handleChangeAddGoal, handleNewGoal, handleRemoveEmp} = props

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
    <form className='space-y-3' onSubmit={handleNewGoal}>
        <div className='space-y-2'>
            <div className='flex items-center gap-1.5'>
              <label className='text-[#698592] text-[12px]'>Goal Name</label>
              <FaInfoCircle className='text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0' onClick={() => openContentDrawer(CONTENT_LABELS.goalName)} />
            </div>
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='text' 
                value={addGoalValue?.goal_name}
                name='goal_name' 
                onChange={handleChangeAddGoal}
            />
        </div>
        <div className='space-y-2'>
            <div className='flex items-center gap-1.5'>
              <label className='text-[#698592] text-[12px]'>Performance</label>
              <FaInfoCircle className='text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0' onClick={() => openContentDrawer(CONTENT_LABELS.reviewCycle)} />
            </div>
            <CustomSelect 
                placeHolderTitle = 'Performance'
                cStyle = {true}
                value={performance?.find(option => option._id === addGoalValue.pID) 
                        ? { value: performance?.find(option => option._name === addGoalValue.pID)._id, 
                            label: performance?.find(option => option._id === addGoalValue.pID).name
                        }
                        : addGoalValue?.pID
                    }
                options={performance?.map((ele) => ({ value: ele._id, label:ele.name}))} 
                onChangeHandler={(selectedOption) => handleSelectGoals(selectedOption, 'pID')}
            
                
            />
        </div>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Start Date</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='date' 
                value={addGoalValue?.start_date}
                name='start_date' 
                onChange={handleChangeAddGoal}
            />
        </div>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>End Date</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='date' 
                value={addGoalValue?.end_date}
                name='end_date' 
                onChange={handleChangeAddGoal}
            />
        </div>
        <div className='flex-1 flex flex-col px-2 space-y-1'>
            <div className='flex items-center gap-1.5'>
              <label className='text-[#698592] text-[12px]'>Description</label>
              <FaInfoCircle className='text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0' onClick={() => openContentDrawer(CONTENT_LABELS.description)} />
            </div>
            <textarea 
                rows="7" 
                cols="50" 
                name="description"
                value={addGoalValue?.description}
                className='text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                onChange={handleChangeAddGoal}
            >
            </textarea>
        </div>
        <div className='flex items-center justify-between gap-2'>
            <div className='w-96'>
                <label className='text-[#698592] text-[12px]'>Employee</label>
                <CustomSelect 
                    placeHolderTitle = 'Employee'
                    cStyle = {true}
                    value={addGoalValue?.employee_id}
                    options={addGoalValue?.employees?.map((ele) => ({ value: ele.value, label:ele.label}))} 
                    onChangeHandler={(selectedOption) => handleSelectGoals(selectedOption, 'employee_id')}
                
                    
                />
            </div>
            <div className='w-96'> 
                <label className='text-[#698592] text-[12px]'>Priority</label>
                <CustomSelect 
                    placeHolderTitle = 'Priority'
                    cStyle = {true}
                    // value={addGoalValue?.priority}

                    value={priorityData?.find(option => option.title === addGoalValue.priority) 
                        ? { value: priorityData?.find(option => option.title === addGoalValue.priority).title, 
                            label: priorityData?.find(option => option.title === addGoalValue.priority).title
                        }
                        : addGoalValue?.priority
                    }
                    options={priorityData?.map((ele) => ({ value: ele.id, label:ele.title}))} 
                    onChangeHandler={(selectedOption) => handleSelectGoals(selectedOption, 'priority')}
                
                    
                />
            </div>

        </div>
        <div className='flex items-center gap-4 flex-wrap'>
        {addGoalValue?.selectedEmp?.map((ele)=>(
                <div className='flex flex-row items-center p-2 gap-2 bg-primary-100 rounded-lg cursor-pointer ' key={ele.value}>
                    <span className='text-[12px]'>{ele.label}</span>
                    <span className='h-5 w-5 text-[12px] flex items-center justify-center rounded-full bg-red-500 text-white' onClick={()=>handleRemoveEmp(ele)}><FaXmark /></span>
                </div>
            ))
        }
        </div>
        <div className='space-y-3'>
            <CustomButton 
                title={`${addGoalValue?.update ? 'Update' :'Submit'}`}
                type="Submit"
                loading={addGoalValue?.loading}
            />
        </div>

    </form>

    <PortalDrawer
      open={contentDrawerOpen}
      closeDrawer={() => setContentDrawerOpen(false)}
      direction='right'
      widthSize={620}
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

export default AddEditGoal