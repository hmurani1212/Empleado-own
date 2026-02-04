import axiosInstance, { LeavePlannerinstancemodule, ShiftPlannerinstancemodule } from "../../base"

const shiftApi = {
    getShiftPlanner : function(data) {
        return ShiftPlannerinstancemodule.request({
            method:'GET',
            url:'/api/v1/planners',
            data : {
                operation:'shift_planners',
                ...data
            }
        })
    },

    createPlanner : function(data) {
        return ShiftPlannerinstancemodule.request({
            method:'POST',
            url:'/api/v1/planners',
            data : {
                // operation:'set_shift_planner',
                ...data
            }


        })
    },

    getPlannerShift : function(data) {
        return ShiftPlannerinstancemodule.request({
            method:'GET',
            url:`/api/v1/shifts?planner_id=${data.planner}`,
            data : {
                operation:'planner_shifts',
                ...data
            }
        })
    },

    getShiftTeam : function(data) {
        return ShiftPlannerinstancemodule.request({
            method:'GET',
            url:`/api/v1/shifts/teams?shift_or_planner=shift&shift_id=${data.shift}`,
            data : {
                // operation:'shift_teams',
                ...data
            }
        })
    },

    getTeamMember : function(data) {
        return ShiftPlannerinstancemodule.request({
            method:'GET',
            url:`/api/v1/shifts/teams/members?team_id=${data.team}`,
            data : {
                // operation:'shift_team_members',
                ...data
            }
        })
    },

    deleteTeamMember : function(data){
        return ShiftPlannerinstancemodule.request({
            method:'POST',
            url:'/api/v1/shifts/teams/members/delete',
            data : {
                // operation:'remove_team_member',
                ...data
            }
        })
    },

    addTeams : function(data){
        return ShiftPlannerinstancemodule.request({
            method:'POST',
            url:'/api/v1/shifts/teams',
            data : {
                // operation:'set_shift_team',
                ...data
            }

        })
    },

    allBranchesPlanner : function(data){
        return axiosInstance.request({
            method:'POST',
            url:'processors/get_data.php',
            data : {
                operation:'branch_list',
                ...data
            }

        })
    },

    getSubDeptPlanner : function(data){
        return axiosInstance.request({
            method:'POST',
            url:'processors/get_data.php',
            data : {
                operation:'getSubDept',
                ...data
            }

        })
    },

    getEmployessPlanner : function(data){
        return axiosInstance.request({
            method:'POST',
            url:'processors/get_data.php',
            data : {
                operation:'get_deptt_emps',
                ...data
            }
        })
    },

    addTeamMembers : function(data) {
        return ShiftPlannerinstancemodule.request({
            method:'POST',
            url:'/api/v1/shifts/teams/employees',
            data : {
                // operation : 'set_shift_team_emps',
                ...data
            }
        })
    },
    
    createNewShift : function(data) {
        return ShiftPlannerinstancemodule.request({
            method:'POST',
            url:'/api/v1/shifts',
            data : {
                // operation:'set_shift',
                ...data
            }
        })
    },

    getRotatorSettingData : function(data){
        // console.log("data get rotator setting data", data)
        return ShiftPlannerinstancemodule.request({
            method : 'GET',
            url:`/api/v1/shifts/rotator/${data.planner}/clock`,
            data : {
                // operation : 'shift_rotators',
                ...data
            }
        })
    },

    setRotatorSetting : function(data){
        return ShiftPlannerinstancemodule.request({
            method : 'PUT',
            url:'/api/v1/shifts/rotator-period',
            data : data
        })
    },

    getAvailableTeams: function(data) {
        return ShiftPlannerinstancemodule.request({
            method: 'GET',
            url: `/api/v1/shifts/teams?shift_or_planner=planner&planner_id=${data.planner_id}`,
        })
    },

    updateTeamMember: function(data) {
        return ShiftPlannerinstancemodule.request({
            method: 'POST',
            url: '/api/v1/shifts/teams/change-employee',
            data: { ...data }
        })
    },

    getTeamsList: function(id) {
        return ShiftPlannerinstancemodule.request({
            method: 'GET',
            url: `/api/v1/shifts/team-list/${id}`
        })
    },

    downloadRoster: function(data) {
        return ShiftPlannerinstancemodule.request({
            method: 'GET',
            url: `/api/v1/shifts/roaster`,
            params: {
                shift_id: data.shift_id,
                date_from: data.date_from,
                date_upto: data.date_upto
            }
        })
    },

    updateShiftRotatorStatus: function(data) {
        return ShiftPlannerinstancemodule.request({
            method: 'POST',
            url: `/api/v1/shifts/rotator/set-or-remove`,
            data: {
                shift_id: data.shift_id,
                planner_id: data.planner_id,
                status: String(data.status)
            }
        })
    }

}

export default shiftApi