import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { customDivision, customGrade, customStudyType } from '../../services/EmpServices'
import { Button, Radio, Typography } from '@material-tailwind/react'

const AddEditEducation = (props) => {
    const { academicsValue, handleSelectAcademic, handleAcademicInputChange, handleSubmitAcademics} = props
  return (
    <div className='space-y-2'>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Degree</label>
                <CustomSelect 
                    placeHolderTitle = 'Degree'
                    value={
                        academicsValue?.degree_list?.find(option => option.id === academicsValue.degree_id) 
                        ? { 
                            value: academicsValue.degree_list.find(option => option.id === academicsValue.degree_id).id, 
                            label: academicsValue.degree_list.find(option => option.id === academicsValue.degree_id).name
                          }
                        : null
                    }
                    options={academicsValue?.degree_list?.map((type) => ({ value: type.id, label:type.name}))} 
                    onChangeHandler={(selectedOption) => handleSelectAcademic(selectedOption, 'degree_id')}
                    customStyles={false}
                    
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Passing Year</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        academicsValue?.validationErrors?.passing_year ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='text' 
                    value={ academicsValue?.passing_year}
                    name='passing_year' 
                    onChange={handleAcademicInputChange}
                />
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Degree Title/Major Subjects</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        academicsValue?.validationErrors?.major_subject ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='text' 
                    value={academicsValue?.major_subject} 
                    name='major_subject' 
                    onChange={handleAcademicInputChange}
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Study Type</label>
                <div>
                    {customStudyType.map((ele, i)=>(
                        <Radio 
                            label={
                                <Typography
                                    color="blue-gray"
                                    className="text-[12px]"
                                >{ele.title}</Typography>
                            }
                            key={i}
                            color='blue'
                            size="sm"
                            name='study_type'
                            onChange={handleAcademicInputChange}
                            value={ele.value}
                            checked={academicsValue.study_type === ele.value}
                        />
                    ))}
                </div>
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Obtained Marks/CGPA</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        academicsValue?.validationErrors?.obtained_marks ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='text' 
                    value={academicsValue?.obtained_marks} 
                    name='obtained_marks' 
                    onChange={handleAcademicInputChange}
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Total Marks/GPA</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        academicsValue?.validationErrors?.total_marks ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='text' 
                    value={academicsValue?.total_marks} 
                    name='total_marks' 
                    onChange={handleAcademicInputChange}
                />
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Grade</label>
                <CustomSelect 
                    placeHolderTitle = 'Grade'
                      value={
                          customGrade?.find(option => option.value ===  academicsValue.grade) 
                          ? { value: customGrade?.find(option => option.value ===  academicsValue.grade).value, 
                              label: customGrade.find(option => option.value === academicsValue.grade).name

                          }
                          :
                          academicsValue.grade
                      }
                    options={customGrade?.map((type) => ({ value: type.value, label:type.name}))} 
                    onChangeHandler={(selectedOption) => handleSelectAcademic(selectedOption, 'grade')}
                    customStyles={false}
                    
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Division <span className='text-gray-400'>(Optional)</span></label>
                <CustomSelect 
                    placeHolderTitle = 'Division'
                      value={
                          customDivision?.find(option => option.value ===  academicsValue.division) 
                          ? { value: customDivision?.find(option => option.value ===  academicsValue.division).value, 
                              label: customDivision.find(option => option.value === academicsValue.division).name

                          }
                          :
                         academicsValue.division
                      }
                    // value={
                    //     academicsValue.division
                    // }
                    options={customDivision?.map((type) => ({ value: type.value, label:type.name}))} 
                      onChangeHandler={(selectedOption) => handleSelectAcademic(selectedOption, 'division')}
                    customStyles={false}
                    
                />
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Board/University</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        academicsValue?.validationErrors?.board_univ ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='text' 
                    value={academicsValue?.board_univ} 
                    name='board_univ' 
                    onChange={handleAcademicInputChange}
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Remarks <span className='text-gray-400'>(Optional)</span></label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={academicsValue?.remarks} 
                    name='remarks' 
                    onChange={handleAcademicInputChange}
                />
            </div>
        </div>
        <div className='flex justify-end'>
            <Button 
                onClick={handleSubmitAcademics} 
                variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
                loading={academicsValue.loading}
            >
                <span>{academicsValue.addState ? 'Submit' :'Update'}</span>
            </Button>
        </div>
    </div>
  )
}

export default AddEditEducation