import React from 'react'
import { Card } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBuilding } from 'react-icons/fa';
  

function TotalDepartments() {
    return (
        <>
     
        <Card style={{width:"300px",height:"90px",background:"#3da5f4",border:"none"}}>
            
            <div  className="row w-100 h-100">
            
               <div className="col-4 d-flex justify-content-center align-items-center">
                   <div style={{display:"flex",alignItems:"center",justifyContent:"center",border:"none",borderRadius:"10px",height:"35px",width:"35px",backgroundColor:"#FFF"}}>
                   <FaBuilding size={'20px'} color='#3da5f4'/>
                   </div>
               </div>
     
               <div style={{color:"#FFF",fontSize:"14px"}} className="col-8 d-flex flex-column justify-content-center align-items-center">
                 <div>1</div>
                 <div>Total Departments & Sub Departments</div>
     
               </div>
     
            </div>
           
         </Card>
        </>
       )
}

export default TotalDepartments
