import React from 'react'
import DetailCardAtt from '../../Components/CustomDetailCard/DetailCardAtt'
import { FaWpforms } from "react-icons/fa";
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices';
import ApplicationInfo from './ApplicationInfo';
import RequestedAdjust from './RequestedAdjust';

const DetailTimeAdjRequest = () => {
  const { handleCloseAttDetail, individualRequestDetail } = useAttendance()
  const steps = [
    { id: 'Application', title: 'Application', component: <ApplicationInfo /> },
    { id: 'Requested Adjustment', title: 'Requested Adjustment', component: <RequestedAdjust /> },
  ]
  return (
    <div>
      <DetailCardAtt
        steps={steps}
        image={<FaWpforms className='text-[#3da5f4] text-[40px]' />}
        name='Time Adjustment Request'
        empName={individualRequestDetail?.map((ele, index) => {
          return (
            <div key={index}>
              {ele.user_name}
            </div>
          )
        })}
        handleClose={handleCloseAttDetail}
      />
    </div>
  )
}

export default DetailTimeAdjRequest