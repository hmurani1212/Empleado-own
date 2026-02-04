import React from "react";
import useBulkService from "../../ViewModel/EmployeeViewModel/bulkServices";

const EmployeesBulkWrapper = ({ children, onBulkServiceReady }) => {
  const bulkService = useBulkService();
  
  React.useEffect(() => {
    if (onBulkServiceReady) {
      onBulkServiceReady(bulkService);
    }
  }, [onBulkServiceReady]); // Removed bulkService from dependencies to prevent infinite loop

  return children;
};

export default EmployeesBulkWrapper;
