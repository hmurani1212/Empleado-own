import axios from "axios";
import { getLocalStorage } from "../../../Authentication/localStorageServices";
import { setupAuthInterceptor } from "../../../services/__axiosInterceptors";

// Create axios instance for reports API (using emp-beta base URL)
// The interceptor will handle getting fresh token on each request
const jwt = getLocalStorage();
const reportsAxiosInstance = axios.create({
    baseURL: 'https://emp-beta.veevotech.com',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
    }
});

// Setup auth interceptor for this instance (handles fresh token on each request)
setupAuthInterceptor(reportsAxiosInstance, 'Reports API');

const reportsApi = {
    getBugReportSuggestions: function (data) {
        return reportsAxiosInstance.request({
            method: 'POST',
            url: '/service_api/bug_report_suggestions',
            data: data || {}
        })
    },

    submitBugReport: function (data) {
        return reportsAxiosInstance.request({
            method: 'POST',
            url: '/service_api/bug_report_suggestions',
            data: data
        })
    }
}

export default reportsApi
