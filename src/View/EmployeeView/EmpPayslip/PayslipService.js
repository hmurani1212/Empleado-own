// PayslipService.js - Service for handling payslip API calls
import { payRollinstancemodule } from '../../../Model/base';


const PayslipService = {
  // Export payslip for employee - downloads payslip data
  // IMPORTANT: Always use 'emp_id' as the parameter name, NOT 'oneid'
  
  exportPayslip: async (year, month, empId) => {
    try {
      console.log('PayslipService - exportPayslip params:', {
        year,
        month,
        empId,
        emp_id: empId
      });
      
      const requestConfig = {
        method: 'GET',
        url: `/manage_payslip/export-payslip`,
        params: {
          year: year,
          month: month,
          // oneid: empId 
        }
      };
      
      console.log('PayslipService - Making request with config:', requestConfig);
      console.log('PayslipService - Full URL will be:', `http://172.18.0.34:8000${requestConfig.url}?year=${year}&month=${month}&emp_id=${empId}`);
      
      const response = await payRollinstancemodule.request(requestConfig);
      
      console.log('PayslipService - exportPayslip response:', response);
      return response;
    } catch (error) {
      console.error('Error exporting payslip:', error);
      
      // If the error has response data, include it in the error
      if (error.response && error.response.data) {
        console.log('PayslipService - Error response data:', error.response.data);
        // Don't throw the error, return it as a response so it can be handled properly
        return {
          status: error.response.status,
          data: error.response.data
        };
      }
      
      throw error;
    }
  },

  // Fetch payslip data for a specific month and year (for display)
  // IMPORTANT: Always use 'emp_id' as the parameter name, NOT 'oneid'
  fetchPayslipData: async (month, year, empId) => {
    try {
      const response = await payRollinstancemodule.request({
        method: 'GET',
        url: `/manage_payslip/export-payslip`,
        params: {
          year: year,
          month: month,
          emp_id: empId  // Using emp_id, NOT oneid
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching payslip data:', error);
      
      // If the error has response data, return it so it can be handled properly
      if (error.response && error.response.data) {
        console.log('PayslipService - fetchPayslipData Error response data:', error.response.data);
        return error.response.data;
      }
      
      throw error;
    }
  }
};

export default PayslipService;
