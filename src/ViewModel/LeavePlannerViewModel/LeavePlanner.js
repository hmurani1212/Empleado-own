import { showToast } from "../../Components/Toaster/Toaster"
import departmentsApi from "../../Model/Data/Departments/Departments"
import leavesPlannerApi from "../../Model/Data/LeavesPlanner/LeavesPlanner"

const leavesPlannerViewModel = (set, get) => ({

    allLeavesGroup : [],
    copyAllLeavesGroup : [],
    leavesBranches : [],
    allViewLeave : [],
    copyAllViewLeave : [],
    policiesList: [],
    countriesGoogleForm:[],
    branchesGoogleForm:[],
    branchIdPolicy : '',
    policyId : '',
    mountLeave: false,
    type:false,

    showGoogleForm:false,
    googleHolidays:[],
    


    settingGoogleHolidays:(data)=>{
        set({googleHolidays: data})
        get().handleGoogleModal()
    },
    handleMountLeave: ()=> {
        set({mountLeave:true})
    },
    
    handleGoogleModal:()=>{
        set({showGoogleForm: !get().showGoogleForm})
    },

    getLeavesList: async()=>{
        
        try {
            const response = await leavesPlannerApi.getLeavesGroup()
            const data = response.data
            console.log("Leaves", response)

            if(response.status === 200 || data.STATUS === "SUCCESSFUL"){
                // Handle both response structures: data.DB_DATA or data directly
                const groupsArray = Array.isArray(data.DB_DATA) ? data.DB_DATA : (Array.isArray(data) ? data : []);
                
                // Sort by creation_time descending (newest first) or by id descending if creation_time is not available
                const sortedData = [...groupsArray].sort((a, b) => {
                    const timeA = a.creation_time || a.id || 0;
                    const timeB = b.creation_time || b.id || 0;
                    // Convert to number if it's a timestamp string, otherwise use as is
                    const numA = typeof timeA === 'string' ? new Date(timeA).getTime() : Number(timeA);
                    const numB = typeof timeB === 'string' ? new Date(timeB).getTime() : Number(timeB);
                    return numB - numA; // Descending order (newest first)
                });
                set({allLeavesGroup: sortedData, copyAllLeavesGroup: sortedData})
            }
        } catch(err){
            console.log(err)
        }

    },

    getPaidLeavesConfig: async()=>{
        
        try {
            const response = await leavesPlannerApi.getPaidLeavesConfig()
            const data = response.data
            console.log("Paid Leaves Config", response)

            if(response.status === 200 && data.STATUS === "SUCCESSFUL"){
                // Set the type based on config_value: 1 = true (on), 0 = false (off)
                const isPaidLeavesEnabled = data.DB_DATA?.config_value === "1"
                set({type: isPaidLeavesEnabled})
                console.log("Paid leaves status set to:", isPaidLeavesEnabled)
            }
        } catch(err){
            console.log("Error fetching paid leaves config:", err)
            // Default to false if API fails
            set({type: false})
        }

    },

    getAllDepartmentsLeaves: async () => {
        try {
            const response = await departmentsApi.gettingAllDepartments();
            const data = response.data
            console.log('getAllDepartmentsLeaves response:', data)
            if(response.status === 200 && data.STATUS === "SUCCESSFUL"){
                const branches = data.DB_DATA.branches || data.DB_DATA
                console.log('Branches data:', branches)
                set({leavesBranches: branches})
            }
        } catch (err) {
            console.log('Error in getAllDepartmentsLeaves:', err);
        }

    },

    addNewLeaveGroupState: (data)=>{
        // Convert creation_time to Unix timestamp in seconds if needed
        let creationTime = data.creation_time;
        
        console.log('addNewLeaveGroupState - Original data:', data);
        console.log('addNewLeaveGroupState - Original creation_time:', creationTime, 'Type:', typeof creationTime);
        
        if (!creationTime) {
            // If no creation_time, use current time
            creationTime = Math.floor(Date.now() / 1000);
            console.log('addNewLeaveGroupState - No creation_time, using current time:', creationTime);
        } else if (typeof creationTime === 'string') {
            // If it's an ISO string, convert to Unix timestamp in seconds
            const dateObj = new Date(creationTime);
            if (!isNaN(dateObj.getTime())) {
                creationTime = Math.floor(dateObj.getTime() / 1000);
                console.log('addNewLeaveGroupState - Converted from ISO string:', creationTime);
            } else {
                // If string parsing fails, use current time
                creationTime = Math.floor(Date.now() / 1000);
                console.log('addNewLeaveGroupState - Failed to parse string, using current time:', creationTime);
            }
        } else if (typeof creationTime === 'number') {
            // Check if it's a valid timestamp
            const timestampStr = creationTime.toString();
            const originalTime = creationTime;
            
            // If timestamp is in milliseconds (13 digits), convert to seconds
            if (timestampStr.length === 13) {
                creationTime = Math.floor(creationTime / 1000);
                console.log('addNewLeaveGroupState - Converted from milliseconds:', originalTime, '->', creationTime);
            } else if (timestampStr.length === 10) {
                // Already in seconds, use as is
                creationTime = creationTime;
                console.log('addNewLeaveGroupState - Using as seconds:', creationTime);
            } else {
                // Invalid format, use current time
                creationTime = Math.floor(Date.now() / 1000);
                console.log('addNewLeaveGroupState - Invalid format, using current time. Original:', originalTime);
            }
            
            // Validate the timestamp is reasonable (not in the future by more than 1 year, not before 1970)
            const currentTime = Math.floor(Date.now() / 1000);
            const oneYearFromNow = currentTime + (365 * 24 * 60 * 60);
            const dateFromTimestamp = new Date(creationTime * 1000);
            console.log('addNewLeaveGroupState - Validation check:', {
                creationTime,
                currentTime,
                oneYearFromNow,
                dateFromTimestamp: dateFromTimestamp.toLocaleString(),
                isValid: creationTime >= 0 && creationTime <= oneYearFromNow
            });
            
            if (creationTime < 0 || creationTime > oneYearFromNow) {
                console.warn('addNewLeaveGroupState - Invalid timestamp detected, using current time. Original:', creationTime, 'Current:', currentTime);
                // Invalid timestamp, use current time
                creationTime = currentTime;
            }
        } else {
            // Unknown type, use current time
            creationTime = Math.floor(Date.now() / 1000);
            console.log('addNewLeaveGroupState - Unknown type, using current time:', creationTime);
        }
        
        const finalDate = new Date(creationTime * 1000);
        console.log('addNewLeaveGroupState - Final creation_time:', creationTime, 'Final date:', finalDate.toLocaleString());
        
        const newData = {
            ...data,
            leaves_count : 0,
            defined_leaves_count: data.defined_leaves_count || 0,
            creation_time: creationTime // Unix timestamp in seconds
        }
        const currentGroups = get().allLeavesGroup || [];
        const currentCopyGroups = get().copyAllLeavesGroup || [];
        
        // Remove duplicate if exists (by id) and prepend new data at the top
        const filteredGroups = currentGroups.filter(group => group.id !== newData.id);
        const filteredCopyGroups = currentCopyGroups.filter(group => group.id !== newData.id);
        
        set({
            allLeavesGroup: [newData, ...filteredGroups]
        })
        set({
            copyAllLeavesGroup: [newData, ...filteredCopyGroups]
        })
    },

    getViewLeavesList: async(groupId)=>{
        
        try {
            const response = await leavesPlannerApi.getViewLeaves(groupId)
            const data = response.data
            console.log("Leaves view", response)

            if(response.status === 200 || data.STATUS === "SUCCESSFUL"){
                set({allViewLeave: data, copyAllViewLeave:data})

            } else if (data.STATUS === "ERROR") {
                set({allViewLeave: []})
                showToast(`${data.ERROR_DESCRIPTION}`, 'error')
            }
            
        } catch(err){
            console.log(err)
        }

    },

    addDefineLeavesType: async (data)=> {
        const currentLeaves = Array.isArray(get().allViewLeave) ? get().allViewLeave : [];
        set({
            allViewLeave: [data, ...currentLeaves],
            copyAllViewLeave: [data, ...currentLeaves]
        })
    },

    incrementLeaveGroupCount: (groupId) => {
        set({
            allLeavesGroup: get().allLeavesGroup.map(group => 
                group.id === groupId ? { ...group, defined_leaves_count: (group.defined_leaves_count || 0) + 1 } : group
            ),
            copyAllLeavesGroup: get().copyAllLeavesGroup.map(group => 
                group.id === groupId ? { ...group, defined_leaves_count: (group.defined_leaves_count || 0) + 1 } : group
            )
        })
    },

    leavesPlannerSearch: (name) => {
        if (name.trim() === '') {
            set({ allLeavesGroup: get().copyAllLeavesGroup });
        } else {
            const lowercaseName = name.toLowerCase();
            const matchedLeaves = get().copyAllLeavesGroup.filter((leave) => {
                const searchFields = [leave.name, leave.group_title, leave.title];
                return searchFields.some(field => field && field.toLowerCase().includes(lowercaseName));
            });
            set({ allLeavesGroup: matchedLeaves });

        }

    },

    defineLeaveTypeSearch: (name) => {
        if (name.trim() === '') {
            set({ allViewLeave: get().copyAllViewLeave });
        } else {
            const lowercaseName = name.toLowerCase();
            const matchedLeaves = get().copyAllViewLeave.filter((leave) =>
            leave.title.toLowerCase().includes(lowercaseName)
            );
            set({ allViewLeave: matchedLeaves });

        }

    },

    deleteLeaves: (id) => {
        set({
            allLeavesGroup: get().allLeavesGroup.filter(leave => leave.id !== id)
        })
    },

    deleteSpecificLeaves: (id) => {
        set({
            allViewLeave: get().allViewLeave.filter(leaves => leaves.id !== id)
        })
    },

    getPoliciesList : async(id) => {
        console.log(id)
        const bid = {branch_id : id}
        try {
            const response = await leavesPlannerApi.hrPoliciesList(bid);
            const respData = response.data;
            console.log('policies', response)

            if(response.status === 200 && respData.STATUS === 'SUCCESSFUL'){
                // Updated to handle new API response format
                set({policiesList:respData.DB_DATA.policies || []})
            } else {
                set({policiesList:[]})
            }

        } catch (error) {
            console.log('Error getting policies list:', error)
            set({policiesList:[]})
            throw error
        }
    },
    settingLeavePlannerByBranch:(data)=>{
        // Sort by creation_time descending (newest first) or by id descending if creation_time is not available
        const sortedData = Array.isArray(data) ? [...data].sort((a, b) => {
            const timeA = a.creation_time || a.id || 0;
            const timeB = b.creation_time || b.id || 0;
            // Convert to number if it's a timestamp string, otherwise use as is
            const numA = typeof timeA === 'string' ? new Date(timeA).getTime() : Number(timeA);
            const numB = typeof timeB === 'string' ? new Date(timeB).getTime() : Number(timeB);
            return numB - numA; // Descending order (newest first)
        }) : data || [];
        set({allLeavesGroup: sortedData, copyAllLeavesGroup: sortedData})

    },
    UpdateLeaveGroup:(data)=>{
        const updatedName = data.group_title || data.name;
        set({
            allLeavesGroup: get().allLeavesGroup?.map((leave_group) => 
                leave_group.id == data.id ? { ...leave_group, name: updatedName, group_title: updatedName, creation_time: data.creation_time } : leave_group
            ),
            copyAllLeavesGroup: get().copyAllLeavesGroup?.map((leave_group) => 
                leave_group.id == data.id ? { ...leave_group, name: updatedName, group_title: updatedName, creation_time: data.creation_time } : leave_group
            )
        });
    },

    updatePaidToggle : (newtype) => {
        console.log(newtype)
        set({
            type : newtype
        })
    },

    gettingGoogleForms: async()=>{
        
        try {
            const response = await leavesPlannerApi.getGoogleForm()
            const data = response.data
            console.log("API Response of the google:", response)

            if(response.status === 200 && data.STATUS === "SUCCESSFUL"){
                const countries = data.DB_DATA?.COUNTRIES_LIST || []
                const branches = data?.DB_DATA?.branches?.DB_DATA || []
                set({countriesGoogleForm : countries.filter(c => c)})
                set({branchesGoogleForm: branches.filter(b => b)})
            } else {
                set({countriesGoogleForm: []})
                set({branchesGoogleForm: []})
            }
        } catch(err){
            console.log("Error in gettingGoogleForms:", err)
            set({countriesGoogleForm: []})
            set({branchesGoogleForm: []})
        }
    },

    settingbranch : (id) => {
        set({
            branchIdPolicy: id   
        })
    },

    settingPolicyId : (id) => {
        set({
            policyId: id   
        })
    },

    // Get all leave groups for HR Policy form
    getAllLeaveGroupsForPolicy: async () => {
        try {
            const response = await leavesPlannerApi.getAllLeaveGroups();
            const data = response.data;
            console.log("All Leave Groups for Policy:", data);

            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const groups = data.DB_DATA?.groups || [];
                return { success: true, data: groups };
            } else {
                console.error("Failed to fetch leave groups:", data.ERROR_DESCRIPTION);
                return { success: false, error: data.ERROR_DESCRIPTION || "Failed to fetch leave groups" };
            }
        } catch (error) {
            console.error("Error fetching leave groups:", error);
            return { success: false, error: error.message || "An error occurred while fetching leave groups" };
        }
    }

})

export default leavesPlannerViewModel