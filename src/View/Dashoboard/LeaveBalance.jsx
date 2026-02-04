import { Typography } from '@material-tailwind/react'
import React from 'react'

const LeaveBalance = (props) => {
  const { data } = props
  const personalInfo = data?.personalInfo
  const leaveBalanceData = personalInfo?.leaveBalance

  const LeaveBalanceHeader = ['Leave','Total','Availed','Carry Forward',	'From', 'To','Expiry',	'Last Updated']
  return (
    <div className='space-y-4'>
      <div>
          <span className='text-[#3DA5F4]'>{data.empView.section.title}</span>
      </div>
      <div className='space-y-3 border-t border-gray-500 py-2'>
        <table className="w-full min-w-max table-auto text-start">
          <thead>
            <tr>
              {LeaveBalanceHeader.map((head) => (
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
            {leaveBalanceData.map((ele, i)=>(
              <tr key={i}>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.leaveData?.title}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.total_leaves}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.availed}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {`for ${ele?.leaveData?.carry_forward} ${ele?.leaveData?.carry_forward > 1 ? 'years' : 'year'}`}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.initiated_date_r}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.maturity_date_r}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.expiry_r}
                  </Typography>
                </td>
                <td className='py-2'>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {ele?.initiated_date_r}
                  </Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LeaveBalance