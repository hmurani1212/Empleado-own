import { Button, Input, Option, Radio, Select } from '@material-tailwind/react'
import React from 'react'
import { getAllMonths } from '../../services/__appServicesData'
import useLeavesPlanner from '../../ViewModel/LeavePlannerViewModel/LeavePlannerServices'
import { Loader2 } from 'lucide-react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'

const DefineLeaveType = ({groupId}) => {
  const {addLeaveTypeValues, handleLeaveTypesValue, addDefineLeaveType, handleSelectChangeMonth, isLoading } = useLeavesPlanner()
  const months = getAllMonths()
  
  return (
    <div className='p-6'>
      <form onSubmit={(e) => addDefineLeaveType(e,groupId)} className="flex flex-col gap-6">
        
        <div className='flex flex-col gap-2'>
            <label className="text-sm font-semibold text-gray-700 font-poppins">Leave Title</label>
            <Input 
                color='blue' 
                className='!border !border-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-blue-500 focus:!border-t-blue-500 focus:ring-blue-500/10 rounded-lg'
                labelProps={{
                    className: "hidden",
                }}
                name='leave_title' 
                value={addLeaveTypeValues.leave_title} 
                onChange={handleLeaveTypesValue}
            />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Calendar From</label>
                <div className="w-full">
                    <CustomSelect 
                        placeHolderTitle='Select Month'
                        value={addLeaveTypeValues.calendar_from ? {
                            value: addLeaveTypeValues.calendar_from,
                            label: months.find(m => m.id === addLeaveTypeValues.calendar_from)?.title
                        } : null}
                        options={months.map(m => ({ value: m.id, label: m.title }))}
                        onChangeHandler={(option) => handleSelectChangeMonth('calendar_from', option.value)}
                        customStyles={false}
                    />
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Calendar Upto</label>
                <div className="w-full">
                    <CustomSelect 
                        placeHolderTitle='Select Month'
                        value={addLeaveTypeValues.calendar_upto ? {
                            value: addLeaveTypeValues.calendar_upto,
                            label: months.find(m => m.id === addLeaveTypeValues.calendar_upto)?.title
                        } : null}
                        options={months.map(m => ({ value: m.id, label: m.title }))}
                        onChangeHandler={(option) => handleSelectChangeMonth('calendar_upto', option.value)}
                        customStyles={false}
                    />
                </div>
            </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Quantity (Number of Leaves)</label>
                <Input 
                    type='number' 
                    color='blue' 
                    className='!border !border-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-blue-500 focus:!border-t-blue-500 focus:ring-blue-500/10 rounded-lg'
                    labelProps={{
                        className: "hidden",
                    }}
                    name='quantity' 
                    value={addLeaveTypeValues.quantity} 
                    onChange={handleLeaveTypesValue} 
                    min='0' 
                    step='1'
                />
            </div>
            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Unit</label>
                <div className="w-full">
                    <CustomSelect 
                        placeHolderTitle='Select Unit'
                        value={addLeaveTypeValues.leave_unit ? {
                            value: addLeaveTypeValues.leave_unit,
                            label: addLeaveTypeValues.leave_unit === 'day' ? 'Days' : 'Hours'
                        } : null}
                        options={[
                            { value: 'day', label: 'Days' },
                            { value: 'hour', label: 'Hours' }
                        ]}
                        onChangeHandler={(option) => handleSelectChangeMonth('leave_unit', option.value)}
                        customStyles={false}
                    />
                </div>
            </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Carry Forward (Years)</label>
                <Input 
                    type='number' 
                    min='0' 
                    color='blue' 
                    className='!border !border-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-blue-500 focus:!border-t-blue-500 focus:ring-blue-500/10 rounded-lg'
                    labelProps={{
                        className: "hidden",
                    }}
                    name='carry_forward' 
                    value={addLeaveTypeValues.carry_forward} 
                    onChange={handleLeaveTypesValue}
                />
            </div>

            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Consecutive Allowed</label>
                <Input 
                    type='number' 
                    color='blue' 
                    className='!border !border-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-blue-500 focus:!border-t-blue-500 focus:ring-blue-500/10 rounded-lg'
                    labelProps={{
                        className: "hidden",
                    }}
                    name='consecutive' 
                    value={addLeaveTypeValues.consecutive} 
                    onChange={handleLeaveTypesValue} 
                    min='1' 
                    step='1'
                />
            </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-gray-50 p-4 rounded-xl border border-gray-100'>
                <label className='block text-sm font-semibold text-gray-700 font-poppins mb-3'>Prorated</label>
                <div className="flex gap-4">
                    <Radio color='blue' label={<span className="text-sm font-medium text-gray-600">Yes</span>} name='prorated' value="1" onChange={handleLeaveTypesValue} defaultChecked={addLeaveTypeValues.prorated === "1"} />
                    <Radio color='blue' label={<span className="text-sm font-medium text-gray-600">No</span>} name='prorated' value="0" onChange={handleLeaveTypesValue} defaultChecked={addLeaveTypeValues.prorated === "0"} />
                </div>
            </div>

            <div className='bg-gray-50 p-4 rounded-xl border border-gray-100'>
                <label className='block text-sm font-semibold text-gray-700 font-poppins mb-3'>Encashable</label>
                <div className="flex gap-4">
                    <Radio color='blue' label={<span className="text-sm font-medium text-gray-600">Yes</span>} value="1" name="encashable" onChange={handleLeaveTypesValue} defaultChecked={addLeaveTypeValues.encashable === "1"} />
                    <Radio color='blue' label={<span className="text-sm font-medium text-gray-600">No</span>} value="0" name="encashable" onChange={handleLeaveTypesValue} defaultChecked={addLeaveTypeValues.encashable === "0"} />          
                </div>
            </div>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <label className='text-sm font-semibold text-gray-800 font-poppins block mb-3'>For New Joiners Applicable After</label>
            <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col gap-1'>
                    <span className="text-xs font-medium text-gray-500 uppercase">Years</span>
                    <Input 
                        type='number' 
                        color='blue' 
                        className='!border !border-gray-200 bg-white'
                        labelProps={{ className: "hidden" }}
                        name='new_joiners_after_year' 
                        value={addLeaveTypeValues.new_joiners_after_year} 
                        onChange={handleLeaveTypesValue} 
                        min='0' 
                        step='1'
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <span className="text-xs font-medium text-gray-500 uppercase">Months</span>
                    <Input 
                        type='number' 
                        color='blue' 
                        className='!border !border-gray-200 bg-white'
                        labelProps={{ className: "hidden" }}
                        name='new_joiners_after_months' 
                        value={addLeaveTypeValues.new_joiners_after_months} 
                        onChange={handleLeaveTypesValue} 
                        min='0' 
                        step='1'
                    />
                </div>
            </div>
        </div>

        <div className='bg-gray-50 p-4 rounded-xl border border-gray-100'>
            <label className='text-sm font-semibold text-gray-700 font-poppins block mb-3'>Are these leaves paid?</label>
            <div className='flex gap-4'>
                <Radio
                    color='blue'
                    value="1"
                    label={<span className="text-sm font-medium text-gray-600">Yes</span>}
                    name='paid'
                    onChange={handleLeaveTypesValue}
                    defaultChecked={addLeaveTypeValues.paid === "1"}
                />
                <Radio 
                    color='blue'
                    value="0" 
                    label={<span className="text-sm font-medium text-gray-600">No</span>}
                    name='paid'
                    onChange={handleLeaveTypesValue}
                    defaultChecked={addLeaveTypeValues.paid === "0"}
                />
            </div>
        </div>

        <div className='mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100'>
            <Button 
              type='submit' 
              className='font-poppins font-medium capitalize bg-bgBlue shadow-blue-500/20 hover:shadow-blue-500/40 min-w-[120px] flex items-center justify-center py-2.5 rounded-xl'
              disabled={isLoading}
            > 
              {isLoading ? <Loader2 className='animate-spin w-4 h-4' /> : 'Define Leave'}
            </Button>
        </div>

      </form>
    </div>
  )
}

export default DefineLeaveType