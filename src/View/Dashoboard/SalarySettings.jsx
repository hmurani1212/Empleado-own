import { Button, Radio, Typography } from '@material-tailwind/react'
import React from 'react'
import useSettingServices from '../../ViewModel/EmployeeViewModel/SallarySettingServices'
import { FaXmark } from 'react-icons/fa6'
import { TiTick } from 'react-icons/ti'
import { CiEdit } from 'react-icons/ci'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { exGratia, gratuityData, paymentMethod } from '../../services/EmpServices'

const SalarySettings = (props) => {
  const { data } = props
  const personalInfo = data?.personalInfo
  const salaryData = personalInfo?.salaryData
  const bankAccountInfo = personalInfo?.salaryData?.bank_account_info
  const salaryInfo = personalInfo?.salaryData?.salary_info
  const AllowancesDeduction = personalInfo?.salaryData?.allowances?.inc_ded
				
  const AllowDeductionHeader=['Title', 'Type', 'Amount', 'Recurring', 'Date/Duration']

  const { salarySettingValues, handleShowEditSalarySetting, handleCloseEditSalarySetting,
    salarySettingChangeHandler, handleSelectOfficialInfoSalary,handleUpdateEmpOfficialInfoSalary,
    bankAccountInfoValue,handleShowEditBankAccInfo,handleCloseEditBankAccInfo, handleEmpOBankAccInfoInputChange,
    handleSelectBankAccInfo, handleUpdateBankAccountInfo
   } = useSettingServices()
  // console.log('salarySettingValues', salarySettingValues)

  return (
    <div className='space-y-4'>
      <div>
        <span className='text-[#3DA5F4]'>{data.empView.section.title}</span>
      </div>
      <div className='space-y-2 border-b border-gray-500 py-2 px-4'>
        <div className='flex items-center'>
          <div className='flex-[0.5]'>
              <span className='font-bold text-[15px] text[#474747]'>Salary Template Name</span>
          </div>
          <div className='flex-1 flex items-center justify-between'>
            {salarySettingValues.show ?
              <div className='w-[70%]'>
                <CustomSelect 
                  placeHolderTitle = 'Salary Template'
                  value={
                      salarySettingValues.salaryTemplate?.find(option => option.id ===  salarySettingValues.template) 
                      ? { value: salarySettingValues.salaryTemplate?.find(option => option.id ===  salarySettingValues.template).id, 
                          label: `${salarySettingValues.salaryTemplate.find(option => option.id === salarySettingValues.template).name} - (${salarySettingValues.salaryTemplate.find(option => option.id === salarySettingValues.template).salary_amount})`

                      }
                      :
                      salarySettingValues.template
                  }
                  options={salarySettingValues?.salaryTemplate?.map((type) => ({ value: type.id, label: `${type.name} - (${type.salary_amount})` }))} 
                  onChangeHandler={(selectedOption) => handleSelectOfficialInfoSalary(selectedOption, 'template')}
                  customStyles={false}
                    
                />
              </div>
            :
              <div className='flex items-center gap-1'>

                <span>{salaryData?.name},</span>
                <span>Ref #{salaryData?.id}</span>
              </div>
            }

              {salarySettingValues.show ?

                      <div className='flex items-center gap-2'>
                          <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                              onClick={handleCloseEditSalarySetting}
                          ><FaXmark /></span>
                          {salarySettingValues.loading ? 

                          <Button className='p-1' color='blue' loading={salarySettingValues.loading} value=''></Button>
                          :
                              <span className='bg-[#0acf97] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                                  onClick={()=>handleUpdateEmpOfficialInfoSalary(personalInfo.emp_data.id)}
                              ><TiTick /></span>
                          }
                      </div>

                      :

                      salarySettingValues.loading ? 

                      <Button className='p-1' color='blue' loading={salarySettingValues.loading} value=''></Button>
                      :
                      <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                        onClick={()=>handleShowEditSalarySetting(personalInfo.emp_data.id)}
                      ><CiEdit /></span>
                    }
          </div>
        </div>
        {!salarySettingValues.show &&
        <>
          <div className='flex items-center'>
            <div className='flex-[0.5]'>
                <span className='font-bold text-[15px] text[#474747]'>Basic Pay</span>
            </div>
            <div className='flex-1 flex items-center gap-1'>
            
              <span>{salaryData?.salary_amount}</span>
              
            </div>
          </div>
         
          <div className='flex items-center'>
            <div className='flex-[0.5]'>
                <span className='font-bold text-[15px] text[#474747]'>Overtime Rate</span>
            </div>
            <div className='flex-1 flex items-center gap-1'>
                <span>{salaryData?.overtime_rate}/Hour</span>
            </div>
            
          </div>
          </> 
         }
        <div className='flex items-center'>
          <div className='flex-[0.5]'>
              <span className='font-bold text-[15px] text[#474747]'>Mode of payment</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
            {salarySettingValues.show ?
              <div className='w-[70%]'>
                <CustomSelect 
                  placeHolderTitle = 'Salary Template'
                  value={
                      paymentMethod.find(option => option.value ===  salarySettingValues.payment) 
                      ? { value: paymentMethod.find(option => option.value ===  salarySettingValues.payment).value, 
                          label: paymentMethod.find(option => option.value === salarySettingValues.payment).title

                      }
                      :
                      salarySettingValues.payment
                  }
                  options={paymentMethod.map((type) => ({ value: type.value, label: type.title}))} 
                  onChangeHandler={(selectedOption) => handleSelectOfficialInfoSalary(selectedOption, 'payment')}
                  customStyles={false}
                    
                />
              </div>
            :

              <span className='capitalize'>{salaryData?.payment_mode}</span>
                }
          </div>
        </div>
        <div className='flex items-center'>
          <div className='flex-[0.5]'>
              <span className='font-bold text-[15px] text[#474747]'>Ex-Gratia on overtime</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
            {salarySettingValues.show ? 
              <div className='w-full'>
                {exGratia.map((ele, i)=>(
                  <Radio name='ex_gratia' color='blue' key={i} label={ele.title} 
                    onChange={salarySettingChangeHandler}
                    value={ele.value}
                    checked={salarySettingValues.ex_gratia == ele.value}
                  />
                ))}

                {salarySettingValues.ex_gratia !== '0' &&
                <div>
                  <input 
                      className='text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                      type='text' 
                      name='ex_gratia_amount'
                      value={salarySettingValues?.ex_gratia_amount} 
                      onChange={salarySettingChangeHandler}
                    />
                  </div>
                }
              </div>
                :

                <span>{salaryData?.ex_gratia === '0' ? 'No' : `Yes/${salarySettingValues.ex_gratia_amount}`}</span>
            }
          </div>
        </div>
        <div className='flex items-center'>
          <div className='flex-[0.5]'>
              <span className='font-bold text-[15px] text[#474747]'>Gratuity</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
            {salarySettingValues.show ? 
                      <div>
                        {gratuityData.map((ele, i)=>(
                          <Radio name='gratuity' color='blue' key={i} label={ele.title} 
                            onChange={salarySettingChangeHandler}
                            value={ele.value}
                            checked={salarySettingValues.gratuity == ele.value}
                          />
                        ))}
                      </div>
                  :

                  <span>{salaryData?.gratuity === '0' ? 'No' : 'Yes'}</span>
              }
          </div>
        </div>
      </div>
      <div>
        <div>
          <span className='text-[#3DA5F4]'>Bank account info</span>
        </div>
        <div className='space-y-2 border-b border-gray-500 py-2 px-4'>
        <div className='flex items-center'>
          <div className='flex-[0.5]'>
              <span className='font-bold text-[15px] text[#474747]'>Bank</span>
          </div>
          <div className='flex-1 flex items-center justify-between gap-1'>
            <div className='w-full'>
              {bankAccountInfoValue.show ?  
                      <input 
                        className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                        type='text' 
                        value={bankAccountInfoValue?.bankName} name='bankName' 
                        onChange={handleEmpOBankAccInfoInputChange}
                      />
                      :
              <span>{bankAccountInfo?.bank_name}</span>
                    }
            </div>
            
            {bankAccountInfoValue.show ?

                <div className='flex items-center gap-2'>
                    <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                        onClick={handleCloseEditBankAccInfo}
                    ><FaXmark /></span>
                    {bankAccountInfoValue.loading ? 

                    <Button className='p-1' color='blue' loading={bankAccountInfoValue.loading} value=''></Button>
                    :
                        <span className='bg-[#0acf97] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                            onClick={()=>handleUpdateBankAccountInfo(personalInfo.emp_data.id)}
                        ><TiTick /></span>
                    }
                </div>

                  :

                  bankAccountInfoValue.loading ? 

                  <Button className='p-1' color='blue' loading={bankAccountInfoValue.loading} value=''></Button>
                  :
                  <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                    onClick={()=>handleShowEditBankAccInfo(personalInfo.emp_data.id)}
                  ><CiEdit /></span>
            }
              
          </div>
        </div>
        
          <div className='flex items-center'>
            <div className='flex-[0.5]'>
                <span className='font-bold text-[15px] text[#474747]'>Branch</span>
            </div>
            <div className='flex-1 flex items-center gap-1'>
              {bankAccountInfoValue.show ?
                <input 
                        className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                        type='text' 
                        value={bankAccountInfoValue?.branchName} name='branchName' 
                        onChange={handleEmpOBankAccInfoInputChange}
                      />
                :
                <span>{bankAccountInfo?.branch_name}</span>
              }
              </div>
          </div>
        <div className='flex items-center'>
          <div className='flex-[0.5]'>
              <span className='font-bold text-[15px] text[#474747]'>Branch Code</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
            {bankAccountInfoValue.show ?  
                      <input 
                        className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                        type='text' 
                        value={bankAccountInfoValue?.branchCode} name='branchCode' 
                        onChange={handleEmpOBankAccInfoInputChange}
                      />
                      :
              <span>{bankAccountInfo?.bank_branch_code}</span>
                    }
          </div>
        </div>
        <div className='flex items-center'>
          <div className='flex-[0.5]'>
              <span className='font-bold text-[15px] text[#474747]'>Account Type</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
            {bankAccountInfoValue.show ?
              <div className='w-[70%]'>
                <CustomSelect 
                  placeHolderTitle = 'Account Type'
                  value={
                      bankAccountInfoValue.accountTypeList?.find(option => option.id ===  bankAccountInfoValue.accountType) 
                      ? { value: bankAccountInfoValue.accountTypeList?.find(option => option.id ===  bankAccountInfoValue.accountType).id, 
                          label: bankAccountInfoValue.accountTypeList.find(option => option.id === bankAccountInfoValue.accountType).account_type

                      }
                      :
                      bankAccountInfoValue.accountType
                  }
                  options={bankAccountInfoValue?.accountTypeList?.map((type) => ({ value: type.id, label:type.account_type}))} 
                  onChangeHandler={(selectedOption) => handleSelectBankAccInfo(selectedOption, 'accountType')}
                  customStyles={false}
                    
                />
              </div>
            :
              <span>{bankAccountInfo?.bank_account_type}</span>
            }
          </div>
        </div>
        {(bankAccountInfoValue.show && (bankAccountInfoValue.accountType === 'other' || bankAccountInfoValue.accountType?.value === 'other')) &&
        <div className='flex items-center'>
          <div className='flex-[0.5]'>
              <span className='font-bold text-[15px] text[#474747]'>New Account Type</span>
          </div>
          <div className='flex-1 flex items-center gap-1'> 
            <input 
              className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
              type='text' 
              value={bankAccountInfoValue?.newAccountType} name='newAccountType' 
              onChange={handleEmpOBankAccInfoInputChange}
            />
          </div>
        </div>
        }
        <div className='flex items-center'>
          <div className='flex-[0.5]'>
              <span className='font-bold text-[15px] text[#474747]'>Account Title</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
            {bankAccountInfoValue.show ?  
                      <input 
                        className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                        type='text' 
                        value={bankAccountInfoValue?.bankAccountTitle} name='bankAccountTitle' 
                        onChange={handleEmpOBankAccInfoInputChange}
                      />
                      :
              <span>{bankAccountInfo?.bank_account_title}</span>
            }
          </div>
        </div>
        <div className='flex items-center'>
          <div className='flex-[0.5]'>
              <span className='font-bold text-[15px] text[#474747]'>Account No</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
            {bankAccountInfoValue.show ?  
                      <input 
                        className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                        type='text' 
                        value={bankAccountInfoValue?.bankAccountNo} name='bankAccountNo' 
                        onChange={handleEmpOBankAccInfoInputChange}
                      />
                      :
              <span>{bankAccountInfo?.bank_account_no}</span>
            }
          </div>
        </div>
      </div>
      </div>
      <div>
        <div>
          <span className='text-[#3DA5F4]'>Net Salary</span>
        </div>
        <div className='space-y-2 border-b border-gray-500 py-2 px-4'>
        <div className='flex items-center'>
          <div className='flex-[1]'>
              <span className='font-bold text-[15px] text[#474747]'>Increments</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
              <span>{salaryInfo?.increments === null ? 0 : salaryInfo?.increments}</span>
          </div>
        </div>
        <div className='flex items-center'>
          <div className='flex-[1]'>
              <span className='font-bold text-[15px] text[#474747]'>Incentives</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
              <span>{salaryInfo?.incentives === null ? 0 : salaryInfo?.incentives}</span>
          </div>
        </div>
        <div className='flex items-center'>
          <div className='flex-[1]'>
              <span className='font-bold text-[15px] text[#474747]'>Deductions</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
              <span>{salaryInfo?.deductions === null ? 0 : salaryInfo?.deductions}</span>
          </div>
        </div>
        <div className='flex items-center'>
          <div className='flex-[1]'>
              <span className='font-bold text-[15px] text[#474747]'>EOBI</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
              <span>{salaryInfo?.eobi}</span>
          </div>
        </div>
        <div className='flex items-center'>
          <div className='flex-[1]'>
              <span className='font-bold text-[15px] text[#474747]'>Provident Fund</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
              <span>{salaryInfo?.provident_fund}</span>
          </div>
        </div>
        <div className='flex items-center'>
          <div className='flex-[1] flex items-center gap-2'>
              <span className='font-bold text-[15px] text[#474747]'>Net Salary</span>
              <span className='text-[12px] text[#474747]'>Excluding Attendance deduction</span>
          </div>
          <div className='flex-1 flex items-center gap-1'>
              <span>{salaryInfo?.net_salary_excluding_attendance_deduction}</span>
          </div>
        </div>
      </div>
      </div>
      <div>
        <div>
          <span className='text-[#3DA5F4]'>Allowances/Deductions</span>
        </div>
        <div className='space-y-2 py-2 px-4'>
          <table className="w-full min-w-max table-auto text-start">
            <thead>
              <tr>
                {AllowDeductionHeader.map((head) => (
                  <th
                    key={head}
                    className="py-4 text-left"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="leading-none font-semibold"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AllowancesDeduction?.map((ele, i)=>(
              <tr key={i}>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.title}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.d_type == 0 ? 'Incentive': 'Deduction'}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.amount}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.re_occuring == 1 ? 'Recurring' : 'One Time'}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.timestamp}
                  </Typography>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
    </div>
  )
}

export default SalarySettings