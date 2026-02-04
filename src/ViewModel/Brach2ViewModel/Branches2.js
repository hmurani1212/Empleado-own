import { getBranchesService, getEmployeeSuggestionsService, deleteBranchService } from "../../services/branchServices";
import { showToast } from "../../Components/Toaster/Toaster";
import branch2Api from "../../Model/Data/Branches/Branch2";
const branchesViewModel2 = (set, get) => ({
    branchesAllNew: {
        branches: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 1
        }
    },
    copyBranchesData: [],
    mountBranch: false,
    branchEdit: [],
    timeZoneBranches: [],
    empSuggestions: [],
    deleteBranch: [],
    close_new_branch: [],
    brnachAdminData: {},
   

    settingBranchAdminData: (data) => {
        set({ brnachAdminData: data })
    },

    handleMountBranch: () => {
        set({ mountBranch: true })
    },

    gettingAllBranchesNew: async (data) => {
        try {
            const response = await getBranchesService(data);
            const respData = response.data;
            const currentPage = data.page || 1;

            if (response.status === 200 && respData.STATUS === 'SUCCESSFUL') {
                // Always replace data (no more "load more" - use Next/Previous instead)
                set({
                    branchesAllNew: respData.DB_DATA,
                    copyBranchesData: respData.DB_DATA
                });
            } else {
                // Handle ERROR status (e.g., NO_DATA_FOUND) - always clear state when page is 1
                // This ensures that when status filter changes, old data is cleared
                if (currentPage === 1) {
                    set({
                        branchesAllNew: { 
                            branches: [], 
                            pagination: { 
                                total: 0, 
                                page: 1, 
                                limit: data.limit || 10, 
                                pages: 1 
                            } 
                        },
                        copyBranchesData: { 
                            branches: [], 
                            pagination: { 
                                total: 0, 
                                page: 1, 
                                limit: data.limit || 10, 
                                pages: 1 
                            } 
                        }
                    });
                }
            }
        } catch (err) {
            console.log('Error fetching branches:', err);
            // On network errors or other exceptions, clear state if it's page 1
            // This ensures filter changes work even if there's a network issue
            const currentPage = data?.page || 1;
            if (currentPage === 1) {
                set({
                    branchesAllNew: { 
                        branches: [], 
                        pagination: { 
                            total: 0, 
                            page: 1, 
                            limit: data?.limit || 10, 
                            pages: 1 
                        } 
                    },
                    copyBranchesData: { 
                        branches: [], 
                        pagination: { 
                            total: 0, 
                            page: 1, 
                            limit: data?.limit || 10, 
                            pages: 1 
                        } 
                    }
                });
            }
        }
    },


    FilterBranchesSearch: (name) => {
        // console.log('name', name)
        if (name.trim() === '') {
            set({ branchesAllNew: get().copyBranchesData });
        } else {
            const lowercaseName = name.toLowerCase();
            // Check if copyBranchesData is properly initialized and has a branches array
            if (get().copyBranchesData && Array.isArray(get().copyBranchesData.branches)) {
                const matchedBranches = get().copyBranchesData.branches.filter((branch) =>
                    branch.branch_name.toLowerCase().includes(lowercaseName)
                );
                
                set({ 
                    branchesAllNew: {
                        ...get().copyBranchesData,
                        branches: matchedBranches
                    } 
                });
            }
        }
    },

    newBranch: (branch) => {
        set((state) => {
            // Add the new branch at the TOP of the array (newest first, matching API sorting)
            const updatedBranchesAllNew = [branch, ...state.branchesAllNew.branches];
            const updatedCopyBranchesData = [branch, ...state.copyBranchesData.branches];
            
            return {
                branchesAllNew: {
                    ...state.branchesAllNew,
                    branches: updatedBranchesAllNew,
                    pagination: {
                        ...state.branchesAllNew.pagination,
                        total: state.branchesAllNew.pagination.total + 1
                    }
                },
                copyBranchesData: {
                    ...state.copyBranchesData,
                    branches: updatedCopyBranchesData,
                    pagination: {
                        ...state.copyBranchesData.pagination,
                        total: state.copyBranchesData.pagination.total + 1
                    }
                }
            };
        });
    },

    statusChangeBranch: (statusData) => {
        set((prevState) => ({
            branchesAllNew: {
                ...prevState.branchesAllNew,
                branches: prevState.branchesAllNew.branches.filter(branch => branch.id !== statusData.id)
            },
            copyBranchesData: {
                ...prevState.copyBranchesData,
                branches: prevState.copyBranchesData.branches.filter(branch => branch.id !== statusData.id)
            }
        }));
    },

    updateBranch: async (updatedBranch) => {
        console.log(updatedBranch);

        set((state) => ({
            branchesAllNew: {
                ...state.branchesAllNew,
                branches: state.branchesAllNew.branches.map(branch => {
                    if (branch.id === updatedBranch.id) {
                        return updatedBranch;
                    } else {
                        return branch;
                    }
                })
            },
            copyBranchesData: {
                ...state.copyBranchesData,
                branches: state.copyBranchesData.branches.map(branch => {
                    if (branch.id === updatedBranch.id) {
                        return updatedBranch;
                    } else {
                        return branch;
                    }
                })
            }
        }));
    },

    getEmployeesAll: async (bData) => {
        const empData = { id: bData.id, status: bData.status }
        try {
            const response = await getEmployeeSuggestionsService(empData);
            const data = response.data;

            if (response.status === 200 && data?.EMP_DATA?.STATUS === 'SUCCESSFUL') {
                set({ empSuggestions: data.EMP_DATA.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ empSuggestions: [] })
            }
        } catch (error) {
            console.log(error)
        }
    },

    newBranchAdmin: (data) => {

        set((state) => {
            const updatedBranchAdminData = [...state.brnachAdminData.BRANCH_ADMIN_DATA, data];

            return {
                ...state,
                brnachAdminData: {
                    ...state.brnachAdminData,
                    BRANCH_ADMIN_DATA: updatedBranchAdminData,
                },
            };
        });
    },
    deleteBranchAdmin: (id) => {
        set((state) => {
            const updatedBranchAdminData = state.brnachAdminData.BRANCH_ADMIN_DATA.filter(admin => admin.id !== id);

            return {
                ...state,
                brnachAdminData: {
                    ...state.brnachAdminData,
                    BRANCH_ADMIN_DATA: updatedBranchAdminData,
                },
            };
        });
    },

    //deleteVacancy





    deleteBranch: async (branchId) => {
        try {
            const response = await deleteBranchService(branchId);
            const data = response.data;
            console.log('OK mam i change this')
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                // Update both branchesAllNew and copyBranchesData
                set((state) => ({
                    branchesAllNew: {
                        ...state.branchesAllNew,
                        branches: state.branchesAllNew.branches.filter(branch => branch.id !== branchId)
                    },
                    copyBranchesData: {
                        ...state.copyBranchesData,
                        branches: state.copyBranchesData.branches.filter(branch => branch.id !== branchId)
                    }
                }));
                showToast(data.DB_DATA.message, 'success');
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to delete branch', 'error');
            }
        } catch (error) {
            console.error('Error deleting branch:', error);
            showToast(error?.response?.data?.ERROR_DESCRIPTION || 'Failed to delete branch', 'error');
        }
    },

   


})

export default branchesViewModel2