import React from 'react';
import './TodayLateComers.css'; // Import the CSS file
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function TodayLateComers() {
  return (
    <>
      <div style={{ wordWrap: "break-word", border: "0px solid transparent", borderRadius: "5px", boxShadow: "0 0 20px rgba(0, 0, 0, 0.08)", width: "300px", height: "140px", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", padding: "10px", fontSize: "14px" }}>
        <div className='circle2'>0</div>
        <div style={{ color: "#878787", fontSize: "12px" }}>Today's Late Comer's</div>
      </div>
    </>
  )
}

export default TodayLateComers;
