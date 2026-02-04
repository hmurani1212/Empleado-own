import React, { useState } from 'react'
import CustomButton from '../../../Components/CustomButton/CustomButton'

const TadaApplication = (props) => {
    const { tadaFormValue,handleChangeTADA,handleAddTadaForm } = props
    const [dateError, setDateError] = useState('')

    // Validate date range
    const validateDateRange = (leaveDate, returnDate) => {
        if (leaveDate && returnDate) {
            const leave = new Date(leaveDate)
            const returnDateObj = new Date(returnDate)
            
            if (returnDateObj <= leave) {
                setDateError('Return Date must be after Leave Date')
                return false
            } else {
                setDateError('')
                return true
            }
        }
        setDateError('')
        return true
    }

    // Enhanced change handler with date validation
    const handleDateChange = (e) => {
        const { name, value } = e.target
        handleChangeTADA(e) // Call original handler
        
        // Validate dates when either date changes
        if (name === 'leaveDate' || name === 'returnDate') {
            const leaveDate = name === 'leaveDate' ? value : tadaFormValue.leaveDate
            const returnDate = name === 'returnDate' ? value : tadaFormValue.returnDate
            validateDateRange(leaveDate, returnDate)
        }
    }

    // Enhanced form submission with date validation
    const handleFormSubmit = (e) => {
        e.preventDefault()
        
        // Validate dates before submission
        const isValidDateRange = validateDateRange(tadaFormValue.leaveDate, tadaFormValue.returnDate)
        
        if (!isValidDateRange) {
            return // Prevent form submission if dates are invalid
        }
        
        // Call original form handler if dates are valid
        handleAddTadaForm(e)
    }
  return (
   <form className='space-y-4' onSubmit={handleFormSubmit}>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>City/Cities Visited</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='text' 
                name='city' 
                value={tadaFormValue.city}
                placeholder='City Visited'
                onChange={handleChangeTADA}
            />
        </div>
        <div className='flex-1 flex flex-col px-2 space-y-1'>
            <label className='text-[#698592] text-[12px]'>Purpose of Visit</label>
            <textarea 
                rows="7" 
                className='text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                name='purpose'
                value={tadaFormValue.purpose}
                onChange={handleChangeTADA}
            />
        </div>
        <div className='flex items-center gap-3'>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Leave Date</label>  
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        dateError ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='date' 
                    name='leaveDate' 
                    value={tadaFormValue.leaveDate}
                    onChange={handleDateChange}
                />
            </div>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Time</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='time' 
                    name='leaveTime' 
                    value={tadaFormValue.leaveTime}
                    onChange={handleChangeTADA}
                />
            </div>
        </div>
        <div className='flex items-center gap-3'>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Return Date</label>  
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        dateError ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='date' 
                    name='returnDate' 
                    value={tadaFormValue.returnDate}
                    onChange={handleDateChange}
                />
            </div>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Time</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='time' 
                    name='returnTime' 
                    value={tadaFormValue.returnTime}
                    onChange={handleChangeTADA}
                />
            </div>
        </div>
        
        {/* Date Validation Error Message */}
        {dateError && (
            <div className='text-red-500 text-[12px] mt-1'>
                {dateError}
            </div>
        )}
        
        <div className='flex items-center gap-3'>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Fuel Expense</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='number' 
                    name='fuel' 
                    value={tadaFormValue.fuel}
                    onChange={handleChangeTADA}
                    placeholder='Fuel Expense'
                    min='0'
                    step='0.01'
                />
            </div>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Voucher</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='file' 
                    name='fuleVoucher' 
                    onChange={handleChangeTADA}
                />
            </div>
        </div>
        <div className='flex items-center gap-3'>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Toll Tax</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='number' 
                    name='tax' 
                    value={tadaFormValue.tax}
                    onChange={handleChangeTADA}
                    placeholder='Toll Tax'
                    min='0'
                    step='0.01'
                />
            </div>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Voucher</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='file' 
                    name='taxVoucher' 
                    onChange={handleChangeTADA}
                />
            </div>
        </div>
        <div className='flex items-center gap-3'>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Misc</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='number' 
                    name='misc' 
                    value={tadaFormValue.misc}
                    onChange={handleChangeTADA}
                    placeholder='Misc'
                    min='0'
                    step='0.01'
                />
            </div>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Voucher</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='file' 
                    name='miscVoucher' 
                    onChange={handleChangeTADA}
                />
            </div>
        </div>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Hotel Charges</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='number' 
                name='hotelCharges' 
                value={tadaFormValue.hotelCharges}
                onChange={handleChangeTADA}
                placeholder='Hotel Charges'
                min='0'
                step='0.01'
            />
        </div>
        <div>
            <span className='text-[#698592] text-[12px]'>Daily Allowance (if any)</span>
        </div>
        <div className='flex items-center gap-3'>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Daily Allowance Rate</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='number' 
                    name='daRate' 
                    value={tadaFormValue.daRate}
                    onChange={handleChangeTADA}
                    placeholder='Daily Allowance Rate'
                    min='0'
                    step='0.01'
                />
            </div>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>DA Days</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='number' 
                    name='daDays' 
                    value={tadaFormValue.daDays}
                    onChange={handleChangeTADA}
                    placeholder='DA Days'
                    min='0'
                    step='1'
                />
            </div>
        </div>

        <div>
            <CustomButton 
                title='Submit'
                loading={tadaFormValue.loading}
            />
        </div>
   </form>
  )
}

export default TadaApplication