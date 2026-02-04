import { expenseAxiosInstance } from "../../../base"

const empExpenseApi = {
    getExpenseList: function(params = {}) {
        return expenseAxiosInstance.request({
            method: "GET",
            url: `/expense_api/get_expense_list`,
            params: params
        })
    },

    addEmployeeExpense: function(data) {
        return expenseAxiosInstance.request({
            method: "POST",
            url: `/expense_api/add_employee_expense`,
            data: data
        })
    }
}

export default empExpenseApi
