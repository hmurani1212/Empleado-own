import React, { useEffect } from 'react'
import useShiftManagement from '../../ViewModel/ShiftManagementViewModel/ShiftManagementServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import { Checkbox } from '@material-tailwind/react'
import { FaClock } from 'react-icons/fa'
import './EditMemberForm.css'

const EditMemberForm = () => {
    const {editMemberValues, availableTeams, handleUpdateMember, handleEditSelectChange, handleEditCheckboxChange, isUpdatingMember} = useShiftManagement()
    
    return (
        <div className="pt-5">
        <form onSubmit={handleUpdateMember} >
            <div className='flex flex-col space-y-2'>
                <div className='space-y-2'>
                    <label className='text-[#698592] font-light text-[12px]  font-light text-[12px]'>Select a new Team</label>
                    <CustomSelect 
                        placeHolderTitle='Select team'
                        value={editMemberValues.new_team_id}
                        options={availableTeams?.map(team => ({
                            value: team.id, 
                            label: team.team_name
                        }))}
                        onChangeHandler={(selectedOption) => handleEditSelectChange(selectedOption, 'new_team_id')}
                        customStyles={false}
                    />
                </div>

                <div className="text-[12px] font-light">
                    <Checkbox 
                        color='blue' 
                        label='Schedule changing time' 
                        checked={editMemberValues.schedule_changing_time}
                        onChange={(e) => handleEditCheckboxChange(e, 'schedule_changing_time')}
                    />
                </div>

                {editMemberValues.schedule_changing_time && (
                    <div className='space-y-2'>
                        <div className='grid grid-cols-2 gap-4 '>
                            <div className='space-y-1'> 
                                <label className='text-[#698592] font-light text-[12px] '>Schedule Date</label>
                                <input 
                                    type='date'
                                    value={editMemberValues.schedule_date}
                                    onChange={(e) => handleEditSelectChange(e, 'schedule_date')}
                                    className='text-[#698592] font-light text-[12px]  w-full h-9 px-3 py-2  border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <div className='space-y-1'>
                                <label className='text-[#698592] font-light text-[12px]'>Schedule Time</label>
                                <input 
                                    type='time'
                                    value={editMemberValues.schedule_time}
                                    onChange={(e) => handleEditSelectChange(e, 'schedule_time')}
                                    className='w-full h-9 px-3 py-2 text-[12px] border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                        </div>

                        <div className='text-[12px] font-light text-gray-600 pt-3'>
                            If you are temporary moving the employee, then choose a date below so the employee is moved backed on that date.
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-1'>
                                <label className='text-[#698592] font-light text-[12px]'>Move to the original shift on</label>
                                <input 
                                    type='date'
                                    value={editMemberValues.move_back_date}
                                    onChange={(e) => handleEditSelectChange(e, 'move_back_date')}
                                    className='w-full h-9 px-3 py-2 text-[#698592] font-light text-[12px] border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            <div className='space-y-1'>
                                <label className='text-[#698592] font-light text-[12px]'>At below time</label>
                                <input 
                                    type='time'
                                    value={editMemberValues.move_back_time}
                                    onChange={(e) => handleEditSelectChange(e, 'move_back_time')}
                                    className='w-full h-9 px-3 py-2 text-[12px] border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                        </div>

                        <div className='border p-3 rounded-md'>
                            <div className='text-[12px] font-normal text-blue-500 mb-1'>Acknowledgement</div>
                            <div className='text-[12px] font-normal text-blue-400'>
                                The new shift may be set to auto rotation mode.
                                In which case there is a possibility, that the employee shift is automatically changed by the auto rotation, and the employee is moved from your desired shift to somewhere else.
                            </div>
                        </div>
                    </div>
                )}
                
                <div>
                    <SubmitButton text="Update" loading={isUpdatingMember} />
                </div>
            </div>
        </form>
        </div>
    )
}

export default EditMemberForm