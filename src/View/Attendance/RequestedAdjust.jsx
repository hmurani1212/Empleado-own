import React from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices'
import { Typography } from '@material-tailwind/react'
import { formatTimestamp } from '../../services/__formApprovalServices'
import formatTime from '../../services/__attendanceServices'

const RequestedAdjust = () => {
  const {individualRequestDetail, editAdjRequest} = useAttendance()

  return (
    <>
    <div>
      <table className="w-[100%] min-w-max text-left">
        
        <tbody>
          {individualRequestDetail?.map((ele, index) => {
            const isLast = index === individualRequestDetail.length - 1;
            const classes = isLast ? "p-3" : "p-3 border-b border-blue-gray-50";
            return(
              <tr key={index}>
                <td className={classes}>
                  <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                  >
                    {ele && ele.form_data && ele.form_data.date}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                  >
                    {`${ele && ele.form_labels && ele.form_labels.in_time} : 
                    ${ele && ele.form_data &&  formatTime(ele.form_data.in_time)}
                    `}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                  >
                    {`${ele && ele.form_labels && ele.form_labels.out_time} : 
                    ${ele && ele.form_data &&  formatTime(ele.form_data.out_time)}
                    `}
                    </Typography>
                </td>
                <td className={classes}>
                  <div>
                    <CustomButton title='Edit' onClick={() => editAdjRequest(ele)}/>
                  </div>
                </td>


              </tr>
            )
          })}
        </tbody>

      </table>
    </div>
    </>
  )
}

export default RequestedAdjust