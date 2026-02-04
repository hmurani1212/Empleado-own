import React from 'react'
import { Button, Typography } from '@material-tailwind/react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useDashboard from '../../ViewModel/DashboardViewModel/DashboardServices'
import useEmpAccelerateService from '../../ViewModel/EmployeeViewModel/EmpAccelerateService'
import { getAllMonths, getAllYears } from '../../services/__appServicesData'



const accelerateHeader = [
 ' Dept Name',	'Total Milestone',	'Completed',	'Completed & Rated	Assigned',	'Picked',	'Rating Avg(out of 5)'
]


const AcceleratePerformance = (props) => {
  const { data } = props
  const { accelerateData } = useDashboard()
  const { selectType, accelerateValue, handleSelectChange,
    handleChangeAccelerateValue, getAccelerateData

  } = useEmpAccelerateService()
  const empId = data.empView.section.empId

  const years = getAllYears()
  const months = getAllMonths()

  return (
    <div className='space-y-4'>
      <div>
        <span className='text-[#3DA5F4]'>Employee Accelerate Performance</span>
      </div>
      <div className='space-y-3 border-t border-gray-500 pt-10 pb-2'>
        <div>
         <label className='text-[#698592] text-[12px]'>Report Type</label>

          <CustomSelect 
            placeHolderTitle= 'Report Type'
            value={accelerateValue?.reportType}
            options={selectType?.map((ele) => ({ value: ele.id, label: ele.name }))} 
            onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'reportType')}
            customStyles={false}
          />
        </div>

        {accelerateValue?.reportType?.value === 2 ?
          <div className='flex items-center gap-5'>

            <div className='flex-1 space-y-1'>
              <label className='text-[#698592] text-[12px]'>From Date</label>
              <input 
                  className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                  type='date' 
                  value={ accelerateValue?.date}
                  name='date' 
                  onChange={handleChangeAccelerateValue}
              />
            </div>
            <div className='flex-1 space-y-1'>
              <label className='text-[#698592] text-[12px]'>To Date</label>
              <input 
                  className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                  type='date' 
                  value={ accelerateValue?.to_date}
                  name='to_date' 
                  onChange={handleChangeAccelerateValue}
              />
            </div>
          </div>
        
        :  
        accelerateValue.reportType?.value === 3 ?

          <div className='flex items-center gap-5'>
           <div className='flex-1 space-y-1'>
              <label className='text-[#698592] text-[12px]'>Month</label>

              <CustomSelect 
                placeHolderTitle= 'Year'
                value={accelerateValue?.month}
                options={months?.map((ele) => ({ value: ele.id, label: ele.title }))} 
                onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'month')}
                customStyles={false}
              />
            </div>
            <div className='flex-1 space-y-1'>
              <label className='text-[#698592] text-[12px]'>Year</label>
              <CustomSelect 
                placeHolderTitle= 'Month'
                value={accelerateValue?.year}
                options={years.map((year)=>({value: year, label: year}))}
                onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'year')}
                customStyles={false}
              />
            </div>
          </div>

          :

          null
      }
      <div className='flex justify-end'>
            <Button 
                onClick={()=>getAccelerateData(empId)} 
                variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
                loading={accelerateValue.loading}
            >
                <span>Get Data</span>
            </Button>
        </div>
      </div>

      <div className='space-y-3 border-t border-gray-500 pt-10 pb-2'>
        <table className="w-full min-w-max table-auto text-start">
            <thead>
              <tr className=''>
                {accelerateHeader.map((head) => (
                  <th
                    key={head}
                    className="py-4 text-center border border-gray-500"
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
               {accelerateData?.length > 0 ? accelerateData?.map((ele, i)=>(
                <tr key={i} className='text-center'>
                  <td className='py-2 '>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {ele?.emp_data.dept_name}
                    </Typography>
                  </td>
                  <td className='py-2'>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {ele?.total}
                    </Typography>
                  </td>
                  <td className='py-2'>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {ele?.completed}
                    </Typography>
                  </td>
                  <td className='py-2'>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {ele?.closed_completed}
                    </Typography>
                  </td>
                  <td className='py-2'>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {ele?.picked}
                    </Typography>
                  </td>
                  <td className='py-2'>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {ele?.rating_avg}
                    </Typography>
                  </td>
                  
                </tr>
              ))
              :
              <tr>
                <td  colSpan={accelerateHeader.length} className="p-2 text-center">No Data Found</td>
              </tr>
            } 
            </tbody>
        </table>
      </div>

    </div>
  )
}

export default AcceleratePerformance