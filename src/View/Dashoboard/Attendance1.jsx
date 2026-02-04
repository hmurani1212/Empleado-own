import React from 'react'
import { GrFormNextLink } from 'react-icons/gr';
import { ImCross } from 'react-icons/im';
import Btn from '../../Components/Btn';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
function Attendance1() {
  return (
   <>
   <div className='Main d-flex flex-column justify-content-end' >
        <div style={{margin:"0",width:"100%",fontSize:"12px"}}>
            <div style={{padding:"10px",display:"flex",justifyContent:"space-between"}}>
            <span><h5 style={{fontWeight:"700",fontSize:"14px",color:"#474747"}}> <GrFormNextLink style={{fontSize:"20px",color:"grey"}} />Today's Attendance</h5></span>
            <span> <ImCross style={{fontSize:"small",color:"grey"}} /></span>
            </div>
            <hr style={{width:"100%"}} />

        
            <Form.Group aria-label="Default select example" size="sm" controlId="formBasicEmail">
                <Form.Label> </Form.Label>
                <Form.Control style={{borderRadius:"20px",width:"250px",marginTop:"-25px",height:"30px"}} type="email" placeholder="search employee" />
            </Form.Group>

            <div style={{ width: "99%", margin: "10px" }}>
            <Table striped bordered hover size="lg">
            <thead>
            <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Late minutes</th>
                <th>In time</th>
                <th>Out time</th>
            </tr>
            </thead>
            <tbody>
            <tr style={{background: "rgba(232, 141, 114, 0.24)",color: "rgba(204, 34, 34, 0.76)"}}>
                <td>Ummihabiba</td>
                <td></td>
                <td></td>
                <td>0</td>
                <td>Absent</td>
                <td>Absent</td>
            </tr>
            </tbody>
        </Table>
        </div>
        </div>


        <div style={{position:"absolute",top:"90%",width:"100%"}} >
            <hr style={{width:"100%"}} />
            <div style={{gap:"8px"}} className='d-flex justify-content-end' >
            <Btn 
            text='Export'
            color='#FFF' 
            border='none'
            backgroundColor= 'rgb(74, 179, 206)'
            borderRadius=' 5px'
            fontweight= '400'
            fontSize={'12px'}
            height='28px'
            width='70px'
            />

           <Btn 
           
           text='close'
           color='grey' 
           border='1px solid'
           backgroundColor= '#eee'
           borderRadius=' 5px'
           fontSize={'12px'}
           fontWeight= '400'
           height='28px'
           width='70px'
           />
           </div>
        </div>
 </div>
   </>
  )
}

export default Attendance1