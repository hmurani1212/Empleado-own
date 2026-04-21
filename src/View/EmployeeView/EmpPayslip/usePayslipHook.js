import { useEffect, useState } from 'react';
import PayslipService from './PayslipService';
import { showToast } from '../../../Components/Toaster/Toaster';
import useStore from '../../../Store/store';
import { getUserData, getDecodedToken } from '../../../Authentication/jwt_decode';
import useEmpPayslipServices from '../../../ViewModel/EmpViewModel/EmpPayslipViewModel/EmpPayslipServices';

const usePayslipHook = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isComprehensiveLoading, setIsComprehensiveLoading] = useState(false);
    const [payslipData, setPayslipData] = useState(null);
    const [comprehensiveSalaryData, setComprehensiveSalaryData] = useState(null);
    const [showPayslip, setShowPayslip] = useState(false);
    const empDashboardData = useStore((state)=> state.empDashboardData)
    const { getComprehensiveSalaryData } = useEmpPayslipServices();
    
    // Get employee ID from multiple sources
    const idSet = useStore((state) => state.idSet);
    const userData = getUserData();
    
    // Determine employee ID - prioritize emp_id over oneid/org_oneid
    // IMPORTANT: Always use emp_id (actual employee ID) instead of oneid
    let currentEmployeeId;
    
    // Get decoded token to access all fields including emp_id
    const decoded = getDecodedToken();
    
    // Priority order: emp_id > idSet > org_id (for Employee) > org_data.emp_id > org_oneid (avoid oneid)
    if (userData?.emp_id) {
        // First priority: emp_id from userData (actual employee ID)
        currentEmployeeId = userData.emp_id;
    } else if (decoded?.emp_id) {
        // Second priority: emp_id directly from decoded token
        currentEmployeeId = decoded.emp_id;
    } else if (decoded?.org_data?.emp_id) {
        // Third priority: emp_id from org_data
        currentEmployeeId = decoded.org_data.emp_id;
    } else if (decoded?.org_data?._id) {
        // Fourth priority: _id from org_data (this is the actual employee ID for Employee role)
        currentEmployeeId = decoded.org_data._id;
    } else if (idSet) {
        // Fifth priority: idSet from store
        currentEmployeeId = idSet;
    } else if (userData && userData.roleDbId === 'Employee') {
        // For Employee role, use org_id as fallback
        currentEmployeeId = empDashboardData?.section1?.emp_id;
    } else if (userData && userData.roleDbId === 'Admin') {
        // For Admin role, avoid oneid - use org_oneid only as last resort
        currentEmployeeId = userData.org_oneid;
    } else {
        // Last resort fallback - avoid oneid
        currentEmployeeId = userData?.org_id || '123';
    }

    // Dedicated oneid for comprehensive salary endpoint.
    // Must NOT fallback to org_id.
    let currentOneId;
    if (userData?.oneid) {
        currentOneId = userData.oneid;
    } else if (decoded?.oneid) {
        currentOneId = decoded.oneid;
    } else if (decoded?.org_data?.oneid) {
        currentOneId = decoded.org_data.oneid;
    } else if (userData?.org_oneid) {
        currentOneId = userData.org_oneid;
    } else {
        currentOneId = null;
    }

    const loadComprehensiveSalaryData = async () => {
        if (!currentOneId) {
            return null;
        }

        setIsComprehensiveLoading(true);
        try {
            const data = await getComprehensiveSalaryData(currentOneId);
            setComprehensiveSalaryData(data);
            return data;
        } finally {
            setIsComprehensiveLoading(false);
        }
    };

    useEffect(() => {
        loadComprehensiveSalaryData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentOneId]);

    // Download payslip data
    const downloadPayslip = async (year, month) => {
        setIsLoading(true);
        
        // Debug logging
        console.log('Payslip Hook Debug:', {
            idSet,
            userData,
            currentEmployeeId,
            year,
            month,
            role: userData?.roleDbId,
            possibleIds: {
                idSet,
                oneid: userData?.oneid,
                oneId: userData?.oneId,
                emp_id: userData?.emp_id,
                org_id: userData?.org_id,
                org_oneid: userData?.org_oneid
            }
        });
        
        // Additional debug for employee ID validation
        console.log('Employee ID validation:', {
            'idSet type': typeof idSet,
            'idSet value': idSet,
            'userData type': typeof userData,
            'userData keys': userData ? Object.keys(userData) : 'null',
            'role': userData?.roleDbId,
            'currentEmployeeId type': typeof currentEmployeeId,
            'currentEmployeeId value': currentEmployeeId,
            'currentEmployeeId length': currentEmployeeId ? currentEmployeeId.toString().length : 0
        });
        
        // Check if employee ID is available
        if (!currentEmployeeId || currentEmployeeId === '123') {
            console.error('No valid employee ID found from any source:', {
                idSet,
                userData,
                currentEmployeeId,
                possibleIds: {
                    idSet,
                    oneid: userData?.oneid,
                    oneId: userData?.oneId,
                    emp_id: userData?.emp_id,
                    org_id: userData?.org_id,
                    org_oneid: userData?.org_oneid
                }
            });
            showToast('Employee ID not found. Please login again.', 'error');
            setIsLoading(false);
            return null;
        }
        
        try {
            const response = await PayslipService.exportPayslip(year, month, currentEmployeeId);
            
            // Check if this is an error response (from service layer)
            if (response.status && response.status !== 200) {
                console.log('Error response from service:', response);
                const errorData = response.data;
                if (errorData && errorData.STATUS === 'ERROR' && errorData.ERROR_DESCRIPTION) {
                    showToast(errorData.ERROR_DESCRIPTION, 'error');
                } else if (response.status === 404) {
                    showToast(`Payslip not found for employee ID: ${currentEmployeeId}. Please check the month/year or contact HR.`, 'error');
                } else {
                    showToast('Failed to download payslip', 'error');
                }
                return null;
            }
            
            if (response.status === 200) {
                // Handle successful response
                const data = response.data;
                
                if (data.STATUS === 'SUCCESS' || data.STATUS === 'SUCCESSFUL') {
                    setPayslipData(data);
                    setShowPayslip(true);
                    
                    return data;
                } else if (data.STATUS === 'ERROR') {
                    // Handle specific error case when payslip is not generated
                    const errorMessage = data.ERROR_DESCRIPTION || 'Payslip not available for this month';
                    showToast(errorMessage, 'error');
                    return null;
                } else {
                    showToast(data.ERROR_DESCRIPTION || data.MESSAGE || 'Error downloading payslip', 'error');
                    return null;
                }
            } else {
                showToast('Failed to download payslip', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error downloading payslip:', error);
            
            // Check if it's a specific API error response
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                if (errorData.STATUS === 'ERROR' && errorData.ERROR_DESCRIPTION) {
                    showToast(errorData.ERROR_DESCRIPTION, 'error');
                } else {
                    showToast('Error downloading payslip. Please try again.', 'error');
                }
            } else {
                showToast('Error downloading payslip. Please try again.', 'error');
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch payslip data for display
    const fetchPayslipData = async (year, month) => {
        setIsLoading(true);
        
        try {
            const data = await PayslipService.fetchPayslipData(month, year, currentEmployeeId);
            
            if (data && (data.STATUS === 'SUCCESS' || data.STATUS === 'SUCCESSFUL')) {
                setPayslipData(data);
                setShowPayslip(true);
                return data;
            } else if (data && data.STATUS === 'ERROR') {
                // Handle specific error case when payslip is not generated
                const errorMessage = data.ERROR_DESCRIPTION || 'Payslip not available for this month';
                showToast(errorMessage, 'error');
                return null;
            } else {
                showToast(data?.ERROR_DESCRIPTION || data?.MESSAGE || 'No payslip data found', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching payslip data:', error);
            
            // Check if it's a specific API error response
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                if (errorData.STATUS === 'ERROR' && errorData.ERROR_DESCRIPTION) {
                    showToast(errorData.ERROR_DESCRIPTION, 'error');
                } else {
                    showToast('Error fetching payslip data. Please try again.', 'error');
                }
            } else {
                showToast('Error fetching payslip data. Please try again.', 'error');
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Close payslip display
    const closePayslip = () => {
        setShowPayslip(false);
        setPayslipData(null);
    };

    return {
        isLoading,
        isComprehensiveLoading,
        payslipData,
        comprehensiveSalaryData,
        showPayslip,
        downloadPayslip,
        fetchPayslipData,
        loadComprehensiveSalaryData,
        closePayslip,
        currentEmployeeId,
        currentOneId
    };
};

export default usePayslipHook;
