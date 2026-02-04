import { axiosInstance, axiosInstanceHire } from "../base";

interface VacancyFilters {
  statusFilter?: string;
  yearFilter?: string;
  monthFilter?: string;
}

interface ProfileUpdateData {
  name?: string;
  father_name?: string;
  email?: string;
  phone?: string;
  gender?: number;
  nic?: string;
  dob?: string;
  marital_status?: string;
  postal_address?: string;
  permanent_address?: string;
  city_id?: number;
  state?: string;
  country_id?: number;
  photo?: string;
  cv_name?: string;
}

const vacancy_apis = {
  getAllVacancies2: function(filters: VacancyFilters) {
    return axiosInstance.request({
      method: 'GET',
      url: '/api/v1/vacancies/org/get_all_vacancies',
      params: filters,
    });
  },

  get_jobs_by_id: function(id: string) {
    return axiosInstance.request({
      method: 'GET',
      url: `/api/v1/vacancies/${id}`,
    });
  },

  get_apply_data: function(vacancyId: string) {
    return axiosInstance.request({
      method: 'GET',
      url: `/api/v1/vacancies/get_apply_data/${vacancyId}`,
    });
  },

  update_candidate: function(formData: FormData) {
    const candidate_id = localStorage.getItem('id');
    return axiosInstanceHire.request({
      method: 'PUT',
      url: `/api/v1/candidates/${candidate_id}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  submit_application: function(applicationData: any) {
    return axiosInstance.request({
      method: 'POST',
      url: '/api/v1/applications',
      data: applicationData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
};

export default vacancy_apis;
