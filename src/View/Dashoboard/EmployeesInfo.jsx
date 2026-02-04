import {Card, CardBody, Typography } from '@material-tailwind/react'
import React from 'react'
import { FaUserTie } from 'react-icons/fa'

const EmployeesInfo = (props) => {
  const { data } = props
  return (
    <div className='grid grid-cols-4 gap-1'>
      {data.map((ele, i)=>(

        <Card key={i} className='p-2'>
          <CardBody className='flex items-center justify-between'>
            <div>
              <span><FaUserTie /></span>
            </div>
            <div>
              <Typography>{ele.id}</Typography>
              <Typography>name</Typography>
            </div>
          </CardBody>
        </Card>
        // <div key={ele.id} className='col-lg-3 col-md-6 dashboardEmpInfoContainer' >
        //   <div className = 'd-flex flex-row align-items-center gap-5 p-3 rounded dashboardEmpInfoContainerInner'>
            
        //     <div className='dashboardEmpInfoIcon'>

        //       <span><FaUserTie size={'20px'} color='#0acf97'/></span>
        //     </div>
        //     <div className='d-flex flex-column align-items-center gap-1 dashboardEmpInfoContainerInnerNumtitle'>
        //       <span className='dashboardEmpInfoContainerInnerNum'>{ele.id}</span>
        //       <span className='dashboardEmpInfoContainerInnertitle'>helo ello</span>
        //     </div>
        //   </div>
        // </div>
      ))}
    </div>
  )
}

export default EmployeesInfo