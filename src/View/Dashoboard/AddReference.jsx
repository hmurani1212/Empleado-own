import { Button } from '@material-tailwind/react'
import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { customSource } from '../../services/EmpServices'

const AddReference = (props) => {
    const {referenceValue, handleSelectReference, handleReferenceInputChange, handleSubmitReference} = props
    return (
    
    <div className='space-y-2'>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Name</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={ referenceValue?.ref_name}
                    name='ref_name' 
                    onChange={handleReferenceInputChange}
                />
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Relation</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={ referenceValue?.relation}
                    name='relation' 
                    onChange={handleReferenceInputChange}
                />
            </div>
            
            
        </div>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Source</label>
                <CustomSelect 
                    placeHolderTitle = 'Source'
                    value={referenceValue.emp_ref_source}
                    options={customSource?.map((type) => ({ value: type.value, label:type.name}))} 
                    onChangeHandler={(selectedOption) => handleSelectReference(selectedOption, 'emp_ref_source')}
                    customStyles={false}
                    
                />
            </div>
        </div>
        {(referenceValue.emp_ref_source?.value || referenceValue.emp_ref_source) === '1' &&
            (
                <>
                <div className='flex items-center justify-between'>
                    <div className='flex-1 px-2 space-y-1'>
                        <label className='text-[#698592] text-[12px]'>Referal Branch</label>
                        <CustomSelect 
                            placeHolderTitle = 'Branch'
                            value = {referenceValue.branch}
                            options={referenceValue?.branchesList?.map((type) => ({ value: type.id, label:type.branch_name}))} 
                            onChangeHandler={(selectedOption) => handleSelectReference(selectedOption, 'branch')}
                            customStyles={false}
                            
                        />
                    </div>
                </div>
                <div className='flex items-center justify-between'>
                    <div className='flex-1 px-2 space-y-1'>
                        <label className='text-[#698592] text-[12px]'>Departments</label>
                        <CustomSelect 
                            placeHolderTitle = 'Departments'
                            value = {referenceValue.department}
                            options={referenceValue?.dept_list?.map((type) => ({ value: type.id, label:type.name}))} 
                            onChangeHandler={(selectedOption) => handleSelectReference(selectedOption, 'department')}
                            customStyles={false}
                            
                        />
                    </div>
                    <div className='flex-1 px-2 space-y-1'>
                        <label className='text-[#698592] text-[12px]'>Employee</label>
                        <CustomSelect 
                            placeHolderTitle = 'Employee'
                            value = {referenceValue.emp}
                            options={referenceValue?.empList?.map((type) => ({ value: type.id, label:type.name}))} 
                            onChangeHandler={(selectedOption) => handleSelectReference(selectedOption, 'emp')}
                            customStyles={false}
                            
                        />
                    </div>
                </div>
                </>
            )
        }
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Address</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={referenceValue?.address} 
                    name='address' 
                    onChange={handleReferenceInputChange}
                />
                
            </div>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Contact</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    value={referenceValue?.contact} 
                    name='contact' 
                    onChange={handleReferenceInputChange}
                />
            </div>
        </div>
        <div className='flex justify-end'>
            <Button 
                onClick={handleSubmitReference} 
                variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
                loading={referenceValue.loading}
            >
                <span>Submit</span>
            </Button>
        </div>
    </div>
  )
}

export default AddReference