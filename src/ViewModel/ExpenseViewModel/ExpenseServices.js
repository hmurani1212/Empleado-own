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
    const totalExpenses = useStore((state) => state.totalExpenses);
    const totalExpensesLoading = useStore((state) => state.totalExpensesLoading);
    const getTotalExpenses = useStore((state) => state.getTotalExpenses);
    const clearTotalExpenses = useStore((state) => state.clearTotalExpenses);
    const rejectedExpenses = useStore((state) => state.rejectedExpenses);
    const rejectedExpensesLoading = useStore((state) => state.rejectedExpensesLoading);
    const getRejectedExpenses = useStore((state) => state.getRejectedExpenses);
    const clearRejectedExpenses = useStore((state) => state.clearRejectedExpenses);
    const approvedExpensesList = useStore((state) => state.approvedExpensesList);
    const approvedExpensesLoading = useStore((state) => state.approvedExpensesLoading);
    const getApprovedExpenses = useStore((state) => state.getApprovedExpenses);
    const clearApprovedExpenses = useStore((state) => state.clearApprovedExpenses);
    const invoiceData = useStore((state) => state.invoiceData);
    const invoiceDataLoading = useStore((state) => state.invoiceDataLoading);
    const getInvoiceData = useStore((state) => state.getInvoiceData);
    const clearInvoiceData = useStore((state) => state.clearInvoiceData);

    // Local state for UI components - no initial filters
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [activeTab, setActiveTab] = useState('Expense Analysis');
    const [showPendingApprovalsDrawer, setShowPendingApprovalsDrawer] = useState(false);
    const [showSettlementDrawer, setShowSettlementDrawer] = useState(false);
    const [showTotalExpensesDrawer, setShowTotalExpensesDrawer] = useState(false);
    const [showRejectedExpensesDrawer, setShowRejectedExpensesDrawer] = useState(false);
    const [showApprovedExpensesDrawer, setShowApprovedExpensesDrawer] = useState(false);

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

    // Total expenses drawer functions
    const openTotalExpensesDrawer = async () => {
        console.log('Opening Total Expenses Drawer');
        setShowTotalExpensesDrawer(true);
        // Load total expenses data when drawer opens
        await getTotalExpenses();
    };

    const closeTotalExpensesDrawer = () => {
        setShowTotalExpensesDrawer(false);
        // Clear total expenses data when drawer closes
        clearTotalExpenses();
    };

    // Rejected expenses drawer functions
    const openRejectedExpensesDrawer = async () => {
        console.log('Opening Rejected Expenses Drawer');
        setShowRejectedExpensesDrawer(true);
        // Load rejected expenses data when drawer opens
        await getRejectedExpenses();
    };

    const closeRejectedExpensesDrawer = () => {
        setShowRejectedExpensesDrawer(false);
        // Clear rejected expenses data when drawer closes
        clearRejectedExpenses();
    };

    // Approved expenses drawer functions
    const openApprovedExpensesDrawer = async () => {
        console.log('Opening Approved Expenses Drawer');
        setShowApprovedExpensesDrawer(true);
        // Load approved expenses data when drawer opens
        await getApprovedExpenses();
    };

    const closeApprovedExpensesDrawer = () => {
        setShowApprovedExpensesDrawer(false);
        // Clear approved expenses data when drawer closes
        clearApprovedExpenses();
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
        totalExpenses,
        totalExpensesLoading,
        rejectedExpenses,
        rejectedExpensesLoading,
        approvedExpensesList,
        approvedExpensesLoading,

        // UI State
        selectedMonth,
        selectedYear,
        activeTab,
        showPendingApprovalsDrawer,
        showSettlementDrawer,
        showTotalExpensesDrawer,
        showRejectedExpensesDrawer,
        showApprovedExpensesDrawer,

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
        getTotalExpenses,
        clearTotalExpenses,
        getRejectedExpenses,
        clearRejectedExpenses,
        getApprovedExpenses,
        clearApprovedExpenses,
        getInvoiceData,
        clearInvoiceData,

        // UI Functions
        openPendingApprovalsDrawer,
        closePendingApprovalsDrawer,
        openSettlementDrawer,
        closeSettlementDrawer,
        openTotalExpensesDrawer,
        closeTotalExpensesDrawer,
        openRejectedExpensesDrawer,
        closeRejectedExpensesDrawer,
        openApprovedExpensesDrawer,
        closeApprovedExpensesDrawer,
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
        handleLoadMore,
        
        // Invoice data
        invoiceData,
        invoiceDataLoading,
        getInvoiceData,
        clearInvoiceData
    };
};

export default useExpenseService;
