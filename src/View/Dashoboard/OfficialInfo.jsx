import React, { useState } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Typography,
  Button,
  Radio,
  Input,
} from "@material-tailwind/react";
import { FaXmark } from 'react-icons/fa6';
import useEmpProfileInfo from '../../ViewModel/EmployeeViewModel/OfficialEmpProfile';
import { TiTick } from 'react-icons/ti';
import { CiEdit } from 'react-icons/ci';
import { contractData, eobiData, healthBenefit, insurenceData, providentFund, socialSecurity } from '../../services/EmpServices';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import { convertDMY } from '../../services/__dateTimeServices';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';


function Icon({ id, open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${open.includes(id) ? "rotate-180" : ""} h-5 w-5 transition-transform`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
function ChildIcon({ id, open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 30 30"
      strokeWidth={2}
      stroke="currentColor"
      className={`${open === id ? "rotate-180" : ""} h-5 w-5 transition-transform`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

const EmpCurrentStatusHeader = ['Branch', 'Department', 'Designation', 'Joining Date']
const TransferPromohistoryHeader = ['Branch', 'Department', 'Designation', 'Joining Date', 'Entry Data']

const OfficialInfo = (props) => {
  const {data} = props;
  console.log()
  const personalInfo = data?.personalInfo?.emp_data
  const EmpCurrentStatus = data?.personalInfo?.emp_transfer_data
  const joinLeftInfoHistory = data?.personalInfo?.join_left_info_history
  const otherData = data?.personalInfo
  const joinLeftHistory = data?.personalInfo?.join_left_history



  
  
  
  
  
  
  const [open, setOpen] = useState([]);
  const [childOpen, setChildOpen] = useState(null);
  
  const handleChildOpen = (value) => setChildOpen(childOpen === value ? null : value);
  
  const handleOpen = (id) => {
    setOpen((prevOpen) =>
      prevOpen.includes(id) ? prevOpen.filter((item) => item !== id) : [...prevOpen, id]
  );
};



// console.log('officialInfoValue.providentFundEligibilty', officialInfoValue.providentFundEligibilty)

const { officialInfoValue, handleEmpOfficialProfileEdit, handleCloseEditEmpOfficialInfo,
  handleEmpOfficialInputChange, handleSelectOfficialInfo,
  removeReportingManagerOfficial,reportManagerValue,confirmReportingManagerDelete,toggleConfirmationDialog,
  serachEmpReportingManager, handleSelectEmpManager,addReportingManager,
  jobDescriptionValue, handleUpdateJobDescription, handleEditJobDesction, handleCloseJobDescription,
  handleJobDescriptOnChange,
  handleUpdateEmpOfficialInfo

  
} = useEmpProfileInfo()



  // console.log('officialInfoValue', officialInfoValue.eobi)


  const accordionData = [
    {
      id: 1,
      title: "Official Info",
      content: (
         <div className='space-y-2 py-2 px-3'>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    
                      <span className='font-semibold text-[14px] text[#474747]'>Employee Id</span>
                </div>
                <div className='flex-1 flex items-center justify-between'>
                    {officialInfoValue.show ?  
                      <input 
                        className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                        type='text' 
                        value={officialInfoValue?.emp_id} name='emp_id' 
                        onChange={handleEmpOfficialInputChange}
                      />
                      :
                      <span>{personalInfo?.emp_id}</span>
                    }
                    {officialInfoValue.show ?

                      <div className='flex items-center gap-2'>
                          <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                              onClick={handleCloseEditEmpOfficialInfo}
                          ><FaXmark /></span>
                          {officialInfoValue.loading ? 
                            <Button value='' loading={officialInfoValue.loading} className='p-1'></Button>
                          
                          :

                          <span className='bg-[#0acf97] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                              onClick={()=>handleUpdateEmpOfficialInfo(personalInfo.id, personalInfo.emp_id)}
                          ><TiTick /></span>
                        }
                      </div>

                      :

                      officialInfoValue.loading ? 

                      <Button className='p-1' color='blue' loading={officialInfoValue.loading} value=''></Button>
                      :
                      <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                        onClick={()=>handleEmpOfficialProfileEdit(personalInfo.id)}
                      ><CiEdit /></span>
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                  
                  <span className='font-semibold text-[14px] text[#474747]'>Employee Status</span>
                </div>
                <div className='flex-1'>
                  {officialInfoValue.show ? 
                    <div className='w-[70%]'>
                      <CustomSelect 
                        placeHolderTitle = 'Employement Status'
                        value={
                            contractData.find(option => option.name.toLocaleLowerCase() === officialInfoValue.employment_status) 
                            ? { value: contractData.find(option => option.name.toLocaleLowerCase() === officialInfoValue.employment_status).name, 
                                label:contractData.find(option => option.name.toLocaleLowerCase() === officialInfoValue.employment_status).name
                            }
                            :
                            officialInfoValue.employment_status
                        }
                        options={contractData?.map((type) => ({ value: type.name, label: type.name }))} 
                        onChangeHandler={(selectedOption) => handleSelectOfficialInfo(selectedOption, 'employment_status')}
                        customStyles={false}
                          
                      />
                    </div>
                      :
                    <span>{personalInfo?.employment_status}</span>
                  }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>{officialInfoValue.show ? 'Tag (optional)' : 'Tag'}</span>
                </div>
                <div className='flex-1'>
                  {officialInfoValue.show ? 
                    <div className='flex items-center gap-2'>
                      <div className={` ${officialInfoValue.tag.value === 'other'?  'w-[50%]' : 'w-[70%]'}`}>
                        <CustomSelect 
                          placeHolderTitle = 'Tag'
                          value={
                              officialInfoValue?.tag_list?.find(option => option.id === officialInfoValue.tag) 
                              ? { value: officialInfoValue?.tag_list?.find(option => option.id === officialInfoValue.tag).id, 
                                  label:officialInfoValue?.tag_list?.find(option => option.id === officialInfoValue.tag).tag_name
                              }
                              :
                              officialInfoValue.tag
                          }
                          options={officialInfoValue?.tag_list?.map((ele)=> ({ value:ele.id, label:ele.tag_name }))} 
                          onChangeHandler={(selectedOption) => handleSelectOfficialInfo(selectedOption, 'tag')}

                          cStyle={true}
                            
                        />
                      </div>
                      {officialInfoValue.tag.value === 'other' &&
                          <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                            type='text' 
                            value={officialInfoValue?.new_tag} name='new_tag' 
                            onChange={handleEmpOfficialInputChange}
                          />
                      }
                    </div>
                    :
                    <span>{personalInfo?.tag_name}</span>
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>EOBI</span>
                </div>
                <div className='flex-1'>
                  {officialInfoValue.show ? 
                      <div>
                        {eobiData.map((ele, i)=>(
                          <Radio name='eobi' color='blue' key={i} label={ele.title} 
                            onChange={handleEmpOfficialInputChange}
                            value={ele.value}
                            checked={officialInfoValue.eobi == ele.value}
                          />
                        ))}

                        {officialInfoValue.eobi !== '0' &&
                        <div>
                         <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                            type='text' 
                            value={officialInfoValue?.eobi_number} name='eobi_number' 
                            onChange={handleEmpOfficialInputChange}
                          />
                        </div>

                        }
                      </div>
                  :
                    <span>{personalInfo?.eobi == 0 ? 'No' : `Yes/${personalInfo?.eobi_number }`}</span>

                  }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Provident Fund</span>
                </div>
                <div className='flex-1'>
                  {officialInfoValue.show ? 
                    <div>
                      {providentFund.map((ele, i)=>(
                        <Radio color='blue' name='provident_fund' key={i} label={ele.title} 
                          onChange={handleEmpOfficialInputChange}
                          value={ele.value}
                          checked={officialInfoValue.provident_fund == ele.value}
                          disabled={officialInfoValue?.providentFundEligibilty?.eligibility === "0"}
                        />
                      ))}
                    </div>
                  :
                    <span>{otherData.prident_fund_amount === 0 ? 'Not Available' : 'Available'}</span> 
                    // <span>{personalInfo?.eobi}</span> 
                  }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Social Security</span>
                </div>
                <div className='flex-1'>
                   {officialInfoValue.show ? 
                    <div>
                      {socialSecurity.map((ele, i)=>(
                        <Radio color='blue' key={i} label={ele.title} name='social_security' 
                          onChange={handleEmpOfficialInputChange}
                          value={ele.value}
                          checked={officialInfoValue.social_security == ele.value}
                        />
                      ))}
                      {officialInfoValue.social_security !== '0' &&
                        <div>
                          <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                            type='text' 
                            value={officialInfoValue?.social_sec_number} name='social_sec_number' 
                            onChange={handleEmpOfficialInputChange}
                          />
                        </div>
                        }
                    </div>
                  :
                    <span>{personalInfo?.social_security == 0 ? 'No' : `Yes/${personalInfo?.social_sec_number }`}</span>
                  }
                  </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>{officialInfoValue.show ? 'Insurance': 'Insurance Status'}</span>
                </div>
                <div className='flex-1'>
                  {officialInfoValue.show ? 
                    <div>
                      {insurenceData.map((ele, i)=>(
                        <Radio color='blue' key={i} label={ele.title} name='insurance' 
                          onChange={handleEmpOfficialInputChange}
                          value={ele.value}
                          checked={officialInfoValue.insurance == ele.value}
                        />
                      ))}
                    </div>
                  :
                  <span>{personalInfo?.insurance == 0 ? 'No' : 'Yes'}</span>
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Health Benefit</span>
                </div>
                <div className='flex-1'>
                  {officialInfoValue.show ? 
                    <div>
                      {healthBenefit.map((ele, i)=>(
                        <Radio color='blue' key={i} label={ele.title} name='health_benefits' 
                          onChange={handleEmpOfficialInputChange}
                          value={ele.value}
                          checked={officialInfoValue.health_benefits === ele.value}
                        />
                      ))}
                    </div>
                  :
                    <span>{personalInfo?.health_benefits == 0 ? 'No' : 'Yes'}</span>
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Designation</span>
                </div>
                <div className='flex-1'>
                  {officialInfoValue.show ? 
                    <div className='w-[70%]'>
                      <CustomSelect 
                        placeHolderTitle = 'Designation'
                        value={
                            officialInfoValue?.designation_list?.find(option => option.id === officialInfoValue.designation) 
                            ? { value: officialInfoValue?.designation_list?.find(option => option.id === officialInfoValue.designation).id, 
                                label:officialInfoValue?.designation_list?.find(option => option.id === officialInfoValue.designation).title
                            }
                            :
                            officialInfoValue.designation
                        }
                        options={officialInfoValue?.designation_list?.map((type) => ({ value: type.id, label: type.title }))} 
                        onChangeHandler={(selectedOption) => handleSelectOfficialInfo(selectedOption, 'designation')}
                        customStyles={false}
                          
                      />
                    </div>
                    :
                    <span>{otherData?.designation}</span>
                  }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                  <span className='font-semibold text-[14px] text[#474747]'>Branch</span>
                </div>
                <div className='flex-1'>
                  {officialInfoValue.show ? 
                    <div className='w-[70%]'>
                      <CustomSelect 
                        placeHolderTitle = 'Branch'
                        value={
                            officialInfoValue?.branches_list?.find(option => option.id === officialInfoValue.branch) 
                            ? { value: officialInfoValue?.branches_list?.find(option => option.id === officialInfoValue.branch).id, 
                                label:officialInfoValue?.branches_list?.find(option => option.id === officialInfoValue.branch).branch_name
                            }
                            :
                            officialInfoValue.branch
                        }
                        options={officialInfoValue?.branches_list?.map((type) => ({ value: type.id, label: type.branch_name }))} 
                        onChangeHandler={(selectedOption) => handleSelectOfficialInfo(selectedOption, 'branch')}
                        customStyles={false}
                          
                      />
                    </div>
                    :
                  <span>{personalInfo?.branch_name}</span>
                  }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Department</span>
                </div>
                <div className='flex-1'>
                  {officialInfoValue.show ? 
                    <div className='w-[70%]'>
                      <CustomSelect 
                        placeHolderTitle = 'Department'
                        value={
                            officialInfoValue?.departments_list?.find(option => option.value === officialInfoValue.department) 
                            ? { value: officialInfoValue?.departments_list?.find(option => option.value === officialInfoValue.department).value, 
                                label:officialInfoValue?.departments_list?.find(option => option.value === officialInfoValue.department).label
                            }
                            :
                            officialInfoValue.department
                        }
                        options={officialInfoValue?.departments_list || []} 
                        onChangeHandler={(selectedOption) => handleSelectOfficialInfo(selectedOption, 'department')}

                        cStyle={true}
                          
                      />
                    </div>
                    :
                    <span>{otherData?.department}</span>
                      }
                </div>
            </div>
            {(officialInfoValue.employment_status ===  'contract' || officialInfoValue.employment_status ===  'Contract' || officialInfoValue?.employment_status?.label ===  'contract' || officialInfoValue?.employment_status?.label ===  'Contract' && officialInfoValue.show) && 
              <>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Training/contract from</span>
                  </div>
                  <div className='flex-1'>
                          <input 
                              className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                              type='date' 
                              value={officialInfoValue.trainingFrom}
                              name='trainingFrom'
                              onChange={handleEmpOfficialInputChange}
                              
                          />
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Training/contract upto</span>
                  </div>
                  <div className='flex-1'>
                          <input 
                              className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                              type='date' 
                              value={officialInfoValue.trainingUpto}
                              name='trainingUpto'
                              onChange={handleEmpOfficialInputChange}
                              
                          />
                  </div>
              </div>
              </>
            }
            {(officialInfoValue.employment_status ===  'trainee' || officialInfoValue.employment_status ===  'Trainee' || officialInfoValue?.employment_status?.label ===  'trainee' || officialInfoValue?.employment_status?.label ===  'Trainee' && officialInfoValue.show) && 
              <>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Training/contract from</span>
                  </div>
                  <div className='flex-1'>
                          <input 
                              className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                              type='date' 
                              value={officialInfoValue.trainingFrom}
                              name='trainingFrom'
                              onChange={handleEmpOfficialInputChange}
                              
                          />
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Training/contract upto</span>
                  </div>
                  <div className='flex-1'>
                          <input 
                              className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                              type='date' 
                              value={officialInfoValue.trainingUpto}
                              name='trainingUpto'
                              onChange={handleEmpOfficialInputChange}
                              
                          />
                  </div>
              </div>
              <div className='flex items-center'>
                <div className='flex-[0.5]'>
                  <span className='font-semibold text-[14px] text[#474747]'>Training field</span>
                </div>
                <div className='flex-1'>
                  <div className='w-[70%]'>
                    <CustomSelect 
                      placeHolderTitle = 'Training field'
                      value={
                          officialInfoValue.training
                      }
                      options={officialInfoValue?.training_fields.map((ele)=>({value:ele.id , label:ele.field_name}))} 
                      onChangeHandler={(selectedOption) => handleSelectOfficialInfo(selectedOption, 'training')}

                      cStyle={true}
                        
                    />
                  </div>
                </div>
              </div>
              {(officialInfoValue?.training?.value === 'other' || officialInfoValue?.training?.value === 'Other') && 
                <div className='flex items-center'>
                    <div className='flex-[0.5]'>
                        <span className='font-semibold text-[14px] text[#474747]'>Training field (New)</span>
                    </div>
                    <div className='flex-1'>
                            <input 
                                className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                                type='text' 
                                value={officialInfoValue.trainingField}
                                name='trainingField'
                                onChange={handleEmpOfficialInputChange}
                                
                            />
                    </div>
                </div>
              }

              </>
            }
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Join Date</span>
                </div>
                <div className='flex-1'>
                  {officialInfoValue.show ? 
                        <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                            type='date' 
                            value={officialInfoValue.join_date}
                            name='join_date'
                            onChange={handleEmpOfficialInputChange}
                            
                        />
                    :
                    <span>{convertDMY(personalInfo?.join_date)}</span>
                  }
                </div>
            </div>

            {!officialInfoValue.show && 
              <>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Date Of Retirement</span>
                  </div>
                  <div className='flex-1'>
                    <span>{otherData?.emp_retirement_date}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Date Of Exit</span>
                  </div>
                  <div className='flex-1'>
                    <span>{personalInfo?.job_exit_date === "0" ? 'Not Defined' : convertDMY(personalInfo?.job_exit_date)}</span>
                  </div>
              </div>
              </>
            }
            {officialInfoValue.show && 
            <>
               <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Job Description</span>
                </div>
                <div className='flex-1'>
                  <textarea 
                      rows="7" 
                      // cols="50" 
                      name="job_description"
                      className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                      onChange={handleEmpOfficialInputChange}
                      value={officialInfoValue.job_description}
                  >
                  </textarea>
                </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Probation From </span>
                  </div>
                  <div className='flex-1'>
                    <input 
                        className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                        type='date' 
                        value={officialInfoValue.probationFrom}
                        name='probationFrom'
                        onChange={handleEmpOfficialInputChange}
                        
                    />
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Probation Upto</span>
                  </div>
                  <div className='flex-1'>
                     <input 
                        className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                        type='date' 
                        value={officialInfoValue.probationUpto}
                        name='probationUpto'
                        onChange={handleEmpOfficialInputChange}
                        
                    />
                  </div>
              </div>
            </>
            }
        </div>
      ),
    },
    {
      id: 2,
      title: "Reporting Manager",
      content: (
        <div className={`space-y-2 py-2 px-3 ${otherData.reporting_to === null && 'h-[150px]'}`}>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Reporting to</span>
                </div>
                <div className='flex-1 flex flex-wrap items-center gap-2'>
                  {(otherData.reporting_to !== null || otherData.reporting_to?.length > 0 ) ? otherData.reporting_to?.map((ele)=>(
                    <div className='flex items-center px-2 py-1 rounded-lg gap-2 border border border-black'>
                      <span>{ele.name}</span>
                      <span className='w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white bg-red-500 cursor-pointer'
                        onClick={()=>removeReportingManagerOfficial(personalInfo.id ,ele)}
                      ><FaXmark /></span>
                    </div>
                  ))
                  
                  :
                  <div className='space-y-3'>


                    <div className='w-100'>
                      <CustomSelect 
                          placeHolderTitle = 'Type Manager/Authority name'
                          onHandleSelectSearch={(value, actionMeta)=>serachEmpReportingManager(personalInfo.id, value, actionMeta)}
                          value={reportManagerValue.empManager}
                          options={reportManagerValue?.managerEmp?.map((type) => ({ value: type.id, label: `${type.name} (${type.title})` }))} 
                          onChangeHandler={(selectedOption) => handleSelectEmpManager(selectedOption, 'empManager')}
                          customStyles={false} 
                          
                      />
                    </div>
                    <div>
                      <Button  className='font-[normal] text-[13px] bg-[#3DA5F4] capitalize p-2' onClick={()=>addReportingManager(personalInfo.id)}
                        loading={reportManagerValue.loading}  
                      >
                        Update Employee Manager
                      </Button>
                    </div>
                  </div>
                }
                </div>
            </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Job Description",
      content: (
        <div className='space-y-2 py-2 px-3'>
            <div className='flex items-center justify-between'>
              {jobDescriptionValue.show ?


                <>
                  <div className='w-96'>
                    <Input type='text' value={jobDescriptionValue.job_description} label='Job Description' name='job_description' 
                      onChange={handleJobDescriptOnChange}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                      <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                          onClick={handleCloseJobDescription}
                      ><FaXmark /></span>
                      {jobDescriptionValue.loading ? 
                        <Button loading={jobDescriptionValue.loading} className='p-1' value='' />
                        
                      :
                        <span className='bg-[#0acf97] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                        onClick={()=>handleUpdateJobDescription(personalInfo?.id)}
                        ><TiTick /></span>
                      }
                  </div>
                </>

                  :

                  <>
                  <span className='font-semibold text-[14px] text[#474747]'>{personalInfo?.job_description}</span> 

                  <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                    onClick={()=>handleEditJobDesction(personalInfo?.job_description)}
                    ><CiEdit />
                  </span>
                  </>
              }  
            </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Employee Current Status",
      content: (
       <div className='space-y-2 py-2 px-3'>
            <div className='flex'>
              <table className="w-full min-w-max table-auto text-start">
                <thead>
                  <tr>
                    {EmpCurrentStatusHeader.map((head) => (
                      <th
                        key={head}
                        className="py-4 text-left"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='p-4'>
                  <tr>
                    <td>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {EmpCurrentStatus?.branch}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {EmpCurrentStatus?.department}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {EmpCurrentStatus?.designation}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {EmpCurrentStatus?.join_date}
                      </Typography>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Transfer/Promotion History",
      content: (
       <div className='space-y-2 py-2 px-3'>
            <div className='flex'>
              <table className="w-full min-w-max table-auto text-start">
                <thead>
                  <tr>
                    {TransferPromohistoryHeader.map((head) => (
                      <th
                        key={head}
                        className="py-4 text-left"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='p-4'>
                  {joinLeftInfoHistory?.map((ele, i)=>(
                    <tr key={i}>
                      <td>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.branch_id}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.deptt_id}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.designation}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.join_date}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.entry_time}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "Employee Joining/Left History",
      content: (
        <div className='space-y-3 px-6 py-1'>
          <div className='space-y-2 py-2'>
            {joinLeftHistory?.map((ele, index) => (
              <Accordion key={index} open={childOpen === index} icon={<ChildIcon id={index} open={childOpen} />}>
                <AccordionHeader onClick={() => handleChildOpen(index)} className='text-[15px]'>{ele.emp_status}</AccordionHeader>
                <AccordionBody>
                  {ele.emp_status === "Left" ? leftEmpTable(ele): joinEmpTable(ele)}
                </AccordionBody>
              </Accordion>
            ))}
          </div>
        </div>
      ),
    },
     {
      id: 7,
      title: "Official Info History",
      content: (

        <div className='flex flex-col gap-2'>
          {joinLeftInfoHistory?.map((ele, i)=>(
            <div className={`space-y-2 py-2 px-3 ${i !== joinLeftInfoHistory.length - 1 ? 'border-b border-red-600' : ''}`} key={i}>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Join date</span>
                  </div>
                  <div className='flex-1'>
                      <span>{ele?.join_date}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Branch id</span>
                  </div>
                  <div className='flex-1'>
                      <span>{ele?.branch_id}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Permanant date</span>
                  </div>
                  <div className='flex-1'>
                      <span>{ele?.permanant_date}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Deptt id</span>
                  </div>
                  <div className='flex-1'>
                      <span>{ele?.deptt_id}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Emp ID</span>
                  </div>
                  <div className='flex-1'>
                      <span>{ele?.emp_id}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Tag id</span>
                  </div>
                  <div className='flex-1'>
                      <span><span>{ele?.tag_id}</span></span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Designation</span>
                  </div>
                  <div className='flex-1'>
                      <span><span>{ele?.designation}</span></span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Job description</span>
                  </div>
                  <div className='flex-1'>
                      <span><span>{ele?.job_description}</span></span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Eobi</span>
                  </div>
                  <div className='flex-1'>
                      <span>{ele?.eobi}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Provident fund</span>
                  </div>
                  <div className='flex-1'>
                    <span>{ele?.provident_fund}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Probation from</span>
                  </div>
                  <div className='flex-1'>
                      <span>{ele?.probation_from}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Probation upto</span>
                  </div>
                  <div className='flex-1'>
                      <span><span>{ele?.probation_upto}</span></span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Contract from</span>
                  </div>
                  <div className='flex-1'>
                    <span>{ele?.contract_from}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Contract upto</span>
                  </div>
                  <div className='flex-1'>
                    <span>{ele?.contract_upto}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Training field</span>
                  </div>
                  <div className='flex-1'>
                    <span>{ele?.training_field}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Social security</span>
                  </div>
                  <div className='flex-1'>
                    <span>{ele?.social_security}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Employment status</span>
                  </div>
                  <div className='flex-1'>
                    <span>{ele?.employment_status}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Insurance</span>
                  </div>
                  <div className='flex-1'>
                    <span>{ele?.insurance}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Health benefits</span>
                  </div>
                  <div className='flex-1'>
                    <span>{ele?.health_benefits}</span>
                  </div>
              </div>
              <div className='flex items-center'>
                  <div className='flex-[0.5]'>
                      <span className='font-semibold text-[14px] text[#474747]'>Entry time</span>
                  </div>
                  <div className='flex-1'>
                    <span>{ele?.entry_time}</span>
                  </div>
              </div>
            </div>
          ))}
        </div>
      ),
    }
  ];


  function leftEmpTable(data){
    return(
         <div className='space-y-2 py-2 px-3'>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Emp Status</span>
                </div>
                <div className='flex-1'>
                    <span>{data?.emp_status}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Leaving reason</span>
                </div>
                <div className='flex-1'>
                    <span>{data?.leaving_reason}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Clearance status</span>
                </div>
                <div className='flex-1'>
                    <span>{data?.clearance_status}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Leave reason detail</span>
                </div>
                <div className='flex-1'>
                    <span>{data?.leave_reason_detail}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Leave date</span>
                </div>
                <div className='flex-1'>
                    <span>{data?.leave_date}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Hr comments</span>
                </div>
                <div className='flex-1'>
                    <span><span>{data?.hr_comments}</span></span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Entry time</span>
                </div>
                <div className='flex-1'>
                    <span><span>{data?.entry_time}</span></span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Permanant date</span>
                </div>
                <div className='flex-1'>
                    <span><span>{data?.permanant_date}</span></span>
                </div>
            </div>
        </div>
      )
  }
  function joinEmpTable(data){
    return(
         <div className='space-y-2 py-2 px-5'>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Emp Status</span>
                </div>
                <div className='flex-1'>
                    <span>{data?.emp_status}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Join date</span>
                </div>
                <div className='flex-1'>
                    <span>{data?.join_date}</span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Entry time</span>
                </div>
                <div className='flex-1'>
                    <span><span>{data?.entry_time}</span></span>
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-semibold text-[14px] text[#474747]'>Permanant date</span>
                </div>
                <div className='flex-1'>
                    <span><span>{data?.permanant_date}</span></span>
                </div>
            </div>
        </div>
      )
  }




  return (
    <>
      
    <div className='space-y-4'>
      <div>
        <span className='text-[#3DA5F4]'>{data.empView.section.title}</span>
      </div>
      <div className='space-y-3 border-t border-gray-500 py-2'>
        {accordionData.map(({ id, title, content }) => (
          <Accordion key={id} open={open.includes(id)} icon={<Icon id={id} open={open} />}>
            <AccordionHeader onClick={() => handleOpen(id)} className='text-[15px]'>{title}</AccordionHeader>
            <AccordionBody>{content}</AccordionBody>
          </Accordion>
        ))}
      </div>
    </div>
    {reportManagerValue.show &&
      <ConfirmationDialog 
        openDialog = {reportManagerValue.show}
        title='Confirm Deletion'
        message='Are you sure to Delete this Reporting Manager'
        loading={reportManagerValue.loading}
        handleConfirm={confirmReportingManagerDelete}
        handleOpen={toggleConfirmationDialog}

      />
    }
    </>
  )
}

export default OfficialInfo