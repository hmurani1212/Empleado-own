import employeesApi from "../../Model/Data/Employees/Employees"
import departmentsApi from "../../Model/Data/Departments/Departments"
import { showToast } from "../../Components/Toaster/Toaster"

const employeeViewModel = (set, get) => ({
    allEmployees: [],
    employeesListLoading: true,
    copyAllEmployees: [],
    deptEmp: [],
    copyFilterEmployees: [],
    statusEmployess: [],
    empMount: false,
    showExcelTable: false,
    get_inactive_emp_data: [],
    checkListPageId: '',
    employeeCheckListData: [],
    Get_All_Employee: [],
    getHeaderData: {},
    setHeaderData: (data) => set({ getHeaderData: data }),
    // Signature state and functions
    signatures: [],
    isLoadingSignatures: false,

    // Logo state and functions
    orgLogo: null,
    isLoadingLogo: false,

    get_bank_type: [],

    // Employee profile loading state
    isLoadingEmployeeProfile: false,
    handleEmpMount: () => {
        set({ mount: true })
    },




    getEmployeesList: async () => {

        try {
            const response = await employeesApi.gettingAllEmployees()
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {

                set({ allEmployees: data.DB_DATA, copyAllEmployees: data.DB_DATA })
            }

        } catch (err) {

        } finally {

        }
    },

    filterEmpAlphabet: (alpha, index) => {
        const lowercaseName = alpha.toLowerCase();
        if (index === 0) {
            set({ allEmployees: get().copyAllEmployees })

        } else {
            set({ allEmployees: get().copyAllEmployees })

            const filterData = get().allEmployees.DATA?.filter((enployee) => {
                // Assuming the employee name is stored in the 'emp_name' property
                // Change 'emp_name' to the actual property name if it's different
                return enployee.data.name.toLowerCase().startsWith(lowercaseName);
            });

            set((state) => {
                const updatedEmpData = {
                    ...state.allEmployees,
                    DATA: filterData
                };

                return { allEmployees: updatedEmpData };
            });
        }


    },

    filterEmployeesList: async (name) => {
        set({ allEmployees: get().copyAllEmployees })

        if (name === "All Branches") {
            set({ allEmployees: get().copyAllEmployees, copyFilterEmployees: get().copyAllEmployees })

        } else {
            try {

                const filterData = get().allEmployees.DATA?.filter((data) => {
                    return data.emp_branch === name
                });
                set((state) => {
                    const updatedEmpData = {
                        ...state.allEmployees,
                        DATA: filterData
                    };

                    return { allEmployees: updatedEmpData, copyFilterEmployees: updatedEmpData };


                })

            } catch (err) {
                console.log(err)
            }

        }

    },







    filterEmployeesListDept: async (name) => {
        // console.log('******')
        // set({allEmployees:get().copyAllEmployees})
        // try{

        //     const filterData = get().allEmployees.DATA?.filter((data) => {
        //         return data.emp_dept === name;
        //     });      

        //     set((state) => {
        //         const updatedEmpData = {
        //             ...state.allEmployees,
        //             DATA: filterData
        //         };

        //         return { allEmployees: updatedEmpData, deptEmp:updatedEmpData };


        //     })

        // }catch(err){
        //     console.log(err)
        // }
    },

    searchEmployees: (name) => {
        const lowercaseName = name.toLowerCase();
        const copyFilterEmps = get().copyFilterEmployees
        const statusFilterEmps = get().statusEmployess
        if (copyFilterEmps.length <= 0 && statusFilterEmps.length <= 0) {
            if (name.trim() === '') {
                set({ allEmployees: get().copyAllEmployees })
            } else {
                const matchedEmps = get().copyAllEmployees.DATA?.filter((employee) =>
                    employee.data.name.toLowerCase().includes(lowercaseName)
                );

                set((state) => {
                    const updatedEmpsData = {
                        ...state.allEmployees,
                        DATA: matchedEmps
                    };

                    return { allEmployees: updatedEmpsData };


                })
            }
        } else if (statusFilterEmps.length <= 0) {

            // console.log('branches selected')
            if (name.trim() === '') {
                set({ allEmployees: get().copyFilterEmployees })
            } else {
                const matchedEmps = get().copyFilterEmployees.DATA?.filter((employee) =>
                    employee.data.name.toLowerCase().includes(lowercaseName)
                );

                set((state) => {
                    const updatedEmpsData = {
                        ...state.allEmployees,
                        DATA: matchedEmps
                    };

                    return { allEmployees: updatedEmpsData };


                })
            }
        } else {
            if (name.trim() === '') {
                set({ allEmployees: get().statusEmployess })
            } else {
                const matchedEmps = get().statusEmployess.DATA?.filter((employee) =>
                    employee.data.name.toLowerCase().includes(lowercaseName)
                );

                set((state) => {
                    const updatedEmpsData = {
                        ...state.allEmployees,
                        DATA: matchedEmps
                    };

                    return { allEmployees: updatedEmpsData };


                })
            }
        }
    },

    filterStatusEmployess: (status) => {
        const copyFilterEmps = get().copyFilterEmployees

        // console.log('copyFilterEmps',copyFilterEmps)





        if (copyFilterEmps.length <= 0) {
            if (status.status === '') {
                return { allEmployees: get().copyAllEmployees, statusEmployess: get().copyAllEmployees };

            } else {



                const matchedEmps = get().copyAllEmployees.DATA?.filter((employee) =>
                    employee.data.status === status
                );

                set((state) => {
                    const updatedEmpsData = {
                        ...state.allEmployees,
                        DATA: matchedEmps
                    };

                    return { allEmployees: updatedEmpsData, statusEmployess: updatedEmpsData };


                })
            }

        } else {
            if (status.status === '') {
                return { allEmployees: get().copyFilterEmployees, statusEmployess: get().copyFilterEmployees };

            } else {
                const matchedEmps = get().copyFilterEmployees.DATA?.filter((employee) =>
                    employee.data.status === status
                );

                set((state) => {
                    const updatedEmpsData = {
                        ...state.allEmployees,
                        DATA: matchedEmps
                    };

                    return { allEmployees: updatedEmpsData, statusEmployess: updatedEmpsData };


                })
            }
        }

    },
    newEmployee: (data) => {
        // console.log('***', get().allEmployees)
        set({
            allEmployees: [...new Set([...get().allEmployees.DATA, data])],
            copyAllEmployees: [...new Set([...get().copyAllEmployees.DATA, data])],

        })
    },

    toggleShowExcelTable: () => {
        set({ showExcelTable: true })
    },
    toggleOffExcelTable: () => {
        set({ showExcelTable: false })

    },

    gettingEmployeeCheckList: async () => {
        try {
            const response = await employeesApi.getEmployeeCheckList()
            const responseData = response.data;
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                set({ employeeCheckListData: responseData.DB_DATA.data, })
            } else {
                set({ employeeCheckListData: [], checkListPageId: responseData.PAGE })

            }

        } catch (error) {

        }
    },
    get_inactive_empfn: async () => {
        try {
            const response = await employeesApi.get_inactive_emp()
            const responseData = response.data
            console.log("inactive employees", response)
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                set({ get_inactive_emp_data: responseData.DB_DATA, checkListPageId: responseData.PAGE })
            } else {
                set({ get_inactive_emp_data: [], checkListPageId: responseData.PAGE })

            }

        } catch (error) {

        }
    },

    // Get employee by ID
    gettingEmployeeById: async (employeeId) => {
        try {
            const response = await employeesApi.getEmployeeById(employeeId)
            const responseData = response.data;
            // console.log('Test Resposne', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to fetch employee:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error fetching employee by ID:', error)
            return null
        }
    },
    deactive_employeefn: async (data) => {
        try {
            const response = await employeesApi.deactive_employee(data)
            const responseData = response.data;
            //  console.log('Test Resposne1111111', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to fetch employee:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error fetching employee by ID:', error)
            return null
        }
    },

    Active_employeefn: async (data) => {
        try {
            const response = await employeesApi.active_employee(data)
            const responseData = response.data;
            //  console.log('Test Resposne1111111', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to fetch employee:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error fetching employee by ID:', error)
            return null
        }
    },

    Get_All_Employeefn: async (dept_id = null) => {
        try {
            const response = await employeesApi.get_all_employeee(dept_id);
            const responseData = response.data;
            if (responseData.STATUS === "SUCCESSFUL") {
                set({ Get_All_Employee: responseData.DB_DATA })
                return responseData.DB_DATA
            } else {
                console.error('Failed to fetch employees:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error fetching employees:', error)
            return null
        }
    },

    // Check if employee exists, then get employee profile by user ID
    gettingEmployeeProfile: async (userId) => {
        try {
            set({ isLoadingEmployeeProfile: true });

            // Directly fetch the full profile; backend will handle invalid IDs
            const profileResponse = await employeesApi.getEmployeeProfile(userId);
            const profileData = profileResponse.data;

            if (profileData.STATUS === "SUCCESSFUL") {
                set({ isLoadingEmployeeProfile: false });
                return profileData;
            } else {
                console.error('Failed to fetch employee profile:', profileData.ERROR_DESCRIPTION);
                set({ isLoadingEmployeeProfile: false });
                return null;
            }
        } catch (error) {
            console.error('Error in gettingEmployeeProfile:', error);
            set({ isLoadingEmployeeProfile: false });
            return null;
        }
    },

    /**
     * Fetch employee profile attendance data (bio, policy, team, shift, planner, web/mobile attendance).
     * Used when user opens Attendance Setting; returns full API response or null.
     */
    gettingEmpProfileAttendance: async (userId) => {
        try {
            const response = await employeesApi.getEmpProfileAttendance(userId);
            const data = response?.data;
            if (data?.STATUS === 'SUCCESSFUL') {
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error in gettingEmpProfileAttendance:', error);
            return null;
        }
    },

    /**
     * Fetch employee profile documents (education, experience, dependents, licenses, references, documents).
     * Used when user opens Documents tab; returns full API response or null.
     */
    gettingEmpProfileDocuments: async (userId) => {
        try {
            const response = await employeesApi.getEmpProfileDocuments(userId);
            const data = response?.data;
            if (data?.STATUS === 'SUCCESSFUL') {
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error in gettingEmpProfileDocuments:', error);
            return null;
        }
    },

    /**
     * Fetch employee profile salary settings. Returns full API response or null. DB_DATA.Salary_Settings (key kept same).
     */
    gettingEmpProfileSalarySettings: async (userId) => {
        try {
            const response = await employeesApi.getEmpProfileSalarySettings(userId);
            const data = response?.data;
            if (data?.STATUS === 'SUCCESSFUL') {
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error in gettingEmpProfileSalarySettings:', error);
            return null;
        }
    },

    /**
     * Fetch employee profile leave balance. Returns full API response or null. DB_DATA.leave_balanace (key kept same).
     */
    gettingEmpProfileLeaveBalance: async (userId) => {
        try {
            const response = await employeesApi.getEmpProfileLeaveBalance(userId);
            const data = response?.data;
            if (data?.STATUS === 'SUCCESSFUL') {
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error in gettingEmpProfileLeaveBalance:', error);
            return null;
        }
    },

    /**
     * Fetch employee profile checklist. Returns full API response or null. DB_DATA.emp_checklist (key kept same).
     */
    gettingEmpProfileChecklist: async (userId) => {
        try {
            const response = await employeesApi.getEmpProfileChecklist(userId);
            const data = response?.data;
            if (data?.STATUS === 'SUCCESSFUL') {
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error in gettingEmpProfileChecklist:', error);
            return null;
        }
    },

    /**
     * Fetch employee profile module privileges. Returns full API response or null. DB_DATA.module_privileges (key kept same).
     */
    gettingEmpProfileModulePrivileges: async (userId) => {
        try {
            const response = await employeesApi.getEmpProfileModulePrivileges(userId);
            const data = response?.data;
            if (data?.STATUS === 'SUCCESSFUL') {
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error in gettingEmpProfileModulePrivileges:', error);
            return null;
        }
    },

    /**
     * Fetch employee profile repetitive duties. Returns full API response or null. DB_DATA.Repetitive_Duties (key kept same).
     */
    gettingEmpProfileRepetitiveDuties: async (userId) => {
        try {
            const response = await employeesApi.getEmpProfileRepetitiveDuties(userId);
            const data = response?.data;
            if (data?.STATUS === 'SUCCESSFUL') {
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error in gettingEmpProfileRepetitiveDuties:', error);
            return null;
        }
    },

    // Update employee basic information
    updateEmployee: async (employeeId, data) => {
        try {
            const response = await employeesApi.updateEmployee(employeeId, data)
            const responseData = response.data;
            console.log('Update Employee Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to update employee:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error updating employee:', error)
            return null
        }
    },

    // Add/Update employee contact
    addEmployeeContact: async (employeeId, data) => {
        try {
            const response = await employeesApi.addEmployeeContact(employeeId, data)
            const responseData = response.data;
            console.log('Add Employee Contact Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to add/update employee contact:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error adding/updating employee contact:', error)
            return null
        }
    },

    // Delete employee contact
    deleteEmployeeContact: async (contactId, data) => {
        try {
            const response = await employeesApi.deleteEmployeeContact(contactId, data)
            const responseData = response.data;
            console.log('Delete Employee Contact Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to delete employee contact:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error deleting employee contact:', error)
            return null
        }
    },

    // Update employee profile (Official Information)
    updateEmployeeProfile: async (data) => {
        try {
            const response = await employeesApi.updateEmployeeProfile(data)
            const responseData = response.data;
            console.log('Update Employee Profile Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to update employee profile:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error updating employee profile:', error)
            return null
        }
    },

    // Add employee experience
    addEmployeeExperience: async (employeeId, data) => {
        try {
            const response = await employeesApi.addEmployeeExperience(employeeId, data)
            const responseData = response.data;
            console.log('Add Employee Experience Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to add employee experience:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error adding employee experience:', error)
            return null
        }
    },

    // Add employee education
    addEmployeeEducation: async (employeeId, data) => {
        try {
            const response = await employeesApi.addEmployeeEducation(employeeId, data)
            const responseData = response.data;
            console.log('Add Employee Education Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to add employee education:', responseData.ERROR_DESCRIPTION)
                // Return error object instead of null so we can access error message
                return {
                    STATUS: "ERROR",
                    ERROR_DESCRIPTION: responseData.ERROR_DESCRIPTION || 'Failed to add employee education',
                    ERROR_CODE: responseData.ERROR_CODE || '',
                    ERROR_FILTER: responseData.ERROR_FILTER || ''
                }
            }
        } catch (error) {
            console.error('Error adding employee education:', error)
            // Return error object with error details
            return {
                STATUS: "ERROR",
                ERROR_DESCRIPTION: error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to add employee education',
                ERROR_CODE: error.response?.data?.ERROR_CODE || '',
                ERROR_FILTER: error.response?.data?.ERROR_FILTER || ''
            }
        }
    },

    // Add employee dependent
    addEmployeeDependent: async (employeeId, data) => {
        try {
            const response = await employeesApi.addEmployeeDependent(employeeId, data)
            const responseData = response.data;
            console.log('Add Employee Dependent Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to add employee dependent:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error adding employee dependent:', error)
            return null
        }
    },

    // Add employee license
    addEmployeeLicense: async (employeeId, data) => {
        try {
            const response = await employeesApi.addEmployeeLicense(employeeId, data)
            const responseData = response.data;
            console.log('Add Employee License Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to add employee license:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error adding employee license:', error)
            return null
        }
    },

    // Add employee reference
    addEmployeeReference: async (employeeId, data) => {
        try {
            const response = await employeesApi.addEmployeeReference(employeeId, data)
            const responseData = response.data;
            console.log('Add Employee Reference Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to add employee reference:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error adding employee reference:', error)
            return null
        }
    },

    // Add employee document
    addEmployeeDocument: async (employeeId, data) => {
        try {
            const response = await employeesApi.addEmployeeDocument(employeeId, data)
            const responseData = response.data;
            console.log('Add Employee Document Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to add employee document:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error adding employee document:', error)
            return null
        }
    },

    // Assign employee privilege
    assignEmployeePrivilege: async (data) => {
        try {
            const response = await employeesApi.assignEmployeePrivilege(data)
            const responseData = response.data;
            console.log('Assign Employee Privilege Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to assign employee privilege:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error assigning employee privilege:', error)
            return null
        }
    },

    // Add employee duty
    addEmployeeDuty: async (employeeId, data) => {
        try {
            const response = await employeesApi.addEmployeeDuty(employeeId, data)
            const responseData = response.data;
            console.log('Add Employee Duty Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to add employee duty:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error adding employee duty:', error)
            return null
        }
    },
    updateEmployeeDuty: async (dutyId, data) => {
        try {
            const response = await employeesApi.updateEmployeeDuty(dutyId, data)
            const responseData = response.data;
            console.log('Update Employee Duty Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                showToast('Duty updated successfully', 'success')
                return responseData
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to update duty', 'error')
                console.error('Failed to update employee duty:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error updating employee duty:', error)
            showToast('Failed to update duty', 'error')
            return null
        }
    },

    // Delete employee duty
    deleteEmployeeDuty: async (dutyId) => {
        try {
            const response = await employeesApi.deleteEmployeeDuty(dutyId)
            const responseData = response.data;
            // console.log('Delete Employee Duty Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                // showToast('Duty deleted successfully', 'success')
                return responseData
            } else {
                showToast(responseData.ERROR_DESCRIPTION || 'Failed to delete duty', 'error')
                // console.error('Failed to delete employee duty:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            // console.error('Error deleting employee duty:', error)
            showToast('Failed to delete duty', 'error')
            return null
        }
    },
    getHeaderDatafn: async (data) => {
        try {
            // Make your API call here
            const response = await employeesApi.getHeaderData(data);
            const responseData = response.data;

            ////console.log("Re-interview API response:", responseData.DB_DATA);

            if (responseData.STATUS === 'SUCCESS') {
                // Update Zustand state with DB_DATA from the API response
                set({ getHeaderData: responseData.DB_DATA });

                return responseData.DB_DATA;

                // Return success status and data
                ///return { success: true, data: responseData };
            } else {
                // Return failure with error description
                return { success: false, error: responseData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            // Catch any errors and return the failure status
            console.error("Error in Re_Interviewfn:", error);
            return { success: false, error: 'Failed to schedule re-interview' };
        }
    },


    // Update employee bank account details
    updateAccountDetail: async (data) => {
        try {
            const response = await employeesApi.updateAccountDetail(data)
            const responseData = response.data;
            console.log('Update Account Detail Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to update account details:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error updating account details:', error)
            return null
        }
    },

    updateSalary: async (data) => {
        try {
            const response = await employeesApi.updateSalary(data)
            const responseData = response.data;
            console.log('Update Salary Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to update salary:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error updating salary:', error)
            return null
        }
    },

    // Get employee profile v2 with all details
    getEmployeeProfileV2: async (userId) => {
        try {
            const response = await employeesApi.getEmployeeProfileV2(userId)
            const responseData = response.data;
            console.log('Get Employee Profile V2 Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to get employee profile v2:', responseData.ERROR_DESCRIPTION)
                return null
            }
        } catch (error) {
            console.error('Error getting employee profile v2:', error)
            return null
        }
    },

    // Add license type
    addLicenseType: async (data) => {
        try {
            const response = await employeesApi.addLicenseType(data)
            const responseData = response.data;
            console.log('Add License Type Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to add license type:', responseData.ERROR_DESCRIPTION)
                return responseData
            }
        } catch (error) {
            console.error('Error adding license type:', error)
            return { STATUS: "ERROR", ERROR_DESCRIPTION: error.message }
        }
    },

    // Get license types
    getLicenseTypes: async () => {
        try {
            const response = await employeesApi.getLicenseTypes()
            const responseData = response.data;
            console.log('Get License Types Response:', responseData)
            if (responseData.STATUS === "SUCCESSFUL") {
                return responseData
            } else {
                console.error('Failed to get license types:', responseData.ERROR_DESCRIPTION)
                return responseData
            }
        } catch (error) {
            console.error('Error getting license types:', error)
            return { STATUS: "ERROR", ERROR_DESCRIPTION: error.message }
        }
    },

    // Signature functions
    getSignatures: async () => {
        set({ isLoadingSignatures: true })
        try {
            const response = await employeesApi.getSignatures()
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                set({ signatures: data.DB_DATA, isLoadingSignatures: false })
                return { success: true, data: data.DB_DATA }
            } else {
                set({ isLoadingSignatures: false })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to fetch signatures' }
            }
        } catch (error) {
            set({ isLoadingSignatures: false })
            return { success: false, error: error.message || 'Failed to fetch signatures' }
        }
    },

    addSignature: async (signatureData) => {
        try {
            const response = await employeesApi.addSignature(signatureData)
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // Add new signature to existing list instead of full refresh
                const currentSignatures = get().signatures || []
                set({ signatures: [...currentSignatures, data.BB_DATA] })
                return { success: true, data: data.BB_DATA }
            } else {
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to add signature' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to add signature' }
        }
    },

    deleteSignature: async (signatureId) => {
        try {
            const response = await employeesApi.deleteSignature(signatureId)
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESFUL") {
                // Remove signature from existing list instead of full refresh
                const currentSignatures = get().signatures || []
                const updatedSignatures = currentSignatures.filter(sig => sig.id !== signatureId)
                set({ signatures: updatedSignatures })
                return { success: true, message: data.Message }
            } else {
                return { success: false, error: data.Message || 'Failed to delete signature' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to delete signature' }
        }
    },

    // Logo functions
    getOrgLogo: async () => {
        set({ isLoadingLogo: true })
        try {
            const response = await employeesApi.getOrgLogo()
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                set({ orgLogo: data.BB_DATA, isLoadingLogo: false })
                return { success: true, data: data.BB_DATA }
            } else {
                set({ isLoadingLogo: false })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to fetch logo' }
            }
        } catch (error) {
            set({ isLoadingLogo: false })
            return { success: false, error: error.message || 'Failed to fetch logo' }
        }
    },

    updateOrgLogo: async (file) => {
        set({ isLoadingLogo: true })
        try {
            // Step 1: Upload file to elephant server to get URL
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const uploadResponse = await employeesApi.uploadFileToElephant(uploadFormData);
            const uploadData = uploadResponse.data;

            if (uploadResponse.status === 200 && uploadData.STATUS === "SUCCESSFUL" && uploadData.FILE_URL) {
                // Step 2: Update logo with the generated URL
                const logoData = {
                    logo: uploadData.FILE_URL
                };

                const updateResponse = await employeesApi.updateOrgLogo(logoData);
                const updateData = updateResponse.data;

                if (updateResponse.status === 200 && updateData.STATUS === "SUCCESSFUL") {
                    // Refresh logo after updating
                    get().getOrgLogo()
                    set({ isLoadingLogo: false })
                    return { success: true, data: updateData }
                } else {
                    set({ isLoadingLogo: false })
                    return { success: false, error: updateData.ERROR_DESCRIPTION || 'Failed to update logo' }
                }
            } else {
                set({ isLoadingLogo: false })
                return { success: false, error: uploadData.ERROR_DESCRIPTION || 'Failed to upload file' }
            }
        } catch (error) {
            set({ isLoadingLogo: false })
            return { success: false, error: error.message || 'Failed to update logo' }
        }
    },

    // Logout function
    logout: async () => {
        try {
            const response = await employeesApi.logout()
            const data = response.data

            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // Clear localStorage
                localStorage.clear()

                // Clear sessionStorage if used
                sessionStorage.clear()

                return { success: true, data: data.DB_DATA }
            } else {
                return { success: false, error: data.ERROR_DESCRIPTION || 'Logout failed' }
            }
        } catch (error) {
            // Even if API fails, clear local storage for security
            localStorage.clear()
            sessionStorage.clear()

            return { success: false, error: error.message || 'Logout failed' }
        }
    },

    // Digital Signature state and functions
    digitalSignature: null,
    isLoadingDigitalSignature: false,

    getDigitalSignature: async () => {
        set({ isLoadingDigitalSignature: true })
        try {
            const response = await employeesApi.getDigitalSignature()
            const data = response.data
            
            // Debug logging
            console.log('Digital Signature API Response:', { status: response.status, data });
            
            // Handle both 200 (OK) and 304 (Not Modified) status codes
            if (response.status === 200 && data && data.STATUS === "SUCCESSFUL") {
                // DB_DATA is a single object (not array) since organization has only ONE digital signature
                const signature = data.DB_DATA || null
                console.log('Setting digital signature from 200 response:', signature);
                set({ digitalSignature: signature, isLoadingDigitalSignature: false })
                return { success: true, data: signature }
            } else if (response.status === 304) {
                // For 304, check if we have data in response
                if (data && data.STATUS === "SUCCESSFUL" && data.DB_DATA) {
                    const signature = data.DB_DATA || null
                    console.log('Setting digital signature from 304 response with data:', signature);
                    set({ digitalSignature: signature, isLoadingDigitalSignature: false })
                    return { success: true, data: signature }
                } else {
                    // 304 with no data - keep existing state if available
                    const existingSignature = get().digitalSignature
                    console.log('304 response with no data, using existing signature:', existingSignature);
                    set({ isLoadingDigitalSignature: false })
                    if (existingSignature && (existingSignature.field_value || existingSignature.signature_text)) {
                        return { success: true, data: existingSignature }
                    } else {
                        // No existing data - return null
                        return { success: true, data: null }
                    }
                }
            } else {
                console.log('Unexpected response status or data:', { status: response.status, data });
                set({ isLoadingDigitalSignature: false })
                return { success: false, error: data?.ERROR_DESCRIPTION || 'Failed to fetch digital signature' }
            }
        } catch (error) {
            console.error('Error fetching digital signature:', error);
            set({ isLoadingDigitalSignature: false })
            return { success: false, error: error.message || 'Failed to fetch digital signature' }
        }
    },

    addDigitalSignature: async (signatureData) => {
        try {
            // If digital signature already exists, include the id for update
            const currentSignature = get().digitalSignature
            const dataToSend = currentSignature
                ? { ...signatureData, id: currentSignature.id }
                : signatureData

            const response = await employeesApi.addDigitalSignature(dataToSend)
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // Update state with the new/updated signature
                set({ digitalSignature: data.BB_DATA })
                return { success: true, data: data.BB_DATA }
            } else {
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to add/update digital signature' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to add/update digital signature' }
        }
    },

    // Birthday Template state and functions
    birthdayTemplate: null,
    isLoadingBirthdayTemplate: false,
    isSavingBirthdayTemplate: false,

    getBirthdayTemplate: async () => {
        set({ isLoadingBirthdayTemplate: true })
        try {
            const response = await employeesApi.getBirthdayTemplate()
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // BB_DATA contains birthday_template field
                const template = data.BB_DATA ? data.BB_DATA.birthday_template : null
                set({ birthdayTemplate: template, isLoadingBirthdayTemplate: false })
                return { success: true, data: template }
            } else {
                set({ isLoadingBirthdayTemplate: false })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to fetch birthday template' }
            }
        } catch (error) {
            set({ isLoadingBirthdayTemplate: false })
            return { success: false, error: error.message || 'Failed to fetch birthday template' }
        }
    },

    updateBirthdayTemplate: async (templateData) => {
        set({ isSavingBirthdayTemplate: true })
        try {
            const response = await employeesApi.updateBirthdayTemplate({ templete_data: templateData })
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // Update state with the new template from BB_DATA.birthday_template
                const updatedTemplate = data.BB_DATA ? data.BB_DATA.birthday_template : templateData
                set({ birthdayTemplate: updatedTemplate, isSavingBirthdayTemplate: false })
                return { success: true, data: updatedTemplate }
            } else {
                set({ isSavingBirthdayTemplate: false })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to update birthday template' }
            }
        } catch (error) {
            set({ isSavingBirthdayTemplate: false })
            return { success: false, error: error.message || 'Failed to update birthday template' }
        }
    },

    // Mobile Attendance state and functions
    mobileAttendanceConfig: null,
    isLoadingMobileAttendance: false,
    isTogglingMobileAttendance: false,
    isTogglingLocationLog: false,

    getMobileAttendanceConfig: async (showLoading = true) => {
        if (showLoading) {
            set({ isLoadingMobileAttendance: true })
        }
        try {
            const response = await employeesApi.getMobileAttendanceConfig()
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // DB_DATA contains mobile_attendance and att_premises
                const config = data.DB_DATA || null
                set({ mobileAttendanceConfig: config, isLoadingMobileAttendance: false })
                return { success: true, data: config }
            } else {
                if (showLoading) {
                    set({ isLoadingMobileAttendance: false })
                }
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to fetch mobile attendance config' }
            }
        } catch (error) {
            if (showLoading) {
                set({ isLoadingMobileAttendance: false })
            }
            return { success: false, error: error.message || 'Failed to fetch mobile attendance config' }
        }
    },

    toggleMobileAttendance: async () => {
        set({ isTogglingMobileAttendance: true })

        // Optimistically update the UI immediately
        const currentConfig = get().mobileAttendanceConfig
        const newConfigValue = currentConfig?.mobile_attendance === 1 ? 0 : 1
        set({
            mobileAttendanceConfig: {
                ...currentConfig,
                mobile_attendance: newConfigValue
            }
        })

        try {
            const response = await employeesApi.toggleMobileAttendance()
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // Refresh the config in background without showing loading
                get().getMobileAttendanceConfig(false)
                set({ isTogglingMobileAttendance: false })
                return { success: true }
            } else {
                // Revert the optimistic update on failure
                set({
                    mobileAttendanceConfig: currentConfig,
                    isTogglingMobileAttendance: false
                })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to toggle mobile attendance' }
            }
        } catch (error) {
            // Revert the optimistic update on error
            set({
                mobileAttendanceConfig: currentConfig,
                isTogglingMobileAttendance: false
            })
            return { success: false, error: error.message || 'Failed to toggle mobile attendance' }
        }
    },

    toggleMobileAttendanceLocationLog: async () => {
        set({ isTogglingLocationLog: true })

        // Optimistically update the UI immediately
        const currentConfig = get().mobileAttendanceConfig
        const currentValue = currentConfig?.att_premises
        const newValue = (currentValue === "1" || currentValue === 1) ? "0" : "1"
        set({
            mobileAttendanceConfig: {
                ...currentConfig,
                att_premises: newValue
            }
        })

        try {
            const response = await employeesApi.toggleMobileAttendanceLocationLog()
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // Refresh the config in background without showing loading
                get().getMobileAttendanceConfig(false)
                set({ isTogglingLocationLog: false })
                return { success: true }
            } else {
                // Revert the optimistic update on failure
                set({
                    mobileAttendanceConfig: currentConfig,
                    isTogglingLocationLog: false
                })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to toggle location log' }
            }
        } catch (error) {
            // Revert the optimistic update on error
            set({
                mobileAttendanceConfig: currentConfig,
                isTogglingLocationLog: false
            })
            return { success: false, error: error.message || 'Failed to toggle location log' }
        }
    },

    // Retirement and Probation state and functions
    retirementData: null,
    isLoadingRetirementData: false,
    isSavingRetirementData: false,

    getRetirementData: async () => {
        set({ isLoadingRetirementData: true })
        try {
            const response = await employeesApi.getRetirementData()
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const retirementData = data.DB_DATA || null
                set({ retirementData: retirementData, isLoadingRetirementData: false })
                return { success: true, data: retirementData }
            } else {
                set({ isLoadingRetirementData: false })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to fetch retirement data' }
            }
        } catch (error) {
            set({ isLoadingRetirementData: false })
            return { success: false, error: error.message || 'Failed to fetch retirement data' }
        }
    },

    setRetirementData: async (retirementData) => {
        set({ isSavingRetirementData: true })
        try {
            const response = await employeesApi.setRetirementData(retirementData)
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const updatedData = data.DB_DATA ? {
                    retirement_age: data.DB_DATA.retirement_age,
                    probation_period: data.DB_DATA.probation_period
                } : retirementData
                set({ retirementData: updatedData, isSavingRetirementData: false })
                return { success: true, data: updatedData }
            } else {
                set({ isSavingRetirementData: false })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to save retirement data' }
            }
        } catch (error) {
            set({ isSavingRetirementData: false })
            return { success: false, error: error.message || 'Failed to save retirement data' }
        }
    },

    // Degrees state and functions
    degrees: [],
    isLoadingDegrees: false,

    getDegrees: async (userId) => {
        set({ isLoadingDegrees: true })
        try {
            const response = await employeesApi.getDegrees(userId)
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const degreesList = data.DB_DATA?.degrees || []
                set({ degrees: degreesList, isLoadingDegrees: false })
                return { success: true, data: degreesList }
            } else {
                set({ isLoadingDegrees: false })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to fetch degrees' }
            }
        } catch (error) {
            set({ isLoadingDegrees: false })
            console.error('Error fetching degrees:', error)
            return { success: false, error: error.message || 'Failed to fetch degrees' }
        }
    },

    getReportingEmails: async () => {
        set({ isLoadingReportingEmails: true })
        try {
            const response = await employeesApi.getReportingEmails()
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const emails = data.DB_DATA || []
                set({ reportingEmails: emails, isLoadingReportingEmails: false })
                return { success: true, data: emails }
            } else {
                set({ isLoadingReportingEmails: false })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to fetch reporting emails' }
            }
        } catch (error) {
            set({ isLoadingReportingEmails: false })
            return { success: false, error: error.message || 'Failed to fetch reporting emails' }
        }
    },

    sendReportingEmail: async (emailData) => {
        set({ isSavingReportingEmail: true })
        try {
            const response = await employeesApi.sendReportingEmail(emailData)
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // Refresh the list after saving
                await get().getReportingEmails()
                set({ isSavingReportingEmail: false })
                return { success: true, message: data.MESSAGE }
            } else {
                set({ isSavingReportingEmail: false })
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to send reporting email' }
            }
        } catch (error) {
            set({ isSavingReportingEmail: false })
            return { success: false, error: error.message || 'Failed to send reporting email' }
        }
    },
    get_bank_type_fn: async (emailData) => {
        // set({ isSavingReportingEmail: true })
        try {
            const response = await employeesApi.getBankAccountTypes(emailData)
            const data = response.data;
            console.log('datadata', data?.DB_DATA?.bank_account_types)
            if (data.STATUS === "SUCCESSFUL") {
                set({ get_bank_type: data?.DB_DATA?.bank_account_types })
                // Refresh the list after saving
                // await get().getReportingEmails()
                // set({ isSavingReportingEmail: false })
                // return { success: true, message: data.MESSAGE }
            } else {
                set({ get_bank_type: [] })
                ///set({ isSavingReportingEmail: false })
                ///return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to send reporting email' }
            }
        } catch (error) {
            console.log(error)
            ///set({ isSavingReportingEmail: false })
            // return { success: false, error: error.message || 'Failed to send reporting email' }
        }
    },

    // Send profile update invitation email
    sendProfileUpdateInvite: async (employeeId) => {
        try {
            const response = await employeesApi.sendProfileUpdateInvite(employeeId)
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const message = data.DB_DATA?.message?.MESSAGE || 'Invitation to update the profile has been sent successfully!'
                return { success: true, message: message }
            } else {
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to send profile update invitation' }
            }
        } catch (error) {
            console.error('Error sending profile update invite:', error)
            return { success: false, error: error.message || 'Failed to send profile update invitation' }
        }
    },

    // Update employee profile image
    updateEmployeeProfileImage: async (formData) => {
        try {
            const response = await employeesApi.updateEmployeeProfileImage(formData)
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                return { success: true, message: data.MESSAGE || 'Profile image updated successfully!' }
            } else {
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to update profile image' }
            }
        } catch (error) {
            console.error('Error updating profile image:', error)
            return { success: false, error: error.response?.data?.ERROR_DESCRIPTION || error.message || 'Failed to update profile image' }
        }
    }

})

export default employeeViewModel
