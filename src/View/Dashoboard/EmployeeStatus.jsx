import React from 'react'
function EmployeeStatus() {
  return (
    <>
      <div style={{display:"flex",justifyContent:"center",flexDirection:"row",gap:"35px",margin:"20px"}} >
        <div style={{ height:"100%",wordWrap: "break-word", border: "0px solid transparent", borderRadius: "5px", paddingBottom: "5%", boxShadow: "0 0 20px rgba(0, 0, 0, 0.08)", padding: "20px", fontSize: "12px" }} className='col-xl-6'>
         <div style={{fontSize:"12px",fontWeight:"700"}}>Employment Status</div>
          <hr style={{width:"98%",color:"grey",padding:"10px"}} />
          <div style={{fontSize:"12px"}}>no record</div>
        </div>

        <div style={{height:"100%", wordWrap: "break-word", border: "0px solid transparent", borderRadius: "5px", paddingBottom: "2%", boxShadow: "0 0 20px rgba(0, 0, 0, 0.08)", padding: "20px", fontSize: "12px" }} className='col-sm-6'>
        <div style={{fontSize:"12px",fontWeight:"700"}}>Upcoming Birthdays</div>
          <hr style={{width:"98%",color:"grey",padding:"10px"}} />
          <div style={{fontSize:"12px"}}>No upcoming birthday</div>


        </div>
      </div>
    </>
  )
}

export default EmployeeStatus