import React from 'react'
import useEmpProfileService from '../../ViewModel/EmployeeViewModel/EmpProfileServices'
import { CiEdit } from 'react-icons/ci'
import EditAttendanceSetting from './EditAttendanceSetting'
import CustomDialog from '../../Components/CustomDialog/CustomDialog'
import { Button } from '@material-tailwind/react'

const AttendanceSystem = (props) => {
  const {data} = props
  const bioData = data?.bioData
  const personalInfo = data?.personalInfo
  
  const { handleEditAttendenceSetting, editAttedanceValue, handleAttendanceSettingToggle, updateAttendanceSettingHrPolicy, handleSelectAttendanceSettingChange} = useEmpProfileService()
  return (
    <>
    <div className='space-y-4'>
        <div>
            <span className='text-[#3DA5F4]'>{data.empView.section.title}</span>
        </div>
        <div className='space-y-3 border-t border-b border-gray-500 py-2'>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>HR Policy</span>
                </div>
                <div className='flex-1 flex items-center justify-between'>
                    <span>{bioData?.hr_policy}</span>
                    {editAttedanceValue.loading ? 
                        <Button className='p-1' color='blue' loading={editAttedanceValue.loading}></Button>
                    :
                        <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                            onClick={()=>handleEditAttendenceSetting(personalInfo.id, bioData)}
                        ><CiEdit /></span>
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Bio ID</span>
                </div>
                <div className='flex-1'>
                    <span>{bioData.bio_id}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Policy ID</span>
                </div>
                <div className='flex-1'>
                  <span>{bioData.policy_id}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Team</span>
                </div>
                <div className='flex-1'>
                    <span>{bioData.team}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Working Shift Name</span>
                </div>
                <div className='flex-1'>
                    <span>{bioData.working_shift_name}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Planner Name</span>
                </div>
                <div className='flex-1'>
                    <span>{bioData.planner_name}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Web Attendance</span>
                </div>
                <div className='flex-1'>
                    <span className={`${personalInfo.web_attendance === "DISABLED" ? 'text-[#FF4500]' : 'text-[#008000]'}`}>
                      {personalInfo.web_attendance === "DISABLED" ? 'Disabled' : 'Enabled'}
                    </span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Mobile Attendance</span>
                </div>
                <div className='flex-1'>
                    <span className={`${personalInfo.mobile_attendance == 0 ? 'text-[#FF4500]' : 'text-[#008000]'}`}>{personalInfo.mobile_attendance == 0 ? 'Disabled' : personalInfo.martial_status == 1 ? 'Enabled' : ''}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Attendance Premises</span>
                </div>
                <div className='flex-1'>
                    <span className={`${personalInfo.att_premises == 0 ? 'text-[#FF4500]' : 'text-[#008000]'}`}>{personalInfo.att_premises == 0 ? 'Disabled' : personalInfo.att_premises == 1 ? 'Enabled' : ''}</span>

                </div>
            </div>
        </div>


        
    </div>
    {editAttedanceValue.show && 
            <CustomDialog 
                title='Edit Attendance Setting'
                openDialog={editAttedanceValue.show}
                handleOpen = {handleAttendanceSettingToggle}
                compo={
                    <EditAttendanceSetting 
                      data ={editAttedanceValue}
                      empId = {personalInfo.id}
                      updateAttendanceSettingHrPolicy = { updateAttendanceSettingHrPolicy }
                      handleSelectAttendanceSettingChange = { handleSelectAttendanceSettingChange }
                    />
                }
                size="md"
                confirmBtn ={true}
                footer={false}
                outsidePress = {false}

            />
        }
    </>
  )
}

export default AttendanceSystem