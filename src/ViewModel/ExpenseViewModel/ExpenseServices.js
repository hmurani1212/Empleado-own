import { useState } from "react";
import useStore from "../../Store/store";

const useExpenseService = () => {
    // Get state and functions from store
    const expenseData = useStore((state) => state.expenseData);
    const loading = useStore((state) => state.loading);
    const loadMoreLoading = useStore((state) => state.loadMoreLoading);
    const addExpenseLoading = useStore((state) => state.addExpenseLoading);
    const error = useStore((state) => state.error);
    const pendingApprovals = useStore((state) => state.pendingApprovals);
    const pendingApprovalsLoading = useStore((state) => state.pendingApprovalsLoading);
    const allEmployees = useStore((state) => state.allEmployees);
    const employeesLoading = useStore((state) => state.employeesLoading);
    const getExpenseDashboardData = useStore((state) => state.getExpenseDashboardData);
    const loadMoreExpenseData = useStore((state) => state.loadMoreExpenseData);
    const getPendingApprovals = useStore((state) => state.getPendingApprovals);
    const approveRejectExpense = useStore((state) => state.approveRejectExpense);
    const getAllEmployees = useStore((state) => state.getAllEmployees);
    const addExpense = useStore((state) => state.addExpense);
    const clearExpenseData = useStore((state) => state.clearExpenseData);
    const clearPendingApprovals = useStore((state) => state.clearPendingApprovals);
    const setLoading = useStore((state) => state.setLoading);
    const setError = useStore((state) => state.setError);
    const getExpenseById = useStore((state) => state.getExpenseById);
    const selectedExpenseDetail = useStore((state) => state.selectedExpenseDetail);
    const isLoadingExpenseDetail = useStore((state) => state.isLoadingExpenseDetail);
    const clearExpenseDetail = useStore((state) => state.clearExpenseDetail);

    // Local state for UI components - no initial filters
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [activeTab, setActiveTab] = useState('Expense Analysis');
    const [showPendingApprovalsDrawer, setShowPendingApprovalsDrawer] = useState(false);
    const [showSettlementDrawer, setShowSettlementDrawer] = useState(false);

    // Drawer functions
    const openPendingApprovalsDrawer = async () => {
        setShowPendingApprovalsDrawer(true);
        // Load pending approvals data when drawer opens
        await getPendingApprovals();
    };

    const closePendingApprovalsDrawer = () => {
        setShowPendingApprovalsDrawer(false);
        // Clear pending approvals data when drawer closes
        clearPendingApprovals();
    };

    // Settlement drawer functions
    const openSettlementDrawer = async () => {
        setShowSettlementDrawer(true);
        // Load employees data when drawer opens
        await getAllEmployees();
    };

    const closeSettlementDrawer = () => {
        setShowSettlementDrawer(false);
    };

    // Tab change handler
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    // Month/Year change handlers
    const handleMonthChange = (month) => {
        // Handle both object format from CustomSelect and direct value
        const monthValue = month?.value || month;
        setSelectedMonth(monthValue);
        console.log('month selected:', monthValue);
    };

    const handleYearChange = (year) => {
        // Handle both object format from CustomSelect and direct value
        const yearValue = year?.value || year;
        setSelectedYear(yearValue);
        console.log('year selected:', yearValue);
    };

    // Format chart data for Chart.js
    const formatChartData = () => {
        if (!expenseData?.graphData?.data) return null;
        const chartData = {
            labels: expenseData.graphData.data.map(item => item.month),
            datasets: [
                {
                    label: 'Total Expenses',
                    data: expenseData.graphData.data.map(item => item.total_expenses),
                    backgroundColor: '#3B82F6',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                },
                {
                    label: 'Approved Expenses',
                    data: expenseData.graphData.data.map(item => item.approved_expenses),
                    backgroundColor: '#10B981',
                    borderColor: '#10B981',
                    borderWidth: 1,
                },
                {
                    label: 'Pending Count',
                    data: expenseData.graphData.data.map(item => item.pending_count),
                    backgroundColor: '#F59E0B',
                    borderColor: '#F59E0B',
                    borderWidth: 1,
                }
            ]
        };

        return chartData;
    };

    // Get card data
    const getCardData = () => {
        return {
            pendingApprovals: expenseData?.cardData?.pending_approvals || 0,
            rejected_expense: expenseData?.cardData?.rejected_expense || 0,
            totalBudget: expenseData?.cardData?.total_budget || 0,
            totalExpenses: expenseData?.cardData?.total_expenses || 0,
            expenseAmount: expenseData?.cardData?.expense_amount || 0,
            approvedExpense: expenseData?.cardData?.approved_expense || 0
        };
    };

    // Get recent activities
    const getRecentActivities = () => {
        return expenseData?.recentActivities?.activities || [];
    };

    // Get graph summary
    const getGraphSummary = () => {
        return expenseData?.graphData?.summary || {
            total_year_expenses: 0,
            total_year_approved: 0,
            total_pending_count: 0
        };
    };

    // Get table data
    const getTableData = () => {
        return expenseData?.tableData?.data || [];
    };

    // Get table pagination
    const getTablePagination = () => {
        return expenseData?.tableData?.pagination || {
            current_page: 1,
            total_pages: 1,
            total_count: 0,
            per_page: 20,
            has_next_page: false,
            has_prev_page: false,
            next_page: null,
            prev_page: null
        };
    };

    // Load more data handler
    const handleLoadMore = async () => {
        const pagination = getTablePagination();
        if (pagination.has_next_page && pagination.next_page) {
            const params = {
                table_page: pagination.next_page,
                month: selectedMonth || undefined,
                year: selectedYear || undefined
            };
            await loadMoreExpenseData(params);
        }
    };

    return {
        // State
        expenseData,
        loading,
        loadMoreLoading,
        addExpenseLoading,
        error,
        pendingApprovals,
        pendingApprovalsLoading,
        allEmployees,
        employeesLoading,
        selectedExpenseDetail,
        isLoadingExpenseDetail,

        // UI State
        selectedMonth,
        selectedYear,
        activeTab,
        showPendingApprovalsDrawer,
        showSettlementDrawer,

        // Functions
        getExpenseDashboardData,
        loadMoreExpenseData,
        getPendingApprovals,
        approveRejectExpense,
        getAllEmployees,
        addExpense,
        clearExpenseData,
        clearPendingApprovals,
        setLoading,
        setError,
        getExpenseById,
        clearExpenseDetail,

        // UI Functions
        openPendingApprovalsDrawer,
        closePendingApprovalsDrawer,
        openSettlementDrawer,
        closeSettlementDrawer,
        handleTabChange,
        handleMonthChange,
        handleYearChange,

        // Data formatting functions
        formatChartData,
        getCardData,
        getRecentActivities,
        getGraphSummary,
        getTableData,
        getTablePagination,
        handleLoadMore
    };
};

export default useExpenseService;
