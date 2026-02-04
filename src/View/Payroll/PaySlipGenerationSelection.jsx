import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { customGenerationType, overtimeCustomData, salaryCalculationFormula, salraySubChecboxData } from '../../services/__payrollServices'
import { Button, Checkbox, Radio, Typography, Input } from '@material-tailwind/react'
import { FaPlus, FaXmark } from 'react-icons/fa6'

const PaySlipGenerationSelection = (props) => {
    const { 
        addMoreOverTime,
        managePaySlipGeneration,
        removeOverTime,
        handleOnChangePaySlipGeneration,
        handleOvertimeChange,
        handleBonusTypeChange,
        handleBonusFieldChange,
        generateBulkPayroll
    } = props

    // Bonus type options
    const bonusTypeOptions = [
        { value: 1, label: 'One Day Salary' },
        { value: 2, label: 'Fixed Amount X No of Days' },
        { value: 3, label: 'One Time Amount' }
    ];
  return (
    <div className='space-y-2'>
        <div className='px-2 space-y-2 w-80' >
            <label className='text-[#474747] text-[12px] font-medium font-Urbanist '>Please Select Payslip Generation Type</label>
            <CustomSelect
                placeHolderTitle='Please Select'
                value={managePaySlipGeneration.payslipGenType 
                    ? { value: managePaySlipGeneration.payslipGenType, label: customGenerationType.find(type => type.id === managePaySlipGeneration.payslipGenType)?.title }
                    : null
                }
                options={customGenerationType.map((type) => ({ value: type.id, label: type.title }))}
                onChangeHandler={(selectedOption) => {
                    const event = {
                        target: {
                            type: 'radio',
                            name: 'payslipGenType',
                            value: selectedOption.value
                        }
                    };
                    handleOnChangePaySlipGeneration(event);
                }}
                customStyles={false}
            />
        </div>
        
        {/* Year and Month Selection - Show only for Monthly type */}
        {managePaySlipGeneration.payslipGenType === 1 && (
            <div className='px-2 space-y-2'>
                <label className='text-[#474747] text-[12px] font-medium font-Urbanist'>Generate Payslip for the month</label>
                <div className='flex gap-2 items-center'>
                    <div className='flex flex-col gap-1'>
                        <label className='text-[#474747] text-[10px] font-medium font-Urbanist'>Year</label>
                        <select
                            name='year'
                            value={managePaySlipGeneration.year}
                            onChange={handleOnChangePaySlipGeneration}
                            className='w-32 text-[#333333] text-[12px] rounded-md py-[8px] px-[12px] border border-gray-500 outline-none'
                            required
                        >
                            <option value=''>Select</option>
                            {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className='text-[#474747] text-[10px] font-medium font-Urbanist'>Month</label>
                        <select
                            name='month'
                            value={managePaySlipGeneration.month}
                            onChange={handleOnChangePaySlipGeneration}
                            className='w-32 text-[#333333] text-[12px] rounded-md py-[8px] px-[12px] border border-gray-500 outline-none'
                            required
                        >
                            <option value=''>Select</option>
                            {[
                                {value: 1, label: 'Jan'}, {value: 2, label: 'Feb'}, {value: 3, label: 'Mar'},
                                {value: 4, label: 'Apr'}, {value: 5, label: 'May'}, {value: 6, label: 'Jun'},
                                {value: 7, label: 'Jul'}, {value: 8, label: 'Aug'}, {value: 9, label: 'Sep'},
                                {value: 10, label: 'Oct'}, {value: 11, label: 'Nov'}, {value: 12, label: 'Dec'}
                            ].map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        )}
        
        {/* Date Range Selection - Show only for Date Range type */}
        {managePaySlipGeneration.payslipGenType === 2 && (
            <div className='px-2 space-y-2'>
                <label className='text-[#474747] text-[12px] font-medium font-Urbanist'>Select Date Range</label>
                <div className='flex gap-2 items-center'>
                    <div className='flex flex-col gap-1'>
                        <label className='text-[#474747] text-[10px] font-medium font-Urbanist'>From Date</label>
                        <input
                            type='date'
                            name='dateRangeFrom'
                            value={managePaySlipGeneration.dateRangeFrom}
                            onChange={handleOnChangePaySlipGeneration}
                            className='text-[#333333] text-[11px] rounded-md py-[6px] px-[8px] border border-gray-500 outline-none'
                            style={{ width: 'fit-content' }}
                            required
                        />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className='text-[#474747] text-[10px] font-medium font-Urbanist'>To Date</label>
                        <input
                            type='date'
                            name='dateRangeTo'
                            value={managePaySlipGeneration.dateRangeTo}
                            onChange={handleOnChangePaySlipGeneration}
                            className='text-[#333333] text-[11px] rounded-md py-[6px] px-[8px] border border-gray-500 outline-none'
                            style={{ width: 'fit-content' }}
                            required
                        />
                    </div>
                </div>
            </div>
        )}
        
        <div>
            <Checkbox 
                color='blue'
                name='dontConsiderAttendance'
                checked={managePaySlipGeneration.dontConsiderAttendance}
                onChange={handleOnChangePaySlipGeneration}
                label={
                    <Typography className='text-[12px] text-[#474747] font-medium font-Urbanist'>
                        Do not consider attendance for payslip.
                    </Typography>
                }
            />
        </div>
        <div>
            <span className='text-[12px] text-[#474747] font-medium font-Urbanist'>Salary Calculation Formula</span>
            <div className='flex flex-col gap-2'>
                {salaryCalculationFormula.map((ele)=>(
                    <Radio key={ele.id}
                        color='blue'
                        name='calculationFormula'
                        label={
                            <Typography>
                                <Typography className='text-[#474747] text-[12px]'>
                                    {ele.title} = {ele.rateDescrip}
                                </Typography>
                                <Typography className='text-[#474747] text-[12px]'>
                                    {ele.payable} = {ele.formula}
                                </Typography>
                                <Typography className='text-[#474747] text-[12px]'>
                                    {ele.otDescrip}
                                </Typography>
                            </Typography>
                        }
                        value={ele.id}
                        checked={ele.id === managePaySlipGeneration.calculationFormula}
                        onChange={handleOnChangePaySlipGeneration}
                    />
                ))}
            </div>
        </div>
        <div className='flex flex-col gap-1'>
            {salraySubChecboxData.map((ele)=>{
                // Map checkbox IDs to state field names
                const fieldMap = {
                    1: 'leaveEncashment',
                    2: 'monthlyReward', 
                    3: 'dontDoDeductionsAttendance',
                    4: 'dontDoDeductionsLateComing',
                    5: 'doNotPayOvertime',
                    6: 'adjustOvertimeInLateComings',
                    7: 'doNotConsiderThisMonthOvertime'
                };
                
                const fieldName = fieldMap[ele.id];
                
                // Hide "Adjust overtime in late comings" when:
                // 1. "Don't do Deductions (for attendance)" is checked, OR
                // 2. "Don't do Deductions (for late coming & early leaving)" is checked
                if (ele.id === 6 && (
                    managePaySlipGeneration.dontDoDeductionsAttendance || 
                    managePaySlipGeneration.dontDoDeductionsLateComing
                )) {
                    return null;
                }
                
                // Disable "Don't do Deductions (for late coming & early leaving)" when "Don't do Deductions (for attendance)" is checked
                const isDisabled = ele.id === 4 && managePaySlipGeneration.dontDoDeductionsAttendance;
                
                return (
                    <div key={ele.id}>
                        <Checkbox 
                            color='blue'
                            name={fieldName}
                            checked={managePaySlipGeneration[fieldName] || false}
                            onChange={handleOnChangePaySlipGeneration}
                            disabled={isDisabled}
                            label={
                                <Typography className={`text-[14px] ${isDisabled ? 'text-gray-400' : 'text-[#474747]'}`}>
                                   {ele.title}
                                </Typography>
                            }
                        />
                        {/* Show bonus type selection when Monthly Reward is checked */}
                        {ele.id === 2 && managePaySlipGeneration.monthlyReward && (
                            <div className='ml-8 mt-2 space-y-3'>
                                <div className='w-40 p-0'>
                                    <style>
                                        {`
                                            .bonus-type-select [class*="singleValue"],
                                            .bonus-type-select [class*="placeholder"] {
                                                font-size: 10px !important;
                                            }
                                            .bonus-type-select [class*="option"] {
                                                font-size: 10px !important;
                                                white-space: nowrap !important;
                                                overflow: hidden;
                                                text-overflow: ellipsis;
                                            }
                                            .bonus-type-select [class*="control"] {
                                                font-size: 10px !important;
                                            }
                                            .bonus-type-select [class*="input"] {
                                                font-size: 10px !important;
                                            }
                                        `}
                                    </style>
                                    <div className='bonus-type-select'>
                                        <CustomSelect
                                            placeHolderTitle='Select Bonus Type'
                                            value={managePaySlipGeneration.bonusType 
                                                ? { value: managePaySlipGeneration.bonusType, label: bonusTypeOptions.find(opt => opt.value === managePaySlipGeneration.bonusType)?.label }
                                                : null
                                            }
                                            options={bonusTypeOptions}
                                            onChangeHandler={handleBonusTypeChange}
                                            customStyles={false}
                                        />
                                    </div>
                                </div>
                                
                                {/* Show fields for "Fixed Amount X No of Days" (bonusType === 2) */}
                                {managePaySlipGeneration.bonusType === 2 && (
                                    <div className='flex gap-52'>
                                        <div className='w-7'>
                                            <Input
                                                label='Amount per Days'
                                                type='number'
                                                value={managePaySlipGeneration.amountPerDays || ''}
                                                onChange={(e) => handleBonusFieldChange('amountPerDays', e.target.value)}
                                                color='blue'
                                                size='sm'
                                            />
                                        </div>
                                        <div className='w-7'>
                                            <Input
                                                label='No of Days'
                                                type='number'
                                                value={managePaySlipGeneration.noOfDays || ''}
                                                onChange={(e) => handleBonusFieldChange('noOfDays', e.target.value)}
                                                color='blue'
                                                size='sm'
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Show field for "One Time Amount" (bonusType === 3) */}
                                {managePaySlipGeneration.bonusType === 3 && (
                                    <div className='w-32'>
                                        <Input
                                            label='One Time Amount'
                                            type='number'
                                            value={managePaySlipGeneration.oneTimeAmount || ''}
                                            onChange={(e) => handleBonusFieldChange('oneTimeAmount', e.target.value)}
                                            color='blue'
                                            size='md'
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        <div className='space-y-2'>
            <div className='text-[12px] text-[#474747] font-medium font-Urbanist'>
                <span>Overtime Setting(s) Specify dates and overtime accordingly </span>
            </div>
            {managePaySlipGeneration.overTime.map((item, index) => (
                <div key={index} className='flex lg:flex-row md:flex-row flex-col lg:items-center md:items-center items-start gap-2'>
                    <div>
                        <input
                            className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                            type='date'
                            value={item.date || ''}
                            onChange={(e) => handleOvertimeChange(index, 'date', e.target.value)}
                        />
                    </div>
                    <div>
                        <CustomSelect
                            placeHolderTitle='Overtime Value'
                            value={item.value}
                            options={overtimeCustomData.map((type) => ({ value: type.value, label: type.title }))}
                            onChangeHandler={(selectedOption) =>
                                handleOvertimeChange(index, 'value', selectedOption)
                            }
                            customStyles={false}
                        />
                    </div>
                    <div>
                        {index === managePaySlipGeneration.overTime.length - 1 ? (
                            <Button className='bg-bgBlue' onClick={addMoreOverTime}>
                                <FaPlus />
                            </Button>
                        ) : (
                            <Button className='bg-red-500' onClick={() => removeOverTime(index)}>
                                <FaXmark />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
           
        </div>
        
        {/* Date field for "Do not consider this month overtime" */}
        {managePaySlipGeneration.doNotConsiderThisMonthOvertime && (
            <div className='px-2'>
                <div className='flex flex-col gap-1 w-48'>
                    <label className='text-[#474747] text-[12px] font-medium font-Urbanist'>Select overtime month and year</label>
                    <input
                        type='month'
                        name='doNotConsiderThisMonthOvertimeDate'
                        value={managePaySlipGeneration.doNotConsiderThisMonthOvertimeDate || ''}
                        onChange={handleOnChangePaySlipGeneration}
                        className='text-[#333333] text-[11px] rounded-md py-[6px] px-[8px] border border-gray-500 outline-none'
                        style={{ width: 'fit-content' }}
                    />
                </div>
            </div>
        )}
        
        {/* Generate Payslip Button */}
        <div className='pt-2'>
            <Button 
                className='bg-bgBlue text-white px-6 py-2 text-[12px] font-medium font-Urbanist'
                onClick={generateBulkPayroll}
                disabled={
                    managePaySlipGeneration.isGenerating || 
                    !managePaySlipGeneration.payslipGenType ||
                    (managePaySlipGeneration.payslipGenType === 1 && (!managePaySlipGeneration.year || !managePaySlipGeneration.month)) ||
                    (managePaySlipGeneration.payslipGenType === 2 && (!managePaySlipGeneration.dateRangeFrom || !managePaySlipGeneration.dateRangeTo))
                }
            >
                {managePaySlipGeneration.isGenerating ? 'Generating...' : 'Generate Payslips'}
            </Button>
        </div>
    </div>
  )
}

export default PaySlipGenerationSelection