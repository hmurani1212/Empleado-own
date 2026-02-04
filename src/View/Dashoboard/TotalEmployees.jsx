import React from 'react'
import { Card } from 'react-bootstrap'
import { FaUserTie } from 'react-icons/fa';
function TotalEmployees() {
  return (
   <>

   {/* <Card style={{height:"90px",background:"#0acf97",border:"none"}}> */}
   <Card>
       
       <div style={{}} >
       




          <div className="col-4 d-flex justify-content-center align-items-center">
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",border:"none",borderRadius:"10px",height:"35px",width:"35px",backgroundColor:"#FFF"}}>
              <FaUserTie size={'20px'} color='#0acf97'/>
              </div>
          </div>

          <div style={{color:"#FFF",fontSize:"14px"}} className="col-8 d-flex flex-column justify-content-center align-items-center">
            <div>1</div>
            <div>Total Employees</div>

          </div>

       </div>
      
    </Card>
   </>
  )
}

export default TotalEmployees