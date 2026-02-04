import React, { useState } from "react";

const CircularProgress = ({ radius, stroke, progress, count, sColor, progressMainColor }) => {
  // const normalizedRadius = radius - stroke; // Adjusted radius
  // const circumference = normalizedRadius * 2 * Math.PI;

  // const strokeDashoffset = circumference - (progress / 100) * circumference;
  const [isHovered, setIsHovered] = useState(false);

  // Update the view box dimensions and circle center to account for stroke width
  // const viewBoxDimension = radius * 2 + stroke;
  // const center = radius + stroke / 2;
  const containerStyle = {
    height:  isHovered ?  `7px` : '3px',
    backgroundColor: progressMainColor,
    borderRadius: '3px',
    overflow: 'hidden',
    transform: isHovered ? 'scale(1.1)' : 'scale(1)', // Scales up to 110% when hovered
    transition: 'transform 0.3s ease-in-out',

  };

  const filledBarStyle = {
    height: '100%',
    width: `${progress}%`,
    backgroundColor: sColor,
    transition: 'width 0.3s ease-in-out',
  };

  const countStyle = {
    fontSize: isHovered ? '15px' : '12px',
    color: '#212529',
    transition: 'all 0.3s ease-in-out',
  };

  return (
    <div className="">
      {/* <svg 
        className="h-[88px] w-[90px] flex items-center justify-center cursor-pointer transition-all duration-300"
        viewBox={`0 0 ${viewBoxDimension} ${viewBoxDimension}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <circle
          stroke="#eaeaea"
          fill="none"
          strokeWidth={isHovered ? 3 : 6}
          r={normalizedRadius}
          cx={center}
          cy={center}
          className="transition-all duration-300"
          transform={`rotate(-90 ${center} ${center})`}
        />
        <circle
          className="fill-none transition-all duration-300"
          stroke={sColor}
          strokeWidth={isHovered ? 3 : 6}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={center}
          cy={center}
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          style={{ fontSize: isHovered ? '15px' : '12px', fill: isHovered ? sColor : '#212529' }} 
          className="transition-all duration-300"
        >
          {count}
        </text>
      </svg> */}
       <div
        style={containerStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer"
      >
        <div style={filledBarStyle}></div>
      </div>
    </div>
  );
};

export default CircularProgress;
