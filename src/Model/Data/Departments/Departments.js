import { axiosInstance, axiosInstancecoremodule } from "../../base"

const departmentsApi = {
    gettingAllDepartments: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/branches/get_branch_employee`
        })
    },

    setAddNewDepartment: function () {
        return axiosInstance.request({
            method: 'POST',
            url: `processors/set_data.php?operation=add_deptt`
        })
    },

    manageDepartments: function (bid, page = 1, limit = 10, get_all_departments = false) {
        const params = {
            branch_id: bid,
            page,
            limit
        };
        if (get_all_departments === true) {
            params.get_all_departments = true;
        }
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/departments`,
            params
        })
    },

    deleteDepartments: function (data) {
        return axiosInstancecoremodule.request({
            method: 'DELETE',
            url: `/api/v1/departments/${data.id}`,
            data: {
                operation: 'del_department',
                ...data
            }
        })
    },

    deleteDesignations: function (data) {
        return axiosInstancecoremodule.request({
            method: 'DELETE',
            url: `/api/v1/designations/${data.id}`,
            // data : {
            //     operation : 'del_designation',
            //     ...data
            // }
        })
    },

    getDeptEmployees: function (dept_id, page = 1, limit = 10, search = '') {
        // All Departments: dept_id=0 and page=all only
        if (dept_id === 0 || dept_id === '0') {
            return axiosInstancecoremodule.request({
                method: 'GET',
                url: `/api/v1/employees`,
                params: { dept_id: 0, page: 'all' }
            })
        }
        const params = new URLSearchParams();
        params.append('dept_id', dept_id);
        params.append('page', page);
        params.append('limit', limit);
        if (search && String(search).trim() !== '') {
            params.append('text', String(search).trim());
        }
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employees?${params.toString()}`,
            // Avoid 304 Not Modified with empty body (breaks STATUS / DB_DATA parsing in clients)
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        })
    },

    // New function to get employees by department ID for HOD selection
    getEmployeesByDeptId: function (dept_id) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employees?dept_id=${dept_id}`
        })
    },

    // Function to get all employees (for All Department case)
    getAllEmployees: function (page = 1, limit = 10, search = '') {
        const params = { page, limit };
        if (search && String(search).trim() !== '') {
            params.text = String(search).trim();
        }
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employees`,
            params
        })
    },

    editDeptDesignation: function (data) {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/designations/${data.d_id}`,
            data: {
                title: data.d_title
            }
        })
    },


    empSuggestionsDept: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `processors/get_data.php`,
            data: {
                operation: 'emp_suggestion_list',
                ...data
            }
        })
    },

    updateHod: function (data) {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/departments/hod/update_Hod`,
            data: {
                /// operation : 'add_hod',
                ...data
            }
        })
    },

    getSingleData: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: 'processors/get_data.php',
            params: {
                operation: 'get_deptt_for_edit',
                ...data
            }
        })
    },

    updateEditDepartment: function (data) {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/departments/${data.id}`,
            data: {
                branch_id: data.branch_id,
                name: data.name,
                description: data.description,
                parent_id: data.parent_id,
                is_global: data.is_global
            }
        })
    },

    addNewDesignation: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/designations',
            data: {
                ///operation : 'new_designation',
                ...data
            }
        })
    },

    createNewDept: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/departments',
            data: {
                // operation : 'add_deptt',
                ...data
            }
        })
    },

    getDesignations: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/designations`,
            params: {
                dept_id: data.d_id,
                page: data.page || 1,
                limit: data.limit || 10
            },
            // Avoid 304 Not Modified so response body is always present (304 often has empty body)
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        })
    },
    getSubDept: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/departments/${data.parent_id}/sub-departments`,
        })
    },

    //  slect_dp:function(data){
    //     return axiosInstancecoremodule.request({
    //         method: 'GET',
    //         url:`/api/v1/departments/dept/get_dep_employee`,


    //     })
    // },
    addNewSubDesignation: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/departments',
            data: {
                //operation : 'add_deptt',
                ...data
            }
        })
    },
    getFreqDesgination: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: 'processors/get_data.php',
            params: {
                operation: 'designations_list',
                ...data
            }
        })
    },


    get_all_Department: function (branchId) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: "/api/v1/departments/list/all",
            params: {
                branch_id: branchId === undefined || branchId === null ? 0 : branchId
            }
        })
    }


}

export default departmentsApi