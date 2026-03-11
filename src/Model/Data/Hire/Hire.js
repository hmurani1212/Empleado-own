import axiosInstance from "../../base"
import { axiosInstanceHire, } from "../../base"

const hireApi = {


    getVacanciesList: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'getVacancies',
                ...data
            }
        })
    },

    // getRecuirmentDashboard: function (data) {
    //     return axiosInstance.request({
    //         method: 'POST',
    //         url: `recruitment/processors/recruitment.php`,
    //         params: {
    //             operation: 'getRecruitmentDashboard',
    //             ...data
    //         }
    //     })
    // },

    // getCountRecuirment: function (vacancyId) {
    //     return axiosInstance.request({
    //         method: 'POST',
    //         url: `recruitment/processors/recruitment.php`,
    //         params: {
    //             operation: 'vacancyAppsCountAndLocations',
    //             ...vacancyId
    //         }
    //     })
    // },

    // getPendingApplications: function (data) {
    //     return axiosInstance.request({
    //         method: 'POST',
    //         url: `recruitment/processors/recruitment.php`,
    //         params: {
    //             operation: 'get_pending_apps',
    //             ...data
    //         }
    //     })
    // },

    // getShortlistedData: function (data) {
    //     return axiosInstance.request({
    //         method: 'POST',
    //         url: `recruitment/processors/recruitment.php`,
    //         params: {
    //             operation: 'get_shortlisted_apps',
    //             ...data
    //         }

    //     })
    // },

    getInterviewedData: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'getInterviewedApps',
                ...data
            }

        })
    },

    // getAcceptedData: function (data) {
    //     return axiosInstance.request({
    //         method: 'POST',
    //         url: `recruitment/processors/recruitment.php`,
    //         params: {
    //             operation: 'getAcceptedApps',
    //             ...data
    //         }

    //     })
    // },

    getRejectedData: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'get_rejected_apps',
                ...data
            }

        })
    },

    getStarredData: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'get_starred_apps',
                ...data
            }
        })
    },

    getViewDataPending: function (appId) {
        if (appId) {
            return axiosInstanceHire.request({
                method: 'GET',
                url: `/api/v1/applications/view/get_view_detail/${appId}`,
            })
        } 
        
        // else {
        //     const params = useParams();
        //     console.log("paramsparams", params)
        //     return axiosInstanceHire.request({
        //         method: 'GET',
        //         url: `/api/v1/applications/view/get_view_detail/${params}`,
        //     })
        // }

    },

    getRounds: function (data) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/vacancies/round/get_round_vacancy/${data.vacancyId}`,
            // params : {
            //     operation:'get_vacancy_rounds',
            //     ...data
            // }

        })
    },

    addShortlisting: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: `/api/v1/applications/add_to_shortlist/${data.id}`,
            data: data

        })
    },

    rejectApplicant: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: `/api/v1/applications/reject_application/${data.appId}`,
            data: data
        })
    },

    acceptApplicant: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: `/api/v1/applications/app_accept/${data.id}`,
            data: {
                vacancy_id: data.vacancy_id
            }
        })
    },

    starApplicant: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'mark_star',
                ...data
            }
        })
    },

    unShortlistApp: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: `/api/v1/applications/remove_from_shortlist/${data.appId}`,
            // params : {
            //     operation:'set_app_unshortlist',
            //     ...data
            // }
        })
    },

    settingInterviewScore: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: `/api/v1/applications/set_interview_marks`,
            data: data
            // params: {
            //     operation: 'setInterviewMarks',
            //     ...data
            // }
        })
    },

    setReInterview: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'add_to_shortlist',
                ...data
            }
        })
    },

    addToTalentPool: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: `/api/v1/applications/add_to_talent_pool`,
            data: data

        })
    },

    getTalentPool: function (filters = {}) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/applications/candidate/get_talent_pool`,
            params: {
                page: filters.page || 1,
                gender: filters.gender || '',
                age_from: filters.age_from || '',
                age_to: filters.age_to || '',
                label_id: filters.label_id || '',
            }
        })
    },

    deactivateVac: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'set_vacancy_status',
                ...data
            }
        })
    },

    checkActivateVac: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'check_vacancy_expiry',
                ...data
            }
        })
    },

    activateVac: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'activate_vacancy',
                ...data
            }
        })
    },

    newVacancy: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'set_new_vacancy',
                ...data
            }
        })
    },

    getAllCities: function (data) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/locations/cities`,
            params: {
                operation: 'locationSuggestList',
                ...data
            }

        })
    },

    // Cities list for Hiring module (used by Create Vacancy)
    getHiringCities: function () {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/locations/hiring_city`,
        })
    },

    // Get cities by country (Pakistan = 162)
    getCitiesByCountry: function (countryId = 162) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/locations/countries/${countryId}/cities`
        })
    },

    getVacRounds: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `recruitment/processors/recruitment.php`,
            params: {
                operation: 'get_vacancy_rounds',
                ...data
            }
        })
    },

    getAllVacancies2: function (filters = {}) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: 'api/v1/vacancies/org/get_all_vacancies',
            params: filters
        })
    },

    sendShortlistMessage: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: '/api/v1/vacancies/send/send_Shortlist_message',
            data: data
        })
    },

    sendHiringMessage: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: '/api/v1/vacancies/add/send_hiring_message',
            data: data
        })
    },

    hireEmployee: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: '/api/v1/candidates/add/employee',
            data: data
        })
    },

    getAllCountries: function () {
        return axiosInstanceHire.request({
            method: 'GET',
            url: '/api/v1/locations/countries'
        })
    },



}

export default hireApi