import React from 'react'
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  Typography,
} from "@material-tailwind/react";
import useDashboard from '../../ViewModel/DashboardViewModel/DashboardServices';
import { FaCamera } from 'react-icons/fa6';
import { BsEnvelope } from 'react-icons/bs';
import { IoCall } from 'react-icons/io5';
import EmpPersonalInfo from './EmpPersonalInfo';
import AttendanceSystem from './AttendanceSystem';
import OfficialInfo from './OfficialInfo';
import SalarySettings from './SalarySettings';
import EmployeeDocuments from './EmployeeDocuments';
import LeaveBalance from './LeaveBalance';
import CheckList from './CheckList';
import AccountPrivileges from './AccountPrivileges';
import RepetitiveDuties from './RepetitiveDuties';
import AcceleratePerformance from './AcceleratePerformance';
import CustomButton from '../../Components/CustomButton/CustomButton';
import { File_BASE_URL } from '../../Model/BaseUri';

const EmpProfile = (props) => {
    const {empId} = props
    const {empData, settingEmpView, empView, checkListData, empDocuments, empExtraData, academics, experiencesData, depandants,
        licensesData,refrenceData,documentsData,accelerateData
    } = useDashboard()
    const dbEmployeeData = empData?.employees?.DB_DATA?.DATA[0]
    const db_data = empData?.data?.DB_DATA


    const EmpProfileTimelinedata = [
        { id: 1,  empId:empId, title: 'Personal Info', component: EmpPersonalInfo, data: { empView, personalInfo : db_data, nationality:db_data.nationality} },
        { id: 2,  empId:empId, title: 'Attendance Setting', component: AttendanceSystem, data: { empView, bioData:db_data.bio_data, personalInfo : db_data.emp_data,}},
        { id: 3,  empId:empId, title: 'Official Info', component: OfficialInfo, data: { empView, bioData:db_data.bio_data, personalInfo : db_data, } },
        { id: 4,  empId:empId, title: 'Salary Settings', component: SalarySettings, data: { empView, personalInfo : db_data, } },
        { id: 5,  empId:empId, title: 'Employee Documents', component: EmployeeDocuments, data: { empView, empDocuments:empDocuments, academics: academics, experiencesData, depandants:depandants, licensesData:licensesData,refrenceData:refrenceData, documentsData: documentsData} },
        { id: 6,  empId:empId, title: 'Leave Balance', component: LeaveBalance, data: { empView, personalInfo : db_data,  } },
        { id: 7,  empId:empId, title: 'CheckList', component: CheckList, data: { empView , checkListData: checkListData} },
        { id: 8,  empId:empId, title: 'Account Privileges', component: AccountPrivileges, data: { empView, personalInfo : db_data, } },
        { id: 9,  empId:empId, title: 'Repetitive Duties', component: RepetitiveDuties, data: { empView, empExtraData:empExtraData } },
        { id: 10, empId:empId,  title: 'Accelerate Performance', component: AcceleratePerformance, data: { empView, accelerateData: accelerateData } },
    ];

    const selectedData = EmpProfileTimelinedata.find(item => item.id === empView.state);
    const SelectedComponent = selectedData ? selectedData.component : null;
    const componentData = selectedData ? selectedData.data : null;

  return (
    <div className='grid grid-cols-12'>
        <div className='col-span-3 bg-[#ECEFF1] pl-5 py-4 rounded-l-md'>
            <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-8'>
                    <div className='relative'>
                        <img src={`${File_BASE_URL}${dbEmployeeData?.data.dp}`} alt='dp' 
                            className='w-[80px] h-[80px] object-fit rounded-full'
                        />
                        <span className='absolute -bottom-0 left-[45px] bg-white p-[6px] rounded-full cursor-pointer'
                        ><FaCamera className='text-[14px] text-gray-600'/></span>
                    </div> 
                    <div className=''>
                        <div>
                            <span className='text-[#3da5f4] text-[13px]'>{dbEmployeeData?.data.name}</span>
                        </div>
                        <div>
                            <span className='text-[#9B9B9B] text-[11px]'>{dbEmployeeData?.emp_desig}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div>
                                <span className='text-[#3DA5F4]'><IoCall /></span>
                            </div>
                            <div>
                                <span className='text-[#474747] text-[13px]'>{dbEmployeeData?.emp_mob}</span>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div>
                                <span className='text-[#3DA5F4]'><BsEnvelope /></span>
                            </div>
                            <div>
                                <span className='text-[#474747] text-[13px]'>{dbEmployeeData?.emp_email}</span>
                            </div>

                        </div>
                    </div> 
                </div>
                <div className='mt-5'>
                    <Timeline>
                        {EmpProfileTimelinedata.map((ele, index) => {
                            const isLastItem = index === EmpProfileTimelinedata.length - 1;
                            return (
                                <TimelineItem key={ele.id}>
                                    <TimelineConnector />
                                    <TimelineHeader className={` ${isLastItem ? 'h-5' : ''}`}>
                                        <TimelineIcon className="p-0 cursor-pointer" onClick={()=>settingEmpView(ele)}>
                                            <div className='w-4 h-4 bg-white flex items-center justify-center rounded-full border-2 border-blue-600'>
                                                {empView.state === ele.id && 
                                                    <span className="w-[50%] h-[50%] bg-blue-600 flex rounded-full">
                                                    </span>
                                                }
                                            </div>
                                        </TimelineIcon>
                                        <Typography variant="span" color="blue-gray" className="p-0 cursor-pointer text-[12px]" onClick={()=>settingEmpView(ele)}>
                                            {ele.title}
                                        </Typography>
                                    </TimelineHeader>
                                    <div className={` ${isLastItem ? 'h-3' : 'pb-5'}`}>

                                    </div>
                                </TimelineItem>
                            );
                        })}
                    </Timeline>
                </div>
            </div>
        </div>
        <div className='col-span-9 pl-4 py-3 relative'>
            <div className='absolute right-0'>
                <CustomButton 
                    title='Profile Update Invite'
                />
            </div>
            <div>
                {SelectedComponent && <SelectedComponent data={componentData} />}
            </div>
        
        </div>
    </div>
  )
}

export default EmpProfile