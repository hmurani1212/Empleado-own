import { Button, Checkbox, Typography } from '@material-tailwind/react'
import React from 'react'
import { customRepetitionUnit } from '../../services/EmpServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'

const AddEditRepetitive = (props) => {
    const { repetitiveValue, handleChangeRepetitive, handleSelectRepetitive,handleSubmitRepetitive } = props

  return (
     <div className='space-y-2'>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Job Title</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={ repetitiveValue?.duty_title}
                    name='duty_title' 
                    onChange={handleChangeRepetitive}
                />
            </div>
          
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1 w-96' >
                <label className='text-[#698592] text-[12px]'>Repetition Unit</label>
                <CustomSelect 
                    placeHolderTitle = 'Repetition Unit'
                    // value={ repetitiveValue?.repetition_unit}
                    value={
                          customRepetitionUnit?.find(option => option.value ===  repetitiveValue.repetition_unit) 
                          ? { value: customRepetitionUnit?.find(option => option.value ===  repetitiveValue.repetition_unit).value, 
                              label: customRepetitionUnit.find(option => option.value === repetitiveValue.repetition_unit).title

                          }
                          :
                         repetitiveValue.repetition_unit
                      }
                    options={customRepetitionUnit?.map((type) => ({ value: type.value, label:type.title}))} 
                    onChangeHandler={(selectedOption) => handleSelectRepetitive(selectedOption, 'repetition_unit')}
                    customStyles={false}
                    
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Reptitive Duration</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={repetitiveValue?.repetition_duration} 
                    name='repetition_duration' 
                    onChange={handleChangeRepetitive}
                />
                
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Effective From</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='date' 
                    value={ repetitiveValue?.effective_date}
                    name='effective_date' 
                    onChange={handleChangeRepetitive}
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <div className='flex items-center gap-10'>
                    <label className='text-[#698592] text-[12px]'>Effective Till</label>
                    <Checkbox
                        color='blue'
                        label={
                            <Typography className='text-[10px]'>
                                Permanent
                            </Typography>
                        }
                        size={'sm'}
                        name='permanent_duty'
                        className='w-4 h-4 rounded-md hover:before:opacity-0'
                        containerProps={{
                            className: "p-1.5",
                        }}
                        isChecked = {repetitiveValue.permanent_duty}
                        onChange={handleChangeRepetitive}
                    />
                </div>
                {!repetitiveValue.permanent_duty && 
                    <input 
                        className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                        type='date' 
                        value={ repetitiveValue?.enforce_till}
                        name='enforce_till' 
                        onChange={handleChangeRepetitive}
                    />
                }
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 flex flex-col px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Description</label>
                <textarea 
                    rows="7" 
                    // cols="50" 
                    name="description"
                    value={repetitiveValue.description}
                    className='text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                    onChange={handleChangeRepetitive}
                >
                </textarea>
            </div>
        </div>
        <div className='flex justify-end'>
            <Button 
                onClick={handleSubmitRepetitive} 
                variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
                loading={repetitiveValue.loading}
            >
                <span>{repetitiveValue.addState ? 'Submit' :'Update'}</span>
            </Button>
        </div>
    </div>
  )
}

export default AddEditRepetitive