import React from 'react'
import { GrFormNextLink } from 'react-icons/gr';
import { ImCross } from 'react-icons/im';
import Btn from '../../Components/Btn';

function Attendance3() {
  return (
    <>
     <div style={{margin:"0",width:"100%",fontSize:"12px"}}>
            <div style={{padding:"10px",display:"flex",justifyContent:"space-between"}}>
            <span><h5 style={{fontWeight:"700",fontSize:"14px",color:"#474747"}}> <GrFormNextLink style={{fontSize:"20px",color:"grey"}} /> Last 7 days late comers...</h5></span>
            <span> <ImCross style={{fontSize:"small",color:"grey"}} /></span>
            </div>
            <hr style={{width:"100%"}} />
            <div style={{margin:"10px"}}>No late comers</div>






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

export default Attendance3