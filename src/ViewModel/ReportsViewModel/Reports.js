import reportsApi from '../../Model/Data/Reports/Reports'
import { getUserData } from '../../Authentication/jwt_decode'

const reportsViewModel = (set, get) => ({
    reportsHistory: [],
    reportsHistoryLoading: false,
    unapprovedReports: [],
    unapprovedReportsLoading: false,

    // Get bug report suggestions/history
    getBugReportSuggestions: async (data = {}) => {
        set({ reportsHistoryLoading: true });
        try {
            // Get org_id from user data
            const userData = getUserData();
            const org_id = userData?.org_id || null;
            
            // Prepare payload with operation and org_id
            const payload = {
                operation: 'fetch_data',
                org_id: org_id,
                ...data
            };
            
            const response = await reportsApi.getBugReportSuggestions(payload);
            const responseData = response.data;
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                set({ reportsHistory: responseData.DB_DATA || [] });
                return responseData.DB_DATA || [];
            } else {
                console.log('Error fetching reports:', responseData.ERROR_DESCRIPTION || 'Unknown error');
                set({ reportsHistory: [] });
                return [];
            }
        } catch (err) {
            console.error('Error fetching bug report suggestions:', err);
            set({ reportsHistory: [] });
            return [];
        } finally {
            set({ reportsHistoryLoading: false });
        }
    },

    // Submit bug report
    submitBugReport: async (data) => {
        try {
            const response = await reportsApi.submitBugReport(data);
            const responseData = response.data;
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // Refresh the history after successful submission
                await get().getBugReportSuggestions();
                return { success: true, data: responseData.DB_DATA };
            } else {
                return { 
                    success: false, 
                    error: responseData.ERROR_DESCRIPTION || 'Failed to submit report' 
                };
            }
        } catch (err) {
            console.error('Error submitting bug report:', err);
            return { 
                success: false, 
                error: err.response?.data?.ERROR_DESCRIPTION || 'Failed to submit report' 
            };
        }
    }
})

export default reportsViewModel
