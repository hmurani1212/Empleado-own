import axiosInstance, {payRollinstancemodule} from "../../base"

const payrollApi = {
    getSalaryTemp : function(branch_id, search = '', page = 0, limit = 10, department_id = null) {
        const params = new URLSearchParams();
        
        // Include branch_id if it's provided and valid (including 0 for "All Branches")
        if (branch_id !== null && branch_id !== undefined && branch_id !== '') {
            params.append('branch_id', branch_id);
        }
        
        // Always include pagination parameters
        params.append('page', page);
        params.append('limit', limit);
        
        // Include search if provided
        if (search && search.trim() !== '') {
            params.append('search', search.trim());
        }
        
        // Include deptt_id if provided and valid (including 0 for "All Departments")
        if (department_id !== null && department_id !== undefined && department_id !== '') {
            params.append('deptt_id', department_id);
        }
        
        return payRollinstancemodule.request({
            method:'GET',
            url:`/manage_payslip/salary-templates?${params.toString()}`,
        })
    },

    getEmpSalary : function(branch_id, deptt_id, search = '', template_id = null, get_all = true) {
        const params = new URLSearchParams();

        console.log('params getEmpSalary:', params);

        console.log('branch_id getEmpSalary:', branch_id);
        console.log('deptt_id getEmpSalary:', deptt_id);
        console.log('search getEmpSalary:', search);
        console.log('template_id getEmpSalary:', template_id);
        console.log('get_all getEmpSalary:', get_all);


        // Include branch_id if it's provided and valid (including 0 for "All Branches")
        if (branch_id !== null && branch_id !== undefined && branch_id !== '') {
            params.append('branch_id', branch_id);
        }

        // Include deptt_id if provided and valid (including 0 for "All Departments")
        if (deptt_id !== null && deptt_id !== undefined && deptt_id !== '') {
            params.append('deptt_id', deptt_id);
        }

        // Include template_id if provided and valid
        if (template_id && template_id !== null && template_id !== undefined && template_id !== '') {
            params.append('template_id', template_id);
        }

        if(get_all) {
            params.append('get_all', get_all);
        }

        // Include search if provided
        if (search && search.trim() !== '') {
            params.append('search', search.trim());
        }

        const finalUrl = `/manage_payslip/employee-salaries?${params.toString()}`;

        return payRollinstancemodule.request({
            method:'GET',
            url: finalUrl,
        })
    },

    setSalaryIncrement : function(data) {
        return payRollinstancemodule.request({
            method:'POST',
            url:'/manage_payslip/salary-increments/by-template',
            data: data
        })
    },

    delSalaryTemp : function(data) {
        return payRollinstancemodule.request({
            method:'DELETE',
            url:`/manage_payslip/salary-templates/${data.id}`,
        })
    },

    createSalaryTemp : function(data) {
        return payRollinstancemodule.request({
            method:'POST',
            url:`/manage_payslip/salary-templates`,
            data: data
        })
    },

    updateSalaryTemp : function(templateId, data) {
        return payRollinstancemodule.request({
            method:'PUT',
            url:`/manage_payslip/salary-templates/${templateId}`,
            data: data
        })
    },


    getDashboardData : function(year, type = 'annual_salary') {
        return payRollinstancemodule.request({
            method:'GET',
            url:`/manage_payslip/charts/dashboard-data?year=${year}&type=${type}`,
        })
    },

    incrementEmpSalary : function(data){
        return payRollinstancemodule.request({
            method:'POST',
            url:'/manage_payslip/salary-increments',
            data: data
        })
    },

    incDeductHistory : function(data){
        return payRollinstancemodule.request({
            method: 'GET',
            url: `/manage_payslip/employees/${data.emp_id}/salary-history`,
            data : {
                operation : 'salary_history',
                ...data
            }
        })
    }, 

    cancelincDeductHistory : function(data){
        // console.log('data of the year ??????????????????????????????/', data)
        return payRollinstancemodule.request({
            method: 'PUT',
            url: `/manage_payslip/increments/${data.id}/cancel`,
            data : {
                operation : 'cancel_increment',
                ...data
            }
        })
    },

    manageIncentDeduct : function(data){
        return payRollinstancemodule.request({
            method: 'POST',
            url:'/manage_payslip/add-incentives',
            data : {
                operation : 'emp_incentives_deductions',
                ...data
            }
        })
    },

    incentiveDeductHistory: function(data){
        const params = new URLSearchParams();
        params.append('page_id', '0');
        params.append('limit', '15');
        params.append('direction', 'forward');
        
        // Add emp_id if provided
        if (data && data.emp_id) {
            params.append('emp_id', data.emp_id);
        }
        
        return payRollinstancemodule.request({
            method: 'GET',
            url: `/manage_payslip/salary-deductions?${params.toString()}`,
        })
    },

    incentiveDeductionList: function(data){
        return payRollinstancemodule.request({
            method: 'GET',
            url:'/manage_payslip/incentive-deduction-templates?filter=both',
            data : {
                operation : 'get_active_incentive_deduction',
                ...data
            }
        })
    },

    allIncentDeductList: function(data){
        // Convert type to filter parameter
        const filter = data.type === 1 ? 'deductions' : 'incentives'
        return payRollinstancemodule.request({
            method: 'GET',
            url:`/manage_payslip/incentive-deduction-templates?filter=${filter}`,
        })
    },

    allIncentDeductListBoth: function(){
        return payRollinstancemodule.request({
            method: 'GET',
            url:'/manage_payslip/incentive-deduction-templates?filter=both',
        })
    },

    getSalaryDeductions: function(status = 1, d_type = 0, page_id = 0, limit = 10, direction = 'forward', emp_id = null){
        const params = new URLSearchParams();
        params.append('status', status);
        params.append('d_type', d_type);
        params.append('page_id', page_id);
        params.append('limit', limit);
        params.append('direction', direction);
        
        // Add emp_id if provided
        if (emp_id) {
            params.append('emp_id', emp_id);
        }
        
        return payRollinstancemodule.request({
            method: 'GET',
            url: `/manage_payslip/salary-deductions?${params.toString()}`,
        })
    },

    addincentiveDeduction: function(data){
        return payRollinstancemodule.request({
            method: 'POST',
            url:'/manage_payslip/incentive-deduction-templates',
            data: data
        })
    },

    addIncentDeduct: function(data){
        return payRollinstancemodule.request({
            method: 'POST',
            url:'/manage_payslip/incentive-deduction-templates',
            data: data
        })
    },

    // Update incentive/deduction using the specific endpoint
    updateIncentiveDeduction: function(data){
        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/add-incentives',
            data: {
                operation: 'emp_incentives_deductions',
                ...data
            }
        })
    },

    // Delete/deactivate incentive/deduction using the specific endpoint
    deleteIncentiveDeduction: function(id){
        return payRollinstancemodule.request({
            method: 'PUT',
            url: `/manage_payslip/allowances/${id}/deactivate`
        })
    },

    deleteInc: function(data){
        return payRollinstancemodule.request({
            method: 'POST',
            url:'/manage_payslip/incentive-deduction-templates',
            data : {
                // operation : 'delete_incen_ded_title',
                ...data
            }
        })
    }, 

    updateIncentiveList: function(data){
        return payRollinstancemodule.request({
            method: 'POST',
            url:'/manage_payslip/incentive-deduction-templates',
            data: data
        })
    },

    deletAllowance: function(data){
        return payRollinstancemodule.request({
            method: 'POST',
            url:'/manage_payslip/incentive-deduction-templates',
            data : {
                // operation : 'deleteAllowance',
                ...data
            }
        })
    },
    empPaySlip: function(data){
        const params = {};
        
        // Always include branch_id if provided (including 0 for "All Branches")
        if (data.bid !== null && data.bid !== undefined && data.bid !== '') {
            params.branch_id = data.bid;
        }
        
        // Always include get_all if provided
        if (data.get_all !== null && data.get_all !== undefined) {
            params.get_all = data.get_all;
        }
        
        // Add deptt_id if it exists and is not empty or 'all'
        if (data.did && data.did !== '' && data.did !== 'all') {
            params.deptt_id = data.did;
        }
        
        return payRollinstancemodule.request({
            method: 'GET',
            url:`/manage_payslip/employee-salaries`,
            params: params
        })
    },
    empSalaryDetaisl : function(data){
        return payRollinstancemodule.request({
            method: 'GET',
            url:`manage_payslip/history/${data.emp_id}`,
            params : {}
        })
    },

    generateBulkPayroll : function(data){
        return payRollinstancemodule.request({
            method: 'POST',
            url:'/manage_payslip/generate-bulk',
            data: data
        })
    },


    getInvoiceData: function(invoiceId) {
        return payRollinstancemodule.request({
            method: 'GET',
            url: `/manage_payslip/invoices/${invoiceId}/data`,
        })
    },

    deleteBulkPayslips: function(payslipIds) {
        // Convert array of IDs to comma-separated string
        const idsString = Array.isArray(payslipIds) 
            ? payslipIds.join(',') 
            : payslipIds;
        
        return payRollinstancemodule.request({
            method: 'DELETE',
            url: '/manage_payslip/salary-slip-bulk',
            data: {
                id: idsString
            }
        })
    },

    markInvoiceAsPaid: function(data) {
        return payRollinstancemodule.request({
            method: 'PUT',
            url: '/manage_payslip/invoices/mark-paid',
            data: {
                id: data.id,
                payment_method: data.payment_method,
                detail: data.detail || ''
            }
        })
    },

    saveSocialSecuritySettings: function(data) {
        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/social-security',
            data: {
                operation: 'social_security',
                branch_id: data.branch_id,
                social_security_percentage: data.social_security_percentage,
                med_allowance_percentage: data.med_allowance_percentage,
                max_salary_limit: data.max_salary_limit,
                ss_payment_duration: data.ss_payment_duration,
                medallowance_duration: data.medallowance_duration
            }
        })
    },

    saveMedicalAllowanceSettings: function(data) {
        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/social-security',
            data: {
                operation: 'medical_allowance',
                branch_id: data.branch_id,
                social_security_percentage: data.social_security_percentage,
                med_allowance_percentage: data.med_allowance_percentage,
                max_salary_limit: data.max_salary_limit,
                ss_payment_duration: data.ss_payment_duration,
                medallowance_duration: data.medallowance_duration
            }
        })
    },

    saveEOBISettings: function(data) {
        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/social-security',
            data: {
                operation: 'eobi_settings',
                branch_id: data.branch_id,
                emp_contribution: data.emp_contribution,
                employer_contribution: data.employer_contribution,
                eobi_salary: data.eobi_salary
            }
        })
    },

    saveProvidentFundSettings: function(data) {
        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/social-security',
            data: {
                operation: 'provident_fund',
                branch_id: data.branch_id,
                p_fund_eligibility: data.p_fund_eligibility,
                min_duration: data.min_duration,
                employer_contribution: data.employer_contribution,
                emp_contribution: data.emp_contribution
            }
        })
    },

    saveTaxSlabSettings: function(data) {
        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/social-security',
            data: {
                operation: 'tax_slab',
                branch_id: data.branch_id,
                amount_from: data.amount_from,
                amount_upto: data.amount_upto,
                tax_rate_percent: data.tax_rate_percent,
                tax_rate_amount: data.tax_rate_amount
            }
        })
    },

    saveTaxExemptionSettings: function(data) {
        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/social-security',
            data: {
                operation: 'tax_exemption',
                branch_id: data.branch_id,
                title: data.title,
                percent: data.percent
            }
        })
    },

    updateEmployeeSalaryTemplate: function(employeeId, templateId) {
        return payRollinstancemodule.request({
            method: 'PUT',
            url: `/manage_payslip/employees/salary-template`,
            data: {
                id: parseInt(employeeId),
                st_id: parseInt(templateId)
            }
        })
    },

    // Tax Exemptions APIs
    getTaxExemptions: function() {
        return payRollinstancemodule.request({
            method: 'GET',
            url: '/manage_payslip/tax-exemptions'
        })
    },

    deleteTaxExemption: function(id) {
        return payRollinstancemodule.request({
            method: 'DELETE',
            url: `/manage_payslip/tax-exemptions/${id}`
        })
    },

    // Income Tax Slabs APIs
    getIncomeTaxSlabs: function() {
        return payRollinstancemodule.request({
            method: 'GET',
            url: '/manage_payslip/income-tax-slabs'
        })
    },

    deleteIncomeTaxSlab: function(id) {
        return payRollinstancemodule.request({
            method: 'DELETE',
            url: `/manage_payslip/income-tax-slabs/${id}`
        })
    },

    getPayslips: function(params = {}) {
        
        const queryParams = new URLSearchParams();
        
        // Branch filter (including 0 for "All Branches")
        if (params.branch_id !== null && params.branch_id !== undefined && params.branch_id !== '') {
            queryParams.append('branch_id', params.branch_id);
        }
        
        // Department filter - Updated to use deptt_id (including 0 for "All Departments")
        if (params.department_id !== null && params.department_id !== undefined && params.department_id !== '') {
            queryParams.append('deptt_id', params.department_id);
        }
        
        // Filter - when emp_id send emp_id param; when emp_name send search param; status/month use search
        if (params.filter === 'emp_id' && params.search !== undefined && params.search !== null && String(params.search).trim() !== '') {
            queryParams.append('filter', 'emp_id');
            queryParams.append('emp_id', String(params.search).trim());
        } else if (params.filter === 'emp_name' && params.search !== undefined && params.search !== null && String(params.search).trim() !== '') {
            queryParams.append('filter', 'emp_name');
            queryParams.append('search', String(params.search).trim());
        } else if (params.filter && params.search !== undefined && params.search !== null && params.search !== '') {
            queryParams.append('filter', params.filter);
            queryParams.append('search', String(params.search).trim());
        } else if (params.status && params.status !== null && params.status !== undefined && params.status !== '') {
            queryParams.append('filter', 'status');
            queryParams.append('search', params.status);
        } else if (params.salary_month && params.salary_month !== null && params.salary_month !== undefined && params.salary_month !== '') {
            queryParams.append('filter', 'month');
            queryParams.append('search', params.salary_month);
        }
        
        // Pagination - Updated to use page_id
        const page = params.page !== undefined ? params.page : 0;
        const limit = params.limit !== undefined ? params.limit : 15;
        queryParams.append('page_id', page);
        queryParams.append('limit', limit);
        
        // Direction - Default to next
        queryParams.append('direction', 'next');
        
        const finalUrl = `/manage_payslip/payslips?${queryParams.toString()}`;
        
        return payRollinstancemodule.request({
            method: 'GET',
            url: finalUrl,
        })
    },

    getPayslipById: function(payslipId) {
        return payRollinstancemodule.request({
            method: 'GET',
            url: `/manage_payslip/payslips/${payslipId}`,
        })
    },

    getPayslipsBulkDetails: function(payslipIds) {
        if (!payslipIds || !Array.isArray(payslipIds) || payslipIds.length === 0) {
            return Promise.reject(new Error('payslip_ids required'))
        }
        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payslips/bulk-details',
            data: { payslip_ids: payslipIds },
        })
    },

    deletePayslip: function(payslipId) {
        
        return payRollinstancemodule.request({
            method: 'DELETE',
            url: `/manage_payslip/salary-slip`,
            data: {
                id: payslipId
            }
        })
    },

    // Payroll Reports API Functions
    generateIncomeTaxReport: function(data) {
        
        const requestData = {
            filter: 'income_tax',
            branch_id: data.branch_id || 0,
            dept_id: data.dept_id || 0
        }

        // Add time filter if provided
        if (data.time_duration_filter) {
            requestData.time_duration_filter = data.time_duration_filter
        }

        // Add month and year for specific_month filter
        if (data.time_duration_filter === 'specific_month') {
            if (data.year) requestData.year = data.year
            if (data.month) requestData.month = data.month
        }

        // Add date range for time_frame filter
        if (data.time_duration_filter === 'time_frame') {
            if (data.time1) requestData.time1 = data.time1
            if (data.time2) requestData.time2 = data.time2
        }

        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payroll-report',
            data: requestData
        })
    },

    generateEOBIReport: function(data) {

        const requestData = {
            filter: 'eobi',
            branch_id: data.branch_id || 0,
            dept_id: data.dept_id || 0
        }

        // Add time filter if provided
        if (data.time_duration_filter) {
            requestData.time_duration_filter = data.time_duration_filter
        }

        // Add month and year for specific_month filter
        if (data.time_duration_filter === 'specific_month') {
            if (data.year) requestData.year = data.year
            if (data.month) requestData.month = data.month
        }

        // Add date range for time_frame filter
        if (data.time_duration_filter === 'time_frame') {
            if (data.time1) requestData.time1 = data.time1
            if (data.time2) requestData.time2 = data.time2
        }

        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payroll-report',
            data: requestData
        })
    },

    generateSocialSecurityReport: function(data) {

        const requestData = {
            filter: 'ss',
            branch_id: data.branch_id || 0,
            dept_id: data.dept_id || 0
        }

        // Add year for year filter
        if (data.time_duration_filter === 'year') {
            requestData.year = data.year
        }

        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payroll-report',
            data: requestData
        })
    },

    generateMedicalAllowanceReport: function(data) {

        const requestData = {
            filter: 'medical',
            branch_id: data.branch_id || 0,
            dept_id: data.dept_id || 0
        }

        // Add time filter if provided
        if (data.time_duration_filter) {
            requestData.time_duration_filter = data.time_duration_filter
        }

        // Add month and year for specific_month filter
        if (data.time_duration_filter === 'specific_month') {
            if (data.year) requestData.year = data.year
            if (data.month) requestData.month = data.month
        }

        // Add date range for time_frame filter
        if (data.time_duration_filter === 'time_frame') {
            if (data.time1) requestData.time1 = data.time1
            if (data.time2) requestData.time2 = data.time2
        }

        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payroll-report',
            data: requestData
        })
    },

    generateOvertimeReport: function(data) {

        const requestData = {
            filter: 'overtime',
            branch_id: data.branch_id || 0,
            dept_id: data.dept_id || 0
        }

        // Add employee ID if provided
        if (data.emp_id) {
            requestData.emp_id = data.emp_id
        }

        // Add time filter if provided
        if (data.time_duration_filter) {
            requestData.time_duration_filter = data.time_duration_filter
        }

        // Add month and year for specific_month filter
        if (data.time_duration_filter === 'specific_month') {
            if (data.year) requestData.year = data.year
            if (data.month) requestData.month = data.month
        }

        // Add date range for time_frame filter
        if (data.time_duration_filter === 'time_frame') {
            if (data.time1) requestData.time1 = data.time1
            if (data.time2) requestData.time2 = data.time2
        }

        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payroll-report',
            data: requestData
        })
    },

    generateIncrementsReport: function(data) {
        
        const requestData = {
            filter: 'increments',
            emp_ids: data.emp_ids || [],
            time_duration_filter: data.time_duration_filter || 'year'
        }

        // Add year for year filter
        if (data.time_duration_filter === 'year') {
            requestData.year = data.year
        }

        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payroll-report',
            data: requestData
        })
    },

    generateIncentiveDeductionsReport: function(data) {
        
        const requestData = {
            filter: 'incentive_deductions',
            branch_id: data.branch_id || 0,
            dept_id: data.dept_id || 0
        }

        // Add time filter if provided
        if (data.time_duration_filter) {
            requestData.time_duration_filter = data.time_duration_filter
        }

        // Add month and year for specific_month filter
        if (data.time_duration_filter === 'specific_month') {
            if (data.year) requestData.year = data.year
            if (data.month) requestData.month = data.month
        }

        // Add date range for time_frame filter
        if (data.time_duration_filter === 'time_frame') {
            if (data.time1) requestData.time1 = data.time1
            if (data.time2) requestData.time2 = data.time2
        }

        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payroll-report',
            data: requestData
        })
    },

    generateAvailedLeavesReport: function(data) {
        
        const requestData = {
            filter: 'availed_leaves',
            branch_id: data.branch_id || 0,
            dept_id: data.dept_id || 0,
            time_duration_filter: data.time_duration_filter || 'specific_month'
        }

        // Add month and year for specific_month filter
        if (data.time_duration_filter === 'specific_month') {
            requestData.month = data.month
            requestData.year = data.year
        }

        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payroll-report',
            data: requestData
        })
    },

    generateLeaveBalanceSheetReport: function(data) {
        
        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payroll-report',
            data: {
                filter: 'leave_balance_sheet',
                branch_id: data.branch_id || 0,
                dept_id: data.dept_id || 0,
                time_duration_filter: data.time_duration_filter
            }
        })
    },

    // Generic function to handle all payroll reports using single endpoint
    generatePayrollReport: function(reportType, data) {

        let requestData = {
            branch_id: data.branch_id || 0,
            dept_id: data.dept_id || 0
        };

        if (data.time_duration_filter) {
            requestData.time_duration_filter = data.time_duration_filter;
        }

        // Add filter-specific parameters based on report type
        switch (reportType.toLowerCase()) {
            case 'income_tax':
                requestData.filter = 'income_tax';
                break;
            case 'eobi':
                requestData.filter = 'eobi';
                break;
            case 'social security':
            case 'social_security':
            case 'ss':
                requestData.filter = 'ss';
                break;
            case 'medical_allowance':
                requestData.filter = 'medical';
                break;
            case 'overtime_report':
            case 'overtime':
                requestData.filter = 'overtime';
                break;
            case 'increments':
                requestData.filter = 'increment';
                if (data.emp_ids && Array.isArray(data.emp_ids)) {
                    requestData.emp_ids = data.emp_ids;
                }
                break;
            case 'incentive_deductions':
            case 'incentive_&_deductions':
                requestData.filter = 'incentive_deductions';
                break;
            case 'availed_leaves':
                requestData.filter = 'availed_leaves';
                break;
            case 'leave_balance_sheet':
                requestData.filter = 'leave_balance_sheet';
                break;
            default:
                requestData.filter = reportType.toLowerCase().replace(/\s+/g, '_');
        }

        // Add time-specific parameters
        if (data.year) requestData.year = data.year;
        if (data.month) requestData.month = data.month;
        if (data.time1) requestData.time1 = data.time1;
        if (data.time2) requestData.time2 = data.time2;

        return payRollinstancemodule.request({
            method: 'POST',
            url: '/manage_payslip/payroll-report',
            data: requestData
        })
    },
}

export default payrollApi