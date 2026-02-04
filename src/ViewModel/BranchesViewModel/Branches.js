import branchesApi from "../../Model/Data/Branches/Branch2"

const branchesViewModel = (set, get)=>({
    branchesAll: [],
    copyBranchesData : [],
    mountBranch: false,
    branchEdit: [],
    timeZoneBranches: [],
    empSuggestions:[],


    brnachAdminData:{},


    settingBranchAdminData:(data)=>{
        set({brnachAdminData: data})
    },

    handleMountBranch: ()=>{
        set({mountBranch:true})
    },
    
    gettingAllBranches : async(data)=>{
        try{
            const response = await branchesApi.getBranches(data)
            const respData = response.data
            // console.log("respData", respData)

            if(response.status === 200 && respData.STATUS === 'SUCCESSFUL'){
                set({branchesAll: respData.DB_DATA, copyBranchesData: respData.DB_DATA})
            } else {
                set({branchesAll: [], copyBranchesData: []})
            }

        }catch(err){
            console.log(err)
        }
    },


    FilterBranchesSearch: (name) => {
        // console.log('name', name)
        if (name.trim() === '') {
            set({ branchesAll: get().copyBranchesData });
        } else {
            const lowercaseName = name.toLowerCase();
            const matchedBranches = get().copyBranchesData.filter((branch) =>
            branch.branch_name.toLowerCase().includes(lowercaseName)
            );
            set({ branchesAll: matchedBranches });
        }
    },

    newBranch:(branch)=>{
        set({
            // Add the new branch at the TOP of the array (newest first, matching API sorting)
            branchesAll: [branch, ...get().branchesAll],
            copyBranchesData: [branch, ...get().copyBranchesData]
        })
    },

    statusChangeBranch: (statusData) => {
        set((prevState) => ({
            branchesAll: prevState.branchesAll.filter(branch => branch.id !== statusData.id),
        }));
    },
    
    updateBranch: async (updatedBranch) => {
        console.log(updatedBranch);
    
        set({
            branchesAll: get().branchesAll.map(branch => {
                if (branch.id === updatedBranch.id) {
                    return updatedBranch;
                } else {
                    return branch;
                }
            }),
        });
    },

    getEmployeesAll : async(bData) => {
        const empData = {id : bData.id, status: bData.status}
        try{
            const response = await branchesApi.empSuggestionsBranches(empData)
            const data = response.data
            console.log('emp data', data)

            if(response.status === 200 && data?.EMP_DATA?.STATUS === 'SUCCESSFUL'){
                set({empSuggestions : data.EMP_DATA.DB_DATA})
            } else if(response.status === 200 && data.STATUS === 'ERROR'){
                set({empSuggestions : []})
            }
        } catch (error) {
            console.log(error)
        }

    },

    newBranchAdmin:(data)=>{

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
    deleteBranchAdmin:(id)=>{
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
    }
    

})

export default branchesViewModel