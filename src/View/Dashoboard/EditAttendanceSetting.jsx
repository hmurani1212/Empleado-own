import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { Button, Input, Typography } from '@material-tailwind/react'
import { convertDMY, convertTimeAMPM } from '../../services/__dateTimeServices'


const lastTenDaysHeader = ['Date', 'In Time', 'Out Time']

const EditAttendanceSetting = (props) => {
  const { data, empId, updateAttendanceSettingHrPolicy, handleSelectAttendanceSettingChange } = props
  // console.log('data', data)
  const policyList = data?.data?.org_policy_option_list
  const recentAttendance = data?.data?.recentAttendance
  return (
    <div 
    // className='h-[200px] customScroll'
    //   style={{overflowY: 'auto'}}
    >
      <div className='space-y-3'>
        <div className='flex flex-col gap-2'>
          <label className='text-[#7a929e]'>Hr Policy</label>
          <CustomSelect
            placeHolderTitle='Hr Policy'
            value={data.hrPolicy}
            options={policyList?.map((policy) => ({ value: policy.id, label:`${policy.policy_name} #${policy.id}` }))}
            onChangeHandler={(selectedOption) => handleSelectAttendanceSettingChange(selectedOption, 'hrPolicy')}
            customStyles={false}
          />
        </div>
        <div>
          <label>BioId</label>
          <Input 
            value={data.bioId}
            label='BioId'
            color='blue'
            disabled
          />
        </div>


        <div className='flex gap-4'>
          
            <Button variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
              onClick={()=>updateAttendanceSettingHrPolicy(empId)}
              loading={data.updateLoading}
            >
              <span>Update</span>
            </Button>
        </div>

        <div>
          <span className='text-[13px]'>Last 10 days attendance</span>
        </div>
        <div className='h-[200px] overflow-y-auto customScroll'>
          <table className="w-full min-w-max table-auto text-start">
            <thead>
              <tr>
                {lastTenDaysHeader.map((head) => (
                  <th
                    key={head}
                    className="py-4 text-center bg-blue-gray-50"
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
              {recentAttendance?.map((ele, i)=>{
                const inKeys = Object.keys(ele).filter(key => key.startsWith('in'));
                const outKeys = Object.keys(ele).filter(key => key.startsWith('out'));
                const isLast = i === recentAttendance?.length - 1;
                const classes = isLast ? "" : "border-b border-blue-gray-50";
                return(
                <tr key={i} className='space-y-2'>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal text-center"
                    >
                      {convertDMY(ele.in_1)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal text-center"
                    >
                       {inKeys.map((key, index) => (
                          <div key={index}>{convertTimeAMPM(ele[key])}</div>
                        ))}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal text-center"
                    >
                       {outKeys.map((key, index) => (
                          <div key={index}>{convertTimeAMPM(ele[key])}</div>
                        ))}
                    </Typography>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EditAttendanceSetting