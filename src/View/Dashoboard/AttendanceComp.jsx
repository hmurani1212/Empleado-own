import React from 'react';
import './AttendanceComp.css'; // Import the CSS file
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function AttendanceComp() {
  return (
    <>
      <div style={{ wordWrap: "break-word", border: "0px solid transparent", borderRadius: "5px", boxShadow: "0 0 20px rgba(0, 0, 0, 0.08)", width: "300px", height: "140px", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", padding: "10px", fontSize: "14px" }}>
        <div className='circle'>0</div>
        <div style={{ color: "#878787", fontSize: "12px" }}>Today's Attendance</div>
      </div>
    </>
  )
}

export default AttendanceComp;
