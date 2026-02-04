import React, { useState, useEffect } from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import leavesPlannerApi from '../../Model/Data/LeavesPlanner/LeavesPlanner'

const ViewOnlyEmpLeaveApplication = (props) => {
    const { leaveApplcationValue, handleApplicationChange, generateLeaveDays, handleLeaveTypeChange, handleHalfDayChange } = props
    
    // State for paid leaves config
    const [paidLeavesConfig, setPaidLeavesConfig] = useState(null)
    const [leaveTypeOptions, setLeaveTypeOptions] = useState([
        { value: 'annual', label: 'Annual Leave' },
        { value: 'sick', label: 'Sick Leave' },
        { value: 'without_pay', label: 'Leave without pay' }
    ])

    // Function to get paid leaves config
    const getPaidLeavesConfig = async () => {
        try {
            const response = await leavesPlannerApi.getPaidLeavesConfig()
            const data = response.data
            console.log("Paid Leaves Config Response:", response)

            if(response.status === 200 && data.STATUS === "SUCCESSFUL"){
                const configValue = data.DB_DATA?.config_value
                setPaidLeavesConfig(configValue)
                
                // Update leave type options based on config
                const options = [
                    { value: 'annual', label: 'Annual Leave' },
                    { value: 'sick', label: 'Sick Leave' },
                    ...(configValue === "1" ? [] : [{ value: 'paid', label: 'Paid leave' }]),
                    { value: 'without_pay', label: 'Leave without pay' }
                ]
                setLeaveTypeOptions(options)
                console.log("Paid leaves config value set to:", configValue)
            }
        } catch(err){
            console.log("Error fetching paid leaves config:", err)
            // Default to "0" if API fails
            setPaidLeavesConfig("0")
        }
    }

    // Load paid leaves config when component mounts
    useEffect(() => {
        getPaidLeavesConfig()
    }, [])
    
    return (
        <div className='space-y-4 p-4'>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Subject*</label>  
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
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
                    className='text-[#333333] text-[12px] rounded-md py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
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
                <button 
                    type="button"
                    onClick={generateLeaveDays}
                    className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
                >
                    Adjust
                </button>
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
                    className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='file' 
                    name='file'
                    onChange={handleApplicationChange}
                />
            </div>
        </div>
    )
}

export default ViewOnlyEmpLeaveApplication
