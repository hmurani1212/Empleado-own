import React from 'react';
import { Typography } from "@material-tailwind/react";

const EmployeeFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 mt-8">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="w-full h-px bg-gray-100 max-w-7xl mx-auto mb-4"></div>
        <div className="flex items-center gap-2 text-gray-400 opacity-80 hover:opacity-100 transition-opacity">
          <Typography variant="small" className="font-normal text-xs font-poppins">
            Powered by Veevo Tech &copy; {currentYear}
          </Typography>
          <img 
            src="https://emp-beta.veevotech.com/emp/assets/img/vt-logo.svg" 
            alt="Veevo Tech Logo" 
            className="h-3 w-auto grayscale opacity-50"
          />
        </div>
      </div>
    </footer>
  );
};

export default EmployeeFooter;
