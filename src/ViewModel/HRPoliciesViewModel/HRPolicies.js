import departmentsApi from "../../Model/Data/Departments/Departments"
import hrPoliciesApi from "../../Model/Data/HRPolicies/HRPolicies"

const debounce = (mainFunction, delay) => {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            mainFunction(...args);
        }, delay);
    };
}

const hrPoliciesViewModel = (set, get) => ({
    allPolicies: [],
    copyAllPolicies: [],
    copyFilterPolicies: [],
    allPolicyUsers: [],
    policyBranches: [],
    policyDepartments: [],
    viewPolicy: [],
    mountPolicies: false,
    hrPolicyExtraObject: { pageCount: false, pageId: 0 },
    allPoliciesForSwap: [],
    hrPolicyDropdown: [],
    hrPolicyDropdownLoading: false,

    handleMountPolicies: () => {
        set({ mountPolicies: true })
    },

    fetchHrPolicyDropdown: async (policy_data) => {
        try {

            // console.log('data is coming', policy_data)
            set({ hrPolicyDropdownLoading: true });
            const response = await hrPoliciesApi.getAllPoliciesDropdown(policy_data);
            const data = response.data;

            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const policies = Array.isArray(data.DB_DATA) ? data.DB_DATA : [];
                set({ hrPolicyDropdown: policies });
            } else {
                set({ hrPolicyDropdown: [] });
            }
        } catch (error) {
            console.log(error);
            set({ hrPolicyDropdown: [] });
        } finally {
            set({ hrPolicyDropdownLoading: false });
        }
    },

    getAllBranchesHrPolicy: async () => {
        try {
            const response = await departmentsApi.gettingAllDepartments({});
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const branches = data?.DB_DATA?.branches?.DB_DATA || []
                const departments = data?.DB_DATA?.departments?.DB_DATA || []
                const ownObjectBranches = { id: '0', branch_name: 'All Branches' }
                const updatedBranches = [ownObjectBranches, ...branches];
                const ownObjectDepartments = { id: '0', name: 'All Departments', branch_id: '0' }
                const updatedDepartments = [ownObjectDepartments, ...departments];

                set({ policyBranches: updatedBranches, policyDepartments: updatedDepartments })
            }
            // console.log(response);
        } catch (err) {
            console.log(err);
        }

    },

    getAllHrPolicies: async (branch_id, status, page = 1) => {
        try {
            ////console.log('Store: Getting HR policies with:', { branch_id, status, page })
            const response = await hrPoliciesApi.gettingAllPolicies(branch_id, status, page)
            const data = response.data

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                // Always replace data (no more "load more" - use Next/Previous instead)
                set({ allPolicies: data.DB_DATA?.policies, copyAllPolicies: data.DB_DATA?.policies })
                set({
                    hrPolicyExtraObject: {
                        ...get().hrPolicyExtraObject,
                        pageCount: data.DB_DATA?.pagination?.page < data.DB_DATA?.pagination?.pages,
                        pageId: data.DB_DATA?.pagination?.page + 1,
                        currentPage: data.DB_DATA?.pagination?.page || 1,
                        totalPages: data.DB_DATA?.pagination?.pages || 1
                    }
                })
            }
        } catch (error) {
            console.log(error)
        }

    },

    getNextPolicies: async () => {
        // Deprecated - kept for backward compatibility but should use getAllHrPolicies with page parameter
        const page_id = get().hrPolicyExtraObject.pageId
        const page_count = get().hrPolicyExtraObject.pageCount
        if (page_count) {
            try {
                const response = await hrPoliciesApi.getMorePolicies(page_id)
                const data = response.data

                if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                    // Always replace data (no more "load more")
                    set({ allPolicies: data.DB_DATA?.policies, copyAllPolicies: data.DB_DATA?.policies })
                    set({
                        hrPolicyExtraObject: {
                            ...get().hrPolicyExtraObject,
                            pageCount: data.DB_DATA?.pagination?.page < data.DB_DATA?.pagination?.pages,
                            pageId: data.DB_DATA?.pagination?.page + 1,
                            currentPage: data.DB_DATA?.pagination?.page || 1,
                            totalPages: data.DB_DATA?.pagination?.pages || 1
                        }
                    })
                }
            } catch (error) {
                console.log(error)
            }
        }
    },

    getPoliciesUsedBy: async (id) => {

        try {
            const response = await hrPoliciesApi.getPolicyUsers(id)
            const respData = response.data
            // console.log('Policy users', respData)

            ///if(respData)

            if (response.status === 200 && respData.STATUS === 'SUCCESSFUL') {
                set({ allPolicyUsers: respData.DB_DATA })
                return { success: true, data: respData.DB_DATA }
            } else if (response.status === 200 && respData.STATUS === 'ERROR') {
                set({ allPolicyUsers: [] })
                return { success: false, error: respData.ERROR_DESCRIPTION }
            }
        } catch (err) {
            console.log('what  is the error', err.response?.data?.ERROR_DESCRIPTION)
            return { success: false, error: err.response?.data?.ERROR_DESCRIPTION || 'An error occurred' }
        }
    },



    hrPoliciesSearch: debounce(async (name, id, status) => {
        if (name.trim() === '') {
            // When search is empty, restore the original policies
            set({ allPolicies: get().copyAllPolicies || [] })
        }
        else {
            try {

                const lowercaseName = name.toLowerCase();

                const page_id = get().hrPolicyExtraObject.pageId
                const page_count = get().hrPolicyExtraObject.pageCount
                if (page_count) {


                    try {
                        const response = await hrPoliciesApi.gettingAllPolicies(id, status, page_id, lowercaseName)
                        // console.log('search response', response)
                        const data = response.data
                        // console.log('Policies', data)

                        if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                            set({ allPolicies: data.DB_DATA?.policies })
                            set({
                                hrPolicyExtraObject: {
                                    ...get().hrPolicyExtraObject,
                                    pageCount: data.DB_DATA?.pagination?.page < data.DB_DATA?.pagination?.pages,
                                    pageId: data.DB_DATA?.pagination?.page + 1
                                }
                            })
                        } else {
                            set({ allPolicies: [] })
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }
            } catch (err) {

            }
        }
    }, 1000),
    debounce: debounce,

    filterHrPolicyList: async (name) => {
        set({ allPolicies: get().copyAllPolicies || [] })

        if (name === "All Branches") {
            set({ allPolicies: get().copyAllPolicies || [], copyFilterPolicies: get().copyAllPolicies || [] })
        } else {
            try {
                const policyFilterData = get().allPolicies?.filter((data) => {
                    return data.policy_name === name
                });

                set((state) => {
                    const updatedHrPolicyData = {
                        ...state.allPolicies,
                        DATA: policyFilterData
                    };
                    return { allPolicies: updatedHrPolicyData, copyFilterPolicies: updatedHrPolicyData }
                })
            } catch (err) {
                console.log(err)
            }
        }
    },

    gettingPolicyView: async (id) => {
        const viewData = { id: id }
        try {
            const response = await hrPoliciesApi.getPolicyView(viewData)
            const data = response.data
            // console.log('view data', data)

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                // Merge policy with pay_schedule, overtime, and leave_group data
                const policyData = {
                    ...data?.DB_DATA?.policy,
                    pay_schedule: data?.DB_DATA?.pay_schedule,
                    overtime_rules: data?.DB_DATA?.overtime,
                    leave_group: data?.DB_DATA?.leave_group
                }
                set({ viewPolicy: policyData })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ viewPolicy: [] })

            }

        } catch (error) {
            console.log(error)

        }
    },

    setViewPolicy: (policy) => {
        set({ viewPolicy: policy || [] })
    },

    statusChangePolicy: (statusData) => {
        set((prevState) => ({
            allPolicies: prevState.allPolicies.filter(policy => policy.id !== statusData.id),
            copyAllPolicies: prevState.copyAllPolicies.filter(policy => policy.id !== statusData.id),
        }));
    },

    settingHrPoliciesByBranch: (data) => {
        // Handle both cases: when data is the full response or just policies array
        const policies = data?.policies || data;
        set({ allPolicies: policies, copyAllPolicies: policies })
    },

    handleUpdatePolicy: async (updatedPolicy) => {
        ///console.log('updatedPolicy', updatedPolicy)
        set({
            allPolicies: get().allPolicies?.map((policy) => policy.id === updatedPolicy.id ? { ...policy, policy_name: updatedPolicy.name } : policy),
            copyAllPolicies: get().copyAllPolicies?.map((policy) => policy.id === updatedPolicy.id ? { ...policy, policy_name: updatedPolicy.name } : policy)
        })
    },


    gettingPolicyForSwap: async () => {
        try {
            const response = await hrPoliciesApi.getPoliciesforSwap();
            const responseData = response?.data;
            /////console.log('API Response:', responseData);

            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                const policies = responseData.DB_DATA?.policy || [];
                //// console.log('Policies for swap:', policies);
                set({ allPoliciesForSwap: policies });
            } else {
                ////console.log('API returned error or invalid status:', responseData);
                set({ allPoliciesForSwap: [] });
            }
        } catch (err) {
            console.log('Error fetching policies for swap:', err);
            set({ allPoliciesForSwap: [] });
        }
    }
})

export default hrPoliciesViewModel