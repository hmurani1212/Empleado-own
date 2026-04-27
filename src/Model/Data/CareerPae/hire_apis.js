import {axiosInstanceHire} from "../../base";


export const hire_apis = {
    get_jobs: function (org_id) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/vacancies/get_job/${org_id}`,
        })
    },

    get_jobs_by_id: function (id) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/vacancies/${id}`,
        })
    },

    get_vacancy_apply_data: function (id) {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/vacancies/get_apply_data/${id}`,
        })
    },

    /**
     * Unified apply endpoint. Pass `career_apply_mode` (e.g. `cv_only_guest`) for guest CV flow.
     * Do not use POST /api/v1/applications/cv-only.
     */
    submit_application: function (applicationData) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: `/api/v1/applications`,
            data: applicationData
        })
    },

    get_candidate_profile: function () {
        const id = localStorage.getItem('id');
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/candidates/${id}`,
        })
    },

    ///api/v1/candidates

    create_candidate: function (formData) {
        return axiosInstanceHire.request({
            method: 'POST',
            url: `/api/v1/candidates`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    update_candidate: function (formData) {
        const candidate_id = localStorage.getItem('id');
        return axiosInstanceHire.request({
            method: 'PUT',
            url: `/api/v1/candidates/${candidate_id}`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    get_cities: function () {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/locations/cities`,
        })
    },

    get_countries: function () {
        return axiosInstanceHire.request({
            method: 'GET',
            url: `/api/v1/countries`,
        })
    }
}

export default hire_apis