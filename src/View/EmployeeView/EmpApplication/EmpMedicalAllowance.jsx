import React from 'react'
import { getAllMonths, getAllYears } from '../../../services/__appServicesData'
import CustomSelect from '../../../Components/CustomSelect/CustomSelect'
import CustomButton from '../../../Components/CustomButton/CustomButton'

const EmpMedicalAllowance = (props) => {
    const {handleMedicalAllowanceSubmission,medicalFormValue, handleChangeMedicalAllowance,handleSelectMedicalAllowance} = props
    const months = getAllMonths()
    const years = getAllYears()
  return (
    <form className='space-y-4' onSubmit={handleMedicalAllowanceSubmission}>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Subject</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='text' 
                name='subject' 
                value={medicalFormValue.subject}
                placeholder='Subject'
                onChange={handleChangeMedicalAllowance}
            />
        </div>
        <div className='flex-1 flex flex-col px-2 space-y-1'>
            <label className='text-[#698592] text-[12px]'>Application Body</label>
            <textarea 
                rows="7" 
                className='text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                name='applicaiton'
                value={medicalFormValue.applicaiton}
                onChange={handleChangeMedicalAllowance}
                >
            </textarea>
        </div>
        <div className='flex gap-4'>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Amount Claimed</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    name='amountClaimed' 
                    placeholder='Amount Claimed'
                    value={medicalFormValue.amountClaimed}
                    onChange={handleChangeMedicalAllowance}
                />
            </div>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Months</label>
                <CustomSelect 
                    placeHolderTitle = 'Month'
                    
                    value={medicalFormValue.month}
                    options={months?.map((month) => ({ value: month.id, label:month.title}))}                            

                    onChangeHandler={(selectedOption)=>handleSelectMedicalAllowance(selectedOption, 'month')}
                    customStyles={false}
                    
                />
            </div>
        </div>
        <div className='flex gap-4'>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Years</label>
                <CustomSelect 
                    placeHolderTitle = 'Year'
                   
                    value={medicalFormValue.year}
                    options={years?.map((year) => ({ value: year, label:year}))}                            

                    onChangeHandler={(selectedOption)=>handleSelectMedicalAllowance(selectedOption, 'year')}
                    customStyles={false}
                    
                />
            </div>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Attachement</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='file' 
                    name='attachement' 
                    onChange={handleChangeMedicalAllowance}
                />
            </div>

            
        </div>
        <div>
            <CustomButton 
                title='Submit'
                loading= {medicalFormValue.loading}
            />
        </div>
        
    </form>
  )
}

export default EmpMedicalAllowance