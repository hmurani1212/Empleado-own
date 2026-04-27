import { axiosInstance, axiosInstanceHire } from "../base";

/**
 * All career applications (including guest CV-only) use this path.
 * Legacy `POST /api/v1/applications/cv-only` is not used — send `career_apply_mode: "cv_only_guest"` in the body instead.
 */
export const APPLICATIONS_CANDIDATE_PATH = "/api/v1/applications" as const;

export type CareerApplyModeGuest = "cv_only_guest";

export interface ApplicationAnswerPayload {
  question_id: number;
  answer: string;
  option_id: number;
}

export interface GuestCvOnlyApplicationBody {
  vacancy_id: number;
  city_id: number;
  answers: ApplicationAnswerPayload[];
  cv_file_path: string;
  org_id: number;
  career_apply_mode: CareerApplyModeGuest;
}

export function buildGuestCvOnlyApplicationBody(params: {
  vacancy_id: number;
  city_id: number;
  answers: ApplicationAnswerPayload[];
  cv_file_path: string;
  org_id: number;
}): GuestCvOnlyApplicationBody {
  return {
    ...params,
    career_apply_mode: "cv_only_guest",
  };
}

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

  /** POST unified candidate/apply; include `career_apply_mode` when required by org hiring settings. */
  submit_application: function(applicationData: any) {
    return axiosInstance.request({
      method: 'POST',
      url: APPLICATIONS_CANDIDATE_PATH,
      data: applicationData,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
};

export default vacancy_apis;
