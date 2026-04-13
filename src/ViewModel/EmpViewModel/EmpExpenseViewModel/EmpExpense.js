import empExpenseApi from "../../../Model/Data/EmpData/EmpExpense/EmpExpense"
import { showToast } from "../../../Components/Toaster/Toaster"

const empExpenseViewModel = (set, get) => ({
    // State
    expenseList: [],
    loading: true,
    loadingMore: false,
    currentPage: 1,
    hasMoreData: true,
    totalCount: 0,

    // Actions
    gettingExpenseList: async (page = 1, isLoadMore = false) => {
        try {
            if (isLoadMore) {
                set({ loadingMore: true })
            } else {
                set({ loading: true })
            }
            
            const params = {
                page: page,
                per_page: 20
            }
            
            const response = await empExpenseApi.getExpenseList(params)
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                const newData = responseData.DATA || []
                const pagination = responseData.PAGINATION || {}
                
                set((state) => ({
                    expenseList: isLoadMore ? [...state.expenseList, ...newData] : newData,
                    currentPage: page,
                    hasMoreData: pagination.has_next_page || false,
                    totalCount: pagination.total_count || 0,
                    loading: false,
                    loadingMore: false
                }))
            } else {
                ///showToast('Failed to fetch expense list', 'error')
                set({ loading: false, loadingMore: false })
            }
        } catch (error) {
            console.error('Error fetching expense list:', error)
            ///showToast('Error fetching expense list', 'error')
            set({ loading: false, loadingMore: false })
        }
    },

    // Load more data
    loadMoreExpenses: () => {
        const { currentPage, hasMoreData, loadingMore, gettingExpenseList } = get()
        if (hasMoreData && !loadingMore) {
            gettingExpenseList(currentPage + 1, true)
        }
    },

    // Refresh data
    refreshExpenseList: () => {
        const { gettingExpenseList } = get()
        gettingExpenseList(1, false)
    }
})

export default empExpenseViewModel
