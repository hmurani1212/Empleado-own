import dashboardApi from '../../Model/Data/Dashboard/Dashboard'
import employeesApi from '../../Model/Data/Employees/Employees'
import { toUnixTimeStamp } from '../../services/__dateTimeServices'

const dashboardViewModel = (set, get)=>({
    sideMenuToggleState: false,
    mobilevViewFalse: false, 


    dashboardData : [],
    dashboardCountData : [],
    dashboardCopyCountData : [],
    empData:{},


    settingEmpData:(data)=>{
        set({empData:data})
        // console.log('dashboardData', get().dashboardData)
    },

    addNewEmpContact:(data)=>{
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                        emp_contact: [...state.empData.data.DB_DATA.emp_contact, data]
                    }
                },
                
            }
        }))
    },
    getGreetingMessage: (data) => {
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                        meet_and_greet: [...state.empData.data.DB_DATA.meet_and_greet, data]
                    }
                },
            }
        }))
    },
    updateEmpContact:(data)=>{
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                            emp_contact: state.empData.data.DB_DATA.emp_contact.map(contact => 
                                contact.id === data.id ? data : contact
                            )
                    }
                },
                
            }
        }))
    },

    updateEmpPersonalInfo:(data)=>{

        const updateEmployees = get().empData.employees.DB_DATA.DATA.map((item, index) => 
                                index === 0 ? { ...item, data: { ...item.data, name: data.name } } : item)
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                        emp_data: {
                            ...state.empData.data.DB_DATA.emp_data,
                            f_name: data.fname,
                            dob: data.dob,
                            gender: data.gender,
                            country: data.nationality,
                            city: data.city,
                            domicile: data.domicile,
                            religion: data.religion,
                            martial_status: data.martial_status,
                            blood_group: data.blood_group,
                            disability: data.disability,
                            passport_no: data.nic,
                            ntn_no: data.ntn,


                        }
                    }
                },
                employees: {
                    ...state.empData.employees,
                    DB_DATA: {
                        ...state.empData.employees.DB_DATA,
                        DATA: updateEmployees
                    }
                }
            },
        }))
    },


    updateEmpCheckList:(data)=>{
        // console.log('data',data)
        const updatedDashboardData = get().dashboardData?.EMPLOYEES_CHECKLIST?.DB_DATA?.map((item) => 
        item.emp_id === data.emp_id
            ? { ...item, emp_name: data.name } // Update emp_name if emp_id matches
            : item // Otherwise, keep the item unchanged
        );

        // Update the state with the new dashboard data
        set((state) => ({
            ...state,
            dashboardData: {
                ...state.dashboardData,
                EMPLOYEES_CHECKLIST: {
                    ...state.dashboardData?.EMPLOYEES_CHECKLIST,
                    DB_DATA: updatedDashboardData // Update the state with the new array
                }
            }
        }));
    },

    deletingReportingManager:(id)=>{
        set((state) => {
            const updatedReportingTo = state.empData.data.DB_DATA.reporting_to.filter(
                manager => manager.id !== id
            );

            return {
                empData: {
                    ...state.empData,
                    data: {
                        ...state.empData.data,
                        DB_DATA: {
                            ...state.empData.data.DB_DATA,
                            reporting_to: updatedReportingTo.length > 0 ? updatedReportingTo : null
                        }
                    }
                }
            };
        });
    },
    addingReportingManager:(data)=>{
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                        reporting_to:   state.empData.data.DB_DATA.reporting_to
                        ? [...state.empData.data.DB_DATA.reporting_to, data] // Add data if reporting_to is not null
                        : [data] 
                    }
                },
                
            }
        }))
    },

    updateEmpProfileAttendanceSetting:(data)=>{
        // console.log('data', data)
        // console.log('empData', get().empData)
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                        bio_data: {
                            ...state.empData.data.DB_DATA.bio_data,
                            hr_policy: data.label,
                            policy_id: data.value,
                        }
                    }
                },
            },
        }))
    },
    updateEmpProfileJobDescription:(data)=>{
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                        emp_data: {
                            ...state.empData.data.DB_DATA.emp_data,
                            job_description:data.description                           
                        }
                    }
                }
            }
        }))
    },

    updateEmpOfficialInfo:(data)=>{
        // console.log('data', data)
        // console.log('get().empData', get().empData)
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                        prident_fund_amount:data.provident_fund,
                        emp_data: {
                            ...state.empData.data.DB_DATA.emp_data,
                            deptt_id: data.emp_deptt,
                            employment_status: data.employment_status,
                            tag_id: data.emp_tag,
                            tag_name: data.new_emp_tag,
                            eobi: data.eobi,
                            eobi_number: data.eobi_number,
                            social_security: data.social_security,
                            social_sec_number: data.social_security,
                            blood_group: data.blood_group,
                            insurance: data.insurance,
                            health_benefits: data.health_benefits,
                            designation: data.designation,
                            branch_id: data.emp_branch,
                            join_date: toUnixTimeStamp(data.join_date),
                            job_description: data.job_description,


                        }
                    }
                }
            }
        }))


    },

    updatingEmployeementStatus:(data)=>{
        // const newStatus = data.value.toLowerCase()

        // set((state) => ({
        //     empData: {
        //         ...state.empData,
        //         data: {
        //             ...state.empData.data,
        //             DB_DATA: {
        //                 ...state.empData.data.DB_DATA,
        //                 prident_fund_amount:data.provident_fund,
        //                 emp_data: {
        //                     ...state.empData.data.DB_DATA.emp_data,
        //                     employment_status: newStatus,


        //                 }
        //             }
        //         }
        //     }
        // }))

    },
    updateEmpSalarySetting:(data)=>{
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                        salaryData: {
                            ...state.empData.data.DB_DATA.salaryData,
                            name: data.name,
                            id: data.id,
                            salary_amount: data.salary_amount,
                            payment_mode: data.payment_mode,
                            ex_gratia: data.ex_gratia,
                            gratuity: data.gratuity,
                            ex_gratia_amount:data.ex_gratia_amount
                        }
                    }
                },
            },
        }))
    },
    updateEmpBankAccountInfo:(data)=>{
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                        salaryData: {
                            ...state.empData.data.DB_DATA.salaryData,
                            bank_account_info:{
                                ...state.empData.data.DB_DATA.salaryData.bank_account_info,
                                bank_account_no:data.account_no,
                                bank_account_title:data.account_title,
                                bank_account_type: data.account_type,
                                bank_branch_code:data.branch_code,
                                bank_name:data.bank_name,
                                branch_name:data.branch_name,
                            }
                            
                        }
                    }
                },
            },
        }))
    },



    sideMenuToggleTrue : ()=>{
        set({sideMenuToggleState: true})
    },
    sideMenuToggleFalse : ()=>{
        set({sideMenuToggleState: false})
    },
    mobilevToggleTrue : ()=>{
        set({mobilevViewFalse: true})
    },
    mobilevToggleFalse : ()=>{
        set({mobilevViewFalse: false})
    },


    dashboardDataFunc:async()=>{
        // console.log('hitiing')
        try{
            const response = await dashboardApi.getEmployeeDashboardData()
            const data = response.data
            if(response.status === 200 && data.STATUS === "SUCCESS"){
            
                set({dashboardData: data.DB_DATA})
            }
        }catch(err){
            console.log(err)
        }
    },

    // Admin Dashboard Data
    adminDashboardData: null,
    adminDashboardLoading: false,
    selectedDate: null,

    getAdminDashboardData: async (date = null) => {
        set({adminDashboardLoading: true});
        try {
            // If no date is provided, use today's date (YYYY-MM-DD format) for API call
            // But keep selectedDate as null in store so the input field remains empty
            const dateToUse = date || new Date().toISOString().split('T')[0];
            const requestData = { date: dateToUse };
            const response = await dashboardApi.getAdminDashboardData(requestData);
            const data = response.data;
            if(data.STATUS === "SUCCESS"){
                // Only update selectedDate in store when user explicitly selects a date
                set({adminDashboardData: data.DB_DATA, selectedDate: date || null});
                return data.DB_DATA;
            }
        } catch(err) {
            console.log('Error fetching admin dashboard data:', err);
            return null;
        } finally {
            set({adminDashboardLoading: false});
        }
    },

    // Date filter function
    applyDateFilter: async (date) => {
        return await get().getAdminDashboardData(date);
    },

    // Late Comers Data
    lateComersData: null,
    lateComersLoading: false,

    getLateComersData: async (daysRange = 'today', date = null) => {
        set({lateComersLoading: true});
        try {
            // Calculate Unix timestamps based on the range
            let fromTimestamp, uptoTimestamp;
            
            // If date is provided (YYYY-MM-DD format), use that date
            if (date) {
                const selectedDate = new Date(date + 'T00:00:00');
                
                if (daysRange === 'last7days') {
                    // For weekly late comers with date filter: 7 days ending on selected date
                    const endDate = new Date(selectedDate);
                    endDate.setHours(23, 59, 59, 999);
                    uptoTimestamp = Math.floor(endDate.getTime() / 1000);
                    
                    // 7 days before selected date
                    const startDate = new Date(selectedDate);
                    startDate.setDate(selectedDate.getDate() - 6); // -6 to include selected date (7 days total)
                    startDate.setHours(0, 0, 0, 0);
                    fromTimestamp = Math.floor(startDate.getTime() / 1000);
                } else {
                    // For today late comers with date filter: single selected date
                    // Start of selected date (00:00:00)
                    const startOfDay = new Date(selectedDate);
                    startOfDay.setHours(0, 0, 0, 0);
                    fromTimestamp = Math.floor(startOfDay.getTime() / 1000);
                    
                    // End of selected date (23:59:59)
                    const endOfDay = new Date(selectedDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    uptoTimestamp = Math.floor(endOfDay.getTime() / 1000);
                }
            } else if (daysRange === 'last7days') {
                // Exclude today: from 7 days ago (starting 00:00:00) to yesterday (ending 23:59:59)
                const today = new Date();
            
                // Yesterday
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
            
                // 7 days before yesterday
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
            
                // Start of 7 days ago (00:00:00)
                sevenDaysAgo.setHours(0, 0, 0, 0);
                fromTimestamp = Math.floor(sevenDaysAgo.getTime() / 1000);
            
                // End of yesterday (23:59:59)
                yesterday.setHours(23, 59, 59, 999);
                uptoTimestamp = Math.floor(yesterday.getTime() / 1000);
            } else {
                // Today: from today 00:00:00 to today 23:59:59
                const today = new Date();
            
                // Start of today (00:00:00)
                const startOfDay = new Date(today);
                startOfDay.setHours(0, 0, 0, 0);
                fromTimestamp = Math.floor(startOfDay.getTime() / 1000);
            
                // End of today (23:59:59)
                const endOfDay = new Date(today);
                endOfDay.setHours(23, 59, 59, 999);
                uptoTimestamp = Math.floor(endOfDay.getTime() / 1000);
            }

            console.log('Late Comers API - From:', fromTimestamp, 'Upto:', uptoTimestamp);
            
            const response = await dashboardApi.getLateComersData(fromTimestamp, uptoTimestamp);
            const responseData = response.data;

            console.log('responseData', response);
            
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                // Ensure late_comers exists and is an array
                const lateComers = responseData.DB_DATA?.late_comers;
                const lateComersArray = Array.isArray(lateComers) ? lateComers : [];
                
                console.log('Setting lateComersData:', lateComersArray);
                
                set({lateComersData: lateComersArray});
                return lateComersArray;
            } else {
                console.log('Late Comers API Error:', responseData.ERROR_DESCRIPTION || 'Unknown error');
                set({lateComersData: []});
                return [];
            }
        } catch(err) {
            console.log('Error fetching late comers data:', err);
            set({lateComersData: []});
            return [];
        } finally {
            set({lateComersLoading: false});
        }
    },

    // Today's Attendance Data
    todayAttendanceData: null,
    todayAttendanceLoading: false,

    getTodayAttendanceData: async (date) => {
        set({todayAttendanceLoading: true});
        try {
            // Format date to YYYY-MM-DD if not provided
            const currentDate = date || new Date().toISOString().split('T')[0];
            
            const response = await dashboardApi.getTodayAttendanceData(currentDate);
            const responseData = response.data;
            
            if(responseData.STATUS === "SUCCESSFUL"){
                set({todayAttendanceData: responseData.DB_DATA});
                return responseData.DB_DATA;
            }
        } catch(err) {
            console.log('Error fetching today attendance data:', err);
            return null;
        } finally {
            set({todayAttendanceLoading: false});
        }
    },

    // Role-based dashboard data
    roleBasedData: null,
    userRole: null,
    loading: false,

    fetchRoleBasedData: async () => {
        set({loading: true});
        try {
            // Get user role from JWT token (you'll need to import getUserData)
            // const userData = getUserData();
            // const role = userData?.role;
            
            // For now, using static role detection - you can replace this with actual JWT parsing
            const role = 'employee'; // This should come from JWT token

            // Detected user role
            
            set({userRole: role});
            
            if (role === 'admin') {
                const response = await dashboardApi.getMachineData();
                set({roleBasedData: response.data});
            } else if (role === 'employee') {
                const response = await dashboardApi.getEmployeeDashboardData();
                set({roleBasedData: response.data});
            } else {
                // Static data for other roles
                set({roleBasedData: {
                    STATUS: "SUCCESS",
                    DB_DATA: {
                        id: 9119548,
                        emp_id: "123456",
                        name: "Hassan Khan",
                        f_name: "Masroor Hussain",
                        city: null,
                        permanent_address: null,
                        work_email: "",
                        join_date: 1748372400,
                        country: 2,
                        gender: "1",
                        reporting_to: 9119548,
                        dob: "2001-01-01",
                        dp: null,
                        religion: null,
                        marital_status: null,
                        branch: {
                            id: 2482,
                            branch_name: "Pishawer Branch77"
                        },
                        department: {
                            id: 5581,
                            name: "Node js"
                        },
                        designationObj: {
                            id: 12091,
                            title: "testing123"
                        },
                        contacts: [],
                        status: "0",
                        ntn_no: null,
                        domicile: null,
                        passport_no: "3220255474661",
                        disability: null
                    }
                }});
            }
        } catch (error) {
            console.error('Error fetching role-based data:', error);
        } finally {
            set({loading: false});
        }
    },

    newStaticDataHandle: (data) => {
        set((state) => {
            const updatedDashboardData = {
                ...state.dashboardData,
                PRESENT_EMPS: data.present || '0',
                PRESENT_PERCENT: data.present_percent || '0',
                LATE_EMPS: data.late_comers || '0',
                late_comers_percent: data.late_comers_percent || '0',
                LAST_7LATE_EMPS: data.late_comers_last7days || '0',
                LAST_7LATE_PERCENT: data.late_comers_last7days_percent || '0',
            };

            // console.log('Updated Dashboard Data:', updatedDashboardData);

            return { dashboardData: updatedDashboardData };
        });
    },
    gettingDashboardCountData: async(op_code, data)=>{
        try{
            // TODO: This function needs to be implemented in Dashboard API
            // gettingDashboardCountData called but function not implemented yet
            return
            // const response = await dashboardApi.getDashboardAccountDataApi(op_code, data)
            // // console.log('gettingDashboardCountData', response)
            // const resData = response.data 
            // if(response.status === 200 && resData.STATUS === 'SUCCESSFUL'){
            //     // console.log('resp', resData)
            //     // setDashboardValues((prevState)=>({
            //     //     ...prevState,
            //     //     data: resData.DB_DATA,
            //     //     // status:operationCode.status

            //     // }))
            //     set({dashboardCountData: resData.DB_DATA, dashboardCopyCountData:resData.DB_DATA})
            // }


        }catch(err){
            // console.log('gettingDashboardCountData', err)
        }
    },
    filterEmployees : (name)=>{

        if (name.trim() === '') {
            set({ dashboardCountData: get().dashboardCopyCountData });
        } else {
            const lowercaseName = name.toLowerCase();

            const matchedEmps = get().dashboardCopyCountData.filter((employee) =>
                employee.name.toLowerCase().includes(lowercaseName)
            );
            set({ dashboardCountData: matchedEmps });
        }

    },


    academics:[],
    gettingAcademics : async(id)=>{
        const apiData = {emp_id: id}
        try{
            const response = await employeesApi.getEmpAcademic(apiData)
            const data = response.data 
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({academics: data.DB_DATA})
            }else{
                //  setCheckListData([])
            }
        }catch(err){

        }
        
    },

    addNewAcademic:(data)=>{
        set({academics: [...new Set([...get().academics, data])]})
    },
    deleteAcademic:(id)=>{
        set({academics:get().academics.filter((ele)=> ele.id !== id)})
    },
    updateSingleAcademic:(data)=>{
        set({
            academics: get().academics?.map((ele) => ele.id === data.id ? data : ele)

        })
    },

    experiencesData:[],
    gettingExperience : async(id)=>{
        const apiData = {emp_id: id}
        try{
            const response = await employeesApi.getEmpExperience(apiData)
            const data = response.data 
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                
                set({experiencesData:data.DB_DATA})
            }else{
            }
        }catch(err){

        }

    },
    addNewExperience:(data)=>{
        set({experiencesData: [...new Set([...get().experiencesData, data])]})
    },
    updateSingleExperience:(data)=>{
        set({
            experiencesData: get().experiencesData?.map((ele) => ele.id === data.id ? data : ele)

        })
    },
    deleteSingleExperience:(id)=>{
        set({experiencesData:get().experiencesData.filter((ele)=> ele.id !== id)})
    },

    depandantsData:[],
    gettingDependant: async(id)=>{
        const apiData = {emp_id: id}
        try{
            const response = await employeesApi.getEmpDepandants(apiData)
            // console.log('response', response)
            const data = response.data 
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                // setCheckListData(data.DB_DATA)
                set({
                    depandantsData:data.DB_DATA
                })
            }else{
                //  setCheckListData([])
            }
        }catch(err){

        }

    },
    addNewDependent:(data)=>{
        set({depandantsData: [...new Set([...get().depandantsData, data])]})
    },
    updateSingleDependent:(data)=>{
        set({
            depandantsData: get().depandantsData?.map((ele) => ele.id === data.id ? data : ele)

        })
    },
    deleteSingleDependent:(id)=>{
        set({depandantsData:get().depandantsData.filter((ele)=> ele.id !== id)})
    },
    licensesData:[],
    gettingLicenses:async(id)=>{
        const apiData = {emp_id: id}
        try{
            const response = await employeesApi.getEmpLicenses(apiData)
            // console.log('response', response)
            const data = response.data 
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                // setCheckListData(data.DB_DATA)
                set({licensesData:data.DB_DATA})
               
            }else{
                //  setCheckListData([])
            }
        }catch(err){

        }

    },
    addNewLicense:(data)=>{
        set({licensesData: [...new Set([...get().licensesData, data])]})
    },
    updateSingleLicense:(data)=>{
        set({
            licensesData: get().licensesData?.map((ele) => ele.id === data.id ? data : ele)

        })
    },
    deleteSingleLicense:(id)=>{
        set({licensesData:get().licensesData.filter((ele)=> ele.id !== id)})
    },


    refrenceData:[],
    gettingRefrences: async(id)=>{
        const apiData = {emp_id: id}
        try{
            const response = await employeesApi.getEmpRefrences(apiData)
            // console.log('response', response)
            const data = response.data 
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                // setCheckListData(data.DB_DATA)
                set({refrenceData: data.DB_DATA})
            }else{
                //  setCheckListData([])
            }
        }catch(err){

        }

    },
    addNewReference:(data)=>{
        set({refrenceData: [...new Set([...get().refrenceData, data])]})
    },

    documentsData:[],
    gettingDocuments : async(id)=>{
        const apiData = {emp_id: id}
        try{
            const response = await employeesApi.getEmpDocuments(apiData)
            const data = response.data 
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({documentsData:data.DB_DATA})
            }else{
                //  setCheckListData([])
            }
        }catch(err){

        }

    },
    addNewDocument:(data)=>{
        set({documentsData: [...new Set([...get().documentsData, data])]})
    },
    deleteSingleDocument:(id)=>{
        set({documentsData:get().documentsData.filter((ele)=> ele.id !== id)})
    },
    deleteSinglePrivilege:(id)=>{
        // console.log(data)
        // Getting employee data
         set((state) => {
            const update_user_role = state.empData.data.DB_DATA.user_roles.filter(
                role => role.id !== id
            );

            return {
                empData: {
                    ...state.empData,
                    data: {
                        ...state.empData.data,
                        DB_DATA: {
                            ...state.empData.data.DB_DATA,
                            user_roles: update_user_role
                        }
                    }
                }
            };
        });
    },


    addingSingleRole:(data)=>{
        // console.log('data', data) 
        // console.log(get().empData)
        set((state) => ({
            empData: {
                ...state.empData,
                data: {
                    ...state.empData.data,
                    DB_DATA: {
                        ...state.empData.data.DB_DATA,
                        user_roles:   state.empData.data.DB_DATA.user_roles
                        ? [...state.empData.data.DB_DATA.user_roles, data] // Add data if reporting_to is not null
                        : [data] 
                    }
                },
                
            }
        }))
    },

    privilegesData:{},
    settingPrivilegesData :(data)=>{
        set({privilegesData: data})
    },

    empExtraData:[],
    gettingEmpExtraDuties : async(id)=>{
        const apiData = {emp_id: id}
        try{
            const response = await employeesApi.getEmpExtraDuties(apiData)
            const data = response.data 
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({empExtraData : data.DB_DATA})
            }else{
                set({empExtraData : []})
            }
        }catch(err){

        }
    },
    addNewDuty:(data)=>{
        set({empExtraData: [...new Set([...get().empExtraData, data])]})
    },
    deleteSingleDuty:(id)=>{
        set({empExtraData:get().empExtraData.filter((ele)=> ele.id !== id)})
    },
    
    updateSingleDuty:(data)=>{
        // console.log('data', data)
        
        set({
            empExtraData: get().empExtraData?.map((ele) => ele.id == data.id ? data : ele)

        })
        // console.log('empExtraData', get().empExtraData)
    },

    accelerateData:[],
    gettingEmpAccelerate : async(id)=>{
        const apiData = {emp_id: 9120180}
        try{
            const response = await employeesApi.getAllAccelerate(apiData)
            const data = response.data 
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({accelerateData : data.DB_DATA})
            }else{
                set({accelerateData : []})
            }
        }catch(err){

        }
    },

    settingNewAccelerateData:(data)=>{
        set({accelerateData: data})
    },

    deleteSingleContact:(id)=>{
        // console.log(data)
        // Getting employee data
         set((state) => {
            const update_user_contact = state.empData.data.DB_DATA.emp_contact.filter(
                contact => contact.id !== id
            );

            return {
                empData: {
                    ...state.empData,
                    data: {
                        ...state.empData.data,
                        DB_DATA: {
                            ...state.empData.data.DB_DATA,
                            emp_contact: update_user_contact
                        }
                    }
                }
            };
        });
    },
})

export default dashboardViewModel

