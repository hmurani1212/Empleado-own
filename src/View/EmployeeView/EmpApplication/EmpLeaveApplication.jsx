import React from 'react'
import CustomButton from '../../../Components/CustomButton/CustomButton'
import CustomSelect from '../../../Components/CustomSelect/CustomSelect'

const EmpLeaveApplication = (props) => {
    const { leaveApplcationValue, addEmpLeaveApplication, handleApplicationChange, generateLeaveDays, handleLeaveTypeChange, handleHalfDayChange, employeeDefinedLeaves, paidLeaveConfigEnabled } = props

    // Build leave type options: placeholder, employee-defined leaves, Leave without pay (2), Paid leave (1) if config enabled
    const leaveTypeOptions = [
        { value: "", label: "-- Choose leave adjustment --" },
        ...Object.entries(employeeDefinedLeaves || {}).map(([id, name]) => ({
            value: id,
            label: name
        })),
        { value: "2", label: "Leave without pay" },
        ...(paidLeaveConfigEnabled ? [{ value: "1", label: "Paid leave" }] : [])
    ]
  return (
    <form className='space-y-4' onSubmit={addEmpLeaveApplication}>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Subject*</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='text' 
                name='subject' 
                value={leaveApplcationValue.subject}
                placeholder='Subject'
                onChange={handleApplicationChange}
            />
        </div>
        <div className='flex-1 flex flex-col px-2 space-y-1'>
            <label className='text-[#698592] text-[12px]'>Application Body*</label>
            <textarea 
                rows="7" 
                className='text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                placeholder='Application Detail'
                name='application'
                value={leaveApplcationValue.application}
                onChange={handleApplicationChange}
            />
        </div>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Leave From*</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                type='date' 
                name='leaveFrom'
                value={leaveApplcationValue.leaveFrom} 
                onChange={handleApplicationChange}
            />
        </div>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Leave Upto*</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                type='date' 
                name='leaveUpto'
                value={leaveApplcationValue.leaveUpto} 
                onChange={handleApplicationChange}
            />
        </div>
        <div className='space-y-2'>
            <CustomButton 
                type="button"
                onClick={generateLeaveDays}
                title='Adjust'
            />
        </div>
        {leaveApplcationValue?.leaveDays.length > 0  &&
            leaveApplcationValue?.leaveDays.map((ele, i)=>(
                <div key={i} className='flex items-center gap-4'>
                    <div className='space-y-2 flex-1'>
                        <label className='text-[#698592] text-[12px]'>Date</label>
                        <input 
                            className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                            value={ele?.date}
                            disabled
                        />
                    </div>
                    <div className='space-y-2 flex-1'>
                        <label className='text-[#698592] text-[12px]'>Adjust In</label>
                        <CustomSelect 
                            placeHolderTitle='Choose leave adjustment'
                            value={ele?.selectedLeaveType || null}
                            options={leaveTypeOptions}
                            onChangeHandler={(selectedOption) => handleLeaveTypeChange(i, selectedOption)}
                            customStyles={false}
                        />
                    </div>
                    <div className='space-y-2 flex items-center'>
                        <label className='text-[#698592] text-[12px]'>Half Day</label>
                        <input 
                            type='checkbox'
                            className='ml-2'
                            checked={ele?.isHalfDay || false}
                            onChange={(e) => handleHalfDayChange(i, e.target.checked)}
                        />
                    </div>
                </div>
            ))
        }
        <div className='space-y-2 flex-1'>
            <label className='text-[#698592] text-[12px]'>Attach File</label>  
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='file' 
                name='file'
                onChange={handleApplicationChange}
            />
        </div>
         <div className='space-y-2'>
            <CustomButton 
                title='submit'
            
            />
        </div>
    </form>
  )
}

export default EmpLeaveApplication