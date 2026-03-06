import payrollApi from '../../Model/Data/Payroll/Payroll'
import employeesApi from '../../Model/Data/Employees/Employees'

const payrollViewModel = (set, get) => ({
    allSalaryTemp : [],
    copyAllSalaryTemp : [],
    salaryTemplatesLoaded : false,
    salaryTemplatesPagination: {
        currentPage: 0,
        totalPages: 0,
        hasMore: false
    },
    allEmpSalary : [],
    copyAllEmpSalary : [],
    empSalaryTemplate : [],
    empSalaryLoaded : false,
    lastEmpBranchId : null,
    lastEmpSearchTerm : '',
    lastEmpDepartmentId : null,
    lastEmpTemplateId : null,
    branches_payroll : [],
    copyBranchesData : [],
    branchesLoaded : false,
    lastBranchId : null,
    lastSearchTerm : '',
    dashboardDataLoaded : false,
    lastDashboardYear : null,
    departments_payroll : [],
    mountEmpSalary : false,
    salary_id : '',
    dataEditSingle: [],
    dataEditBranch:[],
    singleTemp: [],
    grossNetValues : [],
    annualGrossData: [],
    grossSalary: [],
    netSalary : [],
    dataSet : [],
    historyData : [],
    historyDataSalary : [],
    historyDataDetails : [],
    idSet:'',
    idSetCancel:'',
    incentDeductData : [],
    incentData : [],
    deductData : [],
    incentiveList : [],
    deductionList : [],
    manageHistoryData : [],
    dataEdit : [],
    allIncentList : [],
    allDeductList : [],
    allIncentDeductListBoth : [],
    mountPayrollOverview: false,
    payrollOverviewLoading: true,
    // Raw API payslips data - stored exactly as received from API (same to same)
    // Structure: Array of payslip objects with ALL fields preserved:
    // - wf_employee (nested object with employee details)
    // - incentive_deduction_details (array with nested details objects)
    // - income_tax, provident_fund, eobi_record (null or objects)
    // - payslip_config (object with payslip_id, formula, daily_req_hrs, total_days, etc.)
    // - attendance_summary (object with total_adjusted_late_min, calculated_absentee_deduction, etc.)
    // - All other fields: id, emp_id, rate, salary_amount, paid_amount, total_working, total_present, etc.
    // NO transformations applied - access raw data: payslip.payslip_config, payslip.attendance_summary
    payslips: [],
    copyPayslips: [],
    payslipsLoaded: false,
    lastPayslipFilters: null,
    totalPayslipsCount: 0,
    payslipsPagination: {
        currentPage: 0,
        totalPages: 0,
        hasMore: false
    },
    // Complete API response data - stored exactly as received (same to same)
    payslipsResponseData: null,
    invoiceData: null,
    invoiceLoaded: false,
    lastInvoiceId: null,

    // Tax Exemptions and Income Tax Slabs
    taxExemptions: [],
    taxExemptionsLoaded: false,
    incomeTaxSlabs: [],
    incomeTaxSlabsLoaded: false,

    handleMountPayroll : () => {
        set({mountPayrollOverview: true})
    },

    settingSalaryTemp : (id) => {
        set({salary_id: id})
    },

    handleMountEmp: () => {
        set({mountEmpSalary : true})
    },

    gettingSalaryTemp : async(branch_id, search = '', page = 0, limit = 10, forceReload = false, loadMore = false) => {
        const currentState = get()
        
        // Create a filter key for comparison (exclude page for loadMore comparison)
        const filterKeyForComparison = JSON.stringify({
            branch_id,
            search
        })
        
        // Prevent duplicate calls if data is already loaded with same filters and not forcing reload (only for initial load)
        if (!loadMore && currentState.salaryTemplatesLoaded && !forceReload && 
            currentState.lastBranchId === branch_id && currentState.lastSearchTerm === search) {
            return
        }
        
        // Only clear salary templates when filters change (not when loading more)
        if (!loadMore) {
            set({
                allSalaryTemp: [],
                copyAllSalaryTemp: [],
                salaryTemplatesLoaded: false,
                salaryTemplatesPagination: {
                    currentPage: 0,
                    totalPages: 0,
                    hasMore: false
                }
            })
        }
        
        // Getting salary templates for branch
        try {
            const response = await payrollApi.getSalaryTemp(branch_id, search, page, limit)
            const data = response.data
            
            // Handle the new response structure with success field
            if(data && data.success === true && data.data?.salary_data){
                const salaryData = data.data.salary_data;
                
                // Extract pagination from API response (if available)
                const pagination = data.data.pagination || {};
                const currentPage = pagination.page !== undefined ? pagination.page : page;
                const totalPages = pagination.pages !== undefined ? pagination.pages : 0;
                // If pagination info exists, use it; otherwise assume more if we got full limit
                const hasMore = pagination.page !== undefined && pagination.pages !== undefined 
                    ? pagination.page < pagination.pages 
                    : salaryData.length === limit;
                
                // If loading more, append to existing list
                if (loadMore && currentState.allSalaryTemp && Array.isArray(currentState.allSalaryTemp)) {
                    set({
                        allSalaryTemp: [...currentState.allSalaryTemp, ...salaryData],
                        copyAllSalaryTemp: [...currentState.copyAllSalaryTemp, ...salaryData],
                        salaryTemplatesLoaded: true,
                        lastBranchId: branch_id,
                        lastSearchTerm: search,
                        salaryTemplatesPagination: {
                            currentPage: currentPage,
                            totalPages: totalPages,
                            hasMore: hasMore
                        }
                    })
                } else {
                    // Otherwise, set new list
                    set({
                        allSalaryTemp: salaryData,
                        copyAllSalaryTemp: salaryData,
                        salaryTemplatesLoaded: true,
                        lastBranchId: branch_id,
                        lastSearchTerm: search,
                        salaryTemplatesPagination: {
                            currentPage: currentPage,
                            totalPages: totalPages,
                            hasMore: hasMore
                        }
                    })
                }

            } else if(response.status === 200 && data.success === false){
                set({
                    allSalaryTemp: loadMore ? currentState.allSalaryTemp : [],
                    copyAllSalaryTemp: loadMore ? currentState.copyAllSalaryTemp : [],
                    salaryTemplatesLoaded: false,
                    salaryTemplatesPagination: {
                        currentPage: 0,
                        totalPages: 0,
                        hasMore: false
                    }
                })
            } else {
                // Fallback for other response structures
                set({
                    allSalaryTemp: loadMore ? currentState.allSalaryTemp : [],
                    copyAllSalaryTemp: loadMore ? currentState.copyAllSalaryTemp : [],
                    salaryTemplatesLoaded: false,
                    salaryTemplatesPagination: {
                        currentPage: 0,
                        totalPages: 0,
                        hasMore: false
                    }
                })
            }
        } catch(error) {
            set({
                salaryTemplatesLoaded: false,
                allSalaryTemp: loadMore ? currentState.allSalaryTemp : [],
                copyAllSalaryTemp: loadMore ? currentState.copyAllSalaryTemp : [],
                salaryTemplatesPagination: {
                    currentPage: 0,
                    totalPages: 0,
                    hasMore: false
                }
            })
        }
    },

    gettingManageEmpSalary : async(branch_id = null, deptt_id = null, search = '', forceReload = false, template_id = null, get_all = true) => {
        const currentState = get()
        
        // Prevent duplicate calls if data is already loaded for the same branch, search, department, and template, and not forcing reload
        if (currentState.empSalaryLoaded && !forceReload &&
            currentState.lastEmpBranchId === branch_id &&
            currentState.lastGetAll === get_all &&
            currentState.lastEmpSearchTerm === search &&
            currentState.lastEmpDepartmentId === deptt_id &&
            currentState.lastEmpTemplateId === template_id) {
            return
        }
        
        set({
            allEmpSalary : [],
            copyAllEmpSalary: [],
            empSalaryLoaded: false
        })

        try {
            const response = await payrollApi.getEmpSalary(branch_id, deptt_id, search, template_id, get_all)
            console.log('response gettingManageEmpSalary:', response);
            const data = response.data

            // Handle the new response structure with STATUS field
            if(data && data.STATUS === 'SUCCESSFUL' && data.DATA?.data){
                set({
                    allEmpSalary : data.DATA.data,
                    copyAllEmpSalary: data.DATA.data,
                    empSalaryTemplate: data.DATA.salary_templates || [],
                    empSalaryLoaded: true,
                    lastEmpBranchId: branch_id,
                    lastEmpSearchTerm: search,
                    lastEmpDepartmentId: deptt_id,
                    lastEmpTemplateId: template_id,
                    lastGetAll: get_all
                })
            } else if(data && data.STATUS === 'ERROR'){
                set({allEmpSalary : [], empSalaryLoaded: false})
            } else {
                // Fallback for other response structures
                set({allEmpSalary : [], empSalaryLoaded: false})
            }
        } catch(error) {
            set({empSalaryLoaded: false, allEmpSalary: []})
        }
    },

    getAllBranchesPayroll: async (forceReload = false) => {
        const currentState = get()

        if (currentState.branchesLoaded && !forceReload) {
            return
        }
        
        set({branchesLoaded: false})
        
        try {
            const response = await employeesApi.gettingAllBranches()
            const respData = response.data

            if(response.status === 200 && respData.STATUS === 'SUCCESSFUL'){
                // Setting branch data
                const branches = respData.DB_DATA.branches
                set({branches_payroll: branches, copyBranchesData: branches, branchesLoaded: true})
                
                // Note: Salary templates loading is now handled by the component's useEffect
                // which will load with "All Branches" (branch_id: 0) by default
            } else {
                set({branches_payroll: [], copyBranchesData: [], branchesLoaded: false})
            }

        }catch(err){
            set({branchesLoaded: false})
        }
    },

  manageEmpSalarySearch: (name) => {
    if(name.trim() === '') {
        set({allEmpSalary : get().copyAllEmpSalary})
    } else {
        const lowercaseName = name.toLowerCase();
        const matchedEmps = get().copyAllEmpSalary.filter((emp) => emp.name.toLowerCase().includes(lowercaseName)
    );
    set({allEmpSalary:matchedEmps})
    }
  },

  salaryTempSearch : (name) => {
    if(name.trim() === '') {
        set({allSalaryTemp : get().copyAllSalaryTemp})
    } else {
        const lowercaseName = name.toLowerCase();
        const matchedTemp = get().copyAllSalaryTemp.filter((temp) => temp.name.toLowerCase().includes(lowercaseName)
    );
    set({allSalaryTemp:matchedTemp})
    }
  },

  deleteSalaryTemp: (id) => {
    set({
        allSalaryTemp: get().allSalaryTemp.filter(temp => temp.id !== id),
    });
},

    settingSingleData : (data) => {
        set({
            dataEditSingle : data
        })
        set({
            dataEditBranch : data.branch_id.DB_DATA
        })
    },

    settingSingleTemp : (data) => {
        set({
            singleTemp : data
        })
    },

    handleUpdateTemplate: async(updatedTemp, branch) => {
        set({
            allSalaryTemp: get().allSalaryTemp?.map((temp) => temp.id === updatedTemp.id ? { ...temp, name: updatedTemp.template_name, salary_amount:updatedTemp.salary, branch_name: branch.label } :  temp)
        })
    },

    // Payroll Overview
    getDashboardData : async(year = null, forceReload = false) => {
        // If no year provided, use current year
        if (!year) {
            const currentYear = new Date().getFullYear()
            year = currentYear.toString().slice(-2) // Get last 2 digits (e.g., 2025 -> 25, 2024 -> 24)
        }
        const currentState = get()
        
        // Prevent duplicate calls if data is already loaded for the same year and not forcing reload
        if (currentState.dashboardDataLoaded && !forceReload && currentState.lastDashboardYear === year) {
            return
        }
        
        set({ payrollOverviewLoading: true })
        try{
            const response = await payrollApi.getDashboardData(year, 'annual_salary')
            const data = response.data

            if(response.status === 200 && (data.STATUS === 'SUCCESSFUL' || data.STATUS === 'SUCCESS')){
                const apiData = data.DATA || data.DB_DATA || data.data || {}
                const annualSalary = apiData.annual_salary || apiData.annualSalary || []
                const grossSalaryData = apiData.gross_salary || apiData.grossSalary || []
                const netSalaryData = apiData.net_salary || apiData.netSalary || []
                set({
                    grossNetValues: apiData,
                    annualGrossSalary: Array.isArray(annualSalary) ? annualSalary : [],
                    grossSalary: Array.isArray(grossSalaryData) ? grossSalaryData : [],
                    netSalary: Array.isArray(netSalaryData) ? netSalaryData : [],
                    dashboardDataLoaded: true,
                    lastDashboardYear: year
                })
            } else {
                set({
                    grossNetValues: [],
                    annualGrossSalary: [],
                    grossSalary: [],
                    netSalary: [],
                    dashboardDataLoaded: false,
                    payrollOverviewLoading: false
                })
            }

        }catch(error){
            set({
                grossNetValues: [],
                annualGrossSalary: [],
                grossSalary: [],
                netSalary: [],
                dashboardDataLoaded: false,
                payrollOverviewLoading: false
            })
        } finally {
            set({ payrollOverviewLoading: false })
        }
    },

    // Keep individual functions for backward compatibility
    getDataGrossNet : async() => {
        // Use the new unified function
        return get().getDashboardData()
    },
    
    getAnnualGrossSalary : async(year) => {
        // Use the new unified function with forceReload for year changes
        return get().getDashboardData(year, true)
    },

    getGrossSalary : async(year) => {
        // Use the new unified function with forceReload for year changes
        return get().getDashboardData(year, true)
    },

    getNetSalary : async(year) => {
        // Use the new unified function with forceReload for year changes
        return get().getDashboardData(year, true)
    },

    gettingIncDeductHistory : async(data) => {
        const histData = {
            emp_id : data.id
        }
        try{
            const response = await payrollApi.incDeductHistory(histData)
            const data = response.data

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({incentDeductData: data.DB_DATA, historyDataSalary:data.DB_DATA, historyDataDetails:data.DB_DATA.increment_history})
            } else {
                set({incentDeductData: []})
            }
            

        }catch(error){
            // Error handling
        }
    },

    settingData : (data) => {
        set({dataSet: data})
    },

    settingEmpId : (id) => {
        set({idSet: id})
    }, 

    settingEmpIdCancel : (id) => {
        set({idSetCancel: id})
    },

    settingDataForEdit : (data) => {
        set({dataEdit: data})
    },

    gettingManageIncDeduct : async(emp_Id) => {
        try{
            // Use getSalaryDeductions API instead of manageIncentDeduct to avoid unnecessary POST calls
            // This API is designed for fetching data, not creating
            // Use Promise.allSettled to handle cases where one API returns 404 (no data) while the other succeeds
            const results = await Promise.allSettled([
                payrollApi.getSalaryDeductions(1, 0, 0, 15, 'forward', emp_Id), // status=1 (active), d_type=0 for incentives
                payrollApi.getSalaryDeductions(1, 1, 0, 15, 'forward', emp_Id)  // status=1 (active), d_type=1 for deductions
            ]);

            const [incentivesResult, deductionsResult] = results;

            let incentData = [];
            let deductData = [];

            // Process incentives data (d_type=0)
            if(incentivesResult.status === 'fulfilled'){
                const incentivesResponse = incentivesResult.value;
                console.log('incentivesResponse:', incentivesResponse);
                const incentivesData = incentivesResponse?.data;
                
                if(incentivesResponse?.status === 200 && incentivesData?.STATUS === 'SUCCESSFUL'){
                    console.log('incentivesData:', incentivesData);
                    incentData = incentivesData.DB_DATA?.incentive_data ||
                                incentivesData.DB_DATA?.deduction_data ||
                                incentivesData.DB_DATA || [];
                }
            } else {
                // Handle rejected promise (404 - no data)
                console.log('Incentives API returned 404 (no data):', incentivesResult.reason);
                incentData = [];
            }

            // Process deductions data (d_type=1)
            if(deductionsResult.status === 'fulfilled'){
                const deductionsResponse = deductionsResult.value;
                const deductionsData = deductionsResponse?.data;
                
                if(deductionsResponse?.status === 200 && deductionsData?.STATUS === 'SUCCESSFUL'){
                    deductData = deductionsData.DB_DATA?.deduction_data ||
                               deductionsData.DB_DATA?.incentive_data ||
                               deductionsData.DB_DATA || [];
                }
            } else {
                // Handle rejected promise (404 - no data)
                console.log('Deductions API returned 404 (no data):', deductionsResult.reason);
                deductData = [];
            }

            // Set the data in the same format as before for backward compatibility
            set({
                incentDeductData: { incent: incentData, deduct: deductData },
                incentData: incentData,
                deductData: deductData
            });
        }catch(error){
            console.error('Error fetching incentive/deduction data:', error);
            set({incentDeductData: [], incentData:[], deductData:[] })
        }
    },

    gettingHistory : async(emp_Id) => {
        try{
            console.log('Fetching incentive/deduction history for empId:', emp_Id);
            
            // Use the existing incentiveDeductHistory API without status/d_type filters
            const response = await payrollApi.incentiveDeductHistory({
                emp_id: emp_Id?.emp_id || emp_Id
            });
            
            console.log('History - API response:', response);
            const data = response.data;

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                // Extract data from the response - it should contain both incentives and deductions
                const historyData = data.DB_DATA?.deduction_data || data.DB_DATA || [];
                console.log('History - Extracted data:', historyData);
                
                // Sort by timestamp (newest first)
                const sortedData = historyData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                console.log('History - Sorted data:', sortedData);
                set({manageHistoryData: sortedData});
            } else {
                console.log('History - No data or error:', data);
                set({manageHistoryData: []});
            }
        }catch(error){
            console.error('Error fetching incentive/deduction history:', error);
            set({manageHistoryData: []});
        }
    },

    gettingIncentiveList : async() => {
        
        const incData = {
            type : 0
        }
        try{
            const response = await payrollApi.incentiveDeductionList(incData)
            const data = response.data

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({incentiveList: data.DB_DATA})
            } else {
                set({incentiveList: []})
            }
        }catch(error){
            // Error handling
        }
    },

    gettingDeductionList : async() => {
        
        const incData = {
            type : 1
        }
        try{
            const response = await payrollApi.incentiveDeductionList(incData)
            const data = response.data

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({deductionList: data.DB_DATA})
            } else {
                set({deductionList: []})
            }
        }catch(error){
            // Error handling
        }
    },

    gettingAllIncentList : async() => {
        
        const incData = {
            type : 0
        }
        try{
            const response = await payrollApi.allIncentDeductList(incData)
            const data = response.data

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({allIncentList: data.DB_DATA})
            } else {
                set({allIncentList: []})
            }
        }catch(error){
            // Error handling
        }
    },

    gettingAllDeductList : async() => {
        
        const incData = {
            type : 1
        }
        try{
            const response = await payrollApi.allIncentDeductList(incData)
            const data = response.data

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({allDeductList: data.DB_DATA})
            } else {
                set({allDeductList: []})
            }
        }catch(error){
            // Error handling
        }
    },

    gettingAllIncentDeductListBoth : async() => {
        try{
            const response = await payrollApi.allIncentDeductListBoth()
            const data = response.data

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({allIncentDeductListBoth: data.DB_DATA})
            } else {
                set({allIncentDeductListBoth: []})
            }
        }catch(error){
            console.error('Error fetching incentive/deduction list:', error);
            set({allIncentDeductListBoth: []})
        }
    },

    // New function to fetch created incentives and deductions for the right side lists
    gettingCreatedIncentDeductList : async(empId = null) => {
        try{
            
            // Fetch both incentives and deductions using the new endpoint
            const [incentivesResponse, deductionsResponse] = await Promise.all([
                payrollApi.getSalaryDeductions(1, 0, 0, 10, 'forward', empId), // status=1 (active), d_type=0 for incentives
                payrollApi.getSalaryDeductions(1, 1, 0, 10, 'forward', empId)  // status=1 (active), d_type=1 for deductions
            ]);

            const incentivesData = incentivesResponse.data;
            const deductionsData = deductionsResponse.data;

            let combinedData = [];


            // Process incentives data (d_type=0)
            if(incentivesResponse.status === 200 && incentivesData.STATUS === 'SUCCESSFUL'){
                // Check if data is in incentive_data, deduction_data, or directly in DB_DATA
                const incentives = incentivesData.DB_DATA?.incentive_data || 
                                 incentivesData.DB_DATA?.deduction_data || 
                                 incentivesData.DB_DATA || [];
                combinedData = [...combinedData, ...incentives.map(item => ({
                    ...item,
                    d_type: '0'
                }))];
            }

            // Process deductions data (d_type=1)
            if(deductionsResponse.status === 200 && deductionsData.STATUS === 'SUCCESSFUL'){
                // Check if data is in deduction_data, incentive_data, or directly in DB_DATA
                const deductions = deductionsData.DB_DATA?.deduction_data || 
                                 deductionsData.DB_DATA?.incentive_data || 
                                 deductionsData.DB_DATA || [];
                combinedData = [...combinedData, ...deductions.map(item => ({
                    ...item,
                    d_type: '1'
                }))];
            }

            set({createdIncentDeductList: combinedData});
        }catch(error){
            console.error('Error fetching created incentive/deduction list:', error);
            set({createdIncentDeductList: []});
        }
    },

    addingFormIncent : (data) => {
        // Refresh the combined list from server to get the latest data
        get().gettingAllIncentDeductListBoth();

        // Also update the separate lists for backward compatibility
        if(data.status === 0){
            set({
                deductionList: [...new Set([data, ...get().deductionList])],
                allDeductList: [...new Set([data, ...get().allDeductList])]
            })
        } else if(data.status === 1){
            set({
                incentiveList : [...new Set([data, ...get().incentiveList])],
                allIncentList: [...new Set([data, ...get().allIncentList])]
            })
        }
    },

    deletingIncent : (id, data) => {
        // Update the combined list that the UI actually uses
        set({
            allIncentDeductListBoth: get().allIncentDeductListBoth.filter(item => item.id !== id)
        });
        
        // Also update the separate lists for backward compatibility
        if(data.d_type === "0" || data.d_type === "INCENTIVE"){
            set({
                incentiveList: get().incentiveList.filter(listIncent => listIncent.id !== id),
                allIncentList: get().allIncentList.filter(listIncent => listIncent.id !== id)
            });
        } else if(data.d_type === "1" || data.d_type === "DEDUCTION"){
            set({
                deductionList: get().deductionList.filter(listDeduct => listDeduct.id !== id),
                allDeductList: get().allDeductList.filter(listDeduct => listDeduct.id !== id)
            });
        }
    },

    handleUpdateList: async (updatedList) => {
        // Get the original item to check old type
        const originalItem = get().allIncentDeductListBoth.find(item => item.id === updatedList.update_id);
        const oldType = originalItem?.d_type;
        const newType = updatedList.type === '1' || updatedList.type === 1 ? 'DEDUCTION' : 'INCENTIVE';
        const oldTypeValue = oldType === 'DEDUCTION' || oldType === '1' || oldType === 1 ? 1 : 0;
        const newTypeValue = updatedList.type === '1' || updatedList.type === 1 ? 1 : 0;
        
        // Check if type changed
        const typeChanged = oldTypeValue !== newTypeValue;
        
        // Update the combined list that the UI actually uses
        set({
            allIncentDeductListBoth: get().allIncentDeductListBoth.map(item => 
                item.id === updatedList.update_id 
                    ? { 
                        ...item, 
                        title: updatedList.title, 
                        d_type: newType,
                        status: updatedList.status === '1' || updatedList.status === 1 ? 'ACTIVE' : 'INACTIVE'
                    } 
                    : item
            )
        });
    
        // Update separate lists - remove from old list if type changed, add/update in new list
        if (typeChanged) {
            // Type changed - remove from old list and add to new list
            if (oldTypeValue === 1) {
                // Was deduction, now incentive - remove from deduction lists
                set({
                    deductionList: get().deductionList?.filter(item => item.id !== updatedList.update_id),
                    allDeductList: get().allDeductList?.filter(item => item.id !== updatedList.update_id)
                });
            } else {
                // Was incentive, now deduction - remove from incentive lists
                set({
                    incentiveList: get().incentiveList?.filter(item => item.id !== updatedList.update_id),
                    allIncentList: get().allIncentList?.filter(item => item.id !== updatedList.update_id)
                });
            }
            
            // Add to new list
            const updatedItem = {
                id: updatedList.update_id,
                title: updatedList.title,
                d_type: newTypeValue === 1 ? 'DEDUCTION' : 'INCENTIVE',
                status: updatedList.status === '1' || updatedList.status === 1 ? 'ACTIVE' : 'INACTIVE',
                ...originalItem
            };
            
            if (newTypeValue === 1) {
                // Add to deduction lists
                set({
                    deductionList: [...get().deductionList?.filter(item => item.id !== updatedList.update_id), updatedItem],
                    allDeductList: [...get().allDeductList?.filter(item => item.id !== updatedList.update_id), updatedItem]
                });
            } else {
                // Add to incentive lists
                set({
                    incentiveList: [...get().incentiveList?.filter(item => item.id !== updatedList.update_id), updatedItem],
                    allIncentList: [...get().allIncentList?.filter(item => item.id !== updatedList.update_id), updatedItem]
                });
            }
        } else {
            // Type didn't change - just update in place
            if (newTypeValue === 1) { // Deduction
                set({
                    deductionList: get().deductionList?.map((deductList) => 
                        deductList.id === updatedList.update_id 
                            ? { ...deductList, title: updatedList.title, d_type: newType, status: updatedList.status === '1' || updatedList.status === 1 ? 'ACTIVE' : 'INACTIVE' } 
                            : deductList
                    ),
                    allDeductList: get().allDeductList?.map((deductList) => 
                        deductList.id === updatedList.update_id 
                            ? { ...deductList, title: updatedList.title, d_type: newType, status: updatedList.status === '1' || updatedList.status === 1 ? 'ACTIVE' : 'INACTIVE' } 
                            : deductList
                    )
                });
            } else { // Incentive
                set({
                    incentiveList: get().incentiveList?.map((incentList) => 
                        incentList.id === updatedList.update_id 
                            ? { ...incentList, title: updatedList.title, d_type: newType, status: updatedList.status === '1' || updatedList.status === 1 ? 'ACTIVE' : 'INACTIVE' } 
                            : incentList
                    ),
                    allIncentList: get().allIncentList?.map((incentList) => 
                        incentList.id === updatedList.update_id 
                            ? { ...incentList, title: updatedList.title, d_type: newType, status: updatedList.status === '1' || updatedList.status === 1 ? 'ACTIVE' : 'INACTIVE' } 
                            : incentList
                    )
                });
            }
        }
    },

      deletingAllowance: (id, data) => {
        // Update the combined list that the UI actually uses
        set({
            allIncentDeductListBoth: get().allIncentDeductListBoth.filter(item => item.id !== id)
        });
    
        // Also update the separate lists for backward compatibility
        if (data.type === 'incentive') {
            set({
                incentData: get().incentData.filter(incent => incent.id !== id),
                allIncentList: get().allIncentList.filter(incent => incent.id !== id)
            });
        } else if (data.type === 'deduction') {
            set({
                deductData: get().deductData.filter(deduct => deduct.id !== id),
                allDeductList: get().allDeductList.filter(deduct => deduct.id !== id)
            });
        }
    },

    gettingPayslips: async(params = {}, forceReload = false, loadMore = false) => {
        const currentState = get()
        
        // Create a filter key for comparison (exclude page for loadMore comparison)
        const filterKeyForComparison = JSON.stringify({
            ...params,
            page: undefined // Exclude page from comparison for loadMore
        })
        
        // Prevent duplicate calls if data is already loaded with same filters and not forcing reload (only for initial load)
        if (!loadMore && currentState.payslipsLoaded && !forceReload && 
            currentState.lastPayslipFilters === filterKeyForComparison) {
            return
        }
        
        // Only clear payslips when filters change (not when loading more)
        if (!loadMore) {
            set({
                payslips: [],
                copyPayslips: [],
                totalPayslipsCount: 0,
                payslipsLoaded: false,
                payslipsResponseData: null,
                payslipsPagination: {
                    currentPage: 0,
                    totalPages: 0,
                    hasMore: false
                }
            })
        }
        try {
            const response = await payrollApi.getPayslips(params)
            const data = response.data
            
            // Handle the response structure based on the swagger example
            if(data && data.STATUS === 'SUCCESSFUL' && data.DB_DATA?.payslips){
                // Deep clone payslips array to preserve exact structure (same to same)
                // This ensures ALL fields are preserved exactly as received from API, including:
                // - Nested objects: wf_employee, income_tax, provident_fund, eobi_record
                // - Arrays: incentive_deduction_details (with nested details objects)
                // - Config objects: payslip_config (payslip_id, formula, daily_req_hrs, total_days, etc.)
                // - Summary objects: attendance_summary (total_adjusted_late_min, calculated_absentee_deduction, etc.)
                // - All other fields: id, emp_id, rate, salary_amount, paid_amount, etc.
                const clonedPayslips = JSON.parse(JSON.stringify(data.DB_DATA.payslips))
                const clonedDBData = JSON.parse(JSON.stringify(data.DB_DATA))
                const clonedResponse = JSON.parse(JSON.stringify(data))
                
                // Extract pagination from API response - DB_DATA has page_id, pages, has_more, total_count (not nested pagination)
                const currentPage = clonedDBData.page_id !== undefined ? clonedDBData.page_id : (clonedDBData.pagination?.page !== undefined ? clonedDBData.pagination.page : (params.page ?? 0));
                const totalPages = clonedDBData.pages !== undefined ? clonedDBData.pages : (clonedDBData.pagination?.pages !== undefined ? clonedDBData.pagination.pages : 0);
                const hasMore = clonedDBData.has_more !== undefined ? clonedDBData.has_more : (clonedDBData.pagination?.page !== undefined && clonedDBData.pagination?.pages !== undefined ? clonedDBData.pagination.page < clonedDBData.pagination.pages : clonedPayslips.length === 15);
                
                // If loading more, append to existing list
                if (loadMore && currentState.payslips && Array.isArray(currentState.payslips)) {
                    set({
                        payslips: [...currentState.payslips, ...clonedPayslips],
                        copyPayslips: [...currentState.copyPayslips, ...clonedPayslips],
                        totalPayslipsCount: clonedDBData.total_count || currentState.totalPayslipsCount,
                        payslipsLoaded: true,
                        lastPayslipFilters: filterKeyForComparison,
                        payslipsPagination: {
                            currentPage: currentPage,
                            totalPages: totalPages,
                            hasMore: hasMore
                        },
                        payslipsResponseData: clonedResponse
                    })
                } else {
                    // Otherwise, set new list
                    set({
                        payslips: clonedPayslips,
                        copyPayslips: clonedPayslips,
                        totalPayslipsCount: clonedDBData.total_count || 0,
                        payslipsLoaded: true,
                        lastPayslipFilters: filterKeyForComparison,
                        payslipsPagination: {
                            currentPage: currentPage,
                            totalPages: totalPages,
                            hasMore: hasMore
                        },
                        payslipsResponseData: clonedResponse
                    })
                }
            } else if(data && data.STATUS === 'ERROR'){
                // Handle error response - store error data as well (same to same)
                const clonedErrorData = JSON.parse(JSON.stringify(data))
                set({
                    payslips: loadMore ? currentState.payslips : [],
                    copyPayslips: loadMore ? currentState.copyPayslips : [],
                    totalPayslipsCount: loadMore ? currentState.totalPayslipsCount : 0,
                    payslipsLoaded: false,
                    payslipsPagination: {
                        currentPage: 0,
                        totalPages: 0,
                        hasMore: false
                    },
                    payslipsResponseData: clonedErrorData
                })
            } else {
                // Fallback for other response structures (same to same)
                const clonedData = JSON.parse(JSON.stringify(data))
                set({
                    payslips: loadMore ? currentState.payslips : [],
                    copyPayslips: loadMore ? currentState.copyPayslips : [],
                    totalPayslipsCount: loadMore ? currentState.totalPayslipsCount : 0,
                    payslipsLoaded: false,
                    payslipsPagination: {
                        currentPage: 0,
                        totalPages: 0,
                        hasMore: false
                    },
                    payslipsResponseData: clonedData
                })
            }
        } catch(error) {
            // Store error information
            set({
                payslips: loadMore ? currentState.payslips : [],
                copyPayslips: loadMore ? currentState.copyPayslips : [],
                totalPayslipsCount: loadMore ? currentState.totalPayslipsCount : 0,
                payslipsLoaded: false,
                payslipsPagination: {
                    currentPage: 0,
                    totalPages: 0,
                    hasMore: false
                },
                payslipsResponseData: {
                    STATUS: 'ERROR',
                    ERROR_CODE: error.code || 'UNKNOWN_ERROR',
                    ERROR_DESCRIPTION: error.message || 'Failed to fetch payslips',
                    error: error
                }
            })
        }
    },

    gettingInvoiceData: async(invoiceId, forceReload = false) => {
        const currentState = get()
        
        // Prevent duplicate calls if data is already loaded for the same invoice and not forcing reload
        if (currentState.invoiceLoaded && !forceReload && 
            currentState.lastInvoiceId === invoiceId) {
            return
        }
        try {
            const response = await payrollApi.getInvoiceData(invoiceId)
            const data = response.data
            
            // Handle the response structure
            if(data && data.STATUS === 'SUCCESSFUL' && data.DB_DATA){
                set({
                    invoiceData: data.DB_DATA,
                    invoiceLoaded: true,
                    lastInvoiceId: invoiceId
                })
            } else if(data && data.STATUS === 'ERROR'){
                // Handle error response
                set({
                    invoiceData: null,
                    invoiceLoaded: false
                })
            } else {
                // Fallback for other response structures
                set({
                    invoiceData: null,
                    invoiceLoaded: false
                })
            }
        } catch(error) {
            set({
                invoiceData: null,
                invoiceLoaded: false
            })
        }
    },

    clearInvoiceData: () => {
        set({
            invoiceData: null,
            invoiceLoaded: false,
            lastInvoiceId: null
        })
    },

    deletingBulkPayslips: async(payslipIds) => {
        if (!payslipIds || (Array.isArray(payslipIds) && payslipIds.length === 0)) {
            return { success: false, error: 'No payslip IDs provided' }
        }
        
        try {
            const response = await payrollApi.deleteBulkPayslips(payslipIds)
            const data = response.data
            
            // Handle the response structure
            if(data && data.STATUS === 'SUCCESS'){
                // Remove deleted payslips from the state
                const idsArray = Array.isArray(payslipIds) ? payslipIds : payslipIds.split(',')
                const idsToDelete = idsArray.map(id => parseInt(id))
                
                const updatedPayslips = get().payslips.filter(payslip => !idsToDelete.includes(payslip.id))
                const updatedCopyPayslips = get().copyPayslips.filter(payslip => !idsToDelete.includes(payslip.id))
                
                set({
                    payslips: updatedPayslips,
                    copyPayslips: updatedCopyPayslips,
                    totalPayslipsCount: get().totalPayslipsCount - idsToDelete.length
                })
                
                return { success: true, data: data, deletedCount: idsToDelete.length }
            } else if(data && data.STATUS === 'ERROR'){
                // Handle error response
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to delete payslips' }
            } else {
                // Fallback for other response structures
                return { success: false, error: 'Unexpected response format' }
            }
        } catch(error) {
            return { success: false, error: error.message || 'Failed to delete payslips' }
        }
    },

    markingInvoiceAsPaid: async(invoiceId, paymentMethod, detail = '') => {
        if (!invoiceId) {
            return { success: false, error: 'Invoice ID is required' }
        }
        
        if (!paymentMethod) {
            return { success: false, error: 'Payment method is required' }
        }
        
        try {
            const response = await payrollApi.markInvoiceAsPaid({
                id: invoiceId,
                payment_method: paymentMethod,
                detail: detail
            })
            const data = response.data
            
            // Handle the response structure
            if(data && data.STATUS === 'SUCCESSFUL'){
                // Update the payslip status in the state if it exists
                const updatedPayslips = get().payslips.map(payslip => 
                    payslip.id === parseInt(invoiceId) 
                        ? { ...payslip, status: 'paid', pay_method: paymentMethod, description: detail }
                        : payslip
                )
                const updatedCopyPayslips = get().copyPayslips.map(payslip => 
                    payslip.id === parseInt(invoiceId) 
                        ? { ...payslip, status: 'paid', pay_method: paymentMethod, description: detail }
                        : payslip
                )
                
                set({
                    payslips: updatedPayslips,
                    copyPayslips: updatedCopyPayslips
                })
                
                return { success: true, data: data }
            } else if(data && data.STATUS === 'ERROR'){
                // Handle error response
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to mark invoice as paid' }
            } else {
                // Fallback for other response structures
                return { success: false, error: 'Unexpected response format' }
            }
        } catch(error) {
            return { success: false, error: error.message || 'Failed to mark invoice as paid' }
        }
    },

    savingSocialSecuritySettings: async(settingsData) => {
        // Validation - Allow 0 for "All Branches"
        if (settingsData.branch_id === null || settingsData.branch_id === undefined || settingsData.branch_id === '') {
            return { success: false, error: 'Branch selection is required' }
        }
        
        try {
            const response = await payrollApi.saveSocialSecuritySettings({
                branch_id: settingsData.branch_id,
                social_security_percentage: parseFloat(settingsData.social_security_percentage) || 0,
                med_allowance_percentage: parseFloat(settingsData.med_allowance_percentage) || 0,
                max_salary_limit: parseFloat(settingsData.max_salary_limit) || 0,
                ss_payment_duration: settingsData.ss_payment_duration || 'month',
                medallowance_duration: settingsData.medallowance_duration || 'year'
            })
            const data = response.data
            
            if(data && data.STATUS === 'SUCCESSFUL'){
                return { success: true, data: data.DB_DATA }
            } else if(data && data.STATUS === 'ERROR'){
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to save social security settings' }
            } else {
                return { success: false, error: 'Unexpected response format' }
            }
        } catch(error) {
            // Handle 400 status code responses
            if (error.response && error.response.status === 400 && error.response.data) {
                const errorData = error.response.data
                if (errorData.ERROR_DESCRIPTION) {
                    return { success: false, error: errorData.ERROR_DESCRIPTION }
                }
            }
            
            return { success: false, error: error.message || 'Failed to save social security settings' }
        }
    },

    savingMedicalAllowanceSettings: async(settingsData) => {
        // Validation - Allow 0 for "All Branches"
        if (settingsData.branch_id === null || settingsData.branch_id === undefined || settingsData.branch_id === '') {
            return { success: false, error: 'Branch selection is required' }
        }
        
        try {
            const response = await payrollApi.saveMedicalAllowanceSettings({
                branch_id: settingsData.branch_id,
                social_security_percentage: parseFloat(settingsData.social_security_percentage) || 0,
                med_allowance_percentage: parseFloat(settingsData.med_allowance_percentage) || 0,
                max_salary_limit: parseFloat(settingsData.max_salary_limit) || 0,
                ss_payment_duration: settingsData.ss_payment_duration || 'month',
                medallowance_duration: settingsData.medallowance_duration || 'year'
            })
            const data = response.data
            
            if(data && data.STATUS === 'SUCCESSFUL'){
                return { success: true, data: data.DB_DATA }
            } else if(data && data.STATUS === 'ERROR'){
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to save medical allowance settings' }
            } else {
                return { success: false, error: 'Unexpected response format' }
            }
        } catch(error) {
            // Handle 400 status code responses
            if (error.response && error.response.status === 400 && error.response.data) {
                const errorData = error.response.data
                if (errorData.ERROR_DESCRIPTION) {
                    return { success: false, error: errorData.ERROR_DESCRIPTION }
                }
            }
            
            return { success: false, error: error.message || 'Failed to save medical allowance settings' }
        }
    },

    savingEOBISettings: async(settingsData) => {
        // Validation - Allow 0 for "All Branches"
        if (settingsData.branch_id === null || settingsData.branch_id === undefined || settingsData.branch_id === '') {
            return { success: false, error: 'Branch selection is required' }
        }
        
        try {
            const response = await payrollApi.saveEOBISettings({
                branch_id: settingsData.branch_id,
                emp_contribution: parseFloat(settingsData.eobi_percentage) || 0,
                employer_contribution: parseFloat(settingsData.employer_contribution) || 0,
                eobi_salary: settingsData.max_salary_limit || '0'
            })
            const data = response.data
            
            if(data && data.STATUS === 'SUCCESSFUL'){
                return { success: true, data: data.DB_DATA }
            } else if(data && data.STATUS === 'ERROR'){
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to save EOBI settings' }
            } else {
                return { success: false, error: 'Unexpected response format' }
            }
        } catch(error) {
            // Handle 400 status code responses
            if (error.response && error.response.status === 400 && error.response.data) {
                const errorData = error.response.data
                if (errorData.ERROR_DESCRIPTION) {
                    return { success: false, error: errorData.ERROR_DESCRIPTION }
                }
            }
            
            return { success: false, error: error.message || 'Failed to save EOBI settings' }
        }
    },

    savingProvidentFundSettings: async(settingsData) => {
        // Validation - Allow 0 for "All Branches"
        if (settingsData.branch_id === null || settingsData.branch_id === undefined || settingsData.branch_id === '') {
            return { success: false, error: 'Branch selection is required' }
        }
        
        try {
            const response = await payrollApi.saveProvidentFundSettings({
                branch_id: settingsData.branch_id,
                emp_contribution: settingsData.provident_fund_percentage || '0',
                employer_contribution: parseFloat(settingsData.employer_contribution) || 0,
                p_fund_eligibility: settingsData.p_fund_eligibility || 'all',
                min_duration: parseFloat(settingsData.min_duration) || 1,
                pf_calculation_type: settingsData.pf_calculation_type || 'basic_pay'
            })
            const data = response.data
            
            if(data && data.STATUS === 'SUCCESSFUL'){
                return { success: true, data: data.DB_DATA }
            } else if(data && data.STATUS === 'ERROR'){
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to save Provident Fund settings' }
            } else {
                return { success: false, error: 'Unexpected response format' }
            }
        } catch(error) {
            // Handle 400 status code responses
            if (error.response && error.response.status === 400 && error.response.data) {
                const errorData = error.response.data
                if (errorData.ERROR_DESCRIPTION) {
                    return { success: false, error: errorData.ERROR_DESCRIPTION }
                }
            }
            
            return { success: false, error: error.message || 'Failed to save Provident Fund settings' }
        }
    },

    savingTaxSlabSettings: async(settingsData) => {
        // Validation - Allow 0 for "All Branches"
        if (settingsData.branch_id === null || settingsData.branch_id === undefined || settingsData.branch_id === '') {
            return { success: false, error: 'Branch selection is required' }
        }
        
        try {
            const response = await payrollApi.saveTaxSlabSettings({
                branch_id: settingsData.branch_id,
                amount_from: parseFloat(settingsData.amount_from) || 0,
                amount_upto: parseFloat(settingsData.amount_upto) || 0,
                tax_rate_percent: parseFloat(settingsData.tax_rate_percent) || 0,
                tax_rate_amount: parseFloat(settingsData.tax_rate_amount) || 0
            })
            const data = response.data
            
            if(data && data.STATUS === 'SUCCESSFUL'){
                return { success: true, data: data.DB_DATA }
            } else if(data && data.STATUS === 'ERROR'){
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to save Tax Slab settings' }
            } else {
                return { success: false, error: 'Unexpected response format' }
            }
        } catch(error) {
            // Handle 400 status code responses
            if (error.response && error.response.status === 400 && error.response.data) {
                const errorData = error.response.data
                if (errorData.ERROR_DESCRIPTION) {
                    return { success: false, error: errorData.ERROR_DESCRIPTION }
                }
            }
            
            return { success: false, error: error.message || 'Failed to save Tax Slab settings' }
        }
    },

    savingTaxExemptionSettings: async(settingsData) => {
        // Validation - Allow 0 for "All Branches"
        if (settingsData.branch_id === null || settingsData.branch_id === undefined || settingsData.branch_id === '') {
            return { success: false, error: 'Branch selection is required' }
        }
        
        try {
            const response = await payrollApi.saveTaxExemptionSettings({
                branch_id: settingsData.branch_id,
                title: settingsData.title || '',
                percent: parseFloat(settingsData.percent) || 0
            })
            const data = response.data
            
            if(data && data.STATUS === 'SUCCESSFUL'){
                return { success: true, data: data.DB_DATA }
            } else if(data && data.STATUS === 'ERROR'){
                return { success: false, error: data.ERROR_DESCRIPTION || 'Failed to save Tax Exemption settings' }
            } else {
                return { success: false, error: 'Unexpected response format' }
            }
        } catch(error) {
            // Handle 400 status code responses
            if (error.response && error.response.status === 400 && error.response.data) {
                const errorData = error.response.data
                if (errorData.ERROR_DESCRIPTION) {
                    return { success: false, error: errorData.ERROR_DESCRIPTION }
                }
            }
            
            return { success: false, error: error.message || 'Failed to save Tax Exemption settings' }
        }
    },
    
    // Tax Exemptions Methods
    getTaxExemptions: async (forceReload = false) => {
        const currentState = get()
        
        // Prevent duplicate calls if data is already loaded and not forcing reload
        if (currentState.taxExemptionsLoaded && !forceReload) {
            return
        }
        
        set({taxExemptionsLoaded: false})
        
        try {
            const response = await payrollApi.getTaxExemptions()
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL') && response.data && response.data.STATUS === 'SUCCESSFUL') {
                const newData = response.data.DB_DATA || []
                set({taxExemptions: newData, taxExemptionsLoaded: true})
            }
        } catch (error) {
            set({taxExemptionsLoaded: false})
        }
    },

    deleteTaxExemption: async (id) => {
        try {
            const response = await payrollApi.deleteTaxExemption(id)
            
            // Check for successful deletion (various response formats)
            const isSuccess = response && (
                response.status === 200 || 
                response.status === 204 ||
                (response.data && response.data.STATUS === 'SUCCESSFUL') ||
                response.STATUS === 'SUCCESSFUL'
            )
            
            if (isSuccess) {
                // Remove from local state
                const currentState = get()
                const updatedExemptions = currentState.taxExemptions.filter(exemption => exemption.id !== id)
                set({taxExemptions: updatedExemptions})
                return { success: true }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to delete tax exemption' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to delete tax exemption' }
        }
    },

    // Income Tax Slabs Methods
    getIncomeTaxSlabs: async (forceReload = false) => {
        const currentState = get()
        
        // Prevent duplicate calls if data is already loaded and not forcing reload
        if (currentState.incomeTaxSlabsLoaded && !forceReload) {
            return
        }
        
        set({incomeTaxSlabsLoaded: false})
        
        try {
            const response = await payrollApi.getIncomeTaxSlabs()
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL') && response.data && response.data.STATUS === 'SUCCESSFUL') {
                const newData = response.data.DB_DATA || []
                set({incomeTaxSlabs: newData, incomeTaxSlabsLoaded: true})
            }
        } catch (error) {
            set({incomeTaxSlabsLoaded: false})
        }
    },

    deleteIncomeTaxSlab: async (id) => {
        try {
            const response = await payrollApi.deleteIncomeTaxSlab(id)
            
            // Check for successful deletion (various response formats)
            const isSuccess = response && (
                response.status === 200 || 
                response.status === 204 ||
                (response.data && response.data.STATUS === 'SUCCESSFUL') ||
                response.STATUS === 'SUCCESSFUL'
            )
            
            if (isSuccess) {
                // Remove from local state
                const currentState = get()
                const updatedSlabs = currentState.incomeTaxSlabs.filter(slab => slab.id !== id)
                set({incomeTaxSlabs: updatedSlabs})
                return { success: true }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to delete tax slab' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to delete tax slab' }
        }
    },

    // Single Payslip Operations
    deleteSinglePayslip: async (payslipId) => {
        try {
            const response = await payrollApi.deletePayslip(payslipId)
            
            // Check for successful deletion (various response formats)
            const isSuccess = response && (
                response.status === 200 || 
                response.status === 204 ||
                (response.data && response.data.STATUS === 'SUCCESSFUL') ||
                response.STATUS === 'SUCCESSFUL'
            )
            
            if (isSuccess) {
                // Remove from local state
                const currentState = get()
                const updatedPayslips = currentState.payslips.filter(payslip => payslip.id !== payslipId)
                set({payslips: updatedPayslips})
                return { success: true }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to delete payslip' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to delete payslip' }
        }
    },

    // Payroll Reports Store Methods
    generateIncomeTaxReport: async (data) => {
        try {
            const response = await payrollApi.generateIncomeTaxReport(data)
            
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL')) {
                return { success: true, data: response.data.DATA || response.data }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to generate Income Tax report' }
            }
        } catch (error) {
            // Handle "No data found" case specifically
            if (error.response && error.response.status === 404) {
                const errorData = error.response.data
                if (errorData && errorData.ERROR_FILTER === 'NO_DATA_FOUND') {
                    return { success: true, data: [] } // Return empty array for no data case
                }
            }
            
            return { success: false, error: error.message || 'Failed to generate Income Tax report' }
        }
    },

    generateEOBIReport: async (data) => {
        try {
            const response = await payrollApi.generateEOBIReport(data)
            
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL')) {
                return { success: true, data: response.data.DATA || response.data }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to generate Income Tax report' }
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                const errorData = error.response.data
                if (errorData && errorData.ERROR_FILTER === 'NO_DATA_FOUND') {
                    return { success: true, data: [] } // Return empty array for no data case
                }
            }
            return { success: false, error: error.message || 'Failed to generate EOBI report' }
        }
    },

    generateSocialSecurityReport: async (data) => {
        try {
            const response = await payrollApi.generateSocialSecurityReport(data)
            
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL')) {
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to generate Social Security report' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to generate Social Security report' }
        }
    },

    generateMedicalAllowanceReport: async (data) => {
        try {
            const response = await payrollApi.generateMedicalAllowanceReport(data)
            
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL')) {
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to generate Medical Allowance report' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to generate Medical Allowance report' }
        }
    },

    generateOvertimeReport: async (data) => {
        try {
            const response = await payrollApi.generateOvertimeReport(data)
            
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL')) {
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to generate Overtime report' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to generate Overtime report' }
        }
    },

    generateIncrementsReport: async (data) => {
        try {
            const response = await payrollApi.generateIncrementsReport(data)
            
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL')) {
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to generate Increments report' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to generate Increments report' }
        }
    },

    generateIncentiveDeductionsReport: async (data) => {
        try {
            const response = await payrollApi.generateIncentiveDeductionsReport(data)
            
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL')) {
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to generate Incentive & Deductions report' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to generate Incentive & Deductions report' }
        }
    },

    generateAvailedLeavesReport: async (data) => {
        try {
            const response = await payrollApi.generateAvailedLeavesReport(data)
            
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL')) {
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to generate Availed Leaves report' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to generate Availed Leaves report' }
        }
    },

    generateLeaveBalanceSheetReport: async (data) => {
        try {
            const response = await payrollApi.generateLeaveBalanceSheetReport(data)
            
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL')) {
                return { success: true, data: response.data }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to generate Leave Balance Sheet report' }
            }
        } catch (error) {
            return { success: false, error: error.message || 'Failed to generate Leave Balance Sheet report' }
        }
    },

    // Generic function to generate any payroll report
    generatePayrollReport: async (reportType, data) => {
        try {
            const response = await payrollApi.generatePayrollReport(reportType, data)
            if (response && (response.status === 200 || response.status === 'SUCCESSFUL')) {
                return { success: true, data: response.data.DATA || response.data || response.DB_DATA || [] }
            } else {
                return { success: false, error: response?.message || response?.error || 'Failed to generate report' }
            }
        } catch (error) {
            // Handle "No data found" case specifically
            if (error.response && error.response.status === 404) {
                const errorData = error.response.data
                if (errorData && errorData.ERROR_FILTER === 'NO_DATA_FOUND') {
                    return { success: true, data: [] } // Return empty array for no data case
                }
            }

            return { success: false, error: error.message || `Failed to generate ${reportType} report` }
        }
    },
})

export default payrollViewModel