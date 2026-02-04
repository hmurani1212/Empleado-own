import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { priorityData } from '../../services/__performanceServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { FaXmark } from 'react-icons/fa6'

const AddEditGoal = (props) => {
    const { performance, handleSelectGoals , addGoalValue, handleChangeAddGoal, handleNewGoal, handleRemoveEmp} = props
  return (
    <form className='space-y-3' onSubmit={handleNewGoal}>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Goal Name</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='text' 
                value={addGoalValue?.goal_name}
                name='goal_name' 
                onChange={handleChangeAddGoal}
            />
        </div>
        <div className='space-y-2'>

            <label className='text-[#698592] text-[12px]'>Performance</label>
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
            <label className='text-[#698592] text-[12px]'>Description</label>
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
  )
}

export default AddEditGoal