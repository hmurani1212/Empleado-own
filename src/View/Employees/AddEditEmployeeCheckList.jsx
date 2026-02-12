import React from 'react'
import { empCheckListPersonResponsibleData, empCheckListRequestInputData, employeeCheckListTypeData } from '../../services/__empProfileServices'
import { Radio, Typography } from '@material-tailwind/react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { FaPlus, FaXmark } from 'react-icons/fa6'

const AddEditEmployeeCheckList = (props) => {
    const { handleChangeEmpCheckList,employeeCheckListValue,handleChangeRequestInfo, addNewRequestInput,removeRequestInput,
        handleSelectEmpCheckList,
        handleCheckListSearchEmp,
        saveChecklist

    } = props 

  return (
    <div className='flex gap-5'>
        <div className='flex-[.9] space-y-3 '>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>CheckList Title</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={employeeCheckListValue?.checkListTitle}
                    name='checkListTitle' 
                    onChange={handleChangeEmpCheckList}
                    placeholder='Employee Card Creation'
                />
            </div>
            <div className='flex flex-row gap-3'>
                {(employeeCheckListTypeData || []).map((ele)=>(
                    <Radio key={ele.id}
                        color='blue'
                        label={
                            <Typography className='text-black text-[12px]'>
                                {ele.title}
                            </Typography>
                        }
                        name='checkListType'
                        value={ele?.id}
                        checked={ele.value == employeeCheckListValue?.checkListType}
                        onChange={handleChangeEmpCheckList}
                    />
                ))}
            </div>
            {employeeCheckListValue?.checkListType == 2 && (
                <div className='space-y-2'>
                    <label className='text-[#698592] text-[12px]'>Department</label>
                    <CustomSelect 
                        placeHolderTitle = 'Department'
                        value={employeeCheckListValue.departmentId}
                        options={Array.isArray(employeeCheckListValue.departmentList) && employeeCheckListValue.departmentList.length > 0 ? 
                            employeeCheckListValue.departmentList.map((department) => ({ 
                                value: department.id, 
                                label: department.name
                            })) : []
                        } 
                        onChangeHandler={(selectedOption) => handleSelectEmpCheckList(selectedOption, 'departmentId')}
                        cStyle={true}
                    />
                </div>
            )}
            <div className=''>
                <label className='text-[#698592] text-[12px]'>Person Responsible</label>
                <div className='flex flex-col'>
                {(empCheckListPersonResponsibleData || []).map((ele)=>(
                    <Radio key={ele.id}
                        color='blue'
                        label={
                            <Typography className='text-black text-[12px]'>
                                {ele.title}
                            </Typography>
                        }
                        name='personResonsible'
                        value={ele?.id}
                        checked={ele.value == employeeCheckListValue?.personResonsible}
                        onChange={() => handleSelectEmpCheckList(ele.value, 'personResonsible')}
                    />
                ))}
                </div>
            </div>
            {employeeCheckListValue?.personResonsible == 2 && (
                <div className='space-y-2 flex-1'>
                    <label className='text-[#698592] text-[12px]'>Employee</label>
                    <CustomSelect 
                        placeHolderTitle = 'Employee'
                        onHandleSelectSearch = {handleCheckListSearchEmp}
                        value={employeeCheckListValue?.empId}
                        options={Array.isArray(employeeCheckListValue?.empList) ? 
                            employeeCheckListValue.empList.map((emp) => ({
                                value: emp.value || emp.id,
                                label: emp.label || emp.name || 'Unknown Employee'
                            })) : []
                        } 
                        onChangeHandler={(selectedOption)=>handleSelectEmpCheckList(selectedOption, 'empId')}
                        customStyles={false}
                    />
                </div>  
            )}
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Average Completion Time (in days)</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='number' 
                    value={employeeCheckListValue?.avgCompletionTime}
                    name='avgCompletionTime' 
                    onChange={handleChangeEmpCheckList}
                    placeholder='30'
                />
            </div>
            <div>
                <CustomButton 
                    title={employeeCheckListValue?.isEdit ? 'Update' : 'Save'}
                    onClick={saveChecklist}
                />
            </div>
        </div>

        <div className='flex-1'>
            <div className='flex flex-col'>
                <span className='text-[19px] text-customBlue'>Rquest Input</span>
                <span className='text-customBlack-100 text-[12px]'>The responsible person will be asked for this info, when marking the task as completed.</span>
            </div>

            <div>
                {Array.isArray(employeeCheckListValue?.requestInput) ? 
                    employeeCheckListValue.requestInput.map((ele, i) => (
                    <div key={i}>
                        {i !== 0 && (
                            <div className='border-t border-gray-200 pt-2 mt-3 first:mt-0'>
                                <div className='flex justify-end mb-2'>
                                    <span
                                        className='bg-customRed-100 text-white w-6 h-6 flex items-center justify-center rounded cursor-pointer hover:opacity-90'
                                        onClick={() => removeRequestInput(i)}
                                        title='Remove this request input'
                                    >
                                        <FaXmark className='w-3 h-3' />
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className='space-y-2'>
                            <label className='text-[#698592] text-[12px]'>Info Title</label>
                            <input
                                className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                                type='text'
                                value={ele.infoTitle}
                                onChange={(e) => handleChangeRequestInfo(i, 'infoTitle', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className='text-[#698592] text-[12px]'>Info Type</label>
                            <div className='flex flex-row gap-3'>
                                {(empCheckListRequestInputData || []).map((inputType) => (
                                    <Radio
                                        key={inputType.id}
                                        color='blue'
                                        label={
                                            <Typography className='text-black text-[12px]'>
                                                {inputType.title}
                                            </Typography>
                                        }
                                        name={`type-${i}`} // Unique name for each radio group
                                        value={inputType.id}
                                        checked={inputType.id === ele.type}
                                        onChange={() => handleChangeRequestInfo(i, 'type', inputType.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {ele.type === 1 ? (
                            <div className='space-y-2 w-full'>
                                <textarea
                                    rows="3"
                                    name={`infoText-${i}`}
                                    className='text-[#333333] text-[12px] rounded-md py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none w-full'
                                    value={ele.infoText}
                                    onChange={(e) => handleChangeRequestInfo(i, 'infoText', e.target.value)} // Add handleInputChange for text input
                                />
                            </div>
                        ) : (
                            <div className='space-y-2'>
                                <input
                                    className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                                    type='file'
                                    name={`infoText-${i}`}
                                    onChange={(e) => handleChangeRequestInfo(i, 'infoText', e.target.files[0]?.name || '')}
                                />
                            </div>
                        )}
                    </div>
                
                    )) : (
                        <div className="text-gray-500 text-center py-4">
                            No request inputs configured
                        </div>
                    )
                }
            </div>

            <div className='mt-4'>
                <CustomButton 
                    title={<FaPlus />}
                    onClick={addNewRequestInput}
                />
            </div>
        </div>
    </div>
  )
}

export default AddEditEmployeeCheckList