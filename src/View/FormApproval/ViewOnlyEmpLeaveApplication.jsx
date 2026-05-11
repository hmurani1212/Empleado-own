import React, { useState, useEffect } from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import leavesPlannerApi from '../../Model/Data/LeavesPlanner/LeavesPlanner'

const ViewOnlyEmpLeaveApplication = (props) => {
    const {
        leaveApplcationValue,
        handleApplicationChange,
        generateLeaveDays,
        handleLeaveTypeChange,
        handleHalfDayChange,
        employeeDefinedLeaves = {},
        paidLeaveConfigEnabled = false,
        isReadOnly = false
    } = props
    
    // State for paid leaves config
    const [paidLeavesConfig, setPaidLeavesConfig] = useState(null)
    const [leaveTypeOptions, setLeaveTypeOptions] = useState([
        { value: '', label: '-- Choose leave adjustment --' },
        { value: '2', label: 'Leave without pay' }
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
                
                // Update leave type options based on config + employee-defined leaves (same as live leave app)
                const options = [
                    { value: "", label: "-- Choose leave adjustment --" },
                    ...Object.entries(employeeDefinedLeaves || {}).map(([id, name]) => ({
                        value: id,
                        label: name
                    })),
                    { value: "2", label: "Leave without pay" },
                    ...(configValue === "1" || paidLeaveConfigEnabled ? [{ value: "1", label: "Paid leave" }] : [])
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(employeeDefinedLeaves), paidLeaveConfigEnabled])

    // In read-only preview, auto-generate adjusted day rows so user sees same fields as leave form.
    useEffect(() => {
        if (
            isReadOnly &&
            leaveApplcationValue?.leaveFrom &&
            leaveApplcationValue?.leaveUpto &&
            (!Array.isArray(leaveApplcationValue?.leaveDays) || leaveApplcationValue.leaveDays.length === 0)
        ) {
            generateLeaveDays()
        }
    }, [
        isReadOnly,
        leaveApplcationValue?.leaveFrom,
        leaveApplcationValue?.leaveUpto,
        leaveApplcationValue?.leaveDays,
        generateLeaveDays
    ])

    const readonlyFieldClass = isReadOnly
        ? 'bg-gray-200 text-gray-700 border-gray-400 cursor-not-allowed'
        : 'text-[#333333] border-gray-500';

    // UI-only rows for preview: always show at least one disabled row after Adjust button.
    const previewLeaveRows =
        Array.isArray(leaveApplcationValue?.leaveDays) && leaveApplcationValue.leaveDays.length > 0
            ? leaveApplcationValue.leaveDays
            : [{
                date: leaveApplcationValue?.leaveFrom || "",
                selectedLeaveType: null,
                isHalfDay: false
            }];
    
    return (
        <div className='space-y-4 p-4'>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Subject*</label>  
                <input 
                    className={`w-full text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${readonlyFieldClass}`}
                    type='text' 
                    name='subject' 
                    value={leaveApplcationValue.subject}
                    placeholder='Subject'
                    onChange={handleApplicationChange}
                    disabled={isReadOnly}
                />
            </div>
            <div className='flex-1 flex flex-col px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Application Body*</label>
                <textarea 
                    rows="7" 
                    className={`text-[12px] rounded-md py-[10px] px-[17px] border outline-none resize-none ${readonlyFieldClass}`}
                    placeholder='Application Detail'
                    name='application'
                    value={leaveApplcationValue.application}
                    onChange={handleApplicationChange}
                    disabled={isReadOnly}
                />
            </div>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Leave From*</label>  
                <input 
                    className={`w-full text-[12px] rounded-md py-[8px] px-[17px] border outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${readonlyFieldClass}`}
                    type='date' 
                    name='leaveFrom'
                    value={leaveApplcationValue.leaveFrom} 
                    onChange={handleApplicationChange}
                    disabled={isReadOnly}
                />
            </div>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Leave Upto*</label>  
                <input 
                    className={`w-full text-[12px] rounded-md py-[8px] px-[17px] border outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${readonlyFieldClass}`}
                    type='date' 
                    name='leaveUpto'
                    value={leaveApplcationValue.leaveUpto} 
                    onChange={handleApplicationChange}
                    disabled={isReadOnly}
                />
            </div>
            <div className='space-y-2'>
                <button 
                    type="button"
                    onClick={generateLeaveDays}
                    className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                    disabled={isReadOnly}
                >
                    Adjust
                </button>
            </div>
            <div className='space-y-2'>
                <h3 className='text-[#292929] text-[15px] font-semibold'>Leave Days</h3>
                {previewLeaveRows.map((ele, i)=>(
                    <div key={i} className='flex items-end gap-4 border border-gray-200 rounded-md p-3 bg-white'>
                        <div className='space-y-2 flex-1'>
                            <label className='text-[#698592] text-[12px]'>Date</label>
                            <input 
                                className={`w-full text-[12px] rounded-md py-[8px] px-[12px] border outline-none ${readonlyFieldClass}`}
                                value={ele?.date || ""}
                                placeholder="mm/dd/yyyy"
                                disabled
                                readOnly
                            />
                        </div>
                        <div className='space-y-2 flex-1'>
                            <label className='text-[#698592] text-[12px]'>Adjust In</label>
                            <CustomSelect 
                                placeHolderTitle='Choose leave adjustment'
                                value={ele?.selectedLeaveType || null}
                                options={leaveTypeOptions}
                                onChangeHandler={(selectedOption) => {
                                    if (!isReadOnly) handleLeaveTypeChange(i, selectedOption)
                                }}
                                customStyles={false}
                                disabled={true}
                            />
                        </div>
                        <div className='space-y-2 flex items-center pb-2'>
                            <label className='text-[#698592] text-[12px] whitespace-nowrap'>Half Day</label>
                            <input 
                                type='checkbox'
                                className='ml-2'
                                checked={ele?.isHalfDay || false}
                                onChange={(e) => {
                                    if (!isReadOnly) handleHalfDayChange(i, e.target.checked)
                                }}
                                disabled={true}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className='space-y-2 flex-1'>
                <label className='text-[#698592] text-[12px]'>Attach File</label>  
                <input 
                    className={`w-full text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${readonlyFieldClass}`}
                    type='file' 
                    name='file'
                    onChange={handleApplicationChange}
                    disabled={isReadOnly}
                />
            </div>
            <div className='space-y-2 flex justify-end pt-2'>
                <button
                    type="button"
                    className='px-4 py-2 bg-blue-600 text-white rounded-md opacity-60 cursor-not-allowed'
                    disabled
                >
                    Submit
                </button>
            </div>
        </div>
    )
}

export default ViewOnlyEmpLeaveApplication
