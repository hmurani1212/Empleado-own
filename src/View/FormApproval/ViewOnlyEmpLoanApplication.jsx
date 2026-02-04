import React from 'react'

const ViewOnlyEmpLoanApplication = (props) => {
    const { loanApplicationValue, handleApplicationChange } = props
    
    return (
        <div className='space-y-4 p-4'>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Subject*</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    name='subject' 
                    value={loanApplicationValue.subject}
                    placeholder='Subject'
                    onChange={handleApplicationChange}
                />
            </div>
            
            <div className='flex-1 flex flex-col px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Body*</label>
                <textarea 
                    rows="7" 
                    className='text-[#333333] text-[12px] rounded-md py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                    placeholder='Application Detail'
                    name='application'
                    value={loanApplicationValue.application}
                    onChange={handleApplicationChange}
                />
            </div>
        </div>
    )
}

export default ViewOnlyEmpLoanApplication
