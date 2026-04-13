import React from 'react'
import shiftApi from '../../Model/Data/ShiftPlanner/ShiftPlanner'
import departmentsApi from '../../Model/Data/Departments/Departments'

const shiftManagementViewModel = (set, get) => ({
    allShiftData : [],
    loadingPlannersList: false,
    loadingPlannerShifts: false,
    loadingShiftTeams: false,
    loadingShiftTeamMembers: false,
    branchesShift : [],
    shiftPlannersData : [],
    allShiftTeams : [],
    allTeamMembers : [],
    allEmployeesDept: [],
    employeesPagination: {},
    loadingDeptEmployees: false,
    allRotatorClock : [],
    allRotatorStatus : [],
    loadingRotatorSettings: false,
    availableTeams: [],
    selectedMemberForEdit: null,
    teamId : '',
    idShift : '',
    plannerId :'',
    rotatorId: '',
    mountShift: false,
    handleMountShift : () => {
        set({mountShift: true})
    },

    gettingAllShift : async() => {
        set({ loadingPlannersList: true })
        try{
            const response = await shiftApi.getShiftPlanner()
            const data = response.data

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({allShiftData : data.DB_DATA.planners})
            } else if(response.status === 200 && data.STATUS === 'ERROR'){
                set({allShiftData : []})
            }
        } catch(error) {
            console.error(error)
        } finally {
            set({ loadingPlannersList: false })
        }
    },

    getAllBranchesShift: async () => {
        try {
            const response = await departmentsApi.gettingAllDepartments();
            const data = response.data
            if(response.status === 200 && data.STATUS === "SUCCESSFUL"){
                const branches = data.DB_DATA.branches
                const ownObjectBranches = {id: '1', branch_name: 'All Branches'}
                const  updatedBranches= [ownObjectBranches, ...branches];

                set({branchesShift: updatedBranches})
            }
        } catch (err) {
            console.error(err);
        }

    },

    addNewPlanner:(data) => {
        set({
            allShiftData: [...new Set([data, ...get().allShiftData])]
        })
    },

    gettingShifts : async(shift) => {
        // Clear previous shifts data immediately when selecting new planner
        set({shiftPlannersData: [], loadingPlannerShifts: true})
        
        const shiftData = {planner : shift.id || shift.planner_id}
        try {
            const response = await shiftApi.getPlannerShift(shiftData)
            const data = response.data
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({shiftPlannersData:data.DB_DATA.shifts})
            } else if (response.status === 200 && data.STATUS === 'ERROR'){
                set({shiftPlannersData:[]})
            }
        } catch(error) {
            console.error('Error fetching shifts:', error)
            // Handle 400 error by keeping shiftPlannersData empty
            set({shiftPlannersData:[]})
        } finally {
            set({ loadingPlannerShifts: false })
        }
    },

    gettingShiftTeams : async(dataShift) => {
        set({ allShiftTeams: [], loadingShiftTeams: true })
        const teamData = {shift : dataShift.id}
        try {
            const response = await shiftApi.getShiftTeam(teamData)
            const data = response.data
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({allShiftTeams:data.DB_DATA})
            } else if (response.status === 200 && data.STATUS === 'ERROR'){
                set({allShiftTeams:[]})
            }
        } catch(error) {
            console.error(error)
        } finally {
            set({ loadingShiftTeams: false })
        }
    },

    gettingShiftTeamMembers : async(dataTeam) => {
        set({ allTeamMembers: [], loadingShiftTeamMembers: true })
        const members = {team : dataTeam.id}

        try {
            const response = await shiftApi.getTeamMember(members)
            const data = response.data
            console.log('Team Members', data)

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({allTeamMembers:data.DB_DATA})
            } else if(response.status === 200 && data.STATUS === 'ERROR'){
                set({allTeamMembers : []})
            }
            
        } catch (error) {
            console.log(error)
            set({allTeamMembers: []})
        } finally {
            set({ loadingShiftTeamMembers: false })
        }
    },

    deptEmployeesPlanner : async(id, page = 1, limit = 10) => {
        console.log('id of the dept', id)
        set({ loadingDeptEmployees: true })
        
        try {
            let response;
            // If id is 0, fetch all employees (for "All Departments" case)
            if (id === 0 || id === '0') {
                response = await departmentsApi.getAllEmployees(page, limit)
            } else {
                response = await departmentsApi.getDeptEmployees(id, page, limit)
            }
            
            const data = response.data
            console.log('get Employess', data)

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                // Handle both response structures
                const employees = data.DB_DATA?.employees || data.DB_DATA || []
                const pagination = data.DB_DATA?.pagination || {}
                set({
                    allEmployeesDept: employees,
                    employeesPagination: pagination
                })
            } else if(response.status === 200 && data.STATUS === 'ERROR'){
                set({allEmployeesDept : [], employeesPagination: {}})
            }
            
        } catch (error) {
            console.log(error)
            set({allEmployeesDept : [], employeesPagination: {}})
        } finally {
            set({ loadingDeptEmployees: false })
        }
    },

    rotatorSettingsData : async(planner_id) => {
        set({ loadingRotatorSettings: true })
        const plannerId = {planner : planner_id}

        try{
            const response = await shiftApi.getRotatorSettingData(plannerId)
            const data = response.data.DB_DATA
            
            const currentShifts = get().shiftPlannersData
            const clockData = data.clock
            
            const shiftsWithStatus = currentShifts.map(shift => {
                let shiftStatus = shift.status || 0
                
                // Check clock data for this shift's status
                for (const hour in clockData) {
                    if (clockData[hour] && Array.isArray(clockData[hour])) {
                        const [shiftName, startTime, endTime, status] = clockData[hour]
                        if (shiftName === shift.name) {
                            shiftStatus = parseInt(status) || 0
                            break
                        }
                    }
                }
                
                return {
                    ...shift,
                    shift_id: shift.id,
                    shift_name: shift.name,
                    status: shiftStatus
                }
            })

            if(response.status === 200 && response.data.STATUS === 'SUCCESSFUL'){
                console.log('Setting rotatorId:', data.rotator_id)
                console.log('Shifts with status:', shiftsWithStatus)
                set({ 
                    allRotatorStatus: { DB_DATA: shiftsWithStatus },
                    allRotatorClock: response.data,
                    rotatorId: data.rotator_id || data.rotator_data?.rotator_id || ''
                })
            }

        }catch(error){
            console.log(error)
        } finally {
            set({ loadingRotatorSettings: false })
        }
    },

    emptyEmpList : () => {
        set({allEmployeesDept : []})


    },

    deleteMember: (id) => {
        set({
            allTeamMembers: get().allTeamMembers.filter(member => member.emp_id !== id),
        });
    },

    settingTeamId : (id) => {
        set({teamId: id})
    },

    settingShiftId : (id) => {
        set({idShift: id})
    },

    settingPlannerId : (id) => {
        set({plannerId : id})
    },

    addNewTeam : (data) => {
        const newDataTeam = {
            ...data,
            members : 0
        }
        set({
            allShiftTeams : [...new Set([newDataTeam, ...get().allShiftTeams])]
        })
    },

    addNewMemberPlanner : (data) => {
        // console.log('data',data)
        set({
            allTeamMembers : [...new Set([...data, ...get().allTeamMembers])]
        })
        console.log('get().allTeamMembers',get().allTeamMembers)
    },

    creatingNewShift : (data) => {
        const newShiftData = {
            ...data,
            teams_count : 0
        }
        set({
            shiftPlannersData : [...new Set([newShiftData, ...get().shiftPlannersData])]
        })
    },

    gettingAvailableTeams: async(branchId) => {
        try {
            const response = await shiftApi.getTeamsList(branchId)
            console.log('Available Teams', response)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                set({availableTeams: responseData.DB_DATA})
            } else {
                set({availableTeams: []})
            }
        } catch(error) {
            console.log(error)
            set({availableTeams: []})
        }
    },

    setSelectedMemberForEdit: (member) => {
        set({selectedMemberForEdit: member})
    },

    updateMemberTeam: (updatedMember) => {
        const currentMembers = get().allTeamMembers
        const updatedMembers = currentMembers.map(member => 
            member.emp_id === updatedMember.emp_id ? updatedMember : member
        )
        set({allTeamMembers: updatedMembers})
    },

    gettingTeamsByBranch: async(branchId) => {
        try {
            const response = await shiftApi.getTeamsByBranch(branchId)
            const data = response.data
            console.log('Teams by Branch', data)

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({allShiftTeams: data.DB_DATA})
            } else {
                set({allShiftTeams: []})
            }
        } catch (error) {
            console.log(error)
            set({allShiftTeams: []})
        }
    },

    clearShiftTeams: () => {
        set({allShiftTeams: []})
    },

    clearTeamMembers: () => {
        set({allTeamMembers: []})
    },

    clearAllPlannerData: () => {
        set({
            shiftPlannersData: [],
            allShiftTeams: [],
            allTeamMembers: []
        })
    }
    
})

export default shiftManagementViewModel