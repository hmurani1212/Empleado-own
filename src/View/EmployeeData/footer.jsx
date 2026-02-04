import React from 'react';

const EmployeeFooter = () => {
  return (
    <div className="w-full mt-8">
      <div className="flex justify-center items-center py-4">
        <div className="flex items-center space-x-2 text-gray-400">
          <span className="text-sm">Powered by Veevo Tech</span>
          <img 
            src="https://emp-beta.veevotech.com/emp/assets/img/vt-logo.svg" 
            alt="Veevo Tech Logo" 
            className="h-4 w-auto"
          />
        </div>
      </div>
      <div className="w-full h-px bg-gray-300"></div>
    </div>
  );
};

export default EmployeeFooter;
