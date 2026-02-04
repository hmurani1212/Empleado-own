import React from 'react'

function Attendance4() {
  return (
    <>
    <div className='Main' style={{padding:"45px"}}>
        <div className='d-flex justify-content-space-evenly'>
        <div className='col-sm-12 col-md-6 limit-portion d-flex flex-row align-items-center'>
        <div><img
            src="https://emp-beta.veevotech.com/images/new_icons/limit.png"
            alt="Logo"
            height={45}
            width={48}
            style={{ maxWidth:"100%",   }}
        /></div>
            <div> Available Limit = 10</div>
        </div>

        <div className='col-sm-12 col-md-6 limit-portion d-flex flex-row align-items-center'>
        <div><img
            src="https://emp-beta.veevotech.com/images/new_icons/emp.png"
            alt="Logo"
            height={31}
            width={22}
            style={{ maxWidth:"100%",   }}
        /></div>
            <div> Added Employees = 0</div>
        </div>
        </div>


        <div style={{fontSize:"16px",color:"#878787",fontWeight:"400",marginBlock:"50px"}}>Want to upgrade your package? please visit oneid with owner account to update subscription or contact our team</div>
        <div className='col-sm-12 d-flex flex-row'>
            <div><img
            src="https://emp-beta.veevotech.com/images/new_icons/phone.png"
            alt="Logo"
            height={35}
            width={35}
            style={{ maxWidth:"100%",   }}
        /></div>
            <div> +92 - 304 - 111 8333</div>
        
        </div>

    </div>


    </>
  )
}

export default Attendance4