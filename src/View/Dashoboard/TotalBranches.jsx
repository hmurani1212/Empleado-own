import React from 'react'
import { Card } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { RiBuilding4Fill } from 'react-icons/ri';
function TotalBranches() {
  return (
   <>

   <Card style={{width:"300px",height:"90px",background:"#fda006",border:"none"}}>
       
       <div style={{}} className="row w-100 h-100">
       




          <div className="col-4 d-flex justify-content-center align-items-center">
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",border:"none",borderRadius:"10px",height:"35px",width:"35px",backgroundColor:"#FFF"}}>
              <RiBuilding4Fill width='50px' size={'20px'} color="#fda006"/>
              </div>
          </div>

          <div style={{color:"#FFF",fontSize:"14px"}} className="col-8 d-flex flex-column justify-content-center align-items-center">
            <div>1</div>
            <div>Total Branches</div>

          </div>

       </div>
      
    </Card>
   </>
  )
}

export default TotalBranches