import axiosInstance, { axiosInstancecoremodule, payRollinstancemodule, traininginstancemodeule } from "../../base"

const employeesApi = {
    getBranches: function () {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: `get_branches`
            }
        })
    },

    getDepartments: function (branchId) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: `get_departments`,
                branch_id: branchId
            }
        })
    },

    getEmployees: function (departmentId) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: `get_employees`,
                department_id: departmentId
            }
        })
    },

    getAllEmployees: function (branchId = null) {
        const params = {
            operation: `get_all_employees`
        }
        if (branchId) {
            params.branch_id = branchId
        }
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: params
        })
    },

    // getAllDepartments: function () {
    //     return axiosInstance.request({
    findEmployee: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employees/check_employee`,
            data: {
                // operation: 'verify_username_from_oneid',
                ...data
            }
        })
    },
    gettingAllBranches: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/branches/get_branch_employee`
        })
    },
    gettingSubDepts: function (data) {
        const params = new URLSearchParams()
        params.append('branch_id', data.branch_id)
        if (data.get_all_departments) {
            params.append('get_all_departments', '1')
        }
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/departments?${params.toString()}`,
        })
    },
    getDesignations: function (data) {
        // Support both branch_id and dept_id
        const params = data.branch_id ? `branch_id=${data.branch_id}` : `dept_id=${data.d_id}`;
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/designations?${params}`,
        })
    },
    getPolicies: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/hr-api/get_hr_policy`,
            params: {
                branch_id: data.branch_id,
                status: '1' // Active policies only
            }
        })
    },

    searchEmployees: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: `/processors/get_data.php`,
            params: {
                operation: 'salay_template_optionlist',
                ...data
            }

        })
    },
    getEmpReportManager: function (branch_id) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employees`,
            params: {
                pages: 'all',
                branch_id: branch_id
            }
        })
    },

    // Get all employees for reporting manager selection (no branch_id needed)
    getAllEmployeesForReportingManager: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employees/employee/get_all_employee`
        })
    },

    // New function to get employees with proper filter parameters
    getEmployeesWithFilters: function (filters = {}) {
        // Build query string with clean parameter names
        const queryParams = [];

        // Handle page parameter
        if (filters.page) {
            queryParams.push(`page=${filters.page}`);
        }

        // Handle status parameter
        if (filters.status) {
            queryParams.push(`status=${filters.status}`);
        }

        // Handle branch_id parameter
        if (filters.branch_id) {
            queryParams.push(`branch_id=${filters.branch_id}`);
        }

        // Handle dept_id parameter
        if (filters.dept_id) {
            queryParams.push(`dept_id=${filters.dept_id}`);
        }

        // Handle limit parameter
        if (filters.limit) {
            queryParams.push(`limit=${filters.limit}`);
        }

        // Handle pages=all for export (get all employees with current filters)
        if (filters.pages === 'all') {
            queryParams.push('pages=all');
        }

        // Handle text search parameter
        if (filters.text) {
            queryParams.push(`text=${encodeURIComponent(filters.text)}`);
        }

        // Construct the URL with query string
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        const url = `/api/v1/employees${queryString}`;

        return axiosInstancecoremodule.request({
            method: 'GET',
            url: url
        })
    },
    RegisterEmp: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employees`,
            data: {
                operation: `emp_suggestion_list`,
                ...data
            }
        })
    },

    getChecklist: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: `/modules/emp_checklist/processors/get_data.php`,
            params: {
                operation: 'getEmpCheckList',
                ...data
            }
        })
    },
    getEmpExtraDuties: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: 'emp_extra_duties',
                ...data
            }
        })
    },
    getEmpAcademic: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: 'emp_academics',
                ...data
            }
        })
    },
    getEmpExperience: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: 'emp_experience',
                ...data
            }
        })
    },
    getEmpDepandants: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: 'emp_dependents',
                ...data
            }
        })
    },
    getEmpLicenses: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: 'emp_licenses',
                ...data
            }
        })
    },
    getEmpRefrences: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: 'emp_references',
                ...data
            }
        })
    },
    getEmpDocuments: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: 'emp_documents',
                ...data
            }
        })
    },
    getEmpPersonalInfo: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: `/processors/get_data.php`,
            params: {
                operation: 'emp_personal_info',
                ...data
            }
        })
    },
    addContact: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'set_emp_contact',
                ...data
            }
        })
    },
    updateEmpContact: function (data) {
        return axiosInstance.request({
            method: 'PATCH',
            url: '/processors/set_data.php',
            data: {
                operation: 'set_emp_contact',
                ...data
            }
        })
    },

    updateEmployeePersonalInfo: function (data) {
        return axiosInstance.request({
            method: 'PATCH',
            url: '/processors/set_data.php',
            data: {
                operation: 'emp_personal_info',
                ...data
            }
        })
    },

    getEditAttendance: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'emp_attendance_settings',
                ...data
            }
        })
    },
    updateAttendanceSettingPolicy: function (data) {
        return axiosInstance.request({
            method: 'PATCH',
            url: '/processors/set_data.php',
            data: {
                operation: 'emp_attendance_settings',
                ...data
            }
        })
    },
    getEmpOfficialInfo: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'emp_official_info',
                ...data
            }
        })
    },
    deleteFromOfficialInfo: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'del_emp_data',
                ...data
            }
        })
    },
    searchManagerEmp: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'search_emps_for_emp_reporting',
                ...data
            }
        })
    },
    assingManage: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employee_v2/upadate_reporting_manager',
            data: {
                ///operation: 'set_emp_reporting_to',
                ...data
            }
        })
    },

    updatingJobDescription: function (data) {
        return axiosInstance.request({
            method: 'PATCH',
            url: '/processors/set_data.php',
            data: {
                operation: 'setEmpJobDescription',
                ...data
            }
        })
    },


    updatingOfficialInfo: function (data) {
        return axiosInstance.request({
            method: 'PATCH',
            url: '/processors/set_data.php',
            data: {
                operation: 'emp_official_info',
                ...data
            }
        })
    },
    gettingOfficialInfoSalary: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'salary_settings_form',
                ...data
            }
        })
    },
    updatingOfficialInfoSalary: function (data) {
        return axiosInstance.request({
            method: 'PATCH',
            url: '/processors/set_data.php',
            data: {
                operation: 'set_emp_salary_settings',
                ...data
            }
        })
    },
    gettingBankAccountInfo: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'emp_bank_account_info',
                ...data
            }
        })
    },
    updatingBankAccountInfo: function (data) {
        return axiosInstance.request({
            method: 'PATCH',
            url: '/processors/set_data.php',
            data: {
                operation: 'emp_bank_account_info',
                ...data
            }
        })
    },
    getDegreeList: function () {
        return axiosInstance.request({
            method: 'GET',
            url: '/processors/get_data.php',
            params: {
                operation: 'degrees_list',
            }
        })
    },
    addAcademic: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'set_emp_academic',
                ...data
            }
        })
    },
    getSingleAcademic: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'academic_forms',
                ...data
            }
        })
    },

    addExperience: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'set_emp_experience',
                ...data
            }
        })
    },



    getSingleExperience: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'emp_experience_form',
                ...data
            }
        })
    },

    addDependent: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'set_emp_dependent',
                ...data
            }
        })
    },
    getSingleDependent: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'emp_dependents_form',
                ...data
            }
        })
    },
    getAllLicencesType: function () {
        return axiosInstance.request({
            method: 'GET',
            url: '/processors/get_data.php',
            params: {
                operation: 'get_license_types',
            }
        })
    },
    addLicense: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'set_emp_license',
                ...data
            }
        })
    },

    getSingleLicense: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'emp_license_form',
                ...data
            }
        })
    },
    addLicenseType: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'set_license_type',
                ...data
            }
        })
    },
    gettingRefBranches: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/branches/get_branch_employee',
            // params: {
            //     operation: 'get_branches',
            // }
        })
    },
    gettingRefDepartments: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: '/processors/get_data.php',
            params: {
                operation: 'deptt_list',
                ...data
            }
        })
    },
    gettingRefEmployees: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: '/processors/get_data.php',
            params: {
                operation: 'deptt_emp_list',
                ...data
            }
        })
    },
    addReference: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'emp_reference',
                ...data
            }
        })
    },
    addDocument: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: data
        })
    },
    addPrivileges: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'set_privilege',
                ...data
            }
        })
    },
    getPrivileges: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            params: {
                operation: 'getEmpPrivileges',
                ...data
            }
        })
    },
    deletePrivilege: function (data) {
        return axiosInstance.request({
            method: 'DELETE',
            url: '/processors/set_data.php',
            params: {
                operation: 'remove_emp_role',
                ...data
            }
        })
    },
    addEmpPrivilege: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'updateEmpPrivileges',
                ...data
            }
        })
    },
    addRepetitive: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/set_data.php',
            data: {
                operation: 'assign_emp_extra_duty',
                ...data
            }
        })
    },
    getSingleRepetitive: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'emp_duty_assigning_form',
                ...data
            }
        })
    },

    getAllAccelerate: function (data) {
        return axiosInstance.request({
            method: 'GET',
            url: '/processors/get_data.php',
            params: {
                operation: 'emp_acc_performance',
                ...data
            }
        })
    },
    getRegularAccelerateData: function (data) {
        return axiosInstance.request({
            method: 'POST',
            url: '/processors/get_data.php',
            data: {
                operation: 'emp_acc_performance',
                ...data
            }
        })
    },
    getEmployeeCheckList: function (data) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/Check_list/defined-checklists',
            params: {
                // operation: '/api/v1/Check_list/defined-checklists',
                ...data
            }
        })
    },
    addBulkEmployees: function (formData) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employees/bulk-upload',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    // async (employees) => {
    //     try {
    //         const response = await axiosInstancecoremodule.post('/employees/bulk', employees);
    //         return response;
    //     } catch (error) {
    //         console.error('Error adding bulk employees:', error);
    //         return {
    //             STATUS: 'ERROR',
    //             MESSAGE: error.message || 'Failed to add employees'
    //         };
    //     }
    // },

    get_inactive_emp: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employees/inactive_employee_list/list',
            // data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Get employee by ID
    getEmployeeById: function (employeeId) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employees/${employeeId}`,
        })
    },

    deactive_employee: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/deactive-employee`,
            data: data,
        })
    },

    active_employee: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/deactive-employee/active_employee`,
            data: data,
        })
    },
    get_all_employeee: function (dept_id = null) {
        const params = dept_id ? { dept_id } : {}
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employees/employee/get_all_employee',
            params: params
        })
    },
    gettingAllEmployees: function (params = {}) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employees/employee/get_all_employee',
            params: params
        })
    },

    // Check if employee exists
    checkEmployeeExists: function (employeeId) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employees/${employeeId}`
        })
    },

    // Get employee profile by user ID
    getEmployeeProfile: function (userId) {
        // console.log('API call - getEmployeeProfile with userId:', userId);
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employee_v2/get_emp_profile`,
            params: {
                user_id: userId
            }
        })
    },

    // Update employee basic information
    updateEmployee: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/employees/${employeeId}`,
            data: data
        })
    },

    // Add/Update employee contact
    addEmployeeContact: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_contact/${employeeId}`,
            data: data
        })
    },

    // Delete employee contact
    deleteEmployeeContact: function (contactId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_contact/${contactId}`,
            data: data
        })
    },

    // Update employee profile (Official Information)
    updateEmployeeProfile: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/update_employee_profile`,
            data: data
        })
    },

    // Add employee experience
    addEmployeeExperience: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_employee_experience/${employeeId}`,
            data: data
        })
    },

    // Update employee experience
    updateEmployeeExperience: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_employee_experience/${employeeId}`,
            data: {
                ...data,
                operation: 'update_experience'
            }
        })
    },

    // Delete employee experience
    deleteEmployeeExperience: function (employeeId, experienceId) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_employee_experience/${employeeId}`,
            data: {
                id: experienceId,
                operation: 'delete_experience'
            }
        })
    },

    // Get degrees list from new API endpoint
    getDegrees: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employee_v2/get_degress'
        })
    },

    // Add employee education
    addEmployeeEducation: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_employee_education/${employeeId}`,
            data: data
        })
    },

    // Update employee education
    updateEmployeeEducation: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_employee_education/${employeeId}`,
            data: {
                ...data,
                operation: 'update_academics'
            }
        })
    },

    // Delete employee education
    deleteEmployeeEducation: function (employeeId, educationId) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_employee_education/${employeeId}`,
            data: {
                id: educationId,
                operation: 'delete_academic'
            }
        })
    },

    // Add employee dependent
    addEmployeeDependent: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_employee_dependent/${employeeId}`,
            data: data
        })
    },

    // Add employee license
    addEmployeeLicense: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_licenses/${employeeId}`,
            data: data
        })
    },

    // Update employee license
    updateEmployeeLicense: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_licenses/${employeeId}`,
            data: {
                ...data,
                operation: 'update_license'
            }
        })
    },

    // Delete employee license
    deleteEmployeeLicense: function (employeeId, licenseId) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_licenses/${employeeId}`,
            data: {
                id: licenseId,
                operation: 'delete_license'
            }
        })
    },

    // Add license type
    addLicenseType: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_licenses_type`,
            data: data
        })
    },

    // Get license types
    getLicenseTypes: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employee_v2/get_license_type`
        })
    },

    // Add employee reference
    addEmployeeReference: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/add_employee_reference/${employeeId}`,
            data: data
        })
    },

    // Add employee document
    addEmployeeDocument: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/save_docs/${employeeId}`,
            data: data
        })
    },

    // Delete employee document
    deleteEmployeeDocument: function (employeeId, documentId) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/save_docs/${employeeId}`,
            data: {
                id: documentId,
                operation: 'delete_documents'
            }
        })
    },

    // Assign employee privilege
    assignEmployeePrivilege: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/assign_previlage`,
            data: data
        })
    },

    // Remove employee privilege/role
    removeEmployeePrivilege: function (employeeId, privilege) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/remove_previlage/${employeeId}`,
            data: {
                privilege: privilege
            }
        })
    },

    // Get employee privileges
    getEmployeePrivileges: function (empId) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employee_v2/get_employee_privileges`,
            params: {
                emp_id: empId
            }
        })
    },

    // Add employee duty
    addEmployeeDuty: function (employeeId, data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v2/assign_employee_task/${employeeId}`,
            data: data
        })
    },
    updateEmployeeDuty: function (dutyId, data) {
        return axiosInstancecoremodule.request({
            method: "PUT",
            url: `/api/v1/employee_v2/update_assign_employee_task/${dutyId}`,
            data: data
        })
    },

    deleteEmployeeDuty: function (dutyId) {
        return axiosInstancecoremodule.request({
            method: "DELETE",
            url: `/api/v1/employee_v2/delete_assign_employee_task/${dutyId}`
        })
    },


    getHeaderData: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/dashboard/get_machiene_data',
        })
    },

    // Update employee bank account details
    updateAccountDetail: function (data) {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/employee_v3/update_account_detail`,
            data: data
        })
    },

    updateSalary: function (data) {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: `/api/v1/employee_v3/update_salary`,
            data: data
        })
    },

    getBankAccountTypes: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employee_v3/get_bank_account_types`
        })
    },

    // Get employee profile v2 with all details
    getEmployeeProfileV2: function (userId) {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: `/api/v1/employee_v2/get_emp_profile_v2`,
            params: {
                user_id: userId
            }
        })
    },


    getSalaryTemplate: function (userId) {
        return payRollinstancemodule.request({
            method: 'GET',
            url: `/manage_payslip/salary-templates-list`,
            params: {
                user_id: userId
            }
        })
    },

    // Signature APIs
    getSignatures: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employees/signature/get_signature'
        })
    },

    addSignature: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employees/add_signature',
            data: data
        })
    },

    deleteSignature: function (signatureId) {
        return axiosInstancecoremodule.request({
            method: 'DELETE',
            url: `/api/v1/employees/delete_signature/${signatureId}`
        })
    },

    // Logo APIs
    getOrgLogo: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employees/logo/get_org_logo'
        })
    },

    updateOrgLogo: function (logoData) {
        return axiosInstancecoremodule.request({
            method: 'PUT',
            url: '/api/v1/employees/logo/update_company_logo/10824961',
            data: logoData,
            headers: { 'Content-Type': 'application/json' }
        })
    },

    // Upload file to elephant server for logo
    uploadFileToElephant: function (formData) {
        return traininginstancemodeule.request({
            method: 'POST',
            url: '/api/make_url',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // Logout API
    logout: function () {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/logout',
            headers: { 'Content-Type': 'application/json' }
        })
    },

    // Digital Signature APIs
    getDigitalSignature: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employees/signature/get_digital_signature'
        })
    },

    addDigitalSignature: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employees/signature/add_didtal_signature',
            data: data
        })
    },

    // Birthday Template APIs
    getBirthdayTemplate: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employees/gettemplete/birthdaytemplete'
        })
    },

    updateBirthdayTemplate: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employees/templete/birthdaytemplete',
            data: data
        })
    },

    // Mobile Attendance APIs
    getMobileAttendanceConfig: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employees/attendence/get_attendence_logs'
        })
    },

    toggleMobileAttendance: function () {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employees/attendence/configureMobileAttendance'
        })
    },

    toggleMobileAttendanceLocationLog: function () {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employees/attendence/setMobileAttendanceLocationLog'
        })
    },

    // Retirement and Probation APIs
    getRetirementData: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employees/org/get_retimenent_data'
        })
    },

    setRetirementData: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employees/org/set_retimenent_data',
            data: data
        })
    },

    // Reporting Email APIs
    getReportingEmails: function () {
        return axiosInstancecoremodule.request({
            method: 'GET',
            url: '/api/v1/employees/emial/get_reporting_email'
        })
    },

    sendReportingEmail: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employees/emial/send_reporting_email',
            data: data
        })
    },

    // Save employee asset
    saveEmployeeAsset: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employee_v3/save_asset',
            data: data
        })
    },

    // Delete employee asset
    deleteEmployeeAsset: function (assetId) {
        return axiosInstancecoremodule.request({
            method: 'DELETE',
            url: `/api/v1/employee_v3/delete_asset/${assetId}`
        })
    },

    // Update attendance settings (Mobile Attendance and Attendance Premises)
    updateAttendanceSettings: function (data) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: '/api/v1/employee_v2/update_attendance_settings',
            data: data
        })
    },

    // Send profile update invitation email to employee
    sendProfileUpdateInvite: function (employeeId) {
        return axiosInstancecoremodule.request({
            method: 'POST',
            url: `/api/v1/employee_v3/email/send_profile_rec/${employeeId}`
        })
    },


}

export default employeesApi