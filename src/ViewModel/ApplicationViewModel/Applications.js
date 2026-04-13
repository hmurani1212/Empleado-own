import applicationApi from "../../Model/Data/Applications/Applications"
import noticesApi from "../../Model/Data/Notices/Notices"
import { showToast } from "../../Components/Toaster/Toaster";
const debounce = (mainFunction, delay) => {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            mainFunction(...args);
        }, delay);
    };
}

const applicationsViewModel = (set, get) => ({

    applicationsList: [],
    /** True while list API is in flight (filters, pagination, reset) — use for table skeleton */
    applicationsTableLoading: false,
    applicationsMount: false,
    lastApplicationId: '',
    applicationEmpList: [],
    GetSubmitted_AppLi: [],


    gettingApplicationsList: async () => {
        set({ applicationsTableLoading: true })
        try {
            const response = await applicationApi.getLeavesGroup({})
            const resData = response.data
            if (response.status === 200 && resData.STATUS === "SUCCESSFUL") {
                set({ applicationsList: resData.DB_DATA, lastApplicationId: resData.LAST_PULL_ID })
            } else {
                set({ applicationsList: [] })
            }
        } catch (err) {
            set({ applicationsList: [] })
        } finally {
            set({ applicationsTableLoading: false })
        }
    },

    // New function for filtered applications
    gettingFilteredApplicationsList: async (filters = {}) => {
        set({ applicationsTableLoading: true })
        // Only pass filters that have actual values
        const data = {};

        // Handle branch filter - send branch_id (0 for All Branches, specific id otherwise)
        if (filters.branch !== undefined && filters.branch !== null) {
            data.branch = filters.branch === "0" || filters.branch === 0 ? 0 : filters.branch;
        }
        // Handle department filter - only include when a specific department is selected (omit dep_id for All Departments)
        if (filters.deptt !== undefined && filters.deptt !== null && filters.deptt !== "0" && filters.deptt !== 0) {
            data.deptt = filters.deptt;
        }
        if (filters.status && filters.status !== "") {
            data.status = filters.status;
        }
        if (filters.user_id && filters.user_id !== "") {
            data.user_id = filters.user_id;
        }
        if (filters.search_term && filters.search_term !== "") {
            data.search_term = filters.search_term;
        }
        if (filters.form_label && filters.form_label !== "ALL") {
            data.form_label = filters.form_label;
        }
        if (filters.getall) {
            data.getall = filters.getall;
        }
        if (filters.last_id && filters.last_id !== "") {
            data.last_id = filters.last_id;
        }
        if (filters.page !== undefined) {
            data.page = filters.page;
        }
        if (filters.from_date && String(filters.from_date).trim() !== '') {
            data.from_date = String(filters.from_date).trim();
        }
        if (filters.to_date && String(filters.to_date).trim() !== '') {
            data.to_date = String(filters.to_date).trim();
        }


        try {
            const response = await applicationApi.getLeavesGroup(data)
            const resData = response.data
            if (response.status === 200 && resData.STATUS === "SUCCESSFUL") {
                // Always replace data (no more "load more" - use Next/Previous instead)
                set({
                    applicationsList: resData.DB_DATA,
                    lastApplicationId: resData.LAST_PULL_ID
                });
            } else {
                set({ applicationsList: [] })
            }

        } catch (err) {
            set({ applicationsList: [] })
        } finally {
            set({ applicationsTableLoading: false })
        }
    },


    GetSubmitted_AppFn: async () => {
        try {
            const response = await applicationApi.GetSubmitted_App();
            const result = response.data;
            // console.log('Result', result.STATUS === "SUCCCESSFUL")
            if (result.STATUS === "SUCCCESSFUL") {
                set({ GetSubmitted_AppLi: result.DB_DATA })
            }

        } catch (err) {
            console.log("ERROR", err)
        }
    },


    SubmitApplcationsFn: async (data) => {
        try {
            const response = await applicationApi.SubmitApplications(data);
            const result = response.data;

            if (result.STATUS === "SUCCCESSFUL") {
                showToast('Successfully Submit you application', 'success')
            };

            return result
        } catch (error) {
            console.log("ERROR", error);
            showToast(error?.response?.data?.ERROR_DESCRIPTION, 'Error')
        }
    },

    // Upload file to elephant server for applications
    uploadFileToElephant: async (file, deviceId = 'abc123', latitude = '34.123', longitude = '71.123') => {
        try {
            const formData = new FormData();
            formData.append('operation', 'store_file');
            formData.append('file', file);
            formData.append('device_id', deviceId);
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);

            const response = await applicationApi.uploadFileToElephant(formData);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                return {
                    success: true,
                    fileUrl: data.FILE_URL,
                    fileName: data.ELEPHANT_RESP?.FILE_NAME || file.name
                };
            } else {
                throw new Error(data.ERROR_DESCRIPTION || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },
    
    // Get employee defined leaves for leave application
    getEmployeeDefinedLeaves: async (empId) => {
        try {
            console.log('Calling getEmployeeDefinedLeaves API with empId:', empId);
            const response = await applicationApi.getEmployeeDefinedLeaves(empId)
            const resData = response.data
            console.log('getEmployeeDefinedLeaves API response:', resData);
            if (resData.STATUS === "SUCCESSFUL") {
                return { success: true, data: resData.DB_DATA }
            } else {
                return { success: false, error: resData.ERROR_DESCRIPTION || 'Failed to fetch employee leaves' }
            }
        } catch (err) {
            showToast(err?.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch employee leaves', 'error')
            console.error('Error fetching employee defined leaves:', err)
            return { success: false, error: err.message }
        }
    },

    handleApplicationsMount: () => {
        set({ applicationsMount: true })
    },

    gettingAllEmpApplication: debounce(async (searchTerm) => {
        const empData = { search: searchTerm };
        try {

            const response = await noticesApi.addNoticeEmpSearch(empData)
            console.log('response', response)
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ applicationEmpList: data.DB_DATA })
            }

        } catch (err) {
            console.log(err)
        }
    }, 17000),

    debounce: debounce,


    // return gettingApplicationsList


})

export default applicationsViewModel