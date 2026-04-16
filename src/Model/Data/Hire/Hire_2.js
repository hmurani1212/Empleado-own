import { axiosInstanceHire } from "../../base";

//http://172.18.0.34:6179/api/v1/vacancies/org/get_all_vacancies
const hireApi = {
    getAllVacancies2: function (filters = {}) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: 'api/v1/vacancies/org/get_all_vacancies',
            params: filters
        })
    },

    /** GET single vacancy by id (locations from vacancy_location should be returned by backend) */
    getVacancyById: function (id) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `api/v1/vacancies/${id}`,
        })
    },

    deactiveVacancies: function (vacancyId) {
        return axiosInstanceHire.request({
            method: 'PUT',
            url: `api/v1/vacancies/deactive_vaccancy/${vacancyId}`,
        })
    },

    getAllApplicants: function (vacancyId, filters = {}, status = null, location = null) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: 'api/v1/applications/applications/all',
            params: {
                vacancy_id: vacancyId,
                status: status,
                // location: location,
                ...filters
            }
        })
    },

    get_vacanc_filter: function () {
        return axiosInstanceHire.request({
            method: 'GET',
            url: '/api/v1/vacancies/filter/get_vacancy_filter'
        })
    },
    get_city_all: function () {
        return axiosInstanceHire.request({
            method: 'GET',
            url: '/api/v1/locations/cities'
        })
    },

    get_count_app: function () {
        return axiosInstanceHire.request({
            method: 'GET',
            url: '/api/v1/applications/get_count/hire_record'
        })
    },

    createVacancy: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: '/api/v1/vacancies',
            data: data
        })
    },

    deleteVacancy: function (data) {
        return axiosInstanceHire.request({
            method: 'DELETE',
            url: `/api/v1/vacancies/delete_vacancy/${data.id}`,
        })
    },


    /** Query params e.g. { vacancy_id, gender } — backend filters rejected applications */
    get_rejected_app: function (params = {}) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/applications//rejected/get_rejected_app`,
            params,
        })
    },


    get_mark_def: function () {
        return axiosInstanceHire.request({
            method: 'GET',
            url: '/api/v1/vacancies/get_mark/get_mark_def',
            // params: filters
        })
    },

    add_mark_def: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: '/api/v1/vacancies/add/add_mark_def',
            data: data
        })
    },
    Re_Interview: function (data) {
        return axiosInstanceHire.request({
            method: 'PUT',
            url: '/api/v1/applications/re_interview',
            data: data
        })
    },

    getAcceptedApplicants: function (vacancyId, filters = {}) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: 'api/v1/applications/applications/all',
            params: {
                vacancy_id: vacancyId,
                status: 3, // Status 3 for accepted applicants
                ...filters
            }
        })
    },
    setInterView: function (data) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: '/api/v1/interviews/schedule_interview',
            data: data
        })

    },
    GetLabel : function () {
        return axiosInstanceHire.request({
            method: 'GET',
            url: '/api/v1/applications/labels'
        })
    }
};


export default hireApi;