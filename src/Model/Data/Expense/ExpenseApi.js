import { expenseAxiosInstance } from "../../base"

const empExpenseApi = {
    getExpenseListDAT: function(params = {}) {
        return expenseAxiosInstance.request({
            method: "GET",
            url: `/expense_api/analytics/dashboard`,
            params: params
        })
    },
    
    getPendingApprovals: function(params = {}) {
        return expenseAxiosInstance.request({
            method: "GET",
            url: `/expense_api/pending`,
            params: params
        })
    },
    
    approveRejectExpense: function(expenseId, status) {
        return expenseAxiosInstance.request({
            method: "PUT",
            url: `/expense_api/approve-reject/${expenseId}`,
            data: { status }
        })
    },
    
    addExpense: function(data) {
        return expenseAxiosInstance.request({
            method: "POST",
            url: `/expense_api/admin/add-expense`,
            data: data
        })
    },
    
    getExpenseById: function(expenseId) {
        return expenseAxiosInstance.request({
            method: "GET",
            url: `/expense_api/get_expense_by_id/${expenseId}`
        })
    },
    
    getTotalExpenses: function(params = {}) {
        return expenseAxiosInstance.request({
            method: "GET",
            url: `/expense_api/get_total_expense`,
            params: params
        })
    },
    
    getRejectedExpenses: function(params = {}) {
        return expenseAxiosInstance.request({
            method: "GET",
            url: `/expense_api/get_rejected_expenses`,
            params: params
        })
    },
    
    getApprovedExpenses: function(params = {}) {
        return expenseAxiosInstance.request({
            method: "GET",
            url: `/expense_api/get_approved_expenses`,
            params: params
        })
    },
    
    getInvoiceData: function(params = {}) {
        return expenseAxiosInstance.request({
            method: "GET",
            url: `/expense_api/get_invoice_data`,
            params: params
        })
    },
}

export default empExpenseApi
