import { showToast } from '../../Components/Toaster/Toaster'
import hireApi from '../../Model/Data/Hire/Hire_2'

const hireViewModel = (set, get) => ({

    allVacanciesList_data: [],
    deactiveVacancies: [],
    allApplicants_data: [],
    /** True until an applicants list fetch finishes; starts true so first paint shows skeleton (not "not found"). */
    allApplicantsLoading: true,
    /** True until global hire counts (`get_count_app`) return — drives dashboard stat cards. */
    hireCountsLoading: true,
    vacancyFilters: [],
    get_city_all_data: [],
    get_count_app_data: [],
    get_mark_def_data:[],
   
    handleMountHire: () => {
        set({ mountHireList: true })
    },

    gettingAllVacanciesList: async (statusFilter, yearFilter, monthFilter) => {

        try {
            const response = await hireApi.getAllVacancies2({
                status: statusFilter,
                year_date: yearFilter,
                month_date: monthFilter
            })
            const data = response.data
            // console.log('hire', data)
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allVacanciesList_data: data.DB_DATA, })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ allVacanciesList_data: [] })
            }
        } catch (error) {
            console.error(error)
        }

    },


    deactiveVacancies_one: async (vacancyId) => {
        try {
            const response = await hireApi.deactiveVacancies(vacancyId)
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                showToast('Vacancy deactivated successfully',)
                set((state) => ({
                    deactiveVacancies: [...state.deactiveVacancies, vacancyId],
                }))
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                showToast('error', data.MESSAGE)
            }
        } catch (error) {
            console.error(error)
        }
    },


    gettingAllApplicants: async (vacancyId, filters = {}, status = null, location = null) => {
        set({
            allApplicantsLoading: true,
            allApplicants_data: [],
            rejectedApplicantsLoading: false,
        })
        try {
            const response = await hireApi.getAllApplicants(vacancyId, filters, status, location)
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allApplicants_data: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ allApplicants_data: [] })
                if (data.ERROR_FILTER !== 'USER_END_VIOLATION') {
                    // showToast('error', data.ERROR_DESCRIPTION || 'Failed to fetch applications')
                }
            }
        } catch (error) {
            console.error('Error fetching applications:', error)
            set({ allApplicants_data: [] })
            // showToast('error', 'Failed to fetch applications')
        } finally {
            set({ allApplicantsLoading: false })
        }
    },

    removeApplicantFromList: (appId) => {
        set((state) => ({
            allApplicants_data: state.allApplicants_data.filter(app => app.id !== appId)
        }))
    },


    gettingVacancyFilters: async () => {
        try {
            const response = await hireApi.get_vacanc_filter()
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ vacancyFilters: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ vacancyFilters: [] })
                showToast('error', data.ERROR_DESCRIPTION || 'Failed to fetch vacancy filters')
            }
        } catch (error) {
            console.error('Error fetching vacancy filters:', error)
            set({ vacancyFilters: [] })
            showToast('error', 'Failed to fetch vacancy filters')
        }
    },


    get_city_all: async () => {
        try {
            const response = await hireApi.get_city_all()
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ get_city_all_data: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ get_city_all_data: [] })
                showToast('error', data.ERROR_DESCRIPTION || 'Failed to fetch cities')
            }
        } catch (error) {
            console.error('Error fetching cities:', error)
            set({ get_city_all_data: [] })
            showToast('error', 'Failed to fetch cities')
        }
    },


    get_count_app: async () => {
        set({ hireCountsLoading: true })
        try {
            const response = await hireApi.get_count_app()
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ get_count_app_data: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ get_count_app_data: [] })
                showToast('error', data.ERROR_DESCRIPTION || 'Failed to fetch record')
            }
        } catch (error) {
            console.error('Error fetching application record:', error)
            set({ get_count_app_data: [] })
            showToast('error', 'Failed to fetch record')
        } finally {
            set({ hireCountsLoading: false })
        }
    },


    createVacancy: async (data) => {
        try {
            const response = await hireApi.createVacancy(data)
            const resData = response.data
            if (response.status === 200 && resData.STATUS === 'SUCCESSFUL') {
                showToast('success', 'Vacancy created successfully')
                return true
            } else if (response.status === 200 && resData.STATUS === 'ERROR') {
                showToast('error', resData.ERROR_DESCRIPTION || 'Failed to create vacancy')
                return false
            }
        } catch (error) {
            console.error('Error creating vacancy:', error)
            showToast('error', 'Failed to create vacancy')
            return false
        }
    },



    deleteVacancy: async (vacancy_id) => {
        try {
            const response = await hireApi.deleteVacancy({ id: vacancy_id });
            const data = response.data;
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                // Remove the vacancy from state
                set((state) => ({
                    allVacanciesList_data: state.allVacanciesList_data.filter(vacancy => vacancy.id !== vacancy_id)
                }));
                showToast('Vacancy deleted successfully', 'success');
                return true;
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to delete vacancy', 'error');
                return false;
            }
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.ERROR_DESCRIPTION || 'Error deleting vacancy');
            return false;
        }
    },

    create_vacancy: async (data) => {
        try {
            const response = await hireApi.createVacancy(data);
            const responseData = response.data;

            // Handle successful response
            if (responseData.STATUS === 'SUCCESSFUL') {
                showToast('Vacancy created successfully','success',);
                return true;
            }

            // Handle validation errors and other error responses
            if (responseData.STATUS === 'ERROR') {
                showToast('error', responseData.ERROR_DESCRIPTION || 'Failed to create vacancy');
                return false;
            }

            return false;
        } catch (error) {
            // Handle network errors or other exceptions
            console.error('Error creating vacancy:', error.response?.data || error);
            showToast(error.response.data.ERROR_DESCRIPTION);
            // If we have a response with error data, show that specific error
            if (error.response?.data?.ERROR_DESCRIPTION) {
                // showToast('error222', error.response.data.ERROR_DESCRIPTION);
            } else {
                showToast('error333', 'Failed to create vacancy. Please try again.');
            }

            return false;
        }
    },//get_mark_def

     get_mark_def: async () => {
        try {
            const response = await hireApi.get_mark_def()
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ get_mark_def_data: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ get_mark_def_data: [] })
                // showToast('error', data.ERROR_DESCRIPTION || 'Failed to fetch record')
            }
        } catch (error) {
            console.error('Error fetching application record:', error)
            set({ get_mark_def_data: [] })
            // showToast('error', 'Failed to fetch record')
        }
    },

    add_mark_def: async (data) => {
        try {
            const response = await hireApi.add_mark_def(data)
            const responseData = response.data

            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                showToast('Mark definition added successfully', 'success')
                // Refresh the mark definitions list
                const currentState = get()
                await currentState.get_mark_def()
                return responseData.DB_DATA
            } else if (response.status === 200 && responseData.STATUS === 'ERROR') {
                showToast('error', responseData.ERROR_DESCRIPTION || 'Failed to add mark definition')
                return false
            }
        } catch (error) {
            console.error('Error adding mark definition:', error)
            showToast('error', 'Failed to add mark definition')
            return false
        }
    },



    // Talent Pool State
    allTalentPool: [],
    labelData: [],
    talentPoolError: null,
    talentPoolLoading: false,

    // Talent Pool Actions
    setTalentPool: (data) => set({ allTalentPool: data }),
    setLabelData: (data) => set({ labelData: data }),
    setTalentPoolError: (error) => set({ talentPoolError: error }),
    setTalentPoolLoading: (loading) => set({ talentPoolLoading: loading }),
    resetTalentPool: () => set({ allTalentPool: [], talentPoolError: null, talentPoolLoading: false })
});

export default hireViewModel