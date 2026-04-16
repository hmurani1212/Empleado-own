import { Label } from 'recharts';
import { showToast } from '../../Components/Toaster/Toaster'
import hireApi from '../../Model/Data/Hire/Hire'
import hireApi2 from '../../Model/Data/Hire/Hire_2'
const hireViewModel = (set, get) => ({

    allVacanciesList: [],
    copyAllVacanciesList: [],
    allRecuirmentDashboard: [],
    allPendingApp: [],
    allShortlistedApp: [],
    allInterviewApp: [],
    allAcceptApp: [],
    allRejectApp: [],
    allStarredApp: [],
    allCountHire: [],
    allRounds: [],
    allUnshortlist: [],
    vacRounds: [],
    mountHireList: false,
    allTalentPool: [],
    labelData: [],
    allCities: [],
    /** True while `gettingAllLocations` (hiring cities for Create Vacancy) is in flight */
    locationsLoading: false,
    City_data: [], // Cities by country (Pakistan)
    get_rejected_app_data: [],
    rejectedPaginationData: { currentPage: 1, totalPages: 1, totalRecords: 0 },
    /** True while `get_rejected_app` request is in flight */
    rejectedApplicantsLoading: false,
    record_data: [],

    viewPending: [],
    Re_Interview_data: [],
    Label_data: [],


    handleMountHire: () => {
        set({ mountHireList: true })
    },




    gettingAllVacanciesList: async (statusFilter, yearFilter, monthFilter) => {

        try {
            const response = await hireApi.getVacanciesList(statusFilter, yearFilter, monthFilter)
            const data = response.data


            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allVacanciesList: data.DB_DATA, copyAllVacanciesList: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ allVacanciesList: [], copyAllVacanciesList: [] })
            }
        } catch (error) {

        }

    },

    hireVacanciesSearch: (name) => {
        if (name.trim() === '') {
            set({ allVacanciesList: get().copyAllVacanciesList })
        } else {
            const lowercaseName = name.toLowerCase();
            const matchedVacancies = get().copyAllVacanciesList.filter((hire) =>
                hire.title.toLowerCase().includes(lowercaseName)
            );
            set({ allVacanciesList: matchedVacancies })
        }
    },

    // gettingDashboardRecuirment: async () => {
    //     try {
    //         const response = await hireApi.getRecuirmentDashboard()
    //         const data = response.data
    //         // console.log('hire dashboard', data)

    //         if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
    //             set({ allRecuirmentDashboard: data.DB_DATA })
    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // },



    // gettingAllPendingApp: async (vacancyId) => {
    //     const pendingAppdata = { vacancyId: vacancyId }


    //     try {
    //         const response = await hireApi.getPendingApplications(pendingAppdata)
    //         const data = response.data


    //         if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
    //             set({ allPendingApp: data.DB_DATA })

    //         } else if (response.status === 200 && data.STATUS === 'ERROR') {
    //             set({ allPendingApp: [] })

    //         }
    //     } catch (error) {

    //     }
    // },

    // gettingAllCount: async (vacancyId) => {

    //     try {
    //         const response = await hireApi.getCountRecuirment({ vacancyId: vacancyId })
    //         const data = response.data
    //         // console.log('all aps', data)

    //         if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
    //             set({ allCountHire: data.DB_DATA })

    //         } else if (response.status === 200 && data.STATUS === 'ERROR') {
    //             set({ allCountHire: [] })

    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // },

    // gettingAllShortlistedApp: async (vacancyId) => {
    //     const shorlistAppdata = { vacancyId: vacancyId }


    //     try {
    //         const response = await hireApi.getShortlistedData(shorlistAppdata)
    //         const data = response.data
    //         // console.log('shortlist aps', data)

    //         if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
    //             set({ allShortlistedApp: data.DB_DATA })

    //         }

    //         else if (response.status === 200 && data.STATUS === 'ERROR') {
    //             showToast(`${data.ERROR_DESCRIPTION}`, 'error')
    //             set({ allShortlistedApp: [] })

    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // },

    gettingAllInterviewApp: async (vacancyId) => {
        const interviewAppdata = { vacancyId: vacancyId }


        try {
            const response = await hireApi2.getAllApplicants(interviewAppdata)
            const data = response.data


            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allInterviewApp: data.DB_DATA })

            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                showToast(`${data.ERROR_DESCRIPTION}`, 'error')
                set({ allInterviewApp: [] })

            }
        } catch (error) {
            console.error(error)
        }
    },

    // gettingAcceptedApp: async (vacancyId) => {
    //     const acceptData = { vacancyId: vacancyId }


    //     try {
    //         const response = await hireApi.getAcceptedData(acceptData)
    //         const data = response.data
    //         // console.log('interviw aps', data)

    //         if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
    //             set({ allAcceptApp: data.DB_DATA })

    //         } else if (response.status === 200 && data.STATUS === 'ERROR') {
    //             showToast(`${data.ERROR_DESCRIPTION}`, 'error')
    //             set({ allAcceptApp: [] })

    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // },

    gettingRejectedApp: async (vacancyId) => {
        const rejectData = { vacancyId: vacancyId }


        try {
            const response = await hireApi.getRejectedData(rejectData)
            const data = response.data


            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allRejectApp: data.DB_DATA })

            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                showToast(`${data.ERROR_DESCRIPTION}`, 'error')
                set({ allRejectApp: [] })

            }
        } catch (error) {
            console.error(error)
        }
    },

    gettingStarredApp: async (vacancyId) => {
        const starData = { vacancyId: vacancyId }

        try {
            const response = await hireApi.getStarredData(starData)
            const data = response.data


            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allStarredApp: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ allStarredApp: [] })
            }
        } catch (error) {
            console.error(error)
        }
    },

    gettingViewPending: async (vacancyId, data, appIdFromParams = null) => {
        // console.log('gettingViewPending called with vacancyId:', vacancyId, 'and data:', data);

        let appId = null

        // Priority 1: Use app ID from clicked data (when user clicks "App Detail")
        if (data && data.application_type === 'rejected' && data.hire && data.hire.app_id) {
            appId = data.hire.app_id
            // console.log('Using app_id from rejected hire data:', appId);
        } else if (data && data.application_type === 'rejected' && data.hire && data.hire.id) {
            appId = data.hire.id
            //console.log('Using id from rejected hire data:', appId);
        } else if (data && data.id) {
            appId = data.id
            // console.log('Using id from data:', appId);
        } else if (data && data.app_id) {
            appId = data.app_id
            // console.log('Using app_id from data:', appId);
        }
        // Priority 2: Use app ID from URL params (when user reloads page)
        else if (appIdFromParams) {
            appId = appIdFromParams
            // console.log('Using appId from URL params:', appId);
        }

        // Only make API call if we have a valid appId
        if (!appId) {
            return;
        }

        // console.log('Final appId being used for API call:', appId);

        try {
            const response = await hireApi.getViewDataPending(appId)
            const responseData = response.data
            // console.log('API Response:', responseData)

            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                set({ viewPending: responseData.DB_DATA })
                // console.log('Set viewPending (SUCCESSFUL):', responseData.DB_DATA)
            } else if (response.status === 200 && responseData.STATUS === 'ERROR') {
                set({ viewPending: [] })
                // console.log('Set viewPending to empty array due to ERROR')
            } else if (response.status === 200 && responseData.STATUS === 'SUCCESSFULL') {
                // Handle the case where STATUS is 'SUCCESSFULL' (with double L)
                set({ viewPending: responseData.DB_DATA })
                //console.log('Set viewPending (SUCCESSFULL):', responseData.DB_DATA)
            }
        } catch (error) {
            // console.log('Error in gettingViewPending:', error)
            set({ viewPending: [] })
        }

    },

    gettingRounds: async (vacancyId) => {
        const roundData = { vacancyId: vacancyId };

        try {
            const response = await hireApi.getRounds(roundData)
            const data = response.data


            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allRounds: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ allRounds: [] })
            }

        } catch (error) {
            // throw error
        }
    },


    get_rejected_app: async (params = {}) => {
        set({ rejectedApplicantsLoading: true })
        try {
            const response = await hireApi2.get_rejected_app(params);
            const data = response.data;
            // console.log('get_rejected_app API response:', data);

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                const pagination = data.pagination || {}
                set({
                    get_rejected_app_data: data.DB_DATA,
                    rejectedPaginationData: {
                        currentPage: pagination.page || 1,
                        totalPages: pagination.pages || 1,
                        totalRecords: pagination.total || 0,
                    },
                })
                return true;
            } else {
                set({ get_rejected_app_data: [], rejectedPaginationData: { currentPage: 1, totalPages: 1, totalRecords: 0 } })
                return false;
            }
        } catch (error) {
            set({ get_rejected_app_data: [], rejectedPaginationData: { currentPage: 1, totalPages: 1, totalRecords: 0 } })
            return false;
        } finally {
            set({ rejectedApplicantsLoading: false })
        }
    },


    appUnshortlist: (id) => {
        set({
            allShortlistedApp: get().allShortlistedApp.filter(shortlist => shortlist.app_id !== id),
        });
    },

    addShortlist: async (id) => {
        set({
            allPendingApp: get().allPendingApp.filter(pending => pending.app_id !== id)
        })
    },

    addtoReject: async (id) => {
        set({
            allRejectApp: get().allViewLeave.filter(reject => reject.app_id !== id)
        })
    },

    reInterviewShortlist: async (id) => {
        set({
            allInterviewApp: get().allInterviewApp.filter(interview => interview.app_id !== id)
        })
    },

    gettingTalentPoolData: async (talentPoolData, gender, ageLower, ageUpper) => {
        const filter = { gender: gender, ageLower: ageLower, ageUpper: ageUpper }
        try {
            const response = await hireApi.getTalentPool(talentPoolData, filter)
            const data = response.data


            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allTalentPool: data.DB_DATA })
                set({ labelData: data.Label_Data })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ allTalentPool: [] })
                set({ labelData: [] })
            }
        } catch (error) {
            throw error
        }
    },

    deactivcatingVacancy: async (id) => {
        set({
            allVacanciesList: get().allVacanciesList.filter(deactive => deactive.id !== id)
        })
    },

    activcatingVacancy: async (id) => {
        set({
            allVacanciesList: get().allVacanciesList.filter(active => active.id !== id)
        })
    },

    // Cities list for Create Vacancy (Hiring module)
    gettingAllLocations: async () => {
        set({ locationsLoading: true })
        try {
            const response = await hireApi.getHiringCities()
            const data = response.data

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allCities: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ allCities: [] })
            }
        } catch (error) {
            console.error('Error fetching cities:', error)
            set({ allCities: [] })
        } finally {
            set({ locationsLoading: false })
        }
    },

    // Get cities by country (Pakistan = 162)
    gettingCitiesByCountry: async (countryId = 162) => {
        try {
            const response = await hireApi.getCitiesByCountry(countryId)
            const data = response.data

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ City_data: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ City_data: [] })
            }
        } catch (error) {
            console.error('Error fetching cities:', error)
            set({ City_data: [] })
        }
    },

    addToStarred: async (id) => {
        set({
            allStarredApp: get().allStarredApp.filter(starred => starred.app_id !== id),
        });
    },

    gettingVacancyRounds: async () => {
        try {
            const response = await hireApi.getRecuirmegetVacRoundsntDashboard()
            const data = response.data

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ vacRounds: data.DB_DATA })
            }
        } catch (error) {
            console.error(error)
        }
    },
    //   const record_data = useStore((state) => state.get_count_app_data);
    //   const get_rejected_app = useStore((state) => state.get_rejected_app);


    get_record: async () => {
        try {
            const response = await hireApi2.get_count_app()
            const data = response.data;

            // set({record_data:[]})
            ///onsole.log('Vacancy rhireApi2ounds', data)

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ record_data: data.DB_DATA })
            }
        } catch (error) {
            console.error(error)
        }
    },


    Re_Interviewfn: async (data) => {
        try {
            const response = await hireApi2.Re_Interview(data)
            const responseData = response.data;

            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                set({ Re_Interview_data: responseData.DB_DATA })
                return { success: true, data: responseData }
            } else {
                return { success: false, error: responseData.ERROR_DESCRIPTION }
            }
        } catch (error) {
            console.error("Error in Re_Interviewfn:", error)
            return { success: false, error: 'Failed to schedule re-interview' }
        }
    },

    GetLabel_def: async (data) => {
        try {
            const response = await hireApi2.GetLabel(data)
            const responseData = response.data;

            if (responseData.STATUS === 'SUCCESSFUL') {
                set({ Label_data: responseData.DB_DATA })
                return { success: true, data: responseData }
            } else {
                return { success: false, error: responseData.ERROR_DESCRIPTION }
            }
        } catch (error) {
            console.error("Error in GetLabel_def:", error)
            return { success: false, error: 'Failed to fetch labels' }
        }
    }






    // gettingAcceptedApplicants: async (vacancyId, filters = {}) => {
    //     try {
    //         const response = await hireApi2.getAcceptedApplicants(vacancyId, filters)
    //         const data = response.data

    //         if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
    //             set({ allAcceptApp: data.DB_DATA })
    //             return { success: true, data: data.DB_DATA }
    //         } else if (response.status === 200 && data.STATUS === 'ERROR') {
    //             showToast(`${data.ERROR_DESCRIPTION}`, 'error')
    //             set({ allAcceptApp: [] })
    //             return { success: false, error: data.ERROR_DESCRIPTION }
    //         }
    //     } catch (error) {
    //         console.log('Error getting accepted applicants:', error)
    //         set({ allAcceptApp: [] })
    //         return { success: false, error: 'Failed to fetch accepted applicants' }
    //     }
    // },





});
export default hireViewModel