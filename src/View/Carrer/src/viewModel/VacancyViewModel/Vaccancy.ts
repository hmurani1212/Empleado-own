import VacancyApi from '../../Models/Vacancies/vacancies';

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

interface VacancyState {
  allVacanciesList: any[];
  job_details: any;
  apply_data: any;
  gettingAllVacanciesList: (statusFilter?: string, yearFilter?: string, monthFilter?: string) => Promise<void>;
  get_job_by_idfn: (id: string) => Promise<void>;
  get_apply_data: (vacancyId: string) => Promise<void>;
  update_candidate: (data: ProfileUpdateData) => Promise<void>;
  submit_application: (applicationData: any) => Promise<void>;
}

const AllVacancyApis = (set: any, get: any): VacancyState => ({
  allVacanciesList: [],
  job_details: null,
  apply_data: null,
  
  gettingAllVacanciesList: async (statusFilter?: string, yearFilter?: string, monthFilter?: string) => {
    try {
      const filters: VacancyFilters = { statusFilter, yearFilter, monthFilter };
      const response = await VacancyApi.getAllVacancies2(filters);
      const data = response.data;

      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        set({ allVacanciesList: data.DB_DATA, copyAllVacanciesList: data.DB_DATA });
      } else if (response.status === 200 && data.STATUS === 'ERROR') {
        set({ allVacanciesList: [], copyAllVacanciesList: [] });
      }
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    }
  },

  get_job_by_idfn: async (id: string) => {
    try {
      // Reset job details before fetching new one
      set({ job_details: null });

      const response = await VacancyApi.get_jobs_by_id(id);
      const data = response.data;
      set({ job_details: data });
    } catch (err) {
      console.error('Error fetching job details:', err);
      throw err;
    }
  },

  get_apply_data: async (vacancyId: string) => {
    try {
      // Reset apply data before fetching new one
      set({ apply_data: null });

      const response = await VacancyApi.get_apply_data(vacancyId);
      const data = response.data;
      set({ apply_data: data });
    } catch (err) {
      console.error('Error fetching apply data:', err);
      throw err;
    }
  },

  update_candidate: async (profileData: ProfileUpdateData) => {
    try {
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      
      // Append all profile data to FormData
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await VacancyApi.update_candidate(formData);
      const responseData = response.data;
      console.log("Profile update response:", responseData);
      
      return responseData;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  },

  submit_application: async (applicationData: any) => {
    try {
      const response = await VacancyApi.submit_application(applicationData);
      const responseData = response.data;
      console.log("Application submission response:", responseData);
      
      return responseData;
    } catch (err) {
      console.error('Error submitting application:', err);
      throw err;
    }
  },
});

export default AllVacancyApis;