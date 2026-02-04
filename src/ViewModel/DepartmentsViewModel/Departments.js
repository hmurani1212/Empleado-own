import React from "react"
import departmentsApi from "../../Model/Data/Departments/Departments"
import employeesApi from "../../Model/Data/Employees/Employees";
import { showToast } from "../../Components/Toaster/Toaster";


const departmentsViewModel = (set, get) => ({
    allDeptDetails: [],
    copyAllDeptDetails: [],
    deptPagination: {
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        per_page: 10
    },
    departments_b: [],
    filterDepartments: [],
    allBranches: [],
    subDept: [],
    deptFound: true,
    parentID: '',
    empDetailDept: [],
    empDetailDeptLoading: false,
    allSuggestionsEmp: [],
    empIdHod: {
        emp_Id: null,
        loading: false
    },
    designations: [],
    designationPagination: {
        currentPage: 1,
        totalPages: 1,
        hasMore: false
    },
    deptIdset: '',
    branchIdset: '',
    mountBranch: false,
    mainParentID: '',
    branchId: '',
    dep_data: [],
    get_all_department: [],
    settingMainParent: (id) => {
        set({ mainParentID: id })
    },
    settingParentId: (id) => {
        set({ parentID: id })
    },
    handleMountDept: () => {
        set({ mount: true })
    },


    settingDesignations: (data) => {
        // console.log('data', data)
        set({ designations: data })
    },

    settingDesignationPagination: (data) => {
        set({
            designationPagination: {
                currentPage: data?.page || 1,
                totalPages: data?.pages || 1,
                hasMore: data?.page < data?.pages
            }
        })
    },

    getAllDepartments: async () => {
        try {
            const response = await departmentsApi.gettingAllDepartments();
            const data = response.data
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const departments = data.DB_DATA
                const branches = data.DB_DATA.branches
                // const ownObjectBranches = {id: '1', branch_name: 'All Branches'}
                // const ownObjectDepartments = {id: '1', name: 'All Departments'}
                // const  updatedBranches= [ownObjectBranches, ...branches];
                // const updatedDepartments = [ownObjectDepartments, ...departments];

                // console.log('updatedDepartments', updatedDepartments)
                set({ departments_b: departments })
                set({ allBranches: branches })
            }
            console.log(response);
        } catch (err) {
            console.log(err);
        }

    },



    deptFilterBranches: (id) => {
        const data = get().departments_b.filter(data => data.branch_id === id)
        // console.log('fBranches', data)
        set({ filterDepartments: data })
    },

    setNewDepartment: async () => {
        try {
            const response = await departmentsApi.setAddNewDepartment()
            const data = response.data
            console.log('departmentdata', data)

        } catch (err) {
            console.log(err)
        }
    },

    getManageDept: async (bid, page = 1, limit = 10) => {
        try {
            const response = await departmentsApi.manageDepartments(bid, page, limit);
            const data = response.data;

            if (data.STATUS === 'SUCCESSFUL') {
                const departments = data?.DB_DATA?.departments;
                const pagination = data?.DB_DATA?.pagination || data?.pagination || {};
                const currentPage = pagination.current_page ?? pagination.page ?? page;
                const perPage = pagination.per_page ?? pagination.limit ?? limit;
                const totalRecords = pagination.total_records ?? pagination.total ?? 0;
                const totalPages = pagination.total_pages ?? pagination.pages ?? Math.max(1, Math.ceil(totalRecords / perPage));

                if (Array.isArray(departments)) {
                    const transformedData = departments.map(dept => ({
                        ...dept,
                        designation: dept.designation || []
                    }));
                    const finalTotalRecords = totalRecords > 0 ? totalRecords : transformedData.length;
                    const finalTotalPages = totalPages >= 1 ? totalPages : Math.max(1, Math.ceil(finalTotalRecords / perPage));
                    set({
                        allDeptDetails: transformedData,
                        copyAllDeptDetails: transformedData,
                        deptPagination: {
                            current_page: currentPage,
                            total_pages: finalTotalPages,
                            total_records: finalTotalRecords,
                            per_page: perPage
                        }
                    });
                } else {
                    set({
                        allDeptDetails: [],
                        copyAllDeptDetails: [],
                        deptPagination: {
                            current_page: 1,
                            total_pages: 1,
                            total_records: 0,
                            per_page: limit
                        }
                    });
                }
            } else if (data.STATUS === 'ERROR') {
                set({
                    allDeptDetails: [],
                    copyAllDeptDetails: [],
                    deptPagination: { current_page: 1, total_pages: 1, total_records: 0, per_page: limit }
                });
            } else {
                set({
                    allDeptDetails: [],
                    copyAllDeptDetails: [],
                    deptPagination: { current_page: 1, total_pages: 1, total_records: 0, per_page: limit }
                });
            }
        } catch (err) {
            set({
                allDeptDetails: [],
                copyAllDeptDetails: [],
                deptPagination: { current_page: 1, total_pages: 1, total_records: 0, per_page: limit }
            });
        }
    },

    getEmployeeDetails: async (id) => {
        try {
            // Set loading state and clear previous data
            set((state) => ({
                ...state,
                empDetailDeptLoading: true,
                empDetailDept: []
            }))

            const response = await departmentsApi.getDeptEmployees(id)
            const data = response.data
            // console.log('emp data11111111', data)

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set((state) => ({
                    ...state,
                    empDetailDept: data?.DB_DATA?.employees || [],
                    empDetailDeptLoading: false
                }))
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set((state) => ({
                    ...state,
                    empDetailDept: [],
                    empDetailDeptLoading: false
                }))
            }
        } catch (error) {
            console.log(error)
            // Set empty array on error to clear any stale data
            set((state) => ({
                ...state,
                empDetailDept: [],
                empDetailDeptLoading: false
            }))
        }

    },

    getEmployeeSuggDept: async () => {
        try {
            const response = await departmentsApi.empSuggestionsDept()
            const data = response.data
            console.log('emp data', data)

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allSuggestionsEmp: data.DB_DATA })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ allSuggestionsEmp: [] })
            }
        } catch (error) {
            console.log(error)
        }

    },

    // New function to get employees by department ID
    getEmployeesByDeptId: async (dept_id) => {
        try {
            const response = await departmentsApi.getEmployeesByDeptId(dept_id)
            const data = response.data
            // console.log('employees by dept data', data)

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                // Transform the data to match the expected format
                const employees = data.DB_DATA.employees.map(emp => ({
                    id: emp.id,
                    name: emp.name,
                    emp_id: emp.emp_id,
                    work_email: emp.work_email
                }))
                set({ allSuggestionsEmp: employees })
                return employees
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({ allSuggestionsEmp: [] })
                return []
            }
        } catch (error) {
            console.log(error)
            set({ allSuggestionsEmp: [] })
            return []
        }
    },

    // Function to get all employees (for All Department case)
    getAllEmployees: async (page = 1, limit = 10) => {
        try {
            const response = await departmentsApi.getAllEmployees(page, limit)
            const data = response.data
            // console.log('all employees data', data)

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                // Transform the data to match the expected format
                const employees = data.DB_DATA.employees.map(emp => ({
                    id: emp.id,
                    name: emp.name,
                    emp_id: emp.emp_id,
                    work_email: emp.work_email
                }))

                return {
                    employees: employees,
                    pagination: data.pagination
                }
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                return {
                    employees: [],
                    pagination: { total: 0, page: 1, limit: 10, pages: 0 }
                }
            }
        } catch (error) {
            console.log(error)
            return {
                employees: [],
                pagination: { total: 0, page: 1, limit: 10, pages: 0 }
            }
        }
    },

    // Function to get employees using new optimized endpoint
    getEmployeesOptimized: async (dept_id = null) => {
        try {
            const response = await employeesApi.get_all_employeee(dept_id)
            const data = response.data

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                // Transform the data to match the expected format
                const employees = data.DB_DATA.map(emp => ({
                    id: emp.id,
                    name: emp.name,
                    org_id: emp.org_id
                }))

                return {
                    employees: employees,
                    pagination: { total: employees.length, page: 1, limit: employees.length, pages: 1 }
                }
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                return {
                    employees: [],
                    pagination: { total: 0, page: 1, limit: 10, pages: 0 }
                }
            }
        } catch (error) {
            console.log(error)
            return {
                employees: [],
                pagination: { total: 0, page: 1, limit: 10, pages: 0 }
            }
        }
    },

    // Function to set employees in store
    setEmployeesByDeptId: (employees) => {
        set({ allSuggestionsEmp: employees })
    },

    handleDeletionDept: async (id) => {
        // console.log(id)
        set({
            allDeptDetails: get().allDeptDetails.filter(deptDel => deptDel.id !== id),
        })
        if (get().subDept.length < 2) {
            const data = get().subDept.find((dept) => dept.id == id)
            // console.log('data', data)
            // set({parentID:data.parent_id})
            set({
                subDept: get().subDept?.filter(deptDel => deptDel.id !== id),
            })
            // set({deptFound: false})
        } else {
            set({
                subDept: get().subDept?.filter(deptDel => deptDel.id !== id),
            })

        }
    },

    deletionDesignation: async (id, departmentId) => {
        const updatedDepartments = get().allDeptDetails.map(department => {
            if (department.id === departmentId) {
                return {
                    ...department,
                    designation: (department.designation || []).filter(designation => designation.id !== id)
                };
            }
            return department;
        });
        console.log('updatedDepartments', updatedDepartments)

        // Updating the state with the new departments array
        set({
            designations: get().designations.filter(designation => designation.id !== id),
        })
        set({ allDeptDetails: updatedDepartments });

    },

    settingBranchId: (id) => {
        // console.log('id', id)
        set({ branchIdset: id })
    },


    handleDesignationEdit: async (updatedDept) => {
        // console.log('updatedDept', updatedDept);
        set({
            designations: get().designations?.map((designation) => designation.id === updatedDept.id ? updatedDept : designation)
        })

    },

    handleDesginationAddition: (data) => {
        console.log("datadata", data)
        // Extract titles and create the designation objects
        const updatedTitles = data?.designation?.map((ele) => ({ id: ele.id, title: ele.title, dept_id: ele.dept_id }));

        // Update the designations state
        set((state) => ({
            designations: [...new Set([...state.designations, ...updatedTitles])],
        }));

        // Update the allDeptDetails state
        set((state) => ({
            allDeptDetails: state.allDeptDetails?.map((dept) =>
                dept.id === data[0].dept_id
                    ? { ...dept, designation: [...(dept.designation || []), ...updatedTitles] }
                    : dept
            ),
        }));

        console.log('designations', get().allDeptDetails)
    },

    handleNewDept: (data, dataNew) => {

        const newData = {
            ...data,
            ...dataNew
        }

        console.log('...get().allDeptDetails', get().copyAllDeptDetails)

        set({
            allDeptDetails: [...new Set([newData, ...get().copyAllDeptDetails])]
        })

    },


    handleHodEdit: async (updatedHod) => {
        // console.log('updatedDept', updatedHod);
        set({
            allDeptDetails: get().allDeptDetails?.map((dept) => dept.id === updatedHod.id ? { ...dept, hod_name: updatedHod.hod_name } : dept)
        });
        set({
            subDept: get().subDept?.map((dept) => dept.id === updatedHod.id ? { ...dept, hod_name: updatedHod.hod_name } : dept)

        })
    },

    handleDeptUpdate: (updated, isGlobal) => {
        // console.log('updatedDept', updated, isGlobal);

        // Function to update department details
        const updateDepartment = (allDeptDetails, updated) => {
            return allDeptDetails?.map((dept) =>
                dept.id === updated.id
                    ? {
                        ...dept,
                        name: updated.name,
                        description: updated.description,
                        parent_id: updated.parent_id || dept.parent_id,
                        is_global: updated.is_global || dept.is_global
                    }
                    : dept
            );
        };

        set((state) => {
            let allDeptDetails = state.allDeptDetails || [];

            // Always update the department details, don't remove it
            allDeptDetails = updateDepartment(allDeptDetails, updated);

            return { allDeptDetails };
        });
    },



    settingDeptId: (id) => {
        set({ deptIdset: id })
    },

    filterDeptSuggestion: (name) => {
        // console.log('name', name)
        const copyAllDeptDetails = get().copyAllDeptDetails || [];

        if (name.trim() === '') {
            set({ allDeptDetails: copyAllDeptDetails });
        } else {
            const lowercaseName = name.toLowerCase();
            const matchedDepts = copyAllDeptDetails.filter((dept) =>
                dept && dept.name && dept.name.toLowerCase().includes(lowercaseName)
            );
            set({ allDeptDetails: matchedDepts });
        }
    },


    get_all_department_fn: async (data) => {
        console.log('33333333333', data)
        try {
            const department_response = await departmentsApi.get_all_Department(data);
            const resposne_data = department_response.data;
            console.log('resposne_data', resposne_data)
            if (resposne_data.STATUS == 'SUCCESSFUL') {
                set({ get_all_department: resposne_data?.DB_DATA })
            } else {
                set({ get_all_department: [] })
            }

        } catch (error) {
            console.log(error)
        }
        // console.log('name', name)
    },


    gettingSubDept: async (data) => {
        try {
            set({ deptFound: true })
            const response = await departmentsApi.getSubDept(data)
            // console.log('response', response)
            const responseData = await response.data;
            // console.log("responseData11111111", responseData)
            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                set({ subDept: responseData.DB_DATA })
                set({ deptFound: true })

            } else {
                set({ subDept: [] })
                set({ deptFound: false })
                set({ parentID: responseData.PARENT_ID })
            }
        } catch (err) {

        }
    },

    //   select_ap:async(data)=>{
    //     try{
    //         set({deptFound: true})
    //         const response = await departmentsApi.slect_dp(data)
    //         // console.log('response', response)
    //         const responseData = await response.data;
    //        // console.log("responseData11111111", responseData)
    //         if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
    //             set({dep_data: responseData.DB_DATA})
    //             set({deptFound:true})

    //         }
    //         // else{
    //         //     set({subDept: []})
    //         //     set({deptFound: false})
    //         //     set({parentID: responseData.PARENT_ID})
    //         // }
    //     }catch(err){

    //     }
    // },
    handleSubDesginationAddition: (data) => {

        set({
            subDept: [...new Set([data, ...get().subDept])]
        })
    },

    // Employee details function
    handleEmpDetails: async (deptId) => {
        const { getEmployeeDetails, openDrawer, settingDrawerTitle, settingDrawerSize, settingComponent } = get()

        // Open drawer for employee details
        openDrawer()
        settingDrawerTitle('Employee Details')
        settingDrawerSize(800)

        // Set loading state
        set((state) => ({
            empDetailDeptLoading: true,
            empDetailDept: []
        }))

        // Fetch employee details
        await getEmployeeDetails(deptId)

        // Set the component to show employee details
        const EmployeeDetails = require('../../View/Departments/EmployeeDetails').default
        settingComponent(React.createElement(EmployeeDetails))
    },

    // HOD-related functions
    onChangeEmpHod: (selectedOption, field, e) => {
        set((state) => ({
            empIdHod: {
                ...state.empIdHod,
                [field]: selectedOption
            }
        }))
    },

    handleUpdatingHod: async () => {
        const { empIdHod, deptIdset } = get()

        if (!empIdHod.emp_Id) {
            showToast('Please select an employee', 'error')
            return
        }

        set((state) => ({
            empIdHod: {
                ...state.empIdHod,
                loading: true
            }
        }))

        try {
            const response = await departmentsApi.updateHod({
                dept_id: deptIdset,
                hod_id: empIdHod.emp_Id.value
            })

            const data = response.data

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                showToast('HOD updated successfully', 'success')

                // Update the department in the store
                const hodName = empIdHod.emp_Id.label
                set((state) => ({
                    allDeptDetails: state.allDeptDetails.map(dept =>
                        dept.id === deptIdset
                            ? { ...dept, hod: empIdHod.emp_Id.value, hod_name: hodName }
                            : dept
                    ),
                    empIdHod: {
                        emp_Id: null,
                        loading: false
                    }
                }))
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to update HOD', 'error')
            }
        } catch (error) {
            console.error('HOD update error:', error)
            showToast('Failed to update HOD', 'error')
        } finally {
            set((state) => ({
                empIdHod: {
                    ...state.empIdHod,
                    loading: false
                }
            }))
        }
    }

})



export default departmentsViewModel