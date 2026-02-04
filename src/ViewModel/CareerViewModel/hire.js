import ReportApi from '../../Model/Data/CareerPae/hire_apis';

const set_hire_apis = (set, get) => ({
  all_jobs: [],
  job_details: null,
  cities: [],
  countries: [],
  loading: false,
  error: null,

  get_job: async () => {
    try {
      const response = await ReportApi.get_jobs();
      const data = response.data;
      set({ all_jobs: data });
    } catch (err) {
      console.error('Error fetching jobs data:', err);
      throw err;
    }
  },

  get_job_by_id: async (id) => {
    try {
      // Reset job details before fetching new one
      set({ job_details: null });

      const response = await ReportApi.get_jobs_by_id(id);
      const data = response.data;
      set({ job_details: data });
    } catch (err) {
      console.error('Error fetching job details:', err);
      throw err;
    }
  },

  get_cities: async () => {
    try {
      const response = await ReportApi.get_cities();
      console.log("responseresponse", response)
      // Ensure we're setting an array of cities
      const citiesData = response.data?.DB_DATA || [];
      set({ cities: citiesData });
    } catch (err) {
      console.error('Error fetching cities:', err);
      throw err;
    }
  },

  get_countries: async () => {
    try {
      const response = await ReportApi.get_countries();
      const countriesData = response.data?.DB_DATA || [];
      set({ countries: countriesData });
    } catch (err) {
      console.error('Error fetching countries:', err);
      throw err;
    }
  },

  create_candidate: async (formData) => {
    try {
      set({ loading: true, error: null });
      const response = await ReportApi.create_candidate(formData);
      set({ loading: false });
      return response.data;
    } catch (err) {
      set({ loading: false });

      // If it's an API error response
      if (err.response?.data) {
        const errorData = err.response.data;
        // Store error message as string instead of object
        set({
          error: errorData.ERROR_DESCRIPTION || 'An error occurred while creating the profile'
        });
      } else {
        // For network or other errors
        set({
          error: 'Network error occurred'
        });
      }

      throw err; // Re-throw to handle in component
    }
  },
});

export default set_hire_apis;
